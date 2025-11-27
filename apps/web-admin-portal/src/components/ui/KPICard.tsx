import type { ReactNode } from 'react';
import { Card } from 'react-bootstrap';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  iconVariant = 'primary',
  className = ''
}: KPICardProps) {
  return (
    <Card className={`stats-card border-0 ${className}`}>
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between">
          <div className="flex-grow-1">
            <p className="text-muted small mb-1">{title}</p>
            <h3 className="mb-0 fw-bold">{value}</h3>
            {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`d-flex align-items-center gap-1 mt-2 small ${trend.isPositive ? 'text-success' : 'text-danger'}`}>
                <i className={`ti ${trend.isPositive ? 'ti-trending-up' : 'ti-trending-down'}`} />
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted">vs last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`stats-icon ${iconVariant}`}>
              {icon}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
