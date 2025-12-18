import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Order} from '../services/orderApi';

interface OrderShippingProps {
  order: Order;
}

const OrderShipping: React.FC<OrderShippingProps> = ({order}) => {
  const shippingInfo = order.shipping_info;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin giao hàng</Text>

      {/* Recipient */}
      <View style={styles.section}>
        <Text style={styles.label}>Người nhận:</Text>
        <Text style={styles.value}>
          {shippingInfo?.name || shippingInfo?.recipient_name || 'N/A'}
        </Text>
      </View>

      {/* Phone */}
      <View style={styles.section}>
        <Text style={styles.label}>Số điện thoại:</Text>
        <Text style={styles.value}>
          {shippingInfo?.phone || shippingInfo?.recipient_phone || 'N/A'}
        </Text>
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.label}>Địa chỉ giao hàng:</Text>
        <Text style={styles.value}>
          {shippingInfo?.full_address ||
            `${shippingInfo?.address_detail}, ${shippingInfo?.ward}, ${shippingInfo?.district}, ${shippingInfo?.province}`}
        </Text>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.label}>Phương thức thanh toán:</Text>
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentText}>
            {order.payment_method === 'cod'
              ? 'Thanh toán khi nhận hàng'
              : order.payment_method === 'momo'
              ? 'Ví MoMo'
              : order.payment_method === 'zalopay'
              ? 'Ví ZaloPay'
              : order.payment_method}
          </Text>
        </View>
      </View>

      {/* Note */}
      {order.note && (
        <View style={styles.section}>
          <Text style={styles.label}>Ghi chú:</Text>
          <Text style={styles.noteValue}>{order.note}</Text>
        </View>
      )}
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
  section: {
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  label: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 6,
  },
  value: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
    lineHeight: 18,
  },
  noteValue: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
    lineHeight: 18,
  },
  paymentBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paymentText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
});

export default OrderShipping;
