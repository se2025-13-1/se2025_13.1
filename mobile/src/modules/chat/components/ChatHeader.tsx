import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface ChatHeaderProps {
  onBackPress?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({onBackPress}) => {
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

        {/* Tiêu đề Chat ở giữa */}
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Chat</Text>
        </View>

        {/* Placeholder bên phải để cân bằng */}
        <View style={styles.rightPlaceholder} />
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  rightPlaceholder: {
    width: 40,
  },
});

export default ChatHeader;
