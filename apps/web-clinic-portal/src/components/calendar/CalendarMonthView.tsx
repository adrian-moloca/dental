/**
 * CalendarMonthView Component
 *
 * Month grid view with 7x5/6 calendar grid
 * Shows mini event indicators with click to view details
 */

import React, { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from 'date-fns';
import { ro } from 'date-fns/locale/ro';
import { CalendarMonthEvent } from './CalendarEvent';
import type { CalendarEvent } from './CalendarEvent';

interface CalendarMonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam', 'Dum'];
const MAX_EVENTS_SHOWN = 3;

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  date,
  events,
  onEventClick,
  onDateClick,
}) => {
  // Generate calendar grid (weeks x 7 days)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let currentDay = calendarStart;

    while (currentDay <= calendarEnd) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }

    return days;
  }, [date]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, event]);
    });

    // Sort events by start time
    grouped.forEach((dayEvents, key) => {
      grouped.set(
        key,
        dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
      );
    });

    return grouped;
  }, [events]);

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  };

  const handleDateClick = (day: Date) => {
    onDateClick?.(day);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  return (
    <div className="calendar-month">
      {/* Weekday headers */}
      <div className="calendar-month-header">
        {WEEKDAY_NAMES.map((day, index) => {
          const isWeekend = index >= 5; // Sam (5), Dum (6)
          return (
            <div
              key={day}
              className={`calendar-month-day-header ${isWeekend ? 'weekend' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="calendar-month-grid">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, date);
          const isTodayDate = isToday(day);
          const isWeekendDay = day.getDay() === 0 || day.getDay() === 6; // Sunday or Saturday

          return (
            <div
              key={index}
              className={`calendar-month-cell ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${isWeekendDay ? 'weekend' : ''}`}
              onClick={() => handleDateClick(day)}
              role="button"
              tabIndex={0}
              aria-label={format(day, 'd MMMM yyyy', { locale: ro })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDateClick(day);
                }
              }}
            >
              <div className="calendar-month-date">
                {format(day, 'd')}
              </div>

              <div className="calendar-month-events">
                {dayEvents.slice(0, MAX_EVENTS_SHOWN).map((event) => (
                  <CalendarMonthEvent
                    key={event.id}
                    event={event}
                    onClick={(e) => handleEventClick(e, e as any)}
                  />
                ))}

                {dayEvents.length > MAX_EVENTS_SHOWN && (
                  <div className="calendar-month-more">
                    +{dayEvents.length - MAX_EVENTS_SHOWN} mai mult{dayEvents.length - MAX_EVENTS_SHOWN === 1 ? 'a' : 'e'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
