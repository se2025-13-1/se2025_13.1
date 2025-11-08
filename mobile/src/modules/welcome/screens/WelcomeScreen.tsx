import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';

const {width, height} = Dimensions.get('window');

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({onLogin, onSignUp}) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header Text */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Define{'\n'}
          yourself in{'\n'}
          your unique{'\n'}
          way.
        </Text>
      </View>

      {/* Welcome Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/images/welcome.png')}
          style={styles.welcomeImage}
          resizeMode="contain"
        />
        {/* Fallback placeholder nếu ảnh không load được */}
        {/* <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>welcome.png</Text>
          <Text style={styles.imagePlaceholderSubText}>
            (Place your welcome image here)
          </Text>
        </View> */}
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={onSignUp}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
          <Text style={styles.loginButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeImage: {
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  imagePlaceholderSubText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '400',
    marginTop: 4,
  },
  buttonsContainer: {
    gap: 16,
  },
  getStartedButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
