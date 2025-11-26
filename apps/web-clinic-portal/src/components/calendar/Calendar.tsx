/**
 * Calendar Component
 *
 * Main calendar component with three views (Day, Week, Month)
 * Supports event display, click handlers, and navigation
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ro } from 'date-fns/locale';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDayView } from './CalendarDayView';
import type { Resource } from './CalendarDayView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarMonthView } from './CalendarMonthView';
import type { CalendarEvent } from './CalendarEvent';
import './calendar.scss';

type CalendarView = 'day' | 'week' | 'month';

export interface CalendarProps {
  events: CalendarEvent[];
  resources?: Resource[];
  initialView?: CalendarView;
  initialDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, resourceId?: string) => void;
  onEventMove?: (event: CalendarEvent, newStart: Date, newResourceId?: string) => void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  className?: string;
  loading?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  resources,
  initialView = 'week',
  initialDate = new Date(),
  onEventClick,
  onSlotClick,
  onEventMove,
  onDateChange,
  onViewChange,
  className = '',
  loading = false,
}) => {
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  // Calculate title based on view
  const headerTitle = useMemo(() => {
    switch (currentView) {
      case 'day':
        return format(currentDate, 'd MMMM yyyy', { locale: ro });
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, 'd MMM', { locale: ro })} - ${format(end, 'd MMM yyyy', { locale: ro })}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ro });
      default:
        return '';
    }
  }, [currentDate, currentView]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentDate((prev) => {
      let newDate: Date;
      switch (currentView) {
        case 'day':
          newDate = addDays(prev, -1);
          break;
        case 'week':
          newDate = addWeeks(prev, -1);
          break;
        case 'month':
          newDate = addMonths(prev, -1);
          break;
        default:
          newDate = prev;
      }
      onDateChange?.(newDate);
      return newDate;
    });
  }, [currentView, onDateChange]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      let newDate: Date;
      switch (currentView) {
        case 'day':
          newDate = addDays(prev, 1);
          break;
        case 'week':
          newDate = addWeeks(prev, 1);
          break;
        case 'month':
          newDate = addMonths(prev, 1);
          break;
        default:
          newDate = prev;
      }
      onDateChange?.(newDate);
      return newDate;
    });
  }, [currentView, onDateChange]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  }, [onDateChange]);

  const handleViewChange = useCallback(
    (view: CalendarView) => {
      setCurrentView(view);
      onViewChange?.(view);
    },
    [onViewChange]
  );

  // Handle date click in month view (switch to day view)
  const handleDateClick = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      setCurrentView('day');
      onDateChange?.(date);
      onViewChange?.('day');
    },
    [onDateChange, onViewChange]
  );

  // Filter events for current view
  const filteredEvents = useMemo(() => {
    const start = (() => {
      switch (currentView) {
        case 'day':
          return currentDate;
        case 'week':
          return startOfWeek(currentDate, { weekStartsOn: 1 });
        case 'month':
          return startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      }
    })();

    const end = (() => {
      switch (currentView) {
        case 'day':
          return addDays(currentDate, 1);
        case 'week':
          return endOfWeek(currentDate, { weekStartsOn: 1 });
        case 'month':
          return endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      }
    })();

    return events.filter((event) => {
      const eventStart = event.start;
      return eventStart >= start && eventStart <= end;
    });
  }, [events, currentDate, currentView]);

  // Render current view
  const renderView = () => {
    if (loading) {
      return (
        <div className="calendar-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se incarca...</span>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'day':
        return (
          <CalendarDayView
            date={currentDate}
            events={filteredEvents}
            resources={resources}
            onEventClick={onEventClick}
            onSlotClick={onSlotClick}
          />
        );
      case 'week':
        return (
          <CalendarWeekView
            date={currentDate}
            events={filteredEvents}
            resources={resources}
            onEventClick={onEventClick}
            onSlotClick={onSlotClick}
          />
        );
      case 'month':
        return (
          <CalendarMonthView
            date={currentDate}
            events={filteredEvents}
            onEventClick={onEventClick}
            onDateClick={handleDateClick}
          />
        );
    }
  };

  return (
    <div className={`calendar ${className}`}>
      <CalendarHeader
        currentDate={currentDate}
        view={currentView}
        title={headerTitle}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={handleViewChange}
      />
      {renderView()}
    </div>
  );
};

// Re-export types for convenience
export type { CalendarEvent, Resource };
