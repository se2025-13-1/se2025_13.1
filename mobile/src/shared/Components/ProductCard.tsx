import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');
const cardWidth = (width - 45) / 2; // Chiều rộng card (trừ margin)

interface ProductCardProps {
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Ảnh sản phẩm */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: 'https://via.placeholder.com/150x150/f0f0f0/666666?text=Sản+Phẩm',
          }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Tên sản phẩm */}
      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          Túi đựng đồ da nữ thời trang cao cấp
        </Text>

        {/* Giá và số lượng đã bán */}
        <View style={styles.bottomContainer}>
          <Text style={styles.price}>50.000₫</Text>
          <Text style={styles.soldText}>Đã bán: 0</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth * 0.75, // Tỷ lệ ảnh 4:3
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 8,
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 18,
    marginBottom: 8,
    minHeight: 36, // Đảm bảo chiều cao tối thiểu cho 2 dòng text
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ee4d2d', // Màu đỏ giống Shopee
  },
  soldText: {
    fontSize: 12,
    color: '#666666',
  },
});

export default ProductCard;
