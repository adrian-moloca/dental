import { useState, useEffect } from 'react';

export interface UpdateStatus {
  stage: 'idle' | 'checking' | 'downloading' | 'applying' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string;
}

/**
 * Hook for listening to update status changes from the main process.
 * Provides real-time feedback on update download and installation progress.
 */
export function useUpdateStatus() {
  const [status, setStatus] = useState<UpdateStatus>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to check for updates',
  });

  useEffect(() => {
    // Listen for update status changes from main process
    if (typeof window !== 'undefined' && window.dentalos?.update?.onStatus) {
      window.dentalos.update.onStatus((newStatus: UpdateStatus) => {
        setStatus(newStatus);
      });
    }

    // Get initial status
    if (typeof window !== 'undefined' && window.dentalos?.update?.getStatus) {
      window.dentalos.update.getStatus()
        .then((initialStatus: UpdateStatus) => {
          setStatus(initialStatus);
        })
        .catch((error) => {
          console.error('Failed to get initial update status:', error);
        });
    }
  }, []);

  return status;
}
