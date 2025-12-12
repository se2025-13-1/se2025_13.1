import React, {useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';

interface ChatScreenProps {
  navigation?: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({navigation}) => {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      text?: string;
      image?: string;
      sender: 'user' | 'other';
      timestamp?: string;
    }>
  >([
    {
      id: '1',
      text: 'Xin chào! Sản phẩm này có sẵn không?',
      sender: 'user',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'Có em, sản phẩm còn hàng. Em cần thêm thông tin gì không?',
      sender: 'other',
      timestamp: '10:32 AM',
    },
    {
      id: '3',
      image: 'https://via.placeholder.com/300x200/cccccc/666666?text=Sản+phẩm',
      sender: 'other',
      timestamp: '10:33 AM',
    },
    {
      id: '4',
      text: 'Đây là hình sản phẩm, bạn thích không?',
      sender: 'other',
      timestamp: '10:33 AM',
    },
    {
      id: '5',
      text: 'Đẹp lắm! Giá bao nhiêu hả anh?',
      sender: 'user',
      timestamp: '10:35 AM',
    },
  ]);

  const handleBackPress = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Home');
    }
  };

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      const newMessage = {
        id: (messages.length + 1).toString(),
        text: message,
        sender: 'user' as const,
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages([...messages, newMessage]);
      // TODO: Gọi API để lưu message
    }
  };

  const handleImagePress = () => {
    console.log('Image button pressed - mở camera hoặc thư viện ảnh');
    // TODO: Tích hợp react-native-image-picker hoặc ImagePickerIOS/DocumentPickerAndroid
  };

  return (
    <View style={styles.container}>
      {/* Chat Header */}
      <ChatHeader onBackPress={handleBackPress} />

      {/* Messages List */}
      <ScrollView
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}>
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            text={message.text}
            image={message.image}
            sender={message.sender}
            timestamp={message.timestamp}
          />
        ))}
      </ScrollView>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onImagePress={handleImagePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
});

export default ChatScreen;
