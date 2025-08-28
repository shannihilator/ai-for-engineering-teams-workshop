/**
 * Mock market intelligence data service for workshop exercises
 * Generates realistic market sentiment and news data for customer companies
 */

export interface MarketIntelligenceData {
  sentiment: number; // -100 to 100 scale
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative';
  newsCount: number;
  headlines: MarketHeadline[];
  lastUpdated: string; // ISO timestamp
}

export interface MarketHeadline {
  title: string;
  source: string;
  publishedAt: string; // ISO timestamp
}

/**
 * Mock news sources for realistic headline generation
 */
const NEWS_SOURCES = [
  'Reuters',
  'Bloomberg',
  'TechCrunch',
  'Wall Street Journal',
  'Financial Times',
  'Business Insider',
  'Forbes',
  'CNBC',
  'MarketWatch',
  'The Information'
];

/**
 * Company-specific headline templates for realistic data generation
 * Templates use {company} placeholder for dynamic company name insertion
 */
const HEADLINE_TEMPLATES = {
  positive: [
    '{company} Reports Record Quarter with 35% Revenue Growth',
    '{company} Announces Major Partnership with Industry Leader',
    '{company} Secures $50M Series B Funding Round',
    '{company} Launches Innovative AI-Powered Platform',
    '{company} Expands Operations to Three New Markets',
    '{company} Wins Enterprise Customer of the Year Award',
    '{company} Stock Surges Following Strong Earnings Report',
    '{company} CEO Named Technology Leader of the Year',
    'Analysts Upgrade {company} Stock to "Strong Buy"',
    '{company} Patent Portfolio Grows to Over 100 Patents'
  ],
  neutral: [
    '{company} Maintains Steady Growth in Q3 Results',
    '{company} Announces Leadership Team Changes',
    '{company} Updates Product Roadmap for 2025',
    '{company} Participates in Industry Conference',
    '{company} Reports Quarterly Earnings in Line with Expectations',
    '{company} Expands Remote Work Policy',
    '{company} Announces New Office Location',
    'Industry Analysis: {company} Position in Market Landscape',
    '{company} Regulatory Filing Shows Standard Operations',
    '{company} Hosts Annual Customer Conference'
  ],
  negative: [
    '{company} Faces Regulatory Investigation Over Data Practices',
    '{company} Reports 15% Revenue Decline in Latest Quarter',
    '{company} Announces Layoffs Affecting 200 Employees',
    '{company} Stock Drops 20% Following Earnings Miss',
    '{company} Customer Data Breach Affects 50K Users',
    '{company} Delays Product Launch Due to Technical Issues',
    'Analysts Downgrade {company} Amid Market Concerns',
    '{company} CFO Resigns Amid Financial Irregularities',
    '{company} Faces Class Action Lawsuit from Shareholders',
    '{company} Struggles with Supply Chain Disruptions'
  ]
};

/**
 * Generates a pseudo-random number based on company name for consistency
 */
