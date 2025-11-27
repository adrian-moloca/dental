/**
 * CalendarHeader Component
 *
 * Navigation controls and view switching for the calendar
 */

import React from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

type CalendarView = 'day' | 'week' | 'month';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  title,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}) => {
  return (
    <div className="calendar-header">
      {/* Navigation Controls */}
      <div className="calendar-header-left">
        <button
          className="calendar-header-btn calendar-header-btn-icon"
          onClick={onPrevious}
          aria-label="Perioada anterioară"
          type="button"
        >
          <i className="ti ti-chevron-left"></i>
        </button>
        <button
          className="calendar-header-btn calendar-header-btn-icon"
          onClick={onNext}
          aria-label="Perioada următoare"
          type="button"
        >
          <i className="ti ti-chevron-right"></i>
        </button>
        <button
          className="calendar-header-btn"
          onClick={onToday}
          type="button"
        >
          Astăzi
        </button>
      </div>

      {/* Current Date/Period */}
      <div className="calendar-header-center">
        <h2 className="calendar-header-title">{title}</h2>
      </div>

      {/* View Switcher */}
      <div className="calendar-header-right">
        <div className="calendar-header-view-toggle">
          <button
            className={`calendar-header-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => onViewChange('day')}
            type="button"
            aria-label="Vizualizare pe zi"
            aria-pressed={view === 'day'}
          >
            <i className="ti ti-calendar-time me-1"></i>
            Zi
          </button>
          <button
            className={`calendar-header-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => onViewChange('week')}
            type="button"
            aria-label="Vizualizare pe săptămână"
            aria-pressed={view === 'week'}
          >
            <i className="ti ti-calendar-week me-1"></i>
            Săptămână
          </button>
          <button
            className={`calendar-header-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => onViewChange('month')}
            type="button"
            aria-label="Vizualizare pe lună"
            aria-pressed={view === 'month'}
          >
            <i className="ti ti-calendar me-1"></i>
            Lună
          </button>
        </div>
      </div>
    </div>
  );
};
