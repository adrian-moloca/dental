/**
 * Patient Appointments List
 * List of all appointments for a patient with tabs (Upcoming, Past, Cancelled)
 */

import { useState, useMemo } from 'react';
import { format, isFuture } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useAppointments } from '../../hooks/useAppointments';
import { AppointmentStatusBadge } from '../appointments/AppointmentStatusBadge';
import { RescheduleModal } from '../appointments/RescheduleModal';
import { CancelModal } from '../appointments/CancelModal';
import { Button } from '../ui/Button';
import type { AppointmentDto } from '../../types/appointment.types';

interface PatientAppointmentsListProps {
  patientId: string;
}

type TabType = 'upcoming' | 'past' | 'cancelled';

export function PatientAppointmentsList({ patientId }: PatientAppointmentsListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data, isLoading, refetch } = useAppointments({ patientId });

  const { upcomingAppointments, pastAppointments, cancelledAppointments } = useMemo(() => {
    if (!data?.data) {
      return { upcomingAppointments: [], pastAppointments: [], cancelledAppointments: [] };
    }

    const upcoming: AppointmentDto[] = [];
    const past: AppointmentDto[] = [];
    const cancelled: AppointmentDto[] = [];

    data.data.forEach((apt) => {
      const aptDate = new Date(apt.start);

      if (apt.status === 'cancelled') {
        cancelled.push(apt);
      } else if (isFuture(aptDate)) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    });

    // Sort by date
    upcoming.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    past.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    cancelled.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    return { upcomingAppointments: upcoming, pastAppointments: past, cancelledAppointments: cancelled };
  }, [data]);

  const handleReschedule = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancel = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const renderAppointmentCard = (appointment: AppointmentDto) => {
    const appointmentDate = new Date(appointment.start);
    const canReschedule = activeTab === 'upcoming';
    const canCancel = activeTab === 'upcoming';

    return (
      <div
        key={appointment.id}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)]/30 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-[var(--text)]">
                {format(appointmentDate, 'EEEE, dd MMMM yyyy', { locale: ro })}
              </h4>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              {format(appointmentDate, 'HH:mm')} • {appointment.appointmentType?.name || 'Consultatie'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Medic</div>
            <div className="text-sm font-medium text-[var(--text)]">{appointment.providerName || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Status</div>
            <div className="text-sm font-medium text-[var(--text)] capitalize">{appointment.status}</div>
          </div>
        </div>

        {appointment.notes && (
          <div className="mb-3 p-2 bg-[var(--surface-hover)] rounded text-sm text-[var(--text-secondary)]">
            {appointment.notes}
          </div>
        )}

        {/* Actions */}
        {(canReschedule || canCancel) && (
          <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
            {canReschedule && (
              <Button variant="ghost" size="sm" onClick={() => handleReschedule(appointment)}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                Reprogrameaza
              </Button>
            )}
            {canCancel && (
              <Button variant="ghost" size="sm" onClick={() => handleCancel(appointment)}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Anuleaza
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    let appointments: AppointmentDto[];
    switch (activeTab) {
      case 'upcoming':
        appointments = upcomingAppointments;
        break;
      case 'past':
        appointments = pastAppointments;
        break;
      case 'cancelled':
        appointments = cancelledAppointments;
        break;
    }

    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--surface-hover)] animate-pulse rounded-lg" />
          ))}
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-[var(--text-tertiary)] opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
            {activeTab === 'upcoming' && 'Nicio programare viitoare'}
            {activeTab === 'past' && 'Nicio programare trecuta'}
            {activeTab === 'cancelled' && 'Nicio programare anulata'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">Nu exista programari in aceasta categorie</p>
        </div>
      );
    }

    return <div className="space-y-3">{appointments.map(renderAppointmentCard)}</div>;
  };

  return (
    <>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        {/* Tabs header */}
        <div className="flex border-b border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`
              flex-1 px-4 py-3 text-sm font-semibold transition-colors relative
              ${
                activeTab === 'upcoming'
                  ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
              }
            `}
          >
            <span>Viitoare</span>
            {upcomingAppointments.length > 0 && (
              <span
                className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${activeTab === 'upcoming' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)]'}
              `}
              >
                {upcomingAppointments.length}
              </span>
            )}
            {activeTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`
              flex-1 px-4 py-3 text-sm font-semibold transition-colors relative
              ${
                activeTab === 'past'
                  ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
              }
            `}
          >
            <span>Trecute</span>
            {pastAppointments.length > 0 && (
              <span
                className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${activeTab === 'past' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)]'}
              `}
              >
                {pastAppointments.length}
              </span>
            )}
            {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`
              flex-1 px-4 py-3 text-sm font-semibold transition-colors relative
              ${
                activeTab === 'cancelled'
                  ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
              }
            `}
          >
            <span>Anulate</span>
            {cancelledAppointments.length > 0 && (
              <span
                className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${activeTab === 'cancelled' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)]'}
              `}
              >
                {cancelledAppointments.length}
              </span>
            )}
            {activeTab === 'cancelled' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="p-4">{renderTabContent()}</div>
      </div>

      {/* Modals */}
      <RescheduleModal
        open={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        appointment={selectedAppointment}
        onSuccess={() => {
          refetch();
          setSelectedAppointment(null);
        }}
      />

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        appointment={selectedAppointment}
        onSuccess={() => {
          refetch();
          setSelectedAppointment(null);
        }}
      />
    </>
  );
}
