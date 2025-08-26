'use client';

import React, { useState } from 'react';
import { marketIntelligenceService, MarketIntelligenceData } from '../services/MarketIntelligenceService';

/**
 * Props interface for MarketIntelligenceWidget component
 */
interface MarketIntelligenceWidgetProps {
  /** Optional CSS classes to apply to the widget */
  className?: string;
  /** Pre-populated company name (from customer selection) */
  companyName?: string;
  /** Optional callback when analysis completes */
  onAnalysisComplete?: (data: MarketIntelligenceData) => void;
}

/**
 * Market Intelligence Widget Component
 *
 * Features:
 * - Input field for company name entry with validation
 * - Color-coded sentiment indicators (green/yellow/red)
 * - News article count and timestamp display
 * - Top 3 headlines with source and publication date
 * - Loading and error states with user feedback
 * - Keyboard accessibility and ARIA support
 *
 * @param props - Component props
 * @returns JSX element representing the market intelligence widget
 */
export function MarketIntelligenceWidget({
  className = '',
  companyName = '',
  onAnalysisComplete
}: MarketIntelligenceWidgetProps) {
  const [companyInput, setCompanyInput] = useState<string>(companyName);
  const [intelligenceData, setIntelligenceData] = useState<MarketIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates company name input on the client side
   * @param company - Company string to validate
   * @returns Boolean indicating if company name is valid
   */
  const isValidCompany = (company: string): boolean => {
    if (!company || company.length === 0) return false;

    // Basic client-side company validation
    const companyRegex = /^[a-zA-Z0-9\s\-\.\&\,\'\"]+$/;
    const trimmed = company.trim();

    return companyRegex.test(trimmed) && trimmed.length >= 1 && trimmed.length <= 100;
  };

  /**
   * Gets the appropriate color classes for sentiment status
   * @param sentiment - Sentiment analysis object
   * @returns Object with Tailwind CSS classes for styling
   */
  const getSentimentStatusStyle = (sentiment: MarketIntelligenceData['sentiment']) => {
    switch (sentiment.label) {
      case 'positive':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          indicatorColor: 'bg-green-500'
        };
      case 'negative':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          indicatorColor: 'bg-red-500'
        };
      case 'neutral':
      default:
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
          indicatorColor: 'bg-yellow-500'
        };
    }
  };

  /**
   * Handles market intelligence analysis submission
   */
  const handleAnalysis = async () => {
    const trimmedCompany = companyInput.trim();

    if (!isValidCompany(trimmedCompany)) {
      setError('Please enter a valid company name (e.g., Tesla, Microsoft, Apple Inc.)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIntelligenceData(null);

    try {
      const result = await marketIntelligenceService.getMarketIntelligence(trimmedCompany);
      setIntelligenceData(result);

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze market intelligence';
      setError(errorMessage);
      console.error('Market intelligence analysis failed:', err);

    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Enter key press in input field
   */
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAnalysis();
    }
  };

  /**
   * Formats timestamp for display
   * @param timestamp - ISO timestamp string
   * @returns Formatted time string
   */
  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Unknown time';
    }
  };

  /**
   * Formats publication date for headlines
   * @param publishedAt - ISO timestamp string
   * @returns Formatted date string
   */
  const formatPublicationDate = (publishedAt: string): string => {
    try {
      const date = new Date(publishedAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        return 'Just now';
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Market Intelligence Analysis
        </h2>
        <p className="text-sm text-gray-600">
          Monitor market sentiment and recent news coverage for customer companies. Enter a company name to get real-time market analysis.
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label
          htmlFor="company-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Company Name
        </label>
        <div className="flex gap-3">
          <input
            id="company-input"
            type="text"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Tesla, Microsoft, Apple Inc."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-describedby="company-input-help"
          />
          <button
            onClick={handleAnalysis}
            disabled={isLoading || !companyInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isLoading ? 'Analyzing market data...' : 'Analyze market intelligence'}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </div>
            ) : (
              'Analyze Market'
            )}
          </button>
        </div>
        <p id="company-input-help" className="text-xs text-gray-500 mt-1">
          Enter a public company name. Examples: Tesla, Microsoft, Apple Inc., Amazon
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-red-800">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Market Intelligence Results */}
      {intelligenceData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Market Analysis for {intelligenceData.company}
            </h3>
            {intelligenceData.error && (
              <span className="text-sm text-red-600 font-medium">
                Analysis Failed
              </span>
            )}
          </div>

          {!intelligenceData.error ? (
            <div className="space-y-4">
              {/* Sentiment Analysis */}
              <div className={`p-4 rounded-lg border ${getSentimentStatusStyle(intelligenceData.sentiment).bgColor} ${getSentimentStatusStyle(intelligenceData.sentiment).borderColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full ${getSentimentStatusStyle(intelligenceData.sentiment).indicatorColor}`} />
                  <span className={`font-semibold text-lg capitalize ${getSentimentStatusStyle(intelligenceData.sentiment).textColor}`}>
                    {intelligenceData.sentiment.label} Sentiment
                  </span>
                  <span className={`text-sm ${getSentimentStatusStyle(intelligenceData.sentiment).textColor}`}>
                    (Score: {intelligenceData.sentiment.score.toFixed(2)})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Confidence:</span>
                    <span className="ml-2 text-gray-900">{Math.round(intelligenceData.sentiment.confidence * 100)}%</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Articles Analyzed:</span>
                    <span className="ml-2 text-gray-900">{intelligenceData.news.articleCount}</span>
                  </div>
                </div>
              </div>

              {/* News Headlines */}
              {intelligenceData.news.headlines.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Headlines</h4>
                  <div className="space-y-3">
                    {intelligenceData.news.headlines.map((headline, index) => (
                      <div key={index} className="bg-white p-3 rounded-md border">
                        <h5 className="font-medium text-gray-900 text-sm leading-tight mb-2">
                          {headline.url ? (
                            <a
                              href={headline.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 underline"
                            >
                              {headline.title}
                            </a>
                          ) : (
                            headline.title
                          )}
                        </h5>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-medium">{headline.source}</span>
                          <span>{formatPublicationDate(headline.publishedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2">{formatTimestamp(intelligenceData.timestamp)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">
                <span className="font-medium">Analysis failed:</span> {intelligenceData.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
