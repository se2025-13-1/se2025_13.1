import {
  GoogleSignin,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';
import auth, {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from '@react-native-firebase/auth';
import {saveTokens, saveUser} from './tokenService';

// Replace with your actual Web Client ID from Firebase Console
const GOOGLE_WEB_CLIENT_ID =
  '790984624622-tvlp3fsnvsskvqf5hdqit34q2ps7gt9g.apps.googleusercontent.com';
const BACKEND_URL = 'http://10.0.2.2:3000'; // Android emulator localhost

export const FirebaseGoogleService = {
  /**
   * Initialize Google Sign-In
   * Call this in your App.tsx or on app launch
   */
  configure() {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false, // Change to false to reduce 12500 error risk
      scopes: ['profile', 'email'],
      forceCodeForRefreshToken: true, // Force account selection
      accountName: '', // Clear any cached account
    });
  },

  /**
   * Sign In with Google and authenticate with Backend
   * @param onSuccess - Optional callback for successful login
   * @param autoNavigate - Whether to automatically navigate to Home (default: true)
   */
  async signIn(onSuccess?: (user: any) => void, autoNavigate: boolean = true) {
    try {
      // 0. Sign out first to ensure account selection screen (only if needed)
      try {
        console.log('Signing out to force account selection...');
        await this.signOut();
      } catch (signOutError) {
        // If signOut fails, continue anyway
        console.log('Pre-signin signout skipped:', signOutError);
      }

      // 1. Check Play Services
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // 2. Sign In with Google (this will show account picker)
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success');

      // 3. Get Google ID Token
      let googleIdToken: string | null = null;

      // For newer SDK versions, try different token access patterns
      try {
        // Method 1: Try direct access from response (some SDK versions)
        if ('idToken' in userInfo && userInfo.idToken) {
          googleIdToken = userInfo.idToken as string;
        }
        // Method 2: Try from data property (some SDK versions)
        else if (
          'data' in userInfo &&
          userInfo.data &&
          'idToken' in userInfo.data
        ) {
          googleIdToken = (userInfo.data as any).idToken;
        }
        // Method 3: Get tokens separately (most reliable)
        else {
          const tokens = await GoogleSignin.getTokens();
          googleIdToken = tokens.idToken;
        }
      } catch (tokenError) {
        console.error('Failed to get tokens:', tokenError);
        // Final fallback - try getTokens again
        try {
          const tokens = await GoogleSignin.getTokens();
          googleIdToken = tokens.idToken;
        } catch (finalError) {
          console.error('Final token retrieval failed:', finalError);
        }
      }

      if (!googleIdToken) {
        throw new Error(
          'Could not retrieve Google ID Token. Please try signing in again.',
        );
      }

      // 4. Create Firebase Credential & Sign In to Firebase
      console.log('Signing in to Firebase...');
      const googleCredential = GoogleAuthProvider.credential(googleIdToken);
      const firebaseAuth = getAuth();
      const firebaseUserCredential = await signInWithCredential(
        firebaseAuth,
        googleCredential,
      );

      // 5. Get Firebase ID Token (This is the correct token for backend)
      const firebaseIdToken = await firebaseUserCredential.user.getIdToken();
      console.log('Got Firebase ID Token');

      // 6. Verify with Backend
      console.log('Verifying with backend...');
      const backendResponse = await this.verifyWithBackend(firebaseIdToken);

      // 7. Save Session
      if (backendResponse) {
        await saveTokens(
          backendResponse.accessToken,
          backendResponse.refreshToken,
        );
        await saveUser(backendResponse.user);

        // 8. Handle success callback and auto-navigation
        if (onSuccess) {
          onSuccess(backendResponse.user);
        }

        console.log('✅ Google Sign-In completed successfully');
        return backendResponse.user;
      }

      return null;
    } catch (error: unknown) {
      const err = error as any; // Type assertion for better error handling

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', err);
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
      }
      throw error;
    }
  },

  /**
   * Send ID Token to Backend
   */
  async verifyWithBackend(idToken: string) {
    try {
      // Updated endpoint to match backend route (/api/auth/firebase)
      const response = await fetch(`${BACKEND_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({idToken: idToken}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Backend verification failed',
        );
      }

      return data;
    } catch (error: unknown) {
      console.error('Backend Verification Error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      // Google SignOut
      await GoogleSignin.signOut();

      // Firebase SignOut with error handling
      try {
        const firebaseAuth = getAuth();
        await signOut(firebaseAuth);
        console.log('Signed out from Google and Firebase');
      } catch (firebaseError: unknown) {
        const err = firebaseError as any;
        // Ignore 'no-current-user' error as it's expected when no one is signed in
        if (err.code === 'auth/no-current-user') {
          console.log('No Firebase user was signed in (this is normal)');
        } else {
          console.error('Firebase Sign Out Error:', firebaseError);
        }
      }
    } catch (error: unknown) {
      console.error('Sign Out Error:', error);
      // Don't throw error here as we want to continue with sign in
    }
  },

  /**
   * Complete Logout - Signs out from all services
   */
  async completeLogout() {
    const errors = [];

    try {
      // 1. Call backend logout API (if available)
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getStoredToken()}`,
          },
        });

        if (response.ok) {
          console.log('✅ Backend logout successful');
        } else {
          console.log('⚠️ Backend logout failed, continuing with local logout');
        }
      } catch (backendError: unknown) {
        console.log(
          '⚠️ Backend logout unavailable, continuing with local logout',
        );
      }

      // 2. Sign out from Google
      try {
        await GoogleSignin.signOut();
        console.log('✅ Google Sign-Out successful');
      } catch (googleError: unknown) {
        console.error('❌ Google Sign-Out error:', googleError);
        errors.push('Google logout failed');
      }

      // 3. Sign out from Firebase
      try {
        const firebaseAuth = getAuth();
        await signOut(firebaseAuth);
        console.log('✅ Firebase Sign-Out successful');
      } catch (firebaseError: unknown) {
        const err = firebaseError as any;
        if (err.code === 'auth/no-current-user') {
          console.log('ℹ️ No Firebase user signed in (normal)');
        } else {
          console.error('❌ Firebase Sign-Out error:', firebaseError);
          errors.push('Firebase logout failed');
        }
      }

      console.log('✅ Complete logout finished');

      if (errors.length > 0) {
        console.warn('⚠️ Some logout operations failed:', errors);
      }

      return {success: true, errors};
    } catch (error: unknown) {
      const err = error as any;
      console.error('❌ Complete logout error:', error);
      return {success: false, errors: [err.message || 'Unknown logout error']};
    }
  },

  /**
   * Helper to get stored token for backend calls
   */
  async getStoredToken() {
    try {
      const {getAccessToken} = await import('./tokenService');
      return await getAccessToken();
    } catch (error: unknown) {
      console.error('Error getting stored token:', error);
      return null;
    }
  },
};
