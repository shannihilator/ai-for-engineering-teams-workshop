# Health Score Calculator Specification

## Feature: CustomerHealthScoreCalculator

### Context
- Purpose: Provides comprehensive customer health scoring system for predictive analytics and churn risk assessment within the Customer Intelligence Dashboard
- Role in application: Core business logic component that calculates health scores for existing Customer interface, integrating seamlessly with CustomerCard, CustomerSelector, and dashboard components
- System integration: Replaces static healthScore property with dynamic calculation based on multi-factor analysis of customer data
- User interaction: Customer success managers and account executives will use calculated health scores to prioritize interventions, identify at-risk accounts, and track customer relationship health trends
- Data flow: Customer data → health calculation engine → normalized 0-100 score → dashboard visualization → business action decisions

### Requirements

#### Functional Requirements

##### Core Algorithm Implementation
- Calculate customer health scores on established 0-100 scale maintaining existing color-coded risk categorization
- Multi-factor scoring system with validated business weighting: Payment History (40%), Engagement Metrics (30%), Contract Status (20%), Support Experience (10%)
- Pure function architecture with individual scoring functions for each factor enabling isolated testing and algorithm refinement
- Comprehensive input validation with descriptive error messaging for all data inputs and edge case handling
- Risk level classification matching existing CustomerCard patterns: Healthy (71-100), Warning (31-70), Critical (0-30)

##### Individual Scoring Functions
- **Payment Score Calculator**: Analyze days since last payment, average payment delay patterns, and overdue amounts with normalized 0-100 output
- **Engagement Score Calculator**: Process login frequency, feature usage metrics, and active user data with recency weighting for accurate engagement assessment
- **Contract Score Calculator**: Evaluate days until renewal, contract value trends, and recent upgrades/downgrades for renewal risk prediction
- **Support Score Calculator**: Assess average resolution times, customer satisfaction scores, and escalation frequency for service quality impact

##### Algorithm Validation and Explainability
- Detailed mathematical rationale documentation for all weighting decisions and scoring approaches
- Business assumption validation with clear documentation of underlying logic and expected behaviors
- Confidence scoring alongside health scores to indicate data quality and calculation reliability
- Trend analysis integration for identifying improving vs declining customer health trajectories

#### User Interface Requirements

##### CustomerHealthDisplay Widget
- Integration with existing CustomerCard component maintaining consistent visual design and color coding system
- Overall health score display with enhanced visualization including score breakdown and confidence indicators  
- Expandable detailed breakdown showing individual factor scores with clear factor labeling and contribution percentages
- Loading states consistent with MarketIntelligenceWidget and other dashboard components using established patterns
- Error states with retry functionality and clear messaging following dashboard error handling conventions

##### Real-time Integration Features
- Seamless integration with CustomerSelector component for automatic health score updates when customer selection changes
- Dynamic score recalculation capabilities for real-time dashboard updates without page refreshes
- Responsive design maintaining dashboard grid layout compatibility across mobile (320px+) and desktop viewports
- Keyboard navigation and accessibility compliance matching existing dashboard widget standards

#### Data Requirements

##### Input Data Structure Extensions
```typescript
interface CustomerHealthData extends Customer {
  paymentHistory: {
    daysSinceLastPayment: number;
    averagePaymentDelay: number;
    overdueAmount: number;
    paymentReliabilityScore?: number;
  };
  engagementMetrics: {
    loginFrequency: number; // logins per month
    featureUsageCount: number;
    activeUserCount: number;
    lastLoginDate: string;
  };
  contractInformation: {
    daysUntilRenewal: number;
    contractValue: number;
    recentUpgrades: boolean;
    renewalProbability?: number;
  };
  supportData: {
    averageResolutionTime: number; // hours
    satisfactionScore: number; // 1-5 scale
    escalationCount: number;
    openTicketCount: number;
  };
}
```

##### Data Processing Requirements
- Mock data generation service creating realistic customer health data for consistent workshop demonstrations
- Data normalization strategies for handling different data types, ranges, and missing values with graceful degradation
- Edge case handling for new customers (< 90 days) with alternative scoring models and confidence adjustments
- Input sanitization and type validation for all numeric inputs with comprehensive error handling and user feedback

#### Integration Requirements

##### Component Architecture
- Pure function library at `lib/healthCalculator.ts` following established service layer patterns with comprehensive TypeScript typing
- Integration with existing Customer interface extending rather than replacing current structure for backward compatibility
- Consistent error handling patterns matching CustomerManagement and MarketIntelligenceWidget error boundary integration
- Dashboard layout integration maintaining responsive design and component composition patterns established in existing widgets

##### Service Layer Integration  
- Caching mechanism for calculated health scores with appropriate TTL based on data update frequency and performance requirements
- Real-time calculation capabilities for dashboard updates with optimized performance for multiple customer evaluations
- API integration points for future external data sources while maintaining mock data compatibility for workshop environment
- Monitoring and calibration hooks for production deployment and algorithm performance tracking

### Constraints

#### Technical Stack and Frameworks
- Next.js 15 App Router compatibility with Route Handlers for any required API endpoints
- React 19 hooks pattern (useState, useEffect, useCallback, useMemo) matching existing CustomerCard and MarketIntelligenceWidget implementations
- TypeScript with strict typing for all interfaces, functions, and return types with comprehensive JSDoc documentation
- Pure function architecture with no side effects for predictable testing, debugging, and algorithm validation
- Tailwind CSS integration maintaining design system colors and responsive design patterns established in existing components

