'use client';

import React, { useState } from 'react';
import { Customer } from '../data/mock-customers';

interface AddCustomerFormProps {
  onSuccess?: (customer: Customer) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  name: string;
  company: string;
  email: string;
  healthScore: string;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  domains: string[];
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  healthScore?: string;
  domains?: string;
  general?: string;
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    healthScore: '',
    subscriptionTier: 'basic',
    domains: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainInput, setDomainInput] = useState('');

  // Real-time validation
  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'company':
        if (!value || value.trim().length === 0) return 'Company is required';
        if (value.trim().length < 2) return 'Company must be at least 2 characters';
        break;
      case 'email':
        if (!value || value.trim().length === 0) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      case 'healthScore':
        if (!value || value === '') return 'Health score is required';
        const score = Number(value);
        if (isNaN(score)) return 'Health score must be a number';
        if (score < 0 || score > 100) return 'Health score must be between 0 and 100';
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error and validate
    const fieldError = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: fieldError, general: undefined }));
  };

  const handleAddDomain = () => {
    if (!domainInput.trim()) return;

    const domain = domainInput.trim().toLowerCase();
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

    if (!domainRegex.test(domain)) {
      setErrors(prev => ({ ...prev, domains: 'Please enter a valid domain format' }));
      return;
    }

    if (formData.domains.includes(domain)) {
      setErrors(prev => ({ ...prev, domains: 'Domain already added' }));
      return;
    }

    setFormData(prev => ({ ...prev, domains: [...prev.domains, domain] }));
    setDomainInput('');
    setErrors(prev => ({ ...prev, domains: undefined }));
  };

  const handleRemoveDomain = (index: number) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateField('name', formData.name);
    newErrors.company = validateField('company', formData.company);
    newErrors.email = validateField('email', formData.email);
    newErrors.healthScore = validateField('healthScore', formData.healthScore);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          healthScore: Number(formData.healthScore),
          subscriptionTier: formData.subscriptionTier,
          domains: formData.domains
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setErrors({ general: result.message || 'Failed to create customer' });
        return;
      }

      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        healthScore: '',
        subscriptionTier: 'basic',
        domains: []
      });

      if (onSuccess) {
        onSuccess(result.data);
      }

    } catch (error) {
      console.error('Error creating customer:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Customer</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close form"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Name Field */}
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            id="customer-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter customer name"
            aria-describedby={errors.name ? 'name-error' : undefined}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="customer-company" className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <input
            id="customer-company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter company name"
            aria-describedby={errors.company ? 'company-error' : undefined}
            disabled={isSubmitting}
          />
          {errors.company && (
            <p id="company-error" className="mt-1 text-sm text-red-600">{errors.company}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            id="customer-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Health Score Field */}
        <div>
          <label htmlFor="customer-health-score" className="block text-sm font-medium text-gray-700 mb-2">
            Health Score (0-100) *
          </label>
          <input
            id="customer-health-score"
            type="number"
            min="0"
            max="100"
            value={formData.healthScore}
            onChange={(e) => handleInputChange('healthScore', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.healthScore ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter health score"
            aria-describedby={errors.healthScore ? 'health-score-error' : undefined}
            disabled={isSubmitting}
          />
          {errors.healthScore && (
            <p id="health-score-error" className="mt-1 text-sm text-red-600">{errors.healthScore}</p>
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
            onChange={(e) => handleInputChange('subscriptionTier', e.target.value as 'basic' | 'premium' | 'enterprise')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Domains Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domains (Optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDomain())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter domain (e.g., example.com)"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleAddDomain}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Add
            </button>
          </div>
          {errors.domains && (
            <p className="text-sm text-red-600 mb-2">{errors.domains}</p>
          )}
          {formData.domains.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.domains.map((domain, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full"
                >
                  {domain}
                  <button
                    type="button"
                    onClick={() => handleRemoveDomain(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    disabled={isSubmitting}
                    aria-label={`Remove ${domain}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isSubmitting ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomerForm;
