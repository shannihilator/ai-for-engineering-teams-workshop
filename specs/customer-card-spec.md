# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: CustomerCard Component

### Context
- Individual customer display component for the Customer Intelligence Dashboard
- Used within CustomerSelector container component as a child component
- Provides at-a-glance customer information for quick identification and selection
- Used by business analysts, customer success managers, and sales teams to visually scan customer data

### Requirements
- Display customer name, company name, and health score in a clean card layout
- Implement color-coded health indicator system with three states:
  - Red (0-30): Poor health score with red background/border
  - Yellow (31-70): Moderate health score with yellow background/border  
  - Green (71-100): Good health score with green background/border
- Support click/tap interaction for customer selection
- Responsive design that adapts from card to compact list item on mobile
- Clean, card-based visual design with proper spacing and typography

### Constraints
- Technical stack and frameworks (Next.js 15, React 19, TypeScript, Tailwind CSS)
- Performance requirements: render individual cards within 10ms each
- Design constraints: responsive breakpoints (mobile: 320px+, tablet: 768px+, desktop: 1024px+)
- File structure: component in `src/components/CustomerCard.tsx`
- Props interface: `CustomerCardProps` with customer data object and selection handler
- Security considerations: sanitize customer name and company display text

### Acceptance Criteria
- [ ] Displays customer name, company name, and health score clearly
- [ ] Health score color coding works correctly for all three ranges (0-30 red, 31-70 yellow, 71-100 green)
- [ ] Card responds to click/tap events and triggers selection callback
- [ ] Component adapts layout appropriately across mobile, tablet, and desktop breakpoints
- [ ] Typography and spacing follow design system consistency
- [ ] Handles missing or invalid customer data gracefully
- [ ] Accessible with proper ARIA labels and keyboard navigation support
- [ ] Visual hover and focus states provide clear interaction feedback