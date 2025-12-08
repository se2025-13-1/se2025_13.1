import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface CartBottomBarProps {
  totalPrice?: number;
  itemCount?: number;
  selectedCount?: number;
  onSelectAll?: (selected: boolean) => void;
  onCheckout?: () => void;
  selectAllChecked?: boolean;
}

const CartBottomBar: React.FC<CartBottomBarProps> = ({
  totalPrice = 0,
  itemCount = 0,
  selectedCount = 0,
  onSelectAll,
  onCheckout,
  selectAllChecked = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Section - Select All */}
      <TouchableOpacity
        style={styles.selectAllSection}
        onPress={() => onSelectAll?.(!selectAllChecked)}>
        <View
          style={[
            styles.checkbox,
            selectAllChecked && styles.checkboxSelected,
          ]}>
          {selectAllChecked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.selectAllText}>Tất cả</Text>
      </TouchableOpacity>

      {/* Middle Section - Total Price */}
      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Tổng:</Text>
        <Text style={styles.totalPrice}>
          {totalPrice.toLocaleString('vi-VN')}đ
        </Text>
      </View>

      {/* Right Section - Checkout Button */}
      <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
        <Text style={styles.checkoutButtonText}>
          Mua hàng ({selectedCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectAllSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 0.3,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  priceSection: {
    flex: 0.35,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  checkoutButton: {
    flex: 0.35,
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CartBottomBar;
