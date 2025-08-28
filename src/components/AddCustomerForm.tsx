'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Customer } from '@/data/mock-customers';
import { LoadingButton } from './ui/LoadingButton';

export interface AddCustomerFormProps {
  /** Callback when form is submitted successfully */
  onSubmit?: (customer: Customer) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Callback when form encounters an error */
  onError?: (error: string, details?: Record<string, string>) => void;
  /** Optional additional CSS classes */
  className?: string;
}

export interface AddCustomerFormData {
  name: string;
  company: string;
  email: string;
  healthScore: number;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  domains: string[];
}

export interface FormValidationErrors {
  name?: string;
  company?: string;
  email?: string;
  healthScore?: string;
  subscriptionTier?: string;
  domains?: string;
}

/**
 * AddCustomerForm component for creating new customers with API integration
 * Provides comprehensive validation, real-time health score preview, and accessibility features
 */
export function AddCustomerForm({
  onSubmit,
  onCancel,
  onError,
  className = ''
}: AddCustomerFormProps) {
  // Form state
  const [formData, setFormData] = useState<AddCustomerFormData>({
    name: '',
    company: '',
    email: '',
    healthScore: 50,
    subscriptionTier: 'basic',
    domains: []
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [domainsInput, setDomainsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Validate individual form field
   */
  const validateField = (field: keyof AddCustomerFormData, value: string | number | string[]): string | null => {
    switch (field) {
      case 'name':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Name is required';
        }
        if (typeof value === 'string' && value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        if (typeof value === 'string' && value.length > 100) {
          return 'Name must be 100 characters or less';
        }
        if (typeof value === 'string' && !/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return 'Name contains invalid characters';
        }
        break;

      case 'company':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Company is required';
        }
        if (typeof value === 'string' && value.trim().length < 2) {
          return 'Company name must be at least 2 characters';
        }
        if (typeof value === 'string' && value.length > 200) {
          return 'Company name must be 200 characters or less';
        }
        if (typeof value === 'string' && !/^[a-zA-Z0-9\s\-.,&'()]+$/.test(value.trim())) {
          return 'Company name contains invalid characters';
        }
        break;

      case 'email':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Email is required';
        }
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address';
          }
          if (value.length > 254) {
            return 'Email address is too long';
          }
        }
        break;

      case 'healthScore':
        if (typeof value === 'number' && (value < 0 || value > 100)) {
          return 'Health score must be between 0 and 100';
        }
        break;

      case 'domains':
        if (Array.isArray(value) && value.length === 0) {
          return 'At least one domain is required';
        }
        if (Array.isArray(value)) {
          const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          const invalidDomains = value.filter(domain => !domainRegex.test(domain.trim()));
          if (invalidDomains.length > 0) {
            return `Invalid domain(s): ${invalidDomains.join(', ')}`;
          }
          if (value.length > 10) {
            return 'Maximum 10 domains allowed';
          }
        }
        break;
    }
    return null;
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {};
    
    // Parse domains for validation
    const domainList = domainsInput
      .split(',')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);

    // Validate each field
    Object.keys(formData).forEach(field => {
      const fieldKey = field as keyof AddCustomerFormData;
      const value = fieldKey === 'domains' ? domainList : formData[fieldKey];
      const error = validateField(fieldKey, value);
      if (error) {
        newErrors[fieldKey] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change with real-time validation
   */
  const handleInputChange = (field: keyof AddCustomerFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('');
    }

    // Real-time validation
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  };

  /**
   * Handle domains input change with validation
   */
  const handleDomainsChange = (value: string) => {
    setDomainsInput(value);
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('');
    }

    // Parse and validate domains in real-time
    const domainList = value
      .split(',')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
    
    const error = validateField('domains', domainList);
    setErrors(prev => ({
      ...prev,
      domains: error || undefined
    }));
  };

  /**
   * Submit form to API
   */
  const submitToAPI = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus first error field for accessibility
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(`customer-${firstErrorField}`);
        element?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const domainList = domainsInput
        .split(',')
        .map(domain => domain.trim().toLowerCase())
        .filter(domain => domain.length > 0);

      const customerData = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim().toLowerCase(),
        healthScore: formData.healthScore,
        subscriptionTier: formData.subscriptionTier,
        domains: domainList
      };

      const newCustomer = await submitToAPI(customerData);
      
      setSuccessMessage(`Customer "${newCustomer.name}" has been successfully created!`);
      
      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        healthScore: 50,
        subscriptionTier: 'basic',
        domains: []
      });
      setDomainsInput('');
      setErrors({});

      // Notify parent component
      onSubmit?.(newCustomer);

    } catch (error) {
      console.error('Failed to create customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer. Please try again.';
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get health score color and label for preview
   */
  const getHealthScorePreview = (score: number) => {
    if (score >= 71) return { 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      borderColor: 'border-green-200',
      label: 'Good',
      dotColor: 'bg-green-500'
    };
    if (score >= 31) return { 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100', 
      borderColor: 'border-yellow-200',
      label: 'Moderate',
      dotColor: 'bg-yellow-500'
    };
    return { 
      color: 'text-red-600', 
      bgColor: 'bg-red-100', 
      borderColor: 'border-red-200',
      label: 'Poor',
      dotColor: 'bg-red-500'
    };
  };

  const healthPreview = getHealthScorePreview(formData.healthScore);
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const formClasses = `${baseClasses} ${className}`;

  return (
    <div className={formClasses}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Add New Customer
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter customer details to add them to your customer database
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div 
          className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="customer-name"
            type="text"
            value={formData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter customer's full name"
            aria-describedby={errors.name ? 'name-error' : 'name-help'}
            aria-invalid={!!errors.name}
            disabled={isSubmitting}
            maxLength={100}
          />
          <p id="name-help" className="text-xs text-gray-500 mt-1">
            Customer's full name (2-100 characters, letters, spaces, apostrophes, and hyphens only)
          </p>
          {errors.name && (
            <p id="name-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="customer-company" className="block text-sm font-medium text-gray-700 mb-2">
            Company <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="customer-company"
            type="text"
            value={formData.company}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('company', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.company ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter company name"
            aria-describedby={errors.company ? 'company-error' : 'company-help'}
            aria-invalid={!!errors.company}
            disabled={isSubmitting}
            maxLength={200}
          />
          <p id="company-help" className="text-xs text-gray-500 mt-1">
            Company or organization name (2-200 characters)
          </p>
          {errors.company && (
            <p id="company-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.company}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="customer-email"
            type="email"
            value={formData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter email address"
            aria-describedby={errors.email ? 'email-error' : 'email-help'}
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
            maxLength={254}
          />
          <p id="email-help" className="text-xs text-gray-500 mt-1">
            Primary contact email address
          </p>
          {errors.email && (
            <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Score Field */}
          <div>
            <label htmlFor="customer-healthScore" className="block text-sm font-medium text-gray-700 mb-2">
              Health Score
            </label>
            <div className="space-y-3">
              <input
                id="customer-healthScore"
                type="range"
                min="0"
                max="100"
                value={formData.healthScore}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('healthScore', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="health-score-display health-score-help"
                disabled={isSubmitting}
              />
              
              {/* Health Score Preview */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">0 (Poor)</span>
                <div 
                  id="health-score-display" 
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${healthPreview.color} ${healthPreview.bgColor} ${healthPreview.borderColor}`}
                  role="status"
                  aria-label={`Current health score: ${formData.healthScore} out of 100, rated as ${healthPreview.label}`}
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${healthPreview.dotColor}`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium">
                    {formData.healthScore} ({healthPreview.label})
                  </span>
                </div>
                <span className="text-sm text-gray-500">100 (Good)</span>
              </div>
              
              <p id="health-score-help" className="text-xs text-gray-500">
                Customer health score affects priority and engagement strategies
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
            <label htmlFor="customer-subscriptionTier" className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Tier
            </label>
            <select
              id="customer-subscriptionTier"
              value={formData.subscriptionTier}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('subscriptionTier', e.target.value as 'basic' | 'premium' | 'enterprise')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
              disabled={isSubmitting}
              aria-describedby="subscription-help"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <p id="subscription-help" className="text-xs text-gray-500 mt-1">
              Customer's subscription level for service access
            </p>
          </div>
        </div>

        {/* Domains Field */}
        <div>
          <label htmlFor="customer-domains" className="block text-sm font-medium text-gray-700 mb-2">
            Domains <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="customer-domains"
            type="text"
            value={domainsInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleDomainsChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.domains ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="example.com, app.example.com, api.example.com"
            aria-describedby="domains-help domains-error"
            aria-invalid={!!errors.domains}
            disabled={isSubmitting}
          />
          <p id="domains-help" className="text-sm text-gray-500 mt-1">
            Separate multiple domains with commas (maximum 10 domains)
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
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Creating Customer..."
            size="medium"
            variant="primary"
            disabled={Object.keys(errors).some(key => errors[key as keyof FormValidationErrors])}
          >
            Create Customer
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}