/**
 * Button Component
 *
 * Preclinic-style button component with multiple variants.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info'
  | 'outline-light'
  | 'outline-dark'
  | 'soft-primary'
  | 'soft-secondary'
  | 'soft-success'
  | 'soft-danger'
  | 'soft-warning'
  | 'soft-info'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Icon to display before the text */
  icon?: string;
  /** Icon to display after the text */
  iconRight?: string;
  /** Display only icon (square button) */
  iconOnly?: boolean;
  /** Display loading spinner */
  loading?: boolean;
  /** Make button full width */
  block?: boolean;
  /** Button content */
  children?: ReactNode;
  /** Accessible label for screen readers (required for icon-only buttons) */
  'aria-label'?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      iconOnly = false,
      loading = false,
      block = false,
      disabled,
      className,
      children,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const sizeClass = size === 'md' ? '' : `btn-${size}`;

    return (
      <button
        ref={ref}
        className={clsx(
          'btn',
          `btn-${variant}`,
          sizeClass,
          {
            'btn-icon': iconOnly,
            'w-100': block,
          },
          className
        )}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading ? 'true' : undefined}
        {...props}
      >
        {loading && (
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        )}
        {icon && !loading && <i className={icon}></i>}
        {!iconOnly && children}
        {iconRight && !loading && <i className={iconRight}></i>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
