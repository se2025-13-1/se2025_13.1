import {AppConfig} from '../../../config/AppConfig';
import {getAccessToken} from '../../../services/tokenService';

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

      if (!res.ok) {
        throw new Error(json.error || 'Lỗi khi thêm địa chỉ');
      }

      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Get all addresses of current user
  getAddresses: async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Lỗi khi lấy danh sách địa chỉ');
      }

      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối');
    }
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

      return json;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },
};
