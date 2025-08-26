/**
 * Unit tests for Customer Health Score Calculator
 *
 * Comprehensive test suite covering:
 * - Individual factor calculations
 * - Overall score calculation
 * - Edge cases and error handling
 * - Data validation
 * - Mathematical accuracy
 */

import {
  calculateHealthScore,
  calculatePaymentScore,
  calculateEngagementScore,
  calculateContractScore,
  calculateSupportScore,
  validateHealthData,
  determineRiskLevel,
  getHealthScoreExplanation,
  DEFAULT_CONFIG
} from '../healthCalculator';

import {
  CustomerHealthData,
  PaymentMetrics,
  EngagementMetrics,
  ContractMetrics,
  SupportMetrics,
  HealthScoreCalculationError
} from '../../types/healthScore';

describe('Health Calculator', () => {
  // Mock data for testing
  const mockHealthyCustomer: CustomerHealthData = {
    customerId: 'test-healthy-001',
    paymentHistory: {
      daysSinceLastPayment: 5,
      averagePaymentDelay: 2,
      overdueAmount: 0,
      totalPayments: 12,
      latePayments: 1
    },
    engagement: {
      loginsLast30Days: 25,
      featuresUsedLast30Days: 18,
      averageSessionMinutes: 45,
      supportTicketsLast90Days: 2,
      totalTimeSpentMinutes: 1800 // 30 hours
    },
    contract: {
      daysUntilRenewal: 180,
      contractValue: 50000,
      hasRecentUpgrade: true,
      hasRecentDowngrade: false,
      contractDurationMonths: 12,
      renewalHistory: 2
    },
    support: {
      averageResolutionHours: 8,
      satisfactionScore: 8.5,
      escalatedTickets: 0,
      totalTickets: 3,
      criticalTickets: 0
    },
    lastUpdated: new Date()
  };

  const mockWarningCustomer: CustomerHealthData = {
    customerId: 'test-warning-001',
    paymentHistory: {
      daysSinceLastPayment: 35,
      averagePaymentDelay: 12,
      overdueAmount: 2500,
      totalPayments: 8,
      latePayments: 3
    },
    engagement: {
      loginsLast30Days: 8,
      featuresUsedLast30Days: 4,
      averageSessionMinutes: 12,
      supportTicketsLast90Days: 8,
      totalTimeSpentMinutes: 600 // 10 hours
    },
    contract: {
      daysUntilRenewal: 45,
      contractValue: 15000,
      hasRecentUpgrade: false,
      hasRecentDowngrade: true,
      contractDurationMonths: 12,
      renewalHistory: 1
    },
    support: {
      averageResolutionHours: 36,
      satisfactionScore: 5.5,
      escalatedTickets: 2,
      totalTickets: 8,
      criticalTickets: 1
    },
    lastUpdated: new Date()
  };

  const mockCriticalCustomer: CustomerHealthData = {
    customerId: 'test-critical-001',
    paymentHistory: {
      daysSinceLastPayment: 75,
      averagePaymentDelay: 35,
      overdueAmount: 15000,
      totalPayments: 6,
      latePayments: 4
    },
    engagement: {
      loginsLast30Days: 1,
      featuresUsedLast30Days: 1,
      averageSessionMinutes: 3,
      supportTicketsLast90Days: 15,
      totalTimeSpentMinutes: 120 // 2 hours
    },
    contract: {
      daysUntilRenewal: -10, // Overdue renewal
      contractValue: 8000,
      hasRecentUpgrade: false,
      hasRecentDowngrade: true,
      contractDurationMonths: 12,
      renewalHistory: 0
    },
    support: {
      averageResolutionHours: 96,
      satisfactionScore: 2.1,
      escalatedTickets: 5,
      totalTickets: 15,
      criticalTickets: 6
    },
    lastUpdated: new Date()
  };

  describe('Payment Score Calculation', () => {
    it('should calculate perfect payment score for ideal customer', () => {
      const idealPayment: PaymentMetrics = {
        daysSinceLastPayment: 2,
        averagePaymentDelay: 0,
        overdueAmount: 0,
        totalPayments: 24,
        latePayments: 0
      };

      const result = calculatePaymentScore(idealPayment);
      expect(result.score).toBe(100);
      expect(result.confidence).toBe(1.0);
      expect(result.weight).toBe(0.40);
      expect(result.contribution).toBe(40);
    });

    it('should penalize late payments appropriately', () => {
      const latePayment: PaymentMetrics = {
        daysSinceLastPayment: 65,
        averagePaymentDelay: 30,
        overdueAmount: 12000,
        totalPayments: 10,
        latePayments: 8
      };

      const result = calculatePaymentScore(latePayment);
      expect(result.score).toBeLessThan(30);
      expect(result.explanation).toContain('No payment in 60+ days');
      expect(result.explanation).toContain('High overdue amount');
    });

    it('should handle new customer with no payment history', () => {
      const newCustomer: PaymentMetrics = {
        daysSinceLastPayment: 0,
        averagePaymentDelay: 0,
        overdueAmount: 0,
        totalPayments: 0,
        latePayments: 0
      };

      const result = calculatePaymentScore(newCustomer);
      expect(result.confidence).toBeLessThan(1.0);
      expect(result.explanation).toContain('No payment history');
    });
  });

  describe('Engagement Score Calculation', () => {
    it('should calculate high engagement score for active user', () => {
      const activeEngagement: EngagementMetrics = {
        loginsLast30Days: 28,
        featuresUsedLast30Days: 20,
        averageSessionMinutes: 90,
        supportTicketsLast90Days: 1,
        totalTimeSpentMinutes: 3600 // 60 hours
      };

      const result = calculateEngagementScore(activeEngagement);
      expect(result.score).toBeGreaterThan(85);
      expect(result.explanation).toContain('Excellent');
    });

    it('should calculate low engagement score for inactive user', () => {
      const inactiveEngagement: EngagementMetrics = {
        loginsLast30Days: 2,
        featuresUsedLast30Days: 1,
        averageSessionMinutes: 3,
        supportTicketsLast90Days: 0,
        totalTimeSpentMinutes: 60 // 1 hour
      };

      const result = calculateEngagementScore(inactiveEngagement);
      expect(result.score).toBeLessThan(30);
      expect(result.explanation).toContain('Very low');
    });

    it('should penalize excessive support tickets', () => {
      const troubledEngagement: EngagementMetrics = {
        loginsLast30Days: 15,
        featuresUsedLast30Days: 8,
        averageSessionMinutes: 30,
        supportTicketsLast90Days: 25,
        totalTimeSpentMinutes: 1200
      };

      const result = calculateEngagementScore(troubledEngagement);
      expect(result.explanation).toContain('High support ticket volume');
    });
  });

  describe('Contract Score Calculation', () => {
    it('should calculate high contract score for stable high-value customer', () => {
      const stableContract: ContractMetrics = {
        daysUntilRenewal: 270,
        contractValue: 150000,
        hasRecentUpgrade: true,
        hasRecentDowngrade: false,
        contractDurationMonths: 24,
        renewalHistory: 5
      };

      const result = calculateContractScore(stableContract);
      expect(result.score).toBeGreaterThan(90);
      expect(result.explanation).toContain('High-value contract');
      expect(result.explanation).toContain('Recent upgrade');
    });

    it('should penalize overdue renewals severely', () => {
      const overdueContract: ContractMetrics = {
        daysUntilRenewal: -15,
        contractValue: 25000,
        hasRecentUpgrade: false,
        hasRecentDowngrade: false,
        contractDurationMonths: 12,
        renewalHistory: 2
      };

      const result = calculateContractScore(overdueContract);
      expect(result.score).toBeLessThan(50);
      expect(result.explanation).toContain('Overdue renewal');
    });

    it('should handle new customers with lower confidence', () => {
      const newContract: ContractMetrics = {
        daysUntilRenewal: 365,
        contractValue: 10000,
        hasRecentUpgrade: false,
        hasRecentDowngrade: false,
        contractDurationMonths: 12,
        renewalHistory: 0
      };

      const result = calculateContractScore(newContract);
      expect(result.confidence).toBeLessThan(1.0);
      expect(result.explanation).toContain('No renewal history');
    });
  });

  describe('Support Score Calculation', () => {
    it('should calculate high support score for satisfied customer', () => {
      const excellentSupport: SupportMetrics = {
        averageResolutionHours: 2,
        satisfactionScore: 9.5,
        escalatedTickets: 0,
        totalTickets: 5,
        criticalTickets: 0
      };

      const result = calculateSupportScore(excellentSupport);
      expect(result.score).toBeGreaterThan(90);
      expect(result.explanation).toContain('Excellent satisfaction');
      expect(result.explanation).toContain('Excellent resolution time');
    });

    it('should penalize poor satisfaction and slow resolution', () => {
      const poorSupport: SupportMetrics = {
        averageResolutionHours: 120,
        satisfactionScore: 2.0,
        escalatedTickets: 8,
        totalTickets: 12,
        criticalTickets: 6
      };

      const result = calculateSupportScore(poorSupport);
      expect(result.score).toBeLessThan(40);
      expect(result.explanation).toContain('Very poor satisfaction');
      expect(result.explanation).toContain('Very slow resolution');
    });

    it('should handle customers with no support history', () => {
      const noSupport: SupportMetrics = {
        averageResolutionHours: 0,
        satisfactionScore: 7,
        escalatedTickets: 0,
        totalTickets: 0,
        criticalTickets: 0
      };

      const result = calculateSupportScore(noSupport);
      expect(result.confidence).toBeLessThan(1.0);
      expect(result.explanation).toContain('No support ticket history');
    });
  });

  describe('Overall Health Score Calculation', () => {
    it('should classify healthy customer correctly', () => {
      const result = calculateHealthScore(mockHealthyCustomer);

      expect(result.overallScore).toBeGreaterThan(70);
      expect(result.riskLevel).toBe('healthy');
      expect(result.overallConfidence).toBeGreaterThan(0.8);
      expect(result.calculatedAt).toBeInstanceOf(Date);
    });

    it('should classify warning customer correctly', () => {
      const result = calculateHealthScore(mockWarningCustomer);

      expect(result.overallScore).toBeLessThanOrEqual(70);
      expect(result.overallScore).toBeGreaterThan(30);
      expect(result.riskLevel).toBe('warning');
    });

    it('should classify critical customer correctly', () => {
      const result = calculateHealthScore(mockCriticalCustomer);

      expect(result.overallScore).toBeLessThanOrEqual(30);
      expect(result.riskLevel).toBe('critical');
    });

    it('should verify weighted contribution math', () => {
      const result = calculateHealthScore(mockHealthyCustomer);
      const { factorScores } = result;

      const calculatedTotal = Math.round(
        factorScores.payment.contribution +
        factorScores.engagement.contribution +
        factorScores.contract.contribution +
        factorScores.support.contribution
      );

      expect(result.overallScore).toBe(calculatedTotal);

      // Verify weights sum to 1
      const totalWeight =
        factorScores.payment.weight +
        factorScores.engagement.weight +
        factorScores.contract.weight +
        factorScores.support.weight;

      expect(totalWeight).toBeCloseTo(1.0, 2);
    });
  });

  describe('Data Validation', () => {
    it('should validate correct data successfully', () => {
      const result = validateHealthData(mockHealthyCustomer);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should catch negative payment values', () => {
      const invalidData = {
        ...mockHealthyCustomer,
        paymentHistory: {
          ...mockHealthyCustomer.paymentHistory,
          overdueAmount: -1000
        }
      };

      const result = validateHealthData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Overdue amount cannot be negative');
    });

    it('should catch invalid satisfaction scores', () => {
      const invalidData = {
        ...mockHealthyCustomer,
        support: {
          ...mockHealthyCustomer.support,
          satisfactionScore: 15
        }
      };

      const result = validateHealthData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Satisfaction score must be between 1 and 10');
    });

    it('should catch logical inconsistencies', () => {
      const invalidData = {
        ...mockHealthyCustomer,
        support: {
          ...mockHealthyCustomer.support,
          escalatedTickets: 10,
          totalTickets: 5
        }
      };

      const result = validateHealthData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Escalated tickets cannot exceed total tickets');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid data', () => {
      const invalidData = {
        ...mockHealthyCustomer,
        paymentHistory: {
          ...mockHealthyCustomer.paymentHistory,
          totalPayments: -5
        }
      };

      expect(() => {
        calculateHealthScore(invalidData);
      }).toThrow(HealthScoreCalculationError);
    });

    it('should include helpful error messages', () => {
      const invalidData = {
        ...mockHealthyCustomer,
        paymentHistory: {
          ...mockHealthyCustomer.paymentHistory,
          latePayments: 20,
          totalPayments: 5
        }
      };

      try {
        calculateHealthScore(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(HealthScoreCalculationError);
        expect(error.message).toContain('Late payments must be between 0 and total payments');
      }
    });
  });

  describe('Risk Level Classification', () => {
    it('should classify healthy scores correctly', () => {
      expect(determineRiskLevel(85)).toBe('healthy');
      expect(determineRiskLevel(71)).toBe('healthy');
    });

    it('should classify warning scores correctly', () => {
      expect(determineRiskLevel(70)).toBe('warning');
      expect(determineRiskLevel(50)).toBe('warning');
      expect(determineRiskLevel(31)).toBe('warning');
    });

    it('should classify critical scores correctly', () => {
      expect(determineRiskLevel(30)).toBe('critical');
      expect(determineRiskLevel(15)).toBe('critical');
      expect(determineRiskLevel(0)).toBe('critical');
    });

    it('should handle custom thresholds', () => {
      const customConfig = {
        ...DEFAULT_CONFIG,
        riskThresholds: {
          healthyMin: 80,
          warningMin: 40,
          criticalMax: 39
        }
      };

      expect(determineRiskLevel(85, customConfig)).toBe('healthy');
      expect(determineRiskLevel(75, customConfig)).toBe('warning');
      expect(determineRiskLevel(35, customConfig)).toBe('critical');
    });
  });

  describe('Health Score Explanation', () => {
    it('should provide meaningful explanation for healthy customer', () => {
      const result = calculateHealthScore(mockHealthyCustomer);
      const explanation = getHealthScoreExplanation(result);

      expect(explanation).toContain('excellent health with low churn risk');
      expect(explanation).toContain('Primary strength:');
      expect(explanation).toContain('Area for improvement:');
    });

    it('should provide actionable explanation for critical customer', () => {
      const result = calculateHealthScore(mockCriticalCustomer);
      const explanation = getHealthScoreExplanation(result);

      expect(explanation).toContain('high churn risk needing immediate intervention');
      expect(explanation).toMatch(/\d+\/100/); // Contains score format
    });
  });

  describe('Mathematical Accuracy', () => {
    it('should maintain precision in calculations', () => {
      const result = calculateHealthScore(mockHealthyCustomer);

      // Verify no floating point precision errors
      expect(result.overallScore).toBe(Math.floor(result.overallScore));

      // Verify contributions are calculated correctly
      Object.values(result.factorScores).forEach(factor => {
        const expectedContribution = factor.score * factor.weight;
        expect(factor.contribution).toBeCloseTo(expectedContribution, 1);
      });
    });

    it('should handle edge case scores (0 and 100)', () => {
      // Test with minimal values
      const minimalData: CustomerHealthData = {
        ...mockCriticalCustomer,
        paymentHistory: {
          daysSinceLastPayment: 365,
          averagePaymentDelay: 100,
          overdueAmount: 1000000,
          totalPayments: 1,
          latePayments: 1
        }
      };

      const result = calculateHealthScore(minimalData);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance Requirements', () => {
    it('should calculate score within performance threshold', () => {
      const startTime = performance.now();
      calculateHealthScore(mockHealthyCustomer);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // 100ms requirement
    });

    it('should handle multiple calculations efficiently', () => {
      const customers = [mockHealthyCustomer, mockWarningCustomer, mockCriticalCustomer];

      const startTime = performance.now();
      customers.forEach(customer => calculateHealthScore(customer));
      const endTime = performance.now();

      const averageTime = (endTime - startTime) / customers.length;
      expect(averageTime).toBeLessThan(50); // Should be even faster for batch
    });
  });
});
