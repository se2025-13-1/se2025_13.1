import {useState, useEffect, useCallback} from 'react';
import {cacheService} from '../services/cacheService';

export interface UseCacheOptions {
  ttl?: number;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  dependencies?: any[];
}

/**
 * Custom hook for caching API data
 * @param key Cache key prefix
 * @param apiCall Function that returns a Promise with the data
 * @param params Parameters for cache key generation
 * @param options Cache configuration options
 */
export function useCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  params: Record<string, any> = {},
  options: UseCacheOptions = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enableAutoRefresh = false,
    refreshInterval = 30 * 1000, // 30 seconds
    dependencies = [],
  } = options;

  const fetchData = useCallback(
    async (forceRefresh: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const cachedData = await cacheService.get<T>(key, params, {
          forceRefresh,
        });

        if (cachedData !== null && !forceRefresh) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        const freshData = await apiCall();
        await cacheService.set(key, freshData, params, {ttl});
        setData(freshData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        console.error(`Cache error for ${key}:`, err);
      } finally {
        setLoading(false);
      }
    },
    [key, apiCall, JSON.stringify(params), ttl, ...dependencies],
  );

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(async () => {
    await cacheService.clear(key, params);
  }, [key, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh setup
  useEffect(() => {
    if (!enableAutoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isStale: loading && data !== null, // Data exists but is being refreshed
  };
}

/**
 * Hook specifically for user-related data that auto-clears on logout
 */
export function useUserCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  params: Record<string, any> = {},
  options: UseCacheOptions = {},
) {
  return useCache(`user_${key}`, apiCall, params, {
    ttl: 10 * 60 * 1000, // 10 minutes default for user data
    ...options,
  });
}

/**
 * Hook for product data with longer cache times
 */
export function useProductCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  params: Record<string, any> = {},
  options: UseCacheOptions = {},
) {
  return useCache(`product_${key}`, apiCall, params, {
    ttl: 15 * 60 * 1000, // 15 minutes default for product data
    ...options,
  });
}

/**
 * Hook for search results with shorter cache times
 */
export function useSearchCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  params: Record<string, any> = {},
  options: UseCacheOptions = {},
) {
  return useCache(`search_${key}`, apiCall, params, {
    ttl: 5 * 60 * 1000, // 5 minutes default for search data
    ...options,
  });
}
