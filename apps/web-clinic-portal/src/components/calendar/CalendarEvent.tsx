/**
 * CalendarEvent Component
 *
 * Displays an individual event/appointment in the calendar
 * with status-based styling and patient information
 */

import React from 'react';
import { format } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  patientName?: string;
  providerName?: string;
  color?: string;
}

interface CalendarEventProps {
  event: CalendarEvent;
  style?: React.CSSProperties;
  onClick?: (event: CalendarEvent) => void;
}

export const CalendarEventCard: React.FC<CalendarEventProps> = ({ event, style, onClick }) => {
  const statusClass = event.status ? `status-${event.status}` : 'status-scheduled';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(event);
    }
  };

  return (
    <div
      className={`calendar-event ${statusClass}`}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${event.title}, ${format(event.start, 'HH:mm')} to ${format(event.end, 'HH:mm')}, ${event.status || 'scheduled'}`}
    >
      <div className="calendar-event-title">{event.title}</div>
      <div className="calendar-event-time">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
      {event.patientName && (
        <div className="calendar-event-patient">
          <i className="ti ti-user me-1" style={{ fontSize: '0.7rem' }}></i>
          {event.patientName}
        </div>
      )}
      {event.providerName && (
        <div className="calendar-event-provider">
          <i className="ti ti-stethoscope me-1" style={{ fontSize: '0.65rem' }}></i>
          {event.providerName}
        </div>
      )}
    </div>
  );
};

interface MonthEventProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}

export const CalendarMonthEvent: React.FC<MonthEventProps> = ({ event, onClick }) => {
  const getEventColor = () => {
    if (event.color) return event.color;

    switch (event.status) {
      case 'confirmed':
        return 'var(--success)';
      case 'in_progress':
        return 'var(--info)';
      case 'cancelled':
        return 'var(--danger)';
      case 'no_show':
        return 'var(--warning)';
      case 'completed':
        return 'var(--gray-400)';
      default:
        return 'var(--gray-500)';
    }
  };

  const getEventBgColor = () => {
    if (event.color) return `${event.color}20`;

    switch (event.status) {
      case 'confirmed':
        return 'var(--success-transparent)';
      case 'in_progress':
        return 'var(--info-transparent)';
      case 'cancelled':
        return 'var(--danger-transparent)';
      case 'no_show':
        return 'var(--warning-transparent)';
      case 'completed':
        return 'var(--light-300)';
      default:
        return 'var(--gray-transparent)';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  return (
    <div
      className="calendar-month-event"
      style={{
        backgroundColor: getEventBgColor(),
        borderLeft: `3px solid ${getEventColor()}`,
      }}
      onClick={handleClick}
      title={`${event.title} - ${format(event.start, 'HH:mm')}`}
    >
      {format(event.start, 'HH:mm')} {event.title}
    </div>
  );
};
