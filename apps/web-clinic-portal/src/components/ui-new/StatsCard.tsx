/**
 * StatsCard Component
 *
 * Preclinic-style statistics card for dashboards.
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

type IconColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type TrendDirection = 'up' | 'down';

export interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Main statistic value */
  value: string | number;
  /** Label describing the stat */
  label: string;
  /** Icon class name */
  icon?: string;
  /** Icon background color */
  iconColor?: IconColor;
  /** Trend percentage */
  trend?: number;
  /** Trend direction (auto-detected from trend if not provided) */
  trendDirection?: TrendDirection;
  /** Trend label (e.g., "vs last week") */
  trendLabel?: string;
  /** Additional content below the stats */
  footer?: ReactNode;
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      value,
      label,
      icon,
      iconColor = 'primary',
      trend,
      trendDirection,
      trendLabel,
      footer,
      className,
      ...props
    },
    ref
  ) => {
    // Auto-detect trend direction
    const direction = trendDirection || (trend !== undefined && trend >= 0 ? 'up' : 'down');
    const trendValue = trend !== undefined ? Math.abs(trend) : undefined;

    return (
      <div ref={ref} className={clsx('card stats-card', className)} {...props}>
        <div className="card-body">
          {icon && (
            <div className={`stats-icon bg-${iconColor}-transparent`}>
              <i className={icon}></i>
            </div>
          )}
          <div className="stats-content">
            <h3>{value}</h3>
            <p>{label}</p>
            {trendValue !== undefined && (
              <div className={`stats-trend trend-${direction}`}>
                <i className={`ti ti-trending-${direction}`}></i>
                <span>{trendValue}%</span>
                {trendLabel && <span className="text-muted ms-1">{trendLabel}</span>}
              </div>
            )}
          </div>
        </div>
        {footer && <div className="card-footer py-2 px-4">{footer}</div>}
      </div>
    );
  }
);

StatsCard.displayName = 'StatsCard';

// Compact Stats Card (inline layout)
export interface CompactStatsProps extends HTMLAttributes<HTMLDivElement> {
  /** Statistic value */
  value: string | number;
  /** Label */
  label: string;
  /** Icon class */
  icon?: string;
  /** Color variant */
  color?: IconColor;
}

export const CompactStats = forwardRef<HTMLDivElement, CompactStatsProps>(
  ({ value, label, icon, color = 'primary', className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('d-flex align-items-center gap-3', className)} {...props}>
        {icon && (
          <div
            className={`d-flex align-items-center justify-content-center rounded-2 bg-${color}-transparent`}
            style={{ width: 48, height: 48 }}
          >
            <i className={`${icon} text-${color}`} style={{ fontSize: 20 }}></i>
          </div>
        )}
        <div>
          <h5 className="mb-0 fw-bold">{value}</h5>
          <small className="text-muted">{label}</small>
        </div>
      </div>
    );
  }
);

CompactStats.displayName = 'CompactStats';

export default StatsCard;
