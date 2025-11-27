/**
 * CalendarWeekView Component
 *
 * Week view with 7 day columns and time slots
 * Features: business hours highlighting, current time indicator, click to create
 */

import React, { useMemo, useEffect, useRef } from 'react';
import {
  format,
  setHours,
  setMinutes,
  startOfDay,
  startOfWeek,
  addDays,
  addMinutes,
  isSameDay,
  isWithinInterval,
  isToday,
} from 'date-fns';
import { ro } from 'date-fns/locale';
import { CalendarEventCard } from './CalendarEvent';
import type { CalendarEvent } from './CalendarEvent';
import type { Resource } from './CalendarDayView';

interface CalendarWeekViewProps {
  date: Date;
  events: CalendarEvent[];
  resources?: Resource[];
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, resourceId?: string) => void;
  scrollToNow?: number;
}

const START_HOUR = 7;
const END_HOUR = 21; // 8pm (20:00) is the last hour shown
const SLOT_DURATION = 30; // minutes
const SLOT_HEIGHT = 60; // pixels
const BUSINESS_START = 8;
const BUSINESS_END = 19;

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  date,
  events,
  resources = [{ id: 'default', title: 'Cabinet 1' }],
  onEventClick,
  onSlotClick,
  scrollToNow,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [date]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const baseDate = startOfDay(date);
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
        slots.push(setMinutes(setHours(baseDate, hour), minute));
      }
    }
    return slots;
  }, [date]);

  // Auto-scroll to current time on mount and when scrollToNow changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= START_HOUR && currentHour < END_HOUR) {
        const scrollPosition = ((currentHour - START_HOUR) * 2 * SLOT_HEIGHT) - 100;
        scrollContainerRef.current.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: scrollToNow ? 'smooth' : 'auto',
        });
      }
    }
  }, [date, scrollToNow]);

  // Check if slot is in business hours (Monday-Friday, 8am-7pm)
  const isBusinessHour = (time: Date) => {
    const hour = time.getHours();
    const day = time.getDay();
    // day: 0=Sunday, 1=Monday, ..., 6=Saturday
    // Business hours: Monday(1) to Friday(5), 8am-7pm
    return day >= 1 && day <= 5 && hour >= BUSINESS_START && hour < BUSINESS_END;
  };

  // Check if slot contains current time
  const isCurrentTimeSlot = (time: Date, day: Date) => {
    const now = new Date();
    if (!isSameDay(now, day)) return false;
    const nextSlot = addMinutes(time, SLOT_DURATION);
    return isWithinInterval(now, { start: time, end: nextSlot });
  };

  // Get current time position for indicator
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour < START_HOUR || currentHour >= END_HOUR) return null;

    const minutesFromStart = (currentHour - START_HOUR) * 60 + currentMinute;
    return (minutesFromStart / SLOT_DURATION) * SLOT_HEIGHT;
  };

  const currentTimePosition = getCurrentTimePosition();

  // Render event in the grid
  const renderEvent = (event: CalendarEvent, day: Date) => {
    if (!isSameDay(event.start, day)) return null;

    // For week view without resources, just show all events
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
    const slotStartMinutes = START_HOUR * 60;
    const slotEndMinutes = END_HOUR * 60;

    if (endMinutes <= slotStartMinutes || startMinutes >= slotEndMinutes) {
      return null;
    }

    const top = Math.max(0, ((startMinutes - slotStartMinutes) / SLOT_DURATION) * SLOT_HEIGHT);
    const height = Math.max(SLOT_HEIGHT / 2, ((Math.min(endMinutes, slotEndMinutes) - Math.max(startMinutes, slotStartMinutes)) / SLOT_DURATION) * SLOT_HEIGHT);

    return (
      <CalendarEventCard
        key={event.id}
        event={event}
        style={{
          top: `${top}px`,
          height: `${height}px`,
        }}
        onClick={onEventClick}
      />
    );
  };

  const handleSlotClick = (time: Date, day: Date) => {
    const slotDateTime = setHours(setMinutes(day, time.getMinutes()), time.getHours());
    onSlotClick?.(slotDateTime);
  };

  return (
    <div className="calendar-body" ref={scrollContainerRef}>
      {/* Week header */}
      <div className="calendar-week-header">
        <div className="calendar-week-time-header">Ora</div>
        {weekDays.map((day) => {
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          return (
          <div
            key={day.toISOString()}
            className={`calendar-week-day-header ${isToday(day) ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
          >
            <div className="calendar-week-day-name">
              {format(day, 'EEE', { locale: ro })}
            </div>
            <div className="calendar-week-day-number">
              {format(day, 'd')}
            </div>
          </div>
          );
        })}
      </div>

      <div className="calendar-grid">
        {/* Time column */}
        <div className="calendar-time-column">
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className="calendar-time-slot"
              style={{ height: `${SLOT_HEIGHT}px` }}
            >
              {time.getMinutes() === 0 && (
                <span className="calendar-time-label">
                  {format(time, 'HH:mm')}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className="calendar-week-columns">
          {weekDays.map((day) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6; // Sunday or Saturday
            return (
            <div key={day.toISOString()} className={`calendar-week-column ${isWeekend ? 'weekend' : ''}`}>
              {/* Time slots for this day */}
              {timeSlots.map((time, slotIndex) => {
                const slotTime = setHours(setMinutes(day, time.getMinutes()), time.getHours());
                const isBusinessSlot = isBusinessHour(slotTime);
                const isCurrentSlot = isCurrentTimeSlot(time, day);

                return (
                  <div
                    key={slotIndex}
                    className={`calendar-day-slot ${isBusinessSlot ? 'business-hours' : 'non-business-hours'} ${isCurrentSlot ? 'current-time-slot' : ''}`}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    onClick={() => handleSlotClick(time, day)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${format(day, 'EEEE d MMMM', { locale: ro })}, ${format(time, 'HH:mm')}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSlotClick(time, day);
                      }
                    }}
                  />
                );
              })}

              {/* Events container */}
              <div className="calendar-events-container">
                {events.map((event) => renderEvent(event, day))}
              </div>

              {/* Current time indicator */}
              {isToday(day) && currentTimePosition !== null && (
                <div
                  className="calendar-current-time"
                  style={{ top: `${currentTimePosition}px` }}
                  aria-hidden="true"
                />
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
