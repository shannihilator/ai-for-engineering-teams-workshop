/**
 * Services index - Central export point for all service layer components
 */

// Export CustomerService and all related types and errors
export {
  CustomerService,
  customerService,
  CustomerValidationError,
  CustomerNotFoundError,
  CustomerConflictError,
} from './CustomerService';

export type {
  CustomerSearchFilters,
  CustomerSortOptions,
  CustomerPaginationOptions,
  CustomerQueryOptions,
  CustomerQueryResult,
  CustomerStatistics,
  CreateCustomerInput,
  UpdateCustomerInput,
} from './CustomerService';