import React, {useState} from 'react';
import SplashScreen from '../screens/Splash/SplashScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import SignUpScreen from '../screens/SignUp/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPasswordScreen';
import VerificationPassword from '../screens/ForgotPassword/VerificationPassword';
import ResetPassword from '../screens/ForgotPassword/ResetPassword';

export type Screen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'forgotPassword'
  | 'verification'
  | 'resetPassword';

const AppRoutes: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [userEmail, setUserEmail] = useState('');

  const navigateToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  const navigateToSignUp = () => {
    setCurrentScreen('signup');
  };

  const navigateToForgotPassword = () => {
    setCurrentScreen('forgotPassword');
  };

  const navigateToVerification = (email: string) => {
    setUserEmail(email);
    setCurrentScreen('verification');
  };

  const navigateToResetPassword = () => {
    setCurrentScreen('resetPassword');
  };

  const navigateBack = () => {
    setCurrentScreen('welcome');
  };

  const navigateBackToLogin = () => {
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onFinish={navigateToWelcome} />;
      case 'welcome':
        return (
          <WelcomeScreen
            onLogin={navigateToLogin}
            onSignUp={navigateToSignUp}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={navigateBack}
            onSignUp={navigateToSignUp}
            onForgotPassword={navigateToForgotPassword}
          />
        );
      case 'signup':
        return <SignUpScreen onBack={navigateBack} onLogin={navigateToLogin} />;
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            onBack={navigateBackToLogin}
            onSendCode={navigateToVerification}
          />
        );
      case 'verification':
        return (
          <VerificationPassword
            onBack={navigateToForgotPassword}
            onVerifyCode={navigateToResetPassword}
            email={userEmail}
          />
        );
      case 'resetPassword':
        return (
          <ResetPassword
            onBack={() => setCurrentScreen('verification')}
            onPasswordReset={navigateToLogin}
          />
        );
      default:
        return <SplashScreen onFinish={navigateToWelcome} />;
    }
  };

  return renderScreen();
};

export default AppRoutes;
