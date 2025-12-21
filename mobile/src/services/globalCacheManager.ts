import {cacheService} from './cacheService';
import {AuthApi} from '../modules/auth/services/authApi';
import {CartApi} from '../modules/cart/services/cartApi';
import {OrderApi} from '../modules/order/services/orderApi';
import {wishlistApi} from '../modules/wishlist/services/wishlistApi';
import {AddressApi} from '../modules/address/services/addressApi';
import homeService from '../modules/home/services/homeService';
import productDetailsService from '../modules/productdetails/services/productDetailsService';

/**
 * Global cache management service
 * Provides centralized cache invalidation and management
 */
class GlobalCacheManager {
  /**
   * Clear all user-specific data when user logs out
   */
  async clearUserData(): Promise<void> {
    await Promise.all([
      cacheService.clearByPrefix('profile'),
      cacheService.clearByPrefix('user_cart'),
      cacheService.clearByPrefix('user_orders'),
      cacheService.clearByPrefix('user_order'),
      cacheService.clearByPrefix('user_wishlist'),
      cacheService.clearByPrefix('wishlist_ids'),
      cacheService.clearByPrefix('user_addresses'),
    ]);
    console.log('✅ User-specific cache cleared');
  }

  /**
   * Clear all product-related cache (use when products are updated)
   */
  async clearProductData(): Promise<void> {
    await Promise.all([
      cacheService.clearByPrefix('product_details'),
      cacheService.clearByPrefix('new_products'),
      cacheService.clearByPrefix('best_sellers'),
      cacheService.clearByPrefix('search_products'),
    ]);
    console.log('✅ Product cache cleared');
  }

  /**
   * Clear specific product cache
   */
  async clearProduct(productId: string): Promise<void> {
    await productDetailsService.clearProductDetailsCache(productId);
    // Also clear search results that might contain this product
    await cacheService.clearByPrefix('search_products');
    console.log(`✅ Product ${productId} cache cleared`);
  }

  /**
   * Clear order-related cache (when order status changes)
   */
  async clearOrderData(): Promise<void> {
    await Promise.all([
      cacheService.clearByPrefix('user_orders'),
      cacheService.clearByPrefix('user_order'),
    ]);
    console.log('✅ Order cache cleared');
  }

  /**
   * Clear cart cache (when cart is modified)
   */
  async clearCartData(): Promise<void> {
    await CartApi.clearCartCache();
    console.log('✅ Cart cache cleared');
  }

  /**
   * Clear wishlist cache (when wishlist is modified)
   */
  async clearWishlistData(): Promise<void> {
    await wishlistApi.clearWishlistCache();
    console.log('✅ Wishlist cache cleared');
  }

  /**
   * Clear address cache (when addresses are modified)
   */
  async clearAddressData(): Promise<void> {
    await AddressApi.clearAddressCache();
    console.log('✅ Address cache cleared');
  }

  /**
   * Clear home screen cache (refresh home content)
   */
  async clearHomeData(): Promise<void> {
    await homeService.clearAllCache();
    console.log('✅ Home cache cleared');
  }

  /**
   * Clear all application cache
   */
  async clearAllCache(): Promise<void> {
    await cacheService.clearAll();
    console.log('✅ All application cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }

  /**
   * Refresh specific data type with force refresh
   */
  async refreshData(dataType: string, params?: any): Promise<void> {
    switch (dataType) {
      case 'profile':
        await AuthApi.getProfile();
        break;
      case 'cart':
        await CartApi.getCart(true);
        break;
      case 'orders':
        await OrderApi.getOrders(true);
        break;
      case 'wishlist':
        await wishlistApi.listWishlist(true);
        await wishlistApi.listWishlistIds(true);
        break;
      case 'addresses':
        await AddressApi.getAddresses(true);
        break;
      case 'home':
        await homeService.getNewProducts(10, true);
        await homeService.getBestSellers(10, true);
        break;
      case 'product':
        if (params?.productId) {
          await productDetailsService.getProductDetails(params.productId, true);
        }
        break;
      default:
        console.warn(`Unknown data type: ${dataType}`);
    }
  }

  /**
   * Pre-warm cache for essential data (call on app startup)
   */
  async preWarmCache(): Promise<void> {
    try {
      // Pre-load essential data in background
      const promises = [];

      // Load home page data
      promises.push(
        homeService
          .getNewProducts(10)
          .catch(err => console.log('Pre-warm new products failed:', err)),
      );
      promises.push(
        homeService
          .getBestSellers(10)
          .catch(err => console.log('Pre-warm best sellers failed:', err)),
      );

      // Load user data if logged in
      promises.push(
        AuthApi.getProfile().catch(err =>
          console.log('Pre-warm profile failed:', err),
        ),
      );
      promises.push(
        CartApi.getCart().catch(err =>
          console.log('Pre-warm cart failed:', err),
        ),
      );
      promises.push(
        wishlistApi
          .listWishlistIds()
          .catch(err => console.log('Pre-warm wishlist failed:', err)),
      );

      await Promise.allSettled(promises);
      console.log('✅ Cache pre-warming completed');
    } catch (error) {
      console.error('Cache pre-warming error:', error);
    }
  }

  /**
   * Handle cache invalidation after specific user actions
   */
  async handleUserAction(action: string, params?: any): Promise<void> {
    switch (action) {
      case 'login':
        await this.preWarmCache();
        break;
      case 'logout':
        await this.clearUserData();
        break;
      case 'add_to_cart':
        await this.clearCartData();
        break;
      case 'place_order':
        await Promise.all([this.clearCartData(), this.clearOrderData()]);
        break;
      case 'cancel_order':
        await this.clearOrderData();
        break;
      case 'toggle_wishlist':
        await this.clearWishlistData();
        break;
      case 'update_address':
        await this.clearAddressData();
        break;
      case 'update_profile':
        await AuthApi.clearProfileCache();
        break;
      default:
        console.log(`No cache invalidation needed for action: ${action}`);
    }
  }
}

export const globalCacheManager = new GlobalCacheManager();
