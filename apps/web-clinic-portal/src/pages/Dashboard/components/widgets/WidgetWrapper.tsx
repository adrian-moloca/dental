/**
 * WidgetWrapper Component
 *
 * Reusable wrapper for dashboard widgets with consistent styling,
 * drag handle, and loading/error states.
 */

import type { ReactNode } from 'react';
import { Card, CardHeader, CardBody } from '../../../../components/ui-new';
import clsx from 'clsx';

interface WidgetWrapperProps {
  id: string;
  title: string;
  icon?: string;
  actions?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  editMode?: boolean;
  className?: string;
}

export function WidgetWrapper({
  id,
  title,
  icon,
  actions,
  children,
  isLoading = false,
  isError = false,
  errorMessage = 'A aparut o eroare la incarcarea datelor',
  isEmpty = false,
  emptyMessage = 'Nu exista date de afisat',
  editMode = false,
  className,
}: WidgetWrapperProps) {
  return (
    <div key={id} className={clsx('dashboard-widget', className)}>
      <Card fullHeight className="h-100">
        <CardHeader
          className={clsx('d-flex align-items-center justify-content-between', {
            'widget-drag-handle cursor-move': editMode,
          })}
        >
          <div className="d-flex align-items-center gap-2">
            {icon && <i className={`${icon} fs-20`} aria-hidden="true"></i>}
            <h5 className="mb-0">{title}</h5>
            {editMode && (
              <span className="badge bg-primary-transparent text-primary ms-2">
                <i className="ti ti-arrows-move fs-12 me-1"></i>
                Edit
              </span>
            )}
          </div>
          {actions && <div className="widget-actions">{actions}</div>}
        </CardHeader>
        <CardBody className="overflow-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se incarca...</span>
              </div>
            </div>
          ) : isError ? (
            <div className="alert alert-danger mb-0" role="alert">
              <i className="ti ti-alert-circle me-2"></i>
              {errorMessage}
            </div>
          ) : isEmpty ? (
            <div className="text-center text-muted py-5">
              <i className="ti ti-inbox fs-48 d-block mb-3 opacity-50"></i>
              <p className="mb-0">{emptyMessage}</p>
            </div>
          ) : (
            children
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default WidgetWrapper;
