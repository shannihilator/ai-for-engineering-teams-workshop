'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Customer } from '@/data/mock-customers';
import { LoadingButton } from './ui/LoadingButton';

export interface CustomerFormProps {
  /** Customer to edit (undefined for create mode) */
  customer?: Customer;
  /** Callback when form is submitted successfully */
  onSubmit?: (customer: Omit<Customer, 'id'> | Customer) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

export interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  healthScore: number;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  domains: string[];
}

export interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  healthScore?: string;
  subscriptionTier?: string;
  domains?: string;
}

/**
 * CustomerForm component for creating and editing customers
 * Provides comprehensive validation and accessibility features
 */
export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading = false,
  className = ''
}: CustomerFormProps) {
  const isEditMode = !!customer;
  
  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    name: customer?.name || '',
    company: customer?.company || '',
    email: customer?.email || '',
    healthScore: customer?.healthScore || 50,
    subscriptionTier: customer?.subscriptionTier || 'basic',
    domains: customer?.domains || ['']
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [domainsInput, setDomainsInput] = useState(customer?.domains?.join(', ') || '');

  // Update form when customer prop changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        company: customer.company,
        email: customer.email || '',
        healthScore: customer.healthScore,
        subscriptionTier: customer.subscriptionTier || 'basic',
        domains: customer.domains || ['']
      });
      setDomainsInput(customer.domains?.join(', ') || '');
    }
  }, [customer]);

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    } else if (formData.company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Health score validation
    if (formData.healthScore < 0 || formData.healthScore > 100) {
      newErrors.healthScore = 'Health score must be between 0 and 100';
    }

    // Domains validation
    const domainList = domainsInput
      .split(',')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    if (domainList.length === 0) {
      newErrors.domains = 'At least one domain is required';
    } else {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
      const invalidDomains = domainList.filter(domain => !domainRegex.test(domain));
      if (invalidDomains.length > 0) {
        newErrors.domains = `Invalid domain(s): ${invalidDomains.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleInputChange = (field: keyof CustomerFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * Handle domains input change
   */
  const handleDomainsChange = (value: string) => {
    setDomainsInput(value);
    
    // Clear domains error when user starts typing
    if (errors.domains) {
      setErrors(prev => ({
        ...prev,
        domains: undefined
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const domainList = domainsInput
      .split(',')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    const submissionData = {
      ...formData,
      domains: domainList,
      ...(isEditMode && { id: customer.id }),
      createdAt: customer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit?.(submissionData);
  };

  /**
   * Get health score color for preview
   */
  const getHealthScorePreview = (score: number) => {
    if (score >= 71) return { color: 'text-green-600', label: 'Good' };
    if (score >= 31) return { color: 'text-yellow-600', label: 'Moderate' };
    return { color: 'text-red-600', label: 'Poor' };
  };

  const healthPreview = getHealthScorePreview(formData.healthScore);
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const formClasses = `${baseClasses} ${className}`;

  return (
    <div className={formClasses}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isEditMode 
            ? 'Update customer information and settings'
            : 'Enter customer details to add them to your system'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="customer-name"
            type="text"
            value={formData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter customer's full name"
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="customer-company" className="block text-sm font-medium text-gray-700 mb-2">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            id="customer-company"
            type="text"
            value={formData.company}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('company', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.company ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter company name"
            aria-describedby={errors.company ? 'company-error' : undefined}
            aria-invalid={!!errors.company}
          />
          {errors.company && (
            <p id="company-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.company}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="customer-email"
            type="email"
            value={formData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Score Field */}
          <div>
            <label htmlFor="customer-health-score" className="block text-sm font-medium text-gray-700 mb-2">
              Health Score
            </label>
            <div className="space-y-2">
              <input
                id="customer-health-score"
                type="range"
                min="0"
                max="100"
                value={formData.healthScore}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('healthScore', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                aria-describedby="health-score-display health-score-help"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">0 (Poor)</span>
                <div id="health-score-display" className={`text-sm font-medium ${healthPreview.color}`}>
                  {formData.healthScore} ({healthPreview.label})
                </div>
                <span className="text-sm text-gray-500">100 (Good)</span>
              </div>
              <p id="health-score-help" className="text-xs text-gray-500">
                Health score affects customer priority and engagement strategies
              </p>
            </div>
            {errors.healthScore && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.healthScore}
              </p>
            )}
          </div>

          {/* Subscription Tier Field */}
          <div>
            <label htmlFor="customer-subscription" className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Tier
            </label>
            <select
              id="customer-subscription"
              value={formData.subscriptionTier}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('subscriptionTier', e.target.value as 'basic' | 'premium' | 'enterprise')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Domains Field */}
        <div>
          <label htmlFor="customer-domains" className="block text-sm font-medium text-gray-700 mb-2">
            Domains <span className="text-red-500">*</span>
          </label>
          <input
            id="customer-domains"
            type="text"
            value={domainsInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleDomainsChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.domains ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="example.com, app.example.com, api.example.com"
            aria-describedby="domains-help domains-error"
            aria-invalid={!!errors.domains}
          />
          <p id="domains-help" className="text-sm text-gray-500 mt-1">
            Separate multiple domains with commas
          </p>
          {errors.domains && (
            <p id="domains-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.domains}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText={isEditMode ? 'Updating...' : 'Creating...'}
            size="medium"
            variant="primary"
          >
            {isEditMode ? 'Update Customer' : 'Create Customer'}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}