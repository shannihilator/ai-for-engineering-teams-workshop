/**
 * Customer Health Score Calculator
 *
 * Provides pure functions for calculating customer health scores based on
 * multiple factors: payment history, engagement, contract status, and support metrics.
 *
 * Algorithm Design:
 * - Payment Factor (40%): Emphasizes financial health as primary churn indicator
 * - Engagement Factor (30%): Measures product adoption and usage patterns
 * - Contract Factor (20%): Assesses renewal risk and growth potential
 * - Support Factor (10%): Captures satisfaction and service quality impact
 *
 * All functions are pure with no side effects for predictable testing and caching.
 */

import {
  CustomerHealthData,
  PaymentMetrics,
  EngagementMetrics,
  ContractMetrics,
  SupportMetrics,
  HealthScoreResult,
  FactorScore,
  RiskLevel,
  HealthScoreConfig,
  HealthScoreCalculationError,
  ValidationResult
} from '../types/healthScore';

/**
 * Default configuration for health score calculation
 */
export const DEFAULT_CONFIG: HealthScoreConfig = {
  weights: {
    payment: 0.40,
    engagement: 0.30,
    contract: 0.20,
    support: 0.10
  },
  riskThresholds: {
    healthyMin: 71,
    warningMin: 31,
    criticalMax: 30
  },
  minConfidenceThreshold: 0.6
};

/**
 * Validates customer health data and returns validation result
 * @param data Customer health data to validate
 * @returns Validation result with errors and confidence assessment
 */
export function validateHealthData(data: CustomerHealthData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  let totalFields = 0;
  let validFields = 0;

  // Validate payment metrics
  const payment = data.paymentHistory;
  totalFields += 5;

  if (payment.daysSinceLastPayment < 0 && payment.daysSinceLastPayment < -30) {
    warnings.push('Payment scheduled more than 30 days in future');
  } else {
    validFields++;
  }

  if (payment.averagePaymentDelay < 0) {
    errors.push('Average payment delay cannot be negative');
  } else {
    validFields++;
  }

  if (payment.overdueAmount < 0) {
    errors.push('Overdue amount cannot be negative');
  } else {
    validFields++;
  }

  if (payment.totalPayments < 0) {
    errors.push('Total payments cannot be negative');
  } else if (payment.totalPayments === 0) {
    warnings.push('No payment history available');
    validFields += 0.5;
  } else {
    validFields++;
  }

  if (payment.latePayments < 0 || payment.latePayments > payment.totalPayments) {
    errors.push('Late payments must be between 0 and total payments');
  } else {
    validFields++;
  }

  // Validate engagement metrics
  const engagement = data.engagement;
  totalFields += 5;

  if (engagement.loginsLast30Days < 0) {
    errors.push('Login count cannot be negative');
  } else {
    validFields++;
  }

  if (engagement.featuresUsedLast30Days < 0) {
    errors.push('Features used cannot be negative');
  } else {
    validFields++;
  }

  if (engagement.averageSessionMinutes < 0) {
    errors.push('Session duration cannot be negative');
  } else {
    validFields++;
  }

  if (engagement.supportTicketsLast90Days < 0) {
    errors.push('Support ticket count cannot be negative');
  } else {
    validFields++;
  }

  if (engagement.totalTimeSpentMinutes < 0) {
    errors.push('Total time spent cannot be negative');
  } else {
    validFields++;
  }

  // Validate contract metrics
  const contract = data.contract;
  totalFields += 5;

  if (contract.contractValue < 0) {
    errors.push('Contract value cannot be negative');
  } else if (contract.contractValue === 0) {
    warnings.push('Zero contract value may indicate data issue');
    validFields += 0.5;
  } else {
    validFields++;
  }

  if (contract.contractDurationMonths <= 0) {
    errors.push('Contract duration must be positive');
  } else {
    validFields++;
  }

  if (contract.renewalHistory < 0) {
    errors.push('Renewal history cannot be negative');
  } else {
    validFields++;
  }

  // Contract upgrade/downgrade flags
  validFields += 2; // Boolean flags are always valid

  // Validate support metrics
  const support = data.support;
  totalFields += 5;

  if (support.averageResolutionHours < 0) {
    errors.push('Resolution time cannot be negative');
  } else {
    validFields++;
  }

  if (support.satisfactionScore < 1 || support.satisfactionScore > 10) {
    errors.push('Satisfaction score must be between 1 and 10');
  } else {
    validFields++;
  }

  if (support.escalatedTickets < 0 || support.escalatedTickets > support.totalTickets) {
    errors.push('Escalated tickets cannot exceed total tickets');
  } else {
    validFields++;
  }

  if (support.criticalTickets < 0 || support.criticalTickets > support.totalTickets) {
    errors.push('Critical tickets cannot exceed total tickets');
  } else {
    validFields++;
  }

  if (support.totalTickets < 0) {
    errors.push('Total tickets cannot be negative');
  } else {
    validFields++;
  }

  const confidence = validFields / totalFields;
  const isValid = errors.length === 0 && confidence >= DEFAULT_CONFIG.minConfidenceThreshold;

  return {
    isValid,
    errors,
    warnings,
    missingFields,
    confidence
  };
}

