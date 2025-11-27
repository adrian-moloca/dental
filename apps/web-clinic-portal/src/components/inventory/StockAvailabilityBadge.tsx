/**
 * Stock Availability Badge Component
 *
 * Displays stock status with color coding:
 * - Green: "In Stoc" - Sufficient stock
 * - Yellow: "Stoc Redus" - Low stock (below warning threshold)
 * - Red: "Lipsa Stoc" - Out of stock
 */

import clsx from 'clsx';
import type { StockStatus, UnitOfMeasure } from '../../types/inventory.types';
import { getStockStatusLabel, getUnitLabel } from '../../types/inventory.types';

interface StockAvailabilityBadgeProps {
  status: StockStatus;
  quantity?: number;
  unitOfMeasure?: UnitOfMeasure;
  showQuantity?: boolean;
  showWarningThreshold?: boolean;
  warningThreshold?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StockAvailabilityBadge({
  status,
  quantity,
  unitOfMeasure,
  showQuantity = false,
  showWarningThreshold = false,
  warningThreshold,
  size = 'md',
  className,
}: StockAvailabilityBadgeProps) {
  const statusLabel = getStockStatusLabel(status);
  const unitLabel = unitOfMeasure ? getUnitLabel(unitOfMeasure) : '';

  // Determine badge styling based on status
  const getBadgeClasses = () => {
    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full font-medium';

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };

    const statusClasses = {
      in_stock: 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30',
      low_stock: 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30',
      out_of_stock: 'bg-[var(--danger)]/15 text-[var(--danger)] border border-[var(--danger)]/30',
    };

    return clsx(baseClasses, sizeClasses[size], statusClasses[status], className);
  };

  // Status indicator dot
  const getStatusDotClasses = () => {
    const dotSizeClasses = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    const dotColorClasses = {
      in_stock: 'bg-[var(--success)]',
      low_stock: 'bg-[var(--warning)]',
      out_of_stock: 'bg-[var(--danger)]',
    };

    return clsx('rounded-full', dotSizeClasses[size], dotColorClasses[status]);
  };

  return (
    <span className={getBadgeClasses()} role="status" aria-label={`Status stoc: ${statusLabel}`}>
      <span className={getStatusDotClasses()} aria-hidden="true" />
      <span>{statusLabel}</span>
      {showQuantity && quantity !== undefined && (
        <span className="opacity-75">
          ({quantity} {unitLabel})
        </span>
      )}
      {showWarningThreshold && warningThreshold !== undefined && status === 'low_stock' && (
        <span className="opacity-60 text-[0.9em]" title={`Prag avertizare: ${warningThreshold} ${unitLabel}`}>
          [min: {warningThreshold}]
        </span>
      )}
    </span>
  );
}

/**
 * Compact variant for use in tables or dense layouts
 */
interface StockIndicatorDotProps {
  status: StockStatus;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
  quantity?: number;
  unitOfMeasure?: UnitOfMeasure;
  className?: string;
}

export function StockIndicatorDot({
  status,
  size = 'md',
  showTooltip = true,
  quantity,
  unitOfMeasure,
  className,
}: StockIndicatorDotProps) {
  const statusLabel = getStockStatusLabel(status);
  const unitLabel = unitOfMeasure ? getUnitLabel(unitOfMeasure) : '';

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
  };

  const colorClasses = {
    in_stock: 'bg-[var(--success)]',
    low_stock: 'bg-[var(--warning)]',
    out_of_stock: 'bg-[var(--danger)]',
  };

  const tooltipText =
    quantity !== undefined ? `${statusLabel}: ${quantity} ${unitLabel}` : statusLabel;

  return (
    <span
      className={clsx(
        'inline-block rounded-full',
        sizeClasses[size],
        colorClasses[status],
        className
      )}
      role="status"
      aria-label={tooltipText}
      title={showTooltip ? tooltipText : undefined}
    />
  );
}

/**
 * Stock quantity display with status context
 */
interface StockQuantityDisplayProps {
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  status: StockStatus;
  reorderLevel?: number;
  showReorderLevel?: boolean;
  className?: string;
}

export function StockQuantityDisplay({
  quantity,
  unitOfMeasure,
  status,
  reorderLevel,
  showReorderLevel = false,
  className,
}: StockQuantityDisplayProps) {
  const unitLabel = getUnitLabel(unitOfMeasure);

  const textColorClasses = {
    in_stock: 'text-[var(--success)]',
    low_stock: 'text-[var(--warning)]',
    out_of_stock: 'text-[var(--danger)]',
  };

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="flex items-baseline gap-1">
        <span className={clsx('font-semibold tabular-nums', textColorClasses[status])}>
          {quantity}
        </span>
        <span className="text-[var(--text-tertiary)] text-sm">{unitLabel}</span>
        <StockIndicatorDot status={status} size="sm" showTooltip={false} className="ml-1" />
      </div>
      {showReorderLevel && reorderLevel !== undefined && (
        <span className="text-xs text-[var(--text-tertiary)]">
          Nivel reaprovizionare: {reorderLevel} {unitLabel}
        </span>
      )}
    </div>
  );
}

/**
 * Warning banner for stock issues
 */
interface StockWarningBannerProps {
  status: StockStatus;
  productName: string;
  quantity?: number;
  unitOfMeasure?: UnitOfMeasure;
  requestedQuantity?: number;
  expirationDate?: string;
  className?: string;
}

export function StockWarningBanner({
  status,
  productName,
  quantity,
  unitOfMeasure,
  requestedQuantity,
  expirationDate,
  className,
}: StockWarningBannerProps) {
  const unitLabel = unitOfMeasure ? getUnitLabel(unitOfMeasure) : '';

  const getBannerClasses = () => {
    const baseClasses = 'flex items-start gap-2 rounded-lg p-3 text-sm';

    const statusClasses = {
      in_stock: 'bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)]',
      low_stock: 'bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-[var(--warning)]',
      out_of_stock: 'bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)]',
    };

    return clsx(baseClasses, statusClasses[status], className);
  };

  const getIcon = () => {
    if (status === 'out_of_stock') {
      return (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  const getMessage = () => {
    if (status === 'out_of_stock') {
      return `${productName} - Lipsa stoc`;
    }
    if (status === 'low_stock') {
      if (requestedQuantity !== undefined && quantity !== undefined) {
        return `${productName} - Stoc redus. Disponibil: ${quantity} ${unitLabel}, solicitat: ${requestedQuantity} ${unitLabel}`;
      }
      return `${productName} - Stoc redus. Disponibil: ${quantity} ${unitLabel}`;
    }
    return `${productName} - In stoc`;
  };

  return (
    <div className={getBannerClasses()} role="alert">
      {getIcon()}
      <div className="flex-1">
        <p className="font-medium">{getMessage()}</p>
        {expirationDate && (
          <p className="text-xs opacity-75 mt-0.5">
            Data expirare: {new Date(expirationDate).toLocaleDateString('ro-RO')}
          </p>
        )}
      </div>
    </div>
  );
}
