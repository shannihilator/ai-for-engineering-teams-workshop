# Domain Health Integration Requirements

## Business Context
- Build a complete domain health checking feature for the Customer Intelligence Dashboard
- Allow users to check the health status of customer domains
- Provide real-time domain health monitoring with caching for performance
- Demonstrate multi-step AI orchestration for full-stack integrations

## Functional Requirements
### API Layer
- Create Next.js API route for domain health checking at `/api/domain-health/[domain]`
- Integrate with Stillriver proxy to API Ninjas for external data
- Validate domain input and sanitize responses
- Return consistent JSON response format with health status, response time, and timestamp

### Service Layer
- Create DomainHealthService class for business logic abstraction
- Implement caching with TTL expiration (5-minute cache)
- Centralized error handling and logging
- Pure function implementations for testability

### UI Component
- Build DomainHealthWidget component for user interaction
- Input field for domain entry with validation
- Display health status with color-coded indicators (green/yellow/red)
- Show response time and last checked timestamp
- Loading and error states with proper user feedback

## Security Requirements
- Domain parameter validation to prevent injection attacks
- Input sanitization and SSRF protection
- Proper timeout handling for external API calls
- Error message sanitization (no sensitive information leakage)
- Rate limiting considerations for API routes

## Technical Constraints
- Next.js 15 App Router with Route Handlers
- TypeScript with strict typing for all interfaces
- React 19 hooks and patterns for UI components
- Tailwind CSS for styling with design system colors
- Error boundaries for robustness and graceful failure handling