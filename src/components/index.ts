/**
 * Customer Management Components Export Index
 * Provides centralized exports for all customer-related components
 */

// Core customer components
export { CustomerCard, CustomerCardGrid } from './CustomerCard';
export type { CustomerCardProps } from './CustomerCard';

export { CustomerSelector } from './CustomerSelector';
export type { CustomerSelectorProps } from './CustomerSelector';

export { CustomerActions } from './CustomerActions';
export type { CustomerActionsProps } from './CustomerActions';

export { CustomerForm } from './CustomerForm';
export type { CustomerFormProps, CustomerFormData, FormErrors } from './CustomerForm';

export { CustomerList } from './CustomerList';
export type { CustomerListProps, SortField, SortDirection, HealthFilter } from './CustomerList';

export { CustomerManagement } from './CustomerManagement';
export type { CustomerManagementProps, ViewMode } from './CustomerManagement';

// UI components
export { LoadingButton } from './ui/LoadingButton';
export type { LoadingButtonProps } from './ui/LoadingButton';

// Types and utilities
export type { 
  Customer,
  ValidationError,
  CustomerOperationResult,
  CustomerState,
  CustomerFilters,
  BaseComponentProps,
  CustomerComponentProps,
  CustomersComponentProps,
  CustomerEventHandler,
  CustomersEventHandler,
  CustomerFormEventHandler,
  HealthScoreConfig,
  HealthScoreCategory,
  AccessibilityProps,
  KeyboardKey,
  KeyboardEventConfig,
  Notification,
  NotificationType,
  FieldValidation,
  FormFieldValidations,
  ComponentSize,
  ComponentVariant,
  ComponentState,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  DeleteCustomerRequest,
  PaginationParams,
  PaginatedResponse
} from '@/types/customer';

export { HEALTH_SCORE_RANGES } from '@/types/customer';