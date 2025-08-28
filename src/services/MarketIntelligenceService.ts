/**
 * MarketIntelligenceService - Service layer for market intelligence data operations
 * Provides clean abstraction for market sentiment and news analysis with caching
 */

import { 
  generateMarketIntelligenceData,
  type MarketIntelligenceData,
  type MarketHeadline
} from '@/data/mock-market-intelligence';

// Re-export types for convenience
export type { MarketIntelligenceData, MarketHeadline } from '@/data/mock-market-intelligence';

interface CacheEntry {
  data: MarketIntelligenceData;
  timestamp: number;
}

// Custom Error Classes
export class MarketIntelligenceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MarketIntelligenceError';
  }
}

export class MarketIntelligenceValidationError extends MarketIntelligenceError {
  constructor(
    message: string,
    public field?: string,
    code?: string
  ) {
    super(message, code);
    this.name = 'MarketIntelligenceValidationError';
  }
}

export class MarketIntelligenceNotFoundError extends MarketIntelligenceError {
  constructor(companyName: string) {
    super(`Market intelligence data not found for company: ${companyName}`);
    this.name = 'MarketIntelligenceNotFoundError';
  }
}

/**
 * MarketIntelligenceService class providing market sentiment and news analysis
 */
export class MarketIntelligenceService {
  private static instance: MarketIntelligenceService;
  private cache: Map<string, CacheEntry>;
  private readonly cacheTTL: number = 10 * 60 * 1000; // 10 minutes in milliseconds

  private constructor() {
    this.cache = new Map();
  }

  /**
   * Get singleton instance of MarketIntelligenceService
   */
  public static getInstance(): MarketIntelligenceService {
    if (!MarketIntelligenceService.instance) {
      MarketIntelligenceService.instance = new MarketIntelligenceService();
    }
    return MarketIntelligenceService.instance;
  }

  /**
   * Sanitize and validate company name input
   */
  private sanitizeAndValidateCompanyName(companyName: string): string {
    if (!companyName) {
      throw new MarketIntelligenceValidationError('Company name is required', 'companyName', 'REQUIRED');
    }

    // Sanitize input by trimming whitespace
    const sanitized = companyName.trim();

    // Validate length
    if (sanitized.length === 0) {
      throw new MarketIntelligenceValidationError('Company name cannot be empty', 'companyName', 'EMPTY');
    }

    if (sanitized.length > 100) {
      throw new MarketIntelligenceValidationError('Company name must be 100 characters or less', 'companyName', 'LENGTH');
    }

    // Validate characters (alphanumeric, spaces, hyphens, apostrophes, periods, ampersands)
    const validCharacterRegex = /^[a-zA-Z0-9\s\-'\.&]+$/;
    if (!validCharacterRegex.test(sanitized)) {
      throw new MarketIntelligenceValidationError('Company name contains invalid characters', 'companyName', 'FORMAT');
    }

    return sanitized;
  }

  /**
   * Check if cached data exists and is still valid
   */
  private getCachedData(cacheKey: string): MarketIntelligenceData | null {
    const cacheEntry = this.cache.get(cacheKey);
    
    if (!cacheEntry) {
      return null;
    }

    const now = Date.now();
    const isExpired = (now - cacheEntry.timestamp) > this.cacheTTL;

    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cacheEntry.data;
  }

  /**
   * Store data in cache with timestamp
   */
  private setCachedData(cacheKey: string, data: MarketIntelligenceData): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get market intelligence data for a company with caching
   */
  public async getMarketIntelligence(companyName: string): Promise<MarketIntelligenceData> {
    try {
      // Sanitize and validate input
      const sanitizedCompanyName = this.sanitizeAndValidateCompanyName(companyName);
      
      // Use sanitized company name as cache key (case-insensitive)
      const cacheKey = sanitizedCompanyName.toLowerCase();
      
      // Check cache first
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Generate fresh data using the mock data service
      // Note: The mock data service has its own caching, but we add service layer caching for additional control
      const marketData = generateMarketIntelligenceData(sanitizedCompanyName);
      
      // Cache the new data
      this.setCachedData(cacheKey, marketData);
      
      return marketData;
    } catch (error) {
      if (error instanceof MarketIntelligenceValidationError) {
        throw error;
      }
      
      throw new MarketIntelligenceError(
        `Failed to retrieve market intelligence for ${companyName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RETRIEVAL_ERROR'
      );
    }
  }

  /**
   * Clear cache entry for a specific company
   */
  public clearCache(companyName?: string): void {
    if (companyName) {
      const cacheKey = companyName.trim().toLowerCase();
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics for debugging/monitoring
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Utility method to check if data is cached for a company
   */
  public isCached(companyName: string): boolean {
    try {
      const sanitizedCompanyName = this.sanitizeAndValidateCompanyName(companyName);
      const cacheKey = sanitizedCompanyName.toLowerCase();
      return this.getCachedData(cacheKey) !== null;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const marketIntelligenceService = MarketIntelligenceService.getInstance();