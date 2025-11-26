/**
 * Appointment Quick Actions
 * Context-aware action buttons based on appointment status
 */

import { useState } from 'react';
import { Button } from '../ui/Button';
import {
  useCheckInAppointment,
  useStartAppointment,
  useCompleteAppointment,
  useNoShowAppointment,
} from '../../hooks/useAppointments';
import { useToast } from '../toast/ToastProvider';
import { CompleteAppointmentModal } from './CompleteAppointmentModal';
import type { AppointmentDto } from '../../types/appointment.types';
import type { SelectedProcedure } from './CompleteAppointmentModal';

interface AppointmentQuickActionsProps {
  appointment: AppointmentDto;
}

export function AppointmentQuickActions({ appointment }: AppointmentQuickActionsProps) {
  const toast = useToast();
  const checkIn = useCheckInAppointment();
  const start = useStartAppointment();
  const complete = useCompleteAppointment();
  const noShow = useNoShowAppointment();
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync(appointment.id);
      toast.push({
        message: `Patient ${appointment.patientId} checked in`,
        tone: 'success',
      });
    } catch (error) {
      toast.push({
        message: `Failed to check in: ${(error as Error).message}`,
        tone: 'error',
      });
    }
  };

  const handleStart = async () => {
    try {
      await start.mutateAsync(appointment.id);
      toast.push({
        message: `Appointment started`,
        tone: 'success',
      });
    } catch (error) {
      toast.push({
        message: `Failed to start: ${(error as Error).message}`,
        tone: 'error',
      });
    }
  };

  const handleCompleteWithProcedures = async (procedures: SelectedProcedure[]) => {
    try {
      const response = await complete.mutateAsync({
        id: appointment.id,
        procedures: procedures.map((p) => ({
          procedureId: p.procedureId,
          quantity: p.quantity,
          price: p.price,
          tooth: p.tooth,
          surfaces: p.surfaces,
        })),
      });

      toast.push({
        message: response.invoice
          ? `Appointment completed. Invoice ${response.invoice.invoiceNumber} generated.`
          : 'Appointment completed successfully',
        tone: 'success',
      });

      setShowCompleteModal(false);
    } catch (error) {
      toast.push({
        message: `Failed to complete: ${(error as Error).message}`,
        tone: 'error',
      });
      throw error;
    }
  };

  const handleNoShow = async () => {
    try {
      await noShow.mutateAsync(appointment.id);
      toast.push({
        message: `Marked as no-show`,
        tone: 'warning',
      });
    } catch (error) {
      toast.push({
        message: `Failed to mark no-show: ${(error as Error).message}`,
        tone: 'error',
      });
    }
  };

  const isLoading =
    checkIn.isPending || start.isPending || complete.isPending || noShow.isPending;

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return null;
  }

  if (appointment.status === 'pending' || appointment.status === 'confirmed') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleCheckIn}
          loading={checkIn.isPending}
          disabled={isLoading}
          fullWidth
        >
          Check In
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNoShow}
          loading={noShow.isPending}
          disabled={isLoading}
        >
          No Show
        </Button>
      </div>
    );
  }

  if (appointment.status === 'in_progress') {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCompleteModal(true)}
            disabled={isLoading}
            fullWidth
          >
            Complete
          </Button>
        </div>

        <CompleteAppointmentModal
          open={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          appointment={appointment}
          onComplete={handleCompleteWithProcedures}
          isLoading={complete.isPending}
        />
      </>
    );
  }

  if (appointment.status === 'no_show') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCheckIn}
          loading={checkIn.isPending}
          disabled={isLoading}
          fullWidth
        >
          Undo No Show
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={handleStart}
        loading={start.isPending}
        disabled={isLoading}
        fullWidth
      >
        Start
      </Button>
    </div>
  );
}
