import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
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
    });
  },

  /**
   * Sign In with Google and authenticate with Backend
   */
  async signIn() {
    try {
      // 1. Check Play Services
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // 2. Sign In with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success');

      // 3. Get Google ID Token
      let googleIdToken = userInfo.data?.idToken || userInfo.idToken;
      if (!googleIdToken) {
        const tokens = await GoogleSignin.getTokens();
        googleIdToken = tokens.idToken;
      }

      if (!googleIdToken) {
        throw new Error('Could not retrieve Google ID Token');
      }

      // 4. Create Firebase Credential & Sign In to Firebase
      console.log('Signing in to Firebase...');
      const googleCredential =
        auth.GoogleAuthProvider.credential(googleIdToken);
      const firebaseUserCredential = await auth().signInWithCredential(
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
        return backendResponse.user;
      }

      return null;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
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
    } catch (error) {
      console.error('Backend Verification Error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  },
};
