/**
 * Reschedule Appointment Modal
 * Modal for rescheduling an existing appointment with calendar and time slot selection
 */

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Modal } from '../overlay/Modal';
import { Button } from '../ui/Button';
import { TimeSlotsGrid } from '../scheduling/TimeSlotsGrid';
import { useRescheduleAppointment } from '../../hooks/useRescheduleAppointment';
import type { AppointmentDto } from '../../types/appointment.types';
import type { TimeSlot } from '../../types/scheduling.types';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentDto | null;
  onSuccess?: () => void;
}

const RESCHEDULE_REASONS = [
  { value: 'patient_request', label: 'Solicitare pacient' },
  { value: 'provider_unavailable', label: 'Medic indisponibil' },
  { value: 'emergency', label: 'Urgenta' },
  { value: 'scheduling_error', label: 'Eroare de programare' },
  { value: 'other', label: 'Altul' },
];

export function RescheduleModal({ open, onClose, appointment, onSuccess }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('patient_request');
  const [notes, setNotes] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [keepSameProvider, setKeepSameProvider] = useState(true);

  const rescheduleMutation = useRescheduleAppointment();

  const duration = useMemo(() => {
    if (!appointment) return 30;
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }, [appointment]);

  const handleReschedule = async () => {
    if (!appointment || !selectedSlot) return;

    try {
      await rescheduleMutation.mutateAsync({
        id: appointment.id,
        newStart: selectedSlot.start,
        newEnd: selectedSlot.end,
        reason,
        notes: notes || undefined,
        providerId: keepSameProvider ? appointment.providerId : undefined,
        notifyPatient,
      });

      onSuccess?.();
      onClose();
    } catch (_error) {
      // Error handled by mutation
    }
  };

  if (!appointment) return null;

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Reprogrameaza Programarea">
      <div className="space-y-4">
        {/* Current appointment details */}
        <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Programare Curenta</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Data si Ora</div>
              <div className="text-sm font-medium text-[var(--text)]">
                {format(new Date(appointment.start), 'dd MMM yyyy, HH:mm')}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Medic</div>
              <div className="text-sm font-medium text-[var(--text)]">{appointment.providerName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Tip</div>
              <div className="text-sm font-medium text-[var(--text)]">
                {appointment.appointmentType?.name || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Durata</div>
              <div className="text-sm font-medium text-[var(--text)]">{duration} min</div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={keepSameProvider}
              onChange={(e) => setKeepSameProvider(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0"
            />
            <span className="text-sm text-[var(--text)]">Pastreaza acelasi medic</span>
          </label>

          <label className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={notifyPatient}
              onChange={(e) => setNotifyPatient(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0"
            />
            <span className="text-sm text-[var(--text)]">Notifica pacientul</span>
          </label>
        </div>

        {/* Reschedule reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-[var(--text)] mb-2">
            Motiv Reprogramare
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            {RESCHEDULE_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar and slots selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Selecteaza Data Noua</label>
            <input
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                setSelectedDate(e.target.value ? new Date(e.target.value) : null);
                setSelectedSlot(null); // Reset slot when date changes
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Selecteaza Ora</label>
            {selectedDate ? (
              <TimeSlotsGrid
                date={selectedDate}
                providerId={keepSameProvider ? appointment.providerId : ''}
                duration={duration}
                onSelect={setSelectedSlot}
                selected={selectedSlot || undefined}
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                <div className="text-center text-[var(--text-tertiary)]">
                  <svg
                    className="w-12 h-12 mx-auto mb-2 opacity-50"
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
                  <p className="text-sm">Selecteaza o data mai intai</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {reason === 'other' && (
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-[var(--text)] mb-2">
              Note Aditionale
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              placeholder="Detalii suplimentare..."
            />
          </div>
        )}

        {/* Selected slot summary */}
        {selectedSlot && (
          <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg p-3">
            <div className="text-sm font-semibold text-[var(--text)] mb-1">Programare Noua:</div>
            <div className="text-sm text-[var(--text-secondary)]">
              {format(selectedSlot.start, 'EEEE, dd MMMM yyyy')} la {format(selectedSlot.start, 'HH:mm')}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" onClick={onClose} disabled={rescheduleMutation.isPending}>
            Anuleaza
          </Button>
          <Button onClick={handleReschedule} loading={rescheduleMutation.isPending} disabled={!selectedSlot}>
            Reprogrameaza
          </Button>
        </div>
      </div>
    </Modal>
  );
}
