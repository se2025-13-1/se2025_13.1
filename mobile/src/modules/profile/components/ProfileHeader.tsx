import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';

interface ProfileHeaderProps {
  userName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  onEditPress?: () => void;
  onSettingsPress?: () => void;
  onCartPress?: () => void;
  onChatPress?: () => void;
  isAuthenticated?: boolean;
  onLoginPress?: () => void;
  onSignUpPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName = 'Người dùng',
  phoneNumber = '0123456789',
  avatarUrl,
  onEditPress,
  onSettingsPress,
  onCartPress,
  onChatPress,
  isAuthenticated = false,
  onLoginPress,
  onSignUpPress,
}) => {
  // Authenticated User Layout
  if (isAuthenticated) {
    return (
      <View style={styles.authenticatedContainer}>
        {/* Left Section - Avatar and User Info */}
        <View style={styles.leftSection}>
          {/* Avatar Container */}
          <View style={styles.avatarContainer}>
            <Image
              source={
                avatarUrl
                  ? {uri: avatarUrl}
                  : require('../../../assets/icons/UserIcon.png')
              }
              style={styles.avatar}
            />
            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditPress}
              activeOpacity={0.7}>
              <Image
                source={require('../../../assets/icons/Edit.png')}
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </View>
        </View>

        {/* Right Section - Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
          activeOpacity={0.7}>
          <Image
            source={require('../../../assets/icons/Settings.png')}
            style={styles.settingsIcon}
          />
          <Text style={styles.settingsLabel}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Not Authenticated Layout
  return (
    <View style={styles.unauthenticatedContainer}>
      {/* Top Section - Notification Text */}
      <View style={styles.notificationSection}>
        <Text style={styles.notificationText}>
          Đăng nhập, có hỏi ưu đãi cho đơn đầu!
        </Text>
      </View>

      {/* Bottom Section - Login/SignUp Buttons and Settings */}
      <View style={styles.buttonSection}>
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.loginButtonUnauth}
            onPress={onLoginPress}
            activeOpacity={0.7}>
            <Text style={styles.loginButtonTextUnauth}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpButtonUnauth}
            onPress={onSignUpPress}
            activeOpacity={0.7}>
            <Text style={styles.signUpButtonTextUnauth}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButtonUnauth}
          onPress={onSettingsPress}
          activeOpacity={0.7}>
          <Image
            source={require('../../../assets/icons/Settings.png')}
            style={styles.settingsIconUnauth}
          />
          <Text style={styles.settingsLabelUnauth}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ========== Authenticated Styles ==========
  authenticatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#e1c7cbff',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  editIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666666',
  },
  settingsButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  settingsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },

  // ========== Unauthenticated Styles ==========
  unauthenticatedContainer: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  notificationSection: {
    marginBottom: 12,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  buttonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  loginButtonUnauth: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#E91E63',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonTextUnauth: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signUpButtonUnauth: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonTextUnauth: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  settingsButtonUnauth: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  settingsIconUnauth: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  settingsLabelUnauth: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333333',
  },
});

export default ProfileHeader;
