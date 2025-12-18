import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

interface ProductInfoProps {
  price?: number;
  productName?: string;
  rating_average?: number;
  review_count?: number;
  soldCount?: number;
  description?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  price,
  productName,
  rating_average,
  review_count,
  soldCount,
  description,
}) => {
  const formatPrice = (p: number) => {
    return Math.floor(p)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Price and Sold Count */}
      <View style={styles.priceHeaderContainer}>
        {price && <Text style={styles.price}>{formatPrice(price)}₫</Text>}
        {soldCount !== undefined && (
          <Text style={styles.soldText}>Đã bán: {soldCount}</Text>
        )}
      </View>

      {/* Product Name */}
      {productName && (
        <Text style={styles.productName} numberOfLines={2}>
          {productName}
        </Text>
      )}

      {/* Rating Info */}
      <View style={styles.infoContainer}>
        <View style={styles.ratingContainer}>
          {/* Star Icon */}
          {typeof rating_average === 'number' && (
            <>
              <Image
                source={require('../../../assets/icons/Star.png')}
                style={styles.starIcon}
              />
              {/* Rating */}
              <Text style={styles.ratingText}>{rating_average.toFixed(1)}</Text>

              {/* Review Count */}
              <Text style={styles.reviewCountText}>
                ({formatReviewCount(review_count || 0)})
              </Text>

              {/* Divider */}
              <View style={styles.divider} />
            </>
          )}
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
  priceHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 20,
  },
});

export default ProductInfo;
