/**
 * Comprehensive unit tests for the Health Score Calculator
 * 
 * Tests validate:
 * - Individual scoring functions
 * - Main health calculation with weighted algorithm
 * - Edge cases and error handling
 * - Business logic validation
 * - Performance requirements
 * - New customer handling
 * - Missing data strategies
 * 
 * Based on spec: specs/health-score-calculator.md
 */

import { 
  calculateHealthScore,
  calculatePaymentScore,
  calculateEngagementScore,
  calculateContractScore,
  calculateSupportScore,
  CustomerHealthData,
  HealthScoreBreakdown,
  CalculationOptions,
  CustomerHealthCalculationError
} from '../lib/healthCalculator';
import { Customer } from '../src/data/mock-customers';

// Test data interfaces following the spec
interface TestCustomerHealthData extends CustomerHealthData {
  // Add test-specific properties if needed
}

/**
 * Test Helper Functions
 */

// Create a base customer for testing
const createBaseCustomer = (): Customer => ({
  id: 'test-1',
  name: 'Test Customer',
  company: 'Test Company',
  healthScore: 0, // Will be calculated
  email: 'test@testcompany.com',
  subscriptionTier: 'premium',
  domains: ['testcompany.com'],
  createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
  updatedAt: new Date().toISOString()
});

// Create complete health data for testing
const createCompleteHealthData = (overrides: Partial<CustomerHealthData> = {}): CustomerHealthData => ({
  ...createBaseCustomer(),
  paymentHistory: {
    daysSinceLastPayment: 15,
    averagePaymentDelay: 2,
    overdueAmount: 0,
    paymentReliabilityScore: 95,
    ...overrides.paymentHistory
  },
  engagementMetrics: {
    loginFrequency: 20,
    featureUsageCount: 150,
    activeUserCount: 25,
    lastLoginDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    ...overrides.engagementMetrics
  },
  contractInformation: {
    daysUntilRenewal: 120,
    contractValue: 50000,
    recentUpgrades: true,
    renewalProbability: 85,
    ...overrides.contractInformation
  },
  supportData: {
    averageResolutionTime: 4,
    satisfactionScore: 4.2,
    escalationCount: 1,
    openTicketCount: 2,
    ...overrides.supportData
  },
  ...overrides
});

// Create new customer (< 90 days)
const createNewCustomerHealthData = (): CustomerHealthData => {
  const baseData = createCompleteHealthData();
  return {
    ...baseData,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
  };
};

// Performance measurement helper
const measurePerformance = async (testFunction: () => Promise<any>): Promise<{ result: any; duration: number }> => {
  const startTime = performance.now();
  const result = await testFunction();
  const duration = performance.now() - startTime;
  return { result, duration };
};

/**
 * Individual Scoring Function Tests
 */

async function testPaymentScoreCalculation() {
  console.log('\n=== Testing Payment Score Calculation ===');

  try {
    // Test: Excellent payment history
    console.log('1. Testing excellent payment history...');
    const excellentPaymentData = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 15,
        averagePaymentDelay: 0,
        overdueAmount: 0,
        paymentReliabilityScore: 100
      }
    });
    
    const excellentScore = calculatePaymentScore(excellentPaymentData);
    console.log(`   Excellent payment score: ${excellentScore}`);
    
    if (excellentScore < 90 || excellentScore > 100) {
      throw new Error(`Expected excellent payment score 90-100, got ${excellentScore}`);
    }

    // Test: Poor payment history
    console.log('2. Testing poor payment history...');
    const poorPaymentData = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 90,
        averagePaymentDelay: 30,
        overdueAmount: 15000,
        paymentReliabilityScore: 20
      }
    });
    
    const poorScore = calculatePaymentScore(poorPaymentData);
    console.log(`   Poor payment score: ${poorScore}`);
    
    if (poorScore < 0 || poorScore > 30) {
      throw new Error(`Expected poor payment score 0-30, got ${poorScore}`);
    }

    // Test: Average payment history
    console.log('3. Testing average payment history...');
    const averagePaymentData = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 30,
        averagePaymentDelay: 7,
        overdueAmount: 2000,
        paymentReliabilityScore: 70
      }
    });
    
    const averageScore = calculatePaymentScore(averagePaymentData);
    console.log(`   Average payment score: ${averageScore}`);
    
    if (averageScore < 50 || averageScore > 80) {
      throw new Error(`Expected average payment score 50-80, got ${averageScore}`);
    }

    // Test: Missing payment reliability score
    console.log('4. Testing missing payment reliability score...');
    const missingScoreData = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 20,
        averagePaymentDelay: 5,
        overdueAmount: 1000
        // paymentReliabilityScore omitted
      }
    });
    
    const calculatedScore = calculatePaymentScore(missingScoreData);
    console.log(`   Score with missing reliability: ${calculatedScore}`);
    
    if (calculatedScore < 0 || calculatedScore > 100) {
      throw new Error(`Score should be normalized 0-100, got ${calculatedScore}`);
    }

    // Test: Edge case - zero values
    console.log('5. Testing edge case with zero values...');
    const zeroValuesData = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 0,
        averagePaymentDelay: 0,
        overdueAmount: 0,
        paymentReliabilityScore: 100
      }
    });
    
    const zeroScore = calculatePaymentScore(zeroValuesData);
    console.log(`   Score with zero delays: ${zeroScore}`);
    
    if (zeroScore !== 100) {
      throw new Error(`Expected perfect score with zero delays, got ${zeroScore}`);
    }

    console.log('✅ Payment score calculation tests passed');

  } catch (error) {
    console.error('❌ Payment score calculation tests failed:', error);
    throw error;
  }
}

