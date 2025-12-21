import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

const {width} = Dimensions.get('window');
const cardWidth = (width - 45) / 2; // Chiều rộng card (trừ margin)

const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Ảnh sản phẩm skeleton */}
      <View style={styles.imageContainer}>
        <SkeletonPlaceholder
          width={cardWidth - 20}
          height={120}
          borderRadius={8}
        />
      </View>

      {/* Content skeleton */}
      <View style={styles.contentContainer}>
        {/* Tên sản phẩm - 2 lines */}
        <SkeletonPlaceholder width="100%" height={16} marginBottom={4} />
        <SkeletonPlaceholder width="70%" height={16} marginBottom={8} />

        {/* Bottom section */}
        <View style={styles.bottomContainer}>
          {/* Giá */}
          <SkeletonPlaceholder width={80} height={18} marginBottom={4} />
          {/* Số lượng đã bán */}
          <SkeletonPlaceholder width={60} height={12} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
  },
  bottomContainer: {
    marginTop: 'auto',
  },
});

export default ProductCardSkeleton;
