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

// Export MarketIntelligenceService and all related types and errors
export {
  MarketIntelligenceService,
  marketIntelligenceService,
  MarketIntelligenceError,
  MarketIntelligenceValidationError,
  MarketIntelligenceNotFoundError,
} from './MarketIntelligenceService';

export type {
  MarketIntelligenceData,
  MarketHeadline,
} from './MarketIntelligenceService';