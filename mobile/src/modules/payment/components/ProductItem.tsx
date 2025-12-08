import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';

interface ProductItemProps {
  productName?: string;
  color?: string;
  size?: string;
  price?: number;
  quantity?: number;
  image?: string;
  onPress?: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({
  productName = 'Áo Sweater Có Zip PN STORE Vải Nỉ Da Cá Khóa...',
  color = 'Đen',
  size = 'M',
  price = 139920,
  quantity = 1,
  image = 'https://via.placeholder.com/80x100/000000/000000?text=Product',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Main Content - Image and Details */}
      <View style={styles.contentRow}>
        {/* Product Image - Left */}
        <Image source={{uri: image}} style={styles.productImage} />

        {/* Details - Right */}
        <View style={styles.detailsContainer}>
          {/* Product Name */}
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>

          {/* Color and Size */}
          <Text style={styles.variantText}>
            Màu sắc: {color}; Size: {size}
          </Text>

          {/* Price and Quantity Row */}
          <View style={styles.priceQuantityRow}>
            <Text style={styles.currentPrice}>{price.toLocaleString()}đ</Text>
            <Text style={styles.quantity}>Số lượng: {quantity}</Text>
          </View>
        </View>
      </View>

      {/* Voucher and Message Section */}
      <View style={styles.voucherMessageSection}>
        {/* Voucher */}
        <TouchableOpacity style={styles.voucherRow}>
          <Text style={styles.voucherLabel}>Voucher sản phẩm</Text>
          <View style={styles.voucherRightContent}>
            <Text style={styles.voucherValue}>Chọn hoặc nhập mã</Text>
            <Image
              source={require('../../../assets/icons/ArrowForward.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Message */}
        <TouchableOpacity style={styles.messageRow}>
          <Text style={styles.messageLabel}>Lời nhắn cho cửa hàng</Text>
          <View style={styles.messageRightContent}>
            <Text style={styles.messageValue}>Để lại lời nhắn</Text>
            <Image
              source={require('../../../assets/icons/ArrowForward.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    lineHeight: 16,
  },
  variantText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 30,
  },
  contentRow: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  quantity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  voucherMessageSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  voucherLabel: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '400',
  },
  voucherRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  voucherValue: {
    fontSize: 12,
    color: '#999999',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  messageLabel: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '400',
  },
  messageRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  messageValue: {
    fontSize: 12,
    color: '#999999',
  },
  arrowIcon: {
    width: 12,
    height: 12,
    tintColor: '#999999',
  },
});

export default ProductItem;
