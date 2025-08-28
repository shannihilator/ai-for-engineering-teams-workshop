/**
 * Customer Health Score Calculator Library
 * 
 * Provides comprehensive customer health scoring system for predictive analytics
 * and churn risk assessment within the Customer Intelligence Dashboard.
 * 
 * Algorithm uses validated business weighting:
 * - Payment History: 40%
 * - Engagement Metrics: 30% 
 * - Contract Status: 20%
 * - Support Experience: 10%
 * 
 * All scoring functions are pure functions returning normalized 0-100 scores.
 */

import { Customer } from '@/data/mock-customers';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CustomerHealthData extends Customer {
  paymentHistory: {
    daysSinceLastPayment: number;
    averagePaymentDelay: number;
    overdueAmount: number;
    paymentReliabilityScore?: number;
  };
  engagementMetrics: {
    loginFrequency: number; // logins per month
    featureUsageCount: number;
    activeUserCount: number;
    lastLoginDate: string;
  };
  contractInformation: {
    daysUntilRenewal: number;
    contractValue: number;
    recentUpgrades: boolean;
    renewalProbability?: number;
  };
  supportData: {
    averageResolutionTime: number; // hours
    satisfactionScore: number; // 1-5 scale
    escalationCount: number;
    openTicketCount: number;
  };
}

export interface HealthScoreBreakdown {
  overallScore: number;
  confidence: number; // 0-100 indicating data quality
  factors: {
    payment: { score: number; weight: number; contribution: number };
    engagement: { score: number; weight: number; contribution: number };
    contract: { score: number; weight: number; contribution: number };
    support: { score: number; weight: number; contribution: number };
  };
  riskLevel: 'Healthy' | 'Warning' | 'Critical';
  recommendations?: string[];
}

export interface CalculationOptions {
  includeConfidenceScoring?: boolean;
  newCustomerThreshold?: number; // days
  missingDataStrategy?: 'neutral' | 'conservative' | 'optimistic';
}

// ============================================================================
// Error Classes
// ============================================================================

export class HealthCalculatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HealthCalculatorError';
  }
}

export class ValidationError extends HealthCalculatorError {
  constructor(field: string, value: unknown, expectedType: string) {
    super(`Invalid ${field}: expected ${expectedType}, got ${typeof value} (${value})`);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates numeric input with optional range checking
 */
function validateNumber(value: unknown, fieldName: string, min?: number, max?: number): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(fieldName, value, 'number');
  }
  
  if (min !== undefined && value < min) {
    throw new ValidationError(fieldName, value, `number >= ${min}`);
  }
  
  if (max !== undefined && value > max) {
    throw new ValidationError(fieldName, value, `number <= ${max}`);
  }
  
  return value;
}

/**
 * Validates date string input
 */
function validateDateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(fieldName, value, 'string (ISO date)');
  }
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(fieldName, value, 'valid ISO date string');
  }
  
  return value;
}

/**
 * Validates customer health data structure
 */
function validateHealthData(data: CustomerHealthData): void {
  // Payment validation
  validateNumber(data.paymentHistory.daysSinceLastPayment, 'paymentHistory.daysSinceLastPayment', 0);
  validateNumber(data.paymentHistory.averagePaymentDelay, 'paymentHistory.averagePaymentDelay', 0);
  validateNumber(data.paymentHistory.overdueAmount, 'paymentHistory.overdueAmount', 0);
  
  // Engagement validation
  validateNumber(data.engagementMetrics.loginFrequency, 'engagementMetrics.loginFrequency', 0);
  validateNumber(data.engagementMetrics.featureUsageCount, 'engagementMetrics.featureUsageCount', 0);
  validateNumber(data.engagementMetrics.activeUserCount, 'engagementMetrics.activeUserCount', 0);
  validateDateString(data.engagementMetrics.lastLoginDate, 'engagementMetrics.lastLoginDate');
  
  // Contract validation
  validateNumber(data.contractInformation.daysUntilRenewal, 'contractInformation.daysUntilRenewal');
  validateNumber(data.contractInformation.contractValue, 'contractInformation.contractValue', 0);
  
  // Support validation
  validateNumber(data.supportData.averageResolutionTime, 'supportData.averageResolutionTime', 0);
  validateNumber(data.supportData.satisfactionScore, 'supportData.satisfactionScore', 1, 5);
  validateNumber(data.supportData.escalationCount, 'supportData.escalationCount', 0);
  validateNumber(data.supportData.openTicketCount, 'supportData.openTicketCount', 0);
}

