import {AppConfig} from '../../../config/AppConfig';
import {getAccessToken} from '../../../services/tokenService';
import {cacheService} from '../../../services/cacheService';

const BASE_URL = AppConfig.BASE_URL;

export interface CartItem {
  id?: string;
  item_id?: string;
  variant_id?: string;
  product_variant_id?: string;
  product_id?: string;
  product_name: string;
  price: number;
  image_url?: string;
  thumbnail?: string;
  color?: string;
  size?: string;
  quantity: number;
  subtotal?: number;
}

export interface CartResponse {
  cart_id: string;
  items: CartItem[];
  total_amount: number;
}

export const CartApi = {
  /**
   * Lấy giỏ hàng hiện tại
   */
  getCart: async (forceRefresh: boolean = false): Promise<CartResponse> => {
    const token = await getAccessToken();
    console.log(
      'GetCart - Token:',
      token ? 'Found (' + token.substring(0, 20) + '...)' : 'Not found',
    );

    if (!token) {
      throw new Error('Bạn cần đăng nhập lại');
    }

    return await cacheService.executeWithCache(
      'user_cart',
      async () => {
        console.log('GetCart - Calling API:', `${BASE_URL}/api/cart`);
        const res = await fetch(`${BASE_URL}/api/cart`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        console.log('GetCart - Response status:', res.status);
        console.log('GetCart - Response:', json);

        if (!res.ok) {
          if (res.status === 401) {
            console.error('GetCart - 401 Unauthorized:', json);
            throw new Error(
              'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
            );
          }
          throw new Error(json.error || json.message || 'Lỗi khi lấy giỏ hàng');
        }

        return json;
      },
      {userId: token.substring(0, 20)},
      {ttl: 2 * 60 * 1000, forceRefresh}, // 2 minutes cache for cart
    );
  },

  /**
   * Thêm sản phẩm vào giỏ
   */
  addToCart: async (
    variantId: string,
    quantity: number,
  ): Promise<CartResponse> => {
    try {
      const token = await getAccessToken();
      console.log('AddToCart - Token:', token ? 'Found' : 'Not found');

      if (!token) {
        throw new Error('Bạn cần đăng nhập lại');
      }

      console.log('AddToCart - variant_id:', variantId, 'quantity:', quantity);
      const res = await fetch(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity: quantity,
        }),
      });

      const json = await res.json();
      console.log('AddToCart - Response status:', res.status);
      console.log('AddToCart - Response:', json);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(json.error || json.message || 'Lỗi khi thêm vào giỏ');
      }

      // Clear cart cache after successful addition
      await cacheService.clearByPrefix('user_cart');

      return json;
    } catch (error: any) {
      console.error('AddToCart - Error:', error);
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  updateItemQuantity: async (
    itemId: string,
    quantity: number,
  ): Promise<CartResponse> => {
    try {
      const token = await getAccessToken();
      console.log('UpdateItem - Token:', token ? 'Found' : 'Not found');

      if (!token) {
        throw new Error('Bạn cần đăng nhập lại');
      }

      console.log('UpdateItem - item_id:', itemId, 'quantity:', quantity);
      const res = await fetch(`${BASE_URL}/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: quantity,
        }),
      });

      const json = await res.json();
      console.log('UpdateItem - Response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(
          json.error || json.message || 'Lỗi khi cập nhật số lượng',
        );
      }

      // Clear cart cache after successful update
      await cacheService.clearByPrefix('user_cart');

      return json;
    } catch (error: any) {
      console.error('UpdateItem - Error:', error);
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  /**
   * Xóa sản phẩm khỏi giỏ
   */
  removeItem: async (itemId: string): Promise<CartResponse> => {
    try {
      const token = await getAccessToken();
      console.log('RemoveItem - Token:', token ? 'Found' : 'Not found');

      if (!token) {
        throw new Error('Bạn cần đăng nhập lại');
      }

      console.log('RemoveItem - item_id:', itemId);
      const res = await fetch(`${BASE_URL}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      console.log('RemoveItem - Response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        }
        throw new Error(json.error || json.message || 'Lỗi khi xóa sản phẩm');
      }

      // Clear cart cache after successful removal
      await cacheService.clearByPrefix('user_cart');

      return json;
    } catch (error: any) {
      console.error('RemoveItem - Error:', error);
      throw new Error(error.message || 'Lỗi kết nối');
    }
  },

  // Cache management methods
  clearCartCache: async (): Promise<void> => {
    await cacheService.clearByPrefix('user_cart');
  },
};
