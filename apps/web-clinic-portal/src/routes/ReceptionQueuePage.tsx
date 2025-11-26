/**
 * Reception Queue Page
 * Shows today's appointments with check-in workflow
 */

import { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { ReceptionQueueCard } from '../components/appointments/ReceptionQueueCard';
import { ReceptionQueueFilters } from '../components/appointments/ReceptionQueueFilters';
import type { AppointmentStatus } from '../types/appointment.types';

export default function ReceptionQueuePage() {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, isLoading, error } = useAppointments({
    startDate: today,
    endDate: tomorrow,
  });

  const filteredAppointments = data?.data?.filter((apt) => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  }) ?? [];

  if (isLoading) {
    return (
      <AppShell title="Reception Queue" subtitle="Loading today's appointments...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Reception Queue">
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            Error loading appointments: {(error as Error).message}
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Reception Queue"
      subtitle={`${filteredAppointments.length} appointment${filteredAppointments.length !== 1 ? 's' : ''} today`}
    >
      <div className="space-y-6">
        <ReceptionQueueFilters
          currentFilter={statusFilter}
          onFilterChange={setStatusFilter}
          counts={{
            all: data?.data?.length ?? 0,
            pending: data?.data?.filter((a) => a.status === 'pending').length ?? 0,
            confirmed: data?.data?.filter((a) => a.status === 'confirmed').length ?? 0,
            in_progress: data?.data?.filter((a) => a.status === 'in_progress').length ?? 0,
            completed: data?.data?.filter((a) => a.status === 'completed').length ?? 0,
            no_show: data?.data?.filter((a) => a.status === 'no_show').length ?? 0,
          }}
        />

        {filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                No appointments
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {statusFilter === 'all'
                  ? 'No appointments scheduled for today'
                  : `No appointments with status: ${statusFilter}`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.map((appointment) => (
              <ReceptionQueueCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
