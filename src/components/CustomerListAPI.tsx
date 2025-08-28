'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Customer } from '@/data/mock-customers';
import { CustomerCard } from './CustomerCard';
import { LoadingButton } from './ui/LoadingButton';

export interface CustomerListAPIProps {
  /** Callback when customer edit is requested */
  onCustomerEdit?: (customer: Customer) => void;
  /** Callback when customer delete is requested */
  onCustomerDelete?: (customer: Customer) => void;
  /** Callback when customer is selected */
  onCustomerSelect?: (customer: Customer) => void;
  /** Show search functionality */
  showSearch?: boolean;
  /** Show actions (edit/delete) on cards */
  showActions?: boolean;
  /** Refresh trigger - increment to force refresh */
  refreshTrigger?: number;
  /** Optional additional CSS classes */
  className?: string;
}

export type SortField = 'name' | 'company' | 'healthScore' | 'subscriptionTier' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
export type HealthFilter = 'all' | 'poor' | 'moderate' | 'good';
export type SubscriptionFilter = 'all' | 'basic' | 'premium' | 'enterprise';

interface CustomerListState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface APIResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Enhanced CustomerList component with API integration
 * Integrates with GET /api/customers endpoint for server-side data
 */
export function CustomerListAPI({
  onCustomerEdit,
  onCustomerDelete,
  onCustomerSelect,
  showSearch = true,
  showActions = true,
  refreshTrigger = 0,
  className = ''
}: CustomerListAPIProps) {
  // State management
  const [state, setState] = useState<CustomerListState>({
    customers: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    }
  });

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>('all');

  /**
   * Fetch customers from API
   */
  const fetchCustomers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        page: state.pagination.page.toString(),
        limit: state.pagination.limit.toString(),
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        ...(subscriptionFilter !== 'all' && { subscriptionTier: subscriptionFilter }),
        ...(healthFilter === 'poor' && { maxHealthScore: '30' }),
        ...(healthFilter === 'moderate' && { minHealthScore: '31', maxHealthScore: '70' }),
        ...(healthFilter === 'good' && { minHealthScore: '71' })
      });

      const response = await fetch(`/api/customers?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch customers`);
      }

      const data: APIResponse = await response.json();
      
      setState(prev => ({
        ...prev,
        customers: data.data,
        pagination: data.pagination,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Failed to fetch customers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load customers. Please try again.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [state.pagination.page, state.pagination.limit, searchTerm, subscriptionFilter, healthFilter]);

  // Initial load and refresh triggers
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers, refreshTrigger]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.pagination.page !== 1) {
        setState(prev => ({
          ...prev,
          pagination: { ...prev.pagination, page: 1 }
        }));
      } else {
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, healthFilter, subscriptionFilter]);

  /**
   * Client-side sort (for current page results)
   */
  const sortedCustomers = useMemo(() => {
    return [...state.customers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'healthScore':
          aValue = a.healthScore;
          bValue = b.healthScore;
          break;
        case 'subscriptionTier':
          const tierOrder = { basic: 1, premium: 2, enterprise: 3 };
          aValue = tierOrder[a.subscriptionTier || 'basic'];
          bValue = tierOrder[b.subscriptionTier || 'basic'];
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [state.customers, sortField, sortDirection]);

  /**
   * Handle sort field change
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page: newPage }
    }));
  };

  /**
   * Get sort indicator icon
   */
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const baseClasses = 'space-y-6';
  const listClasses = `${baseClasses} ${className}`;

  if (state.loading) {
    return (
      <div className={listClasses}>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        {showSearch && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="h-10 bg-gray-200 rounded max-w-md animate-pulse"></div>
            <div className="flex flex-wrap gap-4">
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Customer Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={listClasses}>
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-red-900">Error Loading Customers</h3>
          <p className="mt-1 text-sm text-red-600">{state.error}</p>
          <div className="mt-4">
            <LoadingButton
              isLoading={state.loading}
              onClick={fetchCustomers}
              variant="outline"
              size="medium"
            >
              Try Again
            </LoadingButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={listClasses}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Database</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and view customer information with advanced filtering
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {state.pagination.total > 0 ? (
            <>
              Showing {((state.pagination.page - 1) * state.pagination.limit) + 1}–
              {Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)} of{' '}
              {state.pagination.total} customers
            </>
          ) : (
            'No customers found'
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {/* Search Input */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              aria-label="Search customers by name, company, email, or domains"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Health Score Filter */}
            <div className="flex items-center space-x-2">
              <label htmlFor="health-filter" className="text-sm font-medium text-gray-700">
                Health Score:
              </label>
              <select
                id="health-filter"
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value as HealthFilter)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
              >
                <option value="all">All Scores</option>
                <option value="good">Good (71-100)</option>
                <option value="moderate">Moderate (31-70)</option>
                <option value="poor">Poor (0-30)</option>
              </select>
            </div>

            {/* Subscription Tier Filter */}
            <div className="flex items-center space-x-2">
              <label htmlFor="subscription-filter" className="text-sm font-medium text-gray-700">
                Subscription:
              </label>
              <select
                id="subscription-filter"
                value={subscriptionFilter}
                onChange={(e) => setSubscriptionFilter(e.target.value as SubscriptionFilter)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleSort('name')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                    sortField === 'name' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`Sort by name ${sortField === 'name' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
                >
                  <span>Name</span>
                  {getSortIndicator('name')}
                </button>
                <button
                  onClick={() => handleSort('company')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                    sortField === 'company' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`Sort by company ${sortField === 'company' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
                >
                  <span>Company</span>
                  {getSortIndicator('company')}
                </button>
                <button
                  onClick={() => handleSort('healthScore')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                    sortField === 'healthScore' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`Sort by health score ${sortField === 'healthScore' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : 'ascending'}`}
                >
                  <span>Health</span>
                  {getSortIndicator('healthScore')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Cards Grid */}
      <div>
        {sortedCustomers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || healthFilter !== 'all' || subscriptionFilter !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'No customers available in the database.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCustomers.map((customer) => (
              <div key={customer.id} className="relative group">
                <div 
                  className={`transition-all duration-200 hover:shadow-lg ${onCustomerSelect ? 'cursor-pointer' : ''}`}
                  onClick={onCustomerSelect ? () => onCustomerSelect(customer) : undefined}
                >
                  <CustomerCard
                    customer={customer}
                  />
                </div>
                
                {/* Actions Overlay */}
                {showActions && (onCustomerEdit || onCustomerDelete) && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex space-x-1 p-1">
                      {onCustomerEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCustomerEdit(customer);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          aria-label={`Edit ${customer.name}`}
                          title="Edit customer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onCustomerDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCustomerDelete(customer);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          aria-label={`Delete ${customer.name}`}
                          title="Delete customer"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {state.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(state.pagination.page - 1)}
              disabled={state.pagination.page <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(state.pagination.page + 1)}
              disabled={state.pagination.page >= state.pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{state.pagination.page}</span> of{' '}
                <span className="font-medium">{state.pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(state.pagination.page - 1)}
                  disabled={state.pagination.page <= 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, state.pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    state.pagination.totalPages - 4,
                    Math.max(1, state.pagination.page - 2)
                  )) + i;
                  
                  if (pageNum > state.pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === state.pagination.page
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={pageNum === state.pagination.page ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(state.pagination.page + 1)}
                  disabled={state.pagination.page >= state.pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Health Score Legend */}
      {sortedCustomers.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-200 pt-4">
          <div>
            <LoadingButton
              isLoading={state.loading}
              onClick={fetchCustomers}
              variant="outline"
              size="small"
            >
              Refresh
            </LoadingButton>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium">Health Score Legend:</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
              <span className="text-xs">Good (71-100)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></div>
              <span className="text-xs">Moderate (31-70)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></div>
              <span className="text-xs">Poor (0-30)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}