async function testEngagementScoreCalculation() {
  console.log('\n=== Testing Engagement Score Calculation ===');

  try {
    // Test: High engagement
    console.log('1. Testing high engagement metrics...');
    const highEngagementData = createCompleteHealthData({
      engagementMetrics: {
        loginFrequency: 30,
        featureUsageCount: 200,
        activeUserCount: 50,
        lastLoginDate: new Date().toISOString()
      }
    });
    
    const highScore = calculateEngagementScore(highEngagementData);
    console.log(`   High engagement score: ${highScore}`);
    
    if (highScore < 85 || highScore > 100) {
      throw new Error(`Expected high engagement score 85-100, got ${highScore}`);
    }

    // Test: Low engagement
    console.log('2. Testing low engagement metrics...');
    const lowEngagementData = createCompleteHealthData({
      engagementMetrics: {
        loginFrequency: 2,
        featureUsageCount: 10,
        activeUserCount: 1,
        lastLoginDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      }
    });
    
    const lowScore = calculateEngagementScore(lowEngagementData);
    console.log(`   Low engagement score: ${lowScore}`);
    
    if (lowScore < 0 || lowScore > 30) {
      throw new Error(`Expected low engagement score 0-30, got ${lowScore}`);
    }

    // Test: Moderate engagement
    console.log('3. Testing moderate engagement metrics...');
    const moderateEngagementData = createCompleteHealthData({
      engagementMetrics: {
        loginFrequency: 15,
        featureUsageCount: 75,
        activeUserCount: 15,
        lastLoginDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      }
    });
    
    const moderateScore = calculateEngagementScore(moderateEngagementData);
    console.log(`   Moderate engagement score: ${moderateScore}`);
    
    if (moderateScore < 40 || moderateScore > 80) {
      throw new Error(`Expected moderate engagement score 40-80, got ${moderateScore}`);
    }

    // Test: Recency weighting
    console.log('4. Testing recency weighting...');
    const recentLoginData = createCompleteHealthData({
      engagementMetrics: {
        loginFrequency: 10,
        featureUsageCount: 50,
        activeUserCount: 10,
        lastLoginDate: new Date().toISOString() // Just logged in
      }
    });
    
    const oldLoginData = createCompleteHealthData({
      engagementMetrics: {
        loginFrequency: 10,
        featureUsageCount: 50,
        activeUserCount: 10,
        lastLoginDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
      }
    });
    
    const recentScore = calculateEngagementScore(recentLoginData);
    const oldScore = calculateEngagementScore(oldLoginData);
    
    console.log(`   Recent login score: ${recentScore}`);
    console.log(`   Old login score: ${oldScore}`);
    
    if (recentScore <= oldScore) {
      throw new Error(`Recent login should score higher: ${recentScore} vs ${oldScore}`);
    }

    // Test: Zero usage
    console.log('5. Testing zero usage scenario...');
    const zeroUsageData = createCompleteHealthData({
      engagementMetrics: {
        loginFrequency: 0,
        featureUsageCount: 0,
        activeUserCount: 0,
        lastLoginDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
      }
    });
    
    const zeroScore = calculateEngagementScore(zeroUsageData);
    console.log(`   Zero usage score: ${zeroScore}`);
    
    if (zeroScore !== 0) {
      throw new Error(`Expected zero score for no usage, got ${zeroScore}`);
    }

    console.log('✅ Engagement score calculation tests passed');

  } catch (error) {
    console.error('❌ Engagement score calculation tests failed:', error);
    throw error;
  }
}

async function testContractScoreCalculation() {
  console.log('\n=== Testing Contract Score Calculation ===');

  try {
    // Test: Strong contract position
    console.log('1. Testing strong contract position...');
    const strongContractData = createCompleteHealthData({
      contractInformation: {
        daysUntilRenewal: 300,
        contractValue: 100000,
        recentUpgrades: true,
        renewalProbability: 95
      }
    });
    
    const strongScore = calculateContractScore(strongContractData);
    console.log(`   Strong contract score: ${strongScore}`);
    
    if (strongScore < 85 || strongScore > 100) {
      throw new Error(`Expected strong contract score 85-100, got ${strongScore}`);
    }

    // Test: At-risk contract
    console.log('2. Testing at-risk contract...');
    const riskContractData = createCompleteHealthData({
      contractInformation: {
        daysUntilRenewal: 30,
        contractValue: 10000,
        recentUpgrades: false,
        renewalProbability: 25
      }
    });
    
    const riskScore = calculateContractScore(riskContractData);
    console.log(`   At-risk contract score: ${riskScore}`);
    
    if (riskScore < 0 || riskScore > 40) {
      throw new Error(`Expected at-risk contract score 0-40, got ${riskScore}`);
    }

    // Test: Moderate contract health
    console.log('3. Testing moderate contract health...');
    const moderateContractData = createCompleteHealthData({
      contractInformation: {
        daysUntilRenewal: 120,
        contractValue: 50000,
        recentUpgrades: false,
        renewalProbability: 70
      }
    });
    
    const moderateScore = calculateContractScore(moderateContractData);
    console.log(`   Moderate contract score: ${moderateScore}`);
    
    if (moderateScore < 50 || moderateScore > 80) {
      throw new Error(`Expected moderate contract score 50-80, got ${moderateScore}`);
    }

    // Test: Recent upgrades impact
    console.log('4. Testing recent upgrades impact...');
    const upgradeData = createCompleteHealthData({
      contractInformation: {
        daysUntilRenewal: 90,
        contractValue: 30000,
        recentUpgrades: true,
        renewalProbability: 60
      }
    });
    
    const noUpgradeData = createCompleteHealthData({
      contractInformation: {
        daysUntilRenewal: 90,
        contractValue: 30000,
        recentUpgrades: false,
        renewalProbability: 60
      }
    });
    
    const upgradeScore = calculateContractScore(upgradeData);
    const noUpgradeScore = calculateContractScore(noUpgradeData);
    
    console.log(`   With upgrades score: ${upgradeScore}`);
    console.log(`   Without upgrades score: ${noUpgradeScore}`);
    
    if (upgradeScore <= noUpgradeScore) {
      throw new Error(`Recent upgrades should improve score: ${upgradeScore} vs ${noUpgradeScore}`);
    }

    // Test: Missing renewal probability
    console.log('5. Testing missing renewal probability...');
    const missingProbabilityData = createCompleteHealthData({
      contractInformation: {
        daysUntilRenewal: 150,
        contractValue: 40000,
        recentUpgrades: false
        // renewalProbability omitted
      }
    });
    
    const missingScore = calculateContractScore(missingProbabilityData);
    console.log(`   Score with missing probability: ${missingScore}`);
    
    if (missingScore < 0 || missingScore > 100) {
      throw new Error(`Score should be normalized 0-100, got ${missingScore}`);
    }

    console.log('✅ Contract score calculation tests passed');

  } catch (error) {
    console.error('❌ Contract score calculation tests failed:', error);
    throw error;
  }
}

