import {Settings, LoginManager, AccessToken} from 'react-native-fbsdk-next';

/**
 * Facebook SDK Configuration
 * This file initializes the Facebook SDK for React Native
 */

export const initializeFacebookSDK = () => {
  // 🔥 QUAN TRỌNG: Thay đổi các giá trị này!
  // Lấy từ: https://developers.facebook.com/apps/ > Your App > Settings
  Settings.setAppID('YOUR_FACEBOOK_APP_ID'); // 👈 Thay bằng Facebook App ID thực

  // Lấy từ: Facebook App Settings > Advanced > Client Token
  Settings.setClientToken('YOUR_FACEBOOK_CLIENT_TOKEN'); // 👈 Thay bằng Client Token thực

  // Note: setLogLevel is not available in current Facebook SDK version
  // For debugging, check console logs from LoginManager

  console.log('Facebook SDK initialized');
};

/**
 * Handles Facebook Login
 * @returns {Promise<{accessToken: string, userInfo: object} | null>}
 */
export const handleFacebookLogin = async () => {
  try {
    // Check if user is already logged in
    const currentAccessToken = await AccessToken.getCurrentAccessToken();
    if (currentAccessToken) {
      console.log('User already logged in to Facebook');
      return {
        accessToken: currentAccessToken.accessToken,
        userInfo: null, // You can fetch user info here if needed
      };
    }

    // Request login with read permissions
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      console.log('Facebook login was cancelled');
      return null;
    }

    // Get access token
    const accessToken = await AccessToken.getCurrentAccessToken();
    if (accessToken) {
      console.log('Facebook login successful:', accessToken.accessToken);

      // TODO: Fetch user information from Facebook Graph API if needed
      // const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken.accessToken}&fields=id,name,email,picture`);
      // const userInfo = await response.json();

      return {
        accessToken: accessToken.accessToken,
        userInfo: null, // Replace with actual user info if fetched
      };
    }

    return null;
  } catch (error) {
    console.error('Facebook login error:', error);
    throw error;
  }
};

/**
 * Handles Facebook Logout
 */
export const handleFacebookLogout = async () => {
  try {
    await LoginManager.logOut();
    console.log('Facebook logout successful');
  } catch (error) {
    console.error('Facebook logout error:', error);
    throw error;
  }
};
