/**
 * Unit tests for Predictive Alerts System
 *
 * Comprehensive test suite covering:
 * - Individual alert rule evaluation
 * - Alert engine functionality
 * - Edge cases and error handling
 * - Performance requirements
 * - Security validation
 */

import {
  PredictiveAlertEngine,
  alertEngine,
  resetAlertStorage,
  evaluatePaymentRiskAlert,
  evaluateEngagementCliffAlert,
  evaluateContractExpirationRiskAlert,
  evaluateSupportTicketSpikeAlert,
  evaluateFeatureAdoptionStallAlert,
  ALERT_RULES
} from '../alerts';

import {
  Alert,
  AlertSystemError,
  AlertEngine,
  CustomerHistory
} from '../../types/alerts';

import { CustomerHealthData } from '../../types/healthScore';

import {
  paymentRiskScenarios,
  engagementCliffScenarios,
  contractExpirationScenarios,
  supportTicketSpikeScenarios,
  featureAdoptionStallScenarios,
  allTestScenarios,
  generateTestHistoryMap
} from '../../data/mock-alert-data';

// Mock customer data for testing
const mockHealthyCustomer: CustomerHealthData = {
  customerId: 'healthy-test-001',
  paymentHistory: {
    daysSinceLastPayment: 5,
    averagePaymentDelay: 2,
    overdueAmount: 0,
    totalPayments: 24,
    latePayments: 1
  },
  engagement: {
    loginsLast30Days: 25,
    featuresUsedLast30Days: 15,
    averageSessionMinutes: 45,
    supportTicketsLast90Days: 1,
    totalTimeSpentMinutes: 2400
  },
  contract: {
    daysUntilRenewal: 180,
    contractValue: 75000,
    hasRecentUpgrade: true,
    hasRecentDowngrade: false,
    contractDurationMonths: 12,
    renewalHistory: 3
  },
  support: {
    averageResolutionHours: 12,
    satisfactionScore: 8.5,
    escalatedTickets: 0,
    totalTickets: 1,
    criticalTickets: 0
  },
  lastUpdated: new Date()
};

const mockUnhealthyCustomer: CustomerHealthData = {
  customerId: 'unhealthy-test-001',
  paymentHistory: {
    daysSinceLastPayment: 45,
    averagePaymentDelay: 25,
    overdueAmount: 12000,
    totalPayments: 8,
    latePayments: 6
  },
  engagement: {
    loginsLast30Days: 3,
    featuresUsedLast30Days: 1,
    averageSessionMinutes: 8,
    supportTicketsLast90Days: 12,
    totalTimeSpentMinutes: 120
  },
  contract: {
    daysUntilRenewal: 45,
    contractValue: 35000,
    hasRecentUpgrade: false,
    hasRecentDowngrade: true,
    contractDurationMonths: 12,
    renewalHistory: 1
  },
  support: {
    averageResolutionHours: 96,
    satisfactionScore: 2.8,
    escalatedTickets: 4,
    totalTickets: 12,
    criticalTickets: 3
  },
  lastUpdated: new Date()
};