// ============================================================================
// Individual Scoring Functions
// ============================================================================

/**
 * Calculate payment score based on payment history patterns
 * 
 * Factors considered:
 * - Days since last payment (recency impact)
 * - Average payment delay patterns 
 * - Current overdue amounts
 * 
 * @param paymentHistory - Payment data for scoring
 * @returns Normalized score 0-100
 */
export function calculatePaymentScore(paymentHistory: CustomerHealthData['paymentHistory']): number {
  const { daysSinceLastPayment, averagePaymentDelay, overdueAmount } = paymentHistory;
  
  // Recency score (0-40 points): Recent payments are good
  let recencyScore = 0;
  if (daysSinceLastPayment <= 30) {
    recencyScore = 40;
  } else if (daysSinceLastPayment <= 60) {
    recencyScore = 30;
  } else if (daysSinceLastPayment <= 90) {
    recencyScore = 20;
  } else {
    recencyScore = 0;
  }
  
  // Reliability score (0-40 points): Consistent on-time payments
  let reliabilityScore = 0;
  if (averagePaymentDelay <= 0) {
    reliabilityScore = 40; // Early payments
  } else if (averagePaymentDelay <= 5) {
    reliabilityScore = 35; // On time
  } else if (averagePaymentDelay <= 15) {
    reliabilityScore = 25; // Slightly late
  } else if (averagePaymentDelay <= 30) {
    reliabilityScore = 15; // Concerning delays
  } else {
    reliabilityScore = 0; // Poor payment history
  }
  
  // Overdue penalty (0-20 points): Current outstanding amounts
  let overdueScore = 20;
  if (overdueAmount > 10000) {
    overdueScore = 0; // Significant overdue amount
  } else if (overdueAmount > 5000) {
    overdueScore = 5;
  } else if (overdueAmount > 1000) {
    overdueScore = 10;
  } else if (overdueAmount > 0) {
    overdueScore = 15;
  }
  // else overdueScore = 20 (no overdue amount)
  
  return Math.max(0, Math.min(100, recencyScore + reliabilityScore + overdueScore));
}

/**
 * Calculate engagement score based on platform usage metrics
 * 
 * Factors considered:
 * - Login frequency (monthly active usage)
 * - Feature adoption and usage breadth
 * - Active user count (team engagement)
 * - Last login recency
 * 
 * @param engagementMetrics - Engagement data for scoring
 * @returns Normalized score 0-100
 */
