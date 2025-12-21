import {AppConfig} from '../../../config/AppConfig';
import {cacheService} from '../../../services/cacheService';

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
  async getNewProducts(
    limit: number = 10,
    forceRefresh: boolean = false,
  ): Promise<ProductsResponse> {
    return await cacheService.executeWithCache(
      'new_products',
      async () => {
        const response = await fetch(
          `${this.apiUrl}/products?limit=${limit}&sort_by=created_at&sort_order=desc`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ProductsResponse = await response.json();
        return data;
      },
      {limit},
      {ttl: 10 * 60 * 1000, forceRefresh}, // 10 minutes cache
    );
  }

  /**
   * Fetch sản phẩm bán chạy (Best Sellers)
   * Sort by sold_count DESC (bán nhiều nhất)
   */
  async getBestSellers(
    limit: number = 10,
    forceRefresh: boolean = false,
  ): Promise<ProductsResponse> {
    return await cacheService.executeWithCache(
      'best_sellers',
      async () => {
        const response = await fetch(
          `${this.apiUrl}/products?limit=${limit}&sort_by=sold_count&sort_order=desc`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ProductsResponse = await response.json();
        return data;
      },
      {limit},
      {ttl: 15 * 60 * 1000, forceRefresh}, // 15 minutes cache (longer for best sellers)
    );
  }

  /**
   * Tìm kiếm sản phẩm
   */
  async searchProducts(
    keyword: string,
    limit: number = 10,
    forceRefresh: boolean = false,
  ): Promise<ProductsResponse> {
    return await cacheService.executeWithCache(
      'search_products',
      async () => {
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
      },
      {keyword, limit},
      {ttl: 5 * 60 * 1000, forceRefresh}, // 5 minutes cache for search
    );
  }

  /**
   * Fetch sản phẩm theo danh mục
   * @param categoryId ID của danh mục
   * @param limit Số sản phẩm tối đa
   * @param forceRefresh Có force refresh cache không
   */
  async getProductsByCategory(
    categoryId: string,
    limit: number = 50,
    forceRefresh: boolean = false,
  ): Promise<ProductsResponse> {
    return await cacheService.executeWithCache(
      'products_by_category',
      async () => {
        const response = await fetch(
          `${this.apiUrl}/products?category_id=${categoryId}&limit=${limit}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ProductsResponse = await response.json();
        return data;
      },
      {categoryId, limit},
      {ttl: 5 * 60 * 1000, forceRefresh}, // 5 minutes cache
    );
  }

  // Cache management methods
  async clearNewProductsCache(): Promise<void> {
    await cacheService.clearByPrefix('new_products');
  }

  async clearBestSellersCache(): Promise<void> {
    await cacheService.clearByPrefix('best_sellers');
  }

  async clearSearchCache(): Promise<void> {
    await cacheService.clearByPrefix('search_products');
  }

  async clearAllCache(): Promise<void> {
    await this.clearNewProductsCache();
    await this.clearBestSellersCache();
    await this.clearSearchCache();
  }
}

export default new HomeService();
