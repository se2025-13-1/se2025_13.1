import React, {useState} from 'react';
import {StyleSheet, StatusBar, SafeAreaView, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TabBar from '../../../shared/Components/TabBar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Banner from '../components/Banner';
import Categories from '../components/Categories';
import ProductList from '../components/ProductList';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    if (tabId === 'search') {
      navigation.navigate('SearchEntry' as never);
    } else {
      setActiveTab(tabId);
      // TODO: Navigate to respective screens based on tabId
      console.log('Tab pressed:', tabId);
    }
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

        {/* ProductList Component - Bán chạy */}
        <ProductList
          categoryTitle="Bán chạy"
          onSeeMorePress={() => console.log('Navigate to best sellers')}
        />

        {/* ProductList Component - Sản phẩm mới */}
        <ProductList
          categoryTitle="Sản phẩm mới"
          onSeeMorePress={() => console.log('Navigate to new products')}
        />
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
});

export default HomeScreen;