export function calculateEngagementScore(engagementMetrics: CustomerHealthData['engagementMetrics']): number {
  const { loginFrequency, featureUsageCount, activeUserCount, lastLoginDate } = engagementMetrics;
  
  // Login frequency score (0-30 points)
  let loginScore = 0;
  if (loginFrequency >= 20) {
    loginScore = 30; // Daily active users
  } else if (loginFrequency >= 10) {
    loginScore = 25; // Regular usage
  } else if (loginFrequency >= 5) {
    loginScore = 20; // Weekly usage
  } else if (loginFrequency >= 1) {
    loginScore = 10; // Monthly usage
  }
  // else loginScore = 0 (inactive)
  
  // Feature usage score (0-25 points)
  let featureScore = 0;
  if (featureUsageCount >= 15) {
    featureScore = 25; // Power user
  } else if (featureUsageCount >= 10) {
    featureScore = 20; // Good adoption
  } else if (featureUsageCount >= 5) {
    featureScore = 15; // Basic usage
  } else if (featureUsageCount >= 1) {
    featureScore = 10; // Minimal usage
  }
  // else featureScore = 0 (no features used)
  
  // Active user count score (0-25 points)
  let userCountScore = 0;
  if (activeUserCount >= 20) {
    userCountScore = 25; // Large team engagement
  } else if (activeUserCount >= 10) {
    userCountScore = 20; // Medium team
  } else if (activeUserCount >= 5) {
    userCountScore = 15; // Small team
  } else if (activeUserCount >= 1) {
    userCountScore = 10; // Individual user
  }
  // else userCountScore = 0 (no active users)
  
  // Last login recency score (0-20 points)
  const lastLogin = new Date(lastLoginDate);
  const now = new Date();
  const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
  
  let recencyScore = 0;
  if (daysSinceLastLogin <= 1) {
    recencyScore = 20; // Recent activity
  } else if (daysSinceLastLogin <= 7) {
    recencyScore = 15; // This week
  } else if (daysSinceLastLogin <= 30) {
    recencyScore = 10; // This month
  } else if (daysSinceLastLogin <= 90) {
    recencyScore = 5; // Last quarter
  }
  // else recencyScore = 0 (inactive for 90+ days)
  
  return Math.max(0, Math.min(100, loginScore + featureScore + userCountScore + recencyScore));
}

/**
 * Calculate contract score based on renewal likelihood and contract health
 * 
 * Factors considered:
 * - Days until contract renewal (urgency factor)
 * - Contract value trends
 * - Recent upgrades or downgrades
 * 
 * @param contractInformation - Contract data for scoring
 * @returns Normalized score 0-100
 */
export function calculateContractScore(contractInformation: CustomerHealthData['contractInformation']): number {
  const { daysUntilRenewal, contractValue, recentUpgrades } = contractInformation;
  
  // Renewal urgency score (0-40 points)
  let urgencyScore = 0;
  if (daysUntilRenewal > 365) {
    urgencyScore = 40; // Long-term contract
  } else if (daysUntilRenewal > 180) {
    urgencyScore = 35; // Comfortable runway
  } else if (daysUntilRenewal > 90) {
    urgencyScore = 25; // Renewal attention needed
  } else if (daysUntilRenewal > 30) {
    urgencyScore = 15; // Urgent renewal required
  } else if (daysUntilRenewal > 0) {
    urgencyScore = 5; // Critical renewal timeline
  } else {
    urgencyScore = 0; // Contract expired
  }
  
  // Contract value score (0-35 points)
  let valueScore = 0;
  if (contractValue >= 100000) {
    valueScore = 35; // Enterprise contract
  } else if (contractValue >= 50000) {
    valueScore = 30; // Large contract
  } else if (contractValue >= 20000) {
    valueScore = 25; // Medium contract
  } else if (contractValue >= 5000) {
    valueScore = 20; // Small contract
  } else if (contractValue > 0) {
    valueScore = 10; // Basic contract
  }
  // else valueScore = 0 (no contract value)
  
  // Recent activity score (0-25 points)
  let activityScore = 0;
  if (recentUpgrades) {
    activityScore = 25; // Positive expansion signal
  } else {
    activityScore = 15; // Stable (neutral)
  }
  // Note: Could add downgrades detection for negative scoring
  
  return Math.max(0, Math.min(100, urgencyScore + valueScore + activityScore));
}

/**
 * Calculate support score based on service quality and customer satisfaction
 * 
 * Factors considered:
 * - Average resolution time efficiency
 * - Customer satisfaction ratings
 * - Escalation frequency patterns
 * - Current open ticket load
 * 
 * @param supportData - Support data for scoring
 * @returns Normalized score 0-100
 */
