/**
 * Comprehensive caching system for Zyra AI
 * Stores data in localStorage with expiration, versioning, and compression support
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt?: number
  version?: string
}

interface CacheOptions {
  expiresIn?: number // milliseconds
  version?: string
  compress?: boolean
}

class CacheManager {
  private readonly PREFIX = 'zyra_cache_'
  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days
  private readonly VERSION = '1.0.0'

  /**
   * Set cache item
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    try {
      const expiresAt = options.expiresIn
        ? Date.now() + options.expiresIn
        : Date.now() + this.DEFAULT_TTL

      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt,
        version: options.version || this.VERSION,
      }

      const serialized = JSON.stringify(item)
      localStorage.setItem(`${this.PREFIX}${key}`, serialized)
    } catch (error) {
      console.warn(`Failed to cache ${key}:`, error)
      // If storage is full, try to clear old items
      this.clearExpired()
      try {
        const serialized = JSON.stringify({ data, timestamp: Date.now(), expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined })
        localStorage.setItem(`${this.PREFIX}${key}`, serialized)
      } catch (retryError) {
        console.error(`Failed to cache ${key} after cleanup:`, retryError)
      }
    }
  }

  /**
   * Get cache item
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`)
      if (!item) return null

      const parsed: CacheItem<T> = JSON.parse(item)
      
      // Check expiration
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.remove(key)
        return null
      }

      return parsed.data
    } catch (error) {
      console.warn(`Failed to get cache ${key}:`, error)
      return null
    }
  }

  /**
   * Remove cache item
   */
  remove(key: string): void {
    localStorage.removeItem(`${this.PREFIX}${key}`)
  }

  /**
   * Check if cache exists and is valid
   */
  has(key: string): boolean {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`)
      if (!item) return false

      const parsed: CacheItem<any> = JSON.parse(item)
      
      // Check expiration
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.remove(key)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Clear all expired cache items
   */
  clearExpired(): void {
    const keys = Object.keys(localStorage)
    let cleared = 0

    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const parsed: CacheItem<any> = JSON.parse(item)
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
              localStorage.removeItem(key)
              cleared++
            }
          }
        } catch {
          // Remove invalid cache items
          localStorage.removeItem(key)
          cleared++
        }
      }
    })

    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired cache items`)
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * Get cache size (approximate)
   */
  getSize(): number {
    let size = 0
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        const item = localStorage.getItem(key)
        if (item) {
          size += item.length
        }
      }
    })

    return size
  }
}

// Singleton instance
export const cache = new CacheManager()

// Initialize: clear expired items on load
if (typeof window !== 'undefined') {
  cache.clearExpired()
  
  // Clear expired items every hour
  setInterval(() => {
    cache.clearExpired()
  }, 60 * 60 * 1000)
}

// Cache keys
export const CACHE_KEYS = {
  // CV Builder
  CV_DRAFT: 'cv_builder_draft',
  CV_MODE: 'cv_builder_mode',
  CV_AI_INSIGHTS: 'cv_ai_insights',
  
  // Input Suggestions
  SUGGESTIONS_JOB_TITLES: 'suggestions_job_titles',
  SUGGESTIONS_COMPANIES: 'suggestions_companies',
  SUGGESTIONS_SKILLS: 'suggestions_skills',
  SUGGESTIONS_INSTITUTIONS: 'suggestions_institutions',
  SUGGESTIONS_LOCATIONS: 'suggestions_locations',
  
  // API Responses
  API_PROFILE: 'api_profile',
  API_SETTINGS: 'api_settings',
  API_DASHBOARD_STATS: 'api_dashboard_stats',
  
  // User Preferences
  USER_PREFERENCES: 'user_preferences',
  USER_THEME: 'user_theme',
  USER_LANGUAGE: 'user_language',
} as const

