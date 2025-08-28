/**
 * Market Intelligence API Route Handler
 * Handles GET /api/market-intelligence/[company] - Get market intelligence for a company
 * Implements enterprise-level security validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  marketIntelligenceService, 
  MarketIntelligenceValidationError, 
  MarketIntelligenceNotFoundError 
} from '@/services/MarketIntelligenceService';
import {
  createErrorResponse,
  handleValidationError,
  getSecurityHeaders,
  checkRateLimit,
  getClientIP,
  sanitizeInput
} from '@/app/api/customers/validation';

/**
 * Company parameter validation schema
 */
const companyParamSchema = z.object({
  company: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long (max 100 characters)')
    .regex(/^[a-zA-Z0-9\s\-.,&'()]+$/, 'Company name contains invalid characters')
    .trim()
});

/**
 * GET /api/market-intelligence/[company] - Get market intelligence for a company
 * Path parameters:
 * - company: Company name to analyze
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ company: string }> }
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

    // Extract and validate company parameter
    const resolvedParams = await params;
    const rawCompany = resolvedParams.company;

    if (!rawCompany) {
      return NextResponse.json(
        createErrorResponse(
          'MISSING_PARAMETER',
          'Company parameter is required',
          400
        ),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // URL decode the company parameter
    let decodedCompany: string;
    try {
      decodedCompany = decodeURIComponent(rawCompany);
    } catch {
      return NextResponse.json(
        createErrorResponse(
          'INVALID_PARAMETER',
          'Invalid company parameter encoding',
          400
        ),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Sanitize input
    const sanitizedCompany = sanitizeInput(decodedCompany);

    // Validate company parameter
    const validatedParams = companyParamSchema.parse({ company: sanitizedCompany });

    // Get market intelligence from MarketIntelligenceService
    const marketData = await marketIntelligenceService.getMarketIntelligence(validatedParams.company);

    return NextResponse.json(marketData, {
      status: 200,
      headers: getSecurityHeaders()
    });

  } catch (error) {
    console.error('GET /api/market-intelligence/[company] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        handleValidationError(error),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    if (error instanceof MarketIntelligenceValidationError) {
      return NextResponse.json(
        createErrorResponse(
          'VALIDATION_ERROR',
          error.message,
          400
        ),
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    if (error instanceof MarketIntelligenceNotFoundError) {
      return NextResponse.json(
        createErrorResponse(
          'NOT_FOUND',
          error.message,
          404
        ),
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while fetching market intelligence',
        500
      ),
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST() {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'POST method is not allowed on this endpoint. Use GET to retrieve market intelligence.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET'
      }
    }
  );
}

export async function PUT() {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'PUT method is not allowed on this endpoint. Use GET to retrieve market intelligence.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET'
      }
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'DELETE method is not allowed on this endpoint. Use GET to retrieve market intelligence.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET'
      }
    }
  );
}

export async function PATCH() {
  return NextResponse.json(
    createErrorResponse(
      'METHOD_NOT_ALLOWED',
      'PATCH method is not allowed on this endpoint. Use GET to retrieve market intelligence.',
      405
    ),
    { 
      status: 405, 
      headers: {
        ...getSecurityHeaders(),
        'Allow': 'GET'
      }
    }
  );
}