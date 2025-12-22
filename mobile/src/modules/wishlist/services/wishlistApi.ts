import axios from 'axios';
import {AppConfig} from '../../../config/AppConfig';
import {getTokens} from '../../../services/tokenService';
import {cacheService} from '../../../services/cacheService';

const API_URL = `${AppConfig.BASE_URL}/api/wishlist`;

export const wishlistApi = {
  async toggleWishlist(productId: string) {
    const tokenData = await getTokens();
    const token = tokenData?.accessToken;
    const response = await axios.post(
      `${API_URL}/toggle`,
      {product_id: productId},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Clear wishlist caches after toggle
    await Promise.all([
      cacheService.clearByPrefix('user_wishlist'),
      cacheService.clearByPrefix('wishlist_ids'),
    ]);

    return response.data;
  },

  async listWishlist(forceRefresh: boolean = false) {
    const tokenData = await getTokens();
    const token = tokenData?.accessToken;

    return await cacheService.executeWithCache(
      'user_wishlist',
      async () => {
        const response = await axios.get(`${API_URL}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      },
      {userId: token?.substring(0, 20)},
      {ttl: 5 * 60 * 1000, forceRefresh}, // 5 minutes cache
    );
  },

  async listWishlistIds(forceRefresh: boolean = false) {
    const tokenData = await getTokens();
    const token = tokenData?.accessToken;

    return await cacheService.executeWithCache(
      'wishlist_ids',
      async () => {
        const response = await axios.get(`${API_URL}/ids`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      },
      {userId: token?.substring(0, 20)},
      {ttl: 10 * 60 * 1000, forceRefresh}, // 10 minutes cache (longer for IDs)
    );
  },

  async getWishlistStatus(productId: string) {
    const tokenData = await getTokens();
    const token = tokenData?.accessToken;

    try {
      // Get wishlist IDs and check if productId is in there
      // Force refresh to get latest data
      const idsResponse = await this.listWishlistIds(true);
      console.log(
        '[wishlistApi] getWishlistStatus - idsResponse:',
        idsResponse,
      );

      // Backend returns { ids: [...] } or just the array directly
      let wishlistIds = [];
      if (idsResponse?.ids) {
        wishlistIds = idsResponse.ids;
      } else if (idsResponse?.data) {
        wishlistIds = idsResponse.data;
      } else if (idsResponse?.wishlist_ids) {
        wishlistIds = idsResponse.wishlist_ids;
      } else if (Array.isArray(idsResponse)) {
        wishlistIds = idsResponse;
      }

      const isLiked = wishlistIds.includes(productId);
      console.log(
        '[wishlistApi] getWishlistStatus - productId:',
        productId,
        'isLiked:',
        isLiked,
        'wishlistIds:',
        wishlistIds,
      );
      return {
        is_liked: isLiked,
      };
    } catch (error) {
      console.error('[wishlistApi] Error checking wishlist status:', error);
      return {is_liked: false};
    }
  },

  // Cache management methods
  async clearWishlistCache(): Promise<void> {
    await Promise.all([
      cacheService.clearByPrefix('user_wishlist'),
      cacheService.clearByPrefix('wishlist_ids'),
    ]);
  },
};
