// src/modules/auth/screens/ResetPassword.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {AuthApi} from '../services/authApi';

interface ResetPasswordProps {
  email: string;
  otp: string;
  onBack: () => void;
  onPasswordReset: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({
  email,
  otp,
  onBack,
  onPasswordReset,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // THÊM LOADING

  const validatePassword = (passwordInput: string) => {
    return passwordInput.length >= 6;
  };

  const handleContinue = async () => {
    const newErrors: {[key: string]: string} = {};

    // Validation
    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    // Nếu có lỗi → dừng
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // GỌI API THỰC TẾ
    setIsLoading(true);
    try {
      await AuthApi.resetPassword(email, otp, password);
      setShowSuccessModal(true);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onPasswordReset(); // Về Login
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Set the new password for your account.
        </Text>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.password && styles.inputError,
              ]}
              placeholder="Enter your password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) {
                  const newErrors = {...errors};
                  delete newErrors.password;
                  setErrors(newErrors);
                }
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>
                {showPassword ? 'Open Eye' : 'Closed Eye'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Confirm your password"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  const newErrors = {...errors};
                  delete newErrors.confirmPassword;
                  setErrors(newErrors);
                }
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? 'Open Eye' : 'Closed Eye'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Text style={styles.checkMark}>Checkmark</Text>
            </View>
            <Text style={styles.successTitle}>Password Changed!</Text>
            <Text style={styles.successSubtitle}>
              You can now use your new password to login.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSuccessModalClose}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// === STYLES (giữ nguyên như cũ) ===
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20},
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {fontSize: 24, color: '#000000', fontWeight: '400'},
  content: {flex: 1, paddingHorizontal: 24, paddingTop: 20},
  title: {fontSize: 32, fontWeight: 'bold', color: '#000000', marginBottom: 16},
  subtitle: {fontSize: 16, color: '#666666', lineHeight: 24, marginBottom: 40},
  inputContainer: {marginBottom: 24},
  label: {fontSize: 16, fontWeight: '500', color: '#000000', marginBottom: 8},
  passwordContainer: {position: 'relative'},
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {borderColor: '#FF4444', backgroundColor: '#FFF5F5'},
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    bottom: 16,
    justifyContent: 'center',
  },
  eyeIcon: {fontSize: 18},
  errorText: {fontSize: 12, color: '#FF4444', marginTop: 4},
  continueButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {fontSize: 16, fontWeight: '600', color: '#FFFFFF'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 320,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00AA44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkMark: {fontSize: 40, color: '#FFFFFF', fontWeight: 'bold'},
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ResetPassword;
