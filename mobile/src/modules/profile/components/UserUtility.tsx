import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../../contexts/AuthContext';
import RequireAuth from '../../auth/components/RequireAuth';
import {Heart, Ticket, ShoppingCart, ChevronRight} from 'lucide-react-native';

interface UtilityItem {
  id: string;
  label: string;
  icon: typeof Heart;
}

interface UserUtilityProps {
  onViewMorePress?: () => void;
  onUtilityPress?: (utilityId: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onGoogleLogin?: () => void;
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
  onNavigateToCart,
  onNavigateToChat,
  onNavigateToNotifications,
  navigation: navProp,
}) => {
  const navigation = useNavigation<any>();
  const {isAuthenticated} = useAuth();
  const [showRequireAuth, setShowRequireAuth] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<'cart' | 'chat'>(
    'cart',
  );

  const utilities: UtilityItem[] = [
    {
      id: 'favorites',
      label: 'Yêu thích',
      icon: Heart,
    },
    {
      id: 'vouchers',
      label: 'Voucher',
      icon: Ticket,
    },
    {
      id: 'cart',
      label: 'Giỏ hàng',
      icon: ShoppingCart,
    },
  ];

  const handleUtilityPress = (utilityId: string) => {
    console.log('🎯 UserUtility.handleUtilityPress called with:', utilityId);
    // Xử lý nút favorites - điều hướng đến WishList Screen
    if (utilityId === 'favorites') {
      if (!isAuthenticated) {
        setSelectedFeature('chat');
        setShowRequireAuth(true);
        return;
      }
      console.log('📍 Navigating to WishList');
      navigation.navigate('WishList');
      return;
    }

    // Xử lý vouchers - điều hướng đến VoucherScreen
    if (utilityId === 'vouchers') {
      console.log('🎫 Navigating to Voucher screen from UserUtility');
      navigation.navigate('Voucher');
      return;
    }

    // Xử lý giỏ hàng - yêu cầu đăng nhập
    if (utilityId === 'cart') {
      console.log('🛒 Navigating to Cart screen');
      if (!isAuthenticated) {
        setSelectedFeature('cart');
        setShowRequireAuth(true);
        return;
      }
      navigation.navigate('Cart');
      return;
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

  const renderUtilityItem = (item: UtilityItem) => {
    const IconComponent = item.icon;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.utilityButton}
        onPress={() => handleUtilityPress(item.id)}
        activeOpacity={0.7}>
        <View style={styles.utilityIconContainer}>
          <IconComponent size={40} color="#333333" />
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
          <ChevronRight size={16} color="#333333" />
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
  utilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  utilityButton: {
    alignItems: 'center',
    width: '18%',
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 8,
    marginRight: 16,
  },
  utilityIconContainer: {
    marginBottom: 8,
  },
  utilityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
});

export default UserUtility;
