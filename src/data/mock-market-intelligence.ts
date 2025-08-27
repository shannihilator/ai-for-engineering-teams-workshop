/**
 * Mock market intelligence data for workshop demonstration
 * Provides realistic company news and sentiment data without external API dependencies
 */

export interface MockHeadline {
  title: string;
  source: string;
  publishedAt: string;
  url?: string;
}

export interface MockMarketData {
  articleCount: number;
  headlines: MockHeadline[];
}

/**
 * Generates mock news headlines based on company name
 * @param company - Company name
 * @returns Mock news data with realistic headlines
 */
export function generateMockMarketData(company: string): MockMarketData {
  const mockHeadlines: MockHeadline[] = [
    {
      title: `${company} Reports Strong Q4 Earnings, Beating Analyst Expectations`,
      source: 'Financial News Today',
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: `${company} Announces New Strategic Partnership to Drive Innovation`,
      source: 'Tech Business Weekly',
      publishedAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString()
    },
    {
      title: `Market Analysis: ${company} Stock Shows Positive Momentum`,
      source: 'Investment Daily',
      publishedAt: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Add company-specific headlines for better workshop experience
  const companyLower = company.toLowerCase();

  if (companyLower.includes('tech') || companyLower.includes('apple') || companyLower.includes('google')) {
    mockHeadlines.push({
      title: `${company} Unveils Breakthrough Technology That Could Transform the Industry`,
      source: 'TechCrunch',
      publishedAt: new Date(Date.now() - Math.random() * 96 * 60 * 60 * 1000).toISOString()
    });
  }

  if (companyLower.includes('tesla') || companyLower.includes('auto')) {
    mockHeadlines.push({
      title: `${company} Electric Vehicle Sales Surge as Market Demand Grows`,
      source: 'Auto Industry News',
      publishedAt: new Date(Date.now() - Math.random() * 120 * 60 * 60 * 1000).toISOString()
    });
  }

  if (companyLower.includes('amazon') || companyLower.includes('retail')) {
    mockHeadlines.push({
      title: `${company} Expands Global Logistics Network to Improve Delivery Times`,
      source: 'Retail Today',
      publishedAt: new Date(Date.now() - Math.random() * 144 * 60 * 60 * 1000).toISOString()
    });
  }

  if (companyLower.includes('microsoft') || companyLower.includes('software')) {
    mockHeadlines.push({
      title: `${company} Cloud Services Revenue Reaches New Heights This Quarter`,
      source: 'Enterprise Tech Weekly',
      publishedAt: new Date(Date.now() - Math.random() * 168 * 60 * 60 * 1000).toISOString()
    });
  }

  return {
    articleCount: mockHeadlines.length,
    headlines: mockHeadlines.slice(0, 3)
  };
}

/**
 * Sentiment analysis keywords for mock sentiment calculation
 */
export const sentimentKeywords = {
  positive: [
    'growth', 'profit', 'success', 'innovative', 'breakthrough', 'expansion',
    'achievement', 'award', 'milestone', 'partnership', 'investment', 'launch',
    'record', 'strong', 'increase', 'boost', 'win', 'leading', 'excellent',
    'surge', 'soar', 'beat', 'exceed', 'outperform', 'momentum'
  ],
  negative: [
    'loss', 'decline', 'problem', 'issue', 'crisis', 'failure', 'bankruptcy',
    'lawsuit', 'investigation', 'scandal', 'hack', 'breach', 'layoff', 'cut',
    'drop', 'fall', 'weak', 'concern', 'risk', 'warning', 'delay', 'recall',
    'plunge', 'crash', 'struggle', 'disappointing', 'underperform'
  ]
};

/**
 * Calculates mock sentiment analysis from headlines
 * @param headlines - Array of news headlines
 * @returns Sentiment analysis object
 */
export function calculateMockSentiment(headlines: MockHeadline[]): {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
} {
  if (!headlines || headlines.length === 0) {
    return {
      score: 0,
      label: 'neutral',
      confidence: 0
    };
  }

  let totalScore = 0;
  let totalWords = 0;

  headlines.forEach(headline => {
    const words = headline.title.toLowerCase().split(/\s+/);
    totalWords += words.length;

    words.forEach(word => {
      if (sentimentKeywords.positive.some(keyword => word.includes(keyword))) {
        totalScore += 1;
      } else if (sentimentKeywords.negative.some(keyword => word.includes(keyword))) {
        totalScore -= 1;
      }
    });
  });

  // Normalize score to -1 to 1 range
  const normalizedScore = totalWords > 0 ? Math.max(-1, Math.min(1, totalScore / totalWords * 10)) : 0;

  // Determine label and confidence
  let label: 'positive' | 'neutral' | 'negative';
  let confidence: number;

  if (normalizedScore > 0.1) {
    label = 'positive';
    confidence = Math.min(0.9, Math.abs(normalizedScore) * 2);
  } else if (normalizedScore < -0.1) {
    label = 'negative';
    confidence = Math.min(0.9, Math.abs(normalizedScore) * 2);
  } else {
    label = 'neutral';
    confidence = Math.max(0.1, 1 - Math.abs(normalizedScore) * 2);
  }

  return {
    score: normalizedScore,
    label,
    confidence
  };
}