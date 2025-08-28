# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI for Engineering Teams workshop repository for building a Customer Intelligence Dashboard using spec-driven development. The project teaches iterative development with AI agents through a series of progressive exercises.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# TypeScript type checking
npm run type-check
```

## Architecture and Structure

### Core Directories
- `src/app/` - Next.js App Router pages and layouts
- `src/data/` - Mock data interfaces and implementations
- `exercises/` - Workshop exercises (progressive skill building)
- `requirements/` - Feature requirements and specifications
- `specs/` - Generated AI specifications (output directory)
- `templates/` - Specification templates for AI agents

### Data Layer
The project uses mock data exclusively:
- `src/data/mock-customers.ts` - Customer interface and data with health scores, domains, subscription tiers
- `src/data/mock-market-intelligence.ts` - Market data generation with sentiment analysis

Customer health scores use color-coded ranges:
- Red (0-30): Poor health score
- Yellow (31-70): Moderate health score  
- Green (71-100): Good health score

### Tech Stack
- Next.js 15+ with App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS v4
- Path aliases: `@/*` maps to `./src/*`

### Workshop Methodology

This codebase follows **spec-driven development**:

1. Use templates from `/templates/spec-template.md` to create specifications
2. Store generated specs in `/specs/` directory
3. Work through `/exercises/` progressively
4. Each exercise builds upon previous skills

### Spec Template Structure
When creating specifications, follow the template format:
- **Context**: Purpose, system role, user interactions
- **Requirements**: Functional, UI, data, integration needs
- **Constraints**: Tech stack, performance, design, security, accessibility
- **Acceptance Criteria**: Testable success criteria with checkboxes

### Platform Constraints

#### Accessibility Requirements (WCAG 2.1 AA Standards)
All workshop components must meet accessibility standards:
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Semantic HTML**: Proper HTML structure with heading hierarchy
- **ARIA Support**: ARIA labels and descriptions for complex UI components
- **Color Contrast**: Meet AA standards (4.5:1 for normal text, 3:1 for large text)
- **Focus Indicators**: Visible and clear focus indicators for all interactive elements
- **Alternative Text**: Alternative text for images and icons
- **Screen Reader Support**: Content structure must be screen reader friendly
- **Reduced Motion**: Support users with reduced motion preferences

### Component Development Guidelines

When building Customer Intelligence Dashboard components:
- Use the Customer interface from `src/data/mock-customers.ts`
- Implement health score color coding consistently
- Support responsive design for mobile and desktop
- Follow existing naming conventions and file structure
- Use TypeScript interfaces for all props and data structures
- Integrate with mock data sources without external API dependencies

### Development Notes

- The project is designed for VS Code Dev Containers but works with local Node.js LTS
- All exercises are self-contained and can be approached iteratively
- Focus on spec-driven development patterns rather than just completing tasks
- Security best practices should be maintained for AI-generated code