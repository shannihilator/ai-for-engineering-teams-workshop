/**
 * Mock health data generator for Customer Health Score Calculator
 * Generates realistic customer health metrics for workshop exercises
 */

import { CustomerHealthData, PaymentMetrics, EngagementMetrics, ContractMetrics, SupportMetrics } from '../types/healthScore';
import { mockCustomers } from './mock-customers';

/**
 * Generates mock payment metrics based on customer health score
 * @param customerId Customer ID
 * @param healthScore Overall health score to influence metrics
 * @returns Realistic payment metrics
 */
function generateMockPaymentMetrics(customerId: string, healthScore: number): PaymentMetrics {
  // Healthy customers have better payment patterns
  if (healthScore >= 71) {
    return {
      daysSinceLastPayment: Math.floor(Math.random() * 15) + 1,
      averagePaymentDelay: Math.floor(Math.random() * 3),
      overdueAmount: Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 1000),
      totalPayments: Math.floor(Math.random() * 20) + 12,
      latePayments: Math.floor(Math.random() * 3)
    };
  }
  // Warning customers have moderate payment issues
  else if (healthScore >= 31) {
    return {
      daysSinceLastPayment: Math.floor(Math.random() * 40) + 20,
      averagePaymentDelay: Math.floor(Math.random() * 15) + 5,
      overdueAmount: Math.floor(Math.random() * 5000) + 1000,
      totalPayments: Math.floor(Math.random() * 15) + 8,
      latePayments: Math.floor(Math.random() * 6) + 2
    };
  }
  // Critical customers have severe payment problems
  else {
    return {
      daysSinceLastPayment: Math.floor(Math.random() * 60) + 45,
      averagePaymentDelay: Math.floor(Math.random() * 30) + 20,
      overdueAmount: Math.floor(Math.random() * 20000) + 5000,
      totalPayments: Math.floor(Math.random() * 10) + 3,
      latePayments: Math.floor(Math.random() * 8) + 3
    };
  }
}

/**
 * Generates mock engagement metrics based on customer health score
 * @param customerId Customer ID
 * @param healthScore Overall health score to influence metrics
 * @returns Realistic engagement metrics
 */
function generateMockEngagementMetrics(customerId: string, healthScore: number): EngagementMetrics {
  // Healthy customers are highly engaged
  if (healthScore >= 71) {
    return {
      loginsLast30Days: Math.floor(Math.random() * 10) + 20,
      featuresUsedLast30Days: Math.floor(Math.random() * 8) + 12,
      averageSessionMinutes: Math.floor(Math.random() * 60) + 30,
      supportTicketsLast90Days: Math.floor(Math.random() * 3),
      totalTimeSpentMinutes: Math.floor(Math.random() * 1800) + 1200 // 20-50 hours
    };
  }
  // Warning customers have moderate engagement
  else if (healthScore >= 31) {
    return {
      loginsLast30Days: Math.floor(Math.random() * 10) + 8,
      featuresUsedLast30Days: Math.floor(Math.random() * 6) + 4,
      averageSessionMinutes: Math.floor(Math.random() * 20) + 10,
      supportTicketsLast90Days: Math.floor(Math.random() * 8) + 4,
      totalTimeSpentMinutes: Math.floor(Math.random() * 600) + 300 // 5-15 hours
    };
  }
  // Critical customers have low engagement
  else {
    return {
      loginsLast30Days: Math.floor(Math.random() * 5) + 1,
      featuresUsedLast30Days: Math.floor(Math.random() * 3) + 1,
      averageSessionMinutes: Math.floor(Math.random() * 10) + 2,
      supportTicketsLast90Days: Math.floor(Math.random() * 15) + 8,
      totalTimeSpentMinutes: Math.floor(Math.random() * 300) + 60 // 1-6 hours
    };
  }
}

/**
 * Generates mock contract metrics based on customer health score
 * @param customerId Customer ID
 * @param healthScore Overall health score to influence metrics
 * @returns Realistic contract metrics
 */