/**
 * Calculates payment health score (0-100) based on payment metrics
 * Higher score indicates better payment health
 */
export function calculatePaymentScore(metrics: PaymentMetrics): FactorScore {
  let score = 100; // Start with perfect score
  let confidence = 1.0;
  const explanations: string[] = [];

  // Factor 1: Days since last payment (30% of payment score)
  const daysSincePayment = Math.max(0, metrics.daysSinceLastPayment);
  let paymentRecencyScore = 100;

  if (daysSincePayment > 60) {
    paymentRecencyScore = 0;
    explanations.push('No payment in 60+ days (-30 pts)');
  } else if (daysSincePayment > 30) {
    paymentRecencyScore = 40;
    explanations.push('No payment in 30+ days (-18 pts)');
  } else if (daysSincePayment > 15) {
    paymentRecencyScore = 70;
    explanations.push('No payment in 15+ days (-9 pts)');
  } else {
    explanations.push('Recent payment activity (+0 pts)');
  }

  score -= (100 - paymentRecencyScore) * 0.3;

  // Factor 2: Average payment delay (25% of payment score)
  let delayPenalty = 0;
  if (metrics.averagePaymentDelay > 30) {
    delayPenalty = 25;
    explanations.push('High average delay 30+ days (-25 pts)');
  } else if (metrics.averagePaymentDelay > 15) {
    delayPenalty = 15;
    explanations.push('Moderate average delay 15+ days (-15 pts)');
  } else if (metrics.averagePaymentDelay > 7) {
    delayPenalty = 8;
    explanations.push('Minor average delay 7+ days (-8 pts)');
  }

  score -= delayPenalty;

  // Factor 3: Overdue amount (25% of payment score)
  let overduePenalty = 0;
  if (metrics.overdueAmount > 10000) {
    overduePenalty = 25;
    explanations.push('High overdue amount $10k+ (-25 pts)');
  } else if (metrics.overdueAmount > 5000) {
    overduePenalty = 15;
    explanations.push('Moderate overdue amount $5k+ (-15 pts)');
  } else if (metrics.overdueAmount > 1000) {
    overduePenalty = 8;
    explanations.push('Low overdue amount $1k+ (-8 pts)');
  }

  score -= overduePenalty;

  // Factor 4: Payment reliability (20% of payment score)
  if (metrics.totalPayments > 0) {
    const latePaymentRate = metrics.latePayments / metrics.totalPayments;
    let reliabilityPenalty = 0;

    if (latePaymentRate > 0.5) {
      reliabilityPenalty = 20;
      explanations.push('Poor payment reliability >50% late (-20 pts)');
    } else if (latePaymentRate > 0.3) {
      reliabilityPenalty = 12;
      explanations.push('Moderate payment reliability >30% late (-12 pts)');
    } else if (latePaymentRate > 0.1) {
      reliabilityPenalty = 5;
      explanations.push('Minor payment reliability >10% late (-5 pts)');
    } else {
      explanations.push('Good payment reliability <10% late (+0 pts)');
    }

    score -= reliabilityPenalty;
  } else {
    // New customer with no payment history
    score -= 10; // Minor penalty for unknown payment behavior
    confidence = 0.7; // Lower confidence due to lack of history
    explanations.push('No payment history (-10 pts, lower confidence)');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    weight: DEFAULT_CONFIG.weights.payment,
    contribution: score * DEFAULT_CONFIG.weights.payment,
    confidence,
    explanation: `Payment Health: ${explanations.join(', ')}`
  };
}

