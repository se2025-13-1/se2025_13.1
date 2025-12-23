import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface RequireAuthProps {
  visible: boolean;
  onClose: () => void;
  feature: 'chat' | 'notification' | 'cart' | 'wishlist';
  onLogin?: () => void;
  onRegister?: () => void;
  onGoogleLogin?: () => void;
}

const RequireAuth: React.FC<RequireAuthProps> = ({
  visible,
  onClose,
  feature,
  onLogin,
  onRegister,
  onGoogleLogin,
}) => {
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    onClose(); // Đóng modal trước khi điều hướng
    if (onLogin) {
      onLogin(); // Gọi callback nếu có
    } else {
      navigation.navigate('LoginScreen'); // Điều hướng mặc định
    }
  };

  const handleRegister = () => {
    onClose(); // Đóng modal trước khi điều hướng
    if (onRegister) {
      onRegister(); // Gọi callback nếu có
    } else {
      navigation.navigate('SignUpScreen'); // Điều hướng mặc định
    }
  };

  const handleGoogleLogin = () => {
    onClose(); // Đóng modal trước
    onGoogleLogin?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đăng nhập để tiếp tục</Text>
            <Text style={styles.subtitle}>
              Bạn cần đăng nhập để sử dụng chức năng này
            </Text>
          </View>

          {/* Main login button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          {/* Divider with "hoặc" */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>hoặc</Text>
            <View style={styles.line} />
          </View>

          {/* Social login buttons */}
          <View style={styles.socialButtonsContainer}>
            {/* Google login */}
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleLogin}>
              <View style={styles.socialButtonContent}>
                <Image
                  source={require('../../../assets/icons/Google.png')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialButtonText}>
                  Đăng nhập bằng Google
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Nếu bạn chưa có tài khoản. </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    paddingHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  socialButtonsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  socialButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});

export default RequireAuth;
