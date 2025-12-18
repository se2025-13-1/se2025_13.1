import {AppConfig} from '../../../config/AppConfig';

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  color_ref: string | null; // null = ảnh chung (general image)
  display_order?: number;
}

export interface ProductDetails {
  id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  is_active: boolean;
  rating_average?: number;
  review_count?: number;
  sold_count?: number;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductDetailsResponse {
  product: ProductDetails;
}

class ProductDetailsService {
  private apiUrl = `${AppConfig.BASE_URL}/api`;

  /**
   * Fetch chi tiết sản phẩm bao gồm variants, images
   */
  async getProductDetails(productId: string): Promise<ProductDetailsResponse> {
    try {
      console.log(`[ProductDetails] Fetching product: ${productId}`);

      const response = await fetch(`${this.apiUrl}/products/${productId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductDetailsResponse = await response.json();

      console.log(`[ProductDetails] Fetched product:`, {
        id: data.product.id,
        name: data.product.name,
        variants: data.product.variants?.length,
        images: data.product.images?.length,
      });

      return data;
    } catch (error) {
      console.error(
        '[ProductDetailsService] Error fetching product details:',
        error,
      );
      throw error;
    }
  }

  /**
   * Lấy ảnh chung (không gán màu cụ thể)
   */
  getGeneralImages(images?: ProductImage[]): ProductImage[] {
    if (!images) return [];
    return images.filter(img => !img.color_ref);
  }

  /**
   * Lấy ảnh theo màu
   */
  getImagesByColor(images?: ProductImage[], color?: string): ProductImage[] {
    if (!images || !color) return [];
    return images.filter(img => img.color_ref === color);
  }

  /**
   * Lấy danh sách các màu có sẵn từ variants
   */
  getAvailableColors(variants?: ProductVariant[]): string[] {
    if (!variants) return [];
    const colors = new Set<string>();
    variants.forEach(v => {
      if (v.color) colors.add(v.color);
    });
    return Array.from(colors);
  }

  /**
   * Lấy variants theo màu
   */
  getVariantsByColor(
    variants?: ProductVariant[],
    color?: string,
  ): ProductVariant[] {
    if (!variants || !color) return variants || [];
    return variants.filter(v => v.color === color);
  }

  /**
   * Tính tổng stock
   */
  getTotalStock(variants?: ProductVariant[]): number {
    if (!variants) return 0;
    return variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
  }
}

export default new ProductDetailsService();
