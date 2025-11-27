/**
 * Today Overview Header Component
 *
 * Displays today's date, total appointments, and key metrics.
 */

import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { ReceptionStats } from '../../hooks/useReceptionQueue';

interface TodayOverviewHeaderProps {
  stats: ReceptionStats;
}

export function TodayOverviewHeader({ stats }: TodayOverviewHeaderProps) {
  const today = new Date();

  return (
    <div className="row g-3 mb-4">
      {/* Current Date & Time */}
      <div className="col-12">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h4 className="fw-bold mb-1">Receptie - Sala de Asteptare</h4>
            <p className="text-muted mb-0">
              <i className="ti ti-calendar me-2"></i>
              {format(today, 'EEEE, dd MMMM yyyy', { locale: ro })}
              <span className="mx-2">|</span>
              <i className="ti ti-clock me-2"></i>
              {format(today, 'HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm bg-primary-gradient">
          <div className="card-body py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-white-50 mb-1 small">Total Azi</p>
                <h2 className="mb-0 fw-bold text-white">{stats.total}</h2>
              </div>
              <div className="avatar avatar-lg bg-white-transparent rounded-circle">
                <i className="ti ti-calendar-event fs-24 text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm bg-warning-gradient">
          <div className="card-body py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-white-50 mb-1 small">In Asteptare</p>
                <h2 className="mb-0 fw-bold text-white">{stats.waiting}</h2>
              </div>
              <div className="avatar avatar-lg bg-white-transparent rounded-circle">
                <i className="ti ti-users fs-24 text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm bg-info-gradient">
          <div className="card-body py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-white-50 mb-1 small">In Tratament</p>
                <h2 className="mb-0 fw-bold text-white">{stats.inProgress}</h2>
              </div>
              <div className="avatar avatar-lg bg-white-transparent rounded-circle">
                <i className="ti ti-stethoscope fs-24 text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card border-0 shadow-sm bg-success-gradient">
          <div className="card-body py-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-white-50 mb-1 small">Timp Mediu Asteptare</p>
                <h2 className="mb-0 fw-bold text-white">
                  {stats.averageWaitTime}
                  <span className="fs-16 ms-1">min</span>
                </h2>
              </div>
              <div className="avatar avatar-lg bg-white-transparent rounded-circle">
                <i className="ti ti-clock fs-24 text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
