import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

interface EmptyCartProps {
  onContinueShopping?: () => void;
}

const EmptyCart: React.FC<EmptyCartProps> = ({onContinueShopping}) => {
  return (
    <View style={styles.container}>
      {/* Empty Cart Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
      </View>

      {/* Empty Message */}
      <Text style={styles.title}>Giỏ hàng của bạn trống</Text>
      <Text style={styles.subtitle}>
        Hãy thêm một số sản phẩm yêu thích vào giỏ hàng
      </Text>

      {/* Continue Shopping Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={onContinueShopping}>
        <Text style={styles.continueButtonText}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default EmptyCart;
