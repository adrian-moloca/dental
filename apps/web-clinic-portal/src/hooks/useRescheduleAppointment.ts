/**
 * Hook for rescheduling appointments
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { schedulingClient } from '../api/schedulingClient';

interface RescheduleParams {
  id: string;
  newStart: Date;
  newEnd: Date;
  reason: string;
  notes?: string;
  providerId?: string;
  notifyPatient?: boolean;
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: RescheduleParams) => schedulingClient.reschedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      toast.success('Programare reprogramata cu succes');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Eroare la reprogramarea programarii';
      toast.error(message);
    },
  });
}
