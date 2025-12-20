import {FirebaseGoogleService} from './firebaseGoogleService';
import {clearTokens, getAccessToken} from './tokenService';
import {AppConfig} from '../config/AppConfig';

export interface LogoutResult {
  success: boolean;
  errors: string[];
  completedOperations: string[];
}

/**
 * Comprehensive Logout Service
 * Handles logout from all authentication services
 */
export class LogoutService {
  /**
   * Perform complete logout from all services
   */
  static async performCompleteLogout(): Promise<LogoutResult> {
    const result: LogoutResult = {
      success: true,
      errors: [],
      completedOperations: [],
    };

    console.log('🚪 Starting complete logout process...');

    // 1. Backend Logout (Invalidate server session)
    try {
      const token = await getAccessToken();
      if (token) {
        const response = await fetch(`${AppConfig.BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          result.completedOperations.push('Backend session invalidated');
          console.log('✅ Backend logout successful');
        } else {
          result.errors.push('Backend logout failed');
          console.warn('⚠️ Backend logout failed, continuing...');
        }
      }
    } catch (error) {
      result.errors.push('Backend logout unavailable');
      console.warn('⚠️ Backend logout unavailable:', error);
    }

    // 2. Google & Firebase Logout
    try {
      await FirebaseGoogleService.signOut();
      result.completedOperations.push('Google & Firebase signed out');
      console.log('✅ Google & Firebase logout successful');
    } catch (error) {
      result.errors.push('Google/Firebase logout failed');
      console.error('❌ Google/Firebase logout error:', error);
    }

    // 3. Clear Local Storage (Most Critical)
    try {
      await clearTokens();
      result.completedOperations.push('Local tokens cleared');
      console.log('✅ Local tokens cleared');
    } catch (error) {
      result.errors.push('Failed to clear local tokens');
      result.success = false;
      console.error('❌ Critical error: Failed to clear local tokens:', error);
    }

    // 5. Final Result
    const successCount = result.completedOperations.length;
    const errorCount = result.errors.length;

    console.log(
      `🏁 Logout completed: ${successCount} successful, ${errorCount} errors`,
    );

    if (errorCount > 0) {
      console.warn('⚠️ Logout errors:', result.errors);
    }

    return result;
  }

  /**
   * Quick logout (only local data)
   * Use when network is unavailable or for emergency logout
   */
  static async performQuickLogout(): Promise<LogoutResult> {
    const result: LogoutResult = {
      success: true,
      errors: [],
      completedOperations: [],
    };

    console.log('🚪 Starting quick logout (local only)...');

    try {
      await clearTokens();
      result.completedOperations.push('Local tokens cleared');
      console.log('✅ Quick logout successful');
    } catch (error) {
      result.errors.push('Failed to clear local tokens');
      result.success = false;
      console.error('❌ Quick logout failed:', error);
    }

    return result;
  }

  /**
   * Silent logout (no console logs)
   * Use for automatic logout scenarios
   */
  static async performSilentLogout(): Promise<boolean> {
    try {
      await clearTokens();

      // Try to sign out from services without throwing errors
      try {
        await FirebaseGoogleService.signOut();
      } catch (e) {
        /* Silent */
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
