import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Order} from '../services/orderApi';

interface OrderShippingProps {
  order: Order;
}

const OrderShipping: React.FC<OrderShippingProps> = ({order}) => {
  const shippingInfo = order.shipping_info;
  const recipientName =
    shippingInfo?.name || shippingInfo?.recipient_name || 'N/A';
  const recipientPhone =
    shippingInfo?.phone || shippingInfo?.recipient_phone || 'N/A';
  const address =
    shippingInfo?.full_address ||
    `${shippingInfo?.address_detail}, ${shippingInfo?.ward}, ${shippingInfo?.district}, ${shippingInfo?.province}`;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Địa chỉ nhận hàng</Text>

      {/* Top Row: Location Icon, Name, Phone */}
      <View style={styles.topRow}>
        <Image
          source={require('../../../assets/icons/Location-filled.png')}
          style={styles.locationIcon}
        />
        <View style={styles.userInfo}>
          <View style={styles.userNamePhoneRow}>
            <Text style={styles.userName}>{recipientName}</Text>
            <View style={styles.divider} />
            <Text style={styles.phoneNumber}>{recipientPhone}</Text>
          </View>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressRow}>
        <Text style={styles.address} numberOfLines={2}>
          {address}
        </Text>
      </View>

      {/* Payment Method */}
      <View style={styles.paymentSection}>
        <Text style={styles.paymentLabel}>Phương thức thanh toán:</Text>
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

      {/* Note */}
      {order.note && (
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Ghi chú:</Text>
          <Text style={styles.noteValue}>{order.note}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 0,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#E74C3C',
  },
  userInfo: {
    flex: 1,
  },
  userNamePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
  },
  phoneNumber: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 30,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
    lineHeight: 18,
  },
  paymentSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  paymentText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  noteSection: {
    paddingTop: 0,
  },
  noteLabel: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 6,
  },
  noteValue: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
    lineHeight: 18,
  },
});

export default OrderShipping;
