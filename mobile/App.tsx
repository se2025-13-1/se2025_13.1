// src/App.tsx
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider} from './src/contexts/AuthContext';
import {isAuthenticated as checkIsAuthenticated} from './src/services/tokenService';
import {initializeGoogleSignIn} from './src/services/googleService';
import {initializeFacebookSDK} from './src/services/facebookService';

// Import Screens (Giữ nguyên)
import SplashScreen from './src/modules/splash/screens/SplashScreen';
import WelcomeScreen from './src/modules/welcome/screens/WelcomeScreen';
import LoginScreen from './src/modules/auth/screens/LoginScreen';
import SignUpScreen from './src/modules/auth/screens/SignUpScreen';
import ForgotPasswordScreen from './src/modules/auth/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/modules/auth/screens/ResetPasswordScreen';
import VerificationPasswordScreen from './src/modules/auth/screens/VerificationPassword';
import HomeScreen from './src/modules/home/screens/HomeScreen';
import SearchEntry from './src/modules/search/screens/SearchEntry';
import NotificationScreen from './src/modules/notifications/screens/NotificationScreen';
import NotificationDetailScreen from './src/modules/notifications/screens/NotificationDetailScreen';
import EditProfileScreen from './src/modules/profile/screens/EditProfileScreen';
import SettingScreen from './src/modules/profile/screens/SettingScreen';
import AddAddressScreen from './src/modules/address/screens/AddAddressScreen';
import AddressListScreen from './src/modules/address/screens/AddressListScreen';
import EditAddressScreen from './src/modules/address/screens/EditAddressScreen';
import ProductDetailScreen from './src/modules/productdetails/screens/ProductDetailScreen';
import ReviewListScreen from './src/modules/reviews/screens/ReviewListScreen';
import PaymentScreen from './src/modules/payment/screens/PaymentScreen';
import PaymentMethodScreen from './src/modules/payment/screens/PaymentMethodScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 👇 1. IMPORT SERVICE THÔNG BÁO (THÊM MỚI)
import {
  requestUserPermission,
  getFCMToken,
  notificationListener,
} from './src/modules/notifications/service/notificationService';
// Bạn có thể cần import AsyncStorage nếu bạn lưu token đăng nhập ở đó
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation types (Giữ nguyên)
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
  Notification: undefined;
  NotificationDetail: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
  };
  EditProfile: undefined;
  Settings: undefined;
  AddressList: undefined;
  AddAddress: undefined;
  EditAddress: {address: any};
  ProductDetail: undefined;
  ReviewList: undefined;
  Payment: {
    color: string;
    size: string;
    quantity: number;
    price: number;
  };
  PaymentMethod: {selectedMethod: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(true); // Show splash initially
  const [isAuthenticated, setIsAuthenticated] = useState(false); // User not authenticated initially
  const [hasStarted, setHasStarted] = useState(false); // Track if user has started using app

  // 👇 EFFECT XỬ LÝ THÔNG BÁO (ĐÃ SỬA LOGIC LẤY TOKEN)
  useEffect(() => {
    // Initialize Social SDKs and check auth status on app startup
    const initializeApp = async () => {
      try {
        // Initialize social SDKs first
        console.log('Initializing social SDKs...');
        initializeGoogleSignIn();
        initializeFacebookSDK();

        // First, show splash for 2 seconds for visual effect
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if there's a stored token
        const authenticated = await checkIsAuthenticated();

        if (authenticated) {
          // User has a valid token, skip to app
          setIsAuthenticated(true);
          setHasStarted(true);
        } else {
          // User not authenticated, show welcome screen
          setHasStarted(false);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
        setHasStarted(false);
      }
    };

    initializeApp();
  }, []);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleGetStarted = () => {
    setHasStarted(true); // User can now access app features
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setHasStarted(true); // Ensure user can access app features after login
  };

  const handleLogout = async () => {
    // 1. Xóa token khỏi bộ nhớ
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('user');

    // 2. Cập nhật state để văng ra màn hình Login
    setIsAuthenticated(false);
  };

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}>
          {isLoading ? (
            <Stack.Screen name="Splash">
              {props => (
                <SplashScreen {...props} onFinish={handleSplashFinish} />
              )}
            </Stack.Screen>
          ) : hasStarted ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="SearchEntry" component={SearchEntry} />
              <Stack.Screen
                name="Notification"
                component={NotificationScreen}
              />
              <Stack.Screen
                name="NotificationDetail"
                component={NotificationDetailScreen}
              />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Settings" component={SettingScreen} />
              <Stack.Screen name="AddressList" component={AddressListScreen} />
              <Stack.Screen name="AddAddress" component={AddAddressScreen} />
              <Stack.Screen name="EditAddress" component={EditAddressScreen} />
              <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
              />
              <Stack.Screen name="ReviewList" component={ReviewListScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen
                name="PaymentMethod"
                component={PaymentMethodScreen}
              />
              {/* Auth screens still available if user wants to login */}
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
          ) : (
            <>
              <Stack.Screen name="Welcome">
                {props => (
                  <WelcomeScreen {...props} onGetStarted={handleGetStarted} />
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
    </AuthProvider>
  );
};

export default App;