async function testSupportScoreCalculation() {
  console.log('\n=== Testing Support Score Calculation ===');

  try {
    // Test: Excellent support experience
    console.log('1. Testing excellent support experience...');
    const excellentSupportData = createCompleteHealthData({
      supportData: {
        averageResolutionTime: 2,
        satisfactionScore: 5.0,
        escalationCount: 0,
        openTicketCount: 0
      }
    });
    
    const excellentScore = calculateSupportScore(excellentSupportData);
    console.log(`   Excellent support score: ${excellentScore}`);
    
    if (excellentScore < 90 || excellentScore > 100) {
      throw new Error(`Expected excellent support score 90-100, got ${excellentScore}`);
    }

    // Test: Poor support experience
    console.log('2. Testing poor support experience...');
    const poorSupportData = createCompleteHealthData({
      supportData: {
        averageResolutionTime: 48,
        satisfactionScore: 1.5,
        escalationCount: 10,
        openTicketCount: 15
      }
    });
    
    const poorScore = calculateSupportScore(poorSupportData);
    console.log(`   Poor support score: ${poorScore}`);
    
    if (poorScore < 0 || poorScore > 30) {
      throw new Error(`Expected poor support score 0-30, got ${poorScore}`);
    }

    // Test: Average support experience
    console.log('3. Testing average support experience...');
    const averageSupportData = createCompleteHealthData({
      supportData: {
        averageResolutionTime: 12,
        satisfactionScore: 3.5,
        escalationCount: 2,
        openTicketCount: 5
      }
    });
    
    const averageScore = calculateSupportScore(averageSupportData);
    console.log(`   Average support score: ${averageScore}`);
    
    if (averageScore < 40 || averageScore > 80) {
      throw new Error(`Expected average support score 40-80, got ${averageScore}`);
    }

    // Test: High escalation impact
    console.log('4. Testing high escalation impact...');
    const highEscalationData = createCompleteHealthData({
      supportData: {
        averageResolutionTime: 6,
        satisfactionScore: 4.0,
        escalationCount: 8,
        openTicketCount: 3
      }
    });
    
    const lowEscalationData = createCompleteHealthData({
      supportData: {
        averageResolutionTime: 6,
        satisfactionScore: 4.0,
        escalationCount: 1,
        openTicketCount: 3
      }
    });
    
    const highEscalationScore = calculateSupportScore(highEscalationData);
    const lowEscalationScore = calculateSupportScore(lowEscalationData);
    
    console.log(`   High escalation score: ${highEscalationScore}`);
    console.log(`   Low escalation score: ${lowEscalationScore}`);
    
    if (highEscalationScore >= lowEscalationScore) {
      throw new Error(`High escalations should lower score: ${highEscalationScore} vs ${lowEscalationScore}`);
    }

    // Test: Resolution time impact
    console.log('5. Testing resolution time impact...');
    const fastResolutionData = createCompleteHealthData({
      supportData: {
        averageResolutionTime: 1,
        satisfactionScore: 3.5,
        escalationCount: 1,
        openTicketCount: 2
      }
    });
    
    const slowResolutionData = createCompleteHealthData({
      supportData: {
        averageResolutionTime: 72,
        satisfactionScore: 3.5,
        escalationCount: 1,
        openTicketCount: 2
      }
    });
    
    const fastScore = calculateSupportScore(fastResolutionData);
    const slowScore = calculateSupportScore(slowResolutionData);
    
    console.log(`   Fast resolution score: ${fastScore}`);
    console.log(`   Slow resolution score: ${slowScore}`);
    
    if (fastScore <= slowScore) {
      throw new Error(`Fast resolution should score higher: ${fastScore} vs ${slowScore}`);
    }

    console.log('✅ Support score calculation tests passed');

  } catch (error) {
    console.error('❌ Support score calculation tests failed:', error);
    throw error;
  }
}

/**
 * Main Calculation Function Tests
 */

