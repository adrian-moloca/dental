/**
 * Wait Timer Hook
 *
 * Custom hook for live wait time calculations with auto-refresh.
 */

import { useState, useEffect } from 'react';
import { differenceInMinutes } from 'date-fns';

export interface WaitTimeInfo {
  minutes: number;
  isOverdue: boolean;
  isWarning: boolean;
}

export function useWaitTimer(startTime: Date | string | null): WaitTimeInfo {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const updateWaitTime = () => {
      try {
        const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
        if (isNaN(start.getTime())) return;

        const now = new Date();
        const diff = differenceInMinutes(now, start);
        setMinutes(Math.max(0, diff));
      } catch {
        setMinutes(0);
      }
    };

    // Initial calculation
    updateWaitTime();

    // Update every minute
    const interval = setInterval(updateWaitTime, 60000);

    return () => clearInterval(interval);
  }, [startTime]);

  return {
    minutes,
    isOverdue: minutes > 30,
    isWarning: minutes > 15 && minutes <= 30,
  };
}
