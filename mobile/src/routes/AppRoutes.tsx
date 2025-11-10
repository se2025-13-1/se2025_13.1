// src/routes/AppRoutes.tsx
import React, {useState} from 'react';
import {SplashScreen} from '@modules/splash';
import {HomeScreen} from '@modules/home';
import {WelcomeScreen} from '@modules/welcome';
import {
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  VerificationPassword,
  ResetPasswordScreen,
} from '@modules/auth';

export type Screen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'forgotPassword'
  | 'verification'
  | 'resetPassword'
  | 'home';

const AppRoutes: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState(''); // THÊM: LƯU OTP

  // === NAVIGATION HELPERS ===
  const goTo = (screen: Screen) => setCurrentScreen(screen);

  const goToVerification = (email: string) => {
    setUserEmail(email);
    goTo('verification');
  };

  // THÊM: Lưu OTP khi xác thực thành công
  const goToResetPassword = (otp: string) => {
    setOtpCode(otp);
    goTo('resetPassword');
  };

  // === RENDER SCREEN ===
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onFinish={() => goTo('welcome')} />;

      case 'welcome':
        return (
          <WelcomeScreen
            onLogin={() => goTo('login')}
            onSignUp={() => goTo('signup')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onBack={() => goTo('welcome')}
            onSignUp={() => goTo('signup')}
            onForgotPassword={() => goTo('forgotPassword')}
            onSuccess={() => goTo('home')}
          />
        );

      case 'signup':
        return (
          <SignUpScreen
            onBack={() => goTo('welcome')}
            onLogin={() => goTo('login')}
            onVerify={goToVerification}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            onBack={() => goTo('login')}
            onSendCode={goToVerification}
          />
        );

      case 'verification':
        return (
          <VerificationPassword
            email={userEmail}
            onBack={() => goTo('forgotPassword')}
            onVerifyCode={goToResetPassword} // TRUYỀN OTP
          />
        );

      case 'resetPassword':
        return (
          <ResetPasswordScreen
            email={userEmail}
            otp={otpCode} // TRUYỀN OTP VÀO
            onBack={() => goTo('verification')}
            onPasswordReset={() => goTo('login')}
          />
        );

      case 'home':
        return <HomeScreen onLogout={() => goTo('welcome')} />;

      default:
        return <SplashScreen onFinish={() => goTo('welcome')} />;
    }
  };

  return renderScreen();
};

export default AppRoutes;
