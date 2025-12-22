import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../../contexts/AuthContext';
import RequireAuth from '../../auth/components/RequireAuth';
import {wishlistApi} from '../../wishlist/services/wishlistApi';

interface BottomActionBarProps {
  productId?: string;
  onFavoritePress?: () => void;
  onChatPress?: () => void;
  onCartPress?: () => void;
  onBuyPress?: () => void;
  voucherPrice?: number;
  buyLabelSize?: number;
  onLogin?: () => void;
  onRegister?: () => void;
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  productId,
  onFavoritePress,
  onChatPress,
  onCartPress,
  onBuyPress,
  voucherPrice = 110879,
  buyLabelSize = 14,
  onLogin,
  onRegister,
  onGoogleLogin,
  onFacebookLogin,
}) => {
  const {isAuthenticated} = useAuth();
  const [showRequireAuth, setShowRequireAuth] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<
    'cart' | 'chat' | 'notification'
  >('cart');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // Check if product is in wishlist when component mounts or productId changes
  useEffect(() => {
    if (productId && isAuthenticated) {
      checkIfInWishlist();
    }
  }, [productId, isAuthenticated]);

  // Re-check wishlist status every time this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log(
        '[BottomActionBar] Screen focused, re-checking wishlist status',
      );
      if (productId && isAuthenticated) {
        checkIfInWishlist();
      }
    }, [productId, isAuthenticated]),
  );

  const checkIfInWishlist = async () => {
    try {
      console.log(
        '[BottomActionBar] Checking wishlist status for product:',
        productId,
      );
      const response = await wishlistApi.getWishlistStatus(productId);
      console.log('[BottomActionBar] Wishlist status response:', response);
      setIsFavorited(response.is_liked);
      console.log(
        '[BottomActionBar] Wishlist status for product',
        productId,
        ':',
        response.is_liked,
      );
    } catch (error) {
      console.error('[BottomActionBar] Error checking wishlist status:', error);
      setIsFavorited(false);
    }
  };

  const handleAuthRequiredAction = (
    feature: 'cart' | 'chat' | 'notification',
    callback?: () => void,
  ) => {
    if (!isAuthenticated) {
      setSelectedFeature(feature);
      setShowRequireAuth(true);
      return;
    }
    callback?.();
  };

  const handleFavoritePress = async () => {
    if (!productId) {
      console.warn('⚠️ productId is not provided');
      return;
    }
    if (!isAuthenticated) {
      console.warn('⚠️ User is not authenticated');
      return;
    }

    setIsLoadingFavorite(true);
    try {
      const response = await wishlistApi.toggleWishlist(productId);
      setIsFavorited(response.is_liked);
      onFavoritePress?.();
      console.log(
        '✅ Wishlist toggled successfully, is_liked:',
        response.is_liked,
      );
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleCloseRequireAuth = () => {
    setShowRequireAuth(false);
  };

  const handleLoginPress = () => {
    setShowRequireAuth(false);
    onLogin?.();
  };

  const handleRegisterPress = () => {
    setShowRequireAuth(false);
    onRegister?.();
  };

  const handleGoogleLoginPress = () => {
    setShowRequireAuth(false);
    onGoogleLogin?.();
  };

  const handleFacebookLoginPress = () => {
    setShowRequireAuth(false);
    onFacebookLogin?.();
  };
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
          onPress={() => {
            if (!isAuthenticated) {
              setSelectedFeature('notification');
              setShowRequireAuth(true);
            } else {
              handleFavoritePress();
            }
          }}
          disabled={isLoadingFavorite}
          activeOpacity={0.7}>
          <Image
            source={
              isFavorited
                ? require('../../../assets/icons/HeartFilled.png')
                : require('../../../assets/icons/Heart.png')
            }
            style={[styles.iconSmall, isFavorited && {tintColor: '#FF4444'}]}
          />
          <Text style={styles.actionLabel}>Yêu thích</Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Chat Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.smallButton]}
          onPress={() => handleAuthRequiredAction('chat', onChatPress)}
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
          onPress={() => handleAuthRequiredAction('cart', onCartPress)}
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
        onPress={() => handleAuthRequiredAction('cart', onBuyPress)}
        activeOpacity={0.7}>
        <View style={styles.buyContent}>
          <Text style={[styles.buyLabel, {fontSize: buyLabelSize}]}>
            Mua hàng
          </Text>
        </View>
      </TouchableOpacity>

      {/* RequireAuth Modal */}
      <RequireAuth
        visible={showRequireAuth}
        onClose={handleCloseRequireAuth}
        feature={selectedFeature}
        onLogin={handleLoginPress}
        onRegister={handleRegisterPress}
        onGoogleLogin={handleGoogleLoginPress}
        onFacebookLogin={handleFacebookLoginPress}
      />
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
