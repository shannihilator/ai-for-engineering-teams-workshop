/**
 * Domain health data interface
 */
export interface DomainHealthData {
  domain: string;
  isHealthy: boolean;
  responseTime: number;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  error?: string;
}

/**
 * Cache entry interface with TTL tracking
 */
interface CacheEntry {
  data: DomainHealthData;
  timestamp: number;
  ttl: number;
}

/**
 * Domain Health Service - Provides business logic abstraction for domain health checking
 * 
 * Features:
 * - Centralized API communication
 * - 5-minute TTL caching for performance
 * - Error handling and logging
 * - Pure function implementations for testability
 */
export class DomainHealthService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Checks if a cached entry is still valid
   * @param entry - Cache entry to validate
   * @returns Boolean indicating if entry is still valid
   */
  private isCacheEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  /**
   * Cleans expired entries from cache
   * This method is called periodically to prevent memory leaks
   */
  private cleanExpiredCacheEntries(): void {
    const now = Date.now();
    
    for (const [domain, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(domain);
      }
    }
  }

  /**
   * Stores domain health data in cache with TTL
   * @param domain - Domain name as cache key
   * @param data - Domain health data to cache
   */
  private setCacheEntry(domain: string, data: DomainHealthData): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL_MS
    };
    
    this.cache.set(domain, entry);
    
    // Clean expired entries periodically
    if (this.cache.size > 100) {
      this.cleanExpiredCacheEntries();
    }
  }

  /**
   * Retrieves cached domain health data if valid
   * @param domain - Domain name to lookup
   * @returns Cached data or null if not found/expired
   */
  private getCacheEntry(domain: string): DomainHealthData | null {
    const entry = this.cache.get(domain);
    
    if (!entry) {
      return null;
    }
    
    if (!this.isCacheEntryValid(entry)) {
      this.cache.delete(domain);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Fetches domain health data from API
   * @param domain - Domain name to check
   * @returns Promise with domain health data
   */
  private async fetchDomainHealthFromAPI(domain: string): Promise<DomainHealthData> {
    try {
      const response = await fetch(`/api/domain-health/${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as DomainHealthData;
      
    } catch (error) {
      console.error(`Failed to fetch domain health for ${domain}:`, error);
      
      // Return error response in consistent format
      return {
        domain,
        isHealthy: false,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Gets domain health data with caching
   * Checks cache first, falls back to API if cache miss or expired
   * 
   * @param domain - Domain name to check health for
   * @returns Promise with domain health data
   */
  async getDomainHealth(domain: string): Promise<DomainHealthData> {
    if (!domain || typeof domain !== 'string') {
      throw new Error('Invalid domain parameter');
    }

    const normalizedDomain = domain.trim().toLowerCase();
    
    // Check cache first
    const cachedData = this.getCacheEntry(normalizedDomain);
    if (cachedData) {
      console.log(`Cache hit for domain: ${normalizedDomain}`);
      return cachedData;
    }

    console.log(`Cache miss for domain: ${normalizedDomain}, fetching from API`);
    
    // Fetch from API and cache the result
    const freshData = await this.fetchDomainHealthFromAPI(normalizedDomain);
    
    // Only cache successful responses (don't cache errors)
    if (freshData && !freshData.error) {
      this.setCacheEntry(normalizedDomain, freshData);
    }
    
    return freshData;
  }

  /**
   * Clears all cached domain health data
   * Useful for testing or manual cache invalidation
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Domain health cache cleared');
  }

  /**
   * Gets current cache statistics
   * @returns Object with cache size and entry information
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance for use throughout the application
export const domainHealthService = new DomainHealthService();