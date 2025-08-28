'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MarketIntelligenceWidgetProps {
  /** Company name to analyze - required for market intelligence lookup */
  companyName?: string;
  /** Callback when company analysis completes */
  onAnalysisComplete?: (data: MarketIntelligenceData) => void;
  /** Optional CSS classes for custom styling */
  className?: string;
}

export interface MarketIntelligenceData {
  sentiment: number; // -100 to 100 scale
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative';
  newsCount: number;
  headlines: MarketHeadline[];
  lastUpdated: string; // ISO timestamp
}

export interface MarketHeadline {
  title: string;
  source: string;
  publishedAt: string; // ISO timestamp
}

/**
 * MarketIntelligenceWidget component for displaying real-time market sentiment 
 * and news analysis for customer companies
 */
export function MarketIntelligenceWidget({ 
  companyName = '', 
  onAnalysisComplete,
  className = '' 
}: MarketIntelligenceWidgetProps) {
  const [inputCompanyName, setInputCompanyName] = useState(companyName);
  const [data, setData] = useState<MarketIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  /**
   * Validate company name input
   */
  const validateCompanyName = useCallback((name: string): boolean => {
    if (!name.trim()) {
      setInputError('Company name is required');
      return false;
    }
    if (name.length > 100) {
      setInputError('Company name must be 100 characters or less');
      return false;
    }
    if (!/^[a-zA-Z0-9\s&.-]+$/.test(name)) {
      setInputError('Company name contains invalid characters');
      return false;
    }
    setInputError(null);
    return true;
  }, []);

  /**
   * Fetch market intelligence data from API
   */
  const fetchMarketData = useCallback(async (company: string) => {
    if (!validateCompanyName(company)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/market-intelligence/${encodeURIComponent(company.trim())}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }

      const marketData: MarketIntelligenceData = await response.json();
      setData(marketData);
      onAnalysisComplete?.(marketData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market intelligence data';
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [validateCompanyName, onAnalysisComplete]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputCompanyName.trim()) {
      fetchMarketData(inputCompanyName.trim());
    }
  }, [inputCompanyName, fetchMarketData]);

  /**
   * Handle input change with real-time validation
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputCompanyName(value);
    
    // Clear previous errors when user starts typing
    if (inputError) {
      setInputError(null);
    }
    if (error) {
      setError(null);
    }
  }, [inputError, error]);

  /**
   * Handle retry functionality
   */
  const handleRetry = useCallback(() => {
    if (inputCompanyName.trim()) {
      fetchMarketData(inputCompanyName.trim());
    }
  }, [inputCompanyName, fetchMarketData]);

  /**
   * Auto-fetch data when companyName prop changes
   */
  useEffect(() => {
    if (companyName && companyName !== inputCompanyName) {
      setInputCompanyName(companyName);
      fetchMarketData(companyName);
    }
  }, [companyName, inputCompanyName, fetchMarketData]);

  /**
   * Get sentiment display properties based on score
   */
  const getSentimentDisplay = (sentiment: number, label: string) => {
    // Map sentiment (-100 to 100) to health score colors (0-100)
    const normalizedScore = Math.max(0, Math.min(100, (sentiment + 100) / 2));
    
    if (label === 'Positive' || normalizedScore >= 71) {
      return {
        color: 'text-green-800 bg-green-50 border-green-300',
        dotColor: 'bg-green-600',
        textColor: 'text-green-800'
      };
    } else if (label === 'Neutral' || (normalizedScore >= 31 && normalizedScore <= 70)) {
      return {
        color: 'text-yellow-800 bg-yellow-50 border-yellow-300',
        dotColor: 'bg-yellow-600',
        textColor: 'text-yellow-800'
      };
    } else {
      return {
        color: 'text-red-800 bg-red-50 border-red-300',
        dotColor: 'bg-red-600',
        textColor: 'text-red-800'
      };
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const baseClasses = 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2';
  const widgetClasses = `${baseClasses} ${className}`;

  return (
    <div 
      className={widgetClasses} 
      style={{ maxWidth: '400px' }}
      role="region"
      aria-labelledby="market-intelligence-heading"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 
          id="market-intelligence-heading"
          className="text-lg font-semibold text-gray-900 mb-1"
        >
          Market Intelligence
        </h3>
        <p className="text-sm text-gray-600">
          Real-time sentiment and news analysis
        </p>
      </div>

      {/* Company Input Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div>
          <label 
            htmlFor="company-name-input" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company Name
          </label>
          <div className="flex gap-2">
            <input
              id="company-name-input"
              type="text"
              value={inputCompanyName}
              onChange={handleInputChange}
              placeholder="Enter company name..."
              className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                inputError ? 'border-red-400 bg-red-50 text-gray-900' : 'border-gray-300 text-gray-900'
              }`}
              disabled={isLoading}
              maxLength={100}
              aria-invalid={!!inputError}
              aria-describedby={inputError ? 'company-name-error' : undefined}
            />
            <button
              type="submit"
              disabled={isLoading || !inputCompanyName.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              aria-busy={isLoading}
              aria-describedby={isLoading ? 'loading-status' : undefined}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 motion-reduce:animate-pulse"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading
                </div>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
          {inputError && (
            <p 
              id="company-name-error" 
              className="mt-1 text-sm text-red-700 font-medium"
              role="alert"
            >
              {inputError}
            </p>
          )}
        </div>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div 
          className="text-center py-8"
          role="status"
          aria-live="polite"
          aria-label="Loading market intelligence data"
          id="loading-status"
        >
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-600 motion-reduce:animate-pulse"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-gray-700 font-medium">Analyzing market intelligence for {inputCompanyName}...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div 
          className="bg-red-50 border border-red-200 rounded-md p-4 mb-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 flex-shrink-0 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">
                Unable to fetch market data
              </h4>
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm font-semibold text-red-900 underline hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-1 py-0.5"
                aria-label={`Retry fetching market intelligence for ${inputCompanyName}`}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Market Intelligence Data */}
      {data && !isLoading && (
        <div className="space-y-4">
          {/* Sentiment Analysis */}
          <div role="group" aria-labelledby="sentiment-heading">
            <h4 id="sentiment-heading" className="text-sm font-medium text-gray-900 mb-2">Market Sentiment</h4>
            <div className="flex items-center justify-between">
              <div 
                className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getSentimentDisplay(data.sentiment, data.sentimentLabel).color}`}
                role="status"
                aria-label={`Market sentiment: ${data.sentimentLabel}. Sentiment score: ${data.sentiment} out of 100.`}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${getSentimentDisplay(data.sentiment, data.sentimentLabel).dotColor}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">
                  {data.sentimentLabel}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {data.newsCount} {data.newsCount === 1 ? 'article' : 'articles'}
                </div>
                <div className="text-xs text-gray-500">
                  Updated {formatDate(data.lastUpdated)}
                </div>
              </div>
            </div>
          </div>

          {/* Headlines */}
          <div role="group" aria-labelledby="headlines-heading">
            <h4 id="headlines-heading" className="text-sm font-medium text-gray-900 mb-3">
              Recent Headlines ({data.headlines.length})
            </h4>
            <div className="space-y-3" role="list" aria-label="Market intelligence headlines">
              {data.headlines.map((headline, index) => (
                <article 
                  key={index}
                  className="border-l-4 border-gray-200 pl-4 hover:border-blue-300 transition-colors focus-within:border-blue-500"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Headline ${index + 1} of ${data.headlines.length}`}
                >
                  <h5 className="text-sm font-medium text-gray-900 leading-tight mb-1">
                    {headline.title}
                  </h5>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium" aria-label={`Source: ${headline.source}`}>
                      {headline.source}
                    </span>
                    <time 
                      dateTime={headline.publishedAt}
                      aria-label={`Published on ${formatDate(headline.publishedAt)}`}
                    >
                      {formatDate(headline.publishedAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
            
            {data.headlines.length === 0 && (
              <div className="text-center py-4" role="status" aria-live="polite">
                <p className="text-sm text-gray-500">No recent headlines available for {inputCompanyName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !isLoading && !error && (
        <div className="text-center py-8" role="status" aria-live="polite">
          <svg
            className="h-12 w-12 mx-auto mb-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            aria-label="Chart icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            No market data yet
          </h4>
          <p className="text-sm text-gray-500">
            Enter a company name above to get market intelligence and sentiment analysis
          </p>
        </div>
      )}
    </div>
  );
}