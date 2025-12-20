import {AppConfig} from '../../../config/AppConfig';

export interface SearchSuggestion {
  id: string;
  name: string;
  base_price: number;
  thumbnail?: string;
  category_name?: string;
  sold_count?: number;
}

export interface SearchResponse {
  products: SearchSuggestion[];
  total?: number;
}

class SearchApi {
  private apiUrl = `${AppConfig.BASE_URL}/api`;

  /**
   * Tìm kiếm sản phẩm với keyword
   * @param keyword - từ khóa tìm kiếm
   * @param limit - số lượng kết quả mặc định 10
   */
  async searchProducts(
    keyword: string,
    limit: number = 10,
  ): Promise<SearchResponse> {
    try {
      if (!keyword.trim()) {
        return {products: [], total: 0};
      }

      const response = await fetch(
        `${this.apiUrl}/products?q=${encodeURIComponent(
          keyword,
        )}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Search results:', data);

      // API trả về { data, pagination }
      const products = data.data || data.products || [];
      const total = data.pagination?.total_items || data.total || 0;

      return {
        products,
        total,
      };
    } catch (error) {
      console.error('❌ Search error:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm nâng cao (với filter)
   */
  async searchProductsAdvanced(query: {
    keyword?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams();

      if (query.keyword) {
        params.append('q', query.keyword);
      }
      if (query.category_id) {
        params.append('category_id', query.category_id);
      }
      if (query.min_price) {
        params.append('min_price', query.min_price.toString());
      }
      if (query.max_price) {
        params.append('max_price', query.max_price.toString());
      }
      if (query.sort_by) {
        params.append('sort_by', query.sort_by);
      }
      params.append('page', (query.page || 1).toString());
      params.append('limit', (query.limit || 20).toString());

      const response = await fetch(
        `${this.apiUrl}/products?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Advanced search results:', data);

      // API trả về { data, pagination } từ service
      const products = data.data || data.products || [];
      const total = data.pagination?.total_items || data.total || 0;

      return {
        products,
        total,
      };
    } catch (error) {
      console.error('❌ Advanced search error:', error);
      throw error;
    }
  }
}

export const searchApi = new SearchApi();
