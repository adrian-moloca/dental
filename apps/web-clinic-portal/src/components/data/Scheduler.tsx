import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, DatesSetArg, EventMountArg } from '@fullcalendar/core';
import { useToast } from '../toast/ToastProvider';

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

type Props = {
  resources: SchedulerResource[];
  events: SchedulerEvent[];
  onMove?: (event: SchedulerEvent, arg: any) => void;
  onResize?: (event: SchedulerEvent, arg: any) => void;
  onSelectSlot?: (arg: any) => void;
  onDatesChange?: (arg: DatesSetArg) => void;
  view?: 'resourceTimeGridDay' | 'resourceTimeGridWeek';
  enforceAvailability?: boolean;
};

export function Scheduler({
  resources,
  events,
  onMove,
  onResize,
  onSelectSlot,
  onDatesChange,
  view = 'resourceTimeGridWeek',
  enforceAvailability = true,
}: Props) {
  const toast = useToast();

  const hasConflict = (eventId: string, resourceId: string | undefined, start: Date, end: Date) => {
    if (!enforceAvailability) return false;
    return events.some((e) => {
      if (e.id === eventId) return false;
      if ((e.resourceId ?? 'default') !== (resourceId ?? 'default')) return false;
      const s = new Date(e.start);
      const en = new Date(e.end);
      return s < end && start < en;
    });
  };

  const handleDrop = (arg: any) => {
    const ev = events.find((e) => e.id === arg.event.id);
    if (ev) {
      const start = arg.event.start ?? new Date();
      const end = arg.event.end ?? new Date(start.getTime() + 60 * 60 * 1000);
      if (hasConflict(ev.id, arg.newResource?.id ?? ev.resourceId, start, end)) {
        arg.revert();
        toast.push({ message: 'Conflict: overlaps another booking', tone: 'error' });
        return;
      }
      onMove?.(ev, arg);
      toast.push({ message: 'Appointment moved.', tone: 'info' });
    }
  };

  const handleResize = (arg: any) => {
    const ev = events.find((e) => e.id === arg.event.id);
    if (ev) {
      const start = arg.event.start ?? new Date();
      const end = arg.event.end ?? new Date(start.getTime() + 60 * 60 * 1000);
      if (hasConflict(ev.id, arg.event.getResources()?.[0]?.id ?? ev.resourceId, start, end)) {
        arg.revert();
        toast.push({ message: 'Conflict: overlaps another booking', tone: 'error' });
        return;
      }
      onResize?.(ev, arg);
      toast.push({ message: 'Appointment resized.', tone: 'info' });
    }
  };

  const mapEvents = events.map<EventInput>((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    resourceId: e.resourceId,
    classNames: statusClass(e.status),
    extendedProps: { status: e.status, riskScore: e.riskScore },
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-white/5 shadow-soft">
      <FullCalendar
        plugins={[resourceTimeGridPlugin, interactionPlugin]}
        initialView={view}
        viewClassNames="fc-dental"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,resourceTimeGridWeek',
        }}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        nowIndicator
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '08:00',
          endTime: '19:00',
        }}
        editable
        selectable
        eventInteractive
        resourceAreaHeaderContent="Providers / Chairs"
        resources={resources}
        events={mapEvents}
        eventDrop={handleDrop}
        eventResize={handleResize}
        select={onSelectSlot}
        datesSet={onDatesChange}
        height="auto"
        eventContent={(arg) => (
          <div className="text-xs font-semibold leading-tight" aria-label={`${arg.event.title} ${arg.timeText} ${arg.event.extendedProps.status ?? 'pending'}`}>
            <div className="flex items-center justify-between">
              <span>{arg.event.title}</span>
              <span className="text-[10px] opacity-70">{arg.timeText}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-normal opacity-80">
              <span>{(arg.event.extendedProps as any).status ?? 'pending'}</span>
              {renderRisk((arg.event.extendedProps as any).riskScore)}
            </div>
          </div>
        )}
        eventDidMount={(info: EventMountArg) => {
          info.el.tabIndex = 0;
          const status = (info.event.extendedProps as any).status ?? 'pending';
          info.el.setAttribute('role', 'button');
          info.el.setAttribute('aria-label', `${info.event.title} ${info.timeText} status ${status}`);
        }}
      />
    </div>
  );
}

function renderRisk(risk?: number) {
  if (risk === undefined || risk === null) return null;
  const tone =
    risk >= 75 ? 'bg-red-500' : risk >= 40 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      <span>{Math.round(risk)}%</span>
    </span>
  );
}

function statusClass(status?: string) {
  if (status === 'confirmed') return ['fc-status-confirmed'];
  if (status === 'cancelled') return ['fc-status-cancelled'];
  return ['fc-status-default'];
}
