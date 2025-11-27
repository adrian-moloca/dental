/**
 * Accessible Icon Component
 *
 * Wrapper for icon-only buttons with proper accessibility support.
 * Ensures all icon-only buttons have aria-labels and proper keyboard navigation.
 *
 * WCAG 2.1 AA Compliance:
 * - WCAG 1.1.1: Non-text Content (aria-label required)
 * - WCAG 2.4.4: Link Purpose (In Context)
 * - WCAG 2.5.3: Label in Name
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export interface AccessibleIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon class name (e.g., "ti ti-plus") */
  icon: string;
  /** Accessible label for screen readers (REQUIRED) */
  label: string;
  /** Button variant */
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'soft-primary'
    | 'soft-secondary'
    | 'soft-success'
    | 'soft-danger'
    | 'soft-warning'
    | 'soft-info';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Tooltip text (optional, defaults to label) */
  tooltip?: string;
}

/**
 * Accessible Icon Button Component
 *
 * Usage:
 * ```tsx
 * <AccessibleIcon
 *   icon="ti ti-plus"
 *   label="Add new item"
 *   onClick={handleAdd}
 * />
 * ```
 */
export const AccessibleIcon = forwardRef<HTMLButtonElement, AccessibleIconProps>(
  (
    {
      icon,
      label,
      variant = 'soft-secondary',
      size = 'md',
      loading = false,
      tooltip,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClass = size === 'md' ? '' : `btn-${size}`;
    const tooltipText = tooltip || label;

    return (
      <button
        ref={ref}
        type="button"
        className={clsx('btn', `btn-${variant}`, sizeClass, 'btn-icon', className)}
        aria-label={label}
        title={tooltipText}
        disabled={disabled || loading}
        aria-busy={loading ? 'true' : undefined}
        {...props}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        ) : (
          <i className={icon} aria-hidden="true"></i>
        )}
      </button>
    );
  }
);

AccessibleIcon.displayName = 'AccessibleIcon';

/**
 * Accessible Icon Link Component
 *
 * For icon-only links (not buttons).
 */
export interface AccessibleIconLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Icon class name */
  icon: string;
  /** Accessible label for screen readers (REQUIRED) */
  label: string;
  /** Tooltip text (optional, defaults to label) */
  tooltip?: string;
}

export const AccessibleIconLink = forwardRef<HTMLAnchorElement, AccessibleIconLinkProps>(
  ({ icon, label, tooltip, className, ...props }, ref) => {
    const tooltipText = tooltip || label;

    return (
      <a
        ref={ref}
        className={clsx('icon-link', className)}
        aria-label={label}
        title={tooltipText}
        {...props}
      >
        <i className={icon} aria-hidden="true"></i>
      </a>
    );
  }
);

AccessibleIconLink.displayName = 'AccessibleIconLink';

export default AccessibleIcon;
