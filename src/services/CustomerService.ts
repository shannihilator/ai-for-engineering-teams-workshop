import { Customer, mockCustomers } from '../data/mock-customers';

export interface CustomerCreateData {
  name: string;
  company: string;
  email: string;
  healthScore: number;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
}

export interface CustomerUpdateData extends Partial<CustomerCreateData> {
  id: string;
}

export interface CustomerFilter {
  searchQuery?: string;
  minHealthScore?: number;
  maxHealthScore?: number;
  subscriptionTier?: string;
}

class CustomerServiceClass {
  private customers: Map<string, Customer> = new Map();
  private nextId = 9; // Start after existing mock data

  constructor() {
    // Initialize with existing mock data
    this.seedData();
  }

  private seedData(): void {
    mockCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
  }

  // Validation and sanitization functions
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private sanitizeString(input: string): string {
    // Remove HTML tags and trim whitespace
    return input.replace(/<[^>]*>/g, '').trim();
  }

  private validateHealthScore(score: number): boolean {
    return typeof score === 'number' && score >= 0 && score <= 100;
  }

  private validateDomains(domains: string[]): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    return domains.every(domain => domainRegex.test(domain));
  }

  private validateCustomerData(data: CustomerCreateData): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!data.company || data.company.trim().length === 0) {
      errors.push('Company is required');
    }

    if (!data.email || !this.validateEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!this.validateHealthScore(data.healthScore)) {
      errors.push('Health score must be between 0 and 100');
    }

    if (data.subscriptionTier && !['basic', 'premium', 'enterprise'].includes(data.subscriptionTier)) {
      errors.push('Invalid subscription tier');
    }

    if (data.domains && data.domains.length > 0 && !this.validateDomains(data.domains)) {
      errors.push('Invalid domain format');
    }

    return errors;
  }

  // CRUD operations
  createCustomer(data: CustomerCreateData): { success: boolean; customer?: Customer; errors?: string[] } {
    const validationErrors = this.validateCustomerData(data);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    // Check for duplicate email
    const existingCustomer = Array.from(this.customers.values()).find(
      customer => customer.email === data.email
    );
    if (existingCustomer) {
      return { success: false, errors: ['Email already exists'] };
    }

    const now = new Date().toISOString();
    const customer: Customer = {
      id: this.nextId.toString(),
      name: this.sanitizeString(data.name),
      company: this.sanitizeString(data.company),
      email: this.sanitizeString(data.email.toLowerCase()),
      healthScore: data.healthScore,
      subscriptionTier: data.subscriptionTier || 'basic',
      domains: data.domains || [],
      createdAt: now,
      updatedAt: now
    };

    this.customers.set(customer.id, customer);
    this.nextId++;

    return { success: true, customer };
  }

  getCustomer(id: string): Customer | null {
    return this.customers.get(id) || null;
  }

  getAllCustomers(filter?: CustomerFilter): Customer[] {
    let customers = Array.from(this.customers.values());

    if (!filter) {
      return customers;
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      customers = customers.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.company.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.domains?.some(domain => domain.toLowerCase().includes(query))
      );
    }

    if (typeof filter.minHealthScore === 'number') {
      customers = customers.filter(customer => customer.healthScore >= filter.minHealthScore!);
    }

    if (typeof filter.maxHealthScore === 'number') {
      customers = customers.filter(customer => customer.healthScore <= filter.maxHealthScore!);
    }

    if (filter.subscriptionTier) {
      customers = customers.filter(customer => customer.subscriptionTier === filter.subscriptionTier);
    }

    return customers;
  }

  updateCustomer(data: CustomerUpdateData): { success: boolean; customer?: Customer; errors?: string[] } {
    const existingCustomer = this.customers.get(data.id);
    if (!existingCustomer) {
      return { success: false, errors: ['Customer not found'] };
    }

    const updateData = {
      name: data.name || existingCustomer.name,
      company: data.company || existingCustomer.company,
      email: data.email || existingCustomer.email || '',
      healthScore: data.healthScore !== undefined ? data.healthScore : existingCustomer.healthScore,
      subscriptionTier: data.subscriptionTier || existingCustomer.subscriptionTier,
      domains: data.domains || existingCustomer.domains
    };

    const validationErrors = this.validateCustomerData(updateData);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    // Check for duplicate email (excluding current customer)
    if (data.email && data.email !== existingCustomer.email) {
      const duplicateCustomer = Array.from(this.customers.values()).find(
        customer => customer.email === data.email && customer.id !== data.id
      );
      if (duplicateCustomer) {
        return { success: false, errors: ['Email already exists'] };
      }
    }

    const updatedCustomer: Customer = {
      ...existingCustomer,
      name: this.sanitizeString(updateData.name),
      company: this.sanitizeString(updateData.company),
      email: this.sanitizeString(updateData.email.toLowerCase()),
      healthScore: updateData.healthScore,
      subscriptionTier: updateData.subscriptionTier,
      domains: updateData.domains,
      updatedAt: new Date().toISOString()
    };

    this.customers.set(data.id, updatedCustomer);

    return { success: true, customer: updatedCustomer };
  }

  deleteCustomer(id: string): { success: boolean; errors?: string[] } {
    const customer = this.customers.get(id);
    if (!customer) {
      return { success: false, errors: ['Customer not found'] };
    }

    this.customers.delete(id);
    return { success: true };
  }

  // Statistics and metadata
  getCustomerStats(): {
    total: number;
    averageHealthScore: number;
    subscriptionBreakdown: Record<string, number>;
    recentlyAdded: Customer[];
  } {
    const customers = Array.from(this.customers.values());
    const total = customers.length;
    const averageHealthScore = total > 0
      ? customers.reduce((sum, customer) => sum + customer.healthScore, 0) / total
      : 0;

    const subscriptionBreakdown = customers.reduce((breakdown, customer) => {
      const tier = customer.subscriptionTier || 'basic';
      breakdown[tier] = (breakdown[tier] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    // Get recently added customers (last 5)
    const recentlyAdded = customers
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);

    return {
      total,
      averageHealthScore: Math.round(averageHealthScore * 100) / 100,
      subscriptionBreakdown,
      recentlyAdded
    };
  }
}

// Singleton instance for in-memory storage simulation
export const CustomerService = new CustomerServiceClass();
