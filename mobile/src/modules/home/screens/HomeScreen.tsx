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
import CartScreen from '../../cart/screens/CartScreen';
import ChatScreen from '../../chat/screens/ChatScreen';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'search') {
      navigation.navigate('SearchEntry' as never);
    } else if (tabId === 'cart') {
      setActiveTab('cart');
    } else if (tabId === 'messages') {
      // Navigate to Chat screen
      setActiveTab('messages');
    } else if (tabId === 'profile') {
      // Navigate to Profile screen (when created)
      setActiveTab('profile');
    } else {
      // TODO: Navigate to respective screens based on tabId
      console.log('Tab pressed:', tabId);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification' as never);
  };

  const handleLoginPress = () => {
    navigation.navigate('Login' as never);
  };

  const handleRegisterPress = () => {
    navigation.navigate('SignUp' as never);
  };

  const handleGoogleLoginPress = () => {
    console.log('Google login pressed');
    // Implement Google login logic
  };

  const handleFacebookLoginPress = () => {
    console.log('Facebook login pressed');
    // Implement Facebook login logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Render different screens based on active tab */}
      {activeTab === 'profile' ? (
        <ProfileScreen navigation={navigation} />
      ) : activeTab === 'cart' ? (
        <CartScreen onBackPress={() => setActiveTab('home')} />
      ) : activeTab === 'messages' ? (
        <ChatScreen
          navigation={navigation}
          onBackPress={() => setActiveTab('home')}
        />
      ) : (
        <>
          {/* Header Component */}
          <Header
            onNotificationPress={handleNotificationPress}
            onLogin={handleLoginPress}
            onRegister={handleRegisterPress}
            onGoogleLogin={handleGoogleLoginPress}
            onFacebookLogin={handleFacebookLoginPress}
          />

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
      <TabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onLogin={handleLoginPress}
        onRegister={handleRegisterPress}
        onGoogleLogin={handleGoogleLoginPress}
        onFacebookLogin={handleFacebookLoginPress}
      />
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
