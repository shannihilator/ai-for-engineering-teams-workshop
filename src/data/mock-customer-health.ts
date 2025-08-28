/**
 * Mock customer health data service for workshop exercises
 * Generates realistic customer health data for comprehensive algorithm testing
 * Correlates with existing customer health scores when possible
 */

import { Customer, mockCustomers } from './mock-customers';

/**
 * Extended customer data interface including detailed health metrics
 * Used by health score calculator for comprehensive customer assessment
 */
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

/**
 * Generates realistic payment history data based on customer health score and subscription tier
 * Correlates payment behavior with overall customer health for consistent mock data
 */
function generatePaymentHistory(customer: Customer): CustomerHealthData['paymentHistory'] {
  const { healthScore, subscriptionTier } = customer;
  
  // Base payment behavior on health score
  let daysSinceLastPayment: number;
  let averagePaymentDelay: number;
  let overdueAmount: number;
  
  if (healthScore >= 71) { // Healthy customers
    daysSinceLastPayment = Math.floor(Math.random() * 15) + 1; // 1-15 days
    averagePaymentDelay = Math.floor(Math.random() * 3); // 0-2 days
    overdueAmount = Math.random() < 0.1 ? Math.floor(Math.random() * 500) : 0; // 10% chance of small overdue
  } else if (healthScore >= 31) { // Warning customers
    daysSinceLastPayment = Math.floor(Math.random() * 45) + 15; // 15-60 days
    averagePaymentDelay = Math.floor(Math.random() * 10) + 3; // 3-12 days
    overdueAmount = Math.random() < 0.4 ? Math.floor(Math.random() * 2000) + 500 : 0; // 40% chance of overdue
  } else { // Critical customers
    daysSinceLastPayment = Math.floor(Math.random() * 60) + 45; // 45-105 days
    averagePaymentDelay = Math.floor(Math.random() * 20) + 10; // 10-30 days
    overdueAmount = Math.random() < 0.8 ? Math.floor(Math.random() * 10000) + 1000 : 0; // 80% chance of significant overdue
  }
  
  // Adjust for subscription tier (enterprise customers tend to be more reliable)
  if (subscriptionTier === 'enterprise') {
    averagePaymentDelay = Math.max(0, averagePaymentDelay - 2);
    overdueAmount = Math.floor(overdueAmount * 0.5);
  } else if (subscriptionTier === 'basic') {
    averagePaymentDelay += 1;
    overdueAmount = Math.floor(overdueAmount * 1.2);
  }
  
  // Calculate payment reliability score based on the metrics
  const reliabilityFactors = [
    Math.max(0, 100 - (daysSinceLastPayment * 2)), // Recency factor
    Math.max(0, 100 - (averagePaymentDelay * 8)), // Delay factor
    overdueAmount > 0 ? Math.max(0, 100 - (overdueAmount / 100)) : 100 // Overdue factor
  ];
  const paymentReliabilityScore = Math.round(reliabilityFactors.reduce((sum, score) => sum + score, 0) / 3);
  
  return {
    daysSinceLastPayment,
    averagePaymentDelay,
    overdueAmount,
    paymentReliabilityScore
  };
}

/**
 * Generates realistic engagement metrics based on customer health score and subscription tier
 * Higher tier customers typically have more active users and features
 */
