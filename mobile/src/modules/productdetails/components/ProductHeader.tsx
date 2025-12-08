import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';

interface ProductHeaderProps {
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  onBackPress,
  onSearchPress,
  onNotificationPress,
  searchValue = '',
  onSearchChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Image
          source={require('../../../assets/icons/Back.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={require('../../../assets/icons/Search.png')}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          placeholderTextColor="#999999"
          value={searchValue}
          onChangeText={onSearchChange}
          onFocus={onSearchPress}
        />
      </View>

      {/* Notification Button */}
      <TouchableOpacity
        onPress={onNotificationPress}
        style={styles.notificationButton}>
        <Image
          source={require('../../../assets/icons/Bell.png')}
          style={styles.notificationIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 2,
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: 8,
  },
  searchIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 8,
    tintColor: '#999999',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    padding: 0,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default ProductHeader;
