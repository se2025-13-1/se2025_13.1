import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface BottomCheckoutBarProps {
  total?: number;
  saved?: number;
  onCheckout?: () => void;
}

const BottomCheckoutBar: React.FC<BottomCheckoutBarProps> = ({
  total = 139920,
  saved = 132880,
  onCheckout,
}) => {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  return (
    <View style={styles.container}>
      <View style={styles.rightSection}>
        <View style={styles.priceInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.savedLabel}>Tiết kiếm</Text>
            <Text style={styles.savedPrice}>{formatPrice(saved)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  priceInfo: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  savedLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  savedPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E53935',
  },
  checkoutButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 5,
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BottomCheckoutBar;