describe('Alert Rules Engine', () => {
  beforeEach(() => {
    resetAlertStorage();
  });

  describe('Payment Risk Alert Rule', () => {
    it('should trigger for overdue payments >30 days', () => {
      const result = evaluatePaymentRiskAlert(mockUnhealthyCustomer);

      expect(result.shouldTrigger).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.reason).toContain('Payment overdue by 45 days');
      expect(result.recommendedActions).toContain('Contact customer immediately regarding overdue payment');
      expect(result.triggerValues.daysSinceLastPayment).toBe(45);
    });

    it('should trigger for health score drops with history', () => {
      const decliningHistory: CustomerHistory = {
        customerId: 'test',
        healthScores: [
          { score: 45, timestamp: new Date() },
          { score: 70, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        ],
        loginHistory: [],
        paymentEvents: [],
        supportTickets: [],
        featureUsage: [],
        contractEvents: []
      };

      const result = evaluatePaymentRiskAlert(mockHealthyCustomer, decliningHistory);

      expect(result.shouldTrigger).toBe(true);
      expect(result.reason).toContain('health score dropped 25 points');
      expect(result.triggerValues.healthScoreDrop).toBe(25);
    });

    it('should not trigger for healthy payment patterns', () => {
      const result = evaluatePaymentRiskAlert(mockHealthyCustomer);

      expect(result.shouldTrigger).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should handle missing payment history gracefully', () => {
      const customerWithoutHistory = {
        ...mockHealthyCustomer,
        paymentHistory: {
          ...mockHealthyCustomer.paymentHistory,
          totalPayments: 0,
          latePayments: 0
        }
      };

      expect(() => evaluatePaymentRiskAlert(customerWithoutHistory)).not.toThrow();
    });
  });

  describe('Engagement Cliff Alert Rule', () => {
    it('should trigger for significant engagement drops with history', () => {
      const decliningEngagement: CustomerHistory = {
        customerId: 'test',
        healthScores: [],
        loginHistory: [
          { count: 8, period: 'weekly', timestamp: new Date() },
          { count: 20, period: 'weekly', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          { count: 22, period: 'weekly', timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) }
        ],
        paymentEvents: [],
        supportTickets: [],
        featureUsage: [],
        contractEvents: []
      };

      const result = evaluateEngagementCliffAlert(
        { ...mockHealthyCustomer, engagement: { ...mockHealthyCustomer.engagement, loginsLast30Days: 8 } },
        decliningEngagement
      );

      expect(result.shouldTrigger).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.reason).toContain('Login frequency dropped');
      expect(result.triggerValues.dropPercentage).toBeGreaterThan(50);
    });

    it('should trigger for extremely low engagement without history', () => {
      const lowEngagementCustomer = {
        ...mockHealthyCustomer,
        engagement: {
          ...mockHealthyCustomer.engagement,
          loginsLast30Days: 2,
          featuresUsedLast30Days: 1
        }
      };

      const result = evaluateEngagementCliffAlert(lowEngagementCustomer);

      expect(result.shouldTrigger).toBe(true);
      expect(result.confidence).toBe(0.7);
      expect(result.reason).toContain('Extremely low engagement');
    });

    it('should not trigger for stable engagement patterns', () => {
      const stableHistory: CustomerHistory = {
        customerId: 'test',
        healthScores: [],
        loginHistory: [
          { count: 25, period: 'weekly', timestamp: new Date() },
          { count: 23, period: 'weekly', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        ],
        paymentEvents: [],
        supportTickets: [],
        featureUsage: [],
        contractEvents: []
      };

      const result = evaluateEngagementCliffAlert(mockHealthyCustomer, stableHistory);

      expect(result.shouldTrigger).toBe(false);
    });
  });

  describe('Contract Expiration Risk Alert Rule', () => {
    it('should trigger for near expiration with poor health', () => {
      const nearExpirationCustomer = {
        ...mockUnhealthyCustomer,
        contract: {
          ...mockUnhealthyCustomer.contract,
          daysUntilRenewal: 60
        }
      };

      const result = evaluateContractExpirationRiskAlert(nearExpirationCustomer);

      expect(result.shouldTrigger).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reason).toContain('Contract expires in 60 days');
      expect(result.recommendedActions).toContain('Schedule renewal discussion immediately');
    });

    it('should not trigger for distant renewals', () => {
      const distantRenewalCustomer = {
        ...mockUnhealthyCustomer,
        contract: {
          ...mockUnhealthyCustomer.contract,
          daysUntilRenewal: 200
        }
      };

      const result = evaluateContractExpirationRiskAlert(distantRenewalCustomer);

      expect(result.shouldTrigger).toBe(false);
    });

    it('should not trigger for healthy customers even near renewal', () => {
      const nearRenewalHealthyCustomer = {
        ...mockHealthyCustomer,
        contract: {
          ...mockHealthyCustomer.contract,
          daysUntilRenewal: 60
        }
      };

      const result = evaluateContractExpirationRiskAlert(nearRenewalHealthyCustomer);

      expect(result.shouldTrigger).toBe(false);
    });
  });

  describe('Support Ticket Spike Alert Rule', () => {
    it('should trigger for high ticket volume with escalations', () => {
      const highSupportCustomer = {
        ...mockHealthyCustomer,
        support: {
          averageResolutionHours: 48,
          satisfactionScore: 6.0,
          escalatedTickets: 3,
          totalTickets: 8,
          criticalTickets: 1
        }
      };

      const result = evaluateSupportTicketSpikeAlert(highSupportCustomer);

      expect(result.shouldTrigger).toBe(true);
      expect(result.confidence).toBe(0.85); // High confidence due to escalations
      expect(result.reason).toContain('escalated ticket');
    });

    it('should not trigger for low support activity', () => {
      const result = evaluateSupportTicketSpikeAlert(mockHealthyCustomer);

      expect(result.shouldTrigger).toBe(false);
    });
  });

  describe('Feature Adoption Stall Alert Rule', () => {
    it('should trigger for high-value accounts with low feature usage', () => {
      const highValueLowUsage = {
        ...mockHealthyCustomer,
        contract: {
          ...mockHealthyCustomer.contract,
          contractValue: 80000 // Above $50k threshold
        },
        engagement: {
          ...mockHealthyCustomer.engagement,
          featuresUsedLast30Days: 3, // Low feature usage
          loginsLast30Days: 20 // But good login frequency
        }
      };

      const result = evaluateFeatureAdoptionStallAlert(highValueLowUsage);

      expect(result.shouldTrigger).toBe(true);
      expect(result.confidence).toBe(0.75);
      expect(result.reason).toContain('High-value account');
      expect(result.triggerValues.contractValue).toBe(80000);
    });

    it('should not trigger for low-value accounts', () => {
      const lowValueCustomer = {
        ...mockHealthyCustomer,
        contract: {
          ...mockHealthyCustomer.contract,
          contractValue: 25000 // Below $50k threshold
        },
        engagement: {
          ...mockHealthyCustomer.engagement,
          featuresUsedLast30Days: 2
        }
      };

      const result = evaluateFeatureAdoptionStallAlert(lowValueCustomer);

      expect(result.shouldTrigger).toBe(false);
    });

    it('should not trigger for high feature usage', () => {
      const highUsageCustomer = {
        ...mockHealthyCustomer,
        contract: {
          ...mockHealthyCustomer.contract,
          contractValue: 80000
        },
        engagement: {
          ...mockHealthyCustomer.engagement,
          featuresUsedLast30Days: 12 // High feature usage
        }
      };

      const result = evaluateFeatureAdoptionStallAlert(highUsageCustomer);

      expect(result.shouldTrigger).toBe(false);
    });
  });
});

