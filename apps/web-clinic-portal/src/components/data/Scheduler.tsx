/**
 * Custom Scheduler Component
 *
 * A clean, custom time grid scheduler without FullCalendar dependency.
 * Features:
 * - Weekly/Daily resource time grid views
 * - Drag and drop support
 * - Business hours highlighting
 * - Current time indicator
 * - Status-based event colors
 */

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfDay,
  isSameDay,
  addMinutes,
  differenceInMinutes,
  isWithinInterval,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import { ro } from 'date-fns/locale';
import { useToast } from '../toast/ToastProvider';
import './Scheduler.css';

export type SchedulerResource = {
  id: string;
  title: string;
};

export type SchedulerEvent = {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  resourceId?: string;
  status?: string;
  riskScore?: number;
};

export type DatesSetArg = {
  start: Date;
  end: Date;
  view: {
    type: string;
  };
};

type SelectSlotArg = {
  start: Date;
  end: Date;
  resource?: SchedulerResource;
};

type EventMoveArg = {
  event: {
    id: string;
    start: Date;
    end: Date;
    getResources?: () => { id: string }[];
  };
  newResource?: { id: string };
  revert: () => void;
};

type Props = {
  resources: SchedulerResource[];
  events: SchedulerEvent[];
  onMove?: (event: SchedulerEvent, arg: EventMoveArg) => void;
  onResize?: (event: SchedulerEvent, arg: EventMoveArg) => void;
  onSelectSlot?: (arg: SelectSlotArg) => void;
  onDatesChange?: (arg: DatesSetArg) => void;
  view?: 'resourceTimeGridDay' | 'resourceTimeGridWeek';
  enforceAvailability?: boolean;
};

const SLOT_HEIGHT = 40; // pixels per 30 min slot
const SLOT_DURATION = 30; // minutes
const START_HOUR = 7;
const END_HOUR = 20;
const BUSINESS_START = 8;
const BUSINESS_END = 19;

