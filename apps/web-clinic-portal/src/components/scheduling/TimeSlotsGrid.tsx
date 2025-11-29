/**
 * Time Slots Grid Component
 * Displays available time slots for a specific date, grouped by morning/afternoon
 */

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import type { TimeSlotsGridProps, TimeSlot } from '../../types/scheduling.types';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';

export function TimeSlotsGrid({ date, providerId, duration, onSelect, selected }: TimeSlotsGridProps) {
  const { data, isLoading } = useAvailableSlots({
    providerId,
    date,
    duration,
  });

  const { morningSlots, afternoonSlots } = useMemo(() => {
    if (!data?.slots) {
      return { morningSlots: [], afternoonSlots: [] };
    }

    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];

    data.slots.forEach((slot) => {
      const slotStart = parseISO(slot.start);
      const slotEnd = parseISO(slot.end);
      const hour = slotStart.getHours();

      const timeSlot: TimeSlot = {
        start: slotStart,
        end: slotEnd,
        isAvailable: slot.isAvailable,
        reason: slot.reason,
      };

      if (hour < 12) {
        morning.push(timeSlot);
      } else {
        afternoon.push(timeSlot);
      }
    });

    return { morningSlots: morning, afternoonSlots: afternoon };
  }, [data]);

  const isSelected = (slot: TimeSlot) => {
    if (!selected) return false;
    return slot.start.getTime() === selected.start.getTime();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-[var(--surface-hover)] rounded w-24 mb-3" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-[var(--surface-hover)] rounded" />
            ))}
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-[var(--surface-hover)] rounded w-24 mb-3" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-[var(--surface-hover)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data?.slots || data.slots.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)]">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>Nu exista sloturi disponibile pentru aceasta data</p>
      </div>
    );
  }

  const renderSlots = (slots: TimeSlot[], title: string) => {
    if (slots.length === 0) return null;

    return (
      <div>
        <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">{title}</h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => slot.isAvailable && onSelect(slot)}
              disabled={!slot.isAvailable}
              title={slot.reason || ''}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isSelected(slot)
                    ? 'bg-[var(--primary)] text-white shadow-md ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg)]'
                    : slot.isAvailable
                      ? 'bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 cursor-not-allowed'
                }
              `}
            >
              {format(slot.start, 'HH:mm')}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSlots(morningSlots, 'Dimineata')}
      {renderSlots(afternoonSlots, 'Dupa-amiaza')}
    </div>
  );
}
