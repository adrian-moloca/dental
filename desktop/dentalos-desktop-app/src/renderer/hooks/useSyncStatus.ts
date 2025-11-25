import { useState, useEffect } from 'react';

interface SyncStatus {
  isRunning: boolean;
  lastSyncAt: Date | null;
  lastSequence: number;
  pendingChanges: number;
  errors: string[];
  uploaded: number;
  downloaded: number;
  conflicts: number;
}

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSyncAt: null,
    lastSequence: 0,
    pendingChanges: 0,
    errors: [],
    uploaded: 0,
    downloaded: 0,
    conflicts: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();

    const interval = setInterval(loadStatus, 5000);

    if (window.dentalos?.sync) {
      window.dentalos.sync.onStatusChanged((newStatus) => {
        setStatus(newStatus);
      });
    }

    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const currentStatus = await window.dentalos.sync.getStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const triggerSync = async () => {
    setLoading(true);
    try {
      await window.dentalos.sync.trigger();
      await loadStatus();
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    } finally {
      setLoading(false);
    }
  };

  return { status, triggerSync, loading };
}
