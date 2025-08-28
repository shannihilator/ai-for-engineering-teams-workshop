# Market Intelligence Widget Specification

## Feature: MarketIntelligenceWidget

### Context
- Purpose: Provides real-time market sentiment and news analysis for customer companies within the Customer Intelligence Dashboard
- Role in application: Standalone widget that integrates alongside existing CustomerManagement and CustomerCard components to provide comprehensive customer insights
- System integration: Receives company name from selected customer data and displays relevant market intelligence through a dedicated API service
- User interaction: Customer success managers and account executives will use this widget to understand market conditions affecting their customers
- Data flow: Takes company name input → queries market intelligence API → displays sentiment, news count, and headlines with caching for performance

### Requirements

#### Functional Requirements
- Display market sentiment analysis with color-coded indicators (green/yellow/red) matching existing health score system
- Show total news article count and last updated timestamp for data freshness
- Present top 3 most relevant headlines with source attribution and publication dates
- Accept company name input through validation with real-time feedback
- Handle loading states during API requests with proper user feedback
- Implement error states for network failures and invalid company names
- Support real-time updates with 10-minute cache TTL for mock data consistency
- Integrate with existing customer selection to auto-populate company names

#### User Interface Requirements
- Input field with validation feedback and clear error messaging
- Sentiment display using consistent color system: green (positive), yellow (neutral), red (negative)
- Headlines presented in clean, readable list format with clear typography hierarchy
- Loading spinner consistent with existing LoadingButton component patterns
- Error states with retry functionality and clear user guidance
- Responsive design supporting mobile (320px+) and desktop viewports
- Keyboard navigation support for all interactive elements
- WCAG 2.1 AA compliance including proper focus indicators and screen reader labels

#### Data Requirements
- Company name parameter validation and sanitization following existing API security patterns
- Mock market intelligence data generation with realistic sentiment scores and news headlines
- Caching mechanism with TTL expiration (10 minutes) for consistent workshop experience
- Error handling for invalid company names and network timeouts
- Response format: `{ sentiment: number, sentimentLabel: string, newsCount: number, headlines: Array<{title: string, source: string, publishedAt: string}>, lastUpdated: string }`

#### Integration Requirements
- Next.js API route at `/api/market-intelligence/[company]` following existing route patterns
- MarketIntelligenceService class implementing established service layer patterns
- Integration with main Dashboard component using consistent prop passing
- Error boundary integration for robust failure handling
- Consistent with existing widget styling and component composition patterns

### Constraints

#### Technical Stack and Frameworks
- Next.js 15 App Router with Route Handlers for API implementation
- React 19 hooks pattern (useState, useEffect, useCallback) matching existing components
- TypeScript with strict typing for all interfaces and props
- Tailwind CSS v4 with design system colors matching health score indicators
- Zod schema validation for API request/response validation
- Custom hook pattern for API integration following existing service patterns

#### Performance Requirements
- API response time under 2 seconds with realistic delay simulation
- Component render time under 100ms for smooth user experience  
- Cache hit ratio > 90% for repeated company lookups within TTL window
- Lazy loading support for dashboard integration
- Memory usage optimization for large news data sets

#### Design Constraints
- Responsive breakpoints: mobile (320px-768px), tablet (768px-1024px), desktop (1024px+)
- Component maximum width: 400px to maintain grid layout consistency
- Minimum touch target size: 44px for mobile accessibility
- Color contrast ratios meeting WCAG AA standards (4.5:1 normal text, 3:1 large text)
- Typography hierarchy consistent with existing CustomerCard and CustomerManagement components

#### File Structure and Naming Conventions
- Component: `src/components/MarketIntelligenceWidget.tsx` with named export
- Service: `src/services/MarketIntelligenceService.ts` with class-based pattern
- API route: `src/app/api/market-intelligence/[company]/route.ts`
- Types: Interface definitions within component file following existing patterns
- Mock data: `src/data/mock-market-intelligence.ts` for workshop consistency

#### Props Interface and TypeScript Definitions
```typescript
export interface MarketIntelligenceWidgetProps {
  /** Company name to analyze - required for market intelligence lookup */
  companyName?: string;
  /** Callback when company analysis completes */
  onAnalysisComplete?: (data: MarketIntelligenceData) => void;
  /** Optional CSS classes for custom styling */
  className?: string;
}

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
```

#### Security Considerations
- Company name parameter sanitization to prevent injection attacks
- Input validation with length limits (max 100 characters) and character whitelisting
- API rate limiting following existing customer API patterns (100 requests per 15 minutes)
- Error message sanitization preventing information disclosure
- Mock data generation security preventing external API vulnerabilities
- CORS headers and security headers consistent with existing API routes

### Acceptance Criteria

- [ ] MarketIntelligenceWidget component renders with company name input field
- [ ] Company name validation provides real-time feedback for invalid inputs
- [ ] Sentiment indicator displays color-coded sentiment (green/yellow/red) with proper labels
- [ ] News count and last updated timestamp display correctly
- [ ] Top 3 headlines show with title, source, and publication date
- [ ] Loading state appears during API requests with accessible loading indicators
- [ ] Error states display with retry functionality and clear messaging
- [ ] API route `/api/market-intelligence/[company]` returns mock data following schema
- [ ] MarketIntelligenceService implements caching with 10-minute TTL
- [ ] Integration with Dashboard component maintains responsive grid layout
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces sentiment changes and loading states
- [ ] Component follows existing naming conventions and TypeScript patterns
- [ ] Error boundaries handle service failures gracefully
- [ ] Mobile responsive design works at 320px minimum width
- [ ] Color contrast meets WCAG AA standards for all text elements
- [ ] Rate limiting prevents API abuse following existing patterns
- [ ] Mock data generates realistic, company-specific headlines
- [ ] Component state management follows established React patterns
- [ ] Unit tests cover component functionality and error states
- [ ] Integration tests verify API and service layer functionality