/**
 * Calculates engagement health score (0-100) based on usage metrics
 * Higher score indicates better product engagement
 */
export function calculateEngagementScore(metrics: EngagementMetrics): FactorScore {
  let score = 0; // Build up from zero for engagement
  const confidence = 1.0;
  const explanations: string[] = [];

  // Factor 1: Login frequency (30% of engagement score)
  let loginScore = 0;
  if (metrics.loginsLast30Days >= 20) {
    loginScore = 30;
    explanations.push('Excellent login frequency 20+ days (+30 pts)');
  } else if (metrics.loginsLast30Days >= 15) {
    loginScore = 25;
    explanations.push('Good login frequency 15+ days (+25 pts)');
  } else if (metrics.loginsLast30Days >= 10) {
    loginScore = 20;
    explanations.push('Moderate login frequency 10+ days (+20 pts)');
  } else if (metrics.loginsLast30Days >= 5) {
    loginScore = 10;
    explanations.push('Low login frequency 5+ days (+10 pts)');
  } else {
    explanations.push('Very low login frequency <5 days (+0 pts)');
  }

  score += loginScore;

  // Factor 2: Feature usage diversity (25% of engagement score)
  let featureScore = 0;
  if (metrics.featuresUsedLast30Days >= 15) {
    featureScore = 25;
    explanations.push('Excellent feature usage 15+ features (+25 pts)');
  } else if (metrics.featuresUsedLast30Days >= 10) {
    featureScore = 20;
    explanations.push('Good feature usage 10+ features (+20 pts)');
  } else if (metrics.featuresUsedLast30Days >= 5) {
    featureScore = 15;
    explanations.push('Moderate feature usage 5+ features (+15 pts)');
  } else if (metrics.featuresUsedLast30Days >= 2) {
    featureScore = 8;
    explanations.push('Limited feature usage 2+ features (+8 pts)');
  } else if (metrics.featuresUsedLast30Days >= 1) {
    featureScore = 3;
    explanations.push('Minimal feature usage 1 feature (+3 pts)');
  } else {
    explanations.push('No feature usage (+0 pts)');
  }

  score += featureScore;

  // Factor 3: Session quality (20% of engagement score)
  let sessionScore = 0;
  if (metrics.averageSessionMinutes >= 60) {
    sessionScore = 20;
    explanations.push('Excellent session duration 60+ mins (+20 pts)');
  } else if (metrics.averageSessionMinutes >= 30) {
    sessionScore = 15;
    explanations.push('Good session duration 30+ mins (+15 pts)');
  } else if (metrics.averageSessionMinutes >= 15) {
    sessionScore = 10;
    explanations.push('Moderate session duration 15+ mins (+10 pts)');
  } else if (metrics.averageSessionMinutes >= 5) {
    sessionScore = 5;
    explanations.push('Short session duration 5+ mins (+5 pts)');
  } else {
    explanations.push('Very short sessions <5 mins (+0 pts)');
  }

  score += sessionScore;

  // Factor 4: Total platform time (15% of engagement score)
  let timeScore = 0;
  const hoursSpent = metrics.totalTimeSpentMinutes / 60;
  if (hoursSpent >= 40) {
    timeScore = 15;
    explanations.push('High platform usage 40+ hours (+15 pts)');
  } else if (hoursSpent >= 20) {
    timeScore = 12;
    explanations.push('Good platform usage 20+ hours (+12 pts)');
  } else if (hoursSpent >= 10) {
    timeScore = 8;
    explanations.push('Moderate platform usage 10+ hours (+8 pts)');
  } else if (hoursSpent >= 5) {
    timeScore = 4;
    explanations.push('Low platform usage 5+ hours (+4 pts)');
  } else {
    explanations.push('Very low platform usage <5 hours (+0 pts)');
  }

  score += timeScore;

  // Factor 5: Support engagement impact (10% of engagement score)
  let supportImpact = 0;
  if (metrics.supportTicketsLast90Days > 10) {
    supportImpact = -5; // Too many tickets indicate engagement problems
    explanations.push('High support ticket volume may indicate issues (-5 pts)');
  } else if (metrics.supportTicketsLast90Days > 5) {
    supportImpact = -2;
    explanations.push('Moderate support ticket volume (-2 pts)');
  } else if (metrics.supportTicketsLast90Days > 0) {
    supportImpact = +2; // Some tickets show engagement
    explanations.push('Healthy support engagement (+2 pts)');
  } else {
    supportImpact = +5; // No tickets needed indicates good UX
    explanations.push('No support tickets needed (+5 pts)');
  }

  score += supportImpact;

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    weight: DEFAULT_CONFIG.weights.engagement,
    contribution: score * DEFAULT_CONFIG.weights.engagement,
    confidence,
    explanation: `Engagement Health: ${explanations.join(', ')}`
  };
}

