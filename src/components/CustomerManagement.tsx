'use client';

import { useState, useCallback } from 'react';
import { Customer, mockCustomers } from '@/data/mock-customers';
import { CustomerList } from './CustomerList';
import { CustomerForm } from './CustomerForm';
import { LoadingButton } from './ui/LoadingButton';

export type ViewMode = 'list' | 'create' | 'edit';

export interface CustomerManagementProps {
  /** Initial customers data - defaults to mockCustomers */
  initialCustomers?: Customer[];
  /** Callback when customer data changes (for persistence) */
  onCustomersChange?: (customers: Customer[]) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CustomerManagement component - Main orchestrator for all customer CRUD operations
 * Manages state, handles all customer operations, and coordinates between components
 */
export function CustomerManagement({
  initialCustomers = mockCustomers,
  onCustomersChange,
  className = ''
}: CustomerManagementProps) {
  // State management
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  /**
   * Generate unique ID for new customers
   */
  const generateId = useCallback((): string => {
    const maxId = customers.reduce((max, customer) => 
      Math.max(max, parseInt(customer.id) || 0), 0
    );
    return (maxId + 1).toString();
  }, [customers]);

  /**
   * Show notification message
   */
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  /**
   * Update customers and notify parent
   */
  const updateCustomers = useCallback((newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    onCustomersChange?.(newCustomers);
  }, [onCustomersChange]);

  /**
   * Handle customer creation
   */
  const handleCreateCustomer = useCallback(async (customerData: Omit<Customer, 'id'>) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCustomer: Customer = {
        ...customerData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedCustomers = [...customers, newCustomer];
      updateCustomers(updatedCustomers);
      setCurrentView('list');
      showNotification('success', `Customer "${newCustomer.name}" created successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to create customer. Please try again.');
      console.error('Error creating customer:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customers, generateId, updateCustomers, showNotification]);

  /**
   * Handle customer update
   */
  const handleUpdateCustomer = useCallback(async (updatedCustomer: Customer) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const customerWithTimestamp = {
        ...updatedCustomer,
        updatedAt: new Date().toISOString()
      };

      const updatedCustomers = customers.map(customer =>
        customer.id === updatedCustomer.id ? customerWithTimestamp : customer
      );
      
      updateCustomers(updatedCustomers);
      setCurrentView('list');
      setEditingCustomer(undefined);
      showNotification('success', `Customer "${updatedCustomer.name}" updated successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to update customer. Please try again.');
      console.error('Error updating customer:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customers, updateCustomers, showNotification]);

  /**
   * Handle customer deletion
   */
  const handleDeleteCustomer = useCallback(async (customer: Customer) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCustomers = customers.filter(c => c.id !== customer.id);
      updateCustomers(updatedCustomers);
      showNotification('success', `Customer "${customer.name}" deleted successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to delete customer. Please try again.');
      console.error('Error deleting customer:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customers, updateCustomers, showNotification]);

  /**
   * Handle edit customer request
   */
  const handleEditCustomer = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setCurrentView('edit');
  }, []);

  /**
   * Handle form submission
   */
  const handleFormSubmit = useCallback((customerData: Omit<Customer, 'id'> | Customer) => {
    if ('id' in customerData && customerData.id) {
      // Update existing customer
      handleUpdateCustomer(customerData as Customer);
    } else {
      // Create new customer
      handleCreateCustomer(customerData as Omit<Customer, 'id'>);
    }
  }, [handleCreateCustomer, handleUpdateCustomer]);

  /**
   * Handle form cancel
   */
  const handleFormCancel = useCallback(() => {
    setCurrentView('list');
    setEditingCustomer(undefined);
  }, []);

  /**
   * Handle start create customer
   */
  const handleStartCreateCustomer = useCallback(() => {
    setEditingCustomer(undefined);
    setCurrentView('create');
  }, []);

  /**
   * Dismiss notification
   */
  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const baseClasses = 'space-y-6';
  const managementClasses = `${baseClasses} ${className}`;

  return (
    <div className={managementClasses}>
      {/* Header and Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer database with full CRUD operations
          </p>
        </div>
        
        {currentView === 'list' && (
          <LoadingButton
            onClick={handleStartCreateCustomer}
            isLoading={false}
            size="medium"
            variant="primary"
            className="flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Customer
          </LoadingButton>
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <LoadingButton
            onClick={handleFormCancel}
            isLoading={false}
            size="medium"
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to List
          </LoadingButton>
        )}
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`rounded-md p-4 border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex justify-between items-start">
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg
                    className="h-5 w-5 text-green-400"
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
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={dismissNotification}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  notification.type === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                }`}
                aria-label="Dismiss notification"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div>
        {currentView === 'list' && (
          <CustomerList
            customers={customers}
            onCustomerEdit={handleEditCustomer}
            onCustomerDelete={handleDeleteCustomer}
            isLoading={isLoading}
            showSearch={true}
            showActions={true}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <div className="max-w-2xl mx-auto">
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Statistics Footer */}
      {currentView === 'list' && customers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-500">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.healthScore >= 71).length}
              </div>
              <div className="text-sm text-gray-500">Good Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {customers.filter(c => c.healthScore >= 31 && c.healthScore <= 70).length}
              </div>
              <div className="text-sm text-gray-500">Moderate Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {customers.filter(c => c.healthScore <= 30).length}
              </div>
              <div className="text-sm text-gray-500">Poor Health</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}