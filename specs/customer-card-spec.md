# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: CustomerCard Component

### Context
- Individual customer display component for Customer Intelligence Dashboard
- Used within CustomerSelector container component to provide at-a-glance customer information
- Enables quick customer identification and health monitoring
- Foundation component for domain health monitoring integration
- Serves business users who need to rapidly assess customer status

### Requirements
- **Functional requirements:**
  - Display customer name, company name, and health score
  - Show customer domains (websites) for health monitoring context
  - Implement color-coded health indicator system:
    - Red (0-30): Poor health score
    - Yellow (31-70): Moderate health score
    - Green (71-100): Good health score
  - Display domain count when customer has multiple domains
- **User interface requirements:**
  - Clean, card-based visual design with domain information
  - Basic responsive design for mobile and desktop breakpoints
  - Color-coded visual health indicators
  - Clear typography hierarchy for customer information
- **Data requirements:**
  - Consume mock data from `src/data/mock-customers.ts`
  - Support Customer interface with optional `domains` array of website URLs
  - Handle customers with single or multiple domains for health checking
- **Integration requirements:**
  - Integrate seamlessly with CustomerSelector container component
  - Support future domain health monitoring features

### Constraints
- **Technical stack:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Performance requirements:** 
  - Fast rendering for multiple customer cards in list views
  - Minimal re-renders on data updates
- **Design constraints:**
  - Responsive breakpoints following project standards
  - Card component size must fit within container layouts
  - Consistent spacing and typography with design system
- **File structure:** Follow existing component organization in `src/components/`
- **Props interface:** Strongly typed TypeScript Customer interface
- **Security considerations:** No sensitive customer data exposure in client-side rendering

### Acceptance Criteria
- [ ] Displays customer name, company, and health score correctly
- [ ] Health score color coding works for all ranges (0-30 red, 31-70 yellow, 71-100 green)
- [ ] Shows individual domains or domain count for multiple domains
- [ ] Responsive design works on mobile and desktop breakpoints
- [ ] Card layout integrates properly within CustomerSelector component
- [ ] TypeScript interfaces are properly defined and used
- [ ] Component follows project file structure and naming conventions
- [ ] Mock data integration works without errors
- [ ] Visual design is clean and professional
- [ ] Performance is acceptable for rendering multiple cards