/**
 * Calculates contract health score (0-100) based on contract metrics
 * Higher score indicates better renewal prospects and growth potential
 */
export function calculateContractScore(metrics: ContractMetrics): FactorScore {
  let score = 70; // Start with neutral score
  let confidence = 1.0;
  const explanations: string[] = [];

  // Factor 1: Renewal proximity (40% of contract score)
  let renewalScore = 0;
  if (metrics.daysUntilRenewal < 0) {
    renewalScore = -30;
    explanations.push('Overdue renewal - critical risk (-30 pts)');
  } else if (metrics.daysUntilRenewal <= 30) {
    renewalScore = -15;
    explanations.push('Renewal within 30 days - monitor closely (-15 pts)');
  } else if (metrics.daysUntilRenewal <= 90) {
    renewalScore = -5;
    explanations.push('Renewal within 90 days - prepare engagement (-5 pts)');
  } else if (metrics.daysUntilRenewal <= 180) {
    renewalScore = +10;
    explanations.push('Renewal 3-6 months away - stable period (+10 pts)');
  } else {
    renewalScore = +15;
    explanations.push('Renewal 6+ months away - secure period (+15 pts)');
  }

  score += renewalScore;

  // Factor 2: Contract value impact (25% of contract score)
  let valueScore = 0;
  if (metrics.contractValue >= 100000) {
    valueScore = +20;
    explanations.push('High-value contract $100k+ (+20 pts)');
  } else if (metrics.contractValue >= 50000) {
    valueScore = +15;
    explanations.push('Medium-high contract $50k+ (+15 pts)');
  } else if (metrics.contractValue >= 25000) {
    valueScore = +10;
    explanations.push('Medium contract $25k+ (+10 pts)');
  } else if (metrics.contractValue >= 10000) {
    valueScore = +5;
    explanations.push('Standard contract $10k+ (+5 pts)');
  } else {
    valueScore = -5;
    explanations.push('Low-value contract <$10k (-5 pts)');
  }

  score += valueScore;

  // Factor 3: Recent upgrade/downgrade activity (20% of contract score)
  if (metrics.hasRecentUpgrade && !metrics.hasRecentDowngrade) {
    score += 15;
    explanations.push('Recent upgrade - positive growth signal (+15 pts)');
  } else if (metrics.hasRecentDowngrade && !metrics.hasRecentUpgrade) {
    score -= 15;
    explanations.push('Recent downgrade - concerning trend (-15 pts)');
  } else if (metrics.hasRecentUpgrade && metrics.hasRecentDowngrade) {
    score += 0; // Mixed signals cancel out
    explanations.push('Mixed upgrade/downgrade activity (+0 pts)');
  } else {
    score += 5; // Stability is good
    explanations.push('Stable contract - no recent changes (+5 pts)');
  }

  // Factor 4: Renewal history (15% of contract score)
  let historyScore = 0;
  if (metrics.renewalHistory >= 3) {
    historyScore = +10;
    explanations.push('Strong renewal history 3+ renewals (+10 pts)');
  } else if (metrics.renewalHistory >= 2) {
    historyScore = +5;
    explanations.push('Good renewal history 2 renewals (+5 pts)');
  } else if (metrics.renewalHistory >= 1) {
    historyScore = +2;
    explanations.push('Some renewal history 1 renewal (+2 pts)');
  } else {
    historyScore = -5; // New customer uncertainty
    confidence = 0.8;
    explanations.push('No renewal history - new customer (-5 pts, lower confidence)');
  }

  score += historyScore;

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    weight: DEFAULT_CONFIG.weights.contract,
    contribution: score * DEFAULT_CONFIG.weights.contract,
    confidence,
    explanation: `Contract Health: ${explanations.join(', ')}`
  };
}

