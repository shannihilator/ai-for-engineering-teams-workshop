# Market Intelligence Widget Specification

## Feature: Market Intelligence Widget Composition

### Context

- **Purpose**: Provide real-time market sentiment and news analysis for customer companies in the Customer Intelligence Dashboard
- **Role in system**: Third widget in the dashboard composition alongside CustomerCard and DomainHealthWidget, demonstrating multi-widget orchestration and consistent data flow patterns
- **Users**: Customer success managers and sales teams monitoring market conditions affecting their customers
- **Usage scenarios**: Daily customer health reviews, account planning sessions, proactive customer outreach based on market events

### Requirements

#### Functional Requirements

- **Company name input**: Text field accepting company names (e.g., "Tesla", "Microsoft", "Apple Inc.")
- **Market sentiment analysis**: Display sentiment score with visual indicators (positive/neutral/negative)
- **News article aggregation**: Show article count from last 24 hours with source attribution
- **Headline display**: Present top 3 most recent headlines with publication dates and sources
- **Real-time data**: Fetch current market intelligence via Stillriver proxy to API Ninjas
- **Error resilience**: Graceful handling of API failures, network issues, and invalid company names

#### User Interface Requirements

- **Input validation**: Real-time validation with helpful error messages for company name format
- **Loading states**: Spinner animation during API calls with "Analyzing market data..." messaging
- **Visual indicators**: Green/yellow/red color system matching existing widgets for sentiment status
- **Responsive design**: Mobile-first layout adapting to desktop breakpoints (768px, 1024px)
- **Accessibility**: ARIA labels, keyboard navigation, screen reader compatibility
- **Typography**: Consistent heading hierarchy and text sizing with existing dashboard components

#### Data Requirements

- **API endpoint**: `/api/market-intelligence/[company]` following Next.js 13+ App Router patterns
- **Response format**: JSON with sentiment score (-1 to 1), article count, headlines array, timestamp
- **Caching strategy**: 10-minute TTL for market data to balance freshness with API rate limits
- **Error handling**: Standardized error response format with user-friendly messages
- **Input sanitization**: Company name parameter validation preventing injection attacks

#### Integration Requirements

- **Service layer**: MarketIntelligenceService class following established patterns from DomainHealthService
- **Dashboard composition**: Integration into main Dashboard component with prop-based company data
- **State management**: Local React state with loading/error/success patterns matching existing widgets
- **Navigation integration**: Receive company name from customer selection flow

### Constraints

#### Technical Stack Requirements

- **Framework**: Next.js 15 with App Router and Route Handlers
- **Frontend**: React 19 with TypeScript strict mode and modern hooks patterns
- **Styling**: Tailwind CSS with existing design system classes and color palette
- **Build**: TypeScript compilation with zero errors and strict type checking
- **Runtime**: Node.js LTS with ES2022+ features

#### Performance Requirements

- **API response time**: Market intelligence data fetch under 3 seconds with timeout handling
- **Bundle size**: Component code under 50KB compressed to maintain dashboard load performance
- **Rendering**: Initial render under 100ms, subsequent updates under 50ms
- **Caching**: Service-level caching reducing API calls by 80% during typical usage patterns
- **Memory**: Efficient cache management preventing memory leaks in long-running sessions

#### Design Constraints

- **Component dimensions**: Minimum 320px width, flexible height based on content
- **Breakpoints**: Responsive behavior at sm (640px), md (768px), lg (1024px), xl (1280px)
- **Color system**: Consistent with existing green (#10B981), yellow (#F59E0B), red (#EF4444) indicators
- **Typography**: Inter font family with established size scale (xs, sm, base, lg, xl, 2xl)
- **Spacing**: 4px base unit grid system maintaining visual rhythm with other dashboard components

#### File Structure and Naming

- **API route**: `app/src/app/api/market-intelligence/[company]/route.ts`
- **Service layer**: `app/src/services/MarketIntelligenceService.ts`
- **UI component**: `app/src/components/MarketIntelligenceWidget.tsx`
- **Type definitions**: Inline interfaces following established patterns
- **Error classes**: Custom error types for service layer exception handling

#### Props Interface and TypeScript Definitions

```typescript
interface MarketIntelligenceWidgetProps {
  className?: string;
  companyName?: string;
  onAnalysisComplete?: (data: MarketIntelligenceData) => void;
}

interface MarketIntelligenceData {
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
```

#### Security Considerations

- **Input validation**: Company name parameter sanitization preventing code injection and path traversal
- **API security**: Request timeout limits, rate limiting consideration, safe error message handling
- **Data sanitization**: External API response cleaning removing potentially malicious content
- **Error message safety**: User-facing errors contain no sensitive system information
- **CSRF protection**: API routes following Next.js security best practices with proper headers

### Acceptance Criteria

#### Core Functionality

- [ ] Company name input accepts valid business names and provides real-time validation feedback
- [ ] API successfully fetches market intelligence data from Stillriver proxy within 3 second timeout
- [ ] Sentiment analysis displays with appropriate color coding (green > 0.1, yellow -0.1 to 0.1, red < -0.1)
- [ ] News headlines show top 3 articles with source, date, and proper formatting
- [ ] Loading state shows animated spinner with descriptive text during API calls
- [ ] Error states display user-friendly messages for network failures, API errors, and invalid inputs

#### Edge Cases and Error Handling

- [ ] Empty company name shows validation error without API call
- [ ] Non-existent company returns appropriate "No data found" message
- [ ] API timeout (>3 seconds) shows timeout error with retry option
- [ ] Network failure displays offline-friendly error message
- [ ] Malformed API responses handled gracefully without UI breaking
- [ ] Invalid characters in company name sanitized or rejected with helpful guidance

#### User Experience Validation

- [ ] Component maintains responsive layout from 320px to 1920px viewport widths
- [ ] Keyboard navigation allows full interaction without mouse dependency
- [ ] Screen readers announce status changes and error messages appropriately
- [ ] Visual focus indicators clearly show current interactive element
- [ ] Color contrast meets WCAG AA standards for all text and indicator combinations
- [ ] Touch targets meet 44px minimum size requirement on mobile devices

#### Integration Points Verified

- [ ] Service layer follows established caching patterns from DomainHealthService
- [ ] API route structure matches existing `/api/domain-health/[domain]/route.ts` patterns
- [ ] Component styling matches CustomerCard and DomainHealthWidget visual consistency
- [ ] Dashboard integration receives company name via props without breaking existing layout
- [ ] Error boundaries properly catch and display component-level failures
- [ ] TypeScript compilation passes with strict mode and no any types used
