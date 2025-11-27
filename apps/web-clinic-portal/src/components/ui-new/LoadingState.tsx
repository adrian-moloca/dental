/**
 * LoadingState Component
 *
 * Standardized loading states for consistent UX across the application.
 * Includes skeleton loaders, spinners, and full-page loading states.
 */

import { Card, CardBody } from './Card';

export interface LoadingStateProps {
  /** Type of loading state */
  type?: 'spinner' | 'skeleton' | 'card' | 'table' | 'page';
  /** Number of skeleton rows/items to display */
  rows?: number;
  /** Loading message to display */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

export function LoadingState({
  type = 'spinner',
  rows = 5,
  message = 'Se incarca...',
  className = '',
}: LoadingStateProps) {
  // Simple spinner
  if (type === 'spinner') {
    return (
      <div className={`d-flex flex-column align-items-center justify-content-center py-5 ${className}`}>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">{message}</span>
        </div>
        <p className="text-muted">{message}</p>
      </div>
    );
  }

  // Table skeleton
  if (type === 'table') {
    return (
      <div className={`placeholder-glow ${className}`}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="d-flex gap-3 py-3 border-bottom">
            <span className="placeholder col-1 rounded"></span>
            <span className="placeholder col-3 rounded"></span>
            <span className="placeholder col-2 rounded"></span>
            <span className="placeholder col-2 rounded"></span>
            <span className="placeholder col-1 rounded"></span>
          </div>
        ))}
      </div>
    );
  }

  // Card skeleton
  if (type === 'card') {
    return (
      <Card className={`shadow-sm ${className}`}>
        <CardBody>
          <div className="placeholder-glow">
            <div className="d-flex gap-3 mb-3">
              <span className="placeholder col-2 bg-primary rounded" style={{ height: 60 }}></span>
              <div className="flex-grow-1">
                <span className="placeholder col-6 mb-2 rounded" style={{ height: 24 }}></span>
                <span className="placeholder col-4 rounded" style={{ height: 16 }}></span>
              </div>
            </div>
            {[...Array(rows)].map((_, i) => (
              <div key={i} className="mb-2">
                <span className="placeholder col-12 rounded" style={{ height: 12 }}></span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Full page loading
  if (type === 'page') {
    return (
      <div className={`d-flex flex-column align-items-center justify-content-center ${className}`} style={{ minHeight: '400px' }}>
        <div className="avatar avatar-xl bg-primary-transparent rounded-circle mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{message}</span>
          </div>
        </div>
        <h5 className="fw-semibold mb-2">{message}</h5>
        <p className="text-muted small">Va rugam asteptati...</p>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`placeholder-glow ${className}`}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="mb-3">
          <span className="placeholder col-8 mb-2 rounded" style={{ height: 20 }}></span>
          <span className="placeholder col-12 rounded" style={{ height: 40 }}></span>
        </div>
      ))}
    </div>
  );
}

export default LoadingState;
