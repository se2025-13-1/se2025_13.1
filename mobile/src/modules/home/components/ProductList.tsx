import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import ProductCard from '../../../shared/Components/ProductCard';
import homeService, {Product} from '../services/homeService';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // Chiều rộng card với margin

interface ProductListProps {
  categoryTitle?: string;
  productType?: 'new' | 'bestseller'; // 'new' = sản phẩm mới, 'bestseller' = bán chạy
  onSeeMorePress?: () => void;
  navigation?: any;
}

const ProductList: React.FC<ProductListProps> = ({
  categoryTitle = 'Bán chạy',
  productType = 'bestseller',
  onSeeMorePress,
  navigation,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [productType]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (productType === 'new') {
        response = await homeService.getNewProducts(10);
      } else {
        response = await homeService.getBestSellers(10);
      }

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
    // TODO: Navigate to product detail screen
    // navigation.navigate('ProductDetail', { productId });
  };

  const handleSeeMorePress = () => {
    console.log('See more pressed for:', categoryTitle);
    if (onSeeMorePress) {
      onSeeMorePress();
    }
    // TODO: Navigate to category products screen
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

  const renderSeparator = () => <View style={styles.separator} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{error || 'Không có sản phẩm'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header với tên danh mục và nút xem thêm */}
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        <TouchableOpacity onPress={handleSeeMorePress}>
          <Text style={styles.seeMoreText}>Xem thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ee4d2d" />
        </View>
      )}

      {/* Danh sách sản phẩm theo chiều ngang */}
      {!loading && (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 5}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={styles.productList}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  seeMoreText: {
    fontSize: 14,
    color: '#ee4d2d',
    fontWeight: '500',
  },
  productList: {
    paddingLeft: 5,
    paddingRight: 10,
  },
  productItem: {
    width: CARD_WIDTH,
  },
  separator: {
    width: 5,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    width: width - 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default ProductList;
