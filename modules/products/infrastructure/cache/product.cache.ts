// Simple LRU cache for products
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  max?: number;
  ttl?: number; // milliseconds
}

class ProductCache {
  private cache: LRUCache<string, any>;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.max || 100,
      ttl: options.ttl || 1000 * 60 * 5, // 5 minutes default
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, { ttl });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidate(prefix: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }
}

export const productCache = new ProductCache({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});
