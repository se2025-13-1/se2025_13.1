// src/modules/auth/screens/VerificationPassword.tsx
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {AuthApi} from '@services/authApi';

interface VerificationPasswordProps {
  onBack: () => void;
  onVerifyCode: (code: string) => void; // Truyền 6 số OTP
  email: string;
}

const VerificationPassword: React.FC<VerificationPasswordProps> = ({
  onBack,
  onVerifyCode,
  email,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']); // 6 ô
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Focus ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tự động submit khi đủ 6 số
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        setTimeout(() => handleContinue(), 100);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ 6 số');
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.verifyOTP(email, fullCode); // GỌI API
      onVerifyCode(fullCode); // Truyền 6 số OTP
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Mã OTP không hợp lệ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await AuthApi.sendResetCode(email);
      Alert.alert('Đã gửi lại', 'Mã OTP mới đã được gửi đến email của bạn');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Nhập mã OTP</Text>
        <Text style={styles.subtitle}>
          Vui lòng nhập mã 6 chữ số đã được gửi đến email:{' '}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        {/* 6 ô OTP */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={value => handleCodeChange(value, index)}
              onKeyPress={({nativeEvent}) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        {/* Resend */}
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResendCode}
          disabled={isResending}>
          <Text style={styles.resendText}>
            Chưa nhận được mã?{' '}
            <Text style={styles.resendLink}>
              {isResending ? 'Đang gửi...' : 'Gửi lại'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 40,
  },
  emailText: {
    color: '#000000',
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  codeInputFilled: {
    borderColor: '#000000',
    backgroundColor: '#F8F8F8',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
  },
  resendLink: {
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default VerificationPassword;
