/**
 * QuickStats Widget
 *
 * Displays key metrics: patient count, appointments today, and revenue.
 */

import { useTotalPatientsCount, useTodaysAppointments } from '../../../../hooks/useDashboardStats';
import { WidgetWrapper } from './WidgetWrapper';

interface QuickStatsWidgetProps {
  editMode?: boolean;
}

export function QuickStatsWidget({ editMode = false }: QuickStatsWidgetProps) {
  const { data: patientsCount, isLoading: patientsLoading } = useTotalPatientsCount();
  const { data: todayAppointments, isLoading: appointmentsLoading } = useTodaysAppointments();

  const isLoading = patientsLoading || appointmentsLoading;

  return (
    <WidgetWrapper
      id="quickStats"
      title="Statistici Rapide"
      icon="ti ti-chart-bar"
      isLoading={isLoading}
      editMode={editMode}
    >
      <div className="row g-3">
        <div className="col-md-4">
          <div className="stats-item text-center p-3 bg-primary-transparent rounded-2">
            <div className="stats-icon mb-2">
              <i className="ti ti-users fs-32 text-primary"></i>
            </div>
            <h3 className="mb-1 fw-bold text-primary">{patientsCount || 0}</h3>
            <p className="text-muted mb-0 small">Total Pacienti</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stats-item text-center p-3 bg-success-transparent rounded-2">
            <div className="stats-icon mb-2">
              <i className="ti ti-calendar-event fs-32 text-success"></i>
            </div>
            <h3 className="mb-1 fw-bold text-success">{todayAppointments?.total || 0}</h3>
            <p className="text-muted mb-0 small">Programari Astazi</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stats-item text-center p-3 bg-info-transparent rounded-2">
            <div className="stats-icon mb-2">
              <i className="ti ti-check-circle fs-32 text-info"></i>
            </div>
            <h3 className="mb-1 fw-bold text-info">{todayAppointments?.completed || 0}</h3>
            <p className="text-muted mb-0 small">Finalizate</p>
          </div>
        </div>
      </div>

      <div className="row g-2 mt-2">
        <div className="col-6">
          <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
            <i className="ti ti-clock text-warning fs-20"></i>
            <div className="flex-grow-1">
              <small className="text-muted d-block">In Asteptare</small>
              <strong>{todayAppointments?.pending || 0}</strong>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
            <i className="ti ti-player-play text-primary fs-20"></i>
            <div className="flex-grow-1">
              <small className="text-muted d-block">In Curs</small>
              <strong>{todayAppointments?.inProgress || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

export default QuickStatsWidget;
