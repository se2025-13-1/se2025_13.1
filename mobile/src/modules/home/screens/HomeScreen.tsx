import React, {useState} from 'react';
import {
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TabBar from '../../../shared/Components/TabBar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Banner from '../components/Banner';
import Categories from '../components/Categories';
import ProductList from '../components/ProductList';
import ProfileScreen from '../../profile/screens/ProfileScreen';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'search') {
      navigation.navigate('SearchEntry' as never);
    } else if (tabId === 'messages') {
      // Navigate to Messages screen (when created)
      console.log('Navigate to Messages');
    } else if (tabId === 'profile') {
      // Navigate to Profile screen (when created)
      console.log('Navigate to Profile');
    } else {
      // TODO: Navigate to respective screens based on tabId
      console.log('Tab pressed:', tabId);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Render different screens based on active tab */}
      {activeTab === 'profile' ? (
        <ProfileScreen navigation={navigation} />
      ) : (
        <>
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
              navigation={navigation}
            />

            {/* ProductList Component - Sản phẩm mới */}
            <ProductList
              categoryTitle="Sản phẩm mới"
              onSeeMorePress={() => console.log('Navigate to new products')}
              navigation={navigation}
            />
          </ScrollView>
        </>
      )}

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
