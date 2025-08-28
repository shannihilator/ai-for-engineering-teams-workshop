'use client';

import { useState, useMemo, useCallback, KeyboardEvent } from 'react';
import { Customer, mockCustomers } from '@/data/mock-customers';
import { CustomerCard } from './CustomerCard';

export interface CustomerSelectorProps {
  /** Optional customers array - defaults to mockCustomers */
  customers?: Customer[];
  /** Callback when customer is selected */
  onCustomerSelect?: (customer: Customer | null) => void;
  /** Initially selected customer */
  selectedCustomerId?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CustomerSelector component for searching, filtering, and selecting customers
 * Integrates with CustomerCard component to display customer information
 */
export function CustomerSelector({
  customers = mockCustomers,
  onCustomerSelect,
  selectedCustomerId,
  className = ''
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(selectedCustomerId || null);

  /**
   * Filter customers based on search term (name or company)
   * Optimized with useMemo for performance with large datasets
   */
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase().trim();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowercaseSearch) ||
      customer.company.toLowerCase().includes(lowercaseSearch)
    );
  }, [customers, searchTerm]);

  /**
   * Handle customer card selection
   */
  const handleCustomerSelect = useCallback((customer: Customer) => {
    const newSelectedId = customer.id === selectedId ? null : customer.id;
    setSelectedId(newSelectedId);
    onCustomerSelect?.(newSelectedId ? customer : null);
  }, [selectedId, onCustomerSelect]);

  /**
   * Clear search input
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  /**
   * Handle keyboard navigation in search input
   */
  const handleSearchKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      clearSearch();
      event.currentTarget.blur();
    }
  }, [clearSearch]);

  const baseClasses = 'space-y-6';
  const selectorClasses = `${baseClasses} ${className}`;

  return (
    <div className={selectorClasses}>
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Selection
          </h2>
          <div className="text-sm text-gray-500">
            {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>

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
            placeholder="Search customers by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            aria-label="Search customers by name or company"
            aria-describedby="search-description"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <div id="search-description" className="sr-only">
          Search through customer names and company names to find specific customers
        </div>
      </div>

      {/* Results Section */}
      <div>
        {filteredCustomers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {/* Cat face */}
              <ellipse cx="12" cy="13" rx="8" ry="6" />
              {/* Cat ears */}
              <path d="M8 7 L12 13 L10 7 Z" />
              <path d="M16 7 L14 7 L12 13 Z" />
              {/* Cat eyes */}
              <ellipse cx="9.5" cy="11" rx="1" ry="1.5" fill="white" />
              <ellipse cx="14.5" cy="11" rx="1" ry="1.5" fill="white" />
              <circle cx="9.5" cy="11" r="0.5" fill="currentColor" />
              <circle cx="14.5" cy="11" r="0.5" fill="currentColor" />
              {/* Cat nose */}
              <path d="M12 13 L11 14 L13 14 Z" fill="white" />
              {/* Cat mouth */}
              <path d="M12 15 Q10 16 9 15" stroke="white" strokeWidth="0.5" fill="none" />
              <path d="M12 15 Q14 16 15 15" stroke="white" strokeWidth="0.5" fill="none" />
              {/* Cat whiskers */}
              <line x1="6" y1="12" x2="8" y2="11.5" stroke="white" strokeWidth="0.5" />
              <line x1="6" y1="13" x2="8" y2="13" stroke="white" strokeWidth="0.5" />
              <line x1="16" y1="11.5" x2="18" y2="12" stroke="white" strokeWidth="0.5" />
              <line x1="16" y1="13" x2="18" y2="13" stroke="white" strokeWidth="0.5" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `No customers match "${searchTerm}". Try different search terms.`
                : 'No customers available to display.'
              }
            </p>
            {searchTerm && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Customer Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCustomerSelect(customer)}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedId === customer.id
                    ? 'ring-2 ring-blue-500 ring-offset-2 transform scale-105'
                    : 'hover:transform hover:scale-102'
                }`}
                role="button"
                tabIndex={0}
                aria-pressed={selectedId === customer.id}
                aria-label={`${selectedId === customer.id ? 'Deselect' : 'Select'} customer ${customer.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCustomerSelect(customer);
                  }
                }}
              >
                <CustomerCard
                  customer={customer}
                  className={selectedId === customer.id ? 'bg-blue-50 border-blue-200' : ''}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Customer Info */}
      {selectedId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-green-800">
              Customer selected: {filteredCustomers.find(c => c.id === selectedId)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}