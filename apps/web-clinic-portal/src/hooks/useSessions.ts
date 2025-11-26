/**
 * Session Management Hook
 *
 * Provides React Query hooks for managing user sessions
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '../api/authClient';
import toast from 'react-hot-toast';
import type { SessionDto } from '../types/auth.types';

const SESSIONS_QUERY_KEY = ['sessions'];

/**
 * Hook to fetch all user sessions
 */
export function useSessions() {
  return useQuery<SessionDto[], Error>({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async () => {
      const sessions = await authClient.getSessions();
      // Convert date strings to Date objects
      return sessions.map((session) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        lastActiveAt: new Date(session.lastActiveAt),
      }));
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to revoke a specific session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await authClient.deleteSession(sessionId);
    },
    onSuccess: () => {
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      toast.success('Session revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke session: ${error.message}`);
    },
  });
}

/**
 * Hook to revoke all other sessions (except current)
 */
export function useRevokeAllOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.revokeAllOtherSessions();
    },
    onSuccess: () => {
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      toast.success('All other sessions revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke sessions: ${error.message}`);
    },
  });
}
