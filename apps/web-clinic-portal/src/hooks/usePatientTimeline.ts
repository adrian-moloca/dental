/**
 * Patient Timeline React Query Hooks
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { timelineClient, type TimelineFilters } from '../api/timelineClient';

/**
 * Hook for fetching patient timeline with infinite scroll
 */
export function usePatientTimeline(patientId: string, filters: TimelineFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['patient-timeline', patientId, filters],
    queryFn: ({ pageParam }) =>
      timelineClient.getTimeline(patientId, { ...filters, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { hasMore: boolean; nextCursor?: string }) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching timeline statistics
 */
export function useTimelineStats(patientId: string) {
  return useQuery({
    queryKey: ['patient-timeline-stats', patientId],
    queryFn: () => timelineClient.getTimelineStats(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
