import { useState, useEffect, useCallback } from 'react';
import { getPresenceManager, PresenceUser } from '../../realtime/presence-manager';

export interface UsePresenceOptions {
  resourceType?: string;
  resourceId?: string;
}

export interface UsePresenceReturn {
  usersViewing: PresenceUser[];
  allOnlineUsers: PresenceUser[];
  setActiveResource: (resourceType: string, resourceId: string) => void;
  clearActiveResource: () => void;
  setStatus: (status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY') => void;
  isUserViewing: (actorId: string) => boolean;
}

/**
 * React hook for managing presence state.
 *
 * @example
 * // Track users viewing a specific patient record
 * const { usersViewing, setActiveResource } = usePresence({
 *   resourceType: 'patient',
 *   resourceId: patientId,
 * });
 *
 * useEffect(() => {
 *   setActiveResource('patient', patientId);
 *   return () => clearActiveResource();
 * }, [patientId]);
 */
export function usePresence(options?: UsePresenceOptions): UsePresenceReturn {
  const presenceManager = getPresenceManager();
  const [usersViewing, setUsersViewing] = useState<PresenceUser[]>([]);
  const [allOnlineUsers, setAllOnlineUsers] = useState<PresenceUser[]>([]);

  const updateUsersViewing = useCallback(() => {
    if (options?.resourceType && options?.resourceId) {
      const users = presenceManager.getUsersViewingResource(
        options.resourceType,
        options.resourceId,
      );
      setUsersViewing(users);
    } else {
      setUsersViewing([]);
    }
  }, [options?.resourceType, options?.resourceId]);

  const updateAllOnlineUsers = useCallback(() => {
    const users = presenceManager.getAllOnlineUsers();
    setAllOnlineUsers(users);
  }, []);

  useEffect(() => {
    // Initial load
    updateUsersViewing();
    updateAllOnlineUsers();

    // Listen for presence events
    const handleUserJoined = () => {
      updateUsersViewing();
      updateAllOnlineUsers();
    };

    const handleUserLeft = () => {
      updateUsersViewing();
      updateAllOnlineUsers();
    };

    const handleUserUpdated = () => {
      updateUsersViewing();
      updateAllOnlineUsers();
    };

    presenceManager.on('user-joined', handleUserJoined);
    presenceManager.on('user-left', handleUserLeft);
    presenceManager.on('user-updated', handleUserUpdated);

    return () => {
      presenceManager.off('user-joined', handleUserJoined);
      presenceManager.off('user-left', handleUserLeft);
      presenceManager.off('user-updated', handleUserUpdated);
    };
  }, [updateUsersViewing, updateAllOnlineUsers]);

  const setActiveResource = useCallback(
    (resourceType: string, resourceId: string) => {
      presenceManager.setActiveResource(resourceType, resourceId);
    },
    [],
  );

  const clearActiveResource = useCallback(() => {
    presenceManager.clearActiveResource();
  }, []);

  const setStatus = useCallback((status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY') => {
    presenceManager.setStatus(status);
  }, []);

  const isUserViewing = useCallback(
    (actorId: string) => {
      return usersViewing.some((user) => user.actorId === actorId);
    },
    [usersViewing],
  );

  return {
    usersViewing,
    allOnlineUsers,
    setActiveResource,
    clearActiveResource,
    setStatus,
    isUserViewing,
  };
}