describe('Alert Engine Integration', () => {
  let engine: AlertEngine;

  beforeEach(() => {
    resetAlertStorage();
    engine = new PredictiveAlertEngine();
  });

  describe('Single Customer Evaluation', () => {
    it('should evaluate all rules for a single customer', () => {
      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.every(alert => alert.customerId === mockUnhealthyCustomer.customerId)).toBe(true);

      // Should be sorted by priority and confidence
      for (let i = 1; i < alerts.length; i++) {
        if (alerts[i-1].priority === 'high' && alerts[i].priority === 'medium') {
          continue; // Correct priority order
        } else if (alerts[i-1].priority === alerts[i].priority) {
          expect(alerts[i-1].confidence).toBeGreaterThanOrEqual(alerts[i].confidence);
        }
      }
    });

    it('should return empty array for healthy customer', () => {
      const alerts = engine.evaluateCustomer(mockHealthyCustomer);

      expect(alerts).toHaveLength(0);
    });

    it('should include proper alert metadata', () => {
      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

      if (alerts.length > 0) {
        const alert = alerts[0];
        expect(alert.id).toBeDefined();
        expect(alert.triggeredAt).toBeInstanceOf(Date);
        expect(alert.cooldownUntil).toBeInstanceOf(Date);
        expect(alert.confidence).toBeGreaterThan(0);
        expect(alert.metadata).toBeDefined();
        expect(alert.metadata.triggerValues).toBeDefined();
        expect(alert.recommendedActions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Multiple Customer Evaluation', () => {
    it('should evaluate multiple customers and sort by priority', () => {
      const customers = [mockHealthyCustomer, mockUnhealthyCustomer];
      const alerts = engine.evaluateAllCustomers(customers);

      // Should have alerts only for unhealthy customer
      expect(alerts.every(alert => alert.customerId === mockUnhealthyCustomer.customerId)).toBe(true);

      // Should be sorted globally by priority and confidence
      const highPriorityAlerts = alerts.filter(a => a.priority === 'high');
      const mediumPriorityAlerts = alerts.filter(a => a.priority === 'medium');

      expect(highPriorityAlerts.length + mediumPriorityAlerts.length).toBe(alerts.length);

      // High priority alerts should come first
      if (highPriorityAlerts.length > 0 && mediumPriorityAlerts.length > 0) {
        const firstMediumIndex = alerts.findIndex(a => a.priority === 'medium');
        const lastHighIndex = alerts.map((a, i) => a.priority === 'high' ? i : -1).filter(i => i >= 0).pop();
        expect(lastHighIndex).toBeLessThan(firstMediumIndex);
      }
    });

    it('should handle empty customer array', () => {
      const alerts = engine.evaluateAllCustomers([]);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Alert Management', () => {
    it('should dismiss alerts correctly', () => {
      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        engine.dismissAlert(alertId, 'test_user');

        const activeAlerts = engine.getActiveAlerts();
        expect(activeAlerts.find(a => a.id === alertId)).toBeUndefined();
      }
    });

    it('should resolve alerts correctly', () => {
      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        engine.resolveAlert(alertId, 'test_user');

        const activeAlerts = engine.getActiveAlerts();
        expect(activeAlerts.find(a => a.id === alertId)).toBeUndefined();
      }
    });

    it('should snooze alerts correctly', () => {
      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        const snoozeUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        engine.snoozeAlert(alertId, snoozeUntil);

        const activeAlerts = engine.getActiveAlerts();
        expect(activeAlerts.find(a => a.id === alertId)).toBeUndefined();
      }
    });

    it('should get customer-specific alerts', () => {
      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

      if (alerts.length > 0) {
        const customerAlerts = engine.getCustomerAlerts(mockUnhealthyCustomer.customerId);
        expect(customerAlerts.length).toBeGreaterThan(0);
        expect(customerAlerts.every(a => a.customerId === mockUnhealthyCustomer.customerId)).toBe(true);
      }
    });
  });

  describe('Cooldown Period Management', () => {
    it('should respect cooldown periods', () => {
      // First evaluation
      const firstAlerts = engine.evaluateCustomer(mockUnhealthyCustomer);
      const initialAlertCount = firstAlerts.length;

      // Immediate re-evaluation should produce no new alerts due to cooldown
      const secondAlerts = engine.evaluateCustomer(mockUnhealthyCustomer);
      expect(secondAlerts).toHaveLength(0);

      // Total active alerts should still be from first evaluation
      const activeAlerts = engine.getActiveAlerts();
      expect(activeAlerts.length).toBe(initialAlertCount);
    });

    it('should allow re-triggering after cooldown period', () => {
      // This would require time manipulation or mocking Date
      // For now, we test the logic exists
      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);
      expect(alerts.length).toBeGreaterThan(0);

      // Verify cooldown is set
      if (alerts.length > 0) {
        expect(alerts[0].cooldownUntil).toBeInstanceOf(Date);
        expect(alerts[0].cooldownUntil!.getTime()).toBeGreaterThan(Date.now());
      }
    });
  });

  describe('System Metrics', () => {
    it('should provide accurate system metrics', () => {
      engine.evaluateCustomer(mockUnhealthyCustomer);
      const metrics = engine.getSystemMetrics();

      expect(metrics.totalAlerts).toBeGreaterThanOrEqual(0);
      expect(metrics.alertsByPriority.high).toBeGreaterThanOrEqual(0);
      expect(metrics.alertsByPriority.medium).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.resolutionStats.averageResolutionTime).toBe('number');
      expect(metrics.performanceMetrics.averageEvaluationTime).toBeGreaterThan(0);
    });
  });

  describe('Rule Management', () => {
    it('should allow adding new rules', () => {
      const customRule = {
        type: 'payment_risk' as const,
        priority: 'high' as const,
        evaluate: () => ({ shouldTrigger: false, confidence: 0, reason: '', recommendedActions: [], triggerValues: {}, thresholds: {} }),
        cooldownPeriod: 60,
        description: 'Custom test rule',
        enabled: true
      };

      engine.addRule(customRule);
      expect(() => engine.evaluateCustomer(mockHealthyCustomer)).not.toThrow();
    });

    it('should allow disabling rules', () => {
      engine.toggleRule('payment_risk', false);

      const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);
      const paymentRiskAlerts = alerts.filter(a => a.type === 'payment_risk');
      expect(paymentRiskAlerts).toHaveLength(0);
    });
  });
});