function getCompanyHash(companyName: string): number {
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    const char = companyName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generates sentiment score based on company name with some correlation to health scores
 * Companies with higher health scores tend to have more positive sentiment
 */
function generateSentiment(companyName: string, baseHealthScore?: number): { sentiment: number; sentimentLabel: 'Positive' | 'Neutral' | 'Negative' } {
  const hash = getCompanyHash(companyName);
  
  // If health score is provided, bias sentiment towards it
  let baseSentiment = 0;
  if (baseHealthScore !== undefined) {
    // Convert health score (0-100) to sentiment bias (-50 to 50)
    baseSentiment = (baseHealthScore - 50) * 0.8;
  }
  
  // Add some randomness based on company name
  const randomVariation = (hash % 80) - 40; // -40 to 40
  let sentiment = Math.round(baseSentiment + (randomVariation * 0.5));
  
  // Clamp to valid range
  sentiment = Math.max(-100, Math.min(100, sentiment));
  
  let sentimentLabel: 'Positive' | 'Neutral' | 'Negative';
  if (sentiment > 20) {
    sentimentLabel = 'Positive';
  } else if (sentiment < -20) {
    sentimentLabel = 'Negative';
  } else {
    sentimentLabel = 'Neutral';
  }
  
  return { sentiment, sentimentLabel };
}

/**
 * Generates realistic headlines based on sentiment and company name
 */
function generateHeadlines(companyName: string, sentimentLabel: 'Positive' | 'Neutral' | 'Negative'): MarketHeadline[] {
  const hash = getCompanyHash(companyName);
  const headlines: MarketHeadline[] = [];
  
  // Select template category based on sentiment
  let templates: string[];
  if (sentimentLabel === 'Positive') {
    templates = HEADLINE_TEMPLATES.positive;
  } else if (sentimentLabel === 'Negative') {
    templates = HEADLINE_TEMPLATES.negative;
  } else {
    templates = HEADLINE_TEMPLATES.neutral;
  }
  
  // Generate 3 unique headlines
  const usedIndices = new Set<number>();
  const currentDate = new Date();
  
  for (let i = 0; i < 3; i++) {
    let templateIndex = (hash + i * 7) % templates.length;
    
    // Ensure unique templates
    while (usedIndices.has(templateIndex)) {
      templateIndex = (templateIndex + 1) % templates.length;
    }
    usedIndices.add(templateIndex);
    
    const template = templates[templateIndex];
    const title = template.replace('{company}', companyName);
    
    // Select news source
    const sourceIndex = (hash + i * 3) % NEWS_SOURCES.length;
    const source = NEWS_SOURCES[sourceIndex];
    
    // Generate publish date (within last 7 days)
    const daysAgo = (hash + i * 2) % 7;
    const publishedAt = new Date(currentDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    publishedAt.setHours(9 + ((hash + i) % 12)); // Random hour between 9-20
    publishedAt.setMinutes((hash + i * 15) % 60);
    
    headlines.push({
      title,
      source,
      publishedAt: publishedAt.toISOString()
    });
  }
  
  // Sort by publish date (newest first)
  headlines.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  return headlines;
}

/**
 * Generates news count based on company name and sentiment
 */
function generateNewsCount(companyName: string, sentimentLabel: 'Positive' | 'Neutral' | 'Negative'): number {
  const hash = getCompanyHash(companyName);
  let baseCount = 15; // Base news count
  
  // Adjust based on sentiment (negative news tends to generate more coverage)
  if (sentimentLabel === 'Negative') {
    baseCount += 10;
  } else if (sentimentLabel === 'Positive') {
    baseCount += 5;
  }
  
  // Add random variation
  const variation = (hash % 20) - 10; // -10 to 10
  const newsCount = Math.max(3, baseCount + variation);
  
  return newsCount;
}

/**
 * Mock data cache for consistency during workshop exercises
 * TTL: 10 minutes as specified in requirements
 */
interface CacheEntry {
  data: MarketIntelligenceData;
  timestamp: number;
}

const dataCache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Generates mock market intelligence data for a given company
 * Uses consistent algorithms to ensure same company always returns same data within cache TTL
 * 
 * @param companyName - Company name to generate data for
 * @param customerHealthScore - Optional health score to correlate sentiment (for existing customers)
 * @returns MarketIntelligenceData object
 */
export function generateMarketIntelligenceData(
  companyName: string,
  customerHealthScore?: number
): MarketIntelligenceData {
  const cacheKey = companyName.toLowerCase().trim();
  const now = Date.now();
  
  // Check cache first
  const cached = dataCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  // Generate new data
  const { sentiment, sentimentLabel } = generateSentiment(companyName, customerHealthScore);
  const headlines = generateHeadlines(companyName, sentimentLabel);
  const newsCount = generateNewsCount(companyName, sentimentLabel);
  
  // Create timestamp for "last updated" that's recent but not exactly now
  const lastUpdatedOffset = getCompanyHash(companyName) % (5 * 60 * 1000); // 0-5 minutes ago
  const lastUpdated = new Date(now - lastUpdatedOffset).toISOString();
  
  const data: MarketIntelligenceData = {
    sentiment,
    sentimentLabel,
    newsCount,
    headlines,
    lastUpdated
  };
  
  // Cache the data
  dataCache.set(cacheKey, {
    data,
    timestamp: now
  });
  
  return data;
}

/**
 * Convenience function to get market intelligence for existing customers
 * Automatically uses their health score for sentiment correlation
 */
export function getMarketIntelligenceForCustomer(customer: { company: string; healthScore: number }): MarketIntelligenceData {
  return generateMarketIntelligenceData(customer.company, customer.healthScore);
}

/**
 * Clears the data cache (useful for testing)
 */
export function clearMarketIntelligenceCache(): void {
  dataCache.clear();
}

export default {
  generateMarketIntelligenceData,
  getMarketIntelligenceForCustomer,
  clearMarketIntelligenceCache
};