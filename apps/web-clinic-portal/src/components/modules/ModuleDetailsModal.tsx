/**
 * ModuleDetailsModal Component
 *
 * Full-screen modal for displaying complete module information.
 * Features:
 * - Full module description
 * - All features listed
 * - Screenshots/preview placeholder
 * - Pricing tiers
 * - Activation flow
 * - Terms acceptance
 */

import { useState } from 'react';
import { Modal } from '../ui-new/Modal';
import { Button } from '../ui-new/Button';
import type { ModuleData } from './ModuleCard';
import clsx from 'clsx';

export interface ModuleDetailsModalProps {
  module: ModuleData | null;
  open: boolean;
  onClose: () => void;
  onActivate: (module: ModuleData, acceptTerms: boolean) => void;
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
}

export function ModuleDetailsModal({
  module,
  open,
  onClose,
  onActivate,
  billingCycle,
  onBillingCycleChange,
}: ModuleDetailsModalProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'pricing' | 'reviews'>('features');

  if (!module) return null;

  const price = billingCycle === 'monthly' ? module.monthlyPrice : module.yearlyPrice;
  const priceLabel = billingCycle === 'monthly' ? '/luna' : '/an';
  const yearlyDiscount = Math.round((1 - module.yearlyPrice / (module.monthlyPrice * 12)) * 100);
  const monthlyEquivalent = Math.round(module.yearlyPrice / 12);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onActivate(module, acceptTerms);
      onClose();
    } finally {
      setIsActivating(false);
    }
  };

  const isActive = module.status === 'active';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={module.name}
      icon={module.icon}
    >
      <div className="row g-4">
        {/* Left Column - Details */}
        <div className="col-lg-8">
          {/* Module Header */}
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <div
              className="avatar avatar-xl rounded-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)',
                color: 'var(--bs-primary)',
                width: '80px',
                height: '80px',
              }}
            >
              <i className={`${module.icon} fs-2xl`}></i>
            </div>
            <div>
              <h4 className="mb-1">{module.name}</h4>
              <p className="text-muted mb-0">{module.description}</p>
            </div>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                type="button"
                className={clsx('nav-link', { active: activeTab === 'features' })}
                onClick={() => setActiveTab('features')}
              >
                <i className="ti ti-list me-1"></i>
                Functionalitati
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={clsx('nav-link', { active: activeTab === 'pricing' })}
                onClick={() => setActiveTab('pricing')}
              >
                <i className="ti ti-currency-dollar me-1"></i>
                Preturi
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={clsx('nav-link', { active: activeTab === 'reviews' })}
                onClick={() => setActiveTab('reviews')}
              >
                <i className="ti ti-star me-1"></i>
                Recenzii
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="tab-pane fade show active">
                <h6 className="mb-3">Toate Functiile Incluse</h6>
                <div className="row g-3">
                  {module.features.map((feature, index) => (
                    <div key={index} className="col-md-6">
                      <div className="d-flex align-items-start gap-2 p-3 rounded-3 bg-light">
                        <i className="ti ti-check text-success fs-lg mt-1"></i>
                        <span>{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Screenshot Placeholder */}
                <div className="mt-4">
                  <h6 className="mb-3">Preview</h6>
                  <div
                    className="rounded-3 bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '200px' }}
                  >
                    <div className="text-center text-muted">
                      <i className="ti ti-photo fs-2xl mb-2 d-block"></i>
                      <span>Capturi de ecran disponibile in curand</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="tab-pane fade show active">
                <h6 className="mb-3">Optiuni de Pret</h6>
                <div className="row g-3">
                  {/* Monthly */}
                  <div className="col-md-6">
                    <div
                      className={clsx(
                        'card h-100 border-2 cursor-pointer',
                        billingCycle === 'monthly' ? 'border-primary' : 'border'
                      )}
                      onClick={() => onBillingCycleChange('monthly')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center">
                        <div className="form-check d-inline-block mb-3">
                          <input
                            type="radio"
                            className="form-check-input"
                            checked={billingCycle === 'monthly'}
                            onChange={() => onBillingCycleChange('monthly')}
                          />
                        </div>
                        <h5 className="mb-1">Lunar</h5>
                        <div className="fs-xl fw-bold text-primary mb-2">
                          {module.monthlyPrice} RON
                          <span className="fs-sm fw-normal text-muted">/luna</span>
                        </div>
                        <p className="text-muted small mb-0">Facturat lunar</p>
                      </div>
                    </div>
                  </div>

                  {/* Yearly */}
                  <div className="col-md-6">
                    <div
                      className={clsx(
                        'card h-100 border-2 cursor-pointer position-relative',
                        billingCycle === 'yearly' ? 'border-primary' : 'border'
                      )}
                      onClick={() => onBillingCycleChange('yearly')}
                      style={{ cursor: 'pointer' }}
                    >
                      {yearlyDiscount > 0 && (
                        <div className="position-absolute top-0 end-0 badge bg-success m-2">
                          -{yearlyDiscount}%
                        </div>
                      )}
                      <div className="card-body text-center">
                        <div className="form-check d-inline-block mb-3">
                          <input
                            type="radio"
                            className="form-check-input"
                            checked={billingCycle === 'yearly'}
                            onChange={() => onBillingCycleChange('yearly')}
                          />
                        </div>
                        <h5 className="mb-1">Anual</h5>
                        <div className="fs-xl fw-bold text-primary mb-2">
                          {module.yearlyPrice} RON
                          <span className="fs-sm fw-normal text-muted">/an</span>
                        </div>
                        <p className="text-muted small mb-0">
                          Echivalent {monthlyEquivalent} RON/luna
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison */}
                <div className="mt-4 p-3 bg-light rounded-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="ti ti-info-circle text-primary"></i>
                    <strong>Economii cu planul anual</strong>
                  </div>
                  <p className="mb-0 text-muted">
                    Alegand planul anual economisesti{' '}
                    <strong className="text-success">
                      {module.monthlyPrice * 12 - module.yearlyPrice} RON
                    </strong>{' '}
                    pe an fata de planul lunar.
                  </p>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="tab-pane fade show active">
                <div className="text-center py-5">
                  <i className="ti ti-star fs-2xl text-muted mb-3 d-block"></i>
                  <h6>Fii primul care lasa o recenzie!</h6>
                  <p className="text-muted mb-0">
                    Recenziile vor fi disponibile dupa ce modulul va fi folosit de clienti.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activation */}
        <div className="col-lg-4">
          <div className="card bg-light border-0 sticky-top" style={{ top: '1rem' }}>
            <div className="card-body">
              <h6 className="mb-3">Sumar Comanda</h6>

              {/* Price Summary */}
              <div className="d-flex justify-content-between mb-2">
                <span>{module.name}</span>
                <span>{price} RON</span>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>Ciclu facturare</span>
                <span>{billingCycle === 'monthly' ? 'Lunar' : 'Anual'}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between fw-bold mb-4">
                <span>Total{priceLabel}</span>
                <span className="text-primary fs-lg">{price} RON</span>
              </div>

              {/* Terms */}
              {!isActive && (
                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="acceptTerms">
                    Accept{' '}
                    <a href="#" className="text-primary">
                      termenii si conditiile
                    </a>{' '}
                    de utilizare a modulului.
                  </label>
                </div>
              )}

              {/* Action Button */}
              {isActive ? (
                <div className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2 text-success mb-3">
                    <i className="ti ti-circle-check fs-lg"></i>
                    <span className="fw-medium">Modul Activ</span>
                  </div>
                  <Button variant="outline-primary" block onClick={onClose}>
                    <i className="ti ti-settings me-1"></i>
                    Configureaza
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  block
                  disabled={!acceptTerms}
                  loading={isActivating}
                  onClick={handleActivate}
                >
                  <i className="ti ti-bolt me-1"></i>
                  Activeaza Acum
                </Button>
              )}

              {/* Trust Indicators */}
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                  <i className="ti ti-shield-check text-success"></i>
                  <span>Plata securizata SSL</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                  <i className="ti ti-refresh text-primary"></i>
                  <span>Anulare oricand</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <i className="ti ti-headset text-info"></i>
                  <span>Suport tehnic inclus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModuleDetailsModal;
