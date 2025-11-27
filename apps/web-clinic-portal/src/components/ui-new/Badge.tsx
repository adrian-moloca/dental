/**
 * Badge Component
 *
 * Preclinic-style badge/label component for status indicators.
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant =
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
  | 'soft-info'
  | 'soft-purple'
  | 'soft-pink'
  | 'soft-orange'
  | 'soft-teal'
  | 'soft-indigo'
  | 'soft-cyan'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info';

type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge visual style */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Icon to display */
  icon?: string;
  /** Pill shape (more rounded) */
  pill?: boolean;
  /** Show status dot */
  dot?: boolean;
  /** Pulse animation */
  pulse?: boolean;
  /** Badge content */
  children?: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      pill = false,
      dot = false,
      pulse = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClass = size === 'md' ? '' : `badge-${size}`;

    return (
      <span
        ref={ref}
        className={clsx(
          'badge',
          `badge-${variant}`,
          sizeClass,
          {
            'badge-pill': pill,
            'badge-dot': dot,
            'badge-pulse': pulse,
          },
          className
        )}
        {...props}
      >
        {icon && <i className={icon}></i>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge with dot
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'scheduled' | 'confirmed' | 'in-progress';
  children?: ReactNode;
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, children, ...props }, ref) => {
    const statusLabels: Record<StatusBadgeProps['status'], string> = {
      active: 'Activ',
      inactive: 'Inactiv',
      pending: 'In asteptare',
      completed: 'Finalizat',
      cancelled: 'Anulat',
      scheduled: 'Programat',
      confirmed: 'Confirmat',
      'in-progress': 'In desfasurare',
    };

    return (
      <span
        ref={ref}
        className={clsx('status-badge', `status-${status}`, className)}
        {...props}
      >
        <span className="status-dot"></span>
        {children || statusLabels[status]}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Priority Badge
export interface PriorityBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

export const PriorityBadge = forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ priority, className, ...props }, ref) => {
    const labels = {
      urgent: 'Urgent',
      high: 'Ridicata',
      medium: 'Medie',
      low: 'Scazuta',
    };

    return (
      <span
        ref={ref}
        className={clsx('badge', `priority-${priority}`, className)}
        {...props}
      >
        {labels[priority]}
      </span>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';

export default Badge;
