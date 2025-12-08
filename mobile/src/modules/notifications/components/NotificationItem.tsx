import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

interface NotificationItemProps {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  onPress?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  description,
  timestamp,
  onPress,
}) => {
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) {
      return '';
    }
    // timeStr format: "HH:mm" or "DD/MM/YYYY HH:mm" or "2 hours ago"
    return timeStr;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {truncateText(description)}
        </Text>
        {timestamp && (
          <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        )}
      </View>

      <Image
        source={require('../../../assets/icons/ArrowForward.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#999999',
  },
});

export default NotificationItem;
