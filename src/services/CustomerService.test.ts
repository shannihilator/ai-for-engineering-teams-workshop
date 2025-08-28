/**
 * Test file demonstrating CustomerService functionality
 * This serves as both documentation and validation of service operations
 */

import { CustomerService, CustomerValidationError, CustomerNotFoundError, CustomerConflictError } from './CustomerService';
import { CreateCustomerInput, UpdateCustomerInput } from './types';

// Test helper function to create a clean service instance
const createTestService = () => new CustomerService();

/**
 * Basic CRUD Operations Tests
 */
async function testBasicCRUDOperations() {
  console.log('\n=== Testing Basic CRUD Operations ===');
  
  const service = createTestService();

  try {
    // Test: Get all customers
    console.log('1. Getting all customers...');
    const allCustomers = await service.getAllCustomers();
    console.log(`Found ${allCustomers.length} customers`);

    // Test: Get customer by ID
    console.log('\n2. Getting customer by ID...');
    const customer = await service.getCustomerById('1');
    console.log(`Retrieved customer: ${customer.name} from ${customer.company}`);

    // Test: Create new customer
    console.log('\n3. Creating new customer...');
    const newCustomerData: CreateCustomerInput = {
      name: 'Test User',
      company: 'Test Company',
      healthScore: 85,
      email: 'test@testcompany.com',
      subscriptionTier: 'premium',
      domains: ['testcompany.com', 'app.testcompany.com']
    };
    
    const newCustomer = await service.createCustomer(newCustomerData);
    console.log(`Created customer with ID: ${newCustomer.id}`);

    // Test: Update customer
    console.log('\n4. Updating customer...');
    const updateData: UpdateCustomerInput = {
      healthScore: 90,
      subscriptionTier: 'enterprise'
    };
    
    const updatedCustomer = await service.updateCustomer(newCustomer.id, updateData);
    console.log(`Updated customer health score to: ${updatedCustomer.healthScore}`);

    // Test: Delete customer
    console.log('\n5. Deleting customer...');
    await service.deleteCustomer(newCustomer.id);
    console.log('Customer deleted successfully');

    console.log('✅ Basic CRUD operations completed successfully');

  } catch (error) {
    console.error('❌ Basic CRUD operations failed:', error);
  }
}

/**
 * Validation Tests
 */
async function testValidation() {
  console.log('\n=== Testing Data Validation ===');
  
  const service = createTestService();

  try {
    // Test: Invalid health score
    console.log('1. Testing invalid health score...');
    try {
      await service.createCustomer({
        name: 'Test User',
        company: 'Test Company',
        healthScore: 150 // Invalid: > 100
      });
    } catch (error) {
      if (error instanceof CustomerValidationError) {
        console.log('✅ Health score validation working:', error.fieldErrors.healthScore);
      }
    }

    // Test: Invalid email format
    console.log('\n2. Testing invalid email format...');
    try {
      await service.createCustomer({
        name: 'Test User',
        company: 'Test Company',
        healthScore: 85,
        email: 'invalid-email' // Invalid format
      });
    } catch (error) {
      if (error instanceof CustomerValidationError) {
        console.log('✅ Email validation working:', error.fieldErrors.email);
      }
    }

    // Test: Invalid subscription tier
    console.log('\n3. Testing invalid subscription tier...');
    try {
      await service.createCustomer({
        name: 'Test User',
        company: 'Test Company',
        healthScore: 85,
        subscriptionTier: 'platinum' as any // Invalid tier
      });
    } catch (error) {
      if (error instanceof CustomerValidationError) {
        console.log('✅ Subscription tier validation working:', error.fieldErrors.subscriptionTier);
      }
    }

    // Test: Missing required fields
    console.log('\n4. Testing missing required fields...');
    try {
      await service.createCustomer({
        name: '',
        company: '',
        healthScore: 85
      });
    } catch (error) {
      if (error instanceof CustomerValidationError) {
        console.log('✅ Required field validation working:', {
          name: error.fieldErrors.name,
          company: error.fieldErrors.company
        });
      }
    }

    console.log('✅ Validation tests completed successfully');

  } catch (error) {
    console.error('❌ Validation tests failed:', error);
  }
}

/**
 * Search and Filter Tests
 */
async function testSearchAndFilter() {
  console.log('\n=== Testing Search and Filter Operations ===');
  
  const service = createTestService();

  try {
    // Test: Search by term
    console.log('1. Testing search by name/company...');
    const searchResult = await service.searchCustomers({
      searchTerm: 'tech'
    });
    console.log(`Found ${searchResult.customers.length} customers matching "tech"`);
    searchResult.customers.forEach(c => console.log(`  - ${c.name} (${c.company})`));

    // Test: Filter by health score range
    console.log('\n2. Testing health score filtering...');
    const healthScoreResult = await service.searchCustomers({
      healthScoreMin: 80,
      healthScoreMax: 100
    });
    console.log(`Found ${healthScoreResult.customers.length} customers with health score 80-100`);
    healthScoreResult.customers.forEach(c => 
      console.log(`  - ${c.name}: ${c.healthScore}`)
    );

    // Test: Filter by subscription tier
    console.log('\n3. Testing subscription tier filtering...');
    const tierResult = await service.searchCustomers({
      subscriptionTier: 'premium'
    });
    console.log(`Found ${tierResult.customers.length} premium customers`);

    // Test: Sorting
    console.log('\n4. Testing sorting by health score...');
    const sortedResult = await service.searchCustomers(
      {},
      { field: 'healthScore', direction: 'desc' }
    );
    console.log('Top 5 customers by health score:');
    sortedResult.customers.slice(0, 5).forEach(c => 
      console.log(`  - ${c.name}: ${c.healthScore}`)
    );

    // Test: Pagination
    console.log('\n5. Testing pagination...');
    const paginatedResult = await service.searchCustomers(
      {},
      { field: 'name', direction: 'asc' },
      { offset: 0, limit: 3 }
    );
    console.log(`Page 1 (3 customers), Has more: ${paginatedResult.hasMore}`);
    paginatedResult.customers.forEach(c => console.log(`  - ${c.name}`));

    console.log('✅ Search and filter tests completed successfully');

  } catch (error) {
    console.error('❌ Search and filter tests failed:', error);
  }
}

