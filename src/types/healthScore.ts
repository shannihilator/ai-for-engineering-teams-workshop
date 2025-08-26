/**
 * Type definitions for Customer Health Score Calculator
 * Provides type safety and documentation for health scoring system
 */

export interface PaymentMetrics {
  /** Days since last payment (0 = paid today, negative = payment in future) */
  daysSinceLastPayment: number;
  /** Average delay in payment over last 12 months (in days) */
  averagePaymentDelay: number;
  /** Current overdue amount in dollars */
  overdueAmount: number;
  /** Total number of payments made */
  totalPayments: number;
  /** Number of late payments in last 12 months */
  latePayments: number;
}

export interface EngagementMetrics {
  /** Number of logins in last 30 days */
  loginsLast30Days: number;
  /** Number of core features used in last 30 days */
  featuresUsedLast30Days: number;
  /** Average session duration in minutes */
  averageSessionMinutes: number;
  /** Number of support tickets opened in last 90 days */
  supportTicketsLast90Days: number;
  /** Total time spent in platform last 30 days (minutes) */
  totalTimeSpentMinutes: number;
}

export interface ContractMetrics {
  /** Days until contract renewal (negative = overdue renewal) */
  daysUntilRenewal: number;
  /** Annual contract value in dollars */
  contractValue: number;
  /** Whether customer upgraded in last 12 months */
  hasRecentUpgrade: boolean;
  /** Whether customer downgraded in last 12 months */
  hasRecentDowngrade: boolean;
  /** Contract duration in months */
  contractDurationMonths: number;
  /** Number of contract renewals completed */
  renewalHistory: number;
}

export interface SupportMetrics {
  /** Average ticket resolution time in hours */
  averageResolutionHours: number;
  /** Customer satisfaction score (1-10) */
  satisfactionScore: number;
  /** Number of escalated tickets in last 90 days */
  escalatedTickets: number;
  /** Total number of tickets in last 90 days */
  totalTickets: number;
  /** Number of critical/urgent tickets in last 90 days */
  criticalTickets: number;
}

export interface CustomerHealthData {
  customerId: string;
  paymentHistory: PaymentMetrics;
  engagement: EngagementMetrics;
  contract: ContractMetrics;
  support: SupportMetrics;
  /** When this data was last updated */
  lastUpdated: Date;
}

export interface FactorScore {
  /** Score for this factor (0-100) */
  score: number;
  /** Weight applied to this factor in overall calculation */
  weight: number;
  /** Contribution to overall score (score * weight) */
  contribution: number;
  /** Confidence in this score based on data quality (0-1) */
  confidence: number;
  /** Human-readable explanation of how score was calculated */
  explanation: string;
}

export interface HealthScoreResult {
  /** Overall health score (0-100) */
  overallScore: number;
  /** Risk level classification */
  riskLevel: 'healthy' | 'warning' | 'critical';
  /** Breakdown of individual factor scores */
  factorScores: {
    payment: FactorScore;
    engagement: FactorScore;
    contract: FactorScore;
    support: FactorScore;
  };
  /** Overall confidence in the score (0-1) */
  overallConfidence: number;
  /** When this score was calculated */
  calculatedAt: Date;
  /** Trend indicator compared to previous calculation */
  trend?: 'improving' | 'stable' | 'declining';
}

export type RiskLevel = 'healthy' | 'warning' | 'critical';

export interface HealthScoreWeights {
  payment: number;    // Default: 0.40 (40%)
  engagement: number; // Default: 0.30 (30%)
  contract: number;   // Default: 0.20 (20%)
  support: number;    // Default: 0.10 (10%)
}

/**
 * Configuration for health score calculation
 */
export interface HealthScoreConfig {
  weights: HealthScoreWeights;
  riskThresholds: {
    healthyMin: number;   // Default: 71
    warningMin: number;   // Default: 31
    criticalMax: number;  // Default: 30
  };
  /** Minimum confidence threshold for reliable scoring */
  minConfidenceThreshold: number; // Default: 0.6
}

/**
 * Error class for health score calculation failures
 */
export class HealthScoreCalculationError extends Error {
  constructor(
    message: string,
    public factor?: keyof CustomerHealthData,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'HealthScoreCalculationError';
  }
}

/**
 * Validation result for customer health data
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
  confidence: number;
}
