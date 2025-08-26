'use client';

import React, { useState } from 'react';
import { domainHealthService, DomainHealthData } from '../services/DomainHealthService';

/**
 * Props interface for DomainHealthWidget component
 */
interface DomainHealthWidgetProps {
  /** Optional CSS classes to apply to the widget */
  className?: string;
  /** Optional callback when domain health check completes */
  onHealthCheck?: (data: DomainHealthData) => void;
}

/**
 * Domain Health Widget Component
 * 
 * Features:
 * - Input field for domain entry with validation
 * - Color-coded health status indicators
 * - Response time and timestamp display
 * - Loading and error states with user feedback
 * - Keyboard accessibility and ARIA support
 * 
 * @param props - Component props
 * @returns JSX element representing the domain health widget
 */
export function DomainHealthWidget({ 
  className = '', 
  onHealthCheck 
}: DomainHealthWidgetProps) {
  const [domainInput, setDomainInput] = useState<string>('');
  const [healthData, setHealthData] = useState<DomainHealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates domain input on the client side
   * @param domain - Domain string to validate
   * @returns Boolean indicating if domain is valid
   */
  const isValidDomain = (domain: string): boolean => {
    if (!domain || domain.length === 0) return false;
    
    // Basic client-side domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain.trim().toLowerCase());
  };

  /**
   * Gets the appropriate color classes for health status
   * @param status - Health status string
   * @returns Object with Tailwind CSS classes for styling
   */
  const getHealthStatusStyle = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          indicatorColor: 'bg-green-500'
        };
      case 'degraded':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300',
          indicatorColor: 'bg-yellow-500'
        };
      case 'unhealthy':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          indicatorColor: 'bg-red-500'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300',
          indicatorColor: 'bg-gray-500'
        };
    }
  };

  /**
   * Handles domain health check submission
   */
  const handleHealthCheck = async () => {
    const trimmedDomain = domainInput.trim();
    
    if (!isValidDomain(trimmedDomain)) {
      setError('Please enter a valid domain name (e.g., example.com)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHealthData(null);

    try {
      const result = await domainHealthService.getDomainHealth(trimmedDomain);
      setHealthData(result);
      
      if (onHealthCheck) {
        onHealthCheck(result);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check domain health';
      setError(errorMessage);
      console.error('Domain health check failed:', err);
      
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
      handleHealthCheck();
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Customer Website Health Checker
        </h2>
        <p className="text-sm text-gray-600">
          Monitor customer website uptime and accessibility. Enter a domain name (e.g., google.com, github.com) to check if the website is online.
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label 
          htmlFor="domain-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Domain Name
        </label>
        <div className="flex gap-3">
          <input
            id="domain-input"
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., google.com, github.com, amazon.com"
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-describedby="domain-input-help"
          />
          <button
            onClick={handleHealthCheck}
            disabled={isLoading || !domainInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isLoading ? 'Checking domain health...' : 'Check domain health'}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking...
              </div>
            ) : (
              'Check Health'
            )}
          </button>
        </div>
        <p id="domain-input-help" className="text-xs text-gray-500 mt-1">
          Enter a domain without protocol (http/https). Examples: google.com, github.com, amazon.com
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

      {/* Health Status Results */}
      {healthData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Health Status for {healthData.domain}
            </h3>
            {healthData.error && (
              <span className="text-sm text-red-600 font-medium">
                Check Failed
              </span>
            )}
          </div>

          {!healthData.error ? (
            <div className={`p-4 rounded-lg border ${getHealthStatusStyle(healthData.status).bgColor} ${getHealthStatusStyle(healthData.status).borderColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded-full ${getHealthStatusStyle(healthData.status).indicatorColor}`} />
                <span className={`font-semibold text-lg capitalize ${getHealthStatusStyle(healthData.status).textColor}`}>
                  {healthData.status}
                </span>
                <span className={`text-sm ${getHealthStatusStyle(healthData.status).textColor}`}>
                  ({healthData.isHealthy ? 'Online' : 'Issues Detected'})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Response Time:</span>
                  <span className="ml-2 text-gray-900">{healthData.responseTime}ms</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Checked:</span>
                  <span className="ml-2 text-gray-900">{formatTimestamp(healthData.timestamp)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">
                <span className="font-medium">Health check failed:</span> {healthData.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}