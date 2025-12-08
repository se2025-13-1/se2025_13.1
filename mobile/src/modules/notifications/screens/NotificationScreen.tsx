import React, {useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  View,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TabBar from '../../../shared/Components/TabBar';
import NotificationHeader from '../components/NotificationHeader';
import NotificationList from '../components/NotificationList';

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('notification');

  // Sample notification data
  const [notifications] = useState([
    {
      id: '1',
      title: '30% Special Discount!',
      description:
        'Special promotion only valid today. Limited time offer for you!',
      timestamp: '10:30 AM - Today',
    },
    {
      id: '2',
      title: 'New Arrival',
      description:
        'Check out our latest collection of fashion items now available in store.',
      timestamp: '2 hours ago',
    },
    {
      id: '3',
      title: 'Order Confirmed',
      description:
        'Your order has been confirmed and will be shipped within 24 hours.',
      timestamp: '04/12/2024 - 2:15 PM',
    },
    {
      id: '4',
      title: 'Delivery Update',
      description:
        'Your package is on the way and will arrive tomorrow morning.',
      timestamp: '03/12/2024 - 8:45 PM',
    },
  ]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleChatPress = () => {
    console.log('Chat pressed from notification header');
    // TODO: Navigate to chat screen
  };

  const handleNotificationPress = (notification: any) => {
    (navigation as any).navigate('NotificationDetail', {
      id: notification.id,
      title: notification.title,
      description: notification.description,
      timestamp: notification.timestamp,
    });
  };

  const handleTabPress = (tabId: string) => {
    if (tabId === 'search') {
      navigation.navigate('SearchEntry' as never);
    } else if (tabId === 'home') {
      navigation.navigate('Home' as never);
    } else {
      setActiveTab(tabId);
      console.log('Tab pressed:', tabId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header Component */}
      <NotificationHeader
        onBackPress={handleBackPress}
        onChatPress={handleChatPress}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          <NotificationList
            notifications={notifications}
            onItemPress={handleNotificationPress}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
});

export default NotificationScreen;
