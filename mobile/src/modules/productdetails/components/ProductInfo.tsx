import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

interface ProductInfoProps {
  price?: number;
  productName?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  price = 299000,
  productName = 'Túi đựng đồ da nữ thời trang cao cấp bền bỉ',
  rating = 4.5,
  reviewCount = 9500,
  soldCount = 1250,
}) => {
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(price)}₫</Text>
      </View>

      {/* Product Name */}
      <Text style={styles.productName} numberOfLines={2}>
        {productName}
      </Text>

      {/* Rating and Sold Info */}
      <View style={styles.infoContainer}>
        <View style={styles.ratingContainer}>
          {/* Star Icon */}
          <Image
            source={require('../../../assets/icons/Star.png')}
            style={styles.starIcon}
          />
          {/* Rating */}
          <Text style={styles.ratingText}>{rating}</Text>

          {/* Review Count */}
          <Text style={styles.reviewCountText}>
            ({formatReviewCount(reviewCount)})
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Sold Count */}
          <Text style={styles.soldText}>Đã bán: {soldCount}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF4444',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 19,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 7,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  starIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginRight: 6,
  },
  reviewCountText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    marginRight: 12,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E5EA',
    marginRight: 12,
  },
  soldText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
});

export default ProductInfo;
