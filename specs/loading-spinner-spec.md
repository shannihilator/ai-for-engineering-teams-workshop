# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: LoadingSpinner Component

### Context

- Provides visual feedback during data loading operations throughout the Customer Intelligence Dashboard
- Improves user experience by indicating system activity and preventing confusion during wait times
- Used across multiple components when fetching customer data, health scores, or performing searches
- Essential for maintaining user engagement during API calls and data processing

### Requirements

- Display animated spinning indicator with consistent visual styling
- Support multiple sizes (small, medium, large) for different use cases
- Include accessible loading text for screen readers
- Provide customizable color scheme to match component contexts
- Support overlay mode for full-screen loading states
- Maintain smooth animation performance across all devices

### Constraints

- Technical stack and frameworks (Next.js 15, React 19, TypeScript, Tailwind CSS)
- Performance requirements: animations must maintain 60fps on all target devices
- Design constraints: responsive sizing for mobile (16px), tablet (24px), desktop (32px)
- File structure: component in `src/components/LoadingSpinner.tsx`
- Props interface: `LoadingSpinnerProps` with size, color, and overlay options
- Accessibility: ARIA live region with loading announcement for screen readers

### Acceptance Criteria

- [ ] Spinner animates smoothly with consistent rotation speed
- [ ] Component accepts size prop (small: 16px, medium: 24px, large: 32px)
- [ ] Screen readers announce loading state with "Loading..." text
- [ ] Color can be customized via className or theme prop
- [ ] Overlay mode dims background and centers spinner
- [ ] Component renders without layout shift or content jumping
- [ ] Loading text is customizable via props for different contexts
- [ ] Animation respects user's reduced motion preferences
