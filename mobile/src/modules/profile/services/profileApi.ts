import {AppConfig} from '../../../config/AppConfig';
import {getAccessToken} from '../../../services/tokenService';

const BASE_URL = AppConfig.BASE_URL;

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  avatar_url?: string;
}

export const ProfileApi = {
  /**
   * Update user profile
   * PUT /auth/profile
   */
  updateProfile: async (data: UpdateProfileData) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token found');
      }

      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Cập nhật hồ sơ thất bại');
      }

      return json;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * Upload image to server
   * POST /upload/avatar
   */
  uploadImage: async (imageUri: string): Promise<string> => {
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token found');
      }

      // Create FormData
      const formData = new FormData();

      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'image.jpg';

      // Determine file type
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Append image to FormData
      formData.append('image', {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      const res = await fetch(`${BASE_URL}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Tải ảnh lên thất bại');
      }

      // Return the uploaded image URL
      return json.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },
};
