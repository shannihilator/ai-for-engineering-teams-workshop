import { ButtonHTMLAttributes } from 'react'

interface TestButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text content for the button */
  children: React.ReactNode
  /** Variant styling for the button */
  variant?: 'primary' | 'secondary' | 'danger'
  /** Loading state indicator */
  isLoading?: boolean
  /** ARIA label for accessibility (required if children is not descriptive text) */
  'aria-label'?: string
}

/**
 * Accessible test button component that demonstrates platform constraints
 * 
 * Accessibility features:
 * - Semantic HTML button element for screen readers
 * - Keyboard navigation support (Tab, Enter, Space)
 * - ARIA attributes for enhanced accessibility
 * - Focus indicators with high contrast
 * - Loading state with proper ARIA live region
 */
export default function TestButton({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}: TestButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center px-4 py-2 text-sm font-medium 
    rounded-md border transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:transition-colors hover:duration-150
  `

  const variantStyles = {
    primary: `
      bg-blue-600 text-white border-blue-600 
      hover:bg-blue-700 hover:border-blue-700
      active:bg-blue-800
    `,
    secondary: `
      bg-gray-100 text-gray-900 border-gray-300 
      hover:bg-gray-200 hover:border-gray-400
      active:bg-gray-300
    `,
    danger: `
      bg-red-600 text-white border-red-600 
      hover:bg-red-700 hover:border-red-700
      active:bg-red-800
    `
  }

  const finalDisabled = disabled || isLoading

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
      disabled={finalDisabled}
      aria-label={ariaLabel}
      aria-disabled={finalDisabled}
      // ARIA live region for loading state
      aria-describedby={isLoading ? `${props.id}-loading` : undefined}
      type={props.type || 'button'}
    >
      {/* Loading indicator with screen reader support */}
      {isLoading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true" // Hide decorative icon from screen readers
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {/* Hidden loading text for screen readers */}
          <span id={`${props.id}-loading`} className="sr-only">
            Loading...
          </span>
        </>
      )}
      
      {/* Button content */}
      <span className={isLoading ? 'opacity-75' : ''}>
        {children}
      </span>
    </button>
  )
}

/**
 * Example usage demonstrating accessibility considerations:
 * 
 * <TestButton 
 *   variant="primary" 
 *   onClick={handleSubmit}
 *   aria-label="Submit customer form" // Descriptive label
 * >
 *   Submit
 * </TestButton>
 * 
 * <TestButton 
 *   variant="secondary" 
 *   isLoading={isSubmitting}
 *   disabled={!isValid}
 *   onClick={handleSave}
 * >
 *   {isSubmitting ? 'Saving...' : 'Save Changes'}
 * </TestButton>
 * 
 * Keyboard navigation:
 * - Tab: Focus button
 * - Enter/Space: Activate button
 * - Focus indicators: Blue ring with high contrast
 * 
 * Screen reader experience:
 * - Announces as "button" 
 * - Reads aria-label or text content
 * - Announces disabled/loading states
 * - Loading spinner hidden from screen readers
 */