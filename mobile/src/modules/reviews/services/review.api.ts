import {AppConfig} from '../../../config/AppConfig';
import {getAccessToken} from '../../../services/tokenService';

export interface ReviewPayload {
  order_item_id: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  order_item_id: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
  variant_info?: any;
  // Additional fields from getReviewsByOrder endpoint
  product_name?: string;
  full_product_name?: string;
  thumbnail?: string;
  quantity?: number;
  unit_price?: number;
}

export interface ReviewResponse {
  message: string;
  review: ProductReview;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
}

export const ReviewApi = {
  // Tạo đánh giá mới - khớp với BE POST /reviews
  async createReview(payload: ReviewPayload): Promise<ReviewResponse> {
    const token = await getAccessToken();

    const response = await fetch(`${AppConfig.BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi gửi đánh giá');
    }

    return response.json();
  },

  // Lấy danh sách đánh giá của sản phẩm - khớp với BE GET /reviews/product/:productId
  async getProductReviews(
    productId: string,
    params?: {page?: number; limit?: number},
  ): Promise<ProductReviewsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(
      `${
        AppConfig.BASE_URL
      }/api/reviews/product/${productId}?${searchParams.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi tải đánh giá');
    }

    return response.json();
  },

  // Lấy reviews theo đơn hàng - khớp với BE GET /reviews/order/:orderId
  async getReviewsByOrder(orderId: string): Promise<ProductReview[]> {
    const token = await getAccessToken();

    const response = await fetch(
      `${AppConfig.BASE_URL}/api/reviews/order/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lỗi khi tải đánh giá đơn hàng');
    }

    const data = await response.json();
    return data.reviews || [];
  },
};