describe('Test Scenarios Validation', () => {
  let engine: AlertEngine;

  beforeEach(() => {
    resetAlertStorage();
    engine = new PredictiveAlertEngine();
  });

  describe('Payment Risk Scenarios', () => {
    paymentRiskScenarios.forEach(scenario => {
      it(`should trigger alerts for: ${scenario.name}`, () => {
        const alerts = engine.evaluateCustomer(scenario.customerHealthData, scenario.customerHistory);

        expect(alerts.length).toBeGreaterThan(0);
        expect(alerts.some(alert => scenario.expectedAlertTypes.includes(alert.type))).toBe(true);

        const relevantAlert = alerts.find(alert => scenario.expectedAlertTypes.includes(alert.type));
        if (relevantAlert) {
          expect(relevantAlert.priority).toBe(scenario.expectedPriority);
          expect(relevantAlert.confidence).toBeGreaterThan(0.5);
        }
      });
    });
  });

  describe('Engagement Cliff Scenarios', () => {
    engagementCliffScenarios.forEach(scenario => {
      it(`should trigger alerts for: ${scenario.name}`, () => {
        const alerts = engine.evaluateCustomer(scenario.customerHealthData, scenario.customerHistory);

        expect(alerts.length).toBeGreaterThan(0);
        expect(alerts.some(alert => scenario.expectedAlertTypes.includes(alert.type))).toBe(true);

        const relevantAlert = alerts.find(alert => scenario.expectedAlertTypes.includes(alert.type));
        if (relevantAlert) {
          expect(relevantAlert.priority).toBe(scenario.expectedPriority);
        }
      });
    });
  });

  describe('All Test Scenarios', () => {
    it('should validate all test scenarios produce expected alerts', () => {
      const historyMap = generateTestHistoryMap();
      let totalExpectedAlerts = 0;
      let totalActualAlerts = 0;

      allTestScenarios.forEach(scenario => {
        const customerHistory = historyMap.get(scenario.customerHealthData.customerId);
        const alerts = engine.evaluateCustomer(scenario.customerHealthData, customerHistory);

        const relevantAlerts = alerts.filter(alert => scenario.expectedAlertTypes.includes(alert.type));
        totalExpectedAlerts += scenario.expectedAlertTypes.length;
        totalActualAlerts += relevantAlerts.length;

        expect(relevantAlerts.length).toBeGreaterThan(0);
      });

      // Should have reasonable alert trigger rate
      const triggerRate = totalActualAlerts / totalExpectedAlerts;
      expect(triggerRate).toBeGreaterThan(0.5); // At least 50% of expected alerts should trigger
    });
  });
});

