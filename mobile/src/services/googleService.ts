import {
  GoogleSignin,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';

/**
 * Google Sign-In Configuration
 * This file initializes and manages Google Sign-In for React Native
 */

export const initializeGoogleSignIn = () => {
  GoogleSignin.configure({
    // ✅ KHÔNG CẦN FIREBASE - Chỉ cần Google OAuth
    // Web Client ID từ: Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs > Web application
    webClientId:
      '1039775562011-7fgrubjmppih1ij5g0b7ot1nt9rg0h8r.apps.googleusercontent.com',

    // Enable offline access to get access token (required for backend verification)
    offlineAccess: true,

    // Request additional scopes to ensure access token is available
    scopes: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],

    // Force code for refresh token to ensure we get access token
    forceCodeForRefreshToken: true,
  });

  console.log('✅ Google Sign-In configured WITHOUT Firebase - OAuth only');
};

/**
 * Handles Google Sign-In
 * @returns {Promise<{idToken: string, accessToken: string, userInfo: User | null} | null>}
 */
export const handleGoogleSignIn = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

    // Sign in user
    await GoogleSignin.signIn();

    console.log('Google sign-in successful');

    // Get tokens and user info after successful sign in
    const tokens = await GoogleSignin.getTokens();
    const userInfo = await GoogleSignin.getCurrentUser();

    console.log('Google tokens received:', {
      idToken: tokens.idToken ? 'Available' : 'Missing',
      accessToken: tokens.accessToken ? 'Available' : 'Missing',
    });

    // Backend requires accessToken for verification
    // If accessToken is not available, throw error with setup instructions
    if (!tokens.accessToken) {
      throw new Error(
        'Google accessToken not available. Please ensure:\n' +
          '1. webClientId is configured correctly\n' +
          '2. offlineAccess is enabled\n' +
          '3. Proper scopes are requested\n' +
          'Current configuration may need Google Cloud Console setup.',
      );
    }

    return {
      idToken: tokens.idToken || '',
      accessToken: tokens.accessToken, // This is what backend needs
      userInfo: userInfo?.user || null,
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled Google sign-in');
      return null;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google sign-in already in progress');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Play services not available or outdated');
      throw new Error(
        'Google Play Services not available. Please update Google Play Services.',
      );
    } else {
      throw error;
    }
  }
};

/**
 * Handles Google Sign-Out
 */
export const handleGoogleSignOut = async () => {
  try {
    await GoogleSignin.signOut();
    console.log('Google sign-out successful');
  } catch (error) {
    console.error('Google sign-out error:', error);
    throw error;
  }
};

/**
 * Revoke access token (complete logout)
 */
export const handleGoogleRevokeAccess = async () => {
  try {
    await GoogleSignin.revokeAccess();
    console.log('Google access revoked');
  } catch (error) {
    console.error('Google revoke access error:', error);
    throw error;
  }
};

/**
 * Get current user info if already signed in
 */
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error) {
    console.error('Get current Google user error:', error);
    return null;
  }
};
