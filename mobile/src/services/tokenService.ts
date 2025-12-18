import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface StoredToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface StoredUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

// Save tokens to AsyncStorage
export const saveTokens = async (
  accessToken: string,
  refreshToken?: string,
  expiresIn?: number,
): Promise<void> => {
  try {
    const expiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + 24 * 60 * 60 * 1000; // Default 24 hours

    const tokenData: StoredToken = {
      accessToken,
      refreshToken,
      expiresAt,
    };

    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
    console.log('✅ Tokens saved successfully');
  } catch (error) {
    console.error('❌ Error saving tokens:', error);
    throw error;
  }
};

// Get tokens from AsyncStorage
export const getTokens = async (): Promise<StoredToken | null> => {
  try {
    const tokenData = await AsyncStorage.getItem(TOKEN_KEY);
    if (!tokenData) {
      return null;
    }

    const parsed = JSON.parse(tokenData);

    // ✅ KHÔNG tự động xóa token dựa trên expiresAt
    // Lý do: Backend có thể sử dụng session, JWT TTL khác, hoặc không kiểm tra expiry
    // Để server quyết định khi nhận lỗi 401, lúc đó mới xóa token
    //
    // if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
    //   console.log('⚠️ Token expired, clearing...');
    //   await clearTokens();
    //   return null;
    // }

    return parsed;
  } catch (error) {
    console.error('❌ Error getting tokens:', error);
    return null;
  }
};

// Get access token only
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = await getTokens();
    return tokens?.accessToken || null;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    return null;
  }
};

// Save user info
export const saveUser = async (user: StoredUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('✅ User saved successfully');
  } catch (error) {
    console.error('❌ Error saving user:', error);
    throw error;
  }
};

// Get user info
export const getUser = async (): Promise<StoredUser | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) {
      return null;
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return null;
  }
};

// Clear all tokens and user data
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY]);
    console.log('✅ Tokens cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const tokens = await getTokens();
    return !!tokens?.accessToken;
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
    return false;
  }
};

// Refresh token (if backend supports it)
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = await getTokens();
    if (!tokens?.refreshToken) {
      console.log('❌ No refresh token available');
      return null;
    }

    // TODO: Call refresh endpoint when backend supports it
    // const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({refreshToken: tokens.refreshToken}),
    // });
    // const data = await response.json();
    // if (data.accessToken) {
    //   await saveTokens(data.accessToken, data.refreshToken, data.expiresIn);
    //   return data.accessToken;
    // }

    return null;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return null;
  }
};
