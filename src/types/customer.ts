/**
 * Customer-related TypeScript interfaces and types
 * Provides enhanced type safety for customer management components
 */

import { Customer } from '@/data/mock-customers';

// Re-export Customer interface for consistency
export type { Customer };

/**
 * Form validation error types
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Customer operation result types
 */
export interface CustomerOperationResult {
  success: boolean;
  customer?: Customer;
  error?: string;
  validationErrors?: ValidationError[];
}

/**
 * Customer management state
 */
export interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error?: string;
  selectedCustomers: Customer[];
}

/**
 * Search and filter types
 */
export type SortField = 'name' | 'company' | 'healthScore' | 'subscriptionTier' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';
export type HealthScoreRange = 'all' | 'poor' | 'moderate' | 'good';
export type SubscriptionTier = 'basic' | 'premium' | 'enterprise';

export interface CustomerFilters {
  searchTerm?: string;
  healthScoreRange?: HealthScoreRange;
  subscriptionTier?: SubscriptionTier | 'all';
  sortField?: SortField;
  sortDirection?: SortDirection;
}

/**
 * Component prop types
 */
export interface BaseComponentProps {
  /** Optional additional CSS classes */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Component test ID */
  'data-testid'?: string;
}

export interface CustomerComponentProps extends BaseComponentProps {
  /** Customer data */
  customer: Customer;
  /** Loading state */
  isLoading?: boolean;
}

export interface CustomersComponentProps extends BaseComponentProps {
  /** Array of customers */
  customers?: Customer[];
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Event handler types
 */
export type CustomerEventHandler = (customer: Customer) => void;
export type CustomersEventHandler = (customers: Customer[]) => void;
export type CustomerFormEventHandler = (data: Omit<Customer, 'id'> | Customer) => void;

/**
 * Health score utility types
 */
export interface HealthScoreConfig {
  min: number;
  max: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

export type HealthScoreCategory = 'poor' | 'moderate' | 'good';

export const HEALTH_SCORE_RANGES: Record<HealthScoreCategory, HealthScoreConfig> = {
  poor: {
    min: 0,
    max: 30,
    label: 'Poor',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500'
  },
  moderate: {
    min: 31,
    max: 70,
    label: 'Moderate',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-500'
  },
  good: {
    min: 71,
    max: 100,
    label: 'Good',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500'
  }
};

/**
 * Accessibility types
 */
export interface AccessibilityProps {
  /** ARIA role */
  role?: string;
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** ARIA live region */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** ARIA expanded state */
  'aria-expanded'?: boolean;
  /** ARIA pressed state */
  'aria-pressed'?: boolean;
  /** ARIA disabled state */
  'aria-disabled'?: boolean;
  /** ARIA invalid state */
  'aria-invalid'?: boolean;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

/**
 * Keyboard navigation types
 */
export type KeyboardKey = 
  | 'Enter' 
  | 'Space' 
  | 'ArrowUp' 
  | 'ArrowDown' 
  | 'ArrowLeft' 
  | 'ArrowRight' 
  | 'Tab' 
  | 'Escape'
  | 'Home'
  | 'End';

export interface KeyboardEventConfig {
  key: KeyboardKey;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  timestamp: Date;
}

/**
 * Form validation types
 */
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export type FormFieldValidations = Record<string, FieldValidation>;

/**
 * Component size and variant types
 */
export type ComponentSize = 'small' | 'medium' | 'large';
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ComponentState = 'default' | 'loading' | 'disabled' | 'error' | 'success';

/**
 * Utility types for API operations
 */
export type CustomerId = string;
export type Timestamp = string; // ISO date string

export interface CreateCustomerRequest extends Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateCustomerRequest extends Partial<Omit<Customer, 'id' | 'createdAt'>> {
  id: CustomerId;
}
export interface DeleteCustomerRequest {
  id: CustomerId;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}