import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Order} from '../services/orderApi';

interface OrderItemsProps {
  order: Order;
  items: any[];
}

const OrderItems: React.FC<OrderItemsProps> = ({order, items}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết sản phẩm</Text>

      <ScrollView
        style={styles.itemsList}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.product_name || 'Sản phẩm'}
                </Text>
                <Text style={styles.itemVariant}>
                  Màu: {item.color || item.variant_info?.color || 'N/A'} | Size:{' '}
                  {item.size || item.variant_info?.size || 'N/A'}
                </Text>
                <Text style={styles.itemQuantity}>
                  Số lượng: {item.quantity}
                </Text>
              </View>

              <View style={styles.itemPrice}>
                <Text style={styles.price}>
                  {(
                    (item.unit_price || item.price) * item.quantity
                  ).toLocaleString()}
                  đ
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có sản phẩm</Text>
        )}
      </ScrollView>

      {/* Total */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tạm tính:</Text>
          <Text style={styles.totalValue}>
            {(order.subtotal_amount || order.subtotal || 0).toLocaleString()}đ
          </Text>
        </View>

        {(order.shipping_fee || order.shippingFee || 0) > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
            <Text style={styles.totalValue}>
              {(order.shipping_fee || order.shippingFee || 0).toLocaleString()}đ
            </Text>
          </View>
        )}

        {(order.discount_amount || order.discountAmount || 0) > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, {color: '#E53935'}]}>
              Giảm giá:
            </Text>
            <Text style={[styles.totalValue, {color: '#E53935'}]}>
              -
              {(
                order.discount_amount ||
                order.discountAmount ||
                0
              ).toLocaleString()}
              đ
            </Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={styles.finalTotalLabel}>Tổng cộng:</Text>
          <Text style={styles.finalTotalValue}>
            {(order.total_amount || order.totalAmount || 0).toLocaleString()}đ
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginTop: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  itemsList: {
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999999',
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E53935',
  },
  emptyText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 15,
  },
  totalSection: {
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#F0F0F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '600',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  finalTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  finalTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
});

export default OrderItems;
