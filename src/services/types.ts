/**
 * Type definitions for CustomerService operations
 * Shared types and interfaces for customer service layer
 */

import { Customer } from '@/data/mock-customers';

// Export Customer type for convenience
export type { Customer } from '@/data/mock-customers';

// Input types for customer operations
export interface CreateCustomerInput {
  name: string;
  company: string;
  healthScore: number;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
}

export interface UpdateCustomerInput {
  name?: string;
  company?: string;
  healthScore?: number;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
}

// Filter and search types
export interface CustomerFilters {
  healthScoreMin?: number;
  healthScoreMax?: number;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  searchTerm?: string; // Search by name, company, or email
  domains?: string[]; // Filter by specific domains
}

export interface CustomerSortOptions {
  field: 'name' | 'company' | 'healthScore' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  offset?: number;
  limit?: number;
}

// Response types
export interface CustomerSearchResult {
  customers: Customer[];
  total: number;
  hasMore: boolean;
}

export interface CustomerStatistics {
  total: number;
  bySubscriptionTier: Record<string, number>;
  byHealthScoreRange: { poor: number; moderate: number; good: number };
  averageHealthScore: number;
}

// Batch operation types
export interface CustomerBatchCreate {
  data: CreateCustomerInput[];
}

export interface CustomerBatchUpdate {
  updates: { id: string; data: UpdateCustomerInput }[];
}

export interface CustomerBatchResult<T> {
  successful: T[];
  errors: { index?: number; id?: string; error: Error }[];
}

// Error types for better error handling
export interface ValidationFieldErrors {
  [field: string]: string[];
}

export interface ServiceError {
  name: string;
  message: string;
  fieldErrors?: ValidationFieldErrors;
  batchErrors?: { index?: number; id?: string; error: Error }[];
}

// Health score classification helpers
export type HealthScoreRange = 'poor' | 'moderate' | 'good';

export const getHealthScoreRange = (score: number): HealthScoreRange => {
  if (score <= 30) return 'poor';
  if (score <= 70) return 'moderate';
  return 'good';
};

export const getHealthScoreColor = (score: number): string => {
  const range = getHealthScoreRange(score);
  switch (range) {
    case 'poor': return 'red';
    case 'moderate': return 'yellow';
    case 'good': return 'green';
    default: return 'gray';
  }
};

// Subscription tier helpers
export const SUBSCRIPTION_TIERS = ['basic', 'premium', 'enterprise'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

export const isValidSubscriptionTier = (tier: string): tier is SubscriptionTier => {
  return SUBSCRIPTION_TIERS.includes(tier as SubscriptionTier);
};