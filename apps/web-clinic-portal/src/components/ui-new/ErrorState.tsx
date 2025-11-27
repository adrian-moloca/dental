/**
 * ErrorState Component
 *
 * Standardized error states with helpful recovery actions.
 * Provides consistent error messaging across the application.
 */

import type { ReactNode } from 'react';

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message or description */
  message?: string;
  /** Icon to display (Tabler icon class) */
  icon?: string;
  /** Action buttons (retry, go back, etc.) */
  actions?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Error severity */
  severity?: 'error' | 'warning' | 'info';
}

export function ErrorState({
  title = 'A aparut o eroare',
  message = 'Ne pare rau, ceva nu a mers bine. Va rugam incercati din nou.',
  icon,
  actions,
  className = '',
  severity = 'error',
}: ErrorStateProps) {
  const severityConfig = {
    error: {
      icon: icon || 'ti ti-alert-circle',
      bgColor: 'bg-danger-transparent',
      textColor: 'text-danger',
      borderColor: 'border-danger',
    },
    warning: {
      icon: icon || 'ti ti-alert-triangle',
      bgColor: 'bg-warning-transparent',
      textColor: 'text-warning',
      borderColor: 'border-warning',
    },
    info: {
      icon: icon || 'ti ti-info-circle',
      bgColor: 'bg-info-transparent',
      textColor: 'text-info',
      borderColor: 'border-info',
    },
  };

  const config = severityConfig[severity];

  return (
    <div className={`text-center py-5 ${className}`}>
      <div className={`avatar avatar-xl ${config.bgColor} rounded-circle mx-auto mb-3`}>
        <i className={`${config.icon} fs-32 ${config.textColor}`}></i>
      </div>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted mb-4">{message}</p>
      {actions && <div className="d-flex gap-2 justify-content-center">{actions}</div>}
    </div>
  );
}

export default ErrorState;
