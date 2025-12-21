import React from 'react';
import {View, StyleSheet} from 'react-native';
import ProductCardSkeleton from './ProductCardSkeleton';
import SkeletonPlaceholder from './SkeletonPlaceholder';

interface ProductListSkeletonProps {
  itemCount?: number;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({
  itemCount = 6,
}) => {
  const renderSkeletonRow = (index: number) => (
    <View key={index} style={styles.row}>
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Title skeleton */}
      <SkeletonPlaceholder
        width={120}
        height={18}
        marginBottom={15}
        marginTop={10}
      />

      {/* Products skeleton grid */}
      {Array.from({length: Math.ceil(itemCount / 2)}).map((_, index) =>
        renderSkeletonRow(index),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
});

export default ProductListSkeleton;
