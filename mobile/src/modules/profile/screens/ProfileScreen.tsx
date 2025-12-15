import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import ProfileHeader from '../components/ProfileHeader';
import MyOder from '../components/MyOder';
import UserUtility from '../components/UserUtility';
import {useAuth} from '../../../contexts/AuthContext';

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {isAuthenticated, user} = useAuth();
  const [userProfile, setUserProfile] = useState({
    userName: 'Người dùng',
    phoneNumber: '',
    avatarUrl: '',
  });

  // Update profile when auth state or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User data:', user); // Debug log
      // Backend returns full_name, also check fullName for fallback
      let displayName = user.fullName || user.full_name || user.name;
      if (!displayName && user.email) {
        displayName = user.email.split('@')[0];
      }

      setUserProfile({
        userName: displayName || 'Người dùng',
        phoneNumber: user.phone || user.phoneNumber || '',
        avatarUrl: user.avatarUrl || user.avatar_url || '',
      });
    } else {
      setUserProfile({
        userName: 'Người dùng',
        phoneNumber: '',
        avatarUrl: '',
      });
    }
  }, [isAuthenticated, user]);

  const handleEditPress = () => {
    console.log('Edit avatar pressed');
    navigation?.navigate('EditProfile');
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
    navigation?.navigate('Settings');
    // TODO: Implement settings navigation
  };

  const handleCartPress = () => {
    console.log('Cart pressed');
    // TODO: Navigate to cart screen
  };

  const handleChatPress = () => {
    console.log('Chat pressed');
    // TODO: Navigate to chat screen
  };

  const handleLoginPress = () => {
    console.log('Login pressed');
    navigation?.navigate('Login');
  };

  const handleSignUpPress = () => {
    console.log('Sign up pressed');
    navigation?.navigate('SignUp');
  };

  const handleViewHistoryPress = () => {
    console.log('View order history pressed');
    // TODO: Navigate to order history screen
  };

  const handleOrderStatusPress = (statusId: string) => {
    console.log('Order status pressed:', statusId);
    // TODO: Navigate to orders filtered by status
  };

  const handleViewMoreUtilitiesPress = () => {
    console.log('View more utilities pressed');
    // TODO: Navigate to all utilities screen
  };

  const handleUtilityPress = (utilityId: string) => {
    console.log('Utility pressed:', utilityId);
    // TODO: Navigate to utility details
  };

  const handleGoogleLoginPress = () => {
    console.log('Google login pressed');
    // TODO: Implement Google login
  };

  const handleFacebookLoginPress = () => {
    console.log('Facebook login pressed');
    // TODO: Implement Facebook login
  };

  const handleNavigateToCart = () => {
    console.log('Navigate to cart');
    // TODO: Navigate to cart screen
  };

  const handleNavigateToChat = () => {
    console.log('Navigate to chat');
    // TODO: Navigate to chat screen
  };

  const handleNavigateToNotifications = () => {
    console.log('Navigate to notifications');
    // TODO: Navigate to notifications screen
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader
          userName={userProfile.userName}
          phoneNumber={userProfile.phoneNumber}
          avatarUrl={userProfile.avatarUrl}
          onEditPress={handleEditPress}
          onSettingsPress={handleSettingsPress}
          onCartPress={handleCartPress}
          onChatPress={handleChatPress}
          isAuthenticated={isAuthenticated}
          onLoginPress={handleLoginPress}
          onSignUpPress={handleSignUpPress}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* My Orders Component */}
        <MyOder
          onViewHistoryPress={handleViewHistoryPress}
          onStatusPress={handleOrderStatusPress}
        />

        {/* Divider */}
        <View style={styles.separator} />

        {/* User Utility Component */}
        <UserUtility
          onViewMorePress={handleViewMoreUtilitiesPress}
          onUtilityPress={handleUtilityPress}
          onLogin={handleLoginPress}
          onRegister={handleSignUpPress}
          onGoogleLogin={handleGoogleLoginPress}
          onFacebookLogin={handleFacebookLoginPress}
          onNavigateToCart={handleNavigateToCart}
          onNavigateToChat={handleNavigateToChat}
          onNavigateToNotifications={handleNavigateToNotifications}
        />
      </ScrollView>
    </View>
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
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  separator: {
    height: 8,
    backgroundColor: '#F5F5F5',
  },
});

export default ProfileScreen;
