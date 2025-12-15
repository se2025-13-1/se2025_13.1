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
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../../App';

const {width, height} = Dimensions.get('window');

type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
> & {
  onGetStarted?: () => void;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  navigation,
  onGetStarted,
}) => {
  const handleGetStarted = () => {
    // Update app state to allow guest access
    if (onGetStarted) {
      onGetStarted();
    }
    // Navigation will be handled automatically by App.tsx state change
  };

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
          source={require('../../../assets/icons/Welcome.png')}
          style={styles.welcomeImage}
          resizeMode="contain"
        />
      </View>

      {/* Get Started Button */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <Image
            source={require('../../../assets/icons/Next.png')}
            style={styles.nextIcon}
            resizeMode="contain"
          />
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
  nextIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
});

export default WelcomeScreen;
