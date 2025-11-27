/**
 * Reception Queue Hook
 *
 * Custom hook for managing reception queue state and operations.
 */

import { useMemo } from 'react';
import { useAppointments } from './useAppointments';
import type { AppointmentDto } from '../types/appointment.types';

export interface ReceptionStats {
  total: number;
  checkedIn: number;
  waiting: number;
  inProgress: number;
  completed: number;
  averageWaitTime: number;
}

export function useReceptionQueue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, isLoading, error, refetch } = useAppointments({
    startDate: today,
    endDate: tomorrow,
  });

  const appointments = data?.data ?? [];

  // Categorize appointments
  const categorized = useMemo(() => {
    const waiting: AppointmentDto[] = [];
    const upcoming: AppointmentDto[] = [];
    const inProgress: AppointmentDto[] = [];

    appointments.forEach((apt) => {
      if (apt.status === 'checked_in') {
        waiting.push(apt);
      } else if (apt.status === 'in_progress') {
        inProgress.push(apt);
      } else if (
        apt.status === 'pending' ||
        apt.status === 'confirmed'
      ) {
        upcoming.push(apt);
      }
    });

    // Sort by appointment time
    waiting.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    upcoming.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    inProgress.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return { waiting, upcoming, inProgress };
  }, [appointments]);

  // Calculate stats
  const stats = useMemo<ReceptionStats>(() => {
    const total = appointments.length;
    const checkedIn = appointments.filter((a) => a.status === 'checked_in').length;
    const inProgress = appointments.filter((a) => a.status === 'in_progress').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;

    // Calculate average wait time for checked-in patients
    const waitingPatients = appointments.filter((a) => a.status === 'checked_in');
    let averageWaitTime = 0;
    if (waitingPatients.length > 0) {
      const totalWait = waitingPatients.reduce((sum, apt) => {
        const start = new Date(apt.start);
        const now = new Date();
        const diff = Math.max(0, now.getTime() - start.getTime());
        return sum + diff;
      }, 0);
      averageWaitTime = Math.floor(totalWait / waitingPatients.length / 60000); // Convert to minutes
    }

    return {
      total,
      checkedIn,
      waiting: checkedIn,
      inProgress,
      completed,
      averageWaitTime,
    };
  }, [appointments]);

  // Get next 2 hours of upcoming appointments
  const upcomingNext2Hours = useMemo(() => {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return categorized.upcoming.filter((apt) => {
      const startTime = new Date(apt.start);
      return startTime >= now && startTime <= twoHoursLater;
    });
  }, [categorized.upcoming]);

  return {
    appointments,
    waiting: categorized.waiting,
    upcoming: upcomingNext2Hours,
    inProgress: categorized.inProgress,
    stats,
    isLoading,
    error,
    refetch,
  };
}