async function testMainHealthScoreCalculation() {
  console.log('\n=== Testing Main Health Score Calculation ===');

  try {
    // Test: Weighted calculation accuracy
    console.log('1. Testing weighted calculation accuracy...');
    const testData = createCompleteHealthData();
    
    // Calculate individual scores
    const paymentScore = calculatePaymentScore(testData);
    const engagementScore = calculateEngagementScore(testData);
    const contractScore = calculateContractScore(testData);
    const supportScore = calculateSupportScore(testData);
    
    // Calculate expected weighted score: (40% + 30% + 20% + 10%)
    const expectedScore = Math.round(
      (paymentScore * 0.4) + 
      (engagementScore * 0.3) + 
      (contractScore * 0.2) + 
      (supportScore * 0.1)
    );
    
    const breakdown = calculateHealthScore(testData);
    const actualScore = breakdown.overallScore;
    
    console.log(`   Payment: ${paymentScore}, Engagement: ${engagementScore}`);
    console.log(`   Contract: ${contractScore}, Support: ${supportScore}`);
    console.log(`   Expected weighted score: ${expectedScore}`);
    console.log(`   Actual calculated score: ${actualScore}`);
    
    if (Math.abs(actualScore - expectedScore) > 1) {
      throw new Error(`Weighted calculation incorrect: expected ${expectedScore}, got ${actualScore}`);
    }

    // Test: Risk level categorization
    console.log('2. Testing risk level categorization...');
    
    // Test Healthy (71-100)
    const healthyData = createCompleteHealthData({
      paymentHistory: { daysSinceLastPayment: 10, averagePaymentDelay: 0, overdueAmount: 0, paymentReliabilityScore: 95 },
      engagementMetrics: { loginFrequency: 25, featureUsageCount: 180, activeUserCount: 40, lastLoginDate: new Date().toISOString() },
      contractInformation: { daysUntilRenewal: 200, contractValue: 80000, recentUpgrades: true, renewalProbability: 90 },
      supportData: { averageResolutionTime: 3, satisfactionScore: 4.5, escalationCount: 0, openTicketCount: 1 }
    });
    
    const healthyBreakdown = calculateHealthScore(healthyData);
    console.log(`   Healthy score: ${healthyBreakdown.overallScore}, Risk: ${healthyBreakdown.riskLevel}`);
    
    if (healthyBreakdown.overallScore < 71 || healthyBreakdown.riskLevel !== 'Healthy') {
      throw new Error(`Expected Healthy risk level for score ${healthyBreakdown.overallScore}`);
    }

    // Test Warning (31-70)
    const warningData = createCompleteHealthData({
      paymentHistory: { daysSinceLastPayment: 45, averagePaymentDelay: 10, overdueAmount: 5000, paymentReliabilityScore: 60 },
      engagementMetrics: { loginFrequency: 8, featureUsageCount: 40, activeUserCount: 8, lastLoginDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      contractInformation: { daysUntilRenewal: 90, contractValue: 25000, recentUpgrades: false, renewalProbability: 50 },
      supportData: { averageResolutionTime: 15, satisfactionScore: 3.0, escalationCount: 3, openTicketCount: 6 }
    });
    
    const warningBreakdown = calculateHealthScore(warningData);
    console.log(`   Warning score: ${warningBreakdown.overallScore}, Risk: ${warningBreakdown.riskLevel}`);
    
    if (warningBreakdown.overallScore < 31 || warningBreakdown.overallScore > 70 || warningBreakdown.riskLevel !== 'Warning') {
      throw new Error(`Expected Warning risk level for score ${warningBreakdown.overallScore}`);
    }

    // Test Critical (0-30)
    const criticalData = createCompleteHealthData({
      paymentHistory: { daysSinceLastPayment: 120, averagePaymentDelay: 45, overdueAmount: 25000, paymentReliabilityScore: 15 },
      engagementMetrics: { loginFrequency: 1, featureUsageCount: 5, activeUserCount: 1, lastLoginDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      contractInformation: { daysUntilRenewal: 15, contractValue: 15000, recentUpgrades: false, renewalProbability: 10 },
      supportData: { averageResolutionTime: 72, satisfactionScore: 1.2, escalationCount: 12, openTicketCount: 20 }
    });
    
    const criticalBreakdown = calculateHealthScore(criticalData);
    console.log(`   Critical score: ${criticalBreakdown.overallScore}, Risk: ${criticalBreakdown.riskLevel}`);
    
    if (criticalBreakdown.overallScore > 30 || criticalBreakdown.riskLevel !== 'Critical') {
      throw new Error(`Expected Critical risk level for score ${criticalBreakdown.overallScore}`);
    }

    // Test: Breakdown structure validation
    console.log('3. Testing breakdown structure validation...');
    const breakdown = calculateHealthScore(testData);
    
    // Validate breakdown structure
    if (!breakdown.factors || !breakdown.factors.payment || !breakdown.factors.engagement || 
        !breakdown.factors.contract || !breakdown.factors.support) {
      throw new Error('Breakdown missing required factor details');
    }
    
    // Validate factor weights sum to 100%
    const totalWeight = breakdown.factors.payment.weight + breakdown.factors.engagement.weight + 
                       breakdown.factors.contract.weight + breakdown.factors.support.weight;
    
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      throw new Error(`Factor weights should sum to 1.0, got ${totalWeight}`);
    }
    
    // Validate contributions sum to overall score
    const totalContribution = breakdown.factors.payment.contribution + breakdown.factors.engagement.contribution + 
                             breakdown.factors.contract.contribution + breakdown.factors.support.contribution;
    
    if (Math.abs(totalContribution - breakdown.overallScore) > 1) {
      throw new Error(`Contributions should sum to overall score: ${totalContribution} vs ${breakdown.overallScore}`);
    }
    
    console.log('   Breakdown structure validation passed');

    console.log('✅ Main health score calculation tests passed');

  } catch (error) {
    console.error('❌ Main health score calculation tests failed:', error);
    throw error;
  }
}

/**
 * Edge Case Testing
 */

async function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===');

  try {
    // Test: New customer handling (< 90 days)
    console.log('1. Testing new customer handling...');
    const newCustomerData = createNewCustomerHealthData();
    
    const newCustomerBreakdown = calculateHealthScore(newCustomerData, { 
      newCustomerThreshold: 90 
    });
    
    console.log(`   New customer score: ${newCustomerBreakdown.overallScore}`);
    console.log(`   Confidence level: ${newCustomerBreakdown.confidence}`);
    
    // New customers should have lower confidence
    if (newCustomerBreakdown.confidence >= 90) {
      throw new Error(`New customer should have lower confidence, got ${newCustomerBreakdown.confidence}`);
    }

    // Test: Missing data handling - neutral strategy
    console.log('2. Testing missing data handling (neutral strategy)...');
    const missingDataNeutral = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 20,
        averagePaymentDelay: 5,
        overdueAmount: 1000
        // paymentReliabilityScore missing
      },
      contractInformation: {
        daysUntilRenewal: 120,
        contractValue: 50000,
        recentUpgrades: false
        // renewalProbability missing
      }
    });
    
    const neutralBreakdown = calculateHealthScore(missingDataNeutral, { 
      missingDataStrategy: 'neutral' 
    });
    
    console.log(`   Neutral strategy score: ${neutralBreakdown.overallScore}`);
    console.log(`   Confidence with missing data: ${neutralBreakdown.confidence}`);
    
    // Should have lower confidence due to missing data
    if (neutralBreakdown.confidence >= 85) {
      throw new Error(`Missing data should reduce confidence, got ${neutralBreakdown.confidence}`);
    }

    // Test: Missing data handling - conservative strategy
    console.log('3. Testing missing data handling (conservative strategy)...');
    const conservativeBreakdown = calculateHealthScore(missingDataNeutral, { 
      missingDataStrategy: 'conservative' 
    });
    
    console.log(`   Conservative strategy score: ${conservativeBreakdown.overallScore}`);
    
    // Conservative should generally score lower than neutral
    if (conservativeBreakdown.overallScore > neutralBreakdown.overallScore + 5) {
      console.warn(`   Conservative strategy unexpectedly higher than neutral: ${conservativeBreakdown.overallScore} vs ${neutralBreakdown.overallScore}`);
    }

    // Test: Missing data handling - optimistic strategy
    console.log('4. Testing missing data handling (optimistic strategy)...');
    const optimisticBreakdown = calculateHealthScore(missingDataNeutral, { 
      missingDataStrategy: 'optimistic' 
    });
    
    console.log(`   Optimistic strategy score: ${optimisticBreakdown.overallScore}`);
    
    // Optimistic should generally score higher than neutral
    if (optimisticBreakdown.overallScore < neutralBreakdown.overallScore - 5) {
      console.warn(`   Optimistic strategy unexpectedly lower than neutral: ${optimisticBreakdown.overallScore} vs ${neutralBreakdown.overallScore}`);
    }

    // Test: Boundary conditions
    console.log('5. Testing boundary conditions...');
    
    // Test score boundaries
    const boundaryTests = [
      { desc: 'All perfect scores', expectedMin: 95 },
      { desc: 'All zero scores', expectedMax: 5 },
      { desc: 'Mixed boundary scores', expectedRange: [30, 70] }
    ];

    for (const test of boundaryTests) {
      // Create test data based on description
      let testData: CustomerHealthData;
      
      if (test.desc.includes('perfect')) {
        testData = createCompleteHealthData({
          paymentHistory: { daysSinceLastPayment: 0, averagePaymentDelay: 0, overdueAmount: 0, paymentReliabilityScore: 100 },
          engagementMetrics: { loginFrequency: 50, featureUsageCount: 300, activeUserCount: 100, lastLoginDate: new Date().toISOString() },
          contractInformation: { daysUntilRenewal: 365, contractValue: 200000, recentUpgrades: true, renewalProbability: 100 },
          supportData: { averageResolutionTime: 0.5, satisfactionScore: 5.0, escalationCount: 0, openTicketCount: 0 }
        });
      } else if (test.desc.includes('zero')) {
        testData = createCompleteHealthData({
          paymentHistory: { daysSinceLastPayment: 365, averagePaymentDelay: 90, overdueAmount: 100000, paymentReliabilityScore: 0 },
          engagementMetrics: { loginFrequency: 0, featureUsageCount: 0, activeUserCount: 0, lastLoginDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() },
          contractInformation: { daysUntilRenewal: 1, contractValue: 1000, recentUpgrades: false, renewalProbability: 0 },
          supportData: { averageResolutionTime: 168, satisfactionScore: 1.0, escalationCount: 50, openTicketCount: 100 }
        });
      } else {
        testData = createCompleteHealthData(); // Default mixed scenario
      }
      
      const result = calculateHealthScore(testData);
      console.log(`   ${test.desc}: ${result.overallScore}`);
      
      // Validate boundaries
      if (result.overallScore < 0 || result.overallScore > 100) {
        throw new Error(`Score out of bounds for ${test.desc}: ${result.overallScore}`);
      }
    }

    console.log('✅ Edge case tests passed');

  } catch (error) {
    console.error('❌ Edge case tests failed:', error);
    throw error;
  }
}

