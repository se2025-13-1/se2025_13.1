import React from 'react';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import ProductCard from '../../../shared/Components/ProductCard';

interface CartRecommendProps {
  navigation?: any;
  onProductPress?: (productId: string) => void;
}

const CartRecommend: React.FC<CartRecommendProps> = ({
  navigation,
  onProductPress,
}) => {
  // Dữ liệu mẫu cho 10 sản phẩm gợi ý
  const recommendedProducts = Array.from({length: 10}, (_, index) => ({
    id: `recommend_${index + 1}`,
    name: `Sản phẩm gợi ý ${index + 1}`,
  }));

  const {width} = Dimensions.get('window');
  const cardWidth = (width - 45) / 2;

  const renderProduct = ({item}: {item: any}) => (
    <View style={{width: cardWidth, marginHorizontal: 2.5}}>
      <ProductCard
        onPress={() => {
          if (onProductPress) {
            onProductPress(item.id);
          }
          // Navigate to ProductDetail screen
          if (navigation) {
            navigation.navigate('ProductDetail', {productId: item.id});
          }
        }}
        navigation={navigation}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Có thể bạn sẽ thích</Text>
      </View>

      {/* Products Grid */}
      <FlatList
        data={recommendedProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 8,
  },
});

export default CartRecommend;
