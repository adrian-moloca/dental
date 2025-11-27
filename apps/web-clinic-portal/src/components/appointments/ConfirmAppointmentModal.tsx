import { useState } from 'react';
import { Modal } from '../overlay/Modal';
import { Button } from '../ui/Button';
import { ConfirmationMethodSelect } from './ConfirmationMethodSelect';
import { useConfirmAppointment } from '../../hooks/useAppointments';
import type { AppointmentDto, ConfirmationMethod } from '../../types/appointment.types';

interface ConfirmAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentDto | null;
  onSuccess?: () => void;
}

export function ConfirmAppointmentModal({
  open,
  onClose,
  appointment,
  onSuccess,
}: ConfirmAppointmentModalProps) {
  const [method, setMethod] = useState<ConfirmationMethod>('phone');
  const confirmMutation = useConfirmAppointment();

  const handleConfirm = async () => {
    if (!appointment) return;

    try {
      await confirmMutation.mutateAsync({
        id: appointment.id,
        method,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  if (!appointment) return null;

  return (
    <Modal open={open} onClose={onClose} title="Confirmare Programare">
      <div className="space-y-4">
        <div className="p-4 bg-surface-hover rounded-lg border border-white/10">
          <div className="text-sm text-foreground/60 mb-1">Pacient</div>
          <div className="text-foreground font-semibold">Pacient #{appointment.patientId}</div>
          <div className="text-sm text-foreground/60 mt-2">Data si Ora</div>
          <div className="text-foreground">
            {new Date(appointment.start).toLocaleString('ro-RO', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        </div>

        <ConfirmationMethodSelect
          value={method}
          onChange={setMethod}
          disabled={confirmMutation.isPending}
        />

        {confirmMutation.isError && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            role="alert"
          >
            Eroare la confirmarea programarii. Va rugam incercati din nou.
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} disabled={confirmMutation.isPending}>
            Anuleaza
          </Button>
          <Button onClick={handleConfirm} loading={confirmMutation.isPending}>
            Confirma Programarea
          </Button>
        </div>
      </div>
    </Modal>
  );
}