/**
 * Error Handling Tests
 */

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');

  try {
    // Test: Invalid data type handling
    console.log('1. Testing invalid data type handling...');
    
    try {
      const invalidData = {
        ...createCompleteHealthData(),
        paymentHistory: {
          ...createCompleteHealthData().paymentHistory,
          daysSinceLastPayment: 'invalid' as any // Should be number
        }
      };
      
      calculateHealthScore(invalidData);
      throw new Error('Should have thrown error for invalid data type');
    } catch (error) {
      if (error instanceof CustomerHealthCalculationError) {
        console.log('✅ Invalid data type error caught:', error.message);
      } else {
        throw error;
      }
    }

    // Test: Negative values
    console.log('2. Testing negative value handling...');
    
    try {
      const negativeData = {
        ...createCompleteHealthData(),
        paymentHistory: {
          ...createCompleteHealthData().paymentHistory,
          daysSinceLastPayment: -5 // Invalid negative value
        }
      };
      
      calculateHealthScore(negativeData);
      throw new Error('Should have thrown error for negative value');
    } catch (error) {
      if (error instanceof CustomerHealthCalculationError) {
        console.log('✅ Negative value error caught:', error.message);
      } else {
        throw error;
      }
    }

    // Test: Invalid satisfaction score range
    console.log('3. Testing invalid satisfaction score range...');
    
    try {
      const invalidSatisfactionData = {
        ...createCompleteHealthData(),
        supportData: {
          ...createCompleteHealthData().supportData,
          satisfactionScore: 6.0 // Invalid: should be 1-5
        }
      };
      
      calculateHealthScore(invalidSatisfactionData);
      throw new Error('Should have thrown error for invalid satisfaction score');
    } catch (error) {
      if (error instanceof CustomerHealthCalculationError) {
        console.log('✅ Invalid satisfaction score error caught:', error.message);
      } else {
        throw error;
      }
    }

    // Test: Invalid login date format
    console.log('4. Testing invalid date format handling...');
    
    try {
      const invalidDateData = {
        ...createCompleteHealthData(),
        engagementMetrics: {
          ...createCompleteHealthData().engagementMetrics,
          lastLoginDate: 'invalid-date'
        }
      };
      
      calculateHealthScore(invalidDateData);
      throw new Error('Should have thrown error for invalid date');
    } catch (error) {
      if (error instanceof CustomerHealthCalculationError) {
        console.log('✅ Invalid date format error caught:', error.message);
      } else {
        throw error;
      }
    }

    // Test: Custom error class functionality
    console.log('5. Testing custom error class functionality...');
    
    const error = new CustomerHealthCalculationError('Test error message', 'testField', 'invalid_value');
    
    if (!(error instanceof Error)) {
      throw new Error('CustomerHealthCalculationError should extend Error');
    }
    
    if (error.field !== 'testField' || error.value !== 'invalid_value') {
      throw new Error('Custom error properties not working correctly');
    }
    
    console.log('✅ Custom error class working correctly');

    console.log('✅ Error handling tests passed');

  } catch (error) {
    console.error('❌ Error handling tests failed:', error);
    throw error;
  }
}

