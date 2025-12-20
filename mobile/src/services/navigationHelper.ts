import {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../../App';

export type AppNavigation = NavigationProp<RootStackParamList>;

/**
 * Navigation Helper Service
 * Handles navigation after authentication events
 */
export class NavigationHelper {
  private static navigation: AppNavigation | null = null;

  /**
   * Set the navigation instance
   * Call this in your main App component
   */
  static setNavigation(nav: AppNavigation) {
    this.navigation = nav;
  }

  /**
   * Navigate to Home screen after successful login
   */
  static navigateToHome() {
    if (this.navigation) {
      console.log('🏠 Navigating to Home...');
      this.navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    } else {
      console.warn(
        '⚠️ Navigation not set. Call NavigationHelper.setNavigation() first.',
      );
    }
  }

  /**
   * Navigate to Login screen
   */
  static navigateToLogin() {
    if (this.navigation) {
      console.log('🔑 Navigating to Login...');
      this.navigation.navigate('Login');
    }
  }

  /**
   * Navigate to Welcome/Onboarding screen
   */
  static navigateToWelcome() {
    if (this.navigation) {
      console.log('👋 Navigating to Welcome...');
      this.navigation.reset({
        index: 0,
        routes: [{name: 'Welcome'}],
      });
    }
  }

  /**
   * Auto navigation based on auth state
   * @param isAuthenticated - Current auth state
   * @param isLoading - Whether auth check is in progress
   */
  static autoNavigate(isAuthenticated: boolean, isLoading: boolean = false) {
    if (isLoading) {
      console.log('⏳ Auth check in progress, waiting...');
      return;
    }

    if (isAuthenticated) {
      this.navigateToHome();
    } else {
      console.log('❌ Not authenticated, staying on current screen');
    }
  }

  /**
   * Handle post-login navigation
   * @param onSuccess - Custom success callback
   */
  static handleLoginSuccess(onSuccess?: () => void) {
    console.log('✅ Login successful!');

    if (onSuccess) {
      onSuccess();
    } else {
      this.navigateToHome();
    }
  }

  /**
   * Handle post-logout navigation
   */
  static handleLogoutSuccess() {
    console.log('🚪 Logout successful!');
    this.navigateToWelcome();
  }
}
