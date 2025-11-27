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
  status?: 'pending' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'checked_in';
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
  // Normalize status for CSS class (pending uses scheduled styling)
  const normalizedStatus = event.status === 'pending' ? 'scheduled' : event.status;
  const statusClass = normalizedStatus ? `status-${normalizedStatus}` : 'status-scheduled';

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
      aria-label={`${event.patientName || event.title}, ${format(event.start, 'HH:mm')} până la ${format(event.end, 'HH:mm')}, ${getStatusLabel(event.status || 'scheduled')}`}
    >
      {event.patientName && (
        <div className="calendar-event-patient">
          <i className="ti ti-user me-1"></i>
          {event.patientName}
        </div>
      )}
      <div className="calendar-event-title">{event.title}</div>
      <div className="calendar-event-time">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
      {event.providerName && (
        <div className="calendar-event-provider">
          <i className="ti ti-stethoscope me-1"></i>
          {event.providerName}
        </div>
      )}
    </div>
  );
};

// Helper function for Romanian status labels
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'În așteptare',
    scheduled: 'Programat',
    confirmed: 'Confirmat',
    checked_in: 'Check-in efectuat',
    in_progress: 'În desfășurare',
    completed: 'Finalizat',
    cancelled: 'Anulat',
    no_show: 'Absent',
  };
  return labels[status] || status;
};

interface MonthEventProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}

export const CalendarMonthEvent: React.FC<MonthEventProps> = ({ event, onClick }) => {
  const getEventColor = () => {
    if (event.color) return event.color;

    switch (event.status) {
      case 'pending':
      case 'scheduled':
        return 'var(--gray-500)';
      case 'confirmed':
        return 'var(--success)';
      case 'checked_in':
        return 'var(--primary)';
      case 'in_progress':
        return 'var(--info)';
      case 'completed':
        return 'var(--gray-400)';
      case 'cancelled':
        return 'var(--danger)';
      case 'no_show':
        return 'var(--warning)';
      default:
        return 'var(--gray-500)';
    }
  };

  const getEventBgColor = () => {
    if (event.color) return `${event.color}20`;

    switch (event.status) {
      case 'pending':
      case 'scheduled':
        return 'var(--gray-transparent)';
      case 'confirmed':
        return 'var(--success-transparent)';
      case 'checked_in':
        return 'var(--primary-transparent)';
      case 'in_progress':
        return 'var(--info-transparent)';
      case 'completed':
        return 'var(--light-300)';
      case 'cancelled':
        return 'var(--danger-transparent)';
      case 'no_show':
        return 'var(--warning-transparent)';
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
