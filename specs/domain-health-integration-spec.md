# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: Domain Health Integration

### Context
- Complete domain health checking feature for the Customer Intelligence Dashboard
- Enables users to monitor customer domain health in real-time
- Multi-layered architecture demonstrating orchestrated AI development patterns
- Used by customer success managers and technical teams to assess domain reliability
- Integrates with external APIs through secure Stillriver proxy to API Ninjas

### Requirements
- **API Layer**: Next.js API route at `/api/domain-health/[domain]` with Stillriver API integration (https://api.stillriver.info/)
- **Service Layer**: DomainHealthService class with business logic abstraction and 5-minute TTL caching
- **UI Component**: DomainHealthWidget with domain input validation and color-coded status indicators (green/yellow/red)
- **Data Flow**: Domain input → Client validation → Service layer → API call → Stillriver API → Cached response → UI display
- **Real-time Feedback**: Loading spinners, error states, and visual health status feedback
- **Performance**: 5-minute TTL caching to optimize Stillriver API calls and improve response times
- **Security**: Domain input sanitization, SSRF protection, timeout handling, and sanitized error messages

### Constraints
- Technical stack and frameworks (Next.js 15 App Router, React 19, TypeScript, Tailwind CSS)
- Performance requirements: API responses within 3 seconds, UI updates within 100ms
- Design constraints: responsive widget that fits dashboard layout, consistent with design system
- File structure: API routes in `src/app/api/domain-health/`, service in `src/services/`, component in `src/components/`
- Security constraints: Domain parameter validation, rate limiting considerations, timeout handling
- Integration constraints: Use Stillriver API (https://api.stillriver.info/) for external domain health checks

### Acceptance Criteria
- [ ] API route validates domain input and prevents injection attacks
- [ ] External API integration works through Stillriver API with proper error handling
- [ ] Service layer implements caching with 5-minute TTL expiration
- [ ] UI widget accepts domain input with client-side validation
- [ ] Health status displays with color-coded indicators (green/yellow/red)
- [ ] Response time and timestamp information shown to users
- [ ] Loading states provide clear feedback during API calls
- [ ] Error states handle network failures and invalid domains gracefully
- [ ] Security review passes for all API endpoints and data handling
- [ ] Component integrates seamlessly with existing Customer Intelligence Dashboard
- [ ] End-to-end functionality verified from UI input to API response display