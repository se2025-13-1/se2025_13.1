import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

// Calculate item width to show max 4 categories per screen
const screenWidth = Dimensions.get('window').width;
const ITEM_WIDTH = (screenWidth - 32 - 24) / 4; // (screen - horizontal padding - gaps) / 4
const ITEM_MARGIN = 8; // margin between items

interface Category {
  id: string;
  name: string;
  color: string;
  renderIcon: () => React.ReactNode;
}

// Styles for icon shapes
const iconStyles = StyleSheet.create({
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  circleSm: {
    width: 5,
    height: 5,
    backgroundColor: 'white',
    borderRadius: 999,
    marginBottom: 2,
  },
  circleMd: {
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 999,
    marginBottom: 2,
  },
  circleLg: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 999,
  },
  rectSmall: {
    width: 2,
    height: 6,
    backgroundColor: 'white',
  },
  rectMedium: {
    width: 4,
    height: 4,
    backgroundColor: 'white',
    marginHorizontal: 2,
  },
  rectLarge: {
    width: 6,
    height: 8,
    backgroundColor: 'white',
  },
  legsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  armsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  line: {
    backgroundColor: 'white',
    width: 2,
    height: 10,
  },
  lineRotate: {
    backgroundColor: 'white',
    width: 2,
    height: 10,
    transform: [{rotate: '-45deg'}],
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    marginTop: 2,
  },
  trapezoid: {
    width: 8,
    height: 6,
    backgroundColor: 'white',
    marginTop: 2,
  },
  shoe: {
    width: 5,
    height: 4,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  shoeRight: {
    width: 5,
    height: 4,
    backgroundColor: 'white',
    borderRadius: 1,
    marginLeft: 4,
  },
  bag: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  dotDecorative: {
    width: 2,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    marginTop: 4,
  },
  ballDotsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
});

// Component để render các icon tùy chỉnh cho từng danh mục
const CategoryIcons = {
  nam: () => (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.circleMd} />
      <View style={iconStyles.rectLarge} />
      <View style={iconStyles.legsContainer}>
        <View style={iconStyles.rectSmall} />
        <View style={iconStyles.rectSmall} />
      </View>
    </View>
  ),
  nu: () => (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.circleMd} />
      <View style={iconStyles.trapezoid} />
    </View>
  ),
  treem: () => (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.circleSm} />
      <View style={iconStyles.armsContainer}>
        <View style={iconStyles.dot} />
        <View style={iconStyles.rectMedium} />
        <View style={iconStyles.dot} />
      </View>
      <View style={iconStyles.dotsRow}>
        <View style={iconStyles.dot} />
        <View style={iconStyles.dot} />
      </View>
    </View>
  ),
  xuhướng: () => (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.lineRotate} />
      <View style={iconStyles.arrow} />
    </View>
  ),
  giayđep: () => (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.shoe} />
      <View style={iconStyles.shoeRight} />
    </View>
  ),
  phukkien: () => (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.bag} />
      <View style={iconStyles.dotDecorative} />
    </View>
  ),
  thethao: () => (
    <View style={iconStyles.iconWrapper}>
      <View style={iconStyles.circleLg} />
      <View style={iconStyles.ballDotsRow}>
        <View style={iconStyles.dot} />
        <View style={iconStyles.dot} />
        <View style={iconStyles.dot} />
      </View>
    </View>
  ),
};

const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Nam',
    color: '#FF6B6B',
    renderIcon: CategoryIcons.nam,
  },
  {
    id: '2',
    name: 'Nữ',
    color: '#FF69B4',
    renderIcon: CategoryIcons.nu,
  },
  {
    id: '3',
    name: 'Trẻ em',
    color: '#FFD93D',
    renderIcon: CategoryIcons.treem,
  },
  {
    id: '4',
    name: 'Xu hướng',
    color: '#6BCB77',
    renderIcon: CategoryIcons.xuhướng,
  },
  {
    id: '5',
    name: 'Giày dép',
    color: '#4D96FF',
    renderIcon: CategoryIcons.giayđep,
  },
  {
    id: '6',
    name: 'Phụ kiện',
    color: '#9D4EDD',
    renderIcon: CategoryIcons.phukkien,
  },
  {
    id: '7',
    name: 'Thể thao',
    color: '#FF9500',
    renderIcon: CategoryIcons.thethao,
  },
];

const Categories: React.FC = () => {
  const handleCategoryPress = (categoryName: string) => {
    console.log('Category pressed:', categoryName);
  };

  const handleSeeMore = () => {
    console.log('See more categories');
  };

  return (
    <View style={styles.container}>
      {/* Header: Danh mục + Xem thêm */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
        <TouchableOpacity onPress={handleSeeMore}>
          <Text style={styles.seeMore}>Xem thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal ScrollView for Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category.name)}
            activeOpacity={0.7}>
            {/* Category Icon */}
            <View
              style={[styles.iconContainer, {backgroundColor: category.color}]}>
              {category.renderIcon()}
            </View>
            {/* Category Name */}
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  seeMore: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: ITEM_MARGIN,
    marginBottom: 8,
    width: ITEM_WIDTH,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    maxWidth: ITEM_WIDTH - 4,
  },
});

export default Categories;