/**
 * Calculates support health score (0-100) based on support metrics
 * Higher score indicates better customer satisfaction and support experience
 */
export function calculateSupportScore(metrics: SupportMetrics): FactorScore {
  let score = 80; // Start with good baseline - most customers have decent support
  let confidence = 1.0;
  const explanations: string[] = [];

  // Factor 1: Customer satisfaction (40% of support score)
  let satisfactionScore = 0;
  if (metrics.satisfactionScore >= 9) {
    satisfactionScore = +20;
    explanations.push('Excellent satisfaction 9+ rating (+20 pts)');
  } else if (metrics.satisfactionScore >= 7) {
    satisfactionScore = +10;
    explanations.push('Good satisfaction 7+ rating (+10 pts)');
  } else if (metrics.satisfactionScore >= 5) {
    satisfactionScore = -5;
    explanations.push('Moderate satisfaction 5+ rating (-5 pts)');
  } else if (metrics.satisfactionScore >= 3) {
    satisfactionScore = -15;
    explanations.push('Poor satisfaction 3+ rating (-15 pts)');
  } else {
    satisfactionScore = -25;
    explanations.push('Very poor satisfaction <3 rating (-25 pts)');
  }

  score += satisfactionScore;

  // Factor 2: Resolution efficiency (25% of support score)
  let resolutionScore = 0;
  if (metrics.averageResolutionHours <= 4) {
    resolutionScore = +15;
    explanations.push('Excellent resolution time ≤4h (+15 pts)');
  } else if (metrics.averageResolutionHours <= 24) {
    resolutionScore = +10;
    explanations.push('Good resolution time ≤24h (+10 pts)');
  } else if (metrics.averageResolutionHours <= 48) {
    resolutionScore = +5;
    explanations.push('Acceptable resolution time ≤48h (+5 pts)');
  } else if (metrics.averageResolutionHours <= 72) {
    resolutionScore = -5;
    explanations.push('Slow resolution time ≤72h (-5 pts)');
  } else {
    resolutionScore = -15;
    explanations.push('Very slow resolution time >72h (-15 pts)');
  }

  score += resolutionScore;

  // Factor 3: Escalation rate (20% of support score)
  if (metrics.totalTickets > 0) {
    const escalationRate = metrics.escalatedTickets / metrics.totalTickets;
    let escalationPenalty = 0;

    if (escalationRate > 0.3) {
      escalationPenalty = -10;
      explanations.push('High escalation rate >30% (-10 pts)');
    } else if (escalationRate > 0.15) {
      escalationPenalty = -5;
      explanations.push('Moderate escalation rate >15% (-5 pts)');
    } else if (escalationRate > 0.05) {
      escalationPenalty = -2;
      explanations.push('Low escalation rate >5% (-2 pts)');
    } else {
      explanations.push('Excellent escalation rate ≤5% (+0 pts)');
    }

    score += escalationPenalty;
  } else {
    confidence = 0.7; // Lower confidence with no support history
    explanations.push('No support ticket history (lower confidence)');
  }

  // Factor 4: Critical issue rate (15% of support score)
  if (metrics.totalTickets > 0) {
    const criticalRate = metrics.criticalTickets / metrics.totalTickets;
    let criticalPenalty = 0;

    if (criticalRate > 0.2) {
      criticalPenalty = -8;
      explanations.push('High critical ticket rate >20% (-8 pts)');
    } else if (criticalRate > 0.1) {
      criticalPenalty = -4;
      explanations.push('Moderate critical ticket rate >10% (-4 pts)');
    } else if (criticalRate > 0.05) {
      criticalPenalty = -2;
      explanations.push('Low critical ticket rate >5% (-2 pts)');
    } else {
      explanations.push('Excellent critical ticket rate ≤5% (+0 pts)');
    }

    score += criticalPenalty;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    weight: DEFAULT_CONFIG.weights.support,
    contribution: score * DEFAULT_CONFIG.weights.support,
    confidence,
    explanation: `Support Health: ${explanations.join(', ')}`
  };
}

