/**
 * Hook for fetching available appointment slots
 */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { schedulingClient } from '../api/schedulingClient';

interface UseAvailableSlotsParams {
  providerId: string;
  date: Date;
  duration: number;
  appointmentTypeId?: string;
  enabled?: boolean;
}

export function useAvailableSlots({
  providerId,
  date,
  duration,
  appointmentTypeId,
  enabled = true,
}: UseAvailableSlotsParams) {
  return useQuery({
    queryKey: ['available-slots', providerId, format(date, 'yyyy-MM-dd'), duration, appointmentTypeId],
    queryFn: () =>
      schedulingClient.getAvailableSlots({
        providerId,
        date: format(date, 'yyyy-MM-dd'),
        duration,
        appointmentTypeId,
      }),
    enabled: enabled && !!providerId && !!date && !!duration,
    staleTime: 1 * 60 * 1000, // 1 minute (slots change frequently)
  });
}
