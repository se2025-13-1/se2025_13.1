import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import TabBar from '../../../shared/Components/TabBar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Banner from '../components/Banner';
import Categories from '../components/Categories';

const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    // TODO: Navigate to respective screens based on tabId
    console.log('Tab pressed:', tabId);
  };

  const handleNotificationPress = () => {
    console.log('Notification pressed');
    // TODO: Navigate to notifications screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header Component */}
      <Header onNotificationPress={handleNotificationPress} />

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* SearchBar Component */}
        <SearchBar />

        {/* Banner Component */}
        <Banner />

        {/* Categories Component */}
        <Categories />

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Chào mừng đến với DoubleD Fashion</Text>
          <Text style={styles.subtitle}>
            Khám phá bộ sưu tập thời trang mới nhất!
          </Text>
          <Text style={styles.activeTabText}>Tab hiện tại: {activeTab}</Text>

          {/* Placeholder for other components */}
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Nội dung trang chủ sẽ được thêm vào đây
            </Text>
            <Text style={styles.placeholderSubtext}>• Banner quảng cáo</Text>
            <Text style={styles.placeholderSubtext}>• Danh mục sản phẩm</Text>
            <Text style={styles.placeholderSubtext}>• Sản phẩm nổi bật</Text>
            <Text style={styles.placeholderSubtext}>• Ưu đãi đặc biệt</Text>
          </View>
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
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  activeTabText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 30,
  },
  placeholder: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 15,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 5,
    paddingLeft: 10,
  },
});

export default HomeScreen;
