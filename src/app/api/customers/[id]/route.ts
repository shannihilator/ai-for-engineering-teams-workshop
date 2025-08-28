/**
 * Individual Customer API Route Handler
 * Handles GET /api/customers/[id], PUT /api/customers/[id], DELETE /api/customers/[id]
 * Implements enterprise-level security validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { customerService, CustomerValidationError, CustomerNotFoundError, CustomerConflictError } from '@/services/CustomerService';
import {
  customerIdSchema,
  updateCustomerSchema,
  createErrorResponse,
  handleValidationError,
  getSecurityHeaders,
  checkRateLimit,
  getClientIP,
  validateRequestSize
} from '../validation';

/**
 * Route parameters interface
 */
interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/customers/[id] - Get a specific customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Validate customer ID parameter
    const { id } = await params;
    const validatedId = customerIdSchema.parse(id);

    // Get customer from CustomerService
    try {
      const customer = await customerService.getCustomerById(validatedId);
      
      return NextResponse.json(customer, {
        status: 200,
        headers: getSecurityHeaders()
      });
      
    } catch (serviceError) {
      if (serviceError instanceof CustomerNotFoundError) {
        return NextResponse.json(
          createErrorResponse(
            'CUSTOMER_NOT_FOUND',
            serviceError.message,
            404
          ),
          { status: 404, headers: getSecurityHeaders() }
        );
      }
      
      throw serviceError; // Re-throw for generic error handling
    }

  } catch (error) {
    console.error('GET /api/customers/[id] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        handleValidationError(error),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while fetching the customer',
        500
      ),
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/**
 * PUT /api/customers/[id] - Update a specific customer
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Rate limiting (stricter for PUT operations)
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

    // Validate customer ID parameter
    const { id } = await params;
    const validatedId = customerIdSchema.parse(id);

    // CustomerService will handle existence check internally

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
    const validatedData = updateCustomerSchema.parse(requestBody);

    // Update customer using CustomerService
    try {
      const updatedCustomer = await customerService.updateCustomer(validatedId, validatedData);

      return NextResponse.json(updatedCustomer, {
        status: 200,
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
      
      if (serviceError instanceof CustomerNotFoundError) {
        return NextResponse.json(
          createErrorResponse(
            'CUSTOMER_NOT_FOUND',
            serviceError.message,
            404
          ),
          { status: 404, headers: getSecurityHeaders() }
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
    console.error('PUT /api/customers/[id] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        handleValidationError(error),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while updating the customer',
        500
      ),
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/**
 * DELETE /api/customers/[id] - Delete a specific customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Rate limiting (stricter for DELETE operations)
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP, 30, 15 * 60 * 1000)) { // 30 requests per 15 minutes
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

    // Validate customer ID parameter
    const { id } = await params;
    const validatedId = customerIdSchema.parse(id);

    // Delete customer using CustomerService
    try {
      await customerService.deleteCustomer(validatedId);

      // Return 204 No Content for successful deletion
      return new NextResponse(null, {
        status: 204,
        headers: getSecurityHeaders()
      });

    } catch (serviceError) {
      if (serviceError instanceof CustomerNotFoundError) {
        return NextResponse.json(
          createErrorResponse(
            'CUSTOMER_NOT_FOUND',
            serviceError.message,
            404
          ),
          { status: 404, headers: getSecurityHeaders() }
        );
      }
      
      throw serviceError; // Re-throw for generic error handling
    }

  } catch (error) {
    console.error('DELETE /api/customers/[id] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        handleValidationError(error),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while deleting the customer',
        500
      ),
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'POST method is not allowed on this endpoint. Use POST /api/customers to create a new customer.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET, PUT, DELETE'
      }
    }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'PATCH method is not allowed on this endpoint. Use PUT to update a customer.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET, PUT, DELETE'
      }
    }
  );
}