function generateMockContractMetrics(customerId: string, healthScore: number): ContractMetrics {
  // Healthy customers have stable contracts
  if (healthScore >= 71) {
    return {
      daysUntilRenewal: Math.floor(Math.random() * 200) + 120,
      contractValue: Math.floor(Math.random() * 100000) + 25000,
      hasRecentUpgrade: Math.random() < 0.4,
      hasRecentDowngrade: Math.random() < 0.1,
      contractDurationMonths: Math.random() < 0.6 ? 12 : 24,
      renewalHistory: Math.floor(Math.random() * 5) + 1
    };
  }
  // Warning customers have contract concerns
  else if (healthScore >= 31) {
    return {
      daysUntilRenewal: Math.floor(Math.random() * 120) + 30,
      contractValue: Math.floor(Math.random() * 50000) + 10000,
      hasRecentUpgrade: Math.random() < 0.2,
      hasRecentDowngrade: Math.random() < 0.4,
      contractDurationMonths: 12,
      renewalHistory: Math.floor(Math.random() * 3) + 1
    };
  }
  // Critical customers have contract risks
  else {
    return {
      daysUntilRenewal: Math.floor(Math.random() * 60) - 20, // Can be negative (overdue)
      contractValue: Math.floor(Math.random() * 25000) + 5000,
      hasRecentUpgrade: Math.random() < 0.1,
      hasRecentDowngrade: Math.random() < 0.6,
      contractDurationMonths: 12,
      renewalHistory: Math.floor(Math.random() * 2)
    };
  }
}

/**
 * Generates mock support metrics based on customer health score
 * @param customerId Customer ID
 * @param healthScore Overall health score to influence metrics
 * @returns Realistic support metrics
 */
function generateMockSupportMetrics(customerId: string, healthScore: number): SupportMetrics {
  // Healthy customers have good support experiences
  if (healthScore >= 71) {
    const totalTickets = Math.floor(Math.random() * 5) + 1;
    return {
      averageResolutionHours: Math.floor(Math.random() * 12) + 2,
      satisfactionScore: Math.random() * 2 + 7, // 7-9
      escalatedTickets: Math.floor(totalTickets * 0.1),
      totalTickets,
      criticalTickets: Math.floor(totalTickets * 0.1)
    };
  }
  // Warning customers have mixed support experiences
  else if (healthScore >= 31) {
    const totalTickets = Math.floor(Math.random() * 10) + 5;
    return {
      averageResolutionHours: Math.floor(Math.random() * 36) + 12,
      satisfactionScore: Math.random() * 3 + 4, // 4-7
      escalatedTickets: Math.floor(totalTickets * 0.3),
      totalTickets,
      criticalTickets: Math.floor(totalTickets * 0.2)
    };
  }
  // Critical customers have poor support experiences
  else {
    const totalTickets = Math.floor(Math.random() * 15) + 10;
    return {
      averageResolutionHours: Math.floor(Math.random() * 72) + 48,
      satisfactionScore: Math.random() * 3 + 1, // 1-4
      escalatedTickets: Math.floor(totalTickets * 0.5),
      totalTickets,
      criticalTickets: Math.floor(totalTickets * 0.4)
    };
  }
}

/**
 * Generates complete health data for a customer
 * @param customerId Customer ID from mock customers
 * @returns Complete CustomerHealthData object
 */
export function generateCustomerHealthData(customerId: string): CustomerHealthData | null {
  const customer = mockCustomers.find(c => c.id === customerId);
  if (!customer) {
    return null;
  }

  const healthScore = customer.healthScore;

  return {
    customerId,
    paymentHistory: generateMockPaymentMetrics(customerId, healthScore),
    engagement: generateMockEngagementMetrics(customerId, healthScore),
    contract: generateMockContractMetrics(customerId, healthScore),
    support: generateMockSupportMetrics(customerId, healthScore),
    lastUpdated: new Date()
  };
}

/**
 * Generates health data for all mock customers
 * @returns Map of customer ID to health data
 */
export function generateAllCustomerHealthData(): Map<string, CustomerHealthData> {
  const healthDataMap = new Map<string, CustomerHealthData>();

  mockCustomers.forEach(customer => {
    const healthData = generateCustomerHealthData(customer.id);
    if (healthData) {
      healthDataMap.set(customer.id, healthData);
    }
  });

  return healthDataMap;
}

/**
 * Pre-generated health data cache for consistent results during workshop
 */
export const mockHealthDataCache = generateAllCustomerHealthData();
