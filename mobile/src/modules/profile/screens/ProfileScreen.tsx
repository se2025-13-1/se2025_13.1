import React, {useState} from 'react';
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

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const [userProfile, setUserProfile] = useState({
    userName: 'Nguyễn Văn A',
    phoneNumber: '0987654321',
    avatarUrl: '',
  });

  const handleEditPress = () => {
    console.log('Edit avatar pressed');
    // TODO: Implement avatar edit functionality
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
    navigation?.navigate('Settings');
    // TODO: Implement settings navigation
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
