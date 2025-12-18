import axios from 'axios';
import {AppConfig} from '../../../config/AppConfig';

const API_BASE_URL = `${AppConfig.BASE_URL}/api`;

export interface Voucher {
  id: string;
  code: string;
  discount_value: number;
  discount_type: 'percent' | 'percentage' | 'fixed';
  min_purchase: number;
  max_discount: number;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const VoucherApi = {
  // Lấy tất cả vouchers từ server (public endpoint)
  getAllVouchers: async (): Promise<Voucher[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vouchers`);
      return response.data.vouchers || [];
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }
  },

  // Kiểm tra voucher code
  checkVoucher: async (code: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/vouchers/check`, {
        code,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking voucher:', error);
      return {discountAmount: 0, voucherId: null};
    }
  },
};
