/**
 * Customers Collection API Route Handler
 * Handles GET /api/customers (list/filter) and POST /api/customers (create)
 * Implements enterprise-level security validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { customerService, CustomerValidationError, CustomerNotFoundError, CustomerConflictError } from '@/services/CustomerService';
import {
  queryParamsSchema,
  createCustomerSchema,
  createErrorResponse,
  handleValidationError,
  getSecurityHeaders,
  checkRateLimit,
  getClientIP,
  validateRequestSize,
  sanitizeInput
} from './validation';

/**
 * GET /api/customers - List customers with filtering and pagination
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - subscriptionTier: Filter by subscription tier
 * - minHealthScore: Minimum health score filter
 * - maxHealthScore: Maximum health score filter
 * - search: Search in name, company, email, domains
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP, 100, 15 * 60 * 1000)) { // 100 requests per 15 minutes
      return NextResponse.json(
        createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', 429),
        { 
          status: 429, 
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': '900' // 15 minutes
          }
        }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Sanitize search input if present
    if (queryParams.search) {
      queryParams.search = sanitizeInput(queryParams.search);
    }

    const validatedParams = queryParamsSchema.parse(queryParams);
    
    // Convert query params to CustomerService format
    const options = {
      filters: {
        searchTerm: validatedParams.search,
        subscriptionTier: validatedParams.subscriptionTier,
        healthScoreMin: validatedParams.minHealthScore,
        healthScoreMax: validatedParams.maxHealthScore
      },
      pagination: {
        offset: (parseInt(validatedParams.page || '1') - 1) * parseInt(validatedParams.limit || '10'),
        limit: parseInt(validatedParams.limit || '10')
      }
    };

    // Get customers from CustomerService
    const serviceResult = await customerService.queryCustomers(options);
    
    // Convert to API response format
    const result = {
      data: serviceResult.customers,
      pagination: {
        page: parseInt(validatedParams.page || '1'),
        limit: parseInt(validatedParams.limit || '10'),
        total: serviceResult.total,
        totalPages: Math.ceil(serviceResult.total / parseInt(validatedParams.limit || '10'))
      }
    };

    return NextResponse.json(result, {
      status: 200,
      headers: getSecurityHeaders()
    });

  } catch (error) {
    console.error('GET /api/customers error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        handleValidationError(error),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while fetching customers',
        500
      ),
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/**
 * POST /api/customers - Create a new customer
 * Request body should contain customer data following createCustomerSchema
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for POST operations)
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP, 50, 15 * 60 * 1000)) { // 50 requests per 15 minutes
      return NextResponse.json(
        createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests', 429),
        { 
          status: 429, 
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': '900' // 15 minutes
          }
        }
      );
    }

    // Validate request size
    if (!validateRequestSize(request)) {
      return NextResponse.json(
        createErrorResponse(
          'PAYLOAD_TOO_LARGE',
          'Request payload exceeds maximum size limit',
          413
        ),
        { status: 413, headers: getSecurityHeaders() }
      );
    }

    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        createErrorResponse(
          'INVALID_CONTENT_TYPE',
          'Content-Type must be application/json',
          400
        ),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Parse request body
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(
          'INVALID_JSON',
          'Request body must be valid JSON',
          400
        ),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Validate request body against schema
    const validatedData = createCustomerSchema.parse(requestBody);

    // Create customer using CustomerService
    try {
      const newCustomer = await customerService.createCustomer(validatedData);
      
      return NextResponse.json(newCustomer, {
        status: 201,
        headers: getSecurityHeaders()
      });

    } catch (serviceError) {
      if (serviceError instanceof CustomerValidationError) {
        return NextResponse.json(
          createErrorResponse(
            'VALIDATION_ERROR',
            serviceError.message,
            400
          ),
          { status: 400, headers: getSecurityHeaders() }
        );
      }
      
      if (serviceError instanceof CustomerConflictError) {
        return NextResponse.json(
          createErrorResponse(
            'DUPLICATE_RESOURCE',
            serviceError.message,
            409
          ),
          { status: 409, headers: getSecurityHeaders() }
        );
      }

      throw serviceError; // Re-throw for generic error handling
    }

  } catch (error) {
    console.error('POST /api/customers error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        handleValidationError(error),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while creating the customer',
        500
      ),
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function PUT() {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'PUT method is not allowed on this endpoint. Use POST to create or PUT /api/customers/[id] to update.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET, POST'
      }
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'DELETE method is not allowed on this endpoint. Use DELETE /api/customers/[id] to delete a specific customer.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET, POST'
      }
    }
  );
}

export async function PATCH() {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'PATCH method is not allowed on this endpoint. Use PUT /api/customers/[id] to update.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET, POST'
      }
    }
  );
}