export function calculateSupportScore(supportData: CustomerHealthData['supportData']): number {
  const { averageResolutionTime, satisfactionScore, escalationCount, openTicketCount } = supportData;
  
  // Resolution time score (0-30 points)
  let resolutionScore = 0;
  if (averageResolutionTime <= 4) {
    resolutionScore = 30; // Excellent response time
  } else if (averageResolutionTime <= 8) {
    resolutionScore = 25; // Good response time
  } else if (averageResolutionTime <= 24) {
    resolutionScore = 20; // Acceptable same-day
  } else if (averageResolutionTime <= 48) {
    resolutionScore = 15; // Slow but within SLA
  } else if (averageResolutionTime <= 72) {
    resolutionScore = 10; // Poor response time
  } else {
    resolutionScore = 0; // Unacceptable delays
  }
  
  // Satisfaction score (0-30 points) - Convert 1-5 scale to 0-30
  const satisfactionPoints = Math.max(0, Math.min(30, (satisfactionScore - 1) * 7.5));
  
  // Escalation penalty (0-25 points)
  let escalationScore = 25;
  if (escalationCount >= 5) {
    escalationScore = 0; // High escalation rate
  } else if (escalationCount >= 3) {
    escalationScore = 10; // Concerning escalations
  } else if (escalationCount >= 1) {
    escalationScore = 20; // Some escalations
  }
  // else escalationScore = 25 (no escalations)
  
  // Open ticket load (0-15 points)
  let ticketScore = 15;
  if (openTicketCount >= 10) {
    ticketScore = 0; // High ticket load
  } else if (openTicketCount >= 5) {
    ticketScore = 5; // Moderate load
  } else if (openTicketCount >= 2) {
    ticketScore = 10; // Low load
  }
  // else ticketScore = 15 (minimal or no open tickets)
  
  return Math.max(0, Math.min(100, resolutionScore + satisfactionPoints + escalationScore + ticketScore));
}

// ============================================================================
// Main Calculation Functions
// ============================================================================

/**
 * Calculate confidence score based on data quality and completeness
 * 
 * @param data - Customer health data
 * @param options - Calculation options
 * @returns Confidence score 0-100
 */
function calculateConfidenceScore(data: CustomerHealthData, options: CalculationOptions): number {
  let confidence = 100;
  
  // Check for missing optional fields
  if (data.paymentHistory.paymentReliabilityScore === undefined) confidence -= 5;
  if (data.contractInformation.renewalProbability === undefined) confidence -= 5;
  
  // Check data recency for engagement
  const lastLogin = new Date(data.engagementMetrics.lastLoginDate);
  const now = new Date();
  const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastLogin > 30) confidence -= 10;
  if (daysSinceLastLogin > 90) confidence -= 20;
  
  // Check for new customer adjustments
  if (options.newCustomerThreshold && data.createdAt) {
    const createdDate = new Date(data.createdAt);
    const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation < options.newCustomerThreshold) {
      confidence -= 25; // Lower confidence for new customers
    }
  }
  
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Generate recommendations based on score breakdown
 * 
 * @param breakdown - Health score breakdown
 * @returns Array of actionable recommendations
 */
function generateRecommendations(breakdown: HealthScoreBreakdown): string[] {
  const recommendations: string[] = [];
  const { factors } = breakdown;
  
  // Payment recommendations
  if (factors.payment.score < 50) {
    recommendations.push('Address payment delays and overdue amounts immediately');
  } else if (factors.payment.score < 70) {
    recommendations.push('Monitor payment patterns and implement automated reminders');
  }
  
  // Engagement recommendations
  if (factors.engagement.score < 50) {
    recommendations.push('Schedule user onboarding session to increase platform adoption');
  } else if (factors.engagement.score < 70) {
    recommendations.push('Provide feature training to improve engagement metrics');
  }
  
  // Contract recommendations
  if (factors.contract.score < 50) {
    recommendations.push('Initiate renewal conversation and value demonstration');
  } else if (factors.contract.score < 70) {
    recommendations.push('Identify expansion opportunities before renewal');
  }
  
  // Support recommendations
  if (factors.support.score < 50) {
    recommendations.push('Review support escalations and improve resolution processes');
  } else if (factors.support.score < 70) {
    recommendations.push('Focus on proactive support to improve satisfaction scores');
  }
  
  return recommendations;
}

