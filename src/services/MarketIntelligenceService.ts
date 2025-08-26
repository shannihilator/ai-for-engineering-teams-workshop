/**
 * Market intelligence data interface
 */
export interface MarketIntelligenceData {
  company: string;
  sentiment: {
    score: number; // -1 to 1
    label: 'positive' | 'neutral' | 'negative';
    confidence: number; // 0 to 1
  };
  news: {
    articleCount: number;
    headlines: Array<{
      title: string;
      source: string;
      publishedAt: string;
      url?: string;
    }>;
  };
  timestamp: string;
  error?: string;
}

/**
 * Cache entry interface with TTL tracking
 */
interface CacheEntry {
  data: MarketIntelligenceData;
  timestamp: number;
  ttl: number;
}

/**
 * Custom error class for market intelligence service
 */
export class MarketIntelligenceError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'UNKNOWN_ERROR',
    public readonly company?: string
  ) {
    super(message);
    this.name = 'MarketIntelligenceError';
  }
}

/**
 * Market Intelligence Service - Provides business logic abstraction for market intelligence data
 *
 * Features:
 * - Centralized API communication
 * - 10-minute TTL caching for performance
 * - Error handling and logging
 * - Pure function implementations for testability
 */
export class MarketIntelligenceService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

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

    for (const [company, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(company);
      }
    }
  }

  /**
   * Stores market intelligence data in cache with TTL
   * @param company - Company name as cache key
   * @param data - Market intelligence data to cache
   */
  private setCacheEntry(company: string, data: MarketIntelligenceData): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL_MS
    };

    this.cache.set(company, entry);

    // Clean expired entries periodically
    if (this.cache.size > 50) {
      this.cleanExpiredCacheEntries();
    }
  }

  /**
   * Retrieves cached market intelligence data if valid
   * @param company - Company name to lookup
   * @returns Cached data or null if not found/expired
   */
  private getCacheEntry(company: string): MarketIntelligenceData | null {
    const entry = this.cache.get(company);

    if (!entry) {
      return null;
    }

    if (!this.isCacheEntryValid(entry)) {
      this.cache.delete(company);
      return null;
    }

    return entry.data;
  }

  /**
   * Validates company name format
   * @param company - Company name to validate
   * @returns Boolean indicating if company name is valid
   */
  private validateCompanyName(company: string): boolean {
    if (!company || typeof company !== 'string') {
      return false;
    }

    const trimmedCompany = company.trim();

    // Basic validation - must have some content and reasonable length
    if (trimmedCompany.length < 1 || trimmedCompany.length > 100) {
      return false;
    }

    // Allow letters, numbers, spaces, and common business punctuation
    const companyRegex = /^[a-zA-Z0-9\s\-\.\&\,\'\"]+$/;
    return companyRegex.test(trimmedCompany);
  }

  /**
   * Fetches market intelligence data from API
   * @param company - Company name to analyze
   * @returns Promise with market intelligence data
   */
  private async fetchMarketIntelligenceFromAPI(company: string): Promise<MarketIntelligenceData> {
    try {
      const response = await fetch(`/api/market-intelligence/${encodeURIComponent(company)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new MarketIntelligenceError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          `HTTP_${response.status}`,
          company
        );
      }

      const data = await response.json();
      return data as MarketIntelligenceData;

    } catch (error) {
      console.error(`Failed to fetch market intelligence for ${company}:`, error);

      // Return error response in consistent format
      return {
        company,
        sentiment: {
          score: 0,
          label: 'neutral',
          confidence: 0
        },
        news: {
          articleCount: 0,
          headlines: []
        },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Gets market intelligence data with caching
   * Checks cache first, falls back to API if cache miss or expired
   *
   * @param company - Company name to analyze
   * @returns Promise with market intelligence data
   */
  async getMarketIntelligence(company: string): Promise<MarketIntelligenceData> {
    if (!company || typeof company !== 'string') {
      throw new MarketIntelligenceError('Invalid company parameter', 'INVALID_PARAMETER');
    }

    const normalizedCompany = company.trim();

    if (!this.validateCompanyName(normalizedCompany)) {
      throw new MarketIntelligenceError(
        'Invalid company name format. Please provide a valid company name.',
        'INVALID_FORMAT',
        normalizedCompany
      );
    }

    // Check cache first
    const cachedData = this.getCacheEntry(normalizedCompany);
    if (cachedData) {
      console.log(`Cache hit for company: ${normalizedCompany}`);
      return cachedData;
    }

    console.log(`Cache miss for company: ${normalizedCompany}, fetching from API`);

    // Fetch from API and cache the result
    const freshData = await this.fetchMarketIntelligenceFromAPI(normalizedCompany);

    // Only cache successful responses (don't cache errors)
    if (freshData && !freshData.error) {
      this.setCacheEntry(normalizedCompany, freshData);
    }

    return freshData;
  }

  /**
   * Gets sentiment analysis for a company
   * Convenience method that returns just the sentiment data
   *
   * @param company - Company name to analyze
   * @returns Promise with sentiment analysis
   */
  async getSentimentAnalysis(company: string): Promise<MarketIntelligenceData['sentiment']> {
    const data = await this.getMarketIntelligence(company);
    return data.sentiment;
  }

  /**
   * Gets news headlines for a company
   * Convenience method that returns just the news data
   *
   * @param company - Company name to get news for
   * @returns Promise with news headlines
   */
  async getNewsHeadlines(company: string): Promise<MarketIntelligenceData['news']> {
    const data = await this.getMarketIntelligence(company);
    return data.news;
  }

  /**
   * Clears all cached market intelligence data
   * Useful for testing or manual cache invalidation
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Market intelligence cache cleared');
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

  /**
   * Preloads market intelligence data for multiple companies
   * Useful for dashboard optimization when company list is known
   *
   * @param companies - Array of company names to preload
   * @returns Promise that resolves when all companies are loaded
   */
  async preloadCompanies(companies: string[]): Promise<void> {
    const promises = companies.map(company =>
      this.getMarketIntelligence(company).catch(error => {
        console.warn(`Failed to preload market intelligence for ${company}:`, error);
        return null;
      })
    );

    await Promise.all(promises);
    console.log(`Preloaded market intelligence for ${companies.length} companies`);
  }
}

// Export singleton instance for use throughout the application
export const marketIntelligenceService = new MarketIntelligenceService();
