# Code Quality Requirements

## Business Context
- Maintain consistent code quality across all AI-generated components
- Ensure code is readable, maintainable, and follows team conventions
- Reduce technical debt and improve long-term maintainability

## Code Quality Standards
- Use descriptive variable and function names (no abbreviations like `btn`, `usr`)
- Add TypeScript interfaces for all props and data structures
- Include JSDoc comments for complex functions
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)
- Implement proper error boundaries and error handling
- Use meaningful commit messages and code comments

## React-Specific Quality Rules
- Prefer named exports over default exports for components
- Use custom hooks for reusable logic
- Implement proper loading and error states for async operations
- Add prop validation with TypeScript interfaces
- Use semantic JSX element names that describe purpose, not appearance