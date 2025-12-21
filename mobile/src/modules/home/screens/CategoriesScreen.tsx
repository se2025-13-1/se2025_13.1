import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import ProductCard from '../../../shared/Components/ProductCard';
import homeService, {Product} from '../services/homeService';
import {AppConfig} from '../../../config/AppConfig';
import SkeletonPlaceholder from '../../../shared/skeleton/SkeletonPlaceholder';
import ProductListSkeleton from '../../../shared/skeleton/ProductListSkeleton';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // Chiều rộng card với margin

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();

    // Nếu có category được truyền từ route params, chọn nó
    if (route?.params && 'categoryId' in route.params) {
      setSelectedCategoryId(route.params.categoryId as string);
    }
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchProductsByCategory(selectedCategoryId);
    } else if (categories.length > 0) {
      // Chọn danh mục đầu tiên nếu chưa có danh mục nào được chọn
      setSelectedCategoryId(categories[0].id);
      fetchProductsByCategory(categories[0].id);
    }
  }, [selectedCategoryId, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const apiUrl = `${AppConfig.BASE_URL}/api`;
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();

      // API trả về mảng categories trực tiếp hoặc trong object
      const categoriesData = Array.isArray(data) ? data : data.categories || [];

      if (categoriesData.length > 0) {
        setCategories(categoriesData);
        // Chọn danh mục đầu tiên nếu chưa có được chọn từ params
        if (!route?.params || !('categoryId' in route.params)) {
          setSelectedCategoryId(categoriesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      setProductsLoading(true);
      const response = await homeService.getProductsByCategory(categoryId);

      if (response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products by category:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
    // @ts-ignore
    navigation.navigate('ProductDetail', {productId});
  };

  const handleBackPress = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const renderProduct = ({item}: {item: Product}) => (
    <View style={styles.productItem}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        navigation={navigation}
      />
    </View>
  );

  const renderCategoryTab = (category: Category) => {
    const isSelected = selectedCategoryId === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryTab, isSelected && styles.selectedCategoryTab]}
        onPress={() => handleCategoryPress(category.id)}>
        <Text
          style={[
            styles.categoryTabText,
            isSelected && styles.selectedCategoryTabText,
          ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Không có sản phẩm trong danh mục này</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ee4d2d" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Image
            source={require('../../../assets/icons/Back.png')} // Đường dẫn tới icon back trong assets
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh mục sản phẩm</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabsContainer}>
        {loading ? (
          <View style={styles.categoryTabsContent}>
            {Array.from({length: 3}).map((_, index) => (
              <SkeletonPlaceholder
                key={index}
                width={80}
                height={32}
                borderRadius={16}
                marginRight={12}
              />
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsContent}>
            {categories.map(renderCategoryTab)}
          </ScrollView>
        )}
      </View>

      {/* Products Grid */}
      <View style={styles.productsContainer}>
        {productsLoading ? (
          <ProductListSkeleton itemCount={4} />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    width: 40, // To balance the header
  },
  categoryTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryTab: {
    backgroundColor: '#ee4d2d',
    borderColor: '#ee4d2d',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  selectedCategoryTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  productsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    paddingVertical: 15,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 8,
  },
  productItem: {
    width: CARD_WIDTH,
  },
  emptyContainer: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
