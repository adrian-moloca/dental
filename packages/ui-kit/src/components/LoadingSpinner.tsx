/**
 * LoadingSpinner Component
 * Animated loading spinner with size variants
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current border-t-transparent', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      primary: 'text-primary-600 dark:text-primary-400',
      secondary: 'text-neutral-600 dark:text-neutral-400',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Label for screen readers
   */
  label?: string;
  /**
   * If true, centers the spinner in a flex container
   */
  centered?: boolean;
}

/**
 * Loading spinner component
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" label="Loading data..." />
 * <LoadingSpinner centered />
 * ```
 */
export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label = 'Loading...', centered, ...props }, ref) => {
    const spinner = (
      <div
        ref={ref}
        role="status"
        className={cn(spinnerVariants({ size, variant }), className)}
        aria-label={label}
        {...props}
      >
        <span className="sr-only">{label}</span>
      </div>
    );

    if (centered) {
      return (
        <div className="flex items-center justify-center w-full h-full p-4">
          {spinner}
        </div>
      );
    }

    return spinner;
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';
