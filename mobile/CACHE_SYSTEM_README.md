# Cache System Implementation - Mobile App

## 📋 Tổng quan

Hệ thống cache đã được triển khai toàn diện trong ứng dụng mobile để:

- **Giảm thiểu API calls không cần thiết**
- **Cải thiện performance và trải nghiệm người dùng**
- **Tiết kiệm băng thông và pin**
- **Tăng tốc độ load dữ liệu**

## 🏗️ Kiến trúc Cache

### 1. Cache Service Core (`src/services/cacheService.ts`)

- **Memory Cache**: Cache nhanh trong RAM (tối đa 100 items)
- **Persistent Cache**: Cache lâu dài với AsyncStorage
- **TTL Management**: Tự động xóa cache hết hạn
- **Smart Cache Keys**: Tự động generate key dựa trên parameters

### 2. Global Cache Manager (`src/services/globalCacheManager.ts`)

- **Centralized Management**: Quản lý cache toàn bộ ứng dụng
- **Cache Invalidation**: Tự động xóa cache khi cần thiết
- **Pre-warming**: Tải trước dữ liệu quan trọng
- **User Session Management**: Xử lý cache khi đăng nhập/đăng xuất

### 3. Cache Hooks (`src/hooks/useCache.ts`)

- **useCache**: Hook cơ bản cho mọi loại dữ liệu
- **useUserCache**: Đặc biệt cho dữ liệu user (tự động clear khi logout)
- **useProductCache**: Tối ưu cho dữ liệu sản phẩm
- **useSearchCache**: Cho kết quả tìm kiếm

## 🔧 APIs Đã Được Tối Ưu

### ✅ Authentication APIs

- **AuthApi.getProfile()**: Cache 5 phút
- **Auto-clear cache**: Khi login/logout

### ✅ Product APIs

- **homeService.getNewProducts()**: Cache 10 phút
- **homeService.getBestSellers()**: Cache 15 phút
- **homeService.searchProducts()**: Cache 5 phút
- **productDetailsService.getProductDetails()**: Cache 15 phút

### ✅ Cart APIs

- **CartApi.getCart()**: Cache 2 phút
- **Auto-invalidation**: Sau add/remove/update items

### ✅ Order APIs

- **OrderApi.getOrders()**: Cache 3 phút
- **OrderApi.getOrder()**: Cache 5 phút
- **Auto-invalidation**: Sau create/cancel order

### ✅ Wishlist APIs

- **wishlistApi.listWishlist()**: Cache 5 phút
- **wishlistApi.listWishlistIds()**: Cache 10 phút
- **Auto-invalidation**: Sau toggle wishlist

### ✅ Address APIs

- **AddressApi.getAddresses()**: Cache 10 phút
- **Auto-invalidation**: Sau create/update/delete/set default

## 📱 Cách Sử dụng

### 1. Trong Components/Screens

```typescript
import {useCache, useUserCache} from '../hooks/useCache';
import {CartApi} from '../services/cartApi';
import {globalCacheManager} from '../services/globalCacheManager';

const CartScreen = () => {
  // Sử dụng cache cho cart
  const {
    data: cart,
    loading,
    error,
    refresh,
  } = useUserCache(
    'cart',
    () => CartApi.getCart(),
    {}, // params
    {ttl: 2 * 60 * 1000}, // 2 phút
  );

  const handleAddItem = async (variantId, quantity) => {
    await CartApi.addToCart(variantId, quantity);
    // Cache tự động clear trong CartApi.addToCart
    await refresh(); // Refresh UI
  };

  return (
    <FlatList
      data={cart?.items || []}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    />
  );
};
```

### 2. Manual Cache Management

```typescript
import {globalCacheManager} from '../services/globalCacheManager';

// Clear specific cache
await globalCacheManager.clearCartData();
await globalCacheManager.clearProduct('product-id');

// Clear all user data (khi logout)
await globalCacheManager.clearUserData();

// Pre-warm cache (khi login)
await globalCacheManager.preWarmCache();

// Handle user actions
await globalCacheManager.handleUserAction('login');
await globalCacheManager.handleUserAction('add_to_cart');
```

### 3. Force Refresh

```typescript
// Force refresh từ server (bỏ qua cache)
const freshData = await CartApi.getCart(true); // forceRefresh = true
const freshProducts = await homeService.getNewProducts(10, true);
```

## ⚡ Cache Configuration

### TTL (Time To Live) Settings

