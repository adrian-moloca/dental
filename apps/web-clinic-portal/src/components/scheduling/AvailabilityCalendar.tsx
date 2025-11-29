/**
 * Availability Calendar Component
 * Month view calendar with available/busy day indicators
 */

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ro } from 'date-fns/locale';
import type { AvailabilityCalendarProps } from '../../types/scheduling.types';

export function AvailabilityCalendar({
  minDate = new Date(),
  maxDate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, startOfDay(minDate))) return;
    if (maxDate && isBefore(maxDate, date)) return;
    setSelectedDate(date);
    // Note: Slot selection happens in TimeSlotsGrid, not here
  };

  const isDateSelectable = (date: Date) => {
    if (isBefore(date, startOfDay(minDate))) return false;
    if (maxDate && isBefore(maxDate, date)) return false;
    return true;
  };

  // Get the starting day of week offset
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-base font-semibold text-[var(--text)] capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ro })}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-xs font-semibold text-[var(--text-tertiary)] text-center py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}

        {/* Date cells */}
        {days.map((day) => {
          const selectable = isDateSelectable(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={!selectable}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${
                  selected
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : today
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30'
                      : selectable
                        ? 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                        : 'text-[var(--text-tertiary)] opacity-40 cursor-not-allowed'
                }
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--primary)]" />
          <span className="text-[var(--text-secondary)]">Selectat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/30" />
          <span className="text-[var(--text-secondary)]">Astazi</span>
        </div>
      </div>
    </div>
  );
}
