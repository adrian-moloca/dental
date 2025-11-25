/**
 * Textarea Component
 * Multi-line text input with label, hint, and error support
 */

import * as React from 'react';
import { cn } from '../utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text displayed above the textarea
   */
  label?: string;
  /**
   * Helper text displayed below the textarea
   */
  hint?: string;
  /**
   * Error message - displays in red and changes textarea border
   */
  error?: string;
  /**
   * If true, adds asterisk to label
   */
  required?: boolean;
  /**
   * Full width textarea
   */
  fullWidth?: boolean;
}

/**
 * Multi-line textarea component with label, hint, and error support
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description"
 *   rows={4}
 *   error={errors.description}
 * />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, required, fullWidth, id, rows = 3, ...props }, ref) => {
    const textareaId = id || React.useId();
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
          >
            {label}
            {required && <span className="ml-1 text-danger-500" aria-label="required">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-neutral-900 dark:text-neutral-100',
            'resize-y',
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

Textarea.displayName = 'Textarea';