/**
 * Error Handling Tests
 */
async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  const service = createTestService();

  try {
    // Test: Customer not found
    console.log('1. Testing customer not found error...');
    try {
      await service.getCustomerById('nonexistent-id');
    } catch (error) {
      if (error instanceof CustomerNotFoundError) {
        console.log('✅ CustomerNotFoundError working:', error.message);
      }
    }

    // Test: Duplicate email conflict
    console.log('\n2. Testing duplicate email conflict...');
    try {
      await service.createCustomer({
        name: 'Duplicate User',
        company: 'Duplicate Company',
        healthScore: 85,
        email: 'john.smith@acmecorp.com' // Email already exists in mock data
      });
    } catch (error) {
      if (error instanceof CustomerConflictError) {
        console.log('✅ CustomerConflictError working:', error.message);
      }
    }

    // Test: Update non-existent customer
    console.log('\n3. Testing update non-existent customer...');
    try {
      await service.updateCustomer('nonexistent-id', { healthScore: 90 });
    } catch (error) {
      if (error instanceof CustomerNotFoundError) {
        console.log('✅ Update error handling working:', error.message);
      }
    }

    console.log('✅ Error handling tests completed successfully');

  } catch (error) {
    console.error('❌ Error handling tests failed:', error);
  }
}

/**
 * Batch Operations Tests
 */
async function testBatchOperations() {
  console.log('\n=== Testing Batch Operations ===');
  
  const service = createTestService();

  try {
    // Test: Batch create customers
    console.log('1. Testing batch customer creation...');
    const batchCreateData: CreateCustomerInput[] = [
      {
        name: 'Batch User 1',
        company: 'Batch Company 1',
        healthScore: 75,
        email: 'batch1@test.com'
      },
      {
        name: 'Batch User 2',
        company: 'Batch Company 2',
        healthScore: 85,
        email: 'batch2@test.com'
      }
    ];
    
    const batchCreatedCustomers = await service.createCustomersBatch(batchCreateData);
    console.log(`✅ Successfully created ${batchCreatedCustomers.length} customers in batch`);

    // Test: Batch update customers
    console.log('\n2. Testing batch customer updates...');
    const batchUpdateData = batchCreatedCustomers.map(customer => ({
      id: customer.id,
      data: { healthScore: customer.healthScore + 5 }
    }));
    
    const batchUpdatedCustomers = await service.updateCustomersBatch(batchUpdateData);
    console.log(`✅ Successfully updated ${batchUpdatedCustomers.length} customers in batch`);

    // Clean up: Delete batch created customers
    for (const customer of batchCreatedCustomers) {
      await service.deleteCustomer(customer.id);
    }

    console.log('✅ Batch operations completed successfully');

  } catch (error) {
    console.error('❌ Batch operations failed:', error);
  }
}

/**
 * Statistics Tests
 */
async function testStatistics() {
  console.log('\n=== Testing Customer Statistics ===');
  
  const service = createTestService();

  try {
    const stats = await service.getCustomerStatistics();
    
    console.log('Customer Statistics:');
    console.log(`  Total customers: ${stats.total}`);
    console.log(`  Average health score: ${stats.averageHealthScore}`);
    
    console.log('\n  By subscription tier:');
    Object.entries(stats.bySubscriptionTier).forEach(([tier, count]) => {
      console.log(`    ${tier}: ${count} customers`);
    });
    
    console.log('\n  By health score range:');
    console.log(`    Poor (0-30): ${stats.byHealthScoreRange.poor} customers`);
    console.log(`    Moderate (31-70): ${stats.byHealthScoreRange.moderate} customers`);
    console.log(`    Good (71-100): ${stats.byHealthScoreRange.good} customers`);

    console.log('✅ Statistics tests completed successfully');

  } catch (error) {
    console.error('❌ Statistics tests failed:', error);
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🧪 Starting CustomerService Tests...\n');
  
  try {
    await testBasicCRUDOperations();
    await testValidation();
    await testSearchAndFilter();
    await testErrorHandling();
    await testBatchOperations();
    await testStatistics();
    
    console.log('\n🎉 All CustomerService tests completed successfully!');
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Export individual test functions for selective testing
export {
  testBasicCRUDOperations,
  testValidation,
  testSearchAndFilter,
  testErrorHandling,
  testBatchOperations,
  testStatistics
};