/**
 * Badge Component
 * Small status/label indicator with variant support
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-500 text-white dark:bg-primary-600',
        secondary:
          'border-transparent bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100',
        success:
          'border-transparent bg-success-500 text-white dark:bg-success-600',
        warning:
          'border-transparent bg-warning-500 text-white dark:bg-warning-600',
        danger:
          'border-transparent bg-danger-500 text-white dark:bg-danger-600',
        info:
          'border-transparent bg-info-500 text-white dark:bg-info-600',
        outline:
          'border-neutral-300 bg-transparent text-neutral-900 dark:border-neutral-700 dark:text-neutral-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Content to display in the badge
   */
  children: React.ReactNode;
}

/**
 * Badge component for status indicators and labels
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="danger">Error</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
