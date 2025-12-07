import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';

interface BottomActionBarProps {
  onFavoritePress?: () => void;
  onChatPress?: () => void;
  onCartPress?: () => void;
  onBuyPress?: () => void;
  voucherPrice?: number;
  buyLabelSize?: number;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onFavoritePress,
  onChatPress,
  onCartPress,
  onBuyPress,
  voucherPrice = 110879,
  buyLabelSize = 14,
}) => {
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <View style={styles.container}>
      {/* Left Section - Favorite, Chat and Cart */}
      <View style={styles.leftSection}>
        {/* Favorite Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.smallButton]}
          onPress={onFavoritePress}
          activeOpacity={0.7}>
          <Image
            source={require('../../../assets/icons/Heart.png')}
            style={styles.iconSmall}
          />
          <Text style={styles.actionLabel}>Yêu thích</Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Chat Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.smallButton]}
          onPress={onChatPress}
          activeOpacity={0.7}>
          <Image
            source={require('../../../assets/icons/Chat.png')}
            style={styles.iconSmall}
          />
          <Text style={styles.actionLabel}>Chat ngay</Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Cart Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.cartButton]}
          onPress={onCartPress}
          activeOpacity={0.7}>
          <Image
            source={require('../../../assets/icons/AddToCart.png')}
            style={styles.iconSmall}
          />
          <Text style={styles.actionLabel}>Thêm vào Giỏ hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Right Section - Buy Button */}
      <TouchableOpacity
        style={styles.buyButton}
        onPress={onBuyPress}
        activeOpacity={0.7}>
        <View style={styles.buyContent}>
          <Text style={[styles.buyLabel, {fontSize: buyLabelSize}]}>
            Mua hàng
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  iconSmall: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#222222',
    textAlign: 'center',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 8,
  },
  smallButton: {
    flex: 0.8,
  },
  cartButton: {
    flex: 1.2,
  },
  buyButton: {
    backgroundColor: '#E53935',
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 32,
    paddingLeft: 32,
    paddingRight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyContent: {
    alignItems: 'center',
  },
  buyLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 0,
  },
  voucherPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BottomActionBar;
