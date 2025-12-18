import React, {useState} from 'react';
import {AppConfig} from '../../../config/AppConfig';
import {saveTokens, saveUser} from '../../../services/tokenService';
import {useAuth} from '../../../contexts/AuthContext';
import {FirebaseGoogleService} from '../../../services/firebaseGoogleService';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
  Image,
} from 'react-native';

interface SignUpScreenProps {
  onBack: () => void;
  onLogin?: () => void;
  _onVerify?: (email: string) => void;
  onLoginSuccess?: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onBack,
  onLogin,
  _onVerify,
  onLoginSuccess,
}) => {
  const {setUser, setIsAuthenticated} = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const validateEmail = (emailInput: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailInput);
  };

  const validatePassword = (passwordInput: string) => {
    return passwordInput.length >= 6;
  };

  const isFormValid = () => {
    return (
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      validateEmail(email) &&
      password.trim().length > 0 &&
      validatePassword(password) &&
      confirmPassword.trim().length > 0 &&
      password === confirmPassword
    );
  };

  const isFullNameValid = () => {
    return fullName.trim().length > 0;
  };

  const isEmailValid = () => {
    return email.trim().length > 0 && validateEmail(email);
  };

  const isPasswordValid = () => {
    return password.trim().length > 0 && validatePassword(password);
  };

  const isConfirmPasswordValid = () => {
    return confirmPassword.trim().length > 0 && password === confirmPassword;
  };

  const handleSignUp = () => {
    const newErrors: {[key: string]: string} = {};

    // Validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter valid email address';
    }

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

    // If no errors, call backend register
    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      // Call backend
      fetch(`${AppConfig.BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          // Success - Save tokens if auto-login
          if (data.accessToken) {
            try {
              await saveTokens(
                data.accessToken,
                data.refreshToken,
                data.expiresIn,
              );

              // Save user info if available
              if (data.user) {
                // Backend returns full_name (snake_case), handle both cases
                const userFullName =
                  data.user.full_name || data.user.fullName || '';
                await saveUser({
                  id: data.user.id,
                  email: data.user.email,
                  fullName: userFullName,
                  avatarUrl: data.user.avatar_url || data.user.avatarUrl,
                });
                // Update global auth context
                setUser({
                  ...data.user,
                  fullName: userFullName,
                });
                setIsAuthenticated(true);
              }

              setIsSuccess(true);
              Alert.alert(
                'Success',
                'Account created successfully! You are now logged in.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onLoginSuccess) {
                        onLoginSuccess();
                      } else {
                        onBack();
                      }
                    },
                  },
                ],
              );
            } catch (storageError) {
              console.error('Failed to save tokens:', storageError);
              // Still show success message even if storage fails
              setIsSuccess(true);
              Alert.alert(
                'Success',
                'Account created successfully! Please log in.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onLogin) {
                        onLogin();
                      } else {
                        onBack();
                      }
                    },
                  },
                ],
              );
            }
          } else {
            // No auto-login, show success message and navigate to login
            setIsSuccess(true);
            Alert.alert(
              'Success',
              'Account created successfully! Please log in.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    if (onLogin) {
                      onLogin();
                    } else {
                      onBack();
                    }
                  },
                },
              ],
            );
          }
        })
        .catch(err => {
          console.error('Registration error:', err);
          setErrors({
            submit:
              err instanceof TypeError
                ? 'Network error. Please check your connection.'
                : err.message || 'Registration failed. Please try again.',
          });
        });
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setSocialLoading(provider);

      // GOOGLE SIGN UP FLOW
      if (provider === 'Google') {
        try {
          const user = await FirebaseGoogleService.signIn();
          if (user) {
            // Success - Update global auth context
            setUser(user);
            setIsAuthenticated(true);
            setIsSuccess(true);

            Alert.alert('Success', 'Google sign up successful!', [
              {
                text: 'OK',
                onPress: () => {
                  if (onLoginSuccess) {
                    onLoginSuccess();
                  } else {
                    onBack();
                  }
                },
              },
            ]);
          }
        } catch (error) {
          console.error('Google Sign-In error:', error);
          Alert.alert(
            'Google Sign-In Error',
            (error instanceof Error ? error.message : String(error)) ||
              'Google Sign-In failed.',
          );
        } finally {
          setSocialLoading(null);
        }
        return;
      }
    } catch (err: any) {
      setSocialLoading(null);
      console.error(`${provider} sign up error:`, err);
      let errorMessage = `${provider} sign up failed. Please try again.`;
      if (err instanceof TypeError) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setErrors({submit: errorMessage});
    }
  };

  const handleGoToLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      Alert.alert('Login', 'Redirecting to Login screen...');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Image
              source={require('../../../assets/icons/Back.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Let's create your account.</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.fullName && styles.inputError,
                  isFullNameValid() && !errors.fullName && styles.inputSuccess,
                ]}
                placeholder="Enter your full name"
                placeholderTextColor="#999999"
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  if (errors.fullName) {
                    const newErrors = {...errors};
                    delete newErrors.fullName;
                    setErrors(newErrors);
                  }
                }}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.inputError,
                  isEmailValid() && !errors.email && styles.inputSuccess,
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
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    errors.password && styles.inputError,
                    isPasswordValid() &&
                      !errors.password &&
                      styles.inputSuccess,
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
                  <Image
                    source={
                      showPassword
                        ? require('../../../assets/icons/Hide.png')
                        : require('../../../assets/icons/Show.png')
                    }
                    style={styles.eyeIcon}
                  />
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
                    isConfirmPasswordValid() &&
                      !errors.confirmPassword &&
                      styles.inputSuccess,
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
                  <Image
                    source={
                      showConfirmPassword
                        ? require('../../../assets/icons/Hide.png')
                        : require('../../../assets/icons/Show.png')
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing up you agree to our{' '}
              <Text style={styles.linkText}>Terms</Text>,{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>, and{' '}
              <Text style={styles.linkText}>Cookie Use</Text>
            </Text>

            {/* Error Message */}
            {errors.submit && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{errors.submit}</Text>
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isFormValid() && !isSuccess && styles.signUpButtonEnabled,
                isSuccess && styles.signUpButtonSuccess,
              ]}
              onPress={handleSignUp}
              disabled={isSuccess}>
              <Text
                style={[
                  styles.signUpButtonText,
                  isFormValid() && !isSuccess && styles.signUpButtonTextEnabled,
                  isSuccess && styles.signUpButtonTextSuccess,
                ]}>
                {isSuccess ? 'Account Created!' : 'Create an Account'}
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
              style={[
                styles.socialButton,
                socialLoading === 'Google' && styles.socialButtonLoading,
              ]}
              onPress={() => handleSocialLogin('Google')}
              disabled={socialLoading !== null}>
              <View style={styles.socialButtonContent}>
                <Image
                  source={require('../../../assets/icons/Google.png')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialButtonText}>
                  {socialLoading === 'Google'
                    ? 'Signing up...'
                    : 'Sign up with Google'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={handleGoToLogin}>
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.linkText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
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
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
    width: 24,
    height: 24,
    resizeMode: 'contain',
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
  termsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'left',
    lineHeight: 16,
    marginBottom: 24,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#FF4444',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonEnabled: {
    backgroundColor: '#007AFF',
  },
  signUpButtonSuccess: {
    backgroundColor: '#000000',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  signUpButtonTextEnabled: {
    color: '#FFFFFF',
  },
  signUpButtonTextSuccess: {
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
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  socialButtonLoading: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  loginLink: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666666',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonTextDisabled: {
    color: '#999999',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  codeBox: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    elevation: 2, // Android shadow
    shadowColor: '#000000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  codeBoxFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  codeBoxFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    elevation: 3,
    shadowOpacity: 0.12,
  },
  successIconCenter: {
    alignItems: 'center',
    marginTop: 10,
  },
  timerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});

export default SignUpScreen;
