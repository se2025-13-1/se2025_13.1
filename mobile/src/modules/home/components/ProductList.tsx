import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import ProductCard from '../../../shared/Components/ProductCard';
import homeService, {Product} from '../services/homeService';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // Chiều rộng card với margin

interface ProductListProps {
  navigation?: any;
}

const ProductList: React.FC<ProductListProps> = ({navigation}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy tất cả sản phẩm mới (sắp xếp theo mới nhất: created_at DESC)
      const response = await homeService.getNewProducts(100);

      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
    if (navigation) {
      navigation.navigate('ProductDetail', {productId});
    }
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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{error || 'Không có sản phẩm'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header - Danh mục Sản phẩm mới */}
      <Text style={styles.categoryTitle}>Sản phẩm mới</Text>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ee4d2d" />
        </View>
      )}

      {/* Danh sách sản phẩm theo grid dọc (2 cột) */}
      {!loading && (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
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
    fontSize: 14,
    color: '#999999',
  },
});

export default ProductList;
