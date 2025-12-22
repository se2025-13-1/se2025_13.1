import React, {useState, useEffect} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppConfig} from '../../../config/AppConfig';
import {
  saveTokens,
  saveUser,
  getAccessToken,
} from '../../../services/tokenService';
import {useAuth} from '../../../contexts/AuthContext';
import {FirebaseGoogleService} from '../../../services/firebaseGoogleService';
import {RootStackParamList} from '../../../../App';
import {
  getFCMToken,
  requestUserPermission,
} from '../../notifications/service/notificationService';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  onBack: () => void;
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
}

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
}) => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {
    setUser,
    setIsAuthenticated,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('✨ User already authenticated, redirecting to Home...');

      // Use setTimeout to avoid navigation during render
      const redirectTimer = setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });
        }
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, authLoading, navigation, onLoginSuccess]);

  // Re-check auth state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Double-check auth state when screen is focused
      if (!authLoading && isAuthenticated) {
        console.log('🔄 Screen focused: User authenticated, redirecting...');
        navigation.reset({
          index: 0,
          routes: [{name: 'Home'}],
        });
      }
    }, [isAuthenticated, authLoading, navigation]),
  );

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

    // If no errors, call API
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      console.log('📧 Email Login pressed:', {email});

      fetch(`${AppConfig.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email,
          password,
        }),
      })
        .then(async res => {
          console.log('📧 Login response status:', res.status);
          const data = await res.json();
          console.log('📧 Login response data:', data);

          if (!res.ok) {
            throw new Error(data.error || 'Login failed');
          }
          // Success - Save tokens and update context
          if (data.accessToken) {
            try {
              console.log('📧 Saving tokens...');
              await saveTokens(
                data.accessToken,
                data.refreshToken,
                data.expiresIn,
              );

              // Save user info if available
              if (data.user) {
                // Backend returns full_name (snake_case), handle both cases
                const userFullName =
                  data.user.full_name ||
                  data.user.fullName ||
                  data.user.name ||
                  '';
                await saveUser({
                  id: data.user.id,
                  email: data.user.email,
                  fullName: userFullName,
                  avatarUrl: data.user.avatar_url || data.user.avatarUrl,
                });
                // Update global auth context with fullName
                setUser({
                  ...data.user,
                  fullName: userFullName,
                });
                setIsAuthenticated(true);
                console.log('📧 Email login success');

                // 🔔 REGISTER FCM TOKEN AFTER EMAIL LOGIN
                (async () => {
                  try {
                    console.log(
                      '🔔 Requesting notification permission after email login...',
                    );
                    const hasPermission = await requestUserPermission();
                    console.log('🔔 Permission result:', hasPermission);

                    if (hasPermission) {
                      const userToken = await getAccessToken();
                      console.log(
                        '🔔 AccessToken retrieved:',
                        userToken ? '✅ exists' : '❌ null',
                      );

                      if (userToken) {
                        console.log(
                          '🔔 Calling getFCMToken after email login with token...',
                        );
                        await getFCMToken(userToken);
                        console.log('🔔 getFCMToken completed');
                      } else {
                        console.warn('❌ AccessToken is null');
                      }
                    } else {
                      console.warn('❌ Permission denied');
                    }
                  } catch (error) {
                    console.error('❌ FCM Token registration error:', error);
                  }
                })();
              }
            } catch (storageError) {
              console.error('❌ Failed to save tokens:', storageError);
            }
          }

          setIsLoading(false);
          setIsSuccess(true);
          // Navigate to Home screen immediately
          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });
        })
        .catch(err => {
          console.error('❌ Email login error:', err);
          setIsLoading(false);
          // Phân biệt loại lỗi
          let errorMessage = 'Login failed. Please try again.';
          if (err instanceof TypeError) {
            errorMessage = 'Network error. Please check your connection.';
          } else if (err.message) {
            errorMessage = err.message;
          }
          setErrors({submit: errorMessage});
        });
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setSocialLoading(provider);

      // GOOGLE LOGIN FLOW
      if (provider === 'Google') {
        try {
          const user = await FirebaseGoogleService.signIn(user => {
            // Success callback - Update global auth context
            setUser(user);
            setIsAuthenticated(true);
            setIsSuccess(true);

            console.log('🎉 Google login success, redirecting...');

            // 🔔 REGISTER FCM TOKEN AFTER LOGIN
            (async () => {
              try {
                console.log(
                  '🔔 Requesting notification permission after login...',
                );
                const hasPermission = await requestUserPermission();
                console.log('🔔 Permission result:', hasPermission);

                if (hasPermission) {
                  console.log(
                    '🔔 Getting accessToken using getAccessToken()...',
                  );
                  const userToken = await getAccessToken();
                  console.log(
                    '🔔 AccessToken retrieved:',
                    userToken ? '✅ exists' : '❌ null',
                  );

                  if (userToken) {
                    console.log(
                      '🔔 Calling getFCMToken after login with token...',
                    );
                    await getFCMToken(userToken);
                    console.log('🔔 getFCMToken completed');
                  } else {
                    console.warn('❌ AccessToken is null');
                  }
                } else {
                  console.warn('❌ Permission denied');
                }
              } catch (error) {
                console.error('❌ FCM Token registration error:', error);
              }
            })();

            if (onLoginSuccess) {
              onLoginSuccess();
            } else {
              // Navigate to Home screen immediately
              navigation.reset({
                index: 0,
                routes: [{name: 'Home'}],
              });
            }
          });
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
      console.error(`${provider} login error:`, err);
      let errorMessage = `${provider} login failed. Please try again.`;
      if (err instanceof TypeError) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setErrors({submit: errorMessage});
    }
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
          <Image
            source={require('../../../assets/icons/Back.png')}
            style={styles.backIcon}
          />
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

          {/* Error Message */}
          {errors.submit && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{errors.submit}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonLoading,
              isSuccess && styles.loginButtonSuccess,
              email &&
                validateEmail(email) &&
                password &&
                !isLoading &&
                !isSuccess &&
                styles.loginButtonGlow,
            ]}
            onPress={handleLogin}
            disabled={isLoading || isSuccess}>
            <Text
              style={[
                styles.loginButtonText,
                isSuccess && styles.loginButtonTextSuccess,
                email &&
                  validateEmail(email) &&
                  password &&
                  !isLoading &&
                  !isSuccess &&
                  styles.loginButtonGlowText,
              ]}>
              {isLoading
                ? 'Logging in...'
                : isSuccess
                ? 'Login Successful!'
                : 'Login'}
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
                  ? 'Signing in...'
                  : 'Login with Google'}
              </Text>
            </View>
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
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonLoading: {
    backgroundColor: '#B0B0B0',
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
  loginButtonGlow: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  loginButtonGlowText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
