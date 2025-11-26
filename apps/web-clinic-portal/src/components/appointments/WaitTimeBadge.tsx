/**
 * Wait Time Badge
 * Shows time elapsed since check-in (only for checked-in appointments)
 */

import { useState, useEffect } from 'react';
import type { AppointmentDto } from '../../types/appointment.types';

interface WaitTimeBadgeProps {
  appointment: AppointmentDto;
}

export function WaitTimeBadge({ appointment }: WaitTimeBadgeProps) {
  const [waitTimeMinutes, setWaitTimeMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (appointment.status !== 'confirmed' && appointment.status !== 'in_progress') {
      setWaitTimeMinutes(null);
      return;
    }

    const calculateWaitTime = () => {
      const now = new Date();
      const appointmentStart = new Date(appointment.start);
      const diffMs = now.getTime() - appointmentStart.getTime();
      const diffMins = Math.floor(diffMs / 1000 / 60);
      setWaitTimeMinutes(diffMins > 0 ? diffMins : 0);
    };

    calculateWaitTime();
    const interval = setInterval(calculateWaitTime, 60000);

    return () => clearInterval(interval);
  }, [appointment.status, appointment.start]);

  if (waitTimeMinutes === null) {
    return null;
  }

  const getWaitTimeColor = (minutes: number) => {
    if (minutes < 5) return 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20';
    if (minutes < 15) return 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/20';
    return 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20';
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getWaitTimeColor(waitTimeMinutes)}`}
      role="status"
      aria-live="polite"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Wait time: {waitTimeMinutes} min</span>
    </div>
  );
}
