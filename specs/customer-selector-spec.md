# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: CustomerSelector Component

### Context
- Main customer selection interface for the Customer Intelligence Dashboard
- Container component that manages customer search, filtering, and selection functionality
- Integrates with existing CustomerCard component to display customer information
- Used by business users who need to quickly find and select customers from large datasets (100+ customers)
- Central hub for customer interactions before diving into detailed customer analytics
- Foundation component for customer-focused dashboard workflows

### Requirements
- **Functional requirements:**
  - Display list of customer cards using existing CustomerCard component
  - Implement real-time search functionality by customer name and company name
  - Support visual selection state with highlighted selected customer
  - Persist customer selection across component re-renders and page interactions
  - Handle large datasets efficiently (100+ customers) with search optimization
  - Provide clear visual feedback for empty search results
  - Support keyboard navigation for accessibility
- **User interface requirements:**
  - Clean search input field with search icon and clear button
  - Responsive grid layout that adapts to different screen sizes
  - Selected customer state with visual highlighting (border, background color)
  - Loading states for search operations
  - Empty state messaging when no customers match search criteria
  - Consistent spacing and typography with existing design system
- **Data requirements:**
  - Consume mock data from `src/data/mock-customers.ts`
  - Support Customer interface with all existing properties
  - Maintain selected customer state in component state or context
  - Handle search filtering without external API calls
- **Integration requirements:**
  - Seamlessly integrate existing CustomerCard component
  - Emit selection events for parent components to handle
  - Support controlled and uncontrolled selection modes
  - Compatible with future customer detail views and analytics components

### Constraints
- **Technical stack:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Performance requirements:**
  - Search results must update within 100ms of user input
  - Support virtualization if needed for 100+ customer performance
  - Minimal re-renders when search terms change
  - Efficient filtering algorithms for large customer lists
- **Design constraints:**
  - Responsive breakpoints following project standards
  - Component must fit within dashboard layout constraints
  - Search input follows design system patterns
  - Selected state visual treatment must be accessible (WCAG 2.1 AA)
  - Consistent card sizing with CustomerCard component specifications
- **File structure:** Follow existing component organization in `src/components/`
- **Props interface:** Strongly typed TypeScript interfaces for all props and callbacks
- **Security considerations:** 
  - No sensitive customer data exposure in client-side filtering
  - Sanitize search input to prevent XSS vulnerabilities
  - No direct DOM manipulation for search highlighting

### Acceptance Criteria
- [ ] Displays all customers using CustomerCard components in responsive grid
- [ ] Search functionality filters customers by name and company in real-time
- [ ] Selected customer is visually highlighted and state persists across interactions
- [ ] Handles 100+ customers with acceptable performance (< 100ms search response)
- [ ] Empty search results show appropriate messaging to users
- [ ] Keyboard navigation works for search input and customer selection
- [ ] Component integrates properly with existing CustomerCard component
- [ ] TypeScript interfaces are properly defined for all props and state
- [ ] Responsive design works on mobile, tablet, and desktop breakpoints
- [ ] Search input includes proper ARIA labels and accessibility features
- [ ] Component follows project file structure and naming conventions
- [ ] Visual design is consistent with existing dashboard components
- [ ] Loading states are handled gracefully during search operations
- [ ] Selected customer can be accessed by parent components via callback props
- [ ] Search input can be cleared with dedicated clear button or escape key