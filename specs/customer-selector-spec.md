# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: CustomerSelector Component

### Context
- Main customer selection interface for the Customer Intelligence Dashboard
- Central component that allows users to browse and select customers for detailed analysis
- Primary entry point for customer-focused workflows in the dashboard
- Used by business analysts, customer success managers, and sales teams during customer review sessions

### Requirements
- Display customer cards showing name, company, and health score in a grid/list layout
- Implement real-time search functionality to filter customers by name or company
- Provide visual feedback for selected customer state with clear highlighting
- Handle large datasets (100+ customers) with efficient rendering and performance
- Maintain selection state persistence across component re-renders and page interactions
- Support keyboard navigation for accessibility compliance

### Constraints
- Technical stack and frameworks (Next.js 15, React 19, TypeScript, Tailwind CSS)
- Performance requirements: render 100+ customer cards within 200ms
- Design constraints: responsive breakpoints (mobile: 320px+, tablet: 768px+, desktop: 1024px+)
- File structure: component in `src/components/CustomerSelector.tsx`
- Props interface: `CustomerSelectorProps` with typed customer data array and selection handlers
- Security considerations: sanitize search input, validate customer data structure

### Acceptance Criteria
- [ ] Displays customer cards with name, company, and health score prominently
- [ ] Search input filters customers in real-time as user types
- [ ] Selected customer shows clear visual distinction (border, background, or highlight)
- [ ] Selection persists when searching or interacting with other components
- [ ] Component handles empty states (no customers, no search results) gracefully
- [ ] Keyboard navigation allows tab through customers and Enter to select
- [ ] Responsive layout adapts from grid to list view on mobile devices
- [ ] Loading state displays when customer data is being fetched