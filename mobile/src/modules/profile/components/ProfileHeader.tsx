import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';

interface ProfileHeaderProps {
  userName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  onEditPress?: () => void;
  onSettingsPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName = 'Người dùng',
  phoneNumber = '0123456789',
  avatarUrl,
  onEditPress,
  onSettingsPress,
}) => {
  return (
    <View style={styles.container}>
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
};

const styles = StyleSheet.create({
  container: {
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
});

export default ProfileHeader;
