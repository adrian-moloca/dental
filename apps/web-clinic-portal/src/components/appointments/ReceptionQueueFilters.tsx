/**
 * Reception Queue Filters
 * Status filter buttons with counts
 */

import { Button } from '../ui/Button';
import type { AppointmentStatus } from '../../types/appointment.types';

interface ReceptionQueueFiltersProps {
  currentFilter: AppointmentStatus | 'all';
  onFilterChange: (filter: AppointmentStatus | 'all') => void;
  counts: {
    all: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    no_show: number;
  };
}

const filters: Array<{
  value: AppointmentStatus | 'all';
  label: string;
  key: keyof ReceptionQueueFiltersProps['counts'];
}> = [
  { value: 'all', label: 'All', key: 'all' },
  { value: 'pending', label: 'Pending', key: 'pending' },
  { value: 'confirmed', label: 'Confirmed', key: 'confirmed' },
  { value: 'in_progress', label: 'In Progress', key: 'in_progress' },
  { value: 'completed', label: 'Completed', key: 'completed' },
  { value: 'no_show', label: 'No Show', key: 'no_show' },
];

export function ReceptionQueueFilters({
  currentFilter,
  onFilterChange,
  counts,
}: ReceptionQueueFiltersProps) {
  return (
    <div
      className="flex flex-wrap gap-2 p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
      role="group"
      aria-label="Filter appointments by status"
    >
      {filters.map((filter) => {
        const count = counts[filter.key];
        const isActive = currentFilter === filter.value;

        return (
          <Button
            key={filter.value}
            variant={isActive ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            aria-pressed={isActive}
          >
            {filter.label}
            {count > 0 && (
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
