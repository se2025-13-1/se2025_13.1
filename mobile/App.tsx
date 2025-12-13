// src/App.tsx
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 👇 EFFECT XỬ LÝ THÔNG BÁO (ĐÃ SỬA LOGIC LẤY TOKEN)
  useEffect(() => {
    const initNotification = async () => {
      if (isAuthenticated) {
        // A. Xin quyền
        const hasPermission = await requestUserPermission();

        // B. LẤY TOKEN THẬT TỪ STORAGE 🟢
        try {
          const userToken = await AsyncStorage.getItem('accessToken');

          if (!userToken) {
            console.log('⚠️ Chưa tìm thấy token trong bộ nhớ');
            return;
          }

          // C. Gửi FCM Token kèm User Token lên Server
          if (hasPermission) {
            await getFCMToken(userToken);
          }
        } catch (error) {
          console.error('Lỗi khi lấy token từ storage:', error);
        }

        // D. Lắng nghe thông báo
        const unsubscribe = notificationListener();
        return () => unsubscribe();
      }
    };

    initNotification();
  }, [isAuthenticated]);
  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    // 1. Xóa token khỏi bộ nhớ
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('user');

    // 2. Cập nhật state để văng ra màn hình Login
    setIsAuthenticated(false);
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
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen
              name="NotificationDetail"
              component={NotificationDetailScreen}
            />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Settings" component={SettingScreen} />
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
          </>
        ) : (
          <>
            {/* Các màn hình Auth giữ nguyên */}
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
                  const otp = '123456';
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
                  handleLogin();
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

export default App;
