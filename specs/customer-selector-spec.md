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
  - Support multiselect functionality with toggle selection behavior
  - Support visual selection state with highlighted selected customers
  - Persist customer selection across component re-renders and page interactions
  - Handle large datasets efficiently (100+ customers) with search optimization
  - Provide clear visual feedback for empty search results
  - Support keyboard navigation for accessibility
  - Enable single-select mode via configuration prop
- **User interface requirements:**
  - Clean search input field with search icon and clear button
  - Responsive grid layout that adapts to different screen sizes
  - Selected customers state with visual highlighting (border, background color)
  - Selection count display showing number of selected customers
  - Selected customers banner with individual removal capabilities
  - Loading states for search operations
  - Empty state messaging when no customers match search criteria
  - Consistent spacing and typography with existing design system
- **Data requirements:**
  - Consume mock data from `src/data/mock-customers.ts`
  - Support Customer interface with all existing properties
  - Maintain selected customers array state in component state or context
  - Handle search filtering without external API calls
  - Support initial selection via selectedCustomerIds prop
- **Integration requirements:**
  - Seamlessly integrate existing CustomerCard component
  - Emit selection events with array of selected customers for parent components
  - Support controlled and uncontrolled selection modes
  - Compatible with future customer detail views and analytics components
  - Provide multiselect prop for enabling/disabling multiselect behavior

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
- [x] Displays all customers using CustomerCard components in responsive grid
- [x] Search functionality filters customers by name and company in real-time
- [x] Multiple customers can be selected simultaneously with toggle behavior
- [x] Selected customers are visually highlighted and state persists across interactions
- [x] Selection count is displayed in the header ("3 selected")
- [x] Selected customers banner shows all selected customers with individual remove buttons
- [x] Handles 100+ customers with acceptable performance (< 100ms search response)
- [x] Empty search results show appropriate messaging with custom cat icon
- [x] Keyboard navigation works for search input and customer selection
- [x] Component integrates properly with existing CustomerCard component
- [x] TypeScript interfaces are properly defined for all props and multiselect state
- [x] Responsive design works on mobile, tablet, and desktop breakpoints
- [x] Search input includes proper ARIA labels and accessibility features
- [x] Component follows project file structure and naming conventions
- [x] Visual design is consistent with existing dashboard components
- [x] Loading states are handled gracefully during search operations
- [x] Selected customers array can be accessed by parent components via callback props
- [x] Search input can be cleared with dedicated clear button or escape key
- [x] Multiselect mode can be disabled via multiselect prop for single-select behavior
- [x] Initial selection can be set via selectedCustomerIds prop
- [x] Cards maintain consistent size when selected (no overlapping from scaling)