'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Customer } from '@/data/mock-customers';
import {
  CustomerHealthData,
  HealthScoreBreakdown,
  CalculationOptions,
  calculateHealthScore,
  HealthCalculatorError
} from '../../lib/healthCalculator';

// ============================================================================
// Component Props and Interfaces
// ============================================================================

export interface CustomerHealthDisplayProps {
  /** Customer data with health information for calculation */
  customer: Customer;
  /** Detailed health data for comprehensive scoring */
  healthData: CustomerHealthData;
  /** Show detailed breakdown - defaults to false */
  showBreakdown?: boolean;
  /** Optional callback when health score calculation completes */
  onHealthCalculated?: (score: number, breakdown: HealthScoreBreakdown) => void;
  /** Optional CSS classes for custom styling */
  className?: string;
}

/**
 * CustomerHealthDisplay component for displaying comprehensive customer health scores
 * with expandable breakdown of individual factor scores and confidence indicators
 * 
 * Integrates with health calculator library for real-time score calculations
 * and provides accessibility-compliant UI following dashboard design patterns
 */
export function CustomerHealthDisplay({
  customer,
  healthData,
  showBreakdown = false,
  onHealthCalculated,
  className = ''
}: CustomerHealthDisplayProps) {
  // ============================================================================
  // Component State
  // ============================================================================

  const [breakdown, setBreakdown] = useState<HealthScoreBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(showBreakdown);
  const [calculationId, setCalculationId] = useState(0);

  // ============================================================================
  // Calculation Options
  // ============================================================================

  const calculationOptions: CalculationOptions = useMemo(() => ({
    includeConfidenceScoring: true,
    newCustomerThreshold: 90,
    missingDataStrategy: 'neutral'
  }), []);

  // ============================================================================
  // Health Score Calculation
  // ============================================================================

  /**
   * Calculate health score with error handling and loading states
   */
  const calculateScore = useCallback(async () => {
    const currentCalculationId = Date.now();
    setCalculationId(currentCalculationId);
    setIsLoading(true);
    setError(null);

    try {
      // Simulate async calculation for loading state demonstration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if this calculation is still current
      if (calculationId !== 0 && currentCalculationId !== calculationId) {
        return; // Calculation was superseded
      }

      const result = calculateHealthScore(healthData, calculationOptions);
      setBreakdown(result);
      onHealthCalculated?.(result.overallScore, result);
    } catch (err) {
      if (err instanceof HealthCalculatorError) {
        setError(`Calculation failed: ${err.message}`);
      } else {
        setError('Unable to calculate health score. Please check your data and try again.');
      }
      setBreakdown(null);
    } finally {
      setIsLoading(false);
    }
  }, [healthData, calculationOptions, onHealthCalculated, calculationId]);

  /**
   * Handle retry functionality
   */
  const handleRetry = useCallback(() => {
    calculateScore();
  }, [calculateScore]);

  /**
   * Toggle breakdown expansion with accessibility announcement
   */
  const toggleBreakdown = useCallback(() => {
    setIsBreakdownExpanded(prev => !prev);
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Trigger calculation when health data changes
   */
  useEffect(() => {
    calculateScore();
  }, [calculateScore]);

  /**
   * Update expansion state when showBreakdown prop changes
   */
  useEffect(() => {
    setIsBreakdownExpanded(showBreakdown);
  }, [showBreakdown]);

  // ============================================================================
  // Display Utility Functions
  // ============================================================================

  /**
   * Get health score color and label based on score ranges
   * Matches CustomerCard color system for consistency
   */
  const getHealthScoreDisplay = useCallback((score: number) => {
    if (score >= 71) {
      return {
        color: 'text-green-700 bg-green-100 border-green-200',
        label: 'Healthy',
        dotColor: 'bg-green-500',
        riskColor: 'text-green-800',
        bgColor: 'bg-green-50'
      };
    } else if (score >= 31) {
      return {
        color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
        label: 'Warning',
        dotColor: 'bg-yellow-500',
        riskColor: 'text-yellow-800',
        bgColor: 'bg-yellow-50'
      };
    } else {
      return {
        color: 'text-red-700 bg-red-100 border-red-200',
        label: 'Critical',
        dotColor: 'bg-red-500',
        riskColor: 'text-red-800',
        bgColor: 'bg-red-50'
      };
    }
  }, []);

  /**
   * Get confidence indicator display properties
   */
  const getConfidenceDisplay = useCallback((confidence: number) => {
    if (confidence >= 80) {
      return { color: 'text-green-600', label: 'High confidence' };
    } else if (confidence >= 60) {
      return { color: 'text-yellow-600', label: 'Moderate confidence' };
    } else {
      return { color: 'text-red-600', label: 'Low confidence' };
    }
  }, []);

  /**
   * Format factor contribution for display
   */
  const formatFactorContribution = useCallback((factor: HealthScoreBreakdown['factors'][keyof HealthScoreBreakdown['factors']]) => {
    const percentage = Math.round(factor.weight * 100);
    return `${factor.score}/100 (${percentage}% weight = ${factor.contribution} points)`;
  }, []);

  // ============================================================================
  // Component Classes
  // ============================================================================

  const baseClasses = 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2';
  const componentClasses = `${baseClasses} ${className}`;

  // ============================================================================
  // Render Component
  // ============================================================================

  return (
    <div 
      className={componentClasses}
      style={{ maxWidth: '500px' }}
      role="region"
      aria-labelledby="health-score-heading"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 
          id="health-score-heading"
          className="text-lg font-semibold text-gray-900 mb-1"
        >
          Customer Health Score
        </h3>
        <p className="text-sm text-gray-600">
          Comprehensive health analysis for {customer.name}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div 
          className="text-center py-8"
          role="status"
          aria-live="polite"
          aria-label="Calculating customer health score"
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
          <p className="text-sm text-gray-700 font-medium">Calculating health score...</p>
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
                Health Score Calculation Failed
              </h4>
              <p className="text-sm text-red-800 font-medium">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-sm font-semibold text-red-900 underline hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-1 py-0.5"
                aria-label={`Retry calculating health score for ${customer.name}`}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Health Score Display */}
      {breakdown && !isLoading && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div role="group" aria-labelledby="overall-score-heading">
            <div className="flex items-center justify-between mb-3">
              <h4 id="overall-score-heading" className="text-sm font-medium text-gray-900">
                Overall Health Score
              </h4>
              <div 
                className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getHealthScoreDisplay(breakdown.overallScore).color}`}
                role="status"
                aria-label={`Overall health score: ${breakdown.overallScore} out of 100, ${breakdown.riskLevel} risk level`}
              >
                <div 
                  className={`w-3 h-3 rounded-full ${getHealthScoreDisplay(breakdown.overallScore).dotColor}`}
                  aria-hidden="true"
                />
                <span className="text-lg font-bold">
                  {breakdown.overallScore}
                </span>
                <span className="text-sm font-medium">
                  / 100
                </span>
              </div>
            </div>
            
            {/* Risk Level Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Level:</span>
              <span 
                className={`text-sm font-medium ${getHealthScoreDisplay(breakdown.overallScore).riskColor}`}
                aria-label={`Risk level: ${breakdown.riskLevel}`}
              >
                {breakdown.riskLevel}
              </span>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Data Confidence:</span>
            <div className="flex items-center gap-2">
              <span 
                className={`text-sm font-medium ${getConfidenceDisplay(breakdown.confidence).color}`}
                aria-label={`Data confidence: ${breakdown.confidence}%, ${getConfidenceDisplay(breakdown.confidence).label}`}
              >
                {breakdown.confidence}%
              </span>
              <span className="text-xs text-gray-500">
                ({getConfidenceDisplay(breakdown.confidence).label})
              </span>
            </div>
          </div>

          {/* Breakdown Toggle */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={toggleBreakdown}
              className="flex items-center justify-between w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 -mx-2"
              aria-expanded={isBreakdownExpanded}
              aria-controls="score-breakdown"
              aria-label={`${isBreakdownExpanded ? 'Hide' : 'Show'} detailed score breakdown`}
            >
              <span>Detailed Factor Breakdown</span>
              <svg
                className={`h-5 w-5 transform transition-transform duration-200 ${isBreakdownExpanded ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Detailed Breakdown */}
            <div
              id="score-breakdown"
              className={`mt-3 space-y-3 ${isBreakdownExpanded ? 'block' : 'hidden'}`}
              role="region"
              aria-labelledby="breakdown-heading"
              aria-live="polite"
            >
              <h5 id="breakdown-heading" className="sr-only">
                Health score factor breakdown
              </h5>

              {/* Payment Factor */}
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Payment History
                  </span>
                  <div 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${getHealthScoreDisplay(breakdown.factors.payment.score).color}`}
                    role="status"
                    aria-label={`Payment score: ${breakdown.factors.payment.score} out of 100`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${getHealthScoreDisplay(breakdown.factors.payment.score).dotColor}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium">
                      {breakdown.factors.payment.score}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {formatFactorContribution(breakdown.factors.payment)}
                </p>
              </div>

              {/* Engagement Factor */}
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Platform Engagement
                  </span>
                  <div 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${getHealthScoreDisplay(breakdown.factors.engagement.score).color}`}
                    role="status"
                    aria-label={`Engagement score: ${breakdown.factors.engagement.score} out of 100`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${getHealthScoreDisplay(breakdown.factors.engagement.score).dotColor}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium">
                      {breakdown.factors.engagement.score}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {formatFactorContribution(breakdown.factors.engagement)}
                </p>
              </div>

              {/* Contract Factor */}
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Contract Status
                  </span>
                  <div 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${getHealthScoreDisplay(breakdown.factors.contract.score).color}`}
                    role="status"
                    aria-label={`Contract score: ${breakdown.factors.contract.score} out of 100`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${getHealthScoreDisplay(breakdown.factors.contract.score).dotColor}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium">
                      {breakdown.factors.contract.score}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {formatFactorContribution(breakdown.factors.contract)}
                </p>
              </div>

              {/* Support Factor */}
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Support Experience
                  </span>
                  <div 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${getHealthScoreDisplay(breakdown.factors.support.score).color}`}
                    role="status"
                    aria-label={`Support score: ${breakdown.factors.support.score} out of 100`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${getHealthScoreDisplay(breakdown.factors.support.score).dotColor}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium">
                      {breakdown.factors.support.score}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {formatFactorContribution(breakdown.factors.support)}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {breakdown.recommendations && breakdown.recommendations.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Recommendations
              </h4>
              <ul className="space-y-2" role="list" aria-label="Health improvement recommendations">
                {breakdown.recommendations.map((recommendation, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                    role="listitem"
                  >
                    <svg
                      className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!breakdown && !isLoading && !error && (
        <div className="text-center py-8" role="status" aria-live="polite">
          <svg
            className="h-12 w-12 mx-auto mb-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            aria-label="Health score calculation icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Ready for Health Calculation
          </h4>
          <p className="text-sm text-gray-500">
            Health score will be calculated automatically when customer data is available
          </p>
        </div>
      )}
    </div>
  );
}