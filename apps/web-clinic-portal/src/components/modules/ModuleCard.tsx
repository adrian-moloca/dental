/**
 * ModuleCard Component
 *
 * Attractive card component for displaying module information in the marketplace.
 * Features:
 * - Module icon and name
 * - Short description
 * - Price display with currency
 * - Features list with checkmarks
 * - Status badge (Activ, Inactiv, Trial, Nou)
 * - CTA button (Activeaza, Upgrade, Configureaza)
 * - Hover effects
 */

import { forwardRef, type HTMLAttributes } from 'react';
import clsx from 'clsx';

export type ModuleStatus = 'active' | 'inactive' | 'trial' | 'new';
export type ModuleCategory = 'toate' | 'clinice' | 'financiar' | 'marketing' | 'integrari' | 'ai';

export interface ModuleData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ModuleCategory;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  status: ModuleStatus;
  trialDaysLeft?: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface ModuleCardProps extends HTMLAttributes<HTMLDivElement> {
  module: ModuleData;
  billingCycle: 'monthly' | 'yearly';
  onActivate?: (module: ModuleData) => void;
  onConfigure?: (module: ModuleData) => void;
  onViewDetails?: (module: ModuleData) => void;
}

const statusLabels: Record<ModuleStatus, string> = {
  active: 'Activ',
  inactive: 'Inactiv',
  trial: 'Trial',
  new: 'Nou',
};

const statusColors: Record<ModuleStatus, string> = {
  active: 'success',
  inactive: 'secondary',
  trial: 'warning',
  new: 'info',
};

export const ModuleCard = forwardRef<HTMLDivElement, ModuleCardProps>(
  (
    {
      module,
      billingCycle,
      onActivate,
      onConfigure,
      onViewDetails,
      className,
      ...props
    },
    ref
  ) => {
    const price = billingCycle === 'monthly' ? module.monthlyPrice : module.yearlyPrice;
    const priceLabel = billingCycle === 'monthly' ? '/luna' : '/an';
    const yearlyDiscount = Math.round((1 - module.yearlyPrice / (module.monthlyPrice * 12)) * 100);

    const handleAction = () => {
      if (module.status === 'active') {
        onConfigure?.(module);
      } else {
        onActivate?.(module);
      }
    };

    const getActionLabel = () => {
      switch (module.status) {
        case 'active':
          return 'Configureaza';
        case 'trial':
          return 'Upgrade';
        case 'inactive':
        case 'new':
        default:
          return 'Activeaza';
      }
    };

    const getActionIcon = () => {
      switch (module.status) {
        case 'active':
          return 'ti ti-settings';
        case 'trial':
          return 'ti ti-arrow-up';
        case 'inactive':
        case 'new':
        default:
          return 'ti ti-bolt';
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'card module-card h-100',
          {
            'module-card-active': module.status === 'active',
            'module-card-trial': module.status === 'trial',
          },
          className
        )}
        style={{
          transition: 'all 0.3s ease',
          border: module.status === 'active' ? '2px solid var(--bs-success)' : undefined,
        }}
        {...props}
      >
        {/* Popular/New Badge */}
        {(module.isPopular || module.isNew) && (
          <div
            className={clsx(
              'position-absolute top-0 end-0 badge m-2',
              module.isPopular ? 'bg-warning' : 'bg-info'
            )}
            style={{ zIndex: 1 }}
          >
            {module.isPopular ? 'Popular' : 'Nou'}
          </div>
        )}

        <div className="card-body d-flex flex-column">
          {/* Header: Icon + Name + Status */}
          <div className="d-flex align-items-start gap-3 mb-3">
            <div
              className="avatar avatar-lg rounded-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: module.status === 'active' ? 'rgba(var(--bs-success-rgb), 0.15)' : 'rgba(var(--bs-primary-rgb), 0.1)',
                color: module.status === 'active' ? 'var(--bs-success)' : 'var(--bs-primary)',
                width: '56px',
                height: '56px',
                flexShrink: 0,
              }}
            >
              <i className={`${module.icon} fs-xl`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="mb-1 text-truncate">{module.name}</h5>
              <span className={`badge badge-soft-${statusColors[module.status]}`}>
                {statusLabels[module.status]}
                {module.status === 'trial' && module.trialDaysLeft !== undefined && (
                  <span className="ms-1">({module.trialDaysLeft} zile)</span>
                )}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted mb-3" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
            {module.description}
          </p>

          {/* Price */}
          <div className="mb-3">
            <div className="d-flex align-items-baseline gap-1">
              <span className="fs-xl fw-bold text-dark">{price}</span>
              <span className="text-muted">RON</span>
              <span className="text-muted">{priceLabel}</span>
            </div>
            {billingCycle === 'yearly' && yearlyDiscount > 0 && (
              <small className="text-success">
                <i className="ti ti-discount-2 me-1"></i>
                Economisesti {yearlyDiscount}%
              </small>
            )}
          </div>

          {/* Features */}
          <ul className="list-unstyled mb-4 flex-grow-1">
            {module.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="d-flex align-items-start gap-2 mb-2">
                <i
                  className="ti ti-check text-success flex-shrink-0"
                  style={{ marginTop: '3px' }}
                ></i>
                <span style={{ fontSize: '0.875rem' }}>{feature}</span>
              </li>
            ))}
            {module.features.length > 4 && (
              <li className="text-muted" style={{ fontSize: '0.875rem' }}>
                <i className="ti ti-plus me-1"></i>
                {module.features.length - 4} functii adaugatoare
              </li>
            )}
          </ul>

          {/* Actions */}
          <div className="d-flex gap-2 mt-auto">
            <button
              type="button"
              className={clsx(
                'btn flex-1',
                module.status === 'active' ? 'btn-outline-primary' : 'btn-primary'
              )}
              onClick={handleAction}
            >
              <i className={`${getActionIcon()} me-1`}></i>
              {getActionLabel()}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => onViewDetails?.(module)}
              title="Vezi detalii"
            >
              <i className="ti ti-info-circle"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ModuleCard.displayName = 'ModuleCard';

export default ModuleCard;
