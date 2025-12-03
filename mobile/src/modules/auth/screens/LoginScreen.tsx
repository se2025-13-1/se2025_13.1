import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';

interface LoginScreenProps {
  onBack: () => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (emailInput: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailInput);
  };

  const handleLogin = () => {
    const newErrors: {[key: string]: string} = {};

    // Validation
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);

    // If no errors, show success
    if (Object.keys(newErrors).length === 0) {
      setIsSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          Alert.alert('Success', 'Login successful!', [
            {text: 'OK', onPress: onBack},
          ]);
        }
      }, 1500);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert(
        'Forgot Password',
        'Password reset functionality coming soon!',
      );
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      Alert.alert('Sign Up', 'Redirecting to Sign Up screen...');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Login to your account</Text>
        <Text style={styles.subtitle}>It's great to see you again.</Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
                isSuccess && !errors.email && styles.inputSuccess,
              ]}
              placeholder="Enter your email address"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) {
                  const newErrors = {...errors};
                  delete newErrors.email;
                  setErrors(newErrors);
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            {isSuccess && !errors.email && email && (
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.password && styles.inputError,
                  isSuccess && !errors.password && styles.inputSuccess,
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
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            {isSuccess && !errors.password && password && (
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>
              Forgot your password?{' '}
              <Text style={styles.linkText}>Reset your password</Text>
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isSuccess && styles.loginButtonSuccess]}
            onPress={handleLogin}
            disabled={isSuccess}>
            <Text
              style={[
                styles.loginButtonText,
                isSuccess && styles.loginButtonTextSuccess,
              ]}>
              {isSuccess ? 'Login Successful!' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Google')}>
            <Text style={styles.socialButtonText}>📧 Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.facebookButton}
            onPress={() => handleSocialLogin('Facebook')}>
            <Text style={styles.facebookButtonText}>
              📘 Login with Facebook
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity style={styles.signUpLink} onPress={handleSignUp}>
            <Text style={styles.signUpLinkText}>
              Don't have an account? <Text style={styles.linkText}>Join</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
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
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  inputSuccess: {
    borderColor: '#00AA44',
    backgroundColor: '#F5FFF5',
    paddingRight: 50,
  },
  passwordContainer: {
    position: 'relative',
  },
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
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
  },
  successIcon: {
    position: 'absolute',
    right: 16,
    top: 42,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00AA44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#666666',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonSuccess: {
    backgroundColor: '#000000',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  loginButtonTextSuccess: {
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  facebookButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  signUpLink: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  signUpLinkText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default LoginScreen;
