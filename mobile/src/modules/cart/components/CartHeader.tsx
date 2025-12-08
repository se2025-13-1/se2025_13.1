import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface CartHeaderProps {
  cartCount?: number;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = ({
  cartCount = 0,
  onNotificationPress,
  onBackPress,
}) => {
  const navigation = useNavigation<any>();

  const handleBackPress = () => {
    // Nếu có callback từ parent, dùng nó
    if (onBackPress) {
      onBackPress();
      return;
    }

    // Nếu không có callback, cố gắng goBack
    if (navigation.canGoBack?.()) {
      navigation.goBack();
    } else {
      // Nếu không thể goBack, navigate về Home
      try {
        navigation.navigate('Home');
      } catch (error) {
        console.log('Không thể navigate về Home');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Nút Back bên trái */}
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Tiêu đề Giỏ hàng ở giữa */}
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Giỏ hàng</Text>
        </View>

        {/* Nút Thông báo bên phải */}
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.notificationButton}>
          <Image
            source={require('../../../assets/icons/Bell.png')}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -30,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatButton: {
    padding: 8,
    marginRight: -8,
  },
  notificationButton: {
    padding: 8,
    marginRight: -8,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  chatIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default CartHeader;