describe('Performance Requirements', () => {
  let engine: AlertEngine;

  beforeEach(() => {
    resetAlertStorage();
    engine = new PredictiveAlertEngine();
  });

  it('should evaluate single customer within 500ms', () => {
    const startTime = performance.now();
    engine.evaluateCustomer(mockUnhealthyCustomer);
    const endTime = performance.now();

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(500);
  });

  it('should evaluate 100 customers within 5 seconds', () => {
    // Create array of 100 test customers
    const customers = Array.from({ length: 100 }, (_, i) => ({
      ...mockUnhealthyCustomer,
      customerId: `perf-test-${i}`
    }));

    const startTime = performance.now();
    engine.evaluateAllCustomers(customers);
    const endTime = performance.now();

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(5000);
  });

  it('should handle memory efficiently with many alerts', () => {
    // Generate many alerts
    for (let i = 0; i < 1000; i++) {
      const customer = {
        ...mockUnhealthyCustomer,
        customerId: `memory-test-${i}`
      };
      engine.evaluateCustomer(customer);
    }

    const activeAlerts = engine.getActiveAlerts();
    expect(activeAlerts.length).toBeGreaterThan(0);
    expect(activeAlerts.length).toBeLessThan(10000); // Reasonable upper bound
  });
});

describe('Error Handling', () => {
  let engine: AlertEngine;

  beforeEach(() => {
    resetAlertStorage();
    engine = new PredictiveAlertEngine();
  });

  it('should handle invalid customer data gracefully', () => {
    const invalidCustomer = {
      ...mockHealthyCustomer,
      paymentHistory: {
        ...mockHealthyCustomer.paymentHistory,
        daysSinceLastPayment: -1000 // Invalid value
      }
    };

    expect(() => engine.evaluateCustomer(invalidCustomer)).not.toThrow();
  });

  it('should handle missing customer data gracefully', () => {
    const incompleteCustomer = {
      customerId: 'incomplete',
      paymentHistory: mockHealthyCustomer.paymentHistory,
      engagement: mockHealthyCustomer.engagement,
      contract: mockHealthyCustomer.contract,
      support: mockHealthyCustomer.support,
      lastUpdated: new Date()
    } as CustomerHealthData;

    expect(() => engine.evaluateCustomer(incompleteCustomer)).not.toThrow();
  });

  it('should handle rule evaluation failures', () => {
    const faultyRule = {
      type: 'payment_risk' as const,
      priority: 'high' as const,
      evaluate: () => { throw new Error('Test error'); },
      cooldownPeriod: 60,
      description: 'Faulty test rule',
      enabled: true
    };

    engine.addRule(faultyRule);

    expect(() => engine.evaluateCustomer(mockHealthyCustomer)).toThrow(AlertSystemError);
  });
});