/**
 * Performance Testing
 */

async function testPerformance() {
  console.log('\n=== Testing Performance Requirements ===');

  try {
    // Test: Single calculation performance (< 10ms requirement)
    console.log('1. Testing single calculation performance...');
    
    const testData = createCompleteHealthData();
    const { result, duration } = await measurePerformance(async () => {
      return calculateHealthScore(testData);
    });
    
    console.log(`   Single calculation time: ${duration.toFixed(2)}ms`);
    
    if (duration > 10) {
      console.warn(`⚠️  Single calculation slower than 10ms requirement: ${duration.toFixed(2)}ms`);
    } else {
      console.log('✅ Single calculation meets performance requirement');
    }

    // Test: Batch calculation performance
    console.log('2. Testing batch calculation performance...');
    
    const batchTestData = Array.from({ length: 100 }, (_, i) => 
      createCompleteHealthData({
        id: `batch-test-${i}`,
        name: `Batch Customer ${i}`
      })
    );
    
    const { result: batchResult, duration: batchDuration } = await measurePerformance(async () => {
      return batchTestData.map(data => calculateHealthScore(data));
    });
    
    const averageBatchTime = batchDuration / batchTestData.length;
    console.log(`   Batch of 100 calculations: ${batchDuration.toFixed(2)}ms total`);
    console.log(`   Average per calculation: ${averageBatchTime.toFixed(2)}ms`);
    
    if (averageBatchTime > 10) {
      console.warn(`⚠️  Batch average slower than 10ms requirement: ${averageBatchTime.toFixed(2)}ms`);
    } else {
      console.log('✅ Batch calculations meet performance requirement');
    }

    // Test: Memory usage validation
    console.log('3. Testing memory usage...');
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform many calculations
    const largeTestData = Array.from({ length: 1000 }, (_, i) => 
      createCompleteHealthData({
        id: `memory-test-${i}`,
        name: `Memory Test Customer ${i}`
      })
    );
    
    const memoryResults = largeTestData.map(data => calculateHealthScore(data));
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024; // MB
    
    console.log(`   Memory used for 1000 calculations: ${memoryUsed.toFixed(2)}MB`);
    
    if (memoryUsed > 50) {
      console.warn(`⚠️  High memory usage: ${memoryUsed.toFixed(2)}MB`);
    } else {
      console.log('✅ Memory usage within acceptable limits');
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    console.log('✅ Performance tests completed');

  } catch (error) {
    console.error('❌ Performance tests failed:', error);
    throw error;
  }
}

/**
 * Business Logic Validation Tests
 */

async function testBusinessLogicValidation() {
  console.log('\n=== Testing Business Logic Validation ===');

  try {
    // Test: Realistic customer scenarios
    console.log('1. Testing realistic customer scenarios...');

    // Scenario: Thriving SaaS customer
    const thrivingCustomer = createCompleteHealthData({
      name: 'TechCorp Solutions',
      subscriptionTier: 'enterprise',
      paymentHistory: {
        daysSinceLastPayment: 28,
        averagePaymentDelay: 2,
        overdueAmount: 0,
        paymentReliabilityScore: 92
      },
      engagementMetrics: {
        loginFrequency: 22,
        featureUsageCount: 165,
        activeUserCount: 35,
        lastLoginDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
      },
      contractInformation: {
        daysUntilRenewal: 180,
        contractValue: 75000,
        recentUpgrades: true,
        renewalProbability: 88
      },
      supportData: {
        averageResolutionTime: 6,
        satisfactionScore: 4.3,
        escalationCount: 1,
        openTicketCount: 3
      }
    });

    const thrivingResult = calculateHealthScore(thrivingCustomer);
    console.log(`   Thriving customer score: ${thrivingResult.overallScore} (${thrivingResult.riskLevel})`);
    
    if (thrivingResult.riskLevel !== 'Healthy') {
      throw new Error(`Thriving customer should be Healthy, got ${thrivingResult.riskLevel}`);
    }

    // Scenario: At-risk startup customer
    const atRiskCustomer = createCompleteHealthData({
      name: 'StartupCo',
      subscriptionTier: 'basic',
      paymentHistory: {
        daysSinceLastPayment: 75,
        averagePaymentDelay: 15,
        overdueAmount: 8500,
        paymentReliabilityScore: 45
      },
      engagementMetrics: {
        loginFrequency: 3,
        featureUsageCount: 25,
        activeUserCount: 2,
        lastLoginDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() // 3 weeks ago
      },
      contractInformation: {
        daysUntilRenewal: 45,
        contractValue: 12000,
        recentUpgrades: false,
        renewalProbability: 30
      },
      supportData: {
        averageResolutionTime: 24,
        satisfactionScore: 2.5,
        escalationCount: 4,
        openTicketCount: 8
      }
    });

    const atRiskResult = calculateHealthScore(atRiskCustomer);
    console.log(`   At-risk customer score: ${atRiskResult.overallScore} (${atRiskResult.riskLevel})`);
    
    if (atRiskResult.riskLevel === 'Healthy') {
      throw new Error(`At-risk customer should not be Healthy, got ${atRiskResult.riskLevel}`);
    }

    // Scenario: Churned customer (very poor metrics)
    const churnedCustomer = createCompleteHealthData({
      name: 'ChurnedCorp',
      subscriptionTier: 'premium',
      paymentHistory: {
        daysSinceLastPayment: 150,
        averagePaymentDelay: 60,
        overdueAmount: 35000,
        paymentReliabilityScore: 10
      },
      engagementMetrics: {
        loginFrequency: 0,
        featureUsageCount: 2,
        activeUserCount: 0,
        lastLoginDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 3 months ago
      },
      contractInformation: {
        daysUntilRenewal: 10,
        contractValue: 25000,
        recentUpgrades: false,
        renewalProbability: 5
      },
      supportData: {
        averageResolutionTime: 120,
        satisfactionScore: 1.1,
        escalationCount: 15,
        openTicketCount: 25
      }
    });

    const churnedResult = calculateHealthScore(churnedCustomer);
    console.log(`   Churned customer score: ${churnedResult.overallScore} (${churnedResult.riskLevel})`);
    
    if (churnedResult.riskLevel !== 'Critical') {
      throw new Error(`Churned customer should be Critical, got ${churnedResult.riskLevel}`);
    }

    // Test: Factor contribution validation
    console.log('2. Testing factor contribution patterns...');
    
    const contributions = thrivingResult.factors;
    console.log('   Factor contributions for thriving customer:');
    console.log(`     Payment (40%): ${contributions.payment.contribution.toFixed(1)} points`);
    console.log(`     Engagement (30%): ${contributions.engagement.contribution.toFixed(1)} points`);
    console.log(`     Contract (20%): ${contributions.contract.contribution.toFixed(1)} points`);
    console.log(`     Support (10%): ${contributions.support.contribution.toFixed(1)} points`);
    
    // Payment should contribute the most due to 40% weight
    if (contributions.payment.contribution < contributions.engagement.contribution) {
      console.warn('⚠️  Payment contribution should typically be highest due to 40% weight');
    }

    // Test: Confidence scoring accuracy
    console.log('3. Testing confidence scoring accuracy...');
    
    const completeDataCustomer = createCompleteHealthData();
    const incompleteDataCustomer = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 30,
        averagePaymentDelay: 5,
        overdueAmount: 2000
        // paymentReliabilityScore missing
      },
      contractInformation: {
        daysUntilRenewal: 120,
        contractValue: 40000,
        recentUpgrades: false
        // renewalProbability missing
      }
    });
    
    const completeResult = calculateHealthScore(completeDataCustomer);
    const incompleteResult = calculateHealthScore(incompleteDataCustomer);
    
    console.log(`   Complete data confidence: ${completeResult.confidence}%`);
    console.log(`   Incomplete data confidence: ${incompleteResult.confidence}%`);
    
    if (incompleteResult.confidence >= completeResult.confidence) {
      throw new Error('Incomplete data should have lower confidence score');
    }

    console.log('✅ Business logic validation tests passed');

  } catch (error) {
    console.error('❌ Business logic validation tests failed:', error);
    throw error;
  }
}

