'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { calculateHealthScore, getHealthScoreExplanation } from '../lib/healthCalculator';
import { generateCustomerHealthData } from '../data/mock-health-data';
import { Customer } from '../data/mock-customers';
import { HealthScoreResult, FactorScore, RiskLevel } from '../types/healthScore';

/**
 * Props interface for CustomerHealthDisplay component
 */
interface CustomerHealthDisplayProps {
  /** Customer to display health information for */
  customer: Customer | null;
  /** Optional CSS classes to apply to the widget */
  className?: string;
  /** Optional callback when health score is calculated */
  onHealthCalculated?: (result: HealthScoreResult) => void;
}

/**
 * Risk level color mapping for consistent UI theming
 */
const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'healthy':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Risk level icon mapping
 */
const getRiskIcon = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'critical':
      return '🚨';
    default:
      return '❓';
  }
};

/**
 * Factor Score Display Component
 */
interface FactorScoreDisplayProps {
  factorName: string;
  factorScore: FactorScore;
  isExpanded: boolean;
}

function FactorScoreDisplay({ factorName, factorScore, isExpanded }: FactorScoreDisplayProps) {
  const percentage = Math.round(factorScore.score);
  const contribution = Math.round(factorScore.contribution);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {factorName}
              </span>
              <span className="text-sm text-gray-500">
                {factorScore.weight * 100}% weight
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentage >= 71 ? 'bg-green-500' :
                    percentage >= 31 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                {percentage}/100
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            +{contribution}
          </div>
          <div className="text-xs text-gray-500">
            points
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2">
              <strong>Confidence:</strong> {Math.round(factorScore.confidence * 100)}%
            </div>
            <div className="text-xs text-gray-700">
              {factorScore.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Customer Health Display Widget Component
 *
 * Features:
 * - Real-time health score calculation based on customer data
 * - Color-coded risk level indicators
 * - Expandable factor breakdown with detailed explanations
 * - Loading and error states with user feedback
 * - Keyboard accessibility and ARIA support
 * - Performance optimized with useMemo for calculations
 *
 * @param props - Component props
 * @returns JSX element representing the customer health display
 */
export function CustomerHealthDisplay({
  customer,
  className = '',
  onHealthCalculated
}: CustomerHealthDisplayProps) {
  const [healthResult, setHealthResult] = useState<HealthScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Memoized health calculation to avoid unnecessary recalculations
  const calculatedHealth = useMemo(() => {
    if (!customer) return null;

    try {
      const healthData = generateCustomerHealthData(customer.id);
      if (!healthData) {
        throw new Error('Unable to generate health data for customer');
      }

      return calculateHealthScore(healthData);
    } catch (err) {
      console.error('Health calculation error:', err);
      return null;
    }
  }, [customer?.id]);

  // Effect to handle health calculation results
  useEffect(() => {
    if (!customer) {
      setHealthResult(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate realistic calculation delay
    const timer = setTimeout(() => {
      if (calculatedHealth) {
        setHealthResult(calculatedHealth);
        onHealthCalculated?.(calculatedHealth);
        setError(null);
      } else {
        setError('Failed to calculate health score. Please try again.');
        setHealthResult(null);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [customer, calculatedHealth, onHealthCalculated]);

  // Handle expansion toggle
  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Calculating health score...</span>
          </div>
        </div>
      </div>
    );
  }

  // No customer selected state
  if (!customer) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 text-center">
          <div className="text-gray-400 text-lg mb-2">💡</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Customer Health Score</h3>
          <p className="text-gray-500 text-sm">
            Select a customer to view their health score and risk assessment.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 shadow-sm ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-red-500 text-xl">⚠️</span>
            <h3 className="text-lg font-semibold text-red-700">Health Score Error</h3>
          </div>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            aria-label="Retry health score calculation"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main health display
  if (!healthResult) {
    return null;
  }

  const { overallScore, riskLevel, factorScores, overallConfidence, calculatedAt } = healthResult;
  const explanation = getHealthScoreExplanation(healthResult);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Health Score: {customer.name}
          </h3>
          <div className="text-sm text-gray-500">
            {calculatedAt.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getRiskColor(riskLevel)}`}>
              <span className="mr-2 text-lg" role="img" aria-label={`${riskLevel} risk level`}>
                {getRiskIcon(riskLevel)}
              </span>
              <span className="font-semibold capitalize">{riskLevel}</span>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900" aria-label={`Health score ${overallScore} out of 100`}>
                {overallScore}
              </div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Confidence: {Math.round(overallConfidence * 100)}%
            </div>
            <div className="text-xs text-gray-500">
              Based on recent activity
            </div>
          </div>
        </div>

        {/* Score Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">{explanation}</p>
        </div>

        {/* Factor Breakdown Toggle */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={handleToggleExpansion}
            className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
            aria-expanded={isExpanded}
            aria-controls="factor-breakdown"
          >
            <span className="text-sm font-medium text-gray-700">
              Factor Breakdown ({Object.keys(factorScores).length} factors)
            </span>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
              ▼
            </span>
          </button>

          {isExpanded && (
            <div id="factor-breakdown" className="border-t border-gray-200">
              {Object.entries(factorScores).map(([factorName, factorScore]) => (
                <FactorScoreDisplay
                  key={factorName}
                  factorName={factorName}
                  factorScore={factorScore}
                  isExpanded={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Items (if critical or warning) */}
        {(riskLevel === 'critical' || riskLevel === 'warning') && (
          <div className={`mt-4 p-4 rounded-lg border-2 ${
            riskLevel === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              riskLevel === 'critical' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {riskLevel === 'critical' ? 'Immediate Action Required' : 'Recommended Actions'}
            </h4>
            <ul className={`text-sm space-y-1 ${
              riskLevel === 'critical' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {riskLevel === 'critical' && (
                <>
                  <li>• Schedule urgent customer success call</li>
                  <li>• Review payment status and overdue amounts</li>
                  <li>• Investigate engagement and usage patterns</li>
                </>
              )}
              {riskLevel === 'warning' && (
                <>
                  <li>• Monitor customer activity trends</li>
                  <li>• Reach out to discuss renewal plans</li>
                  <li>• Provide additional training or support</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerHealthDisplay;
