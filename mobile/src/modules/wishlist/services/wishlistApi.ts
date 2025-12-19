import axios from 'axios';
import {AppConfig} from '../../../config/AppConfig';
import {getTokens} from '../../../services/tokenService';

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
    return response.data;
  },

  async listWishlist() {
    const tokenData = await getTokens();
    const token = tokenData?.accessToken;
    const response = await axios.get(`${API_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async listWishlistIds() {
    const tokenData = await getTokens();
    const token = tokenData?.accessToken;
    const response = await axios.get(`${API_URL}/ids`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
