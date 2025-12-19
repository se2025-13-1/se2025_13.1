import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {useAuth} from '../../../contexts/AuthContext';
import ProductCard from '../../../shared/Components/ProductCard';
import LoveButton from '../components/LoveButton';
import {wishlistApi} from '../services/wishlistApi';

interface WishListScreenProps {
  navigation?: any;
}

interface WishlistProduct {
  id: string;
  name: string;
  thumbnail?: string;
  base_price: number;
  sold_count?: number;
}

const {width} = Dimensions.get('window');

const WishListScreen: React.FC<WishListScreenProps> = ({navigation}) => {
  const {isAuthenticated} = useAuth();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlistProducts();
  }, []);

  const fetchWishlistProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await wishlistApi.listWishlist();
      setProducts(response.products || []);
      console.log('✅ Wishlist products loaded:', response.products?.length);
    } catch (err) {
      console.error('❌ Error fetching wishlist:', err);
      setError('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleProductRemoved = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const renderProductWithButton = (product: WishlistProduct) => {
    return (
      <View style={styles.productWrapper}>
        <ProductCard
          product={product}
          navigation={navigation}
          onPress={() => {
            navigation?.navigate('ProductDetail', {productId: product.id});
          }}
        />
        <View style={styles.loveButtonContainer}>
          <LoveButton
            productId={product.id}
            initialIsLiked={true}
            onToggle={isLiked => {
              if (!isLiked) {
                handleProductRemoved(product.id);
              }
            }}
          />
        </View>
      </View>
    );
  };

  const renderRow = ({item}: {item: WishlistProduct[]}) => {
    return (
      <View style={styles.row}>
        {item.map((product, index) => (
          <View key={product.id} style={styles.cardContainer}>
            {renderProductWithButton(product)}
          </View>
        ))}
        {item.length === 1 && <View style={styles.spacer} />}
      </View>
    );
  };

  // Chia sản phẩm thành các nhóm 2 sản phẩm mỗi hàng
  const groupedProducts = [];
  for (let i = 0; i < products.length; i += 2) {
    groupedProducts.push(products.slice(i, i + 2));
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
        <View style={styles.spacerRight} />
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWishlistProducts}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
          <Text style={styles.emptySubText}>
            Hãy thêm sản phẩm yêu thích của bạn
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedProducts}
          renderItem={renderRow}
          keyExtractor={(item, index) => `row-${index}`}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
  },
  spacerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 7.5,
  },
  spacer: {
    flex: 1,
    marginHorizontal: 7.5,
  },
  productWrapper: {
    position: 'relative',
    width: '100%',
  },
  loveButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
});

export default WishListScreen;
