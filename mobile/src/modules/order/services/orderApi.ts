import {AppConfig} from '../../../config/AppConfig';
import {getAccessToken} from '../../../services/tokenService';
import {cacheService} from '../../../services/cacheService';

const BASE_URL = AppConfig.BASE_URL;

export interface OrderItemPayload {
  variant_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  // ID địa chỉ giao hàng
  address_id: string;

  // Thông tin sản phẩm
  items: OrderItemPayload[];

  // Tài chính (optional - backend can calculate)
  subtotal_amount?: number;
  shipping_fee?: number;
  discount_amount?: number;
  total_amount?: number;

  // Phương thức thanh toán & voucher
  payment_method: string;
  voucher_code?: string;

  // Loại đơn hàng
  type: 'buy_now' | 'cart';

  // Ghi chú từ khách
  note?: string;
}

export interface Order {
  id: string;
  user_id: string;
  shipping_info: {
    name?: string;
    phone?: string;
    full_address?: string;
    recipient_name?: string;
    recipient_phone?: string;
    address_detail?: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  items?: any[];
  subtotal_amount?: number;
  subtotal?: number;
  shipping_fee?: number;
  shippingFee?: number;
  discount_amount?: number;
  discountAmount?: number;
  total_amount?: number;
  totalAmount?: number;
  payment_method: string;
  payment_status: string;
  status: string;
  voucher_id?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export const OrderApi = {
  // Tạo đơn hàng mới
  createOrder: async (data: CreateOrderPayload): Promise<Order> => {
    try {
      const token = await getAccessToken();
      console.log('CreateOrder - Token:', token ? 'Found' : 'Not found');

      if (!token) {
        throw new Error('Bạn cần đăng nhập lại');
      }

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      console.log('CreateOrder - Response status:', res.status);
      console.log('CreateOrder - Response:', json);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(json.error || json.message || 'Lỗi khi tạo đơn hàng');
      }

      const order = json.order || json.data || json;

      // Clear relevant caches after creating order
      await Promise.all([
        cacheService.clearByPrefix('user_orders'),
        cacheService.clearByPrefix('user_cart'), // Cart may be cleared after order
      ]);

      return order;
    } catch (error: any) {
      console.error('CreateOrder error:', error);
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Lấy chi tiết đơn hàng
  getOrder: async (
    orderId: string,
    forceRefresh: boolean = false,
  ): Promise<Order> => {
    console.log('GetOrder - Fetching order:', orderId);
    const token = await getAccessToken();

    if (!token) {
      throw new Error('Bạn cần đăng nhập lại');
    }

    return await cacheService.executeWithCache(
      'user_order',
      async () => {
        const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        console.log('GetOrder - Response status:', res.status);
        console.log('GetOrder - Response:', json);

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error(
              'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
            );
          }
          throw new Error(
            json.error || json.message || 'Lỗi khi lấy thông tin đơn hàng',
          );
        }

        return json.order || json.data || json;
      },
      {orderId, userId: token.substring(0, 20)},
      {ttl: 5 * 60 * 1000, forceRefresh}, // 5 minutes cache
    );
  },

  // Lấy danh sách đơn hàng
  getOrders: async (forceRefresh: boolean = false): Promise<Order[]> => {
    const token = await getAccessToken();

    if (!token) {
      throw new Error('Bạn cần đăng nhập lại');
    }

    return await cacheService.executeWithCache(
      'user_orders',
      async () => {
        const res = await fetch(`${BASE_URL}/api/orders?limit=1000&page=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error(
              'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
            );
          }
          throw new Error(
            json.error || json.message || 'Lỗi khi lấy danh sách đơn hàng',
          );
        }

        return json.orders || json.data || json;
      },
      {userId: token.substring(0, 20)},
      {ttl: 3 * 60 * 1000, forceRefresh}, // 3 minutes cache
    );
  },

  cancelOrder: async (orderId: string) => {
    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error('Token not found');
      }

      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get('content-type');
      let json: any;

      if (contentType && contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error('Server returned invalid response');
      }

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(
          json.error ||
            json.message ||
            `Lỗi ${res.status}: Không thể hủy đơn hàng`,
        );
      }

      // Clear relevant caches after cancelling order
      await Promise.all([
        cacheService.clearByPrefix('user_orders'),
        cacheService.clear('user_order', {
          orderId,
          userId: token.substring(0, 20),
        }),
      ]);

      return json.order || json.data || json;
    } catch (error: any) {
      console.error('CancelOrder error:', error);
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Cache management methods
  clearOrderCache: async (orderId?: string): Promise<void> => {
    if (orderId) {
      const token = await getAccessToken();
      if (token) {
        await cacheService.clear('user_order', {
          orderId,
          userId: token.substring(0, 20),
        });
      }
    } else {
      await cacheService.clearByPrefix('user_order');
    }
  },

  clearOrdersCache: async (): Promise<void> => {
    await cacheService.clearByPrefix('user_orders');
  },
};
