import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds, default 5 minutes
  forceRefresh?: boolean;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MEMORY_CACHE_SIZE = 100;

  // Generate cache key
  private generateKey(
    prefix: string,
    params: Record<string, any> = {},
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }

  // Check if cache is valid
  private isValidCache<T>(cacheItem: CacheItem<T>): boolean {
    const now = Date.now();
    return now - cacheItem.timestamp < cacheItem.ttl;
  }

  // Clean up expired memory cache
  private cleanupMemoryCache(): void {
    if (this.memoryCache.size <= this.MEMORY_CACHE_SIZE) return;

    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 20 items
    for (let i = 0; i < 20; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  // Get from memory cache
  private async getFromMemoryCache<T>(key: string): Promise<T | null> {
    const cacheItem = this.memoryCache.get(key);
    if (!cacheItem || !this.isValidCache(cacheItem)) {
      this.memoryCache.delete(key);
      return null;
    }
    return cacheItem.data;
  }

  // Set to memory cache
  private setToMemoryCache<T>(key: string, data: T, ttl: number): void {
    this.cleanupMemoryCache();
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Get from persistent cache
  private async getFromPersistentCache<T>(key: string): Promise<T | null> {
    try {
      const cacheString = await AsyncStorage.getItem(`cache_${key}`);
      if (!cacheString) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cacheString);
      if (!this.isValidCache(cacheItem)) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting persistent cache:', error);
      return null;
    }
  }

  // Set to persistent cache
  private async setToPersistentCache<T>(
    key: string,
    data: T,
    ttl: number,
  ): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting persistent cache:', error);
    }
  }

  // Main get method
  async get<T>(
    prefix: string,
    params: Record<string, any> = {},
    config: CacheConfig = {},
  ): Promise<T | null> {
    if (config.forceRefresh) return null;

    const key = this.generateKey(prefix, params);

    // Try memory cache first
    const memoryData = await this.getFromMemoryCache<T>(key);
    if (memoryData !== null) {
      console.log(`Cache HIT (memory): ${key}`);
      return memoryData;
    }

    // Try persistent cache
    const persistentData = await this.getFromPersistentCache<T>(key);
    if (persistentData !== null) {
      // Also store in memory for faster access
      this.setToMemoryCache(
        key,
        persistentData,
        config.ttl || this.DEFAULT_TTL,
      );
      console.log(`Cache HIT (persistent): ${key}`);
      return persistentData;
    }

    console.log(`Cache MISS: ${key}`);
    return null;
  }

  // Main set method
  async set<T>(
    prefix: string,
    data: T,
    params: Record<string, any> = {},
    config: CacheConfig = {},
  ): Promise<void> {
    const key = this.generateKey(prefix, params);
    const ttl = config.ttl || this.DEFAULT_TTL;

    // Set in both memory and persistent cache
    this.setToMemoryCache(key, data, ttl);
    await this.setToPersistentCache(key, data, ttl);

    console.log(`Cache SET: ${key}`);
  }

  // Clear specific cache
  async clear(prefix: string, params: Record<string, any> = {}): Promise<void> {
    const key = this.generateKey(prefix, params);

    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from persistent cache
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
      console.log(`Cache CLEARED: ${key}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Clear cache by prefix pattern
  async clearByPrefix(prefix: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear persistent cache
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(`cache_${prefix}`));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cache CLEARED by prefix: ${prefix}`);
      }
    } catch (error) {
      console.error('Error clearing cache by prefix:', error);
    }
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear all persistent cache
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log('All cache CLEARED');
      }
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  // Execute with cache
  async executeWithCache<T>(
    prefix: string,
    apiCall: () => Promise<T>,
    params: Record<string, any> = {},
    config: CacheConfig = {},
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = await this.get<T>(prefix, params, config);
    if (cachedData !== null) {
      return cachedData;
    }

    // Execute API call if no cache
    const data = await apiCall();

    // Store in cache
    await this.set(prefix, data, params, config);

    return data;
  }

  // Get cache stats
  getStats(): {memorySize: number; memoryKeys: string[]} {
    return {
      memorySize: this.memoryCache.size,
      memoryKeys: Array.from(this.memoryCache.keys()),
    };
  }
}

export const cacheService = new CacheService();
