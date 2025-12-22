import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {Home, Search, ShoppingCart, User} from 'lucide-react-native';
import {useAuth} from '../../contexts/AuthContext';
import RequireAuth from '../../modules/auth/components/RequireAuth';

interface TabItem {
  id: string;
  label: string;
  icon: any;
}

interface TabBarProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onGoogleLogin?: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabPress,
  onLogin,
  onRegister,
  onGoogleLogin,
}) => {
  const {isAuthenticated} = useAuth();
  const [showRequireAuth, setShowRequireAuth] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<
    'notification' | 'cart'
  >('cart');
  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'search',
      label: 'Tìm kiếm',
      icon: Search,
    },
    {
      id: 'cart',
      label: 'Giỏ hàng',
      icon: ShoppingCart,
    },
    {
      id: 'profile',
      label: 'Cá nhân',
      icon: User,
    },
  ];

  const handleTabPress = (tabId: string) => {
    // Kiểm tra nếu là cart và người dùng chưa đăng nhập
    if (tabId === 'cart' && !isAuthenticated) {
      setSelectedFeature('cart');
      setShowRequireAuth(true);
      return;
    }

    // Nếu đã đăng nhập hoặc không phải cart, thực hiện navigation bình thường
    onTabPress(tabId);
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

  const renderTabItem = (tab: TabItem) => {
    const isActive = activeTab === tab.id;
    const IconComponent = tab.icon;

    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tabItem}
        onPress={() => handleTabPress(tab.id)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.iconContainer,
            isActive && styles.activeIconContainer,
          ]}>
          <IconComponent color={isActive ? '#007AFF' : '#8E8E93'} size={24} />
        </View>
        <Text
          style={[
            styles.tabLabel,
            isActive ? styles.activeColor : styles.inactiveColor,
          ]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>{tabs.map(renderTabItem)}</View>

      {/* RequireAuth Modal */}
      <RequireAuth
        visible={showRequireAuth}
        onClose={handleCloseRequireAuth}
        feature={selectedFeature}
        onLogin={handleLoginPress}
        onRegister={handleRegisterPress}
        onGoogleLogin={handleGoogleLoginPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeColor: {
    color: '#007AFF',
  },
  inactiveColor: {
    color: '#8E8E93',
  },
});

export default TabBar;
