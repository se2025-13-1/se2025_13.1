import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {Image} from 'react-native';
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
  onFacebookLogin?: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabPress,
  onLogin,
  onRegister,
  onGoogleLogin,
  onFacebookLogin,
}) => {
  const {isAuthenticated} = useAuth();
  const [showRequireAuth, setShowRequireAuth] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<
    'chat' | 'notification' | 'cart'
  >('cart');
  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: require('../../assets/icons/Address.png'),
    },
    {
      id: 'search',
      label: 'Tìm kiếm',
      icon: require('../../assets/icons/Search.png'),
    },
    {
      id: 'cart',
      label: 'Giỏ hàng',
      icon: require('../../assets/icons/Cart.png'),
    },
    {
      id: 'messages',
      label: 'Tin nhắn',
      icon: require('../../assets/icons/Chat.png'),
    },
    {
      id: 'profile',
      label: 'Cá nhân',
      icon: require('../../assets/icons/UserIcon.png'),
    },
  ];

  const handleTabPress = (tabId: string) => {
    // Kiểm tra nếu là cart hoặc messages và người dùng chưa đăng nhập
    if ((tabId === 'cart' || tabId === 'messages') && !isAuthenticated) {
      const feature = tabId === 'cart' ? 'cart' : 'chat';
      setSelectedFeature(feature);
      setShowRequireAuth(true);
      return;
    }

    // Nếu đã đăng nhập hoặc không phải cart/messages, thực hiện navigation bình thường
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

  const handleFacebookLoginPress = () => {
    setShowRequireAuth(false);
    onFacebookLogin?.();
  };

  const renderTabItem = (tab: TabItem) => {
    const isActive = activeTab === tab.id;

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
          <Image
            source={tab.icon}
            style={[
              styles.tabIcon,
              isActive ? styles.activeTintColor : styles.inactiveTintColor,
            ]}
          />
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
        onFacebookLogin={handleFacebookLoginPress}
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
  tabIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeColor: {
    color: '#333',
  },
  inactiveColor: {
    color: '#333',
  },
  activeTintColor: {
    tintColor: '#333',
  },
  inactiveTintColor: {
    tintColor: '#333',
  },
});

export default TabBar;
