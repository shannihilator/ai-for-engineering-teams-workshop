/**
 * Example integration of CustomerService with CustomerSelector
 * Demonstrates how to use the service layer in React components
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Customer } from '@/data/mock-customers';
import { CustomerSelector } from '@/components/CustomerSelector';
import { customerService } from '@/services/CustomerService';
import { CustomerFilters, CustomerSortOptions } from '@/services/types';

export interface CustomerSelectorWithServiceProps {
  /** Enable advanced filtering UI */
  showAdvancedFilters?: boolean;
  /** Callback when customer selection changes */
  onCustomerSelect?: (customers: Customer[]) => void;
  /** Initially selected customer IDs */
  selectedCustomerIds?: string[];
  /** Enable multiselect mode */
  multiselect?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Enhanced CustomerSelector that uses CustomerService for data operations
 * Demonstrates service layer integration with React components
 */
export function CustomerSelectorWithService({
  showAdvancedFilters = true,
  onCustomerSelect,
  selectedCustomerIds = [],
  multiselect = true,
  className = ''
}: CustomerSelectorWithServiceProps) {
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [sortOptions, setSortOptions] = useState<CustomerSortOptions>({
    field: 'name',
    direction: 'asc'
  });

  // Load customers with current filters and sorting
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await customerService.searchCustomers(filters, sortOptions);
      setCustomers(result.customers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOptions]);

  // Load customers on component mount and when filters/sorting changes
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter update handlers
  const handleSearchTermChange = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm: searchTerm || undefined }));
  }, []);

  const handleHealthScoreRangeChange = useCallback((min?: number, max?: number) => {
    setFilters(prev => ({
      ...prev,
      healthScoreMin: min,
      healthScoreMax: max
    }));
  }, []);

  const handleSubscriptionTierChange = useCallback((tier?: 'basic' | 'premium' | 'enterprise') => {
    setFilters(prev => ({ ...prev, subscriptionTier: tier }));
  }, []);

  // Sort change handler
  const handleSortChange = useCallback((field: CustomerSortOptions['field'], direction: 'asc' | 'desc') => {
    setSortOptions({ field, direction });
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Memoized filter summary for UI
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.healthScoreMin !== undefined || filters.healthScoreMax !== undefined) count++;
    if (filters.subscriptionTier) count++;
    if (filters.domains && filters.domains.length > 0) count++;
    return count;
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading customers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  onClick={loadCustomers}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Advanced Filters UI */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Clear all filters ({activeFiltersCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Health Score Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Score Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={filters.healthScoreMin || ''}
                  onChange={(e) => handleHealthScoreRangeChange(
                    e.target.value ? parseInt(e.target.value) : undefined,
                    filters.healthScoreMax
                  )}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={filters.healthScoreMax || ''}
                  onChange={(e) => handleHealthScoreRangeChange(
                    filters.healthScoreMin,
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Subscription Tier Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Tier
              </label>
              <select
                value={filters.subscriptionTier || ''}
                onChange={(e) => handleSubscriptionTierChange(
                  e.target.value as 'basic' | 'premium' | 'enterprise' || undefined
                )}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Sort Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortOptions.field}
                onChange={(e) => handleSortChange(
                  e.target.value as CustomerSortOptions['field'],
                  sortOptions.direction
                )}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="company">Company</option>
                <option value="healthScore">Health Score</option>
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={sortOptions.direction}
                onChange={(e) => handleSortChange(
                  sortOptions.field,
                  e.target.value as 'asc' | 'desc'
                )}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Customer Selector with Service-loaded data */}
      <CustomerSelector
        customers={customers}
        onCustomerSelect={onCustomerSelect}
        selectedCustomerIds={selectedCustomerIds}
        multiselect={multiselect}
        className=""
      />
    </div>
  );
}

/**
 * Example usage component demonstrating the service integration
 */
export function CustomerServiceExample() {
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

  const handleCustomerSelection = useCallback((customers: Customer[]) => {
    setSelectedCustomers(customers);
    console.log('Selected customers:', customers);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Service Integration Example
        </h1>
        <p className="text-lg text-gray-600">
          This demonstrates how to use CustomerService with React components for advanced data operations.
        </p>
      </div>

      <CustomerSelectorWithService
        showAdvancedFilters={true}
        onCustomerSelect={handleCustomerSelection}
        multiselect={true}
      />

      {/* Selected Customers Summary */}
      {selectedCustomers.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Selected Customers Summary
          </h3>
          <div className="space-y-2">
            {selectedCustomers.map(customer => (
              <div key={customer.id} className="flex items-center justify-between">
                <span className="font-medium">{customer.name}</span>
                <span className="text-sm text-gray-600">{customer.company}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customer.healthScore > 70 
                    ? 'bg-green-100 text-green-800' 
                    : customer.healthScore > 30 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.healthScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerSelectorWithService;