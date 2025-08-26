'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Customer } from '../data/mock-customers';
import CustomerCard from './CustomerCard';

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void;
  selectedCustomer?: Customer | null;
  showAddButton?: boolean;
  onAddCustomer?: () => void;
  className?: string;
}

interface CustomerStats {
  total: number;
  averageHealthScore: number;
  subscriptionBreakdown: Record<string, number>;
  recentlyAdded: Customer[];
}

export const CustomerList: React.FC<CustomerListProps> = ({
  onCustomerSelect,
  selectedCustomer,
  showAddButton = false,
  onAddCustomer,
  className = ''
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [minHealthScore, setMinHealthScore] = useState('');
  const [maxHealthScore, setMaxHealthScore] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (minHealthScore) params.append('minHealthScore', minHealthScore);
      if (maxHealthScore) params.append('maxHealthScore', maxHealthScore);
      if (subscriptionFilter) params.append('subscriptionTier', subscriptionFilter);

      const response = await fetch(`/api/customers?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch customers');
      }

      setCustomers(result.data);
      setFilteredCustomers(result.data);
      setStats(result.meta.stats);

    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const delayedFetch = setTimeout(() => {
      fetchCustomers();
    }, 300); // Debounce API calls

    return () => clearTimeout(delayedFetch);
  }, [searchQuery, minHealthScore, maxHealthScore, subscriptionFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setMinHealthScore('');
    setMaxHealthScore('');
    setSubscriptionFilter('');
  };

  const hasActiveFilters = searchQuery || minHealthScore || maxHealthScore || subscriptionFilter;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading customers...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Customers</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Customers</h2>
            {stats && (
              <p className="text-sm text-gray-600">
                {stats.total} customer{stats.total !== 1 ? 's' : ''} • Average health score: {stats.averageHealthScore}
              </p>
            )}
          </div>
          {showAddButton && onAddCustomer && (
            <button
              onClick={onAddCustomer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search customers by name, company, email, or domain"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={minHealthScore}
                onChange={(e) => setMinHealthScore(e.target.value)}
                placeholder="Min health"
                min="0"
                max="100"
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Minimum health score"
              />
              <input
                type="number"
                value={maxHealthScore}
                onChange={(e) => setMaxHealthScore(e.target.value)}
                placeholder="Max health"
                min="0"
                max="100"
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Maximum health score"
              />
            </div>
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by subscription tier"
            >
              <option value="">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredCustomers.length} of {customers.length} customer{customers.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Grid */}
      <div className="p-6">
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                isSelected={selectedCustomer?.id === customer.id}
                onClick={onCustomerSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
            <p className="mt-2 text-gray-500">
              {hasActiveFilters ? (
                <>
                  No customers match your current filters.{' '}
                  <button
                    onClick={handleClearFilters}
                    className="text-blue-600 hover:text-blue-500 font-medium underline"
                  >
                    Clear filters
                  </button>{' '}
                  to see all customers.
                </>
              ) : showAddButton ? (
                <>
                  Get started by{' '}
                  <button
                    onClick={onAddCustomer}
                    className="text-blue-600 hover:text-blue-500 font-medium underline"
                  >
                    adding your first customer
                  </button>
                  .
                </>
              ) : (
                'No customers available to display.'
              )}
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats && stats.total > 0 && (
        <div className="border-t p-6 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{stats.averageHealthScore}</div>
              <div className="text-xs text-gray-600">Avg Health Score</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center gap-2 text-sm">
                {Object.entries(stats.subscriptionBreakdown).map(([tier, count]) => (
                  <span key={tier} className="px-2 py-1 bg-gray-200 rounded text-xs">
                    {tier}: {count}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-1">Subscription Tiers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