function generateEngagementMetrics(customer: Customer): CustomerHealthData['engagementMetrics'] {
  const { healthScore, subscriptionTier, createdAt } = customer;
  const accountAge = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 30;
  
  let loginFrequency: number;
  let featureUsageCount: number;
  let activeUserCount: number;
  let daysSinceLastLogin: number;
  
  // Base engagement on health score
  if (healthScore >= 71) { // Healthy customers
    loginFrequency = Math.floor(Math.random() * 20) + 15; // 15-35 logins per month
    featureUsageCount = Math.floor(Math.random() * 15) + 10; // 10-25 features used
    daysSinceLastLogin = Math.floor(Math.random() * 3) + 1; // 1-3 days ago
  } else if (healthScore >= 31) { // Warning customers
    loginFrequency = Math.floor(Math.random() * 10) + 5; // 5-15 logins per month
    featureUsageCount = Math.floor(Math.random() * 8) + 3; // 3-11 features used
    daysSinceLastLogin = Math.floor(Math.random() * 7) + 3; // 3-10 days ago
  } else { // Critical customers
    loginFrequency = Math.floor(Math.random() * 5) + 1; // 1-5 logins per month
    featureUsageCount = Math.floor(Math.random() * 3) + 1; // 1-4 features used
    daysSinceLastLogin = Math.floor(Math.random() * 30) + 10; // 10-40 days ago
  }
  
  // Adjust for subscription tier
  const tierMultiplier = subscriptionTier === 'enterprise' ? 2.5 : subscriptionTier === 'premium' ? 1.5 : 1;
  activeUserCount = Math.floor((Math.floor(Math.random() * 20) + 1) * tierMultiplier);
  featureUsageCount = Math.floor(featureUsageCount * tierMultiplier);
  
  // Generate last login date
  const lastLoginDate = new Date();
  lastLoginDate.setDate(lastLoginDate.getDate() - daysSinceLastLogin);
  
  return {
    loginFrequency,
    featureUsageCount,
    activeUserCount,
    lastLoginDate: lastLoginDate.toISOString()
  };
}

/**
 * Generates contract information based on customer profile and subscription tier
 * Includes realistic contract values and renewal scenarios
 */
function generateContractInformation(customer: Customer): CustomerHealthData['contractInformation'] {
  const { healthScore, subscriptionTier, createdAt } = customer;
  
  // Base contract values on subscription tier
  const baseValues = {
    basic: { min: 1000, max: 5000 },
    premium: { min: 5000, max: 25000 },
    enterprise: { min: 25000, max: 100000 }
  };
  
  const tierValues = baseValues[subscriptionTier || 'basic'];
  const contractValue = Math.floor(Math.random() * (tierValues.max - tierValues.min)) + tierValues.min;
  
  // Generate days until renewal (1-365 days)
  const daysUntilRenewal = Math.floor(Math.random() * 365) + 1;
  
  // Recent upgrades more likely for healthy customers
  let recentUpgrades: boolean;
  if (healthScore >= 71) {
    recentUpgrades = Math.random() < 0.3; // 30% chance
  } else if (healthScore >= 31) {
    recentUpgrades = Math.random() < 0.1; // 10% chance
  } else {
    recentUpgrades = Math.random() < 0.05; // 5% chance
  }
  
  // Calculate renewal probability based on health score and other factors
  let renewalProbability = healthScore;
  
  // Adjust based on contract characteristics
  if (recentUpgrades) renewalProbability += 10;
  if (daysUntilRenewal < 30) renewalProbability -= 5; // Urgency penalty
  if (subscriptionTier === 'enterprise') renewalProbability += 5;
  
  renewalProbability = Math.max(0, Math.min(100, renewalProbability));
  
  return {
    daysUntilRenewal,
    contractValue,
    recentUpgrades,
    renewalProbability
  };
}

/**
 * Generates support data that correlates with customer health score
 * Poor support experience typically correlates with lower health scores
 */
function generateSupportData(customer: Customer): CustomerHealthData['supportData'] {
  const { healthScore, subscriptionTier } = customer;
  
  let averageResolutionTime: number;
  let satisfactionScore: number;
  let escalationCount: number;
  let openTicketCount: number;
  
  if (healthScore >= 71) { // Healthy customers - good support experience
    averageResolutionTime = Math.floor(Math.random() * 8) + 2; // 2-10 hours
    satisfactionScore = Math.floor(Math.random() * 1.5) + 3.5; // 3.5-5.0
    escalationCount = Math.floor(Math.random() * 2); // 0-1 escalations
    openTicketCount = Math.floor(Math.random() * 3); // 0-2 open tickets
  } else if (healthScore >= 31) { // Warning customers - mixed support experience
    averageResolutionTime = Math.floor(Math.random() * 16) + 8; // 8-24 hours
    satisfactionScore = Math.floor(Math.random() * 2) + 2.5; // 2.5-4.5
    escalationCount = Math.floor(Math.random() * 4) + 1; // 1-4 escalations
    openTicketCount = Math.floor(Math.random() * 5) + 2; // 2-6 open tickets
  } else { // Critical customers - poor support experience
    averageResolutionTime = Math.floor(Math.random() * 48) + 24; // 24-72 hours
    satisfactionScore = Math.floor(Math.random() * 2) + 1; // 1.0-3.0
    escalationCount = Math.floor(Math.random() * 6) + 3; // 3-8 escalations
    openTicketCount = Math.floor(Math.random() * 8) + 4; // 4-11 open tickets
  }
  
  // Enterprise customers get priority support
  if (subscriptionTier === 'enterprise') {
    averageResolutionTime = Math.floor(averageResolutionTime * 0.6);
    satisfactionScore = Math.min(5, satisfactionScore + 0.5);
  }
  
  // Round satisfaction score to one decimal place
  satisfactionScore = Math.round(satisfactionScore * 10) / 10;
  
  return {
    averageResolutionTime,
    satisfactionScore,
    escalationCount,
    openTicketCount
  };
}

/**
 * Generates comprehensive customer health data for a single customer
 * Ensures all metrics correlate appropriately with existing health score
 */
export function generateCustomerHealthData(customer: Customer): CustomerHealthData {
  return {
    ...customer,
    paymentHistory: generatePaymentHistory(customer),
    engagementMetrics: generateEngagementMetrics(customer),
    contractInformation: generateContractInformation(customer),
    supportData: generateSupportData(customer)
  };
}

/**
 * Generates health data for all mock customers
 * Creates varied but consistent data across different customer profiles
 */
export function generateAllCustomerHealthData(customers: Customer[] = mockCustomers): CustomerHealthData[] {
  return customers.map(generateCustomerHealthData);
}

/**
 * Creates edge case scenarios for comprehensive testing
 * Includes new customers, missing data, and extreme cases
 */
export function generateEdgeCaseHealthData(): CustomerHealthData[] {
  const edgeCases: Customer[] = [
    // New customer with minimal history
    {
      id: 'new-1',
      name: 'Alex Thompson',
      company: 'Startup Innovations',
      healthScore: 75, // New but promising
      email: 'alex@startupinnovations.io',
      subscriptionTier: 'basic',
      domains: ['startupinnovations.io'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      updatedAt: new Date().toISOString()
    },
    // Customer with missing data scenario
    {
      id: 'missing-1',
      name: 'Jordan Kim',
      company: 'Legacy Systems Inc',
      healthScore: 50,
      email: 'jordan@legacysystems.com',
      subscriptionTier: 'premium',
      domains: ['legacysystems.com'],
      createdAt: '2023-06-01T10:00:00Z',
      updatedAt: '2023-06-01T10:00:00Z'
    },
    // High-value enterprise customer with excellent metrics
    {
      id: 'enterprise-1',
      name: 'Dr. Patricia Williams',
      company: 'MegaCorp International',
      healthScore: 98,
      email: 'patricia.williams@megacorp.global',
      subscriptionTier: 'enterprise',
      domains: ['megacorp.global', 'portal.megacorp.global', 'api.megacorp.global', 'cdn.megacorp.global'],
      createdAt: '2023-01-01T08:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ];
  
  return edgeCases.map(generateCustomerHealthData);
}

/**
 * Comprehensive mock customer health data including all existing customers and edge cases
 * Ready for use in workshop demonstrations and algorithm testing
 */
export const mockCustomerHealthData: CustomerHealthData[] = [
  ...generateAllCustomerHealthData(),
  ...generateEdgeCaseHealthData()
];

/**
 * Utility function to find health data by customer ID
 * Useful for component integration and selective data retrieval
 */
export function getCustomerHealthData(customerId: string): CustomerHealthData | undefined {
  return mockCustomerHealthData.find(customer => customer.id === customerId);
}

/**
 * Utility function to get customers by health score range
 * Useful for testing different risk categories
 */
export function getCustomersByHealthRange(minScore: number, maxScore: number): CustomerHealthData[] {
  return mockCustomerHealthData.filter(customer => 
    customer.healthScore >= minScore && customer.healthScore <= maxScore
  );
}

/**
 * Utility function to get customers by subscription tier
 * Useful for tier-based analysis and testing
 */
export function getCustomersByTier(tier: 'basic' | 'premium' | 'enterprise'): CustomerHealthData[] {
  return mockCustomerHealthData.filter(customer => customer.subscriptionTier === tier);
}

export default mockCustomerHealthData;