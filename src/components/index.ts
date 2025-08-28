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

// New API-integrated components
export { AddCustomerForm } from './AddCustomerForm';
export type { 
  AddCustomerFormProps, 
  AddCustomerFormData, 
  FormValidationErrors 
} from './AddCustomerForm';

export { CustomerListAPI } from './CustomerListAPI';
export type { 
  CustomerListAPIProps,
  SubscriptionFilter
} from './CustomerListAPI';

// Demo component showcasing integration
export { CustomerManagementDemo } from './CustomerManagementDemo';

// Market intelligence and health scoring components
export { MarketIntelligenceWidget } from './MarketIntelligenceWidget';
export type { 
  MarketIntelligenceWidgetProps,
  MarketIntelligenceData,
  MarketHeadline
} from './MarketIntelligenceWidget';

export { CustomerHealthDisplay } from './CustomerHealthDisplay';
export type { CustomerHealthDisplayProps } from './CustomerHealthDisplay';

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