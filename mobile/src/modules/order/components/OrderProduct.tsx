import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';

interface OrderItem {
  id: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  thumbnail: string;
}

interface OrderProductProps {
  items: OrderItem[];
  totalAmount: number;
}

const OrderProduct: React.FC<OrderProductProps> = ({items, totalAmount}) => {
  const [expanded, setExpanded] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const shipping = totalAmount - subtotal > 0 ? totalAmount - subtotal : 0;
  const discount =
    subtotal + shipping - totalAmount > 0
      ? subtotal + shipping - totalAmount
      : 0;
  return (
    <View style={styles.container}>
      {/* Product Items */}
      <View style={styles.itemsContainer}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <View key={item.id}>
              <View style={styles.productRow}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{uri: item.thumbnail}}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Product Details */}
                <View style={styles.detailsContainer}>
                  <View>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product_name}
                    </Text>

                    {/* Color & Size & Quantity - Same Line */}
                    <View style={styles.colorSizeQuantityRow}>
                      <Text style={styles.colorSizeText}>
                        Màu sắc: {item.color}; Size: {item.size}
                      </Text>
                      <Text style={styles.quantityText}>
                        Số lượng: {item.quantity}
                      </Text>
                    </View>
                  </View>

                  {/* Price - Bottom Right */}
                  <Text style={styles.priceText}>
                    {item.unit_price.toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              </View>

              {/* Divider between items */}
              {index < items.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        ) : (
          <Text style={styles.noItemsText}>
            Không có sản phẩm trong đơn hàng
          </Text>
        )}
      </View>

      {/* Total Amount */}
      <TouchableOpacity
        style={styles.totalRow}
        onPress={() => setExpanded(!expanded)}>
        <View style={styles.totalLeftContent}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>
            {totalAmount.toLocaleString('vi-VN')}₫
          </Text>
        </View>
        <Image
          source={require('../../../assets/icons/Chevron.png')}
          style={[
            styles.chevronIcon,
            {transform: [{rotate: expanded ? '90deg' : '0deg'}]},
          ]}
        />
      </TouchableOpacity>

      {/* Expanded Payment Details */}
      {expanded && (
        <View style={styles.paymentDetailsContainer}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tạm tính:</Text>
            <Text style={styles.paymentValue}>
              {subtotal.toLocaleString('vi-VN')}₫
            </Text>
          </View>
          {shipping > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phí vận chuyển:</Text>
              <Text style={styles.paymentValue}>
                {shipping.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, {color: '#E74C3C'}]}>
                Giảm giá:
              </Text>
              <Text style={[styles.paymentValue, {color: '#E74C3C'}]}>
                -{discount.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          )}
          <View style={styles.paymentDivider} />
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Thành tiền:</Text>
            <Text style={styles.paymentTotal}>
              {totalAmount.toLocaleString('vi-VN')}₫
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
    padding: 12,
    overflow: 'hidden',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  imageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 70,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  colorSizeQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorSizeText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    flex: 1,
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  noItemsText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  totalLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  chevronIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#666',
  },
  paymentDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: 6,
    padding: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  paymentTotal: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default OrderProduct;