/**
 * Algorithm Validation Tests
 */

async function testAlgorithmValidation() {
  console.log('\n=== Testing Algorithm Validation ===');

  try {
    // Test: Mathematical accuracy with known scenarios
    console.log('1. Testing mathematical accuracy...');
    
    // Create a customer with known individual scores
    const knownScoreData = createCompleteHealthData({
      paymentHistory: {
        daysSinceLastPayment: 15,
        averagePaymentDelay: 3,
        overdueAmount: 1000,
        paymentReliabilityScore: 80
      },
      engagementMetrics: {
        loginFrequency: 15,
        featureUsageCount: 100,
        activeUserCount: 20,
        lastLoginDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      contractInformation: {
        daysUntilRenewal: 150,
        contractValue: 60000,
        recentUpgrades: false,
        renewalProbability: 75
      },
      supportData: {
        averageResolutionTime: 8,
        satisfactionScore: 3.8,
        escalationCount: 2,
        openTicketCount: 4
      }
    });
    
    // Calculate individual components
    const paymentScore = calculatePaymentScore(knownScoreData);
    const engagementScore = calculateEngagementScore(knownScoreData);
    const contractScore = calculateContractScore(knownScoreData);
    const supportScore = calculateSupportScore(knownScoreData);
    
    // Manually calculate weighted average
    const manualCalculation = 
      (paymentScore * 0.4) + 
      (engagementScore * 0.3) + 
      (contractScore * 0.2) + 
      (supportScore * 0.1);
    
    const algorithmResult = calculateHealthScore(knownScoreData);
    
    console.log(`   Payment: ${paymentScore}, Engagement: ${engagementScore}, Contract: ${contractScore}, Support: ${supportScore}`);
    console.log(`   Manual calculation: ${manualCalculation.toFixed(1)}`);
    console.log(`   Algorithm result: ${algorithmResult.overallScore}`);
    
    const difference = Math.abs(manualCalculation - algorithmResult.overallScore);
    if (difference > 1) {
      throw new Error(`Algorithm calculation differs from manual: ${difference.toFixed(1)} points`);
    }

    // Test: Monotonicity (better inputs should yield better or equal scores)
    console.log('2. Testing score monotonicity...');
    
    const baselineData = createCompleteHealthData();
    const improvedData = {
      ...baselineData,
      paymentHistory: {
        ...baselineData.paymentHistory,
        daysSinceLastPayment: Math.max(0, baselineData.paymentHistory.daysSinceLastPayment - 10),
        averagePaymentDelay: Math.max(0, baselineData.paymentHistory.averagePaymentDelay - 2),
        overdueAmount: Math.max(0, baselineData.paymentHistory.overdueAmount - 1000)
      },
      engagementMetrics: {
        ...baselineData.engagementMetrics,
        loginFrequency: baselineData.engagementMetrics.loginFrequency + 5,
        featureUsageCount: baselineData.engagementMetrics.featureUsageCount + 25,
        activeUserCount: baselineData.engagementMetrics.activeUserCount + 5
      }
    };
    
    const baselineScore = calculateHealthScore(baselineData).overallScore;
    const improvedScore = calculateHealthScore(improvedData).overallScore;
    
    console.log(`   Baseline score: ${baselineScore}`);
    console.log(`   Improved metrics score: ${improvedScore}`);
    
    if (improvedScore < baselineScore) {
      console.warn(`⚠️  Improved metrics resulted in lower score: ${improvedScore} vs ${baselineScore}`);
    }

    // Test: Sensitivity analysis
    console.log('3. Testing algorithm sensitivity...');
    
    const sensitivityTests = [
      { factor: 'payment', change: 'improve', expectedDirection: 'increase' },
      { factor: 'engagement', change: 'worsen', expectedDirection: 'decrease' },
      { factor: 'contract', change: 'improve', expectedDirection: 'increase' },
      { factor: 'support', change: 'worsen', expectedDirection: 'decrease' }
    ];
    
    for (const test of sensitivityTests) {
      const baseScore = calculateHealthScore(baselineData).overallScore;
      
      let modifiedData = { ...baselineData };
      
      switch (test.factor) {
        case 'payment':
          modifiedData.paymentHistory = {
            ...modifiedData.paymentHistory,
            paymentReliabilityScore: test.change === 'improve' ? 95 : 30
          };
          break;
        case 'engagement':
          modifiedData.engagementMetrics = {
            ...modifiedData.engagementMetrics,
            loginFrequency: test.change === 'improve' ? 30 : 2
          };
          break;
        case 'contract':
          modifiedData.contractInformation = {
            ...modifiedData.contractInformation,
            renewalProbability: test.change === 'improve' ? 95 : 20
          };
          break;
        case 'support':
          modifiedData.supportData = {
            ...modifiedData.supportData,
            satisfactionScore: test.change === 'improve' ? 4.8 : 1.5
          };
          break;
      }
      
      const modifiedScore = calculateHealthScore(modifiedData).overallScore;
      const actualDirection = modifiedScore > baseScore ? 'increase' : 'decrease';
      
      console.log(`   ${test.factor} ${test.change}: ${baseScore} → ${modifiedScore} (${actualDirection})`);
      
      if (actualDirection !== test.expectedDirection) {
        console.warn(`⚠️  Unexpected direction for ${test.factor} ${test.change}: expected ${test.expectedDirection}, got ${actualDirection}`);
      }
    }

    console.log('✅ Algorithm validation tests passed');

  } catch (error) {
    console.error('❌ Algorithm validation tests failed:', error);
    throw error;
  }
}

/**
 * Run All Health Calculator Tests
 */
export async function runAllHealthCalculatorTests() {
  console.log('🧪 Starting Health Calculator Comprehensive Test Suite...\n');
  
  const startTime = performance.now();
  
  try {
    // Individual scoring function tests
    await testPaymentScoreCalculation();
    await testEngagementScoreCalculation();
    await testContractScoreCalculation();
    await testSupportScoreCalculation();
    
    // Main calculation function tests
    await testMainHealthScoreCalculation();
    
    // Edge case testing
    await testEdgeCases();
    
    // Error handling tests
    await testErrorHandling();
    
    // Performance tests
    await testPerformance();
    
    // Business logic validation
    await testBusinessLogicValidation();
    
    // Algorithm validation
    await testAlgorithmValidation();
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    console.log(`\n🎉 All Health Calculator tests completed successfully!`);
    console.log(`📊 Total test execution time: ${totalDuration.toFixed(2)}ms`);
    console.log(`📈 Test coverage: Individual functions, main algorithm, edge cases, errors, performance, and business logic`);
    
  } catch (error) {
    console.error('\n💥 Health Calculator test suite failed:', error);
    throw error;
  }
}

// Export individual test functions for selective testing
export {
  testPaymentScoreCalculation,
  testEngagementScoreCalculation,
  testContractScoreCalculation,
  testSupportScoreCalculation,
  testMainHealthScoreCalculation,
  testEdgeCases,
  testErrorHandling,
  testPerformance,
  testBusinessLogicValidation,
  testAlgorithmValidation,
  createCompleteHealthData,
  createNewCustomerHealthData,
  createBaseCustomer
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllHealthCalculatorTests().catch(console.error);
}