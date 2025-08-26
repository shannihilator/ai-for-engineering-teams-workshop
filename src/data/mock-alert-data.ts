/**
 * Mock alert data and scenarios for Predictive Alerts System testing
 * Provides realistic customer scenarios that trigger different alert types
 */

import { CustomerHealthData, PaymentMetrics, EngagementMetrics, ContractMetrics, SupportMetrics } from '../types/healthScore';
import { CustomerHistory } from '../types/alerts';
import { mockCustomers } from './mock-customers';

/**
 * Generate mock customer history for trend analysis
 * @param customerId Customer ID
 * @param scenario Scenario type affecting the generated history
 * @returns CustomerHistory with realistic historical data
 */
export function generateMockCustomerHistory(
  customerId: string,
  scenario: 'declining' | 'stable' | 'improving' = 'stable'
): CustomerHistory {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Generate health score trend based on scenario
  const generateHealthScores = () => {
    const scores = [];
    for (let i = 90; i >= 0; i -= 7) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      let baseScore = 75;

      if (scenario === 'declining') {
        baseScore = Math.max(30, 85 - (90 - i) * 0.8); // Gradual decline
      } else if (scenario === 'improving') {
        baseScore = Math.min(95, 45 + (90 - i) * 0.6); // Gradual improvement
      } else {
        baseScore = 75 + (Math.random() - 0.5) * 10; // Stable with small variations
      }

      scores.push({
        score: Math.round(baseScore),
        timestamp: date
      });
    }
    return scores;
  };

  // Generate login history based on scenario
  const generateLoginHistory = () => {
    const history = [];
    for (let i = 12; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      let loginCount = 20;

      if (scenario === 'declining') {
        loginCount = Math.max(2, 25 - i * 2); // Declining engagement
      } else if (scenario === 'improving') {
        loginCount = Math.min(30, 10 + i * 1.5); // Improving engagement
      } else {
        loginCount = 20 + (Math.random() - 0.5) * 8; // Stable with variation
      }

      history.push({
        count: Math.round(loginCount),
        period: 'weekly',
        timestamp: date
      });
    }
    return history;
  };

  return {
    customerId,
    healthScores: generateHealthScores(),
    loginHistory: generateLoginHistory(),
    paymentEvents: [
      { type: 'payment', amount: 5000, timestamp: thirtyDaysAgo },
      { type: 'payment', amount: 5000, timestamp: sixtyDaysAgo },
      ...(scenario === 'declining' ? [
        { type: 'overdue', amount: 5000, timestamp: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) }
      ] : [])
    ],
    supportTickets: [
      { type: 'created', priority: 'medium', timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'resolved', priority: 'medium', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      ...(scenario === 'declining' ? [
        { type: 'escalated', priority: 'high', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
        { type: 'created', priority: 'critical', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) }
      ] : [])
    ],
    featureUsage: [
      { feature: 'dashboard', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
      { feature: 'reports', timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { feature: 'analytics', timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      ...(scenario === 'improving' ? [
        { feature: 'advanced_analytics', timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
        { feature: 'integrations', timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) }
      ] : [])
    ],
    contractEvents: [
      { type: 'renewal', timestamp: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) },
      ...(scenario === 'declining' ? [
        { type: 'downgrade', timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
      ] : scenario === 'improving' ? [
        { type: 'upgrade', timestamp: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000) }
      ] : [])
    ]
  };
}

/**
 * Test scenario configurations for different alert types
 */
export interface AlertTestScenario {
  name: string;
  description: string;
  customerHealthData: CustomerHealthData;
  customerHistory?: CustomerHistory;
  expectedAlertTypes: string[];
  expectedPriority: 'high' | 'medium';
}

/**
 * Payment Risk Alert Test Scenarios
 */
export const paymentRiskScenarios: AlertTestScenario[] = [
  {
    name: 'Overdue Payment - 45 Days',
    description: 'Customer with payment overdue by 45 days',
    customerHealthData: {
      customerId: 'payment-risk-1',
      paymentHistory: {
        daysSinceLastPayment: 45,
        averagePaymentDelay: 35,
        overdueAmount: 8500,
        totalPayments: 12,
        latePayments: 4
      },
      engagement: {
        loginsLast30Days: 15,
        featuresUsedLast30Days: 8,
        averageSessionMinutes: 25,
        supportTicketsLast90Days: 3,
        totalTimeSpentMinutes: 750
      },
      contract: {
        daysUntilRenewal: 120,
        contractValue: 35000,
        hasRecentUpgrade: false,
        hasRecentDowngrade: false,
        contractDurationMonths: 12,
        renewalHistory: 2
      },
      support: {
        averageResolutionHours: 24,
        satisfactionScore: 6.5,
        escalatedTickets: 1,
        totalTickets: 3,
        criticalTickets: 0
      },
      lastUpdated: new Date()
    },
    expectedAlertTypes: ['payment_risk'],
    expectedPriority: 'high'
  },
  {
    name: 'Health Score Drop - 25 Points',
    description: 'Customer health score dropped 25 points in 7 days',
    customerHealthData: {
      customerId: 'payment-risk-2',
      paymentHistory: {
        daysSinceLastPayment: 10,
        averagePaymentDelay: 5,
        overdueAmount: 0,
        totalPayments: 18,
        latePayments: 2
      },
      engagement: {
        loginsLast30Days: 8, // Significant drop
        featuresUsedLast30Days: 3,
        averageSessionMinutes: 12,
        supportTicketsLast90Days: 8,
        totalTimeSpentMinutes: 240
      },
      contract: {
        daysUntilRenewal: 200,
        contractValue: 45000,
        hasRecentUpgrade: false,
        hasRecentDowngrade: true, // Recent downgrade
        contractDurationMonths: 12,
        renewalHistory: 3
      },
      support: {
        averageResolutionHours: 72, // Slow resolution
        satisfactionScore: 4.2, // Low satisfaction
        escalatedTickets: 3,
        totalTickets: 8,
        criticalTickets: 2
      },
      lastUpdated: new Date()
    },
    customerHistory: generateMockCustomerHistory('payment-risk-2', 'declining'),
    expectedAlertTypes: ['payment_risk'],
    expectedPriority: 'high'
  }
];

/**
 * Engagement Cliff Alert Test Scenarios
 */
export const engagementCliffScenarios: AlertTestScenario[] = [
  {
    name: 'Engagement Drop - 60% Decline',
    description: 'Customer login frequency dropped 60% from historical average',
    customerHealthData: {
      customerId: 'engagement-cliff-1',
      paymentHistory: {
        daysSinceLastPayment: 15,
        averagePaymentDelay: 3,
        overdueAmount: 0,
        totalPayments: 24,
        latePayments: 1
      },
      engagement: {
        loginsLast30Days: 8, // Down from historical 20+
        featuresUsedLast30Days: 4,
        averageSessionMinutes: 18,
        supportTicketsLast90Days: 2,
        totalTimeSpentMinutes: 360
      },
      contract: {
        daysUntilRenewal: 150,
        contractValue: 55000,
        hasRecentUpgrade: false,
        hasRecentDowngrade: false,
        contractDurationMonths: 12,
        renewalHistory: 4
      },
      support: {
        averageResolutionHours: 16,
        satisfactionScore: 7.2,
        escalatedTickets: 0,
        totalTickets: 2,
        criticalTickets: 0
      },
      lastUpdated: new Date()
    },
    customerHistory: generateMockCustomerHistory('engagement-cliff-1', 'declining'),
    expectedAlertTypes: ['engagement_cliff'],
    expectedPriority: 'high'
  },
  {
    name: 'Minimal Engagement - New User Pattern',
    description: 'Extremely low engagement without historical context',
    customerHealthData: {
      customerId: 'engagement-cliff-2',
      paymentHistory: {
        daysSinceLastPayment: 5,
        averagePaymentDelay: 1,
        overdueAmount: 0,
        totalPayments: 2,
        latePayments: 0
      },
      engagement: {
        loginsLast30Days: 2, // Very low
        featuresUsedLast30Days: 1, // Very low
        averageSessionMinutes: 8,
        supportTicketsLast90Days: 0,
        totalTimeSpentMinutes: 60
      },
      contract: {
        daysUntilRenewal: 300,
        contractValue: 25000,
        hasRecentUpgrade: false,
        hasRecentDowngrade: false,
        contractDurationMonths: 12,
        renewalHistory: 0
      },
      support: {
        averageResolutionHours: 12,
        satisfactionScore: 8.0,
        escalatedTickets: 0,
        totalTickets: 0,
        criticalTickets: 0
      },
      lastUpdated: new Date()
    },
    expectedAlertTypes: ['engagement_cliff'],
    expectedPriority: 'high'
  }
];

/**
 * Contract Expiration Risk Alert Test Scenarios
 */
export const contractExpirationScenarios: AlertTestScenario[] = [
  {
    name: 'Contract Expiring - Poor Health',
    description: 'Contract expires in 60 days with health score below 50',
    customerHealthData: {
      customerId: 'contract-expiration-1',
      paymentHistory: {
        daysSinceLastPayment: 25,
        averagePaymentDelay: 15,
        overdueAmount: 3500,
        totalPayments: 10,
        latePayments: 5
      },
      engagement: {
        loginsLast30Days: 6,
        featuresUsedLast30Days: 2,
        averageSessionMinutes: 10,
        supportTicketsLast90Days: 12,
        totalTimeSpentMinutes: 180
      },
      contract: {
        daysUntilRenewal: 60, // Expiring soon
        contractValue: 65000,
        hasRecentUpgrade: false,
        hasRecentDowngrade: true,
        contractDurationMonths: 12,
        renewalHistory: 2
      },
      support: {
        averageResolutionHours: 96, // Very slow
        satisfactionScore: 3.8, // Very poor
        escalatedTickets: 4,
        totalTickets: 12,
        criticalTickets: 3
      },
      lastUpdated: new Date()
    },
    expectedAlertTypes: ['contract_expiration_risk'],
    expectedPriority: 'high'
  }
];

/**
 * Support Ticket Spike Alert Test Scenarios
 */
export const supportTicketSpikeScenarios: AlertTestScenario[] = [
  {
    name: 'High Support Volume - Multiple Escalations',
    description: 'Customer with high support ticket volume and escalations',
    customerHealthData: {
      customerId: 'support-spike-1',
      paymentHistory: {
        daysSinceLastPayment: 8,
        averagePaymentDelay: 2,
        overdueAmount: 0,
        totalPayments: 20,
        latePayments: 1
      },
      engagement: {
        loginsLast30Days: 18,
        featuresUsedLast30Days: 12,
        averageSessionMinutes: 35,
        supportTicketsLast90Days: 15,
        totalTimeSpentMinutes: 1200
      },
      contract: {
        daysUntilRenewal: 180,
        contractValue: 75000,
        hasRecentUpgrade: true,
        hasRecentDowngrade: false,
        contractDurationMonths: 24,
        renewalHistory: 3
      },
      support: {
        averageResolutionHours: 48,
        satisfactionScore: 5.5,
        escalatedTickets: 5, // High escalation count
        totalTickets: 15, // High total tickets
        criticalTickets: 2
      },
      lastUpdated: new Date()
    },
    expectedAlertTypes: ['support_ticket_spike'],
    expectedPriority: 'medium'
  }
];

/**
 * Feature Adoption Stall Alert Test Scenarios
 */
export const featureAdoptionStallScenarios: AlertTestScenario[] = [
  {
    name: 'High-Value Account - Limited Feature Usage',
    description: 'High ARR account with limited feature adoption despite regular logins',
    customerHealthData: {
      customerId: 'feature-stall-1',
      paymentHistory: {
        daysSinceLastPayment: 3,
        averagePaymentDelay: 1,
        overdueAmount: 0,
        totalPayments: 36,
        latePayments: 0
      },
      engagement: {
        loginsLast30Days: 22, // Good login frequency
        featuresUsedLast30Days: 3, // But low feature usage
        averageSessionMinutes: 12, // Short sessions
        supportTicketsLast90Days: 1,
        totalTimeSpentMinutes: 480
      },
      contract: {
        daysUntilRenewal: 240,
        contractValue: 120000, // High value account
        hasRecentUpgrade: true,
        hasRecentDowngrade: false,
        contractDurationMonths: 24,
        renewalHistory: 5
      },
      support: {
        averageResolutionHours: 8,
        satisfactionScore: 7.8,
        escalatedTickets: 0,
        totalTickets: 1,
        criticalTickets: 0
      },
      lastUpdated: new Date()
    },
    expectedAlertTypes: ['feature_adoption_stall'],
    expectedPriority: 'medium'
  }
];

/**
 * All test scenarios combined
 */
export const allTestScenarios: AlertTestScenario[] = [
  ...paymentRiskScenarios,
  ...engagementCliffScenarios,
  ...contractExpirationScenarios,
  ...supportTicketSpikeScenarios,
  ...featureAdoptionStallScenarios
];

/**
 * Generate customer history map for all test scenarios
 */
export function generateTestHistoryMap(): Map<string, CustomerHistory> {
  const historyMap = new Map<string, CustomerHistory>();

  allTestScenarios.forEach(scenario => {
    if (scenario.customerHistory) {
      historyMap.set(scenario.customerHealthData.customerId, scenario.customerHistory);
    } else {
      // Generate default history for scenarios without explicit history
      historyMap.set(
        scenario.customerHealthData.customerId,
        generateMockCustomerHistory(scenario.customerHealthData.customerId)
      );
    }
  });

  return historyMap;
}

/**
 * Helper function to get scenario by customer ID
 */
export function getScenarioByCustomerId(customerId: string): AlertTestScenario | undefined {
  return allTestScenarios.find(scenario => scenario.customerHealthData.customerId === customerId);
}
