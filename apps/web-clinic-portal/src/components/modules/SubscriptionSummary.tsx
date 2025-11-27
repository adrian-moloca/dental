/**
 * SubscriptionSummary Component
 *
 * Displays the current subscription summary including:
 * - Current active modules
 * - Monthly/yearly cost
 * - Next billing date
 * - Upgrade/downgrade options
 */

import { Card, CardHeader, CardBody } from '../ui-new/Card';
import { Button } from '../ui-new/Button';
import type { ModuleData } from './ModuleCard';
import clsx from 'clsx';

export interface SubscriptionPlan {
  name: string;
  basePrice: number;
  includedModules: string[];
  maxUsers: number;
  maxPatients: number;
  storageGB: number;
}

export interface SubscriptionSummaryProps {
  currentPlan: SubscriptionPlan;
  activeModules: ModuleData[];
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  onViewInvoices?: () => void;
}

export function SubscriptionSummary({
  currentPlan,
  activeModules,
  billingCycle,
  nextBillingDate,
  onUpgrade,
  onManageBilling,
  onViewInvoices,
}: SubscriptionSummaryProps) {
  // Calculate total monthly cost
  const modulesTotalMonthly = activeModules.reduce(
    (sum, module) => sum + module.monthlyPrice,
    0
  );
  const modulesTotalYearly = activeModules.reduce(
    (sum, module) => sum + module.yearlyPrice,
    0
  );

  const planPrice = billingCycle === 'monthly'
    ? currentPlan.basePrice
    : currentPlan.basePrice * 10; // 2 months free for yearly

  const modulesTotal = billingCycle === 'monthly'
    ? modulesTotalMonthly
    : modulesTotalYearly;

  const totalCost = planPrice + modulesTotal;
  const priceLabel = billingCycle === 'monthly' ? '/luna' : '/an';

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const daysUntilBilling = Math.ceil(
    (nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="subscription-summary">
      <CardHeader
        title="Abonamentul Tau"
        icon="ti ti-credit-card"
        actions={
          <Button variant="outline-primary" size="sm" onClick={onManageBilling}>
            <i className="ti ti-settings me-1"></i>
            Gestioneaza
          </Button>
        }
      />
      <CardBody>
        <div className="row g-4">
          {/* Current Plan */}
          <div className="col-md-6 col-lg-3">
            <div className="p-3 rounded-3 bg-light h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="ti ti-package text-primary fs-lg"></i>
                <span className="text-muted small">Plan Curent</span>
              </div>
              <h5 className="mb-1">{currentPlan.name}</h5>
              <div className="d-flex align-items-baseline gap-1">
                <span className="fs-lg fw-bold text-primary">{planPrice}</span>
                <span className="text-muted small">RON{priceLabel}</span>
              </div>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 mt-2"
                onClick={onUpgrade}
              >
                <i className="ti ti-arrow-up me-1"></i>
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Active Modules Count */}
          <div className="col-md-6 col-lg-3">
            <div className="p-3 rounded-3 bg-light h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="ti ti-apps text-success fs-lg"></i>
                <span className="text-muted small">Module Active</span>
              </div>
              <h5 className="mb-1">{activeModules.length} Module</h5>
              <div className="d-flex align-items-baseline gap-1">
                <span className="fs-lg fw-bold text-success">+{modulesTotal}</span>
                <span className="text-muted small">RON{priceLabel}</span>
              </div>
              <div className="mt-2">
                <div className="d-flex flex-wrap gap-1">
                  {activeModules.slice(0, 3).map((module) => (
                    <span key={module.id} className="badge badge-soft-primary">
                      {module.name.split(' ')[0]}
                    </span>
                  ))}
                  {activeModules.length > 3 && (
                    <span className="badge badge-soft-secondary">
                      +{activeModules.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="col-md-6 col-lg-3">
            <div className="p-3 rounded-3 bg-primary text-white h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="ti ti-receipt fs-lg"></i>
                <span className="opacity-75 small">Cost Total</span>
              </div>
              <h4 className="mb-1">{totalCost} RON</h4>
              <span className="opacity-75 small">{priceLabel.slice(1)}</span>
              <div className="mt-2">
                <span className="badge bg-white text-primary">
                  {billingCycle === 'monthly' ? 'Lunar' : 'Anual'}
                </span>
              </div>
            </div>
          </div>

          {/* Next Billing */}
          <div className="col-md-6 col-lg-3">
            <div className="p-3 rounded-3 bg-light h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="ti ti-calendar-event text-warning fs-lg"></i>
                <span className="text-muted small">Urmatoarea Factura</span>
              </div>
              <h5 className="mb-1">{formatDate(nextBillingDate)}</h5>
              <span
                className={clsx(
                  'badge',
                  daysUntilBilling <= 7 ? 'badge-soft-warning' : 'badge-soft-info'
                )}
              >
                In {daysUntilBilling} zile
              </span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 mt-2 d-block"
                onClick={onViewInvoices}
              >
                <i className="ti ti-file-invoice me-1"></i>
                Vezi Facturile
              </button>
            </div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="mt-4 pt-4 border-top">
          <h6 className="mb-3">Ce include planul tau</h6>
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="ti ti-users text-primary"></i>
                <div>
                  <div className="fw-medium">{currentPlan.maxUsers} Utilizatori</div>
                  <small className="text-muted">inclusi in plan</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="ti ti-user-heart text-success"></i>
                <div>
                  <div className="fw-medium">
                    {currentPlan.maxPatients === -1 ? 'Nelimitat' : currentPlan.maxPatients} Pacienti
                  </div>
                  <small className="text-muted">capacitate maxima</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="ti ti-database text-info"></i>
                <div>
                  <div className="fw-medium">{currentPlan.storageGB} GB</div>
                  <small className="text-muted">stocare date</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="ti ti-apps text-warning"></i>
                <div>
                  <div className="fw-medium">{currentPlan.includedModules.length} Module</div>
                  <small className="text-muted">incluse gratuit</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Included Modules */}
        {currentPlan.includedModules.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Module Incluse in Plan</h6>
            <div className="d-flex flex-wrap gap-2">
              {currentPlan.includedModules.map((moduleName, index) => (
                <span key={index} className="badge badge-soft-success">
                  <i className="ti ti-check me-1"></i>
                  {moduleName}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default SubscriptionSummary;
