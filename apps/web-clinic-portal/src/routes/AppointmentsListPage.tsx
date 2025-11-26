/**
 * Appointments List Page
 */

import { Link } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScheduleBoard } from '../components/data/ScheduleBoard';
import { Scheduler } from '../components/data/Scheduler';
import { useMemo, useState } from 'react';
import { useToast } from '../components/toast/ToastProvider';
import { Modal } from '../components/overlay/Modal';
import { Input } from '../components/ui/Input';
import { useCreateAppointment } from '../hooks/useAppointments';
import { addHours } from 'date-fns';
import type { DatesSetArg } from '@fullcalendar/core';

export default function AppointmentsListPage() {
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const { data, isLoading, error } = useAppointments({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const [view, setView] = useState<'resourceTimeGridDay' | 'resourceTimeGridWeek'>('resourceTimeGridWeek');
  const [selectedProviders, setSelectedProviders] = useState<string[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ patientId: '', providerId: '', serviceCode: '', start: new Date(), end: addHours(new Date(), 1) });
  const toast = useToast();
  const createAppointment = useCreateAppointment();

  // useMemo hooks must be called before any conditional returns (React hooks rules)
  const resources = useMemo(() => buildResources(data?.data ?? []), [data?.data]);
  const filteredResources = useMemo(() => {
    if (!selectedProviders || selectedProviders.length === 0) return resources;
    return resources.filter((r) => selectedProviders.includes(r.id));
  }, [resources, selectedProviders]);
  const schedulerEvents = useMemo(
    () => buildEvents(data?.data ?? [], filteredResources),
    [data?.data, filteredResources],
  );

  if (isLoading) {
    return (
      <AppShell title="Appointments" subtitle="Checking chair availability...">
        <div className="text-slate-300">Loading appointments...</div>
      </AppShell>
    );
  }
  if (error) {
    return (
      <AppShell title="Appointments">
        <Card tone="glass" padding="lg" className="text-red-300">
          Error loading appointments: {(error as Error).message}
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Appointments"
      subtitle="Live view of confirmed and pending visits."
      actions={
        <Button as={Link} to="/appointments/create">
          Create appointment
        </Button>
      }
    >
      <FiltersBar
        resources={resources}
        selected={selectedProviders}
        onChange={setSelectedProviders}
        view={view}
        onViewChange={setView}
        onQuickCreate={() => setShowCreate(true)}
      />
      <div className="space-y-6">
        <Scheduler
          resources={filteredResources}
          events={schedulerEvents}
          view={view}
          onDatesChange={(arg: DatesSetArg) => {
            setDateRange({ start: arg.start, end: arg.end });
          }}
          onSelectSlot={(slot) => {
            setDraft({
              patientId: '',
              providerId: slot.resource?.id ?? '',
              start: slot.start ?? new Date(),
              end: slot.end ?? addHours(new Date(), 1),
              serviceCode: '',
            });
            setShowCreate(true);
          }}
          onMove={(evt) => {
            toast.push({ message: `Moved ${evt.title} (stub)`, tone: 'info' });
          }}
          onResize={(evt) => {
            toast.push({ message: `Resized ${evt.title} (stub)`, tone: 'info' });
          }}
        />
        <ScheduleBoard appointments={data?.data ?? []} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.data?.map((appointment, idx) => (
            <Card key={appointment.id} padding="lg" tone="glass" className="space-y-3 card-hover animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Patient</p>
                  <p className="text-sm font-semibold text-white">{appointment.patientId}</p>
                </div>
                <Badge tone={appointment.status === 'confirmed' ? 'success' : appointment.status === 'cancelled' ? 'warning' : 'neutral'}>
                  {appointment.status}
                </Badge>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Schedule</p>
                <p className="mt-1 text-sm text-white">
                  {new Date(appointment.start).toLocaleString()} — {new Date(appointment.end).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Service: {appointment.serviceCode}</span>
                <span className="text-slate-400">Provider: {appointment.providerId || '—'}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Quick create appointment" size="lg">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await createAppointment.mutateAsync({
                patientId: draft.patientId,
                providerId: draft.providerId,
                locationId: 'LOC-01',
                serviceCode: draft.serviceCode,
                start: draft.start,
                end: draft.end,
              });
              toast.push({ message: 'Appointment created', tone: 'success' });
              setShowCreate(false);
            } catch (err) {
              toast.push({ message: 'Failed to create (stub): ' + (err as Error).message, tone: 'error' });
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Patient ID"
              value={draft.patientId}
              onChange={(e) => setDraft({ ...draft, patientId: e.target.value })}
              required
              placeholder="PAT-001"
            />
            <Input
              label="Provider ID"
              value={draft.providerId}
              onChange={(e) => setDraft({ ...draft, providerId: e.target.value })}
              placeholder="PRV-01"
            />
            <Input
              label="Service Code"
              value={draft.serviceCode}
              onChange={(e) => setDraft({ ...draft, serviceCode: e.target.value })}
              placeholder="XRAY-101"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createAppointment.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

function buildResources(appts: NonNullable<ReturnType<typeof useAppointments>['data']>['data']) {
  const providers = new Map<string, string>();
  appts.forEach((a) => {
    if (a.providerId) {
      providers.set(a.providerId, `Provider ${a.providerId}`);
    }
  });
  if (providers.size === 0) {
    providers.set('default', 'Provider A');
  }
  return Array.from(providers.entries()).map(([id, title]) => ({ id, title }));
}

function buildEvents(
  appts: NonNullable<ReturnType<typeof useAppointments>['data']>['data'],
  resources: { id: string; title: string }[],
) {
  const resourceSet = new Set(resources.map((r) => r.id));
  return appts
    .filter((a) => !a.providerId || resourceSet.has(a.providerId))
    .map((a) => ({
    id: a.id,
    title: `Patient ${a.patientId}`,
    start: a.start,
    end: a.end,
    resourceId: a.providerId ?? 'default',
    status: a.status,
    riskScore: (a as any).riskScore,
  }));
}

type ResourceOption = { id: string; title: string };

function FiltersBar({
  resources,
  selected,
  onChange,
  view,
  onViewChange,
  onQuickCreate,
}: {
  resources: ResourceOption[];
  selected: string[] | null;
  onChange: (ids: string[] | null) => void;
  view: 'resourceTimeGridDay' | 'resourceTimeGridWeek';
  onViewChange: (v: 'resourceTimeGridDay' | 'resourceTimeGridWeek') => void;
  onQuickCreate: () => void;
}) {
  const toggle = (id: string) => {
    if (!selected || selected.length === 0) {
      onChange([id]);
      return;
    }
    if (selected.includes(id)) {
      const next = selected.filter((x) => x !== id);
      onChange(next.length ? next : null);
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-soft flex flex-wrap items-center gap-3 justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Providers</span>
        {resources.map((r) => (
          <Button
            key={r.id}
            variant={selected?.includes(r.id) ? 'primary' : 'soft'}
            size="md"
            onClick={() => toggle(r.id)}
          >
            {r.title}
          </Button>
        ))}
        {resources.length > 1 && (
          <Button variant="ghost" size="md" onClick={() => onChange(null)}>
            Clear
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'resourceTimeGridDay' ? 'primary' : 'soft'}
          size="md"
          onClick={() => onViewChange('resourceTimeGridDay')}
        >
          Day
        </Button>
        <Button
          variant={view === 'resourceTimeGridWeek' ? 'primary' : 'soft'}
          size="md"
          onClick={() => onViewChange('resourceTimeGridWeek')}
        >
          Week
        </Button>
        <Button onClick={onQuickCreate}>Quick create</Button>
      </div>
    </div>
  );
}
