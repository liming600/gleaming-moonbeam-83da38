import { logger } from './logger'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

const CACHE_KEY_PREFIX = 'pet_circle_cache_'

export const cache = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(CACHE_KEY_PREFIX + key)
      if (!item) return null

      const entry: CacheEntry = JSON.parse(item)
      const now = Date.now()

      if (now - entry.timestamp > entry.ttl) {
        this.remove(key)
        return null
      }

      return entry.data as T
    } catch {
      return null
    }
  },

  set<T>(key: string, data: T, ttl: number = 300000): void {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry))
    } catch {
      logger.warn('缓存设置失败，可能是存储空间已满')
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_KEY_PREFIX + key)
    } catch {
      logger.warn('缓存删除失败')
    }
  },

  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      logger.warn('缓存清空失败')
    }
  },

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  },

  withCache<T>(key: string, ttl: number = 300000) {
    return (fetcher: () => Promise<T>): () => Promise<T> => {
      return async () => {
        const cached = this.get<T>(key)
        if (cached !== null) {
          return cached
        }

        const data = await fetcher()
        this.set(key, data, ttl)
        return data
      }
    }
  }
}

export const CACHE_TTL = {
  SHORT: 60000,
  MEDIUM: 300000,
  LONG: 3600000
}