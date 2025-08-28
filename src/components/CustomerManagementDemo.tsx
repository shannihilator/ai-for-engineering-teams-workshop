'use client';

import { useState } from 'react';
import { Customer } from '@/data/mock-customers';
import { AddCustomerForm } from './AddCustomerForm';
import { CustomerListAPI } from './CustomerListAPI';

/**
 * Demo component showcasing the integration of AddCustomerForm and CustomerListAPI
 * with the existing CustomerCard component
 */
export function CustomerManagementDemo() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  /**
   * Handle successful customer creation
   */
  const handleCustomerCreated = (customer: Customer) => {
    setNotification({
      type: 'success',
      message: `Customer "${customer.name}" has been successfully added to the database!`
    });
    setView('list');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh of customer list
    
    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  /**
   * Handle form error
   */
  const handleFormError = (error: string) => {
    setNotification({
      type: 'error',
      message: error
    });
    
    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  /**
   * Handle customer edit (placeholder)
   */
  const handleCustomerEdit = (customer: Customer) => {
    setNotification({
      type: 'success',
      message: `Edit functionality for "${customer.name}" would be implemented here.`
    });
    
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Handle customer delete (placeholder)
   */
  const handleCustomerDelete = (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      setNotification({
        type: 'success',
        message: `Delete functionality for "${customer.name}" would be implemented here.`
      });
      
      setTimeout(() => setNotification(null), 3000);
    }
  };

  /**
   * Handle customer selection
   */
  const handleCustomerSelect = (customer: Customer) => {
    setNotification({
      type: 'success',
      message: `Selected "${customer.name}" from ${customer.company}. Customer details could be shown in a modal or detail view.`
    });
    
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management System
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Demo of AddCustomerForm and CustomerListAPI integration with existing CustomerCard
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Customer List
            </button>
            <button
              onClick={() => setView('add')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'add'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Add Customer
            </button>
          </nav>
        </div>

        {/* Global Notification */}
        {notification && (
          <div
            className={`mb-8 p-4 rounded-md ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success'
                      ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                      : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }`}
                  aria-label="Dismiss notification"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {view === 'list' ? (
            <div className="p-6">
              <CustomerListAPI
                onCustomerEdit={handleCustomerEdit}
                onCustomerDelete={handleCustomerDelete}
                onCustomerSelect={handleCustomerSelect}
                showSearch={true}
                showActions={true}
                refreshTrigger={refreshTrigger}
              />
            </div>
          ) : (
            <div className="p-6">
              <AddCustomerForm
                onSubmit={handleCustomerCreated}
                onCancel={() => setView('list')}
                onError={handleFormError}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Integration Features Demonstrated
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">AddCustomerForm</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>✓ Real-time validation</li>
                  <li>✓ Health score preview</li>
                  <li>✓ API integration</li>
                  <li>✓ Accessibility compliant</li>
                </ul>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h4 className="font-medium text-green-900 mb-1">CustomerListAPI</h4>
                <ul className="text-green-700 space-y-1">
                  <li>✓ Server-side pagination</li>
                  <li>✓ Advanced filtering</li>
                  <li>✓ Search functionality</li>
                  <li>✓ Loading states</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-1">CustomerCard Integration</h4>
                <ul className="text-purple-700 space-y-1">
                  <li>✓ Consistent health colors</li>
                  <li>✓ Responsive design</li>
                  <li>✓ Action overlays</li>
                  <li>✓ Semantic markup</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}