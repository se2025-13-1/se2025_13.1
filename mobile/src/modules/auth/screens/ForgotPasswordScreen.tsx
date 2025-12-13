import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {AuthApi} from '../services/authApi';

interface Props {
  onBack: () => void;
  onSendCode: (email: string) => void;
}

const ForgotPasswordScreen: React.FC<Props> = ({onBack, onSendCode}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailInput: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await AuthApi.sendResetCode(email);
      onSendCode(email);
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi gửi mã');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Quên mật khẩu</Text>

      <TextInput
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        onPress={handleSendCode}
        disabled={isLoading}
        style={styles.sendButton}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.sendButtonText}>Gửi mã</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '400',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ForgotPasswordScreen;
