'use client';

import { useState, useMemo } from 'react';
import { Customer, mockCustomers } from '@/data/mock-customers';
import { CustomerCard } from './CustomerCard';
import { CustomerActions } from './CustomerActions';

export interface CustomerListProps {
  /** Customers to display - defaults to mockCustomers */
  customers?: Customer[];
  /** Callback when customer edit is requested */
  onCustomerEdit?: (customer: Customer) => void;
  /** Callback when customer delete is requested */
  onCustomerDelete?: (customer: Customer) => void;
  /** Loading state for operations */
  isLoading?: boolean;
  /** Show search functionality */
  showSearch?: boolean;
  /** Show actions (edit/delete) on cards */
  showActions?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

export type SortField = 'name' | 'company' | 'healthScore' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
export type HealthFilter = 'all' | 'poor' | 'moderate' | 'good';

/**
 * CustomerList component providing a comprehensive view of customers
 * Integrates CustomerCard with CustomerActions for complete functionality
 */
export function CustomerList({
  customers = mockCustomers,
  onCustomerEdit,
  onCustomerDelete,
  isLoading = false,
  showSearch = true,
  showActions = true,
  className = ''
}: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');

  /**
   * Filter and sort customers based on current filters
   */
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(lowercaseSearch) ||
        customer.company.toLowerCase().includes(lowercaseSearch) ||
        customer.email?.toLowerCase().includes(lowercaseSearch)
      );
    }

    // Apply health score filter
    if (healthFilter !== 'all') {
      filtered = filtered.filter(customer => {
        const score = customer.healthScore;
        switch (healthFilter) {
          case 'poor':
            return score >= 0 && score <= 30;
          case 'moderate':
            return score >= 31 && score <= 70;
          case 'good':
            return score >= 71 && score <= 100;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [customers, searchTerm, sortField, sortDirection, healthFilter]);

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
   * Get sort indicator for column headers
   */
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const baseClasses = 'space-y-6';
  const listClasses = `${baseClasses} ${className}`;

  return (
    <div className={listClasses}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer List</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your customer database with search, filtering, and actions
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredAndSortedCustomers.length} of {customers.length} customers
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
              aria-label="Search customers by name, company, or email"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Health Filter */}
            <div className="flex items-center space-x-2">
              <label htmlFor="health-filter" className="text-sm font-medium text-gray-700">
                Health Score:
              </label>
              <select
                id="health-filter"
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value as HealthFilter)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="good">Good (71-100)</option>
                <option value="moderate">Moderate (31-70)</option>
                <option value="poor">Poor (0-30)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleSort('name')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                    sortField === 'name' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <span>Name</span>
                  {getSortIndicator('name')}
                </button>
                <button
                  onClick={() => handleSort('company')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                    sortField === 'company' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <span>Company</span>
                  {getSortIndicator('company')}
                </button>
                <button
                  onClick={() => handleSort('healthScore')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                    sortField === 'healthScore' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
        {filteredAndSortedCustomers.length === 0 ? (
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
              {searchTerm || healthFilter !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'No customers available to display.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCustomers.map((customer) => (
              <div key={customer.id} className="relative group">
                <CustomerCard
                  customer={customer}
                  className={`transition-all duration-200 ${
                    isLoading ? 'opacity-50' : 'hover:shadow-lg'
                  }`}
                />
                
                {/* Actions Overlay */}
                {showActions && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                      <CustomerActions
                        customer={customer}
                        onEdit={onCustomerEdit}
                        onDelete={onCustomerDelete}
                        isLoading={isLoading}
                        className="flex-col space-y-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {filteredAndSortedCustomers.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-200 pt-4">
          <div>
            {filteredAndSortedCustomers.length === customers.length 
              ? `${customers.length} customers total`
              : `${filteredAndSortedCustomers.length} of ${customers.length} customers shown`
            }
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs">Good</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs">Moderate</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs">Poor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}