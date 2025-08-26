import { NextRequest, NextResponse } from 'next/server';
import { generateMockMarketData, calculateMockSentiment } from '../../../data/mock-market-intelligence';

/**
 * Market intelligence response interface
 */
interface MarketIntelligenceResponse {
  company: string;
  sentiment: {
    score: number; // -1 to 1
    label: 'positive' | 'neutral' | 'negative';
    confidence: number; // 0 to 1
  };
  news: {
    articleCount: number;
    headlines: Array<{
      title: string;
      source: string;
      publishedAt: string;
      url?: string;
    }>;
  };
  timestamp: string;
  error?: string;
}

/**
 * Validates and sanitizes company name input to prevent injection attacks
 * @param company - Raw company name input from URL parameter
 * @returns Sanitized company name or null if invalid
 */
function validateAndSanitizeCompany(company: string): string | null {
  if (!company || typeof company !== 'string') {
    return null;
  }

  // Remove any whitespace and normalize
  const cleanCompany = company.trim();

  // Company name validation - allows letters, numbers, spaces, and common business punctuation
  const companyRegex = /^[a-zA-Z0-9\s\-\.\&\,\'\"]+$/;

  if (!companyRegex.test(cleanCompany)) {
    return null;
  }

  // Length validation - reasonable company name length
  if (cleanCompany.length < 1 || cleanCompany.length > 100) {
    return null;
  }

  // Prevent common attack vectors and nonsensical inputs
  const blockedPatterns = [
    'javascript:',
    '<script',
    'data:',
    'vbscript:',
    'onload=',
    'onerror=',
    'eval(',
    'alert(',
    'document.cookie'
  ];

  if (blockedPatterns.some(pattern => cleanCompany.toLowerCase().includes(pattern))) {
    return null;
  }

  return cleanCompany;
}



/**
 * Fetches market intelligence data using mock data for workshop
 * @param company - Validated company name
 * @returns Promise with market intelligence data
 */
async function fetchMarketIntelligence(company: string): Promise<MarketIntelligenceResponse> {

  try {
    // Simulate API delay for realistic workshop experience
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    // Generate mock news data for workshop demonstration
    const mockNewsData = generateMockMarketData(company);

    // Analyze sentiment from headlines
    const sentiment = calculateMockSentiment(mockNewsData.headlines);

    return {
      company,
      sentiment,
      news: mockNewsData,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Market intelligence fetch failed for ${company}:`, error);

    // Handle different types of errors
    let errorMessage = 'Market intelligence unavailable';
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
      company,
      sentiment: {
        score: 0,
        label: 'neutral',
        confidence: 0
      },
      news: {
        articleCount: 0,
        headlines: []
      },
      timestamp: new Date().toISOString(),
      error: errorMessage
    };
  }
}

/**
 * GET handler for market intelligence API route
 * @param request - Next.js request object
 * @param params - Route parameters containing company
 * @returns JSON response with market intelligence data
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ company: string }> }
) {
  try {
    const { company: rawCompany } = await params;

    // Validate and sanitize company input
    const validCompany = validateAndSanitizeCompany(rawCompany);

    if (!validCompany) {
      return NextResponse.json(
        {
          error: 'Invalid company name format',
          message: 'Please provide a valid company name'
        },
        { status: 400 }
      );
    }

    // Fetch market intelligence with timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });

    const intelligenceCheck = fetchMarketIntelligence(validCompany);

    const result = await Promise.race([intelligenceCheck, timeoutPromise]);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=600', // 10-minute cache
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
        message: 'Unable to fetch market intelligence at this time'
      },
      { status: 500 }
    );
  }
}
