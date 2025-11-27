/**
 * EmptyState Component
 *
 * Standardized empty states with helpful messages and clear calls-to-action.
 * Used consistently across the application for better UX.
 */

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Icon to display (Tabler icon class) */
  icon?: string;
  /** Title of the empty state */
  title: string;
  /** Description or helpful message */
  description?: string;
  /** Call-to-action button or element */
  action?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon = 'ti ti-inbox',
  title,
  description,
  action,
  className = '',
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: { container: 'py-4', avatar: 'avatar-lg', icon: 'fs-32', title: 'h6', spacing: 'mb-2' },
    md: { container: 'py-5', avatar: 'avatar-xl', icon: 'fs-48', title: 'h5', spacing: 'mb-3' },
    lg: { container: 'py-6', avatar: 'avatar-xxl', icon: 'fs-64', title: 'h4', spacing: 'mb-4' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`text-center ${sizes.container} ${className}`}>
      <div className={`avatar ${sizes.avatar} bg-light rounded-circle mx-auto ${sizes.spacing}`}>
        <i className={`${icon} ${sizes.icon} text-muted`}></i>
      </div>
      <h6 className={`${sizes.title} fw-semibold mb-2`}>{title}</h6>
      {description && (
        <p className="text-muted mb-4 small" style={{ maxWidth: 400, margin: '0 auto' }}>
          {description}
        </p>
      )}
      {action && <div className="d-flex gap-2 justify-content-center">{action}</div>}
    </div>
  );
}

export default EmptyState;
