import React, {useState} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import ProductHeader from '../components/ProductHeader';
import ProductImage from '../components/ProductImage';
import ProductInfo from '../components/ProductInfo';
import ProductVariants from '../components/ProductVariants';
import ProductDescription from '../components/ProductDescription';
import ProductReviewList from '../components/ProductReviewList';
import ProductRecommended from '../components/ProductRecommended';
import ProductVariantSelector from '../components/ProductVariantSelector';
import BottomActionBar from '../components/BottomActionBar';

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

  return (
    <View style={styles.container}>
      {/* Product Header */}
      <ProductHeader
        onBackPress={handleBackPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

      {/* Product Details Content */}
      <ScrollView style={styles.scrollView}>
        {/* Product Images */}
        <ProductImage />

        {/* Product Info */}
        <ProductInfo
          price={299000}
          productName="Túi đựng đồ da nữ thời trang cao cấp bền bỉ"
          rating={4.5}
          reviewCount={900}
          soldCount={9500}
          onFavoritePress={() => console.log('Favorite pressed')}
        />

        {/* Product Variants */}
        <ProductVariants
          onColorSelect={colorId => console.log('Color selected:', colorId)}
          onSizeSelect={sizeId => console.log('Size selected:', sizeId)}
        />

        {/* Separator */}
        <View style={styles.separator} />

        {/* Product Description */}
        <ProductDescription
          description="Đây là mô tả chi tiết của sản phẩm. Bao gồm các thông tin về chất liệu, kích thước, cách sử dụng, bảo quản và những đặc điểm nổi bật khác của sản phẩm này."
          onToggle={isExpanded =>
            console.log('Description expanded:', isExpanded)
          }
        />

        {/* Separator */}
        <View style={styles.separator} />

        {/* Product Reviews */}
        <ProductReviewList
          totalReviewCount={25}
          averageRating={4.8}
          reviews={[
            {
              id: '1',
              userName: 'Nguyễn Văn A',
              rating: 5,
              reviewText: 'Sản phẩm rất tốt, chất lượng cao, giao hàng nhanh',
              timestamp: '2 ngày trước',
              verified: true,
            },
            {
              id: '2',
              userName: 'Trần Thị B',
              rating: 4,
              reviewText: 'Túi đẹp, đúng như ảnh, rất hài lòng',
              timestamp: '5 ngày trước',
              verified: true,
            },
            {
              id: '3',
              userName: 'Lê Văn C',
              rating: 5,
              reviewText: 'Chất liệu tốt, bền, đáng tiền',
              timestamp: '1 tuần trước',
              verified: false,
            },
          ]}
          onSeeAllPress={() => navigation?.navigate('ReviewList')}
        />

        {/* Separator */}
        <View style={styles.separator} />

        {/* Product Recommended */}
        <ProductRecommended
          navigation={navigation}
          onProductPress={productId =>
            console.log('Product pressed:', productId)
          }
        />
      </ScrollView>

      {/* Bottom Action Bar */}
      <BottomActionBar
        voucherPrice={110879}
        onChatPress={() => console.log('Chat pressed')}
        onCartPress={() => console.log('Add to cart pressed')}
        onBuyPress={() => setShowVariantSelector(true)}
      />

      {/* Product Variant Selector Overlay */}
      {showVariantSelector && (
        <ProductVariantSelector
          onClose={() => setShowVariantSelector(false)}
          onBuy={(color, size, quantity) => {
            console.log('Buy:', {color, size, quantity});
            setShowVariantSelector(false);
          }}
          price={139920}
          originalPrice={250000}
          stock={966}
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
  scrollView: {
    flex: 1,
  },
  separator: {
    height: 8,
    backgroundColor: '#F5F5F5',
  },
});

export default ProductDetailScreen;
