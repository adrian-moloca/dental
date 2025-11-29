/**
 * Hook for fetching appointment types
 */

import { useQuery } from '@tanstack/react-query';
import { schedulingClient } from '../api/schedulingClient';

export function useAppointmentTypes() {
  return useQuery({
    queryKey: ['appointment-types'],
    queryFn: () => schedulingClient.getAppointmentTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes (appointment types rarely change)
  });
}
