/**
 * Cache Integration Guide
 *
 * This file demonstrates how to integrate caching throughout your React Native app
 * to prevent unnecessary API calls and improve performance.
 */

// =====================================================
// 1. USING CACHE IN SCREENS/COMPONENTS
// =====================================================

/* 
// Example: HomeScreen with cached data
import React from 'react';
import {View, Text, FlatList, RefreshControl} from 'react-native';
import {useCache} from '../hooks/useCache';
import homeService from '../services/homeService';

const HomeScreen = () => {
  // Use cache for new products
  const {
    data: newProducts,
    loading: loadingNew,
    error: errorNew,
    refresh: refreshNew
  } = useCache(
    'new_products',
    () => homeService.getNewProducts(10),
    { limit: 10 },
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );

  // Use cache for best sellers
  const {
    data: bestSellers,
    loading: loadingBest,
    refresh: refreshBest
  } = useCache(
    'best_sellers',
    () => homeService.getBestSellers(10),
    { limit: 10 },
    { ttl: 15 * 60 * 1000 } // 15 minutes
  );

  const handleRefresh = async () => {
    await Promise.all([refreshNew(), refreshBest()]);
  };

  return (
    <View>
      <FlatList
        data={newProducts?.data || []}
        refreshControl={
          <RefreshControl
            refreshing={loadingNew}
            onRefresh={handleRefresh}
          />
        }
        // ... rest of props
      />
    </View>
  );
};
*/

// =====================================================
// 2. CACHE INVALIDATION STRATEGIES
// =====================================================

/*
// Example: CartScreen with cache invalidation
import React from 'react';
import {CartApi} from '../services/cartApi';
import {globalCacheManager} from '../services/globalCacheManager';
import {useUserCache} from '../hooks/useCache';

const CartScreen = () => {
  const {
    data: cart,
    loading,
    refresh: refreshCart
  } = useUserCache(
    'cart',
    () => CartApi.getCart(),
    {},
    { ttl: 2 * 60 * 1000 } // 2 minutes for cart
  );

  const handleAddToCart = async (variantId: string, quantity: number) => {
    try {
      await CartApi.addToCart(variantId, quantity);
      
      // Automatically invalidate cache and refresh
      await globalCacheManager.handleUserAction('add_to_cart');
      await refreshCart();
      
    } catch (error) {
      console.error('Add to cart failed:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await CartApi.removeItem(itemId);
      
      // Cache is automatically cleared in CartApi.removeItem
      await refreshCart();
      
    } catch (error) {
      console.error('Remove item failed:', error);
    }
  };

  return (
    // Your cart UI here
  );
};
*/

// =====================================================
// 3. AUTHENTICATION & CACHE MANAGEMENT
// =====================================================

/*
// Example: Login flow with cache management
import {AuthApi} from '../services/authApi';
import {globalCacheManager} from '../services/globalCacheManager';

const LoginScreen = () => {
  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await AuthApi.login(email, password);
      
      // Store tokens...
      
      // Pre-warm cache for better UX
      await globalCacheManager.handleUserAction('login');
      
      // Navigate to main app
      navigation.navigate('Main');
      
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all user-specific cache
      await globalCacheManager.handleUserAction('logout');
      
      // Clear tokens...
      
      // Navigate to login
      navigation.navigate('Login');
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
};
*/

// =====================================================
// 4. ADVANCED CACHE PATTERNS
// =====================================================

/*
// Example: ProductDetailScreen with optimistic updates
const ProductDetailScreen = ({route}) => {
  const {productId} = route.params;
  
  const {
    data: product,
    loading,
    refresh: refreshProduct
  } = useProductCache(
    'details',
    () => productDetailsService.getProductDetails(productId),
    { productId },
    { ttl: 15 * 60 * 1000 }
  );

  const {
    data: wishlistIds,
    refresh: refreshWishlist
  } = useUserCache(
    'wishlist_ids',
    () => wishlistApi.listWishlistIds(),
    {},
    { ttl: 10 * 60 * 1000 }
  );

  const isInWishlist = wishlistIds?.includes(productId) || false;

  const handleToggleWishlist = async () => {
    try {
      // Optimistic update
      setOptimisticWishlist(!isInWishlist);
      
      await wishlistApi.toggleWishlist(productId);
      
      // Cache is automatically cleared in wishlistApi.toggleWishlist
      await refreshWishlist();
      
    } catch (error) {
      // Revert optimistic update
      setOptimisticWishlist(isInWishlist);
      console.error('Wishlist toggle failed:', error);
    }
  };

  return (
    // Your product detail UI
  );
};
*/

// =====================================================
// 5. BACKGROUND DATA SYNC
// =====================================================

/*
// Example: App.tsx with background sync
import {useEffect} from 'react';
import {AppState} from 'react-native';
import {globalCacheManager} from '../services/globalCacheManager';

const App = () => {
  useEffect(() => {
    // Pre-warm cache on app startup
    globalCacheManager.preWarmCache();

    // Set up background refresh when app comes to foreground
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Refresh critical data when app becomes active
        globalCacheManager.refreshData('cart');
        globalCacheManager.refreshData('profile');
      }
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  return (
    // Your app components
  );
};
*/

// =====================================================
// 6. CACHE DEBUGGING & MONITORING
// =====================================================

/*
// Example: Cache debug screen (for development)
const CacheDebugScreen = () => {
  const [stats, setStats] = useState(null);

  const loadStats = () => {
    const cacheStats = globalCacheManager.getCacheStats();
    setStats(cacheStats);
  };

  const clearAllCache = async () => {
    await globalCacheManager.clearAllCache();
    loadStats();
    Alert.alert('Success', 'All cache cleared');
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <View>
      <Text>Memory Cache Size: {stats?.memorySize || 0}</Text>
      <Text>Cached Keys: {stats?.memoryKeys?.length || 0}</Text>
      
      <Button title="Clear All Cache" onPress={clearAllCache} />
      <Button title="Refresh Stats" onPress={loadStats} />
      
      <FlatList
        data={stats?.memoryKeys || []}
        renderItem={({item}) => <Text>{item}</Text>}
      />
    </View>
  );
};
*/

// =====================================================
// 7. CACHE CONFIGURATION BY SCREEN TYPE
// =====================================================

const CACHE_CONFIGS = {
  // User-specific data (shorter TTL, clear on logout)
  profile: {ttl: 10 * 60 * 1000}, // 10 minutes
  cart: {ttl: 2 * 60 * 1000}, // 2 minutes
  orders: {ttl: 5 * 60 * 1000}, // 5 minutes
  addresses: {ttl: 15 * 60 * 1000}, // 15 minutes
  wishlist: {ttl: 10 * 60 * 1000}, // 10 minutes

  // Product data (longer TTL, shared across users)
  products: {ttl: 30 * 60 * 1000}, // 30 minutes
  categories: {ttl: 60 * 60 * 1000}, // 1 hour
  product_details: {ttl: 20 * 60 * 1000}, // 20 minutes

  // Dynamic content (shorter TTL)
  search_results: {ttl: 5 * 60 * 1000}, // 5 minutes
  best_sellers: {ttl: 15 * 60 * 1000}, // 15 minutes
  new_products: {ttl: 10 * 60 * 1000}, // 10 minutes
};

export default CACHE_CONFIGS;
