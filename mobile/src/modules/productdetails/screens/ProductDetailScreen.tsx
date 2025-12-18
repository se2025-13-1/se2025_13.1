import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, ActivityIndicator} from 'react-native';
import ProductHeader from '../components/ProductHeader';
import ProductImage from '../components/ProductImage';
import ProductInfo from '../components/ProductInfo';
import ProductVariants from '../components/ProductVariants';
import ProductDescription from '../components/ProductDescription';
import ProductReviewList from '../components/ProductReviewList';
import ProductRecommended from '../components/ProductRecommended';
import ProductVariantSelector from '../components/ProductVariantSelector';
import BottomActionBar from '../components/BottomActionBar';
import productDetailsService, {
  ProductDetails,
  ProductVariant,
} from '../services/productDetailsService';

interface ProductDetailScreenProps {
  navigation?: any;
  route?: any;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = route?.params?.productId;

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[ProductDetailScreen] Fetching product: ${productId}`);

      const response = await productDetailsService.getProductDetails(productId);
      setProduct(response.product);

      // Set first variant as default
      if (response.product.variants && response.product.variants.length > 0) {
        setSelectedVariant(response.product.variants[0]);
      }
    } catch (err) {
      console.error('[ProductDetailScreen] Error fetching product:', err);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
    navigation?.navigate('SearchEntry');
  };

  const handleSearchChange = (text: string) => {
    setSearchValue(text);
  };

  const handleNotificationPress = () => {
    console.log('Notification pressed');
    navigation?.navigate('Notification');
  };

  const handleLoginPress = () => {
    navigation?.navigate('Login');
  };

  const handleRegisterPress = () => {
    navigation?.navigate('SignUp');
  };

  const handleGoogleLoginPress = () => {
    console.log('Google login pressed');
  };

  const handleFacebookLoginPress = () => {
    console.log('Facebook login pressed');
  };

  return (
    <View style={styles.container}>
      {/* Product Header */}
      <ProductHeader
        onBackPress={handleBackPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onLogin={handleLoginPress}
        onRegister={handleRegisterPress}
        onGoogleLogin={handleGoogleLoginPress}
        onFacebookLogin={handleFacebookLoginPress}
      />

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ee4d2d" />
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <ProductHeader
            onBackPress={handleBackPress}
            onSearchPress={handleSearchPress}
            onNotificationPress={handleNotificationPress}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onLogin={handleLoginPress}
            onRegister={handleRegisterPress}
            onGoogleLogin={handleGoogleLoginPress}
            onFacebookLogin={handleFacebookLoginPress}
          />
        </View>
      )}

      {/* Product Details Content */}
      {!loading && product && (
        <>
          <ScrollView style={styles.scrollView}>
            {/* Product Images */}
            <ProductImage images={product.images} />

            {/* Product Info */}
            <ProductInfo
              price={product.base_price}
              productName={product.name}
              rating_average={product.rating_average}
              review_count={product.review_count}
              soldCount={product.sold_count}
              description={product.description}
            />

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <ProductVariants
                variants={product.variants}
                images={product.images}
                selectedVariant={selectedVariant || undefined}
                onVariantSelect={setSelectedVariant}
              />
            )}

            {/* Separator */}
            <View style={styles.separator} />

            {/* Product Description */}
            {product.description && (
              <>
                <ProductDescription
                  description={product.description}
                  onToggle={isExpanded =>
                    console.log('Description expanded:', isExpanded)
                  }
                />

                {/* Separator */}
                <View style={styles.separator} />
              </>
            )}

            {/* Product Reviews */}
            <ProductReviewList
              totalReviewCount={product.review_count || 0}
              averageRating={product.rating_average || 0}
              reviews={[]}
              onSeeAllPress={() => navigation?.navigate('ReviewList')}
            />

            {/* Separator */}
            <View style={styles.separator} />

            {/* Product Recommended */}
            <ProductRecommended
              navigation={navigation}
              onProductPress={productId =>
                navigation?.push('ProductDetail', {productId})
              }
            />
          </ScrollView>

          {/* Bottom Action Bar */}
          <BottomActionBar
            voucherPrice={0}
            onChatPress={() => console.log('Chat pressed')}
            onCartPress={() => console.log('Add to cart pressed')}
            onBuyPress={() => setShowVariantSelector(true)}
            onLogin={handleLoginPress}
            onRegister={handleRegisterPress}
            onGoogleLogin={handleGoogleLoginPress}
            onFacebookLogin={handleFacebookLoginPress}
          />

          {/* Product Variant Selector Overlay */}
          {showVariantSelector && product && (
            <ProductVariantSelector
              onClose={() => setShowVariantSelector(false)}
              onBuy={(variant, quantity) => {
                setShowVariantSelector(false);
                // Navigate to Payment with variant and quantity data
                navigation.navigate('Payment', {
                  product: {
                    id: product.id,
                    name: product.name,
                    thumbnail: product.thumbnail,
                    base_price: product.base_price,
                  },
                  variant: {
                    id: variant.id,
                    color: variant.color,
                    size: variant.size,
                    price: variant.price,
                    stock: variant.stock ?? variant.stock_quantity ?? 0,
                    thumbnail: variant.thumbnail,
                  },
                  quantity: quantity,
                });
              }}
              variants={product.variants || []}
              images={product.images || []}
              productName={product.name}
              basePrice={product.base_price}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  separator: {
    height: 8,
    backgroundColor: '#F5F5F5',
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
  },
});

export default ProductDetailScreen;
