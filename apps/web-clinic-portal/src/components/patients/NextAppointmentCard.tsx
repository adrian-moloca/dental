/**
 * Next Appointment Card
 * Shows patient's next appointment with quick actions
 */

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { AppointmentDto } from '../../types/appointment.types';
import { RescheduleModal } from '../appointments/RescheduleModal';
import { CancelModal } from '../appointments/CancelModal';
import { Button } from '../ui/Button';

interface NextAppointmentCardProps {
  appointment: AppointmentDto | null;
  onRefresh?: () => void;
}

export function NextAppointmentCard({ appointment, onRefresh }: NextAppointmentCardProps) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!appointment) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="text-center py-8">
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
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Nicio programare viitoare</h3>
          <p className="text-sm text-[var(--text-secondary)]">Pacientul nu are programari viitoare</p>
        </div>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.start);
  const providerName = appointment.providerName || `${appointment.provider?.firstName} ${appointment.provider?.lastName}`;

  const handleDownloadICS = () => {
    // Generate ICS file for calendar
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DentalOS//Appointment//EN
BEGIN:VEVENT
UID:${appointment.id}
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}
DTSTART:${format(appointmentDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(new Date(appointment.end), "yyyyMMdd'T'HHmmss")}
SUMMARY:Programare Dentara - ${appointment.appointmentType?.name || 'Consultatie'}
DESCRIPTION:Programare cu ${providerName}
LOCATION:Clinica Dentara
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `programare-${appointment.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-1">Urmatoarea Programare</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {formatDistanceToNow(appointmentDate, { addSuffix: true, locale: ro })}
            </p>
          </div>
          <div
            className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${
              appointment.status === 'confirmed'
                ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/30'
            }
          `}
          >
            {appointment.status === 'confirmed' ? 'Confirmata' : 'Neconfirmata'}
          </div>
        </div>

        {/* Main info */}
        <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-[var(--text)] mb-1">
                {format(appointmentDate, 'HH:mm')}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {format(appointmentDate, 'EEEE, dd MMMM yyyy', { locale: ro })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Medic</div>
              <div className="text-sm font-medium text-[var(--text)]">{providerName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Tip</div>
              <div className="text-sm font-medium text-[var(--text)]">
                {appointment.appointmentType?.name || 'Consultatie'}
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">Note</div>
              <div className="text-sm text-[var(--text)]">{appointment.notes}</div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--text-tertiary)] mb-2">Actiuni Rapide</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setShowRescheduleModal(true)}
              className="justify-start"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Reprogrameaza
            </Button>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setShowCancelModal(true)}
              className="justify-start"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Anuleaza
            </Button>

            <Button variant="ghost" size="sm" fullWidth className="justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Trimite Reminder
            </Button>

            <Button variant="ghost" size="sm" fullWidth onClick={handleDownloadICS} className="justify-start">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Descarca ICS
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RescheduleModal
        open={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        appointment={appointment}
        onSuccess={onRefresh}
      />

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        appointment={appointment}
        onSuccess={onRefresh}
      />
    </>
  );
}