export function Scheduler({
  resources,
  events,
  onMove,
  onResize: _onResize,
  onSelectSlot,
  onDatesChange,
  view = 'resourceTimeGridWeek',
  enforceAvailability = true,
}: Props) {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<SchedulerEvent | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ time: Date; resourceId: string } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isWeekView = view === 'resourceTimeGridWeek';

  // Calculate time slots
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const baseDate = startOfDay(currentDate);
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
        slots.push(setMinutes(setHours(baseDate, hour), minute));
      }
    }
    return slots;
  }, [currentDate]);

  // Calculate days to display
  const displayDays = useMemo(() => {
    if (isWeekView) {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    return [startOfDay(currentDate)];
  }, [currentDate, isWeekView]);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= START_HOUR && currentHour < END_HOUR) {
        const scrollPosition = ((currentHour - START_HOUR) * 2 * SLOT_HEIGHT) - 100;
        scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
      }
    }
  }, []);

  // Notify parent of date changes
  useEffect(() => {
    if (onDatesChange) {
      const start = isWeekView ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfDay(currentDate);
      const end = isWeekView ? endOfWeek(currentDate, { weekStartsOn: 1 }) : startOfDay(addDays(currentDate, 1));
      onDatesChange({
        start,
        end,
        view: { type: view },
      });
    }
  }, [currentDate, isWeekView, view, onDatesChange]);

  const hasConflict = useCallback((eventId: string, resourceId: string | undefined, start: Date, end: Date) => {
    if (!enforceAvailability) return false;
    return events.some((e) => {
      if (e.id === eventId) return false;
      if ((e.resourceId ?? 'default') !== (resourceId ?? 'default')) return false;
      const s = typeof e.start === 'string' ? parseISO(e.start) : e.start;
      const en = typeof e.end === 'string' ? parseISO(e.end) : e.end;
      return s < end && start < en;
    });
  }, [events, enforceAvailability]);

  const handlePrevious = () => {
    setCurrentDate((prev) => addDays(prev, isWeekView ? -7 : -1));
  };

  const handleNext = () => {
    setCurrentDate((prev) => addDays(prev, isWeekView ? 7 : 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventDragStart = (event: SchedulerEvent) => (e: React.DragEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlotDragOver = (time: Date, resourceId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ time, resourceId });
  };

  const handleSlotDrop = (time: Date, resourceId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedEvent) return;

    const originalStart = typeof draggedEvent.start === 'string' ? parseISO(draggedEvent.start) : draggedEvent.start;
    const originalEnd = typeof draggedEvent.end === 'string' ? parseISO(draggedEvent.end) : draggedEvent.end;
    const duration = differenceInMinutes(originalEnd, originalStart);
    const newEnd = addMinutes(time, duration);

    if (hasConflict(draggedEvent.id, resourceId, time, newEnd)) {
      toast.push({ message: 'Conflict: overlaps another booking', tone: 'error' });
      setDraggedEvent(null);
      return;
    }

    const arg: EventMoveArg = {
      event: {
        id: draggedEvent.id,
        start: time,
        end: newEnd,
      },
      newResource: { id: resourceId },
      revert: () => {},
    };

    onMove?.(draggedEvent, arg);
    toast.push({ message: 'Appointment moved.', tone: 'info' });
    setDraggedEvent(null);
  };

  const handleSlotClick = (time: Date, resource: SchedulerResource) => {
    if (onSelectSlot) {
      const endTime = addMinutes(time, 60); // Default 1 hour slot
      onSelectSlot({
        start: time,
        end: endTime,
        resource,
      });
    }
  };

  const renderEvent = (event: SchedulerEvent, day: Date, resource: SchedulerResource) => {
    const start = typeof event.start === 'string' ? parseISO(event.start) : event.start;
    const end = typeof event.end === 'string' ? parseISO(event.end) : event.end;

    if (!isSameDay(start, day) || event.resourceId !== resource.id) {
      return null;
    }

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const slotStartMinutes = START_HOUR * 60;
    const slotEndMinutes = END_HOUR * 60;

    if (endMinutes <= slotStartMinutes || startMinutes >= slotEndMinutes) {
      return null;
    }

    const top = Math.max(0, ((startMinutes - slotStartMinutes) / SLOT_DURATION) * SLOT_HEIGHT);
    const height = Math.max(SLOT_HEIGHT / 2, ((Math.min(endMinutes, slotEndMinutes) - Math.max(startMinutes, slotStartMinutes)) / SLOT_DURATION) * SLOT_HEIGHT);

    const statusClass = event.status === 'confirmed'
      ? 'scheduler-event-confirmed'
      : event.status === 'cancelled'
      ? 'scheduler-event-cancelled'
      : 'scheduler-event-default';

    return (
      <div
        key={event.id}
        className={`scheduler-event ${statusClass}`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
        }}
        draggable
        onDragStart={handleEventDragStart(event)}
        role="button"
        tabIndex={0}
        aria-label={`${event.title} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')} ${event.status ?? 'pending'}`}
      >
        <div className="scheduler-event-content">
          <div className="scheduler-event-title">{event.title}</div>
          <div className="scheduler-event-time">
            {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
          </div>
          <div className="scheduler-event-meta">
            <span className="scheduler-event-status">{event.status ?? 'pending'}</span>
            {event.riskScore !== undefined && event.riskScore !== null && (
              <span className="scheduler-event-risk">
                <span className={`risk-indicator ${getRiskClass(event.riskScore)}`} />
                {Math.round(event.riskScore)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isBusinessHour = (time: Date) => {
    const hour = time.getHours();
    const day = time.getDay();
    return day >= 1 && day <= 5 && hour >= BUSINESS_START && hour < BUSINESS_END;
  };

  const isCurrentTimeSlot = (time: Date) => {
    const now = new Date();
    const nextSlot = addMinutes(time, SLOT_DURATION);
    return isWithinInterval(now, { start: time, end: nextSlot });
  };

  const headerTitle = isWeekView
    ? `${format(displayDays[0], 'd MMM', { locale: ro })} - ${format(displayDays[6], 'd MMM yyyy', { locale: ro })}`
    : format(currentDate, 'd MMMM yyyy', { locale: ro });

  return (
    <div className="scheduler">
      {/* Toolbar */}
      <div className="scheduler-toolbar">
        <div className="scheduler-toolbar-left">
          <button
            className="scheduler-btn scheduler-btn-secondary"
            onClick={handlePrevious}
            aria-label="Previous period"
          >
            <i className="ti ti-chevron-left" />
          </button>
          <button
            className="scheduler-btn scheduler-btn-secondary"
            onClick={handleNext}
            aria-label="Next period"
          >
            <i className="ti ti-chevron-right" />
          </button>
          <button
            className="scheduler-btn scheduler-btn-secondary"
            onClick={handleToday}
          >
            Today
          </button>
        </div>
        <h2 className="scheduler-toolbar-title">{headerTitle}</h2>
        <div className="scheduler-toolbar-right">
          {/* View switcher handled by parent */}
        </div>
      </div>

      {/* Grid Container */}
      <div className="scheduler-container" ref={scrollContainerRef}>
        <div className="scheduler-grid">
          {/* Header Row */}
          <div className="scheduler-header-row">
            <div className="scheduler-time-header">Time</div>
            {displayDays.map((day) => (
              <div key={day.toISOString()} className="scheduler-day-header-group">
                {resources.map((resource) => (
                  <div key={resource.id} className="scheduler-resource-header">
                    <div className="scheduler-day-name">
                      {format(day, isWeekView ? 'EEE' : 'EEEE', { locale: ro })}
                    </div>
                    <div className="scheduler-day-date">
                      {format(day, isWeekView ? 'd MMM' : 'd MMMM', { locale: ro })}
                    </div>
                    <div className="scheduler-resource-name">{resource.title}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="scheduler-body">
            <div className="scheduler-time-column">
              {timeSlots.map((time, index) => (
                <div
                  key={index}
                  className="scheduler-time-slot"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                >
                  {time.getMinutes() === 0 && (
                    <span className="scheduler-time-label">
                      {format(time, 'HH:mm')}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Event Grid */}
            {displayDays.map((day) => (
              <div key={day.toISOString()} className="scheduler-day-column-group">
                {resources.map((resource) => (
                  <div key={resource.id} className="scheduler-resource-column">
                    {timeSlots.map((time, slotIndex) => {
                      const slotTime = setHours(setMinutes(day, time.getMinutes()), time.getHours());
                      const isBusinessSlot = isBusinessHour(slotTime);
                      const isCurrentSlot = isCurrentTimeSlot(slotTime);
                      const isDragOver = dragOverSlot?.time.getTime() === slotTime.getTime() &&
                                        dragOverSlot?.resourceId === resource.id;

                      return (
                        <div
                          key={slotIndex}
                          className={`scheduler-slot ${isBusinessSlot ? 'scheduler-slot-business' : ''} ${isCurrentSlot ? 'scheduler-slot-current' : ''} ${isDragOver ? 'scheduler-slot-drag-over' : ''}`}
                          style={{ height: `${SLOT_HEIGHT}px` }}
                          onClick={() => handleSlotClick(slotTime, resource)}
                          onDragOver={handleSlotDragOver(slotTime, resource.id)}
                          onDrop={handleSlotDrop(slotTime, resource.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`${format(slotTime, 'HH:mm')} ${resource.title}`}
                        />
                      );
                    })}

                    {/* Events positioned absolutely */}
                    <div className="scheduler-events-container">
                      {events.map((event) => renderEvent(event, day, resource))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRiskClass(risk: number): string {
  if (risk >= 75) return 'risk-high';
  if (risk >= 40) return 'risk-medium';
  return 'risk-low';
}
