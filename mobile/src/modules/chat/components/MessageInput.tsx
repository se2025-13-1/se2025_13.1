import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onImagePress?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onImagePress,
}) => {
  const [messageText, setMessageText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSendPress = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleImagePress = () => {
    if (onImagePress) {
      onImagePress();
    } else {
      Alert.alert('Upload', 'Chuyển tới chọn ảnh từ thư viện hoặc camera');
    }
  };

  const isMessageValid = messageText.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        {/* Icon gửi ảnh */}
        <TouchableOpacity onPress={handleImagePress} style={styles.iconButton}>
          <Image
            source={require('../../../assets/icons/Camera.png')}
            style={styles.icon}
          />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#CCCCCC"
          value={messageText}
          onChangeText={setMessageText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          maxLength={500}
        />

        {/* Nút gửi */}
        <TouchableOpacity
          onPress={handleSendPress}
          disabled={!isMessageValid}
          style={[
            styles.sendButton,
            !isMessageValid && styles.sendButtonDisabled,
          ]}>
          <Image
            source={require('../../../assets/icons/Send.png')}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  containerFocused: {
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#666666',
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    fontSize: 14,
    color: '#000000',
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#007AFF',
  },
});

export default MessageInput;
