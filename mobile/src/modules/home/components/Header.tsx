import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';

interface HeaderProps {
  onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({onNotificationPress}) => {
  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      Alert.alert('Thông báo', 'Bạn có 0 thông báo mới');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.welcomeText}>Chào mùng đến với</Text>
        <Text style={styles.brandText}>DoubleD Fashion</Text>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={handleNotificationPress}
        activeOpacity={0.7}>
        <Image
          source={require('../../../assets/icons/Bell.png')}
          style={styles.bellIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
    marginBottom: 2,
  },
  brandText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
  },
  bellIcon: {
    width: 26,
    height: 26,
    tintColor: '#333',
  },
});

export default Header;
