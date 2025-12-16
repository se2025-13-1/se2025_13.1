import React, {useState} from 'react';
import {Alert} from 'react-native';
import {useAuth} from '../../../contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import RequireAuth from '../../auth/components/RequireAuth';

interface SettingScreenProps {
  navigation?: any;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  section: string;
}

const SETTING_ITEMS: SettingItem[] = [
  // Tài khoản section
  {id: '1', title: 'Tài khoản', section: 'account'},
  {id: '2', title: 'Tài khoản & Bảo mật', section: 'account'},
  {id: '3', title: 'Địa Chỉ', section: 'account'},
  {id: '4', title: 'Tài khoản / Thẻ Ngân hàng', section: 'account'},

  // Cài đặt section
  {id: '5', title: 'Cài đặt', section: 'settings'},
  {id: '7', title: 'Cài đặt Thông báo', section: 'settings'},
  {
    id: '10',
    title: 'Language / Ngôn ngữ',
    subtitle: 'Tiếng Việt',
    section: 'settings',
  },

  // Hỗ trợ section
  {id: '11', title: 'Hỗ trợ', section: 'support'},
  {id: '12', title: 'Trung tâm hỗ trợ', section: 'support'},
  {id: '13', title: 'Tiêu chuẩn cộng đồng', section: 'support'},
  {id: '14', title: 'Điều Khoản Shopee', section: 'support'},
];

const SettingScreen: React.FC<SettingScreenProps> = ({navigation}) => {
  const {logout, isAuthenticated} = useAuth();
  const [requireAuthVisible, setRequireAuthVisible] = useState(false);

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleSettingPress = (itemId: string, title: string) => {
    console.log(`Setting pressed: ${itemId} - ${title}`);

    // Account-related items that require authentication
    const accountItems = ['2', '3', '4'];

    if (accountItems.includes(itemId)) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        setRequireAuthVisible(true);
        return;
      }

      // Navigate to appropriate screen based on itemId
      switch (itemId) {
        case '2':
          // Tài khoản & Bảo mật
          navigation?.navigate('AccountSecurity');
          break;
        case '3':
          // Địa Chỉ - Navigate to AddressList instead of AddAddress
          navigation?.navigate('AddressList');
          break;
        case '4':
          // Tài khoản / Thẻ Ngân hàng
          navigation?.navigate('PaymentMethod');
          break;
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            // Logout using context
            await logout();
            console.log('✅ Logged out successfully');

            // Navigate back to Home screen
            navigation?.reset({
              index: 0,
              routes: [{name: 'Home'}],
            });
          } catch (error) {
            console.error('❌ Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDeleteAccount = () => {
    console.log('Delete account pressed');
    // TODO: Implement delete account logic
  };

  const renderSectionHeader = (sectionTitle: string) => (
    <Text style={styles.sectionHeader}>{sectionTitle}</Text>
  );

  const renderSettingItem = (item: SettingItem, isLast: boolean) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, isLast && styles.lastItem]}
      onPress={() => handleSettingPress(item.id, item.title)}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <Image
        source={require('../../../assets/icons/ArrowForward.png')}
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  );

  const renderSectionItems = (section: string, items: SettingItem[]) => {
    const sectionItems = items.filter(item => item.section === section);
    const firstItem = sectionItems[0];

    if (sectionItems.length === 0) return null;

    return (
      <View key={section} style={styles.section}>
        {firstItem.title && renderSectionHeader(firstItem.title)}
        {sectionItems
          .slice(1)
          .map((item, index) =>
            renderSettingItem(item, index === sectionItems.length - 2),
          )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {renderSectionItems('account', SETTING_ITEMS)}
        {renderSectionItems('settings', SETTING_ITEMS)}
        {renderSectionItems('support', SETTING_ITEMS)}

        {/* Delete Account Button */}
        <View style={styles.deleteAccountSection}>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}>
            <Image
              source={require('../../../assets/icons/Trash.png')}
              style={styles.deleteAccountIcon}
            />
            <Text style={styles.deleteAccountText}>Xóa tài khoản</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Image
              source={require('../../../assets/icons/Logout.png')}
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Require Auth Modal */}
      <RequireAuth
        visible={requireAuthVisible}
        onClose={() => setRequireAuthVisible(false)}
        feature="cart"
        onLogin={() => {
          setRequireAuthVisible(false);
          navigation?.navigate('Login');
        }}
        onRegister={() => {
          setRequireAuthVisible(false);
          navigation?.navigate('SignUp');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '400',
    color: '#000000',
    marginLeft: 7,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#999999',
  },
  chevronIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginLeft: 12,
  },
  deleteAccountSection: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  deleteAccountIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4444',
  },
  logoutSection: {
    marginTop: 0,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4444',
  },
});

export default SettingScreen;
