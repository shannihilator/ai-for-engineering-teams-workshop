/**
 * CustomerService - Service layer for customer data operations
 * Provides clean abstraction between API routes and data storage with comprehensive CRUD operations
 */

import { Customer, mockCustomers } from '@/data/mock-customers';

// Types and Interfaces
export interface CustomerSearchFilters {
  searchTerm?: string;
  healthScoreMin?: number;
  healthScoreMax?: number;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
  createdAfter?: string;
  createdBefore?: string;
}

export interface CustomerSortOptions {
  field: keyof Customer;
  direction: 'asc' | 'desc';
}

export interface CustomerPaginationOptions {
  offset?: number;
  limit?: number;
}

export interface CustomerQueryOptions {
  filters?: CustomerSearchFilters;
  sort?: CustomerSortOptions;
  pagination?: CustomerPaginationOptions;
}

export interface CustomerQueryResult {
  customers: Customer[];
  total: number;
  hasMore: boolean;
}

export interface CustomerStatistics {
  total: number;
  healthScoreDistribution: {
    poor: number; // 0-30
    moderate: number; // 31-70
    good: number; // 71-100
  };
  subscriptionTierDistribution: {
    basic: number;
    premium: number;
    enterprise: number;
  };
  averageHealthScore: number;
}

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

// Custom Error Classes
export class CustomerValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'CustomerValidationError';
  }
}

export class CustomerNotFoundError extends Error {
  constructor(id: string) {
    super(`Customer with ID ${id} not found`);
    this.name = 'CustomerNotFoundError';
  }
}

export class CustomerConflictError extends Error {
  constructor(message: string, public conflictField?: string) {
    super(message);
    this.name = 'CustomerConflictError';
  }
}

/**
 * CustomerService class providing comprehensive CRUD operations with business logic validation
 */
export class CustomerService {
  private static instance: CustomerService;
  private customers: Customer[];
  private nextId: number;

  private constructor() {
    // Initialize with mock data
    this.customers = [...mockCustomers];
    this.nextId = Math.max(...this.customers.map(c => parseInt(c.id))) + 1;
  }

