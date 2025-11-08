// src/modules/auth/hooks/useAuthNavigation.ts
import { useCallback } from 'react';

type AuthNavigation = {
  goToLogin: () => void;
  goToSignUp: () => void;
  goToForgot: () => void;
  goToVerify: (email: string) => void;
  goToReset: () => void;
  goBack: () => void;
};

export const useAuthNavigation = (
  navigate: (screen: any) => void,
  goBackScreen: any
): AuthNavigation => {
  return {
    goToLogin: () => navigate('login'),
    goToSignUp: () => navigate('signup'),
    goToForgot: () => navigate('forgotPassword'),
    goToVerify: (email: string) => {
      // Gọi hàm từ parent để lưu email
      (navigate as any)('verification', email);
    },
    goToReset: () => navigate('resetPassword'),
    goBack: () => navigate(goBackScreen),
  };
};