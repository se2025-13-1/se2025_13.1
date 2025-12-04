// src/App.tsx
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Import Screens
import SplashScreen from './src/modules/splash/screens/SplashScreen';
import WelcomeScreen from './src/modules/welcome/screens/WelcomeScreen';
import LoginScreen from './src/modules/auth/screens/LoginScreen';
import SignUpScreen from './src/modules/auth/screens/SignUpScreen';
import ForgotPasswordScreen from './src/modules/auth/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/modules/auth/screens/ResetPasswordScreen';
import VerificationPasswordScreen from './src/modules/auth/screens/VerificationPassword';
import HomeScreen from './src/modules/home/screens/HomeScreen';
import SearchEntry from './src/modules/search/screens/SearchEntry';

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: {email: string; otp: string};
  VerificationPassword: {email: string};
  Home: undefined;
  SearchEntry: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(false); // Tắt loading để không hiển thị splash
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Đặt authenticated = true để vào Home ngay

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuthStatus = async () => {
      try {
        // Here you would check if user is logged in
        // For now, we'll just set loading to false
        setTimeout(() => {
          setIsLoading(false);
        }, 2000); // Show splash for 2 seconds
      } catch (error) {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}>
        {isLoading ? (
          <Stack.Screen name="Splash">
            {props => <SplashScreen {...props} onFinish={handleSplashFinish} />}
          </Stack.Screen>
        ) : isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SearchEntry" component={SearchEntry} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome">
              {props => (
                <WelcomeScreen
                  {...props}
                  onLogin={() => props.navigation.navigate('Login')}
                  onSignUp={() => props.navigation.navigate('SignUp')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {props => (
                <LoginScreen
                  {...props}
                  onBack={() => props.navigation.goBack()}
                  onSignUp={() => props.navigation.navigate('SignUp')}
                  onForgotPassword={() =>
                    props.navigation.navigate('ForgotPassword')
                  }
                  onLoginSuccess={handleLogin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {props => {
                const handleSignUpVerify = (email: string) => {
                  props.navigation.navigate('VerificationPassword', {email});
                };

                return (
                  <SignUpScreen
                    {...props}
                    onBack={() => props.navigation.goBack()}
                    onLogin={() => props.navigation.navigate('Login')}
                    _onVerify={handleSignUpVerify}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword">
              {props => {
                const handleSendCode = (email: string) => {
                  const otp = '123456'; // This would come from your backend
                  props.navigation.navigate('ResetPassword', {email, otp});
                };

                return (
                  <ForgotPasswordScreen
                    {...props}
                    onBack={() => props.navigation.goBack()}
                    onSendCode={handleSendCode}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="ResetPassword">
              {props => {
                const {email, otp} = props.route.params;

                return (
                  <ResetPasswordScreen
                    {...props}
                    email={email}
                    otp={otp}
                    onBack={() => props.navigation.goBack()}
                    onPasswordReset={() => props.navigation.navigate('Login')}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="VerificationPassword">
              {props => {
                const {email} = props.route.params;

                const handleVerifyCode = (_code: string) => {
                  // Handle verification logic here
                  handleLogin(); // Auto login after verification
                };

                return (
                  <VerificationPasswordScreen
                    {...props}
                    email={email}
                    onBack={() => props.navigation.goBack()}
                    onVerifyCode={handleVerifyCode}
                  />
                );
              }}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// PHẢI CÓ DÒNG NÀY
export default App;
