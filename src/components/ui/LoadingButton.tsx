'use client';

import { ButtonHTMLAttributes } from 'react';

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is in a loading state */
  isLoading: boolean;
  /** Text to display when loading */
  loadingText?: string;
  /** Size variant of the button */
  size?: 'small' | 'medium' | 'large';
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * A button component that displays loading state with spinner and optional loading text
 */
export function LoadingButton({
  children,
  isLoading,
  loadingText = 'Loading...',
  size = 'medium',
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm h-8',
    medium: 'px-4 py-2 text-base h-10',
    large: 'px-6 py-3 text-lg h-12'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const spinnerSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-describedby={isLoading ? 'loading-status' : undefined}
      {...props}
    >
      {isLoading && (
        <svg
          className={`animate-spin ${spinnerSizes[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>
        {isLoading ? loadingText : children}
      </span>
      {isLoading && (
        <span id="loading-status" className="sr-only">
          Loading, please wait
        </span>
      )}
    </button>
  );
}