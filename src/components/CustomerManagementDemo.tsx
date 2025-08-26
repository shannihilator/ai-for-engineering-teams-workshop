'use client';

import React, { useState } from 'react';
import { Customer } from '../data/mock-customers';
import AddCustomerForm from './AddCustomerForm';
import CustomerList from './CustomerList';

interface CustomerManagementDemoProps {
  className?: string;
}

export const CustomerManagementDemo: React.FC<CustomerManagementDemoProps> = ({
  className = ''
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleAddCustomer = () => {
    setShowAddForm(true);
  };

  const handleCustomerAdded = (customer: Customer) => {
    setShowAddForm(false);
    setSelectedCustomer(customer);
    // Trigger refresh of customer list
    setRefreshKey(prev => prev + 1);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Customer Management Integration
        </h1>
        <p className="text-gray-600">
          Complete customer management with CRUD operations, real-time validation, and search functionality.
        </p>
      </div>

      {/* Add Customer Form */}
      {showAddForm && (
        <AddCustomerForm
          onSuccess={handleCustomerAdded}
          onCancel={handleCancelAdd}
        />
      )}

      {/* Customer List */}
      <CustomerList
        key={refreshKey}
        onCustomerSelect={handleCustomerSelect}
        selectedCustomer={selectedCustomer}
        showAddButton={!showAddForm}
        onAddCustomer={handleAddCustomer}
      />

      {/* Selected Customer Details */}
      {selectedCustomer && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{selectedCustomer.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Company</dt>
                  <dd className="text-sm text-gray-900">{selectedCustomer.company}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{selectedCustomer.email || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Subscription Tier</dt>
                  <dd className="text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedCustomer.subscriptionTier === 'enterprise'
                        ? 'bg-purple-100 text-purple-800'
                        : selectedCustomer.subscriptionTier === 'premium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCustomer.subscriptionTier || 'basic'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Health & Metrics</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Health Score</dt>
                  <dd className="text-sm text-gray-900 flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      selectedCustomer.healthScore >= 71
                        ? 'bg-green-500'
                        : selectedCustomer.healthScore >= 31
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`} />
                    {selectedCustomer.healthScore}/100
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Domains</dt>
                  <dd className="text-sm text-gray-900">
                    {selectedCustomer.domains && selectedCustomer.domains.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedCustomer.domains.map((domain, index) => (
                          <span key={index} className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {domain}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'No domains configured'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {selectedCustomer.createdAt
                      ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                      : 'Not available'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {selectedCustomer.updatedAt
                      ? new Date(selectedCustomer.updatedAt).toLocaleDateString()
                      : 'Not available'
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementDemo;
