import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import ProductCard from '../../../shared/Components/ProductCard';
import {ProductListSkeleton} from '../../../shared/skeleton';
import homeService, {Product} from '../../home/services/homeService';

interface ProductRecommendedProps {
  navigation?: any;
  onProductPress?: (productId: string) => void;
}

const ProductRecommended: React.FC<ProductRecommendedProps> = ({
  navigation,
  onProductPress,
}) => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {width} = Dimensions.get('window');
  const cardWidth = (width - 45) / 2;

  // Fetch 10 best selling products
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setIsLoading(true);
        const response = await homeService.getBestSellers(10, false);
        setBestSellers(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch best sellers:', err);
        setError('Không thể tải sản phẩm bán chạy');
        setBestSellers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const renderProduct = ({item}: {item: Product}) => (
    <View style={{width: cardWidth, marginHorizontal: 2.5}}>
      <ProductCard
        product={{
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnail,
          base_price: item.base_price,
          sold_count: item.sold_count,
        }}
        onPress={() => {
          if (onProductPress) {
            onProductPress(item.id);
          }
          // Navigate to ProductDetail screen
          if (navigation) {
            navigation.navigate('ProductDetail', {productId: item.id});
          }
        }}
        navigation={navigation}
      />
    </View>
  );

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Có thể bạn sẽ thích</Text>
        </View>
        <ProductListSkeleton itemCount={10} />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Có thể bạn sẽ thích</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // Show empty state
  if (bestSellers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Có thể bạn sẽ thích</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Có thể bạn sẽ thích</Text>
      </View>

      {/* Products Grid */}
      <FlatList
        data={bestSellers}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ProductRecommended;
