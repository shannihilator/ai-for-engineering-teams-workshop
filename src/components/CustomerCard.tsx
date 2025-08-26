import React from 'react';
import { Customer } from '../data/mock-customers';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  const getHealthScoreColor = (score: number): string => {
    if (score >= 0 && score <= 30) return 'bg-red-500';
    if (score >= 31 && score <= 70) return 'bg-yellow-500';
    if (score >= 71 && score <= 100) return 'bg-green-500';
    return 'bg-gray-400'; // fallback for invalid scores
  };

  const getHealthScoreLabel = (score: number): string => {
    if (score >= 0 && score <= 30) return 'Poor';
    if (score >= 31 && score <= 70) return 'Moderate';
    if (score >= 71 && score <= 100) return 'Good';
    return 'Unknown';
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  const domainCount = customer.domains?.length || 0;
  const displayDomains = customer.domains?.slice(0, 2) || [];
  const hasMoreDomains = domainCount > 2;

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-shadow hover:shadow-lg ${
        onClick ? 'cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none' : ''
      } max-w-sm w-full`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'article'}
      aria-label={onClick ? `Select customer ${customer.name} from ${customer.company}` : undefined}
    >
      {/* Customer Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {customer.name}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {customer.company}
          </p>
        </div>

        {/* Health Score Indicator */}
        <div className="flex items-center ml-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full ${getHealthScoreColor(customer.healthScore)} mr-2`}
                aria-label={`Health score: ${customer.healthScore} - ${getHealthScoreLabel(customer.healthScore)}`}
              />
              <span className="text-lg font-bold text-gray-900">
                {customer.healthScore}
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {getHealthScoreLabel(customer.healthScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Domains Section */}
      {domainCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Domains
            </h4>
            <span className="text-xs text-gray-500">
              {domainCount} domain{domainCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-1">
            {displayDomains.map((domain, index) => (
              <div
                key={index}
                className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded truncate"
                title={domain}
              >
                {domain}
              </div>
            ))}
            {hasMoreDomains && (
              <div className="text-xs text-gray-500 italic">
                +{domainCount - 2} more domain{domainCount - 2 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Domains State */}
      {domainCount === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">
            No domains configured
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerCard;
