import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface OrderSummaryProps {
  subtotal?: number;
  shippingFee?: number;
  shippingDiscount?: number;
  voucherDiscount?: number;
  total?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal = 159000,
  shippingFee = 22200,
  shippingDiscount = -22200,
  voucherDiscount = -19080,
  total = 139920,
}) => {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  const isDiscount = (price: number): boolean => price < 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết thanh toán</Text>

      {/* Subtotal */}
      <View style={styles.row}>
        <Text style={styles.label}>Tổng tiền hàng</Text>
        <Text style={styles.value}>{formatPrice(subtotal)}</Text>
      </View>

      {/* Shipping Fee */}
      <View style={styles.row}>
        <Text style={styles.label}>Tổng tiền phí vận chuyển</Text>
        <Text style={styles.value}>{formatPrice(shippingFee)}</Text>
      </View>

      {/* Shipping Discount */}
      {shippingDiscount !== 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Giảm giá phí vận chuyển</Text>
          <Text style={[styles.value, styles.discount]}>
            {formatPrice(shippingDiscount)}
          </Text>
        </View>
      )}

      {/* Voucher Discount */}
      {voucherDiscount !== 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Tổng cộng Voucher giảm giá</Text>
          <Text style={[styles.value, styles.discount]}>
            {formatPrice(voucherDiscount)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  discount: {
    color: '#E53935',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
});

export default OrderSummary;
