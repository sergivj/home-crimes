// Caching layer with TTL support
import { LRUCache } from 'lru-cache';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ContentCache {
  private cache: LRUCache<string, CacheEntry<any>>;

  constructor(maxSize = 100) {
    this.cache = new LRUCache({ max: maxSize });
  }

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const contentCache = new ContentCache();
