import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonPlaceholder from './SkeletonPlaceholder';

const screenWidth = Dimensions.get('window').width;
const ITEM_WIDTH = (screenWidth - 32 - 32) / 5; // (screen - horizontal padding - gaps) / 5

const CategoryItemSkeleton: React.FC = () => {
  return (
    <View style={styles.categoryItem}>
      {/* Icon skeleton */}
      <View style={styles.iconContainer}>
        <SkeletonPlaceholder width={50} height={50} borderRadius={25} />
      </View>

      {/* Text skeleton */}
      <SkeletonPlaceholder
        width={ITEM_WIDTH - 10}
        height={12}
        marginTop={8}
        borderRadius={6}
      />
    </View>
  );
};

const CategoriesSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonPlaceholder width={80} height={18} />
        <SkeletonPlaceholder width={60} height={16} />
      </View>

      {/* Categories skeleton */}
      <View style={styles.scrollContent}>
        {Array.from({length: 5}).map((_, index) => (
          <CategoryItemSkeleton key={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    width: ITEM_WIDTH,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoriesSkeleton;
