/**
 * Cancel Appointment Modal
 * Modal for canceling an appointment with Romanian cancellation reasons
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '../overlay/Modal';
import { Button } from '../ui/Button';
import { useCancelAppointment } from '../../hooks/useAppointments';
import type { AppointmentDto } from '../../types/appointment.types';
import type { CancellationReason, CancellationReasonOption } from '../../types/scheduling.types';

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentDto | null;
  onSuccess?: () => void;
}

const CANCELLATION_REASONS: CancellationReasonOption[] = [
  {
    value: 'patient_request',
    label: 'Pacient - solicitare personala',
    requiresNotes: false,
  },
  {
    value: 'patient_illness',
    label: 'Pacient - boala',
    requiresNotes: false,
  },
  {
    value: 'patient_no_show',
    label: 'Pacient - neprezentare',
    requiresNotes: false,
  },
  {
    value: 'clinic_provider_unavailable',
    label: 'Clinica - indisponibilitate medic',
    requiresNotes: false,
  },
  {
    value: 'clinic_emergency',
    label: 'Clinica - urgenta',
    requiresNotes: false,
  },
  {
    value: 'other',
    label: 'Altul',
    requiresNotes: true,
  },
];

export function CancelModal({ open, onClose, appointment, onSuccess }: CancelModalProps) {
  const [reason, setReason] = useState<CancellationReason>('patient_request');
  const [notes, setNotes] = useState('');
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [offerReschedule, setOfferReschedule] = useState(false);

  const cancelMutation = useCancelAppointment();

  const selectedReason = CANCELLATION_REASONS.find((r) => r.value === reason);
  const requiresNotes = selectedReason?.requiresNotes || false;

  const handleCancel = async () => {
    if (!appointment) return;

    if (requiresNotes && !notes.trim()) {
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        id: appointment.id,
        data: {
          reason: selectedReason?.label || reason,
          cancelledBy: 'staff', // TODO: Get from auth context
        },
      });

      onSuccess?.();
      onClose();

      // TODO: If offerReschedule is true, open RescheduleModal
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const resetState = () => {
    setReason('patient_request');
    setNotes('');
    setNotifyPatient(true);
    setOfferReschedule(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!appointment) return null;

  return (
    <Modal open={open} onClose={handleClose} size="md" title="Anuleaza Programarea">
      <div className="space-y-4">
        {/* Appointment summary */}
        <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Detalii Programare</h4>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Pacient</div>
              <div className="text-sm font-medium text-[var(--text)]">Pacient #{appointment.patientId}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Data si Ora</div>
              <div className="text-sm font-medium text-[var(--text)]">
                {format(new Date(appointment.start), 'EEEE, dd MMMM yyyy, HH:mm')}
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
          </div>
        </div>

        {/* Cancellation reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-[var(--text)] mb-2">
            Motiv Anulare <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as CancellationReason)}
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          >
            {CANCELLATION_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-[var(--text)] mb-2">
            Note Aditionale {requiresNotes && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            required={requiresNotes}
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            placeholder={requiresNotes ? 'Detalii obligatorii...' : 'Detalii optionale...'}
          />
          {requiresNotes && !notes.trim() && (
            <p className="mt-1 text-xs text-red-500">Notele sunt obligatorii pentru acest motiv</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={notifyPatient}
              onChange={(e) => setNotifyPatient(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0"
            />
            <span className="text-sm text-[var(--text)]">Notifica pacientul despre anulare</span>
          </label>

          <label className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
            <input
              type="checkbox"
              checked={offerReschedule}
              onChange={(e) => setOfferReschedule(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0"
            />
            <span className="text-sm text-[var(--text)]">Ofera reprogramare dupa anulare</span>
          </label>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-yellow-600">
              <p className="font-semibold mb-1">Politica de anulare</p>
              <p className="text-yellow-700">
                Anularile cu mai putin de 24 ore inainte pot fi supuse taxelor de anulare conform politicii
                clinicii.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" onClick={handleClose} disabled={cancelMutation.isPending}>
            Inapoi
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            loading={cancelMutation.isPending}
            disabled={requiresNotes && !notes.trim()}
          >
            Confirma Anularea
          </Button>
        </div>
      </div>
    </Modal>
  );
}
