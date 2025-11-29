/**
 * Tooth History React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { toothHistoryClient } from '../api/toothHistoryClient';

/**
 * Hook for fetching tooth history
 */
export function useToothHistory(patientId: string, toothNumber: string) {
  return useQuery({
    queryKey: ['tooth-history', patientId, toothNumber],
    queryFn: () => toothHistoryClient.getToothHistory(patientId, toothNumber),
    enabled: !!patientId && !!toothNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching odontogram history
 */
export function useOdontogramHistory(patientId: string) {
  return useQuery({
    queryKey: ['odontogram-history', patientId],
    queryFn: () => toothHistoryClient.getOdontogramHistory(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching odontogram snapshot at specific date
 */
export function useOdontogramSnapshot(patientId: string, date: string) {
  return useQuery({
    queryKey: ['odontogram-snapshot', patientId, date],
    queryFn: () => toothHistoryClient.getOdontogramSnapshot(patientId, date),
    enabled: !!patientId && !!date,
    staleTime: 10 * 60 * 1000, // 10 minutes (historical data doesn't change)
  });
}

/**
 * Hook for comparing odontogram between dates
 */
export function useOdontogramComparison(
  patientId: string,
  dateFrom: string,
  dateTo: string
) {
  return useQuery({
    queryKey: ['odontogram-comparison', patientId, dateFrom, dateTo],
    queryFn: () => toothHistoryClient.compareOdontogram(patientId, dateFrom, dateTo),
    enabled: !!patientId && !!dateFrom && !!dateTo,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
