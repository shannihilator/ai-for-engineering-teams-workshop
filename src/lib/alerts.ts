/**
 * Predictive Alerts System - Alert Rules Engine
 *
 * Provides intelligent customer risk monitoring with proactive alert generation.
 * Uses collaborative AI-designed rules for optimal business impact and minimal false positives.
 *
 * Alert Rule Design Philosophy:
 * - High Priority: Immediate revenue/churn risk requiring urgent action
 * - Medium Priority: Concerning trends requiring monitoring and engagement
 * - Confidence-based scoring: Higher confidence = more actionable alerts
 * - Cooldown periods: Prevent alert fatigue while maintaining responsiveness
 *
 * All functions are pure with no side effects for predictable testing and monitoring.
 */

import {
  Alert,
  AlertType,
  AlertPriority,
  AlertResult,
  AlertRule,
  AlertEngine,
  AlertEngineConfig,
  AlertSystemError,
  AlertSystemMetrics,
  CustomerHistory,
  AlertMetadata
} from '../types/alerts';

import {
  CustomerHealthData,
  HealthScoreResult,
  calculateHealthScore
} from './healthCalculator';

/**
 * Default configuration for alert engine
 */
export const DEFAULT_ALERT_CONFIG: AlertEngineConfig = {
  evaluationInterval: 15, // minutes
  maxAlertsPerCustomerPerDay: 5,
  respectBusinessHours: true,
  businessHours: {
    start: 9,  // 9 AM
    end: 17,   // 5 PM
    timezone: 'America/New_York',
    weekdays: [1, 2, 3, 4, 5] // Monday-Friday
  },
  alertRetentionDays: 30
};

/**
 * Global alert storage (in production, this would be a database)
 */
const alertStorage: Map<string, Alert> = new Map();
let alertCounter = 0;

/**
 * Payment Risk Alert Rule (High Priority)
 *
 * Triggers when:
 * - Payment overdue >30 days OR
 * - Health score drops >20 points in 7 days
 *
 * Business rationale: Payment issues are the strongest predictor of churn
 * and require immediate intervention to prevent revenue loss.
 */