/**
 * Determines risk level based on overall health score
 */
export function determineRiskLevel(score: number, config: HealthScoreConfig = DEFAULT_CONFIG): RiskLevel {
  if (score >= config.riskThresholds.healthyMin) {
    return 'healthy';
  } else if (score >= config.riskThresholds.warningMin) {
    return 'warning';
  } else {
    return 'critical';
  }
}

/**
 * Main function to calculate overall customer health score
 * @param data Customer health data
 * @param config Optional configuration overrides
 * @returns Complete health score result
 */
export function calculateHealthScore(
  data: CustomerHealthData,
  config: HealthScoreConfig = DEFAULT_CONFIG
): HealthScoreResult {
  // Validate input data first
  const validation = validateHealthData(data);
  if (!validation.isValid) {
    throw new HealthScoreCalculationError(
      `Invalid customer data: ${validation.errors.join(', ')}`
    );
  }

  try {
    // Calculate individual factor scores
    const paymentScore = calculatePaymentScore(data.paymentHistory);
    const engagementScore = calculateEngagementScore(data.engagement);
    const contractScore = calculateContractScore(data.contract);
    const supportScore = calculateSupportScore(data.support);

    // Calculate weighted overall score
    const overallScore = Math.round(
      paymentScore.contribution +
      engagementScore.contribution +
      contractScore.contribution +
      supportScore.contribution
    );

    // Calculate overall confidence (minimum of all factor confidences)
    const overallConfidence = Math.min(
      paymentScore.confidence,
      engagementScore.confidence,
      contractScore.confidence,
      supportScore.confidence
    );

    // Determine risk level
    const riskLevel = determineRiskLevel(overallScore, config);

    return {
      overallScore,
      riskLevel,
      factorScores: {
        payment: paymentScore,
        engagement: engagementScore,
        contract: contractScore,
        support: supportScore
      },
      overallConfidence,
      calculatedAt: new Date()
    };

  } catch (error) {
    throw new HealthScoreCalculationError(
      'Failed to calculate health score',
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Utility function to get a human-readable explanation of the health score
 */
export function getHealthScoreExplanation(result: HealthScoreResult): string {
  const { overallScore, riskLevel, factorScores } = result;

  const riskDescription = {
    healthy: 'excellent health with low churn risk',
    warning: 'moderate concerns requiring attention',
    critical: 'high churn risk needing immediate intervention'
  }[riskLevel];

  const topFactor = Object.entries(factorScores)
    .sort(([,a], [,b]) => b.contribution - a.contribution)[0];

  const bottomFactor = Object.entries(factorScores)
    .sort(([,a], [,b]) => a.contribution - b.contribution)[0];

  return `Customer health score of ${overallScore}/100 indicates ${riskDescription}. ` +
         `Primary strength: ${topFactor[0]} (${topFactor[1].score}/100). ` +
         `Area for improvement: ${bottomFactor[0]} (${bottomFactor[1].score}/100).`;
}
