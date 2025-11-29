/**
 * CalendarDayView Component
 *
 * Day view with time slots (7am-8pm) and resource columns (providers/chairs)
 * Features: business hours highlighting, current time indicator, click to create
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { format, setHours, setMinutes, startOfDay, addMinutes, isWithinInterval, isSameDay } from 'date-fns';
import { ro } from 'date-fns/locale/ro';
import { CalendarEventCard } from './CalendarEvent';
import type { CalendarEvent } from './CalendarEvent';

export interface Resource {
  id: string;
  title: string;
  color?: string;
}

interface CalendarDayViewProps {
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

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  date,
  events,
  resources = [{ id: 'default', title: 'Cabinet 1' }],
  onEventClick,
  onSlotClick,
  scrollToNow,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      if (isSameDay(now, date)) {
        const currentHour = now.getHours();
        if (currentHour >= START_HOUR && currentHour < END_HOUR) {
          const scrollPosition = ((currentHour - START_HOUR) * 2 * SLOT_HEIGHT) - 100;
          scrollContainerRef.current.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: scrollToNow ? 'smooth' : 'auto',
          });
        }
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
  const isCurrentTimeSlot = (time: Date) => {
    const now = new Date();
    if (!isSameDay(now, date)) return false;
    const nextSlot = addMinutes(time, SLOT_DURATION);
    return isWithinInterval(now, { start: time, end: nextSlot });
  };

  // Get current time position for indicator
  const getCurrentTimePosition = () => {
    const now = new Date();
    if (!isSameDay(now, date)) return null;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour < START_HOUR || currentHour >= END_HOUR) return null;

    const minutesFromStart = (currentHour - START_HOUR) * 60 + currentMinute;
    return (minutesFromStart / SLOT_DURATION) * SLOT_HEIGHT;
  };

  const currentTimePosition = getCurrentTimePosition();

  // Render event in the grid
  const renderEvent = (event: CalendarEvent, resource: Resource) => {
    if (!isSameDay(event.start, date)) return null;
    if (event.resourceId && event.resourceId !== resource.id) return null;
    if (!event.resourceId && resource.id !== 'default') return null;

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

  const handleSlotClick = (time: Date, resourceId: string) => {
    onSlotClick?.(time, resourceId);
  };

  return (
    <div className="calendar-body" ref={scrollContainerRef}>
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

        {/* Resource columns */}
        <div className="calendar-resources-container">
          {resources.map((resource) => (
            <div key={resource.id} className="calendar-resource-column">
              {/* Resource header */}
              <div className="calendar-resource-header">
                <h6 className="calendar-resource-title">{resource.title}</h6>
                <p className="calendar-resource-subtitle">
                  {format(date, 'EEEE, d MMMM yyyy', { locale: ro })}
                </p>
              </div>

              {/* Time slots */}
              {timeSlots.map((time, slotIndex) => {
                const slotTime = setHours(setMinutes(date, time.getMinutes()), time.getHours());
                const isBusinessSlot = isBusinessHour(slotTime);
                const isCurrentSlot = isCurrentTimeSlot(slotTime);

                return (
                  <div
                    key={slotIndex}
                    className={`calendar-day-slot ${isBusinessSlot ? 'business-hours' : 'non-business-hours'} ${isCurrentSlot ? 'current-time-slot' : ''}`}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    onClick={() => handleSlotClick(slotTime, resource.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${format(slotTime, 'HH:mm')} ${resource.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSlotClick(slotTime, resource.id);
                      }
                    }}
                  />
                );
              })}

              {/* Events container */}
              <div className="calendar-events-container">
                {events.map((event) => renderEvent(event, resource))}
              </div>

              {/* Current time indicator */}
              {currentTimePosition !== null && (
                <div
                  className="calendar-current-time"
                  style={{ top: `${currentTimePosition}px` }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