  /**
   * Get singleton instance of CustomerService
   */
  public static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }
    return CustomerService.instance;
  }

  /**
   * Validate customer data according to business rules
   */
  private validateCustomerData(data: CreateCustomerInput | UpdateCustomerInput, isUpdate = false): void {
    // Name validation
    if (!isUpdate && !data.name) {
      throw new CustomerValidationError('Customer name is required', 'name', 'REQUIRED');
    }
    if (data.name && (data.name.length < 2 || data.name.length > 100)) {
      throw new CustomerValidationError('Customer name must be between 2 and 100 characters', 'name', 'LENGTH');
    }

    // Company validation
    if (!isUpdate && !data.company) {
      throw new CustomerValidationError('Company name is required', 'company', 'REQUIRED');
    }
    if (data.company && (data.company.length < 2 || data.company.length > 200)) {
      throw new CustomerValidationError('Company name must be between 2 and 200 characters', 'company', 'LENGTH');
    }

    // Health score validation
    if (!isUpdate && data.healthScore === undefined) {
      throw new CustomerValidationError('Health score is required', 'healthScore', 'REQUIRED');
    }
    if (data.healthScore !== undefined) {
      if (!Number.isInteger(data.healthScore) || data.healthScore < 0 || data.healthScore > 100) {
        throw new CustomerValidationError('Health score must be an integer between 0 and 100', 'healthScore', 'RANGE');
      }
    }

    // Email validation (RFC 5321 compliant)
    if (data.email) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(data.email)) {
        throw new CustomerValidationError('Invalid email format', 'email', 'FORMAT');
      }
      if (data.email.length > 254) {
        throw new CustomerValidationError('Email address too long (max 254 characters)', 'email', 'LENGTH');
      }
    }

    // Subscription tier validation
    if (data.subscriptionTier && !['basic', 'premium', 'enterprise'].includes(data.subscriptionTier)) {
      throw new CustomerValidationError('Subscription tier must be basic, premium, or enterprise', 'subscriptionTier', 'ENUM');
    }

    // Domains validation
    if (data.domains) {
      if (data.domains.length > 10) {
        throw new CustomerValidationError('Maximum 10 domains allowed per customer', 'domains', 'LENGTH');
      }
      
      const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
      for (const domain of data.domains) {
        if (!domainRegex.test(domain)) {
          throw new CustomerValidationError(`Invalid domain format: ${domain}`, 'domains', 'FORMAT');
        }
        if (domain.length > 253) {
          throw new CustomerValidationError(`Domain too long: ${domain}`, 'domains', 'LENGTH');
        }
      }
    }
  }

  /**
   * Check for duplicate customers
   */
  private checkForDuplicates(data: CreateCustomerInput | UpdateCustomerInput, excludeId?: string): void {
    // Check for duplicate email
    if (data.email) {
      const duplicate = this.customers.find(c => 
        c.email?.toLowerCase() === data.email?.toLowerCase() && c.id !== excludeId
      );
      if (duplicate) {
        throw new CustomerConflictError(`Customer with email ${data.email} already exists`, 'email');
      }
    }

    // Check for duplicate name/company combination
    if (data.name && data.company) {
      const duplicate = this.customers.find(c => 
        c.name.toLowerCase() === data.name?.toLowerCase() && 
        c.company.toLowerCase() === data.company?.toLowerCase() && 
        c.id !== excludeId
      );
      if (duplicate) {
        throw new CustomerConflictError(`Customer ${data.name} at ${data.company} already exists`, 'name_company');
      }
    }
  }

  /**
   * Generate unique customer ID
   */
  private generateId(): string {
    return (this.nextId++).toString();
  }

  /**
   * Generate ISO timestamp
   */
  private generateTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Get health score category
   */
  private getHealthScoreCategory(score: number): 'poor' | 'moderate' | 'good' {
    if (score <= 30) return 'poor';
    if (score <= 70) return 'moderate';
    return 'good';
  }

  /**
   * Apply search filters to customer array
   */
  private applyFilters(customers: Customer[], filters: CustomerSearchFilters): Customer[] {
    return customers.filter(customer => {
      // Search term filter (searches name, company, email, domains)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          customer.name.toLowerCase().includes(searchLower) ||
          customer.company.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.domains?.some(domain => domain.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Health score range filter
      if (filters.healthScoreMin !== undefined && customer.healthScore < filters.healthScoreMin) {
        return false;
      }
      if (filters.healthScoreMax !== undefined && customer.healthScore > filters.healthScoreMax) {
        return false;
      }

      // Subscription tier filter
      if (filters.subscriptionTier && customer.subscriptionTier !== filters.subscriptionTier) {
        return false;
      }

      // Domains filter
      if (filters.domains && filters.domains.length > 0) {
        const hasMatchingDomain = customer.domains?.some(domain =>
          filters.domains!.some(filterDomain => domain.includes(filterDomain))
        );
        if (!hasMatchingDomain) return false;
      }

      // Date range filters
      if (filters.createdAfter && customer.createdAt && customer.createdAt < filters.createdAfter) {
        return false;
      }
      if (filters.createdBefore && customer.createdAt && customer.createdAt > filters.createdBefore) {
        return false;
      }

      return true;
    });
  }

  /**
   * Apply sorting to customer array
   */
  private applySorting(customers: Customer[], sort: CustomerSortOptions): Customer[] {
    return customers.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      let comparison = 0;
      
      if (aValue === undefined && bValue === undefined) {
        comparison = 0;
      } else if (aValue === undefined) {
        comparison = 1;
      } else if (bValue === undefined) {
        comparison = -1;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Apply pagination to customer array
   */
  private applyPagination(customers: Customer[], pagination: CustomerPaginationOptions): Customer[] {
    const offset = pagination.offset || 0;
    const limit = pagination.limit || 50;
    
    return customers.slice(offset, offset + limit);
  }

  // CRUD Operations

  /**
   * Create a new customer
   */
  public async createCustomer(data: CreateCustomerInput): Promise<Customer> {
    this.validateCustomerData(data);
    this.checkForDuplicates(data);

    const now = this.generateTimestamp();
    const newCustomer: Customer = {
      id: this.generateId(),
      name: data.name,
      company: data.company,
      healthScore: data.healthScore,
      email: data.email,
      subscriptionTier: data.subscriptionTier || 'basic',
      domains: data.domains || [],
      createdAt: now,
      updatedAt: now,
    };

    this.customers.push(newCustomer);
    return newCustomer;
  }

  /**
   * Get customer by ID
   */
  public async getCustomerById(id: string): Promise<Customer> {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) {
      throw new CustomerNotFoundError(id);
    }
    return customer;
  }

  /**
   * Query customers with advanced filtering, sorting, and pagination
   */
  public async queryCustomers(options: CustomerQueryOptions = {}): Promise<CustomerQueryResult> {
    let result = [...this.customers];

    // Apply filters
    if (options.filters) {
      result = this.applyFilters(result, options.filters);
    }

    const total = result.length;

    // Apply sorting
    if (options.sort) {
      result = this.applySorting(result, options.sort);
    }

    // Apply pagination
    const pagination = options.pagination || {};
    const offset = pagination.offset || 0;
    const limit = pagination.limit || 50;
    
    const paginatedResult = this.applyPagination(result, pagination);
    const hasMore = offset + limit < total;

    return {
      customers: paginatedResult,
      total,
      hasMore,
    };
  }

  /**
   * Update customer by ID
   */
  public async updateCustomer(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const customerIndex = this.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      throw new CustomerNotFoundError(id);
    }

    this.validateCustomerData(data, true);
    this.checkForDuplicates(data, id);

    const existingCustomer = this.customers[customerIndex];
    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...data,
      updatedAt: this.generateTimestamp(),
    };

    this.customers[customerIndex] = updatedCustomer;
    return updatedCustomer;
  }

  /**
   * Delete customer by ID (hard delete)
   */
  public async deleteCustomer(id: string): Promise<void> {
    const customerIndex = this.customers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      throw new CustomerNotFoundError(id);
    }

    this.customers.splice(customerIndex, 1);
  }

  /**
   * Bulk create customers
   */
  public async bulkCreateCustomers(customersData: CreateCustomerInput[]): Promise<{
    created: Customer[];
    errors: { index: number; error: Error }[];
  }> {
    const created: Customer[] = [];
    const errors: { index: number; error: Error }[] = [];

    for (let i = 0; i < customersData.length; i++) {
      try {
        const customer = await this.createCustomer(customersData[i]);
        created.push(customer);
      } catch (error) {
        errors.push({ index: i, error: error as Error });
      }
    }

    return { created, errors };
  }

  /**
   * Bulk update customers
   */
  public async bulkUpdateCustomers(updates: { id: string; data: UpdateCustomerInput }[]): Promise<{
    updated: Customer[];
    errors: { id: string; error: Error }[];
  }> {
    const updated: Customer[] = [];
    const errors: { id: string; error: Error }[] = [];

    for (const update of updates) {
      try {
        const customer = await this.updateCustomer(update.id, update.data);
        updated.push(customer);
      } catch (error) {
        errors.push({ id: update.id, error: error as Error });
      }
    }

    return { updated, errors };
  }

  /**
   * Bulk delete customers
   */
  public async bulkDeleteCustomers(ids: string[]): Promise<{
    deleted: string[];
    errors: { id: string; error: Error }[];
  }> {
    const deleted: string[] = [];
    const errors: { id: string; error: Error }[] = [];

    for (const id of ids) {
      try {
        await this.deleteCustomer(id);
        deleted.push(id);
      } catch (error) {
        errors.push({ id, error: error as Error });
      }
    }

    return { deleted, errors };
  }

  /**
   * Get customer statistics
   */
  public async getCustomerStatistics(): Promise<CustomerStatistics> {
    const total = this.customers.length;
    
    const healthScoreDistribution = this.customers.reduce(
      (acc, customer) => {
        const category = this.getHealthScoreCategory(customer.healthScore);
        acc[category]++;
        return acc;
      },
      { poor: 0, moderate: 0, good: 0 }
    );

    const subscriptionTierDistribution = this.customers.reduce(
      (acc, customer) => {
        const tier = customer.subscriptionTier || 'basic';
        acc[tier]++;
        return acc;
      },
      { basic: 0, premium: 0, enterprise: 0 }
    );

    const averageHealthScore = total > 0 
      ? Math.round(this.customers.reduce((sum, c) => sum + c.healthScore, 0) / total)
      : 0;

    return {
      total,
      healthScoreDistribution,
      subscriptionTierDistribution,
      averageHealthScore,
    };
  }

  /**
   * Search customers by multiple criteria
   */
  public async searchCustomers(
    searchTerm: string,
    filters?: Omit<CustomerSearchFilters, 'searchTerm'>,
    sort?: CustomerSortOptions,
    pagination?: CustomerPaginationOptions
  ): Promise<CustomerQueryResult> {
    return this.queryCustomers({
      filters: { ...filters, searchTerm },
      sort,
      pagination,
    });
  }

  /**
   * Get all customers (convenience method)
   */
  public async getAllCustomers(): Promise<Customer[]> {
    return [...this.customers];
  }

  /**
   * Reset to original mock data (utility for testing)
   */
  public resetToMockData(): void {
    this.customers = [...mockCustomers];
    this.nextId = Math.max(...this.customers.map(c => parseInt(c.id))) + 1;
  }
}

// Export singleton instance
export const customerService = CustomerService.getInstance();