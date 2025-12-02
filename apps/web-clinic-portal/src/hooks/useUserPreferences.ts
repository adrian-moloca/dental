/**
 * useUserPreferences Hook
 *
 * Fetches and manages user preferences with auto-save functionality.
 * Uses React Query for caching and background synchronization.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { preferencesClient } from '../api/preferencesClient';
import type { UserPreferences, DashboardPreferences } from '../api/preferencesClient';
import toast from 'react-hot-toast';

const PREFERENCES_QUERY_KEY = ['user', 'preferences'];
const DEBOUNCE_DELAY = 1000; // 1 second debounce for auto-save

export function useUserPreferences() {
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch preferences
  const {
    data: preferencesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: () => preferencesClient.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) =>
      preferencesClient.updatePreferences(preferences),
    onMutate: async (newPreferences) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: PREFERENCES_QUERY_KEY });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData(PREFERENCES_QUERY_KEY);

      // Optimistically update
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          preferences: {
            ...old.preferences,
            ...newPreferences,
          },
        };
      });

      return { previousPreferences };
    },
    onError: (err, _newPreferences, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(PREFERENCES_QUERY_KEY, context.previousPreferences);
      }
      toast.error('Nu s-au putut salva preferintele');
      console.error('Failed to save preferences:', err);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
    },
  });

  // Reset preferences mutation
  const resetMutation = useMutation({
    mutationFn: () => preferencesClient.resetPreferences(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
      toast.success('Preferintele au fost resetate');
    },
    onError: (err) => {
      toast.error('Nu s-au putut reseta preferintele');
      console.error('Failed to reset preferences:', err);
    },
  });

  /**
   * Update preferences with debouncing for auto-save
   */
  const updatePreferences = useCallback(
    (preferences: Partial<UserPreferences>, options?: { immediate?: boolean }) => {
      const immediate = options?.immediate ?? false;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (immediate) {
        updateMutation.mutate(preferences);
      } else {
        // Debounce the save
        saveTimeoutRef.current = setTimeout(() => {
          updateMutation.mutate(preferences);
        }, DEBOUNCE_DELAY);
      }
    },
    [updateMutation]
  );

  /**
   * Update dashboard preferences specifically
   */
  const updateDashboardPreferences = useCallback(
    (dashboardPreferences: Partial<DashboardPreferences>, options?: { immediate?: boolean }) => {
      updatePreferences(
        {
          dashboard: {
            ...preferencesData?.preferences?.dashboard,
            ...dashboardPreferences,
          },
        },
        options
      );
    },
    [updatePreferences, preferencesData?.preferences?.dashboard]
  );

  /**
   * Reset preferences to default
   */
  const resetPreferences = useCallback(() => {
    resetMutation.mutate();
  }, [resetMutation]);

  return {
    preferences: preferencesData?.preferences || {},
    dashboardPreferences: preferencesData?.preferences?.dashboard || {},
    isLoading,
    isError,
    error,
    updatePreferences,
    updateDashboardPreferences,
    resetPreferences,
    isSaving: updateMutation.isPending,
    isResetting: resetMutation.isPending,
  };
}
