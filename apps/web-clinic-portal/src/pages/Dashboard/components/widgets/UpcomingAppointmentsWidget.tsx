/**
 * UpcomingAppointments Widget
 *
 * Calendar view of next 7 days appointments.
 */

import { useQuery } from '@tanstack/react-query';
import { schedulingClient } from '../../../../api/schedulingClient';
import { WidgetWrapper } from './WidgetWrapper';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';
import { ro } from 'date-fns/locale';

interface UpcomingAppointmentsWidgetProps {
  editMode?: boolean;
}

export function UpcomingAppointmentsWidget({ editMode = false }: UpcomingAppointmentsWidgetProps) {
  const startDate = startOfDay(new Date());
  const endDate = endOfDay(addDays(new Date(), 7));

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments', 'upcoming', startDate, endDate],
    queryFn: async () => {
      const response = await schedulingClient.list({
        startDate: startDate as any,
        endDate: endDate as any,
      });
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const appointments = data || [];

  // Group by date
  const appointmentsByDate = appointments.reduce(
    (acc, appointment) => {
      const date = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    },
    {} as Record<string, typeof appointments>
  );

  // Get next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const isEmpty = appointments.length === 0;

  return (
    <WidgetWrapper
      id="upcomingAppointments"
      title="Programari Viitoare"
      icon="ti ti-calendar"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      emptyMessage="Nu exista programari in urmatoarele 7 zile"
      editMode={editMode}
    >
      <div className="upcoming-calendar">
        {next7Days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayAppointments = appointmentsByDate[dateKey] || [];
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <div
              key={dateKey}
              className={`calendar-day mb-3 p-3 rounded-2 ${
                isToday ? 'bg-primary-transparent border border-primary' : 'bg-light'
              }`}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="fw-bold">
                    {format(day, 'EEEE', { locale: ro })}
                    {isToday && (
                      <span className="badge bg-primary text-white ms-2 small">Astazi</span>
                    )}
                  </div>
                  <small className="text-muted">{format(day, 'd MMMM yyyy', { locale: ro })}</small>
                </div>
                <div className="text-end">
                  <span className="badge bg-secondary">{dayAppointments.length}</span>
                </div>
              </div>

              {dayAppointments.length > 0 ? (
                <div className="appointments-list">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="d-flex align-items-center gap-2 py-1 small">
                      <span className="text-primary fw-medium" style={{ minWidth: 45 }}>
                        {format(new Date(apt.startTime), 'HH:mm')}
                      </span>
                      <span className="text-truncate">{apt.provider ? `${apt.provider.firstName || ''} ${apt.provider.lastName || ''}`.trim() || 'Pacient' : 'Pacient'}</span>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-muted small mt-1">
                      + {dayAppointments.length - 3} mai multe
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted small">Fara programari</div>
              )}
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

export default UpcomingAppointmentsWidget;
