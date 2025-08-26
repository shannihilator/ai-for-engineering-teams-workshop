import { NextRequest, NextResponse } from 'next/server';

/**
 * Domain health response interface
 */
interface DomainHealthResponse {
  domain: string;
  isHealthy: boolean;
  responseTime: number;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  error?: string;
}

/**
 * Validates and sanitizes domain input to prevent injection attacks
 * @param domain - Raw domain input from URL parameter
 * @returns Sanitized domain or null if invalid
 */
function validateAndSanitizeDomain(domain: string): string | null {
  if (!domain || typeof domain !== 'string') {
    return null;
  }

  // Remove any whitespace and convert to lowercase
  const cleanDomain = domain.trim().toLowerCase();
  
  // Basic domain validation regex - allows letters, numbers, dots, and hyphens
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!domainRegex.test(cleanDomain)) {
    return null;
  }

  // Prevent private/local domains and common attack vectors
  const blockedPatterns = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '192.168.',
    '10.',
    '172.16.',
    'metadata.google.internal',
    'ipipis.com'
  ];

  if (blockedPatterns.some(pattern => cleanDomain.includes(pattern))) {
    return null;
  }

  return cleanDomain;
}

/**
 * Checks domain health using Stillriver API
 * @param domain - Validated domain name
 * @returns Promise with domain health data
 */
async function checkDomainHealth(domain: string): Promise<DomainHealthResponse> {
  const startTime = Date.now();
  
  try {
    // Call Stillriver API to check domain health
    const stillriverUrl = `https://api.stillriver.info/api/domain/health/${encodeURIComponent(domain)}`;
    
    const response = await fetch(stillriverUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Customer-Intelligence-Dashboard/1.0'
      },
      // Set timeout to prevent hanging requests
      signal: AbortSignal.timeout(4000)
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      // Handle API errors gracefully
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Stillriver API error for ${domain}:`, response.status, errorText);
      
      return {
        domain,
        isHealthy: false,
        responseTime,
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: `API error: ${response.status}`
      };
    }

    const apiData = await response.json();
    
    // Parse Stillriver API response and map to our format
    // Note: Adjust this mapping based on actual Stillriver API response format
    const isHealthy = apiData.status === 'online' || apiData.accessible === true || apiData.healthy === true;
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (isHealthy && responseTime < 1000) {
      status = 'healthy';
    } else if (isHealthy && responseTime < 3000) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      domain,
      isHealthy,
      responseTime,
      timestamp: new Date().toISOString(),
      status
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Domain health check failed for ${domain}:`, error);
    
    // Handle different types of errors
    let errorMessage = 'Health check failed';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error';
      } else {
        errorMessage = 'Service unavailable';
      }
    }
    
    return {
      domain,
      isHealthy: false,
      responseTime,
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: errorMessage
    };
  }
}

/**
 * GET handler for domain health API route
 * @param request - Next.js request object
 * @param params - Route parameters containing domain
 * @returns JSON response with domain health data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain: rawDomain } = params;
    
    // Validate and sanitize domain input
    const validDomain = validateAndSanitizeDomain(rawDomain);
    
    if (!validDomain) {
      return NextResponse.json(
        { 
          error: 'Invalid domain format',
          message: 'Please provide a valid domain name'
        },
        { status: 400 }
      );
    }

    // Check domain health with timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });

    const healthCheck = checkDomainHealth(validDomain);
    
    const result = await Promise.race([healthCheck, timeoutPromise]);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5-minute cache
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('API route error:', error);
    
    // Sanitize error message to prevent information leakage
    const sanitizedError = error instanceof Error && error.message === 'Request timeout' 
      ? 'Request timeout' 
      : 'Internal server error';
    
    return NextResponse.json(
      { 
        error: sanitizedError,
        message: 'Unable to check domain health at this time'
      },
      { status: 500 }
    );
  }
}