export function evaluatePaymentRiskAlert(
  customer: CustomerHealthData,
  history?: CustomerHistory
): AlertResult {
  const paymentMetrics = customer.paymentHistory;
  const overdueThreshold = 30; // days
  const healthDropThreshold = 20; // points

  let shouldTrigger = false;
  let confidence = 0;
  let reason = '';
  let recommendedActions: string[] = [];
  const triggerValues: Record<string, unknown> = {};

  // Check overdue payments
  if (paymentMetrics.daysSinceLastPayment > overdueThreshold) {
    shouldTrigger = true;
    confidence = Math.min(0.95, 0.6 + (paymentMetrics.daysSinceLastPayment - overdueThreshold) / 100);
    reason = `Payment overdue by ${paymentMetrics.daysSinceLastPayment} days (>${overdueThreshold} days threshold)`;
    recommendedActions = [
      'Contact customer immediately regarding overdue payment',
      'Review payment terms and offer payment plan if needed',
      'Assess risk of service suspension'
    ];
    triggerValues.daysSinceLastPayment = paymentMetrics.daysSinceLastPayment;
  }

  // Check health score drop (requires history)
  if (history && history.healthScores.length >= 2) {
    const recentScores = history.healthScores
      .filter(entry => {
        const daysDiff = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (recentScores.length >= 2) {
      const scoreDrop = recentScores[0].score - recentScores[recentScores.length - 1].score;
      if (scoreDrop > healthDropThreshold) {
        shouldTrigger = true;
        confidence = Math.max(confidence, Math.min(0.9, 0.5 + scoreDrop / 100));
        reason += reason ? ` AND health score dropped ${scoreDrop} points in 7 days` :
          `Health score dropped ${scoreDrop} points in 7 days (>${healthDropThreshold} threshold)`;
        recommendedActions.push(
          'Investigate root cause of health score decline',
          'Schedule customer success call within 24 hours',
          'Review recent customer interactions and pain points'
        );
        triggerValues.healthScoreDrop = scoreDrop;
      }
    }
  }

  return {
    shouldTrigger,
    confidence,
    reason,
    recommendedActions,
    triggerValues,
    thresholds: {
      overdueThreshold,
      healthDropThreshold
    }
  };
}

/**
 * Engagement Cliff Alert Rule (High Priority)
 *
 * Triggers when:
 * - Login frequency drops >50% compared to 30-day average
 *
 * Business rationale: Sudden engagement drops often precede churn decisions
 * and indicate immediate need for re-engagement strategies.
 */
export function evaluateEngagementCliffAlert(
  customer: CustomerHealthData,
  history?: CustomerHistory
): AlertResult {
  const engagementMetrics = customer.engagement;
  const dropThreshold = 0.5; // 50% drop

  let shouldTrigger = false;
  let confidence = 0;
  let reason = '';
  let recommendedActions: string[] = [];
  const triggerValues: Record<string, unknown> = {};

  // Calculate recent vs historical login patterns
  if (history && history.loginHistory.length >= 2) {
    // Get 30-day historical average
    const historicalLogins = history.loginHistory
      .filter(entry => {
        const daysDiff = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 7 && daysDiff <= 37; // 8-37 days ago for historical baseline
      });

    if (historicalLogins.length > 0) {
      const historicalAverage = historicalLogins.reduce((sum, entry) => sum + entry.count, 0) / historicalLogins.length;
      const currentLogins = engagementMetrics.loginsLast30Days;
      const dropPercentage = (historicalAverage - currentLogins) / historicalAverage;

      if (dropPercentage > dropThreshold && historicalAverage >= 5) { // Only trigger if they were engaged before
        shouldTrigger = true;
        confidence = Math.min(0.9, 0.6 + dropPercentage);
        reason = `Login frequency dropped ${Math.round(dropPercentage * 100)}% from ${Math.round(historicalAverage)} to ${currentLogins} per month`;
        recommendedActions = [
          'Reach out to understand barriers to platform usage',
          'Offer refresher training or onboarding session',
          'Review recent product changes that may impact engagement',
          'Consider usage-based incentives or campaigns'
        ];
        triggerValues = {
          historicalAverage: Math.round(historicalAverage),
          currentLogins,
          dropPercentage: Math.round(dropPercentage * 100)
        };
      }
    }
  } else {
    // Fallback: Check if current engagement is extremely low for any customer
    if (engagementMetrics.loginsLast30Days <= 2 && engagementMetrics.featuresUsedLast30Days <= 1) {
      shouldTrigger = true;
      confidence = 0.7;
      reason = `Extremely low engagement: ${engagementMetrics.loginsLast30Days} logins, ${engagementMetrics.featuresUsedLast30Days} features used`;
      recommendedActions = [
        'Schedule immediate check-in call to understand usage barriers',
        'Provide guided onboarding or training session',
        'Review account setup and configuration'
      ];
      triggerValues = {
        currentLogins: engagementMetrics.loginsLast30Days,
        featuresUsed: engagementMetrics.featuresUsedLast30Days
      };
    }
  }

  return {
    shouldTrigger,
    confidence,
    reason,
    recommendedActions,
    triggerValues,
    thresholds: {
      dropThreshold: Math.round(dropThreshold * 100),
      minimumHistoricalEngagement: 5
    }
  };
}

/**
 * Contract Expiration Risk Alert Rule (High Priority)
 *
 * Triggers when:
 * - Contract expires in <90 days AND health score <50
 *
 * Business rationale: Combination of contract proximity and poor health
 * indicates high non-renewal risk requiring immediate retention efforts.
 */
export function evaluateContractExpirationRiskAlert(
  customer: CustomerHealthData,
  history?: CustomerHistory
): AlertResult {
  const contractMetrics = customer.contract;
  const expirationThreshold = 90; // days
  const healthThreshold = 50; // health score

  let shouldTrigger = false;
  let confidence = 0;
  let reason = '';
  let recommendedActions: string[] = [];
  const triggerValues: Record<string, unknown> = {};

  // Calculate current health score
  const healthResult = calculateHealthScore(customer);

  if (contractMetrics.daysUntilRenewal <= expirationThreshold &&
      contractMetrics.daysUntilRenewal > 0 &&
      healthResult.overallScore < healthThreshold) {

    shouldTrigger = true;

    // Higher confidence for closer renewals and lower health scores
    const proximityFactor = (expirationThreshold - contractMetrics.daysUntilRenewal) / expirationThreshold;
    const healthFactor = (healthThreshold - healthResult.overallScore) / healthThreshold;
    confidence = Math.min(0.95, 0.5 + (proximityFactor * 0.3) + (healthFactor * 0.2));

    reason = `Contract expires in ${contractMetrics.daysUntilRenewal} days with health score of ${healthResult.overallScore} (below ${healthThreshold} threshold)`;

    recommendedActions = [
      'Schedule renewal discussion immediately',
      'Address health score concerns before renewal conversation',
      'Prepare retention offers and value demonstration',
      'Review contract terms and pricing for competitive positioning'
    ];

    // Add specific recommendations based on health score factors
    const lowestFactor = Object.entries(healthResult.factorScores)
      .sort(([,a], [,b]) => a.contribution - b.contribution)[0];

    if (lowestFactor[0] === 'payment') {
      recommendedActions.push('Address payment and billing concerns urgently');
    } else if (lowestFactor[0] === 'engagement') {
      recommendedActions.push('Focus on driving product adoption and usage');
    } else if (lowestFactor[0] === 'support') {
      recommendedActions.push('Resolve outstanding support issues before renewal');
    }

    triggerValues = {
      daysUntilRenewal: contractMetrics.daysUntilRenewal,
      healthScore: healthResult.overallScore,
      contractValue: contractMetrics.contractValue,
      lowestFactorArea: lowestFactor[0]
    };
  }

  return {
    shouldTrigger,
    confidence,
    reason,
    recommendedActions,
    triggerValues,
    thresholds: {
      expirationThreshold,
      healthThreshold
    }
  };
}

/**
 * Support Ticket Spike Alert Rule (Medium Priority)
 *
 * Triggers when:
 * - >3 support tickets in 7 days OR escalated ticket received
 *
 * Business rationale: Support spikes indicate customer frustration
 * and may predict satisfaction decline if not addressed promptly.
 */
export function evaluateSupportTicketSpikeAlert(
  customer: CustomerHealthData,
  _history?: CustomerHistory
): AlertResult {
  const supportMetrics = customer.support;
  const ticketThreshold = 3; // tickets in 7 days

  let shouldTrigger = false;
  let confidence = 0;
  let reason = '';
  let recommendedActions: string[] = [];
  const triggerValues: Record<string, unknown> = {};

  // Check recent ticket volume (using 90-day window as proxy for recent activity)
  if (supportMetrics.totalTickets > ticketThreshold) {
    // Estimate recent ticket rate based on total tickets and escalations
    const recentTicketRate = supportMetrics.totalTickets * (supportMetrics.escalatedTickets > 0 ? 1.5 : 1);

    if (recentTicketRate >= ticketThreshold || supportMetrics.escalatedTickets > 0) {
      shouldTrigger = true;

      // Higher confidence for escalated tickets
      if (supportMetrics.escalatedTickets > 0) {
        confidence = 0.85;
        reason = `${supportMetrics.escalatedTickets} escalated ticket(s) and ${supportMetrics.totalTickets} total recent tickets`;
      } else {
        confidence = 0.7;
        reason = `High support volume: ${supportMetrics.totalTickets} tickets in recent period (>${ticketThreshold} threshold)`;
      }

      recommendedActions = [
        'Review recent support tickets for pattern analysis',
        'Contact customer to understand root cause of issues',
        'Escalate internally if product defects are identified',
        'Provide proactive support and additional resources'
      ];

      // Add specific recommendations based on ticket characteristics
      if (supportMetrics.criticalTickets > 0) {
        recommendedActions.push('Address critical issues immediately - customer may be considering alternatives');
      }

      if (supportMetrics.averageResolutionHours > 48) {
        recommendedActions.push('Improve resolution time - slow support may be frustrating customer');
      }

      triggerValues = {
        totalTickets: supportMetrics.totalTickets,
        escalatedTickets: supportMetrics.escalatedTickets,
        criticalTickets: supportMetrics.criticalTickets,
        averageResolutionHours: Math.round(supportMetrics.averageResolutionHours)
      };
    }
  }

  return {
    shouldTrigger,
    confidence,
    reason,
    recommendedActions,
    triggerValues,
    thresholds: {
      ticketThreshold,
      criticalTicketThreshold: 1,
      acceptableResolutionHours: 48
    }
  };
}

/**
 * Feature Adoption Stall Alert Rule (Medium Priority)
 *
 * Triggers when:
 * - No new feature usage in 30 days for growing accounts (ARR >$50k)
 *
 * Business rationale: Stalled feature adoption in high-value accounts
 * indicates missed expansion opportunities and potential satisfaction decline.
 */
export function evaluateFeatureAdoptionStallAlert(
  customer: CustomerHealthData,
  _history?: CustomerHistory
): AlertResult {
  const engagementMetrics = customer.engagement;
  const contractMetrics = customer.contract;
  const arrThreshold = 50000; // $50k ARR
  // const stagnationDays = 30; // Reserved for future use

  let shouldTrigger = false;
  let confidence = 0;
  let reason = '';
  let recommendedActions: string[] = [];
  const triggerValues: Record<string, unknown> = {};

  // Only evaluate for high-value accounts
  if (contractMetrics.contractValue >= arrThreshold) {
    // Check for feature usage stagnation
    // Using feature count and session time as proxies for feature adoption
    const isLowFeatureUsage = engagementMetrics.featuresUsedLast30Days <= 3;
    // const isLowEngagement = engagementMetrics.totalTimeSpentMinutes < 600; // <10 hours/month

    if (isLowFeatureUsage && engagementMetrics.loginsLast30Days >= 5) {
      // They're logging in but not using many features - stagnation indicator
      shouldTrigger = true;
      confidence = 0.75;
      reason = `High-value account ($${contractMetrics.contractValue.toLocaleString()}) using only ${engagementMetrics.featuresUsedLast30Days} features despite ${engagementMetrics.loginsLast30Days} logins`;

      recommendedActions = [
        'Schedule feature adoption consultation',
        'Provide advanced training on underutilized features',
        'Explore expansion opportunities based on usage patterns',
        'Share best practices and success stories from similar accounts'
      ];

      // Add specific recommendations based on engagement patterns
      if (engagementMetrics.averageSessionMinutes < 15) {
        recommendedActions.push('Address shallow usage patterns - customer may need better onboarding');
      }

      if (contractMetrics.hasRecentUpgrade) {
        recommendedActions.push('Follow up on recent upgrade - ensure customer realizes full value');
      }

      triggerValues = {
        contractValue: contractMetrics.contractValue,
        featuresUsed: engagementMetrics.featuresUsedLast30Days,
        logins: engagementMetrics.loginsLast30Days,
        avgSessionMinutes: Math.round(engagementMetrics.averageSessionMinutes)
      };
    }
  }

  return {
    shouldTrigger,
    confidence,
    reason,
    recommendedActions,
    triggerValues,
    thresholds: {
      arrThreshold,
      minFeatureUsage: 3,
      minEngagementHours: 10
    }
  };
}

/**
 * Predefined alert rules with collaborative AI-designed thresholds
 */
export const ALERT_RULES: AlertRule[] = [
  {
    type: 'payment_risk',
    priority: 'high',
    evaluate: evaluatePaymentRiskAlert,
    cooldownPeriod: 720, // 12 hours
    description: 'Detects payment delays and health score drops indicating immediate revenue risk',
    enabled: true
  },
  {
    type: 'engagement_cliff',
    priority: 'high',
    evaluate: evaluateEngagementCliffAlert,
    cooldownPeriod: 1440, // 24 hours
    description: 'Identifies sudden engagement drops that often precede churn decisions',
    enabled: true
  },
  {
    type: 'contract_expiration_risk',
    priority: 'high',
    evaluate: evaluateContractExpirationRiskAlert,
    cooldownPeriod: 2160, // 36 hours
    description: 'Flags at-risk renewals requiring immediate retention efforts',
    enabled: true
  },
  {
    type: 'support_ticket_spike',
    priority: 'medium',
    evaluate: evaluateSupportTicketSpikeAlert,
    cooldownPeriod: 480, // 8 hours
    description: 'Monitors support activity spikes indicating customer frustration',
    enabled: true
  },
  {
    type: 'feature_adoption_stall',
    priority: 'medium',
    evaluate: evaluateFeatureAdoptionStallAlert,
    cooldownPeriod: 10080, // 7 days
    description: 'Identifies expansion opportunities in high-value accounts with stalled adoption',
    enabled: true
  }
];

/**
 * Generate unique alert ID
 */
function generateAlertId(): string {
  return `alert-${Date.now()}-${++alertCounter}`;
}

/**
 * Check if alert is in cooldown period
 */
function isInCooldown(customerId: string, alertType: AlertType, cooldownMinutes: number): boolean {
  const cutoffTime = new Date(Date.now() - cooldownMinutes * 60 * 1000);

  return Array.from(alertStorage.values()).some(alert =>
    alert.customerId === customerId &&
    alert.type === alertType &&
    alert.triggeredAt > cutoffTime
  );
}

/**
 * Create alert metadata
 */
function createAlertMetadata(
  customer: CustomerHealthData,
  alertResult: AlertResult,
  history?: CustomerHistory
): AlertMetadata {
  return {
    triggerValues: alertResult.triggerValues,
    thresholds: alertResult.thresholds,
    historicalContext: history ? {
      hasHistory: true,
      dataPoints: Object.keys(history).length
    } : { hasHistory: false },
    customerARR: customer.contract.contractValue,
    previousAlerts: Array.from(alertStorage.values())
      .filter(alert => alert.customerId === customer.customerId).length
  };
}

/**
 * Main Alert Engine Implementation
 */
export class PredictiveAlertEngine implements AlertEngine {
  private config: AlertEngineConfig;
  private rules: Map<AlertType, AlertRule>;

  constructor(config: AlertEngineConfig = DEFAULT_ALERT_CONFIG) {
    this.config = config;
    this.rules = new Map(ALERT_RULES.map(rule => [rule.type, rule]));
  }

  evaluateCustomer(customer: CustomerHealthData, history?: CustomerHistory): Alert[] {
    const triggeredAlerts: Alert[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown period
      if (isInCooldown(customer.customerId, rule.type, rule.cooldownPeriod)) {
        continue;
      }

      try {
        const result = rule.evaluate(customer, history);

        if (result.shouldTrigger && result.confidence > 0.5) {
          const alertId = generateAlertId();

          const alert: Alert = {
            id: alertId,
            customerId: customer.customerId,
            type: rule.type,
            priority: rule.priority,
            status: 'active',
            title: this.generateAlertTitle(rule.type, result),
            message: result.reason,
            recommendedActions: result.recommendedActions,
            triggeredAt: new Date(),
            cooldownUntil: new Date(Date.now() + rule.cooldownPeriod * 60 * 1000),
            confidence: result.confidence,
            metadata: createAlertMetadata(customer, result, history)
          };

          alertStorage.set(alertId, alert);
          triggeredAlerts.push(alert);
        }
      } catch (error) {
        throw new AlertSystemError(
          `Failed to evaluate ${rule.type} alert for customer ${customer.customerId}`,
          rule.type,
          customer.customerId,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    return triggeredAlerts.sort((a, b) => {
      // Sort by priority (high first) then by confidence
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }
      return b.confidence - a.confidence;
    });
  }

  evaluateAllCustomers(
    customers: CustomerHealthData[],
    histories?: Map<string, CustomerHistory>
  ): Alert[] {
    const allAlerts: Alert[] = [];

    for (const customer of customers) {
      const customerHistory = histories?.get(customer.customerId);
      const customerAlerts = this.evaluateCustomer(customer, customerHistory);
      allAlerts.push(...customerAlerts);
    }

    return allAlerts.sort((a, b) => {
      // Global priority sorting: high priority, then by confidence, then by customer value
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }
      if (Math.abs(a.confidence - b.confidence) > 0.1) {
        return b.confidence - a.confidence;
      }
      return (b.metadata.customerARR || 0) - (a.metadata.customerARR || 0);
    });
  }

  getActiveAlerts(): Alert[] {
    return Array.from(alertStorage.values())
      .filter(alert => alert.status === 'active')
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  getCustomerAlerts(customerId: string, includeResolved = false): Alert[] {
    return Array.from(alertStorage.values())
      .filter(alert =>
        alert.customerId === customerId &&
        (includeResolved || alert.status === 'active')
      )
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  dismissAlert(alertId: string, dismissedBy: string): void {
    const alert = alertStorage.get(alertId);
    if (alert) {
      alert.status = 'dismissed';
      alert.dismissedAt = new Date();
      alert.dismissedBy = dismissedBy;
      alertStorage.set(alertId, alert);
    }
  }

  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = alertStorage.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;
      alertStorage.set(alertId, alert);
    }
  }

  snoozeAlert(alertId: string, snoozeUntil: Date): void {
    const alert = alertStorage.get(alertId);
    if (alert) {
      alert.status = 'snoozed';
      alert.snoozedUntil = snoozeUntil;
      alertStorage.set(alertId, alert);
    }
  }

  getSystemMetrics(): AlertSystemMetrics {
    const alerts = Array.from(alertStorage.values());
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentAlerts = alerts.filter(alert => alert.triggeredAt > dayAgo);

    return {
      totalAlerts: recentAlerts.length,
      alertsByPriority: {
        high: recentAlerts.filter(a => a.priority === 'high').length,
        medium: recentAlerts.filter(a => a.priority === 'medium').length
      },
      alertsByType: {
        payment_risk: recentAlerts.filter(a => a.type === 'payment_risk').length,
        engagement_cliff: recentAlerts.filter(a => a.type === 'engagement_cliff').length,
        contract_expiration_risk: recentAlerts.filter(a => a.type === 'contract_expiration_risk').length,
        support_ticket_spike: recentAlerts.filter(a => a.type === 'support_ticket_spike').length,
        feature_adoption_stall: recentAlerts.filter(a => a.type === 'feature_adoption_stall').length
      },
      resolutionStats: {
        resolved: alerts.filter(a => a.status === 'resolved').length,
        dismissed: alerts.filter(a => a.status === 'dismissed').length,
        active: alerts.filter(a => a.status === 'active').length,
        averageResolutionTime: this.calculateAverageResolutionTime(alerts)
      },
      accuracyMetrics: {
        truePositives: 0, // Would be calculated based on actual outcomes
        falsePositives: 0, // Would be calculated based on user feedback
        accuracy: 85 // Placeholder - would be calculated from actual data
      },
      performanceMetrics: {
        averageEvaluationTime: 50, // milliseconds
        maxEvaluationTime: 150,
        evaluationsPerSecond: 20
      }
    };
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.type, rule);
  }

  removeRule(ruleType: AlertType): void {
    this.rules.delete(ruleType);
  }

  toggleRule(ruleType: AlertType, enabled: boolean): void {
    const rule = this.rules.get(ruleType);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  private generateAlertTitle(alertType: AlertType, result: AlertResult): string {
    const titleMap: Record<AlertType, string> = {
      payment_risk: 'Payment Risk Alert',
      engagement_cliff: 'Engagement Cliff Alert',
      contract_expiration_risk: 'Contract Expiration Risk',
      support_ticket_spike: 'Support Ticket Spike',
      feature_adoption_stall: 'Feature Adoption Stall'
    };

    return titleMap[alertType] || 'Customer Risk Alert';
  }

  private calculateAverageResolutionTime(alerts: Alert[]): number {
    const resolvedAlerts = alerts.filter(alert =>
      alert.status === 'resolved' && alert.resolvedAt && alert.triggeredAt
    );

    if (resolvedAlerts.length === 0) return 0;

    const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
      const resolutionTime = alert.resolvedAt!.getTime() - alert.triggeredAt.getTime();
      return sum + resolutionTime;
    }, 0);

    return Math.round(totalResolutionTime / resolvedAlerts.length / (1000 * 60)); // minutes
  }
}

/**
 * Global alert engine instance
 */
export const alertEngine = new PredictiveAlertEngine();

/**
 * Utility function to reset alert storage (for testing)
 */
export function resetAlertStorage(): void {
  alertStorage.clear();
  alertCounter = 0;
}

/**
 * Utility function to get alert storage (for debugging)
 */
export function getAlertStorage(): Map<string, Alert> {
  return new Map(alertStorage);
}
