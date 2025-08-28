'use client';

import { Customer, mockCustomers } from '@/data/mock-customers';

export interface CustomerCardProps {
  /** Customer data to display */
  customer: Customer;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CustomerCard component for displaying individual customer information
 * with health score indicators and domain information
 */
export function CustomerCard({ customer, className = '' }: CustomerCardProps) {
  const { name, company, healthScore, domains = [] } = customer;

  /**
   * Get health score color and label based on score ranges
   */
  const getHealthScoreDisplay = (score: number) => {
    if (score >= 71) {
      return {
        color: 'text-green-700 bg-green-100 border-green-200',
        label: 'Good',
        dotColor: 'bg-green-500'
      };
    } else if (score >= 31) {
      return {
        color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
        label: 'Moderate',
        dotColor: 'bg-yellow-500'
      };
    } else {
      return {
        color: 'text-red-700 bg-red-100 border-red-200',
        label: 'Poor',
        dotColor: 'bg-red-500'
      };
    }
  };

  const healthDisplay = getHealthScoreDisplay(healthScore);

  /**
   * Format domain display - show individual domains or count for multiple
   */
  const getDomainDisplay = () => {
    if (domains.length === 0) {
      return <span className="text-gray-500">No domains</span>;
    } else if (domains.length === 1) {
      return <span className="text-gray-700">{domains[0]}</span>;
    } else {
      return (
        <span className="text-gray-700">
          {domains.length} domains
        </span>
      );
    }
  };

  const baseClasses = 'bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2';
  const cardClasses = `${baseClasses} ${className}`;

  return (
    <div className={cardClasses}>
      {/* Customer Header */}
      <div className="flex items-start justify-between mb-3 sm:flex-row flex-col sm:gap-0 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate sm:text-lg text-base">
            {name}
          </h3>
          <p className="text-sm text-gray-600 truncate mt-1 sm:text-sm text-xs">
            {company}
          </p>
        </div>
        
        {/* Health Score Badge */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${healthDisplay.color} flex-shrink-0`}
          role="status"
          aria-label={`Health score: ${healthScore} out of 100, ${healthDisplay.label}`}
        >
          <div 
            className={`w-2 h-2 rounded-full ${healthDisplay.dotColor}`}
            aria-hidden="true"
          />
          <span className="text-xs font-medium">
            {healthScore}
          </span>
        </div>
      </div>

      {/* Domain Information */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 sm:text-sm text-xs">Domains:</span>
          <div className="flex-1 min-w-0">
            {getDomainDisplay()}
          </div>
        </div>
        
        {/* Show individual domains if there are multiple but not too many */}
        {domains.length > 1 && domains.length <= 3 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {domains.map((domain, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded break-all"
              >
                {domain}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Demo component showcasing all mock customers
 */
export function CustomerCardGrid() {
  return (
    <div className="space-y-6">
      <div className="text-green-600 text-sm font-medium">
        ✅ CustomerCard implemented! Showing all {mockCustomers.length} customers from mock data:
      </div>
      
      {/* Grid layout for customer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCustomers.map((customer) => (
          <CustomerCard 
            key={customer.id} 
            customer={customer}
          />
        ))}
      </div>
      
      {/* Health Score Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Health Score Color Coding:</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Good (71-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Moderate (31-70)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Poor (0-30)</span>
          </div>
        </div>
      </div>
    </div>
  );
}