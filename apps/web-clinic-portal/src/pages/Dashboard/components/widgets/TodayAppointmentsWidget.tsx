/**
 * TodayAppointments Widget
 *
 * Shows today's appointments with status badges and quick actions.
 */

import { useAppointments } from '../../../../hooks/useAppointments';
import { WidgetWrapper } from './WidgetWrapper';
import { Badge } from '../../../../components/ui-new';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface TodayAppointmentsWidgetProps {
  editMode?: boolean;
}

const STATUS_CONFIG = {
  pending: { label: 'In Asteptare', color: 'warning' },
  confirmed: { label: 'Confirmat', color: 'info' },
  checked_in: { label: 'Check-in', color: 'primary' },
  in_progress: { label: 'In Curs', color: 'primary' },
  completed: { label: 'Finalizat', color: 'success' },
  cancelled: { label: 'Anulat', color: 'danger' },
  no_show: { label: 'Absent', color: 'danger' },
};

export function TodayAppointmentsWidget({ editMode = false }: TodayAppointmentsWidgetProps) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const { data, isLoading, isError } = useAppointments({
    startDate: startOfDay as any,
    endDate: endOfDay as any,
  });

  const appointments = data?.data || [];
  const isEmpty = appointments.length === 0;

  return (
    <WidgetWrapper
      id="todayAppointments"
      title="Programari Astazi"
      icon="ti ti-calendar-event"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      emptyMessage="Nu exista programari astazi"
      editMode={editMode}
      actions={
        <Link to="/appointments" className="btn btn-sm btn-light">
          <i className="ti ti-eye me-1"></i>
          Vezi Tot
        </Link>
      }
    >
      <div className="list-group list-group-flush">
        {appointments.slice(0, 8).map((appointment) => {
          const status = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] || {
            label: appointment.status,
            color: 'secondary',
          };

          return (
            <Link
              key={appointment.id}
              to={`/appointments/${appointment.id}`}
              className="list-group-item list-group-item-action border-0 py-3"
            >
              <div className="d-flex align-items-start">
                <div className="me-3 text-center" style={{ minWidth: 60 }}>
                  <div className="fw-bold fs-20 text-primary">
                    {format(new Date(appointment.startTime), 'HH:mm')}
                  </div>
                  <small className="text-muted">
                    {(() => {
                      const start = new Date(appointment.startTime || appointment.start);
                      const end = new Date(appointment.endTime || appointment.end);
                      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                      return duration || 30;
                    })()}min
                  </small>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h6 className="mb-0">{appointment.provider ? `${appointment.provider.firstName || ''} ${appointment.provider.lastName || ''}`.trim() || 'Pacient' : 'Pacient'}</h6>
                    <Badge variant={status.color as any}>{status.label}</Badge>
                  </div>
                  <div className="text-muted small">
                    <i className="ti ti-user-circle me-1"></i>
                    {appointment.provider ? `${appointment.provider.firstName || ''} ${appointment.provider.lastName || ''}`.trim() || 'Doctor' : 'Doctor'}
                  </div>
                  {appointment.notes && (
                    <div className="text-muted small mt-1">
                      <i className="ti ti-note me-1"></i>
                      {appointment.notes}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {appointments.length > 8 && (
        <div className="text-center border-top pt-3 mt-2">
          <Link to="/appointments" className="btn btn-sm btn-link text-decoration-none">
            Vezi toate cele {appointments.length} programari
            <i className="ti ti-arrow-right ms-1"></i>
          </Link>
        </div>
      )}
    </WidgetWrapper>
  );
}

export default TodayAppointmentsWidget;
