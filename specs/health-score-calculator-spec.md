# Spec: CustomerHealthScore Calculator System

## Feature: Customer Health Score Calculator

### Context

- **Purpose**: Provide predictive analytics for customer relationship health and churn risk assessment
- **Role in application**: Core business intelligence component for the Customer Intelligence Dashboard
- **System integration**: Works with existing CustomerSelector and dashboard widgets to provide real-time health scoring
- **Users**: Customer success managers, account managers, and business stakeholders who need to assess customer risk and prioritize interventions

### Requirements

#### Functional Requirements

- **Multi-factor scoring algorithm**: Calculate customer health scores on 0-100 scale using weighted factors
- **Risk categorization**: Classify customers as Healthy (71-100), Warning (31-70), or Critical (0-30)
- **Real-time calculations**: Update health scores dynamically when customer selection changes
- **Score breakdown**: Display individual factor contributions for transparent decision-making
- **Data validation**: Handle missing data, new customers, and edge cases gracefully

#### Algorithm Specifications

- **Payment Factor (40% weight)**: Based on payment timeliness, overdue amounts, payment history consistency
- **Engagement Factor (30% weight)**: Login frequency, feature usage, platform interaction metrics
- **Contract Factor (20% weight)**: Renewal proximity, contract value, recent upgrades/downgrades
- **Support Factor (10% weight)**: Resolution times, satisfaction scores, escalation frequency

#### User Interface Requirements

- **Health score display**: Large, color-coded score with visual risk indicator
- **Factor breakdown**: Expandable section showing individual scores and contributions
- **Loading states**: Spinner during calculation with appropriate messaging
- **Error handling**: Clear error messages for calculation failures or data issues

#### Data Integration Requirements

- **Customer data interface**: Integration with mock customer data structure
- **Real-time updates**: Score recalculation when customer selection changes
- **Data normalization**: Handle various data types and ranges consistently
- **Missing data handling**: Graceful degradation when customer data is incomplete

### Constraints

#### Technical Stack and Frameworks

- **Next.js 15 App Router**: For API routes and server-side logic
- **React 19**: Component architecture with hooks for state management
- **TypeScript strict mode**: All interfaces, functions, and data structures strongly typed
- **Tailwind CSS**: Styling consistent with existing dashboard components

#### Performance Requirements

- **Calculation speed**: Health score calculation must complete within 100ms
- **Memory efficiency**: Minimal memory footprint for dashboard responsiveness
- **Caching strategy**: Consider memoization for repeated calculations of same customer data
- **Real-time updates**: Score updates within 200ms of customer selection change

#### Design Constraints

- **Responsive breakpoints**: Mobile-first design working down to 320px width
- **Component size limits**: Health display widget maximum height 400px
- **Color consistency**: Use established dashboard color scheme (green/yellow/red)
- **Typography**: Follow existing dashboard font hierarchy and sizing

#### File Structure and Naming Conventions

```
app/src/lib/healthCalculator.ts           # Pure calculation functions
app/src/lib/__tests__/healthCalculator.test.ts  # Unit tests
app/src/components/CustomerHealthDisplay.tsx     # UI component
app/src/types/healthScore.ts              # TypeScript interfaces
```

#### Props Interface and TypeScript Definitions

```typescript
interface CustomerHealthData {
  paymentHistory: PaymentMetrics;
  engagement: EngagementMetrics;
  contract: ContractMetrics;
  support: SupportMetrics;
}

interface HealthScoreResult {
  overallScore: number;
  riskLevel: 'healthy' | 'warning' | 'critical';
  factorScores: {
    payment: number;
    engagement: number;
    contract: number;
    support: number;
  };
  confidence: number;
  lastCalculated: Date;
}
```

#### Security Considerations

- **Input validation**: All customer data inputs validated and sanitized
- **Error handling**: No sensitive data exposed in error messages
- **Data access**: Health calculations performed client-side with no external API calls
- **Algorithm transparency**: Business logic documented for audit and compliance

### Acceptance Criteria

- [ ] **Algorithm accuracy**: Health score calculation produces mathematically correct results within 0.1% tolerance
- [ ] **Risk categorization**: Customers correctly classified into healthy/warning/critical buckets
- [ ] **Factor weighting**: Payment (40%), Engagement (30%), Contract (20%), Support (10%) weights applied correctly
- [ ] **Edge cases handled**: New customers, missing data, invalid inputs handled gracefully without crashes
- [ ] **UI integration**: Component integrates seamlessly with CustomerSelector and dashboard layout
- [ ] **Performance target**: Health score calculation completes within 100ms for typical customer data
- [ ] **Error boundaries**: Component catches and handles calculation errors without breaking dashboard
- [ ] **Accessibility compliance**: Health score display meets WCAG 2.1 AA standards with proper ARIA labels
- [ ] **Responsive design**: Component displays correctly across mobile, tablet, and desktop breakpoints
- [ ] **Real-time updates**: Score updates immediately when different customer selected
- [ ] **Visual indicators**: Color coding (green/yellow/red) clearly communicates risk level
- [ ] **Factor breakdown**: Individual factor scores display with clear contribution percentages
- [ ] **Loading states**: Appropriate loading indicator during score calculation
- [ ] **Test coverage**: Minimum 95% code coverage with comprehensive unit tests
- [ ] **Documentation**: All functions documented with JSDoc comments explaining business logic
