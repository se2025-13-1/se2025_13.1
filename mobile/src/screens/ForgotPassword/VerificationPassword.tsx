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
} from 'react-native';

interface VerificationPasswordProps {
  onBack: () => void;
  onVerifyCode: (code: string) => void;
  email: string;
}

const VerificationPassword: React.FC<VerificationPasswordProps> = ({
  onBack,
  onVerifyCode,
  email,
}) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) {
      return; // Only allow single digit
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 4 digits are entered
    if (index === 3 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 4) {
        setTimeout(() => handleContinue(), 100);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      Alert.alert('Invalid Code', 'Please enter all 4 digits');
      return;
    }
    onVerifyCode(fullCode);
  };

  const handleResendCode = () => {
    setIsResending(true);
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email.',
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Enter 4 Digit Code</Text>
        <Text style={styles.subtitle}>
          Enter 4 digit code that you received on your email{' '}
          <Text style={styles.emailText}>{email}</Text>.
        </Text>

        {/* Code Input */}
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

        {/* Resend Code */}
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResendCode}
          disabled={isResending}>
          <Text style={styles.resendText}>
            Email not received?{' '}
            <Text style={styles.resendLink}>
              {isResending ? 'Sending...' : 'Resend code'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
