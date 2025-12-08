import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

interface NotificationHeaderProps {
  title?: string;
  onBackPress?: () => void;
  onChatPress?: () => void;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  title,
  onBackPress,
  onChatPress,
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    }
  };

  const handleChatPress = () => {
    if (onChatPress) {
      onChatPress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}>
        <Image
          source={require('../../../assets/icons/Back.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <Text style={styles.title}>{title || 'Thông báo'}</Text>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={handleChatPress}
        activeOpacity={0.7}>
        <Image
          source={require('../../../assets/icons/Chat.png')}
          style={styles.chatIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#333',
  },
  title: {
    fontSize: 23,
    fontWeight: '400',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  chatButton: {
    padding: 8,
    borderRadius: 20,
  },
  chatIcon: {
    width: 28,
    height: 28,
    tintColor: '#333',
  },
});

export default NotificationHeader;
