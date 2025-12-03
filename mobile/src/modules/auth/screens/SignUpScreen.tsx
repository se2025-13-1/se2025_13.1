import React, {useState, useRef, useEffect} from 'react';
import {AppConfig} from '../../../config/AppConfig';
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

interface SignUpScreenProps {
  onBack: () => void;
  onLogin?: () => void;
  _onVerify?: (email: string) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onBack,
  onLogin,
  _onVerify,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [_generatedCode, setGeneratedCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));

  // Auto focus first input when verification screen shows
  useEffect(() => {
    if (showVerification) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showVerification]);

  // Timer countdown for code expiration
  useEffect(() => {
    if (showVerification && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setVerificationError(
              'Verification code has expired. Please request a new code.',
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showVerification, timeLeft]);

  const validateEmail = (emailInput: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailInput);
  };

  const validatePhoneNumber = (phoneInput: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phoneInput.replace(/[^0-9]/g, ''));
  };

  const validatePassword = (passwordInput: string) => {
    return passwordInput.length >= 6;
  };

  const isFormValid = () => {
    return (
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      validateEmail(email) &&
      phoneNumber.trim().length > 0 &&
      validatePhoneNumber(phoneNumber) &&
      password.trim().length > 0 &&
      validatePassword(password) &&
      confirmPassword.trim().length > 0 &&
      password === confirmPassword
    );
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = (userEmail: string, code: string) => {
    // Keep a local simulation for development; in production the server will send the code
    console.log(`(dev) Sending verification code ${code} to ${userEmail}`);
    Alert.alert(
      'Verification Code Sent',
      `A 6-digit verification code has been sent to ${userEmail}. Please check your email.`,
      [{text: 'OK'}],
    );
  };

  const handleVerifyCode = () => {
    const codeString = verificationCode.join('');

    if (codeString.length !== 6) {
      setVerificationError('Please enter a 6-digit verification code');
      return;
    }

    if (timeLeft === 0) {
      setVerificationError(
        'Verification code has expired. Please request a new code.',
      );
      return;
    }

    // Call backend verify API
    setVerificationError('');
    setIsVerifying(true);

    fetch(`${AppConfig.BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, otp: codeString}),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Verification failed');
        }
        setIsVerifying(false);
        setIsSuccess(true);
        Alert.alert('Success', 'Email verified. You can now log in.');
        setTimeout(() => {
          if (onLogin) {
            onLogin();
          } else {
            onBack();
          }
        }, 800);
      })
      .catch(err => {
        setIsVerifying(false);
        setVerificationError(err.message || 'Verification failed');
      });
  };

  const handleResendCode = () => {
    // Try to ask backend to re-send registration OTP.
    // Backend.register now supports re-sending OTP for unverified users.
    setVerificationError('');
    setTimeLeft(60);
    setVerificationCode(['', '', '', '', '', '']);
    setFocusedIndex(0);

    fetch(`${AppConfig.BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: fullName,
        email,
        password,
        phone: phoneNumber,
      }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Could not resend code');
        }
        // Inform user to check email
        Alert.alert('Sent', 'A new verification code was sent to your email.');
      })
      .catch(_err => {
        // Fallback to local simulation if backend not reachable
        console.log('Failed to resend code, using fallback');
        const newCode = generateVerificationCode();
        sendVerificationEmail(email, newCode);
      });
  };

  const handleBackToSignUp = () => {
    setShowVerification(false);
    setVerificationCode(['', '', '', '', '', '']);
    setGeneratedCode('');
    setFocusedIndex(0);
    setVerificationError('');
    setTimeLeft(60);
  };

  const handleBackspaceGlobal = () => {
    const newCode = [...verificationCode];

    // Find the last filled box (rightmost box with content)
    let lastFilledIndex = -1;
    for (let i = 5; i >= 0; i--) {
      if (verificationCode[i] !== '') {
        lastFilledIndex = i;
        break;
      }
    }

    // If there's content to delete
    if (lastFilledIndex >= 0) {
      // Clear the last filled box
      newCode[lastFilledIndex] = '';
      setVerificationCode(newCode);

      // Focus to the cleared box
      setFocusedIndex(lastFilledIndex);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    // Clear error when user starts typing
    if (verificationError) {
      setVerificationError('');
    }

    // Handle backspace at the beginning of input change
    if (value === '' && verificationCode[index] !== '') {
      // This means user pressed backspace/delete
      handleBackspaceGlobal();
      return;
    }

    // Handle paste - if user pastes a long string
    if (value.length > 1) {
      const numericValue = value.replace(/[^0-9]/g, '');
      const newCode = ['', '', '', '', '', ''];

      // Fill from current index
      for (let i = 0; i < Math.min(numericValue.length, 6 - index); i++) {
        newCode[index + i] = numericValue[i];
      }

      // Keep existing values before current index
      for (let i = 0; i < index; i++) {
        newCode[i] = verificationCode[i];
      }

      setVerificationCode(newCode);

      // Focus to the last filled position or last box
      const lastFilledIndex = Math.min(index + numericValue.length, 5);
      setFocusedIndex(lastFilledIndex);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    // Handle single character input
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = numericValue;
      setVerificationCode(newCode);

      // Auto focus next input if current input has value
      if (numericValue && index < 5) {
        setFocusedIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, _index: number) => {
    // Handle backspace - use global backspace handler
    if (key === 'Backspace') {
      handleBackspaceGlobal();
    }
  };

  const isCodeComplete = () => {
    return (
      verificationCode.every(digit => digit !== '') &&
      verificationCode.join('').length === 6
    );
  };

  // Individual field validation helpers
  const isFullNameValid = () => {
    return fullName.trim().length > 0;
  };

  const isEmailValid = () => {
    return email.trim().length > 0 && validateEmail(email);
  };

  const isPhoneNumberValid = () => {
    return phoneNumber.trim().length > 0 && validatePhoneNumber(phoneNumber);
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

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please enter your phone number';
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter valid phone number (10-11 digits)';
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

    // If no errors, call backend register which will send OTP
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
          phone: phoneNumber,
        }),
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
          }
          setTimeLeft(60);
          setShowVerification(true);
          Alert.alert(
            'Thành công',
            'Mã xác nhận đã được gửi tới email của bạn.',
          );
        })
        .catch(_err => {
          // If backend not reachable, fallback to local simulation
          console.log('Registration failed, using fallback');
          const code = generateVerificationCode();
          setGeneratedCode(code);
          setTimeLeft(60);
          sendVerificationEmail(email, code);
          setShowVerification(true);
        });
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} sign up will be available soon!`);
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

      {!showVerification ? (
        // Sign Up Form
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
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
                    isFullNameValid() &&
                      !errors.fullName &&
                      styles.inputSuccess,
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

              {/* Phone Number */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.phoneNumber && styles.inputError,
                    isPhoneNumberValid() &&
                      !errors.phoneNumber &&
                      styles.inputSuccess,
                  ]}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999999"
                  value={phoneNumber}
                  onChangeText={text => {
                    setPhoneNumber(text);
                    if (errors.phoneNumber) {
                      const newErrors = {...errors};
                      delete newErrors.phoneNumber;
                      setErrors(newErrors);
                    }
                  }}
                  keyboardType="phone-pad"
                />
                {errors.phoneNumber && (
                  <Text style={styles.errorText}>{errors.phoneNumber}</Text>
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
                    <Text style={styles.eyeIcon}>
                      {showPassword ? '👁️' : '🙈'}
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
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }>
                    <Text style={styles.eyeIcon}>
                      {showConfirmPassword ? '👁️' : '🙈'}
                    </Text>
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
                    isFormValid() &&
                      !isSuccess &&
                      styles.signUpButtonTextEnabled,
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
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Google')}>
                <Text style={styles.socialButtonText}>
                  📧 Sign Up with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.facebookButton}
                onPress={() => handleSocialLogin('Facebook')}>
                <Text style={styles.facebookButtonText}>
                  📘 Sign Up with Facebook
                </Text>
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
      ) : (
        // Verification Screen
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackToSignUp}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Email Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {email}
            </Text>

            {/* Verification Code Input */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Verification Code</Text>

                {/* Code Input Boxes */}
                <View style={styles.codeContainer}>
                  {verificationCode.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (inputRefs.current[index] = ref)}
                      style={[
                        styles.codeBox,
                        focusedIndex === index && styles.codeBoxFocused,
                        digit && styles.codeBoxFilled,
                      ]}
                      value={digit}
                      onChangeText={value => handleCodeChange(value, index)}
                      onKeyPress={({nativeEvent}) =>
                        handleKeyPress(nativeEvent.key, index)
                      }
                      onFocus={() => setFocusedIndex(index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {/* Error Message */}
                {verificationError && (
                  <Text style={styles.errorText}>{verificationError}</Text>
                )}

                {isCodeComplete() && !verificationError && (
                  <View style={styles.successIconCenter}>
                    <Text style={styles.successIconText}>✓</Text>
                  </View>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  isCodeComplete() &&
                    !isVerifying &&
                    styles.signUpButtonEnabled,
                  isSuccess && styles.signUpButtonSuccess,
                ]}
                onPress={handleVerifyCode}
                disabled={!isCodeComplete() || isVerifying || isSuccess}>
                <Text
                  style={[
                    styles.signUpButtonText,
                    isCodeComplete() &&
                      !isVerifying &&
                      styles.signUpButtonTextEnabled,
                    isSuccess && styles.signUpButtonTextSuccess,
                  ]}>
                  {isSuccess
                    ? 'Account Created! Redirecting...'
                    : isVerifying
                    ? 'Verifying...'
                    : 'Verify Code'}
                </Text>
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity
                style={[
                  styles.resendButton,
                  timeLeft > 0 && styles.resendButtonDisabled,
                ]}
                onPress={handleResendCode}
                disabled={timeLeft > 0}>
                <Text
                  style={[
                    styles.resendButtonText,
                    timeLeft > 0 && styles.resendButtonTextDisabled,
                  ]}>
                  {timeLeft > 0
                    ? `Resend in ${timeLeft}s`
                    : "Didn't receive the code? "}
                  {timeLeft === 0 && (
                    <Text style={styles.linkText}>Resend</Text>
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
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
