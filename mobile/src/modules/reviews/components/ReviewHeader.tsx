import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

interface ReviewHeaderProps {
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  onBackPress,
  onNotificationPress,
  notificationCount = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Section - Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        activeOpacity={0.7}>
        <Image
          source={require('../../../assets/icons/Back.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* Center Section - Title */}
      <Text style={styles.title}>Đánh giá</Text>

      {/* Right Section - Notification Button */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationPress}
        activeOpacity={0.7}>
        <Image
          source={require('../../../assets/icons/Bell.png')}
          style={styles.notificationIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
    textAlign: 'left',
    marginLeft: 12,
  },
  notificationButton: {
    padding: 8,
    marginRight: -8,
    marginLeft: 'auto',
    position: 'relative',
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default ReviewHeader;
