/**
 * Customer Statistics API Route Handler
 * Handles GET /api/customers/stats - Get customer health score statistics
 * Provides analytics for the Customer Intelligence Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { customerService } from '@/services/CustomerService';
import {
  createErrorResponse,
  getSecurityHeaders,
  checkRateLimit,
  getClientIP
} from '../validation';

/**
 * Statistics response schema
 */
const statsResponseSchema = z.object({
  healthScore: z.object({
    average: z.number().min(0).max(100),
    distribution: z.object({
      poor: z.number().min(0), // 0-30
      moderate: z.number().min(0), // 31-70
      good: z.number().min(0) // 71-100
    })
  }),
  total: z.number().min(0),
  timestamp: z.string().datetime()
});

export type StatsResponse = z.infer<typeof statsResponseSchema>;

/**
 * GET /api/customers/stats - Get customer statistics
 * Returns health score distribution and analytics
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

    // Get statistics from CustomerService
    const statistics = await customerService.getCustomerStatistics();

    const response: StatsResponse = {
      healthScore: {
        average: statistics.averageHealthScore,
        distribution: {
          poor: statistics.healthScoreDistribution.poor,
          moderate: statistics.healthScoreDistribution.moderate,
          good: statistics.healthScoreDistribution.good
        }
      },
      total: statistics.total,
      timestamp: new Date().toISOString()
    };

    // Validate response against schema (for type safety)
    const validatedResponse = statsResponseSchema.parse(response);

    return NextResponse.json(validatedResponse, {
      status: 200,
      headers: {
        ...getSecurityHeaders(),
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('GET /api/customers/stats error:', error);

    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred while fetching customer statistics',
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
      'POST method is not allowed on this endpoint. This is a read-only statistics endpoint.',
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
      'PUT method is not allowed on this endpoint. This is a read-only statistics endpoint.',
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
      'DELETE method is not allowed on this endpoint. This is a read-only statistics endpoint.',
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
      'PATCH method is not allowed on this endpoint. This is a read-only statistics endpoint.',
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