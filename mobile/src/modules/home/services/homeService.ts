import {AppConfig} from '../../../config/AppConfig';

export interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  thumbnail?: string;
  category_name?: string;
  rating_average?: number;
  review_count?: number;
  sold_count?: number;
  is_active: boolean;
  variants?: any[];
  images?: any[];
}

export interface ProductsResponse {
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

class HomeService {
  private apiUrl = `${AppConfig.BASE_URL}/api`;

  /**
   * Fetch sản phẩm mới (New Products)
   * Sort by created_at DESC (mới nhất)
   */
  async getNewProducts(limit: number = 10): Promise<ProductsResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/products?limit=${limit}&sort_by=created_at&sort_order=desc`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[HomeService] Error fetching new products:', error);
      throw error;
    }
  }

  /**
   * Fetch sản phẩm bán chạy (Best Sellers)
   * Sort by sold_count DESC (bán nhiều nhất)
   */
  async getBestSellers(limit: number = 10): Promise<ProductsResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/products?limit=${limit}&sort_by=sold_count&sort_order=desc`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[HomeService] Error fetching best sellers:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm sản phẩm
   */
  async searchProducts(
    keyword: string,
    limit: number = 10,
  ): Promise<ProductsResponse> {
    try {
      const response = await fetch(
        `${this.apiUrl}/products?q=${encodeURIComponent(
          keyword,
        )}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[HomeService] Error searching products:', error);
      throw error;
    }
  }
}

export default new HomeService();
