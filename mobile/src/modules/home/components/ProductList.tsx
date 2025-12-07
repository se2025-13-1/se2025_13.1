import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import ProductCard from '../../../shared/Components/ProductCard';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // Chiều rộng card với margin

interface ProductListProps {
  categoryTitle?: string;
  onSeeMorePress?: () => void;
  navigation?: any;
}

const ProductList: React.FC<ProductListProps> = ({
  categoryTitle = 'Bán chạy',
  onSeeMorePress,
  navigation,
}) => {
  // Tạo dữ liệu mẫu cho 10 sản phẩm
  const products = Array.from({length: 10}, (_, index) => ({
    id: `product_${index + 1}`,
    name: `Sản phẩm ${index + 1}`,
  }));

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
    // TODO: Navigate to product detail screen
  };

  const handleSeeMorePress = () => {
    console.log('See more pressed for:', categoryTitle);
    if (onSeeMorePress) {
      onSeeMorePress();
    }
    // TODO: Navigate to category products screen
  };

  const renderProduct = ({item}: {item: any}) => (
    <View style={styles.productItem}>
      <ProductCard
        onPress={() => handleProductPress(item.id)}
        navigation={navigation}
      />
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      {/* Header với tên danh mục và nút xem thêm */}
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        <TouchableOpacity onPress={handleSeeMorePress}>
          <Text style={styles.seeMoreText}>Xem thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách sản phẩm theo chiều ngang */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 5} // Snap effect với khoảng cách giữa các card
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.productList}
        ItemSeparatorComponent={renderSeparator}
      />
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
});

export default ProductList;