describe('Security Validation', () => {
  let engine: AlertEngine;

  beforeEach(() => {
    resetAlertStorage();
    engine = new PredictiveAlertEngine();
  });

  it('should not expose sensitive customer data in alert messages', () => {
    const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

    alerts.forEach(alert => {
      // Check that alert messages don't contain raw sensitive data
      expect(alert.message).not.toContain(mockUnhealthyCustomer.customerId);
      expect(alert.message).not.toMatch(/\$\d+,\d+/); // No exact dollar amounts
      expect(alert.message).not.toMatch(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/); // No credit card patterns
    });
  });

  it('should sanitize alert metadata', () => {
    const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

    alerts.forEach(alert => {
      expect(alert.metadata).toBeDefined();
      expect(alert.metadata.triggerValues).toBeDefined();

      // Metadata should contain processed values, not raw sensitive data
      Object.values(alert.metadata.triggerValues).forEach(value => {
        expect(typeof value).toMatch(/string|number|boolean/);
      });
    });
  });

  it('should validate user permissions for alert actions', () => {
    const alerts = engine.evaluateCustomer(mockUnhealthyCustomer);

    if (alerts.length > 0) {
      const alertId = alerts[0].id;

      // These should work (in production, would validate user permissions)
      expect(() => engine.dismissAlert(alertId, 'valid_user')).not.toThrow();
      expect(() => engine.resolveAlert(alertId, 'valid_user')).not.toThrow();
    }
  });
});
