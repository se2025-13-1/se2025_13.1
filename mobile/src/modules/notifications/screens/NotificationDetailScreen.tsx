import React from 'react';
import {
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  View,
  Text,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import TabBar from '../../../shared/Components/TabBar';
import NotificationHeader from '../components/NotificationHeader';

interface NotificationDetailParams {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

const NotificationDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as NotificationDetailParams;
  const [activeTab, setActiveTab] = React.useState('notification');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleChatPress = () => {
    console.log('Chat pressed from notification detail header');
    // TODO: Navigate to chat screen
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

      {/* Header Component with Dynamic Title */}
      <NotificationHeader
        title={params?.title}
        onBackPress={handleBackPress}
        onChatPress={handleChatPress}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>{params?.description}</Text>
        </View>
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
});

export default NotificationDetailScreen;
