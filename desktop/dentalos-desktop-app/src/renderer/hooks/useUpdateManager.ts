import { useState, useCallback } from 'react';
import { useUpdateStatus } from './useUpdateStatus';

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  isMandatory?: boolean;
  package?: any;
  differentialPatch?: any;
  message?: string;
}

/**
 * Hook for managing application updates.
 * Provides methods for checking, downloading, and applying updates.
 */
export function useUpdateManager() {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = useUpdateStatus();

  /**
   * Checks for available updates.
   */
  const checkForUpdates = useCallback(async (channel: 'stable' | 'beta' | 'alpha' = 'stable') => {
    if (!window.dentalos?.update?.checkCustom) {
      setError('Update functionality not available');
      return null;
    }

    setIsChecking(true);
    setError(null);

    try {
      const result = await window.dentalos.update.checkCustom(channel);
      setUpdateInfo(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check for updates';
      setError(errorMessage);
      console.error('Failed to check for updates:', err);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Downloads and applies an update.
   */
  const downloadAndApplyUpdate = useCallback(async (updateData: UpdateCheckResult) => {
    if (!window.dentalos?.update?.downloadAndApply) {
      setError('Update functionality not available');
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await window.dentalos.update.downloadAndApply(updateData);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply update';
      setError(errorMessage);
      console.error('Failed to apply update:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Rolls back to the previous version.
   */
  const rollback = useCallback(async () => {
    if (!window.dentalos?.update?.rollback) {
      setError('Rollback functionality not available');
      return false;
    }

    setError(null);

    try {
      await window.dentalos.update.rollback();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rollback';
      setError(errorMessage);
      console.error('Failed to rollback:', err);
      return false;
    }
  }, []);

  /**
   * Clears update error.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clears update info (e.g., when user dismisses update dialog).
   */
  const clearUpdateInfo = useCallback(() => {
    setUpdateInfo(null);
  }, []);

  return {
    updateInfo,
    isChecking,
    isUpdating,
    status,
    error,
    checkForUpdates,
    downloadAndApplyUpdate,
    rollback,
    clearError,
    clearUpdateInfo,
  };
}
