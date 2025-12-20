import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useAuth} from '../../../contexts/AuthContext';
import RequireAuth from '../../auth/components/RequireAuth';

interface UtilityItem {
  id: string;
  label: string;
  icon: any;
}

interface UserUtilityProps {
  onViewMorePress?: () => void;
  onUtilityPress?: (utilityId: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
  onNavigateToCart?: () => void;
  onNavigateToChat?: () => void;
  onNavigateToNotifications?: () => void;
  navigation?: any;
}

const UserUtility: React.FC<UserUtilityProps> = ({
  onViewMorePress,
  onUtilityPress,
  onLogin,
  onRegister,
  onGoogleLogin,
  onFacebookLogin,
  onNavigateToCart,
  onNavigateToChat,
  onNavigateToNotifications,
  navigation,
}) => {
  const {isAuthenticated} = useAuth();
  const [showRequireAuth, setShowRequireAuth] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<'cart' | 'chat'>(
    'cart',
  );

  const utilities: UtilityItem[] = [
    {
      id: 'favorites',
      label: 'Yêu thích',
      icon: require('../../../assets/icons/Heart.png'),
    },
    {
      id: 'vouchers',
      label: 'Voucher',
      icon: require('../../../assets/icons/Voucher.png'),
    },
    {
      id: 'cart',
      label: 'Giỏ hàng',
      icon: require('../../../assets/icons/AddToCart.png'),
    },
  ];

  const handleUtilityPress = (utilityId: string) => {
    // Xử lý nút favorites - điều hướng đến WishList Screen
    if (utilityId === 'favorites') {
      if (!isAuthenticated) {
        setSelectedFeature('chat');
        setShowRequireAuth(true);
        return;
      }
      navigation?.navigate('WishList');
      return;
    }

    // Xử lý vouchers - không cần đăng nhập
    if (utilityId === 'vouchers') {
      onUtilityPress?.(utilityId);
      return;
    }

    // Xử lý giỏ hàng - yêu cầu đăng nhập
    if (utilityId === 'cart') {
      if (!isAuthenticated) {
        setSelectedFeature('cart');
        setShowRequireAuth(true);
        return;
      }
      onNavigateToCart?.();
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

  const renderUtilityItem = (item: UtilityItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.utilityButton}
        onPress={() => handleUtilityPress(item.id)}
        activeOpacity={0.7}>
        <View style={styles.utilityIconContainer}>
          <Image source={item.icon} style={styles.utilityIcon} />
        </View>
        <Text style={styles.utilityLabel}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Tiện ích của tôi</Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={onViewMorePress}
          activeOpacity={0.7}>
          <Text style={styles.viewMoreText}>Xem thêm tiện ích</Text>
          <Image
            source={require('../../../assets/icons/ArrowForward.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Utility Items Section */}
      <View style={styles.utilitiesContainer}>
        {utilities.map(renderUtilityItem)}
      </View>

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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
    marginRight: 4,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: '#33333',
  },
  utilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  utilityButton: {
    alignItems: 'center',
    width: '18%',
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 8,
  },
  utilityIconContainer: {
    marginBottom: 8,
  },
  utilityIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#333333',
  },
  utilityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});

export default UserUtility;
