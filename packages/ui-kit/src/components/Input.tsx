/**
 * Input Component
 * Text input with support for labels, hints, and error states
 */

import * as React from 'react';
import { cn } from '../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text displayed above the input
   */
  label?: string;
  /**
   * Helper text displayed below the input
   */
  hint?: string;
  /**
   * Error message - displays in red and changes input border
   */
  error?: string;
  /**
   * If true, adds asterisk to label
   */
  required?: boolean;
  /**
   * Full width input
   */
  fullWidth?: boolean;
}

/**
 * Text input component with label, hint, and error support
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, required, fullWidth, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
          >
            {label}
            {required && <span className="ml-1 text-danger-500" aria-label="required">*</span>}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-neutral-900 dark:text-neutral-100',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-neutral-300 dark:border-neutral-700',
            className
          )}
          aria-describedby={cn(hintId, errorId)}
          aria-invalid={!!error}
          required={required}
          {...props}
        />

        {hint && !error && (
          <p id={hintId} className="text-xs text-neutral-600 dark:text-neutral-400">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs text-danger-600 dark:text-danger-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