```typescript
const CACHE_CONFIGS = {
  // User data (shorter TTL)
  profile: 10 * 60 * 1000, // 10 phút
  cart: 2 * 60 * 1000, // 2 phút
  orders: 5 * 60 * 1000, // 5 phút

  // Product data (longer TTL)
  products: 30 * 60 * 1000, // 30 phút
  categories: 60 * 60 * 1000, // 1 giờ

  // Dynamic content (shorter TTL)
  search: 5 * 60 * 1000, // 5 phút
  wishlist: 10 * 60 * 1000, // 10 phút
};
```

### Auto-Invalidation Events

```typescript
// Cache tự động clear khi:
'login'         → Pre-warm essential cache
'logout'        → Clear all user cache
'add_to_cart'   → Clear cart cache
'place_order'   → Clear cart + order cache
'cancel_order'  → Clear order cache
'toggle_wishlist' → Clear wishlist cache
'update_address' → Clear address cache
'update_profile' → Clear profile cache
```

## 🔍 Cache Monitoring & Debugging

### 1. Cache Stats

```typescript
import {globalCacheManager} from '../services/globalCacheManager';

const stats = globalCacheManager.getCacheStats();
console.log('Memory cache size:', stats.memorySize);
console.log('Cached keys:', stats.memoryKeys);
```

### 2. Cache Debug Screen

```typescript
// Có thể tạo debug screen để monitor cache
const CacheDebugScreen = () => {
  const clearAllCache = async () => {
    await globalCacheManager.clearAllCache();
    Alert.alert('Success', 'All cache cleared');
  };

  return (
    <View>
      <Button title="Clear All Cache" onPress={clearAllCache} />
      <Button
        title="Pre-warm Cache"
        onPress={() => globalCacheManager.preWarmCache()}
      />
    </View>
  );
};
```

## 📈 Performance Benefits

### Before Cache Implementation

```
🔴 Mỗi lần vào Home screen: 3-5 API calls
🔴 Mỗi lần vào Cart: 1 API call
🔴 Mỗi lần vào Product detail: 2-3 API calls
🔴 Switching tabs: Reload toàn bộ data
```

### After Cache Implementation

```
✅ Home screen lần đầu: 3-5 API calls → Lần sau: 0 calls (trong 10-15 phút)
✅ Cart lần đầu: 1 API call → Lần sau: 0 calls (trong 2 phút)
✅ Product detail đã xem: 0 calls (trong 15 phút)
✅ Switching tabs: Instant load từ cache
✅ Offline experience: Hiện dữ liệu cached
```

## 🎯 Best Practices

### 1. Cache TTL Strategy

- **User-specific data**: Short TTL (2-10 phút)
- **Product data**: Medium TTL (15-30 phút)
- **Static data**: Long TTL (1+ giờ)
- **Search results**: Very short TTL (5 phút)

### 2. Cache Invalidation

- **Always invalidate** sau write operations (create/update/delete)
- **Use global cache manager** cho consistent invalidation
- **Handle errors gracefully** nếu cache operations fail

### 3. Memory Management

- **Memory cache** giới hạn 100 items
- **Auto cleanup** older entries
- **Persistent cache** cho dữ liệu quan trọng

### 4. User Experience

- **Show cached data immediately** while refreshing
- **Use RefreshControl** để user có thể force refresh
- **Handle offline scenarios** với cached data

## 🚀 Testing Cache

### 1. Verify Cache Working

```typescript
// Kiểm tra console logs
// ✅ Cache HIT: profile:token:xxx...
// ✅ Cache SET: new_products:limit:10
// ✅ Cache MISS: search_products:keyword:shoes
```

### 2. Test Cache Invalidation

```typescript
// Add item to cart → Check cart cache cleared
// Login → Check user cache pre-warmed
// Logout → Check all user cache cleared
```

### 3. Performance Testing

```typescript
// Measure API call frequency
// Measure screen load times
// Test offline behavior
```

## ⚠️ Important Notes

1. **AsyncStorage Dependency**: Đã có sẵn `@react-native-async-storage/async-storage`
2. **Memory Usage**: Cache automatically manages memory với limit 100 items
3. **Network Awareness**: Cache vẫn hoạt động offline
4. **Error Handling**: Cache errors không crash app, fallback to API call
5. **Development**: Cache logs sẽ hiện trong console để debug

## 🔄 Migration Guide

Nếu cần update existing screens to use cache:

```typescript
// Before (trực tiếp gọi API)
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    const result = await SomeApi.getData();
    setData(result);
    setLoading(false);
  };
  fetchData();
}, []);

// After (sử dụng cache)
const {data, loading, refresh} = useCache(
  'cache_key',
  () => SomeApi.getData(),
  {}, // params
  {ttl: 10 * 60 * 1000}, // options
);
```

Hệ thống cache đã được triển khai đầy đủ và sẵn sàng sử dụng! 🎉
