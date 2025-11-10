import {AppConfig} from '../../../config/AppConfig';

const BASE_URL = AppConfig.BASE_URL;

export const AuthApi = {
  register: async (data: any) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Lỗi đăng ký');
    return json;
  },

  verifyOTP: async (email: string, otp: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, otp}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'OTP không hợp lệ');
    return json;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Sai tài khoản hoặc mật khẩu');
    return json;
  },

  sendResetCode: async (email: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể gửi mã');
    return json;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, otp, newPassword}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Đặt lại mật khẩu thất bại');
    return json;
  },

  loginGoogle: async (accessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login/google`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({access_token: accessToken}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Đăng nhập Google thất bại');
    return json;
  },

  loginFacebook: async (accessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login/facebook`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({access_token: accessToken}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Đăng nhập Facebook thất bại');
    return json;
  },
};
