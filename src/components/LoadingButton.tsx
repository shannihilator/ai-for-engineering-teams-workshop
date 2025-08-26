import React from 'react';

/**
 * Props interface for the LoadingButton component
 */
interface LoadingButtonProps {
  /** Text content to display on the button */
  children: React.ReactNode;
  /** Function to call when button is clicked */
  onClick: () => void | Promise<void>;
  /** Whether the button is currently in loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  isDisabled?: boolean;
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Additional CSS classes to apply */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** ID of element that describes this button */
  ariaDescribedBy?: string;
}

/**
 * LoadingButton component that shows loading state during async operations
 * 
 * Features:
 * - Displays spinner during loading state
 * - Prevents multiple clicks while loading
 * - Maintains accessibility with proper ARIA attributes
 * - Supports multiple visual variants
 * 
 * @param props - The component props
 * @returns JSX element representing the loading button
 */
export function LoadingButton({
  children,
  onClick,
  isLoading = false,
  isDisabled = false,
  variant = 'primary',
  className = '',
  ariaLabel,
  ariaDescribedBy
}: LoadingButtonProps) {
  /**
   * Handles button click events, preventing action during loading state
   */
  const handleButtonClick = async () => {
    if (isLoading || isDisabled) {
      return;
    }

    try {
      await onClick();
    } catch (error) {
      console.error('LoadingButton: Error during onClick handler:', error);
      // In a real application, you might want to show user-friendly error feedback
    }
  };

  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:hover:bg-red-600'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  const isButtonDisabled = isLoading || isDisabled;

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={isButtonDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={isLoading}
      className={combinedClasses}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="img"
          aria-label="Loading spinner"
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
      )}
      <span className={isLoading ? 'opacity-75' : ''}>
        {children}
      </span>
    </button>
  );
}