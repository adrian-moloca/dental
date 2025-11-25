import clsx from 'clsx';
import { Badge } from '../ui/Badge';

export type AppointmentLite = {
  id: string;
  patientId: string;
  providerId?: string;
  serviceCode?: string;
  status?: string;
  start?: string | Date;
  end?: string | Date;
};

type Props = {
  appointments: AppointmentLite[];
};

const statusOrder = ['confirmed', 'pending', 'cancelled'];

export function ScheduleBoard({ appointments }: Props) {
  const grouped = statusOrder.map((status) => ({
    status,
    items: appointments.filter((a) => a.status === status || (!a.status && status === 'pending')),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {grouped.map((group) => (
        <div
          key={group.status}
          className="rounded-xl border border-[var(--border)] bg-white/5 p-4 shadow-soft"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm uppercase tracking-[0.12em] text-slate-400">{group.status}</div>
            <Badge tone={group.status === 'confirmed' ? 'success' : group.status === 'cancelled' ? 'warning' : 'neutral'}>
              {group.items.length} items
            </Badge>
          </div>
          <div className="space-y-3">
            {group.items.map((appt) => (
              <div
                key={appt.id}
                className={clsx(
                  'rounded-lg border border-[var(--border)] bg-ink-800/60 p-3 text-sm',
                  'hover:border-brand-300/50 hover:shadow-soft transition',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-semibold">Patient {appt.patientId}</span>
                  <span className="text-xs text-slate-400">
                    {appt.start ? new Date(appt.start).toLocaleTimeString() : '—'}
                  </span>
                </div>
                <div className="text-slate-300">{appt.serviceCode ?? 'Service TBD'}</div>
                <div className="text-xs text-slate-500">Provider: {appt.providerId ?? 'Unassigned'}</div>
              </div>
            ))}
            {group.items.length === 0 && (
              <div className="text-xs text-slate-500">Nothing here yet.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
