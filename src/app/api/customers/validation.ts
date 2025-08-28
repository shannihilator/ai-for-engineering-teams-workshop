/**
 * Comprehensive validation schemas and utilities for Customer API
 * Implements enterprise-level security validation with Zod
 */

import { z } from 'zod';
import { NextRequest } from 'next/server';

/**
 * Base validation schemas
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email too long') // RFC 5321 limit
  .toLowerCase()
  .trim();

export const domainSchema = z
  .string()
  .min(1, 'Domain cannot be empty')
  .max(253, 'Domain too long') // RFC 1035 limit
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    'Invalid domain format'
  )
  .toLowerCase()
  .trim();

export const healthScoreSchema = z
  .number()
  .int('Health score must be an integer')
  .min(0, 'Health score must be at least 0')
  .max(100, 'Health score must be at most 100');

export const subscriptionTierSchema = z.enum(['basic', 'premium', 'enterprise'], {
  message: 'Subscription tier must be basic, premium, or enterprise'
});

export const customerIdSchema = z
  .string()
  .min(1, 'ID is required')
  .refine(
    (id) => {
      // Accept UUID format or simple numeric IDs (for mock data compatibility)
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      const numericIdRegex = /^\d+$/;
      return uuidRegex.test(id) || numericIdRegex.test(id);
    },
    'Invalid ID format (must be UUID or numeric)'
  )
  .trim();

/**
 * Customer validation schemas
 */
export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .trim(),
  company: z
    .string()
    .min(1, 'Company is required')
    .max(200, 'Company name too long')
    .regex(/^[a-zA-Z0-9\s\-.,&'()]+$/, 'Company name contains invalid characters')
    .trim(),
  healthScore: healthScoreSchema,
  email: emailSchema.optional(),
  subscriptionTier: subscriptionTierSchema.optional(),
  domains: z
    .array(domainSchema)
    .max(10, 'Too many domains (maximum 10)')
    .optional()
    .default([])
});

export const updateCustomerSchema = createCustomerSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/**
 * Query parameter validation schemas
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .optional()
    .default('10')
});

export const filterSchema = z.object({
  subscriptionTier: subscriptionTierSchema.optional(),
  minHealthScore: z
    .string()
    .regex(/^\d+$/, 'Min health score must be a number')
    .transform(Number)
    .refine(n => n >= 0 && n <= 100, 'Min health score must be between 0 and 100')
    .optional(),
  maxHealthScore: z
    .string()
    .regex(/^\d+$/, 'Max health score must be a number')
    .transform(Number)
    .refine(n => n >= 0 && n <= 100, 'Max health score must be between 0 and 100')
    .optional(),
  search: z
    .string()
    .max(100, 'Search term too long')
    .regex(/^[a-zA-Z0-9\s@.-]+$/, 'Search contains invalid characters')
    .trim()
    .optional()
}).refine(
  (data) => {
    if (data.minHealthScore && data.maxHealthScore) {
      return data.minHealthScore <= data.maxHealthScore;
    }
    return true;
  },
  { message: 'Min health score must be less than or equal to max health score' }
);

export const queryParamsSchema = paginationSchema.merge(filterSchema);

/**
 * API response schemas
 */
export const customerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  healthScore: z.number(),
  email: z.string().optional(),
  subscriptionTier: subscriptionTierSchema.optional(),
  domains: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const paginatedResponseSchema = z.object({
  data: z.array(customerResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime()
});

/**
 * Utility types
 */
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;
export type CustomerResponse = z.infer<typeof customerResponseSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Security utilities
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) return true;
  
  const size = parseInt(contentLength, 10);
  const maxSize = 1024 * 1024; // 1MB limit
  
  return size <= maxSize;
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

/**
 * Rate limiting utilities (in-memory implementation)
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

/**
 * Error handling utilities
 */
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number
): ErrorResponse {
  return {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };
}

export function handleValidationError(error: z.ZodError): ErrorResponse {
  // Use the Zod error's issues property
  const issues = error.issues || [];
  const messages = issues.map(issue => {
    const path = issue.path && issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
  return createErrorResponse(
    'VALIDATION_ERROR',
    `Validation failed: ${messages.join(', ')}`,
    400
  );
}