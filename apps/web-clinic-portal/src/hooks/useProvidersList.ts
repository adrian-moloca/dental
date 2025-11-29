/**
 * Hook for fetching providers list
 */

import { useQuery } from '@tanstack/react-query';
import { schedulingClient } from '../api/schedulingClient';

interface UseProvidersParams {
  clinicId?: string;
  enabled?: boolean;
}

export function useProviders(params?: UseProvidersParams) {
  return useQuery({
    queryKey: ['providers', params?.clinicId],
    queryFn: () => schedulingClient.getProviders({ clinicId: params?.clinicId }),
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes (providers rarely change)
  });
}