#### Performance Requirements
- Health score calculation completion under 10ms per customer for real-time dashboard responsiveness
- Efficient algorithm implementation suitable for batch processing of multiple customers without UI blocking
- Memory usage optimization for large customer datasets with consideration for browser performance constraints
- Caching strategies for repeated calculations with intelligent cache invalidation based on underlying data changes

#### Design Constraints
- Color coding consistency with existing CustomerCard health score display patterns (green/yellow/red)
- Component maximum width and responsive behavior matching established dashboard widget constraints
- Typography hierarchy and spacing consistent with CustomerCard and MarketIntelligenceWidget visual design
- Accessibility compliance matching WCAG 2.1 AA standards established in MarketIntelligenceWidget with comprehensive keyboard navigation

#### File Structure and Naming Conventions
- Core calculator: `lib/healthCalculator.ts` with comprehensive pure function implementations
- UI component: `src/components/CustomerHealthDisplay.tsx` following established naming conventions
- Mock data service: `src/data/mock-customer-health.ts` for realistic workshop data generation
- Type definitions: Comprehensive interfaces within calculator file with re-exports for component consumption
- Test files: `__tests__/healthCalculator.test.ts` for comprehensive algorithm validation

#### Props Interface and TypeScript Definitions
```typescript
export interface CustomerHealthDisplayProps {
  /** Customer data with health information for calculation */
  customer: Customer;
  /** Detailed health data for comprehensive scoring */
  healthData: CustomerHealthData;
  /** Show detailed breakdown - defaults to false */
  showBreakdown?: boolean;
  /** Optional callback when health score calculation completes */
  onHealthCalculated?: (score: number, breakdown: HealthScoreBreakdown) => void;
  /** Optional CSS classes for custom styling */
  className?: string;
}

export interface HealthScoreBreakdown {
  overallScore: number;
  confidence: number; // 0-100 indicating data quality
  factors: {
    payment: { score: number; weight: number; contribution: number };
    engagement: { score: number; weight: number; contribution: number };
    contract: { score: number; weight: number; contribution: number };
    support: { score: number; weight: number; contribution: number };
  };
  riskLevel: 'Healthy' | 'Warning' | 'Critical';
  recommendations?: string[];
}

export interface CalculationOptions {
  includeConfidenceScoring?: boolean;
  newCustomerThreshold?: number; // days
  missingDataStrategy?: 'neutral' | 'conservative' | 'optimistic';
}
```

#### Security Considerations
- Input validation with comprehensive sanitization for all numeric health data inputs preventing injection attacks
- Data privacy compliance for customer health information with appropriate access controls and audit logging
- Error message sanitization preventing information disclosure about internal calculation logic or sensitive customer data
- Audit trail considerations for health score calculations enabling compliance reporting and algorithm transparency

### Acceptance Criteria

#### Core Algorithm Implementation
- [ ] `calculateHealthScore` function returns 0-100 score with mathematical accuracy and proper input validation
- [ ] Individual factor functions (`calculatePaymentScore`, `calculateEngagementScore`, `calculateContractScore`, `calculateSupportScore`) produce normalized 0-100 outputs
- [ ] Weighted calculation produces correct results: `(payment * 0.4) + (engagement * 0.3) + (contract * 0.2) + (support * 0.1)`
- [ ] Risk level categorization matches existing patterns: Healthy (71-100), Warning (31-70), Critical (0-30)
- [ ] Edge case handling for new customers (< 90 days) with appropriate algorithm adjustments
- [ ] Missing data handling with configurable strategies and clear confidence indicators

#### Data Processing and Validation
- [ ] Input validation rejects invalid data types with descriptive error messages
- [ ] Normalization functions handle different data ranges and scales consistently
- [ ] Mock data service generates realistic customer health data across all scoring factors
- [ ] Confidence scoring accurately reflects data quality and calculation reliability
- [ ] Error handling provides actionable feedback for data quality issues

#### UI Component Integration
- [ ] CustomerHealthDisplay component renders with existing CustomerCard visual consistency
- [ ] Health score display maintains color coding: green/yellow/red matching existing system
- [ ] Expandable breakdown shows individual factor scores with clear labels and percentages
- [ ] Loading states consistent with MarketIntelligenceWidget patterns
- [ ] Error states display with retry functionality and clear user guidance
- [ ] Integration with CustomerSelector triggers automatic score updates

#### Performance and Accessibility
- [ ] Health score calculation completes under 10ms per customer
- [ ] Component renders under 100ms for smooth user experience
- [ ] Memory usage remains optimal for batch customer processing
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces health score changes and breakdowns
- [ ] Color contrast meets WCAG AA standards for all text elements
- [ ] Mobile responsive design works at 320px minimum width

#### Algorithm Validation and Testing  
- [ ] Unit tests cover all individual scoring functions with edge cases
- [ ] Integration tests verify weighted calculation accuracy
- [ ] Realistic customer scenario testing with known expected outcomes
- [ ] Mathematical accuracy verification with precision testing
- [ ] Business logic validation with stakeholder-approved test cases
- [ ] Performance benchmarking meets specified calculation time requirements

#### Documentation and Explainability
- [ ] Comprehensive JSDoc comments explain business logic and mathematical formulas
- [ ] Algorithm decision documentation provides clear rationale for weighting choices
- [ ] Error classes extend base Error with proper exception handling
- [ ] Business assumption documentation validates underlying logic
- [ ] Monitoring and calibration recommendations documented for production deployment