import {AppConfig} from '../../../config/AppConfig';
import {getAccessToken} from '../../../services/tokenService';
import {cacheService} from '../../../services/cacheService';

const BASE_URL = AppConfig.BASE_URL;

export interface AddressPayload {
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
  isDefault?: boolean;
}

export const AddressApi = {
  // Create new address
  createAddress: async (data: AddressPayload) => {
    try {
      const token = await getAccessToken();
      console.log('CreateAddress - Token:', token ? 'Found' : 'Not found');

      if (!token) {
        throw new Error('Bạn cần đăng nhập lại');
      }

      const res = await fetch(`${BASE_URL}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_name: data.fullName,
          recipient_phone: data.phoneNumber,
          province: data.province,
          district: data.district,
          ward: data.ward,
          address_detail: data.specificAddress,
          is_default: data.isDefault || false,
        }),
      });

      const json = await res.json();
      console.log('CreateAddress - Response status:', res.status);
      console.log('CreateAddress - Response:', json);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(json.error || json.message || 'Lỗi khi thêm địa chỉ');
      }

      // Clear addresses cache after creating new address
      await cacheService.clearByPrefix('user_addresses');

      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Get all addresses of current user
  getAddresses: async (forceRefresh: boolean = false) => {
    const token = await getAccessToken();
    console.log(
      'GetAddresses - Token:',
      token ? 'Found (' + token.substring(0, 20) + '...)' : 'Not found',
    );

    if (!token) {
      throw new Error('Token không tìm thấy - Bạn cần đăng nhập lại');
    }

    return await cacheService.executeWithCache(
      'user_addresses',
      async () => {
        console.log('GetAddresses - Calling API:', `${BASE_URL}/api/addresses`);
        const res = await fetch(`${BASE_URL}/api/addresses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        console.log('GetAddresses - Response status:', res.status);
        console.log('GetAddresses - Response:', json);

        if (!res.ok) {
          if (res.status === 401) {
            console.error('GetAddresses - 401 Unauthorized:', json);
            throw new Error(
              'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
            );
          }
          throw new Error(
            json.error || json.message || 'Lỗi khi lấy danh sách địa chỉ',
          );
        }

        return json;
      },
      {userId: token.substring(0, 20)},
      {ttl: 10 * 60 * 1000, forceRefresh}, // 10 minutes cache
    );
  },

  // Update address
  updateAddress: async (addressId: string, data: AddressPayload) => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_name: data.fullName,
          recipient_phone: data.phoneNumber,
          province: data.province,
          district: data.district,
          ward: data.ward,
          address_detail: data.specificAddress,
          is_default: data.isDefault || false,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Lỗi khi cập nhật địa chỉ');
      }

      // Clear addresses cache after update
      await cacheService.clearByPrefix('user_addresses');

      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Delete address
  deleteAddress: async (addressId: string) => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Lỗi khi xóa địa chỉ');
      }

      // Clear addresses cache after deletion
      await cacheService.clearByPrefix('user_addresses');

      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Set default address
  setDefaultAddress: async (addressId: string) => {
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${BASE_URL}/api/addresses/${addressId}/default`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Lỗi khi đặt địa chỉ mặc định');
      }

      // Clear addresses cache after setting default
      await cacheService.clearByPrefix('user_addresses');

      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Cache management methods
  clearAddressCache: async (): Promise<void> => {
    await cacheService.clearByPrefix('user_addresses');
  },
};
