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

interface SignUpScreenProps {
  onBack: () => void;
  onLogin?: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({onBack, onLogin}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (emailInput: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailInput);
  };

  const validatePassword = (passwordInput: string) => {
    return passwordInput.length >= 6;
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

    setErrors(newErrors);

    // If no errors, show success
    if (Object.keys(newErrors).length === 0) {
      setIsSuccess(true);
      setTimeout(() => {
        Alert.alert('Success', 'Account created successfully!', [
          {text: 'OK', onPress: onBack},
        ]);
      }, 1500);
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
                isSuccess && !errors.fullName && styles.inputSuccess,
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
            {isSuccess && !errors.fullName && fullName && (
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
            )}
          </View>

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
              isSuccess && styles.signUpButtonSuccess,
            ]}
            onPress={handleSignUp}
            disabled={isSuccess}>
            <Text
              style={[
                styles.signUpButtonText,
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
            <Text style={styles.socialButtonText}>📧 Sign Up with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.facebookButton}
            onPress={() => handleSocialLogin('Facebook')}>
            <Text style={styles.facebookButtonText}>
              📘 Sign Up with Facebook
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity style={styles.loginLink} onPress={handleGoToLogin}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.linkText}>Log In</Text>
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
  signUpButtonSuccess: {
    backgroundColor: '#000000',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
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
});

export default SignUpScreen;