/**
 * Determine risk level based on overall health score
 * 
 * @param score - Overall health score 0-100
 * @returns Risk level classification
 */
function determineRiskLevel(score: number): 'Healthy' | 'Warning' | 'Critical' {
  if (score >= 71) return 'Healthy';
  if (score >= 31) return 'Warning';
  return 'Critical';
}

/**
 * Calculate comprehensive customer health score with detailed breakdown
 * 
 * Uses validated business weighting:
 * - Payment History: 40%
 * - Engagement Metrics: 30%
 * - Contract Status: 20%
 * - Support Experience: 10%
 * 
 * @param data - Customer health data
 * @param options - Calculation options
 * @returns Complete health score breakdown
 */
export function calculateHealthScore(
  data: CustomerHealthData,
  options: CalculationOptions = {}
): HealthScoreBreakdown {
  try {
    // Validate input data
    validateHealthData(data);
    
    // Set default options
    const opts: CalculationOptions = {
      includeConfidenceScoring: true,
      newCustomerThreshold: 90,
      missingDataStrategy: 'neutral',
      ...options
    };
    
    // Calculate individual factor scores
    const paymentScore = calculatePaymentScore(data.paymentHistory);
    const engagementScore = calculateEngagementScore(data.engagementMetrics);
    const contractScore = calculateContractScore(data.contractInformation);
    const supportScore = calculateSupportScore(data.supportData);
    
    // Apply business weights
    const weights = {
      payment: 0.4,
      engagement: 0.3,
      contract: 0.2,
      support: 0.1
    };
    
    // Calculate weighted overall score
    const overallScore = Math.round(
      (paymentScore * weights.payment) +
      (engagementScore * weights.engagement) +
      (contractScore * weights.contract) +
      (supportScore * weights.support)
    );
    
    // Calculate confidence if requested
    const confidence = opts.includeConfidenceScoring 
      ? calculateConfidenceScore(data, opts)
      : 100;
    
    // Build comprehensive breakdown
    const breakdown: HealthScoreBreakdown = {
      overallScore,
      confidence,
      factors: {
        payment: {
          score: paymentScore,
          weight: weights.payment,
          contribution: Math.round(paymentScore * weights.payment)
        },
        engagement: {
          score: engagementScore,
          weight: weights.engagement,
          contribution: Math.round(engagementScore * weights.engagement)
        },
        contract: {
          score: contractScore,
          weight: weights.contract,
          contribution: Math.round(contractScore * weights.contract)
        },
        support: {
          score: supportScore,
          weight: weights.support,
          contribution: Math.round(supportScore * weights.support)
        }
      },
      riskLevel: determineRiskLevel(overallScore)
    };
    
    // Generate recommendations
    breakdown.recommendations = generateRecommendations(breakdown);
    
    return breakdown;
    
  } catch (error) {
    if (error instanceof HealthCalculatorError) {
      throw error;
    }
    throw new HealthCalculatorError(`Health calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate simple health score (backward compatible with existing Customer interface)
 * 
 * @param data - Customer health data
 * @param options - Calculation options
 * @returns Simple health score 0-100
 */
export function calculateSimpleHealthScore(
  data: CustomerHealthData,
  options?: CalculationOptions
): number {
  const breakdown = calculateHealthScore(data, options);
  return breakdown.overallScore;
}

// Export default calculation function
export default calculateHealthScore;