import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {searchApi, SearchSuggestion} from '../services/searchApi';
import ProductCard from '../../../shared/Components/ProductCard';
import FilterPanel, {FilterState} from '../components/FilterPanel';
import type {RootStackParamList} from '../../../../App';

type SearchResultNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchResult: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<SearchResultNavigationProp>();
  const {keyword} = route.params as {keyword: string};

  const [products, setProducts] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({});
  const [activeSort, setActiveSort] = useState('relevant'); // relevant, newest, sold, price

  const limit = 20;

  useEffect(() => {
    fetchSearchResults(1, currentFilters);
  }, [keyword, currentFilters]);

  const getSortParams = (
    sortType: string,
  ): {sort_by?: string; sort_order?: string} => {
    switch (sortType) {
      case 'newest':
        return {};
      case 'sold':
        return {sort_by: 'sold', sort_order: 'desc'};
      case 'price':
        // Toggle between asc và desc cho price
        const isCurrentlyAsc =
          currentFilters.sort_by === 'price' &&
          currentFilters.sort_order === 'asc';
        return {sort_by: 'price', sort_order: isCurrentlyAsc ? 'desc' : 'asc'};
      default: // relevant
        return {};
    }
  };

  const fetchSearchResults = useCallback(
    async (pageNum: number, filters: FilterState = {}) => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = {
          keyword,
          page: pageNum,
          limit,
          ...filters,
        };

        const result = await searchApi.searchProductsAdvanced(searchParams);

        if (pageNum === 1) {
          setProducts(result.products);
        } else {
          setProducts(prev => [...prev, ...result.products]);
        }

        setTotal(result.total || 0);
        setPage(pageNum);
        setHasMore(result.products.length === limit);
        console.log('✅ Search results loaded:', result.products.length);
      } catch (err) {
        console.error('❌ Error fetching search results:', err);
        setError('Lỗi tìm kiếm, vui lòng thử lại');
      } finally {
        setLoading(false);
      }
    },
    [keyword, limit],
  );

  const handleLoadMore = () => {
    if (!loading && hasMore && products.length < total) {
      fetchSearchResults(page + 1, currentFilters);
    }
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', {productId});
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSearchBarPress = () => {
    navigation.navigate('SearchEntry');
  };

  const handleFilterPress = () => {
    setShowFilterPanel(true);
  };

  const handleFilterChange = (filters: FilterState) => {
    setCurrentFilters(filters);
    setPage(1);
    setShowFilterPanel(false);
  };

  const handleSortPress = (sortType: string) => {
    setActiveSort(sortType);
    const sortParams = getSortParams(sortType);
    const newFilters = {
      ...currentFilters,
      ...sortParams,
    };
    setCurrentFilters(newFilters);
  };

  const getPriceLabel = () => {
    if (currentFilters.sort_by === 'price') {
      return currentFilters.sort_order === 'asc' ? 'Giá ↑' : 'Giá ↓';
    }
    return 'Giá';
  };

  const renderProductItem = ({item}: {item: SearchSuggestion}) => (
    <View style={styles.productCardWrapper}>
      <ProductCard
        product={{
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnail,
          base_price: item.base_price,
          sold_count: item.sold_count,
        }}
        onPress={() => handleProductPress(item.id)}
        navigation={navigation}
      />
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading && products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ee4d2d" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchSearchResults(1, currentFilters)}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || products.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#ee4d2d" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={handleSearchBarPress}>
          <Text style={styles.searchText} numberOfLines={1}>
            {keyword}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFilterPress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Image
            source={require('../../../assets/icons/Filter.png')}
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            activeSort === 'relevant' && styles.sortButtonActive,
          ]}
          onPress={() => handleSortPress('relevant')}>
          <Text
            style={[
              styles.sortButtonText,
              activeSort === 'relevant' && styles.sortButtonTextActive,
            ]}>
            Liên quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            activeSort === 'newest' && styles.sortButtonActive,
          ]}
          onPress={() => handleSortPress('newest')}>
          <Text
            style={[
              styles.sortButtonText,
              activeSort === 'newest' && styles.sortButtonTextActive,
            ]}>
            Mới nhất
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            activeSort === 'sold' && styles.sortButtonActive,
          ]}
          onPress={() => handleSortPress('sold')}>
          <Text
            style={[
              styles.sortButtonText,
              activeSort === 'sold' && styles.sortButtonTextActive,
            ]}>
            Bán chạy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            activeSort === 'price' && styles.sortButtonActive,
          ]}
          onPress={() => handleSortPress('price')}>
          <Text
            style={[
              styles.sortButtonText,
              activeSort === 'price' && styles.sortButtonTextActive,
            ]}>
            {getPriceLabel()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      {products.length > 0 && (
        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>Tìm thấy {total} sản phẩm</Text>
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Panel */}
      <FilterPanel
        visible={showFilterPanel}
        onFilterChange={handleFilterChange}
        onClose={() => setShowFilterPanel(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#ee4d2d',
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  searchText: {
    fontSize: 14,
    color: '#333333',
  },
  filterIcon: {
    width: 24,
    height: 24,
    tintColor: '#ee4d2d',
  },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#ee4d2d',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
  },
  sortButtonTextActive: {
    color: '#ee4d2d',
    fontWeight: '600',
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
  },
  resultText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ee4d2d',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ee4d2d',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchResult;
