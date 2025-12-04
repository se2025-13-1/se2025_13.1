import React from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import NotificationItem from './NotificationItem';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onItemPress?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onItemPress,
}) => {
  const handleItemPress = (notification: Notification) => {
    if (onItemPress) {
      onItemPress(notification);
    }
  };

  const renderNotification = ({item}: {item: Notification}) => (
    <NotificationItem
      id={item.id}
      title={item.title}
      description={item.description}
      timestamp={item.timestamp}
      onPress={() => handleItemPress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NotificationList;
