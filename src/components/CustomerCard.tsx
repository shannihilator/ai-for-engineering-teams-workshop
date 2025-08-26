import React from 'react';

export interface Customer {
  id: string;
  name: string;
  company: string;
  healthScore: number;
}

export interface CustomerCardProps {
  customer: Customer;
  isSelected?: boolean;
  onClick?: (customer: Customer) => void;
}

export default function CustomerCard({ customer, isSelected = false, onClick }: CustomerCardProps) {
  // Sanitize customer data
  const sanitizedName = customer.name?.trim() || 'Unknown Customer';
  const sanitizedCompany = customer.company?.trim() || 'Unknown Company';
  const healthScore = Math.max(0, Math.min(100, customer.healthScore || 0));

  // Determine health score color and styling
  const getHealthScoreStyle = (score: number) => {
    if (score >= 0 && score <= 30) {
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
        indicatorColor: 'bg-red-500'
      };
    } else if (score >= 31 && score <= 70) {
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
        indicatorColor: 'bg-yellow-500'
      };
    } else {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        indicatorColor: 'bg-green-500'
      };
    }
  };

  const healthStyle = getHealthScoreStyle(healthScore);

  const handleClick = () => {
    if (onClick) {
      onClick(customer);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`
        relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        ${healthStyle.bgColor} ${healthStyle.borderColor}
        sm:p-6 lg:p-4
      `}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Select customer ${sanitizedName} from ${sanitizedCompany} with health score ${healthScore}`}
      aria-pressed={isSelected}
    >
      {/* Health Score Indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div className={`w-3 h-3 rounded-full ${healthStyle.indicatorColor}`} />
        <span className={`text-sm font-semibold ${healthStyle.textColor}`}>
          {healthScore}
        </span>
      </div>

      {/* Customer Information */}
      <div className="pr-12">
        <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
          {sanitizedName}
        </h3>
        <p className="text-sm text-gray-600 truncate mb-3">
          {sanitizedCompany}
        </p>
        
        {/* Health Score Badge */}
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${healthStyle.bgColor} ${healthStyle.textColor}`}>
          Health Score: {healthScore}/100
        </div>
      </div>

      {/* Selected State Indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}