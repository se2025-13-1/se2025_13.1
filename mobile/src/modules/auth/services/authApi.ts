import {AppConfig} from '../../../config/AppConfig';
import {getAccessToken} from '../../../services/tokenService';
import {cacheService} from '../../../services/cacheService';

const BASE_URL = AppConfig.BASE_URL;

export const AuthApi = {
  register: async (data: any) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi đăng ký');
    }
    return json;
  },

  verifyOTP: async (email: string, otp: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, otp}),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'OTP không hợp lệ');
    }
    return json;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Sai tài khoản hoặc mật khẩu');
    }
    return json;
  },

  sendResetCode: async (email: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email}),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Không thể gửi mã');
    }
    return json;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, otp, newPassword}),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Đặt lại mật khẩu thất bại');
    }
    return json;
  },

  loginGoogle: async (accessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({access_token: accessToken}),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Đăng nhập Google thất bại');
    }
    return json;
  },

  loginFacebook: async (accessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/facebook`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({access_token: accessToken}),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Đăng nhập Facebook thất bại');
    }
    return json;
  },

  getProfile: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token found');
      }

      // Use cache for profile data (5 minutes TTL)
      return await cacheService.executeWithCache(
        'profile',
        async () => {
          console.log(
            'Fetching profile with token:',
            token.substring(0, 20) + '...',
          );

          const res = await fetch(`${BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('Profile response status:', res.status);
          const json = await res.json();

          if (!res.ok) {
            console.error('Profile fetch error:', res.status, json);
            throw new Error(json.error || 'Lỗi lấy thông tin cá nhân');
          }

          return json;
        },
        {token: token.substring(0, 20)}, // Use partial token as cache key
        {ttl: 5 * 60 * 1000}, // 5 minutes cache
      );
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  // Clear profile cache when needed
  clearProfileCache: async () => {
    await cacheService.clearByPrefix('profile');
  },
};
