/**
 * Type definitions for Predictive Alerts System
 * Provides comprehensive type safety for intelligent customer risk monitoring
 */

export type AlertType =
  | 'payment_risk'
  | 'engagement_cliff'
  | 'contract_expiration_risk'
  | 'support_ticket_spike'
  | 'feature_adoption_stall';

export type AlertPriority = 'high' | 'medium';

export type AlertStatus = 'active' | 'dismissed' | 'resolved' | 'snoozed';

/**
 * Core Alert interface representing a triggered customer risk alert
 */
export interface Alert {
  /** Unique identifier for the alert */
  id: string;
  /** Customer ID this alert relates to */
  customerId: string;
  /** Type of alert that was triggered */
  type: AlertType;
  /** Priority level for action urgency */
  priority: AlertPriority;
  /** Current status of the alert */
  status: AlertStatus;
  /** Human-readable alert title */
  title: string;
  /** Detailed alert message with context */
  message: string;
  /** Recommended actions for addressing the alert */
  recommendedActions: string[];
  /** When the alert was first triggered */
  triggeredAt: Date;
  /** When the alert can be re-triggered (prevents spam) */
  cooldownUntil?: Date;
  /** When the alert was dismissed by a user */
  dismissedAt?: Date;
  /** Who dismissed the alert */
  dismissedBy?: string;
  /** When the alert was resolved */
  resolvedAt?: Date;
  /** Who resolved the alert */
  resolvedBy?: string;
  /** When the alert was snoozed until */
  snoozedUntil?: Date;
  /** Confidence score in alert accuracy (0-1) */
  confidence: number;
  /** Metadata for alert context and debugging */
  metadata: AlertMetadata;
}

/**
 * Additional context and debugging information for alerts
 */
export interface AlertMetadata {
  /** Values that triggered the alert */
  triggerValues: Record<string, unknown>;
  /** Thresholds that were exceeded */
  thresholds: Record<string, unknown>;
  /** Historical context used in evaluation */
  historicalContext?: Record<string, unknown>;
  /** Customer ARR for priority scoring */
  customerARR?: number;
  /** Previous alert history for this customer/type */
  previousAlerts?: number;
}

/**
 * Result of evaluating an alert rule against customer data
 */
export interface AlertResult {
  /** Whether the alert should be triggered */
  shouldTrigger: boolean;
  /** Confidence in the alert accuracy (0-1) */
  confidence: number;
  /** Human-readable explanation of why alert triggered */
  reason: string;
  /** Recommended actions if alert is triggered */
  recommendedActions: string[];
  /** Values that caused the trigger */
  triggerValues: Record<string, unknown>;
  /** Thresholds that were used */
  thresholds: Record<string, unknown>;
}

/**
 * Configuration for individual alert rules
 */
export interface AlertRule {
  /** Type of alert this rule generates */
  type: AlertType;
  /** Priority level for alerts from this rule */
  priority: AlertPriority;
  /** Function to evaluate if alert should trigger */
  evaluate: (customer: CustomerHealthData, history?: CustomerHistory) => AlertResult;
  /** Minutes before this alert type can re-trigger for same customer */
  cooldownPeriod: number;
  /** Human-readable description of what this rule detects */
  description: string;
  /** Whether this rule is currently active */
  enabled: boolean;
}

/**
 * Historical customer data for trend analysis
 */
export interface CustomerHistory {
  /** Customer ID */
  customerId: string;
  /** Historical health scores with timestamps */
  healthScores: Array<{ score: number; timestamp: Date }>;
  /** Historical login patterns */
  loginHistory: Array<{ count: number; period: string; timestamp: Date }>;
  /** Payment history events */
  paymentEvents: Array<{ type: 'payment' | 'overdue' | 'dispute'; amount: number; timestamp: Date }>;
  /** Support ticket history */
  supportTickets: Array<{ type: 'created' | 'escalated' | 'resolved'; priority: string; timestamp: Date }>;
  /** Feature usage events */
  featureUsage: Array<{ feature: string; timestamp: Date }>;
  /** Contract events */
  contractEvents: Array<{ type: 'renewal' | 'upgrade' | 'downgrade' | 'expiration'; timestamp: Date }>;
}

/**
 * Configuration for alert engine behavior
 */
export interface AlertEngineConfig {
  /** How often to evaluate alerts (minutes) */
  evaluationInterval: number;
  /** Maximum alerts per customer per day */
  maxAlertsPerCustomerPerDay: number;
  /** Whether to respect business hours for non-critical alerts */
  respectBusinessHours: boolean;
  /** Business hours configuration */
  businessHours: {
    start: number; // 24-hour format (e.g., 9 for 9 AM)
    end: number;   // 24-hour format (e.g., 17 for 5 PM)
    timezone: string; // IANA timezone identifier
    weekdays: number[]; // 0=Sunday, 1=Monday, etc.
  };
  /** Alert retention period in days */
  alertRetentionDays: number;
}

/**
 * Statistics and metrics for alert system monitoring
 */
export interface AlertSystemMetrics {
  /** Total alerts generated in time period */
  totalAlerts: number;
  /** Alerts by priority level */
  alertsByPriority: Record<AlertPriority, number>;
  /** Alerts by type */
  alertsByType: Record<AlertType, number>;
  /** Alert resolution statistics */
  resolutionStats: {
    resolved: number;
    dismissed: number;
    active: number;
    averageResolutionTime: number; // minutes
  };
  /** Alert accuracy metrics */
  accuracyMetrics: {
    truePositives: number;
    falsePositives: number;
    accuracy: number; // percentage
  };
  /** System performance metrics */
  performanceMetrics: {
    averageEvaluationTime: number; // milliseconds
    maxEvaluationTime: number; // milliseconds
    evaluationsPerSecond: number;
  };
}

/**
 * Main Alert Engine interface for rule evaluation and management
 */
export interface AlertEngine {
  /** Evaluate all alert rules for a single customer */
  evaluateCustomer: (customer: CustomerHealthData, history?: CustomerHistory) => Alert[];
  /** Evaluate all alert rules for multiple customers */
  evaluateAllCustomers: (customers: CustomerHealthData[], histories?: Map<string, CustomerHistory>) => Alert[];
  /** Get all currently active alerts */
  getActiveAlerts: () => Alert[];
  /** Get alerts for a specific customer */
  getCustomerAlerts: (customerId: string, includeResolved?: boolean) => Alert[];
  /** Dismiss an alert */
  dismissAlert: (alertId: string, dismissedBy: string) => void;
  /** Resolve an alert */
  resolveAlert: (alertId: string, resolvedBy: string) => void;
  /** Snooze an alert until specified time */
  snoozeAlert: (alertId: string, snoozeUntil: Date) => void;
  /** Get system metrics and statistics */
  getSystemMetrics: () => AlertSystemMetrics;
  /** Add a new alert rule */
  addRule: (rule: AlertRule) => void;
  /** Remove an alert rule */
  removeRule: (ruleType: AlertType) => void;
  /** Enable or disable a rule */
  toggleRule: (ruleType: AlertType, enabled: boolean) => void;
}

/**
 * Error class for alert system failures
 */
export class AlertSystemError extends Error {
  constructor(
    message: string,
    public alertType?: AlertType,
    public customerId?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AlertSystemError';
  }
}

/**
 * Validation result for alert engine configuration
 */
export interface AlertValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  configIssues: string[];
}

// Re-export health score types for convenience
export type { CustomerHealthData, HealthScoreResult } from './healthScore';
