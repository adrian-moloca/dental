/**
 * Appointments List Page - Preclinic-style
 *
 * Calendar view with appointments management, filters, and quick actions.
 * Now using the new Calendar component with Day, Week, and Month views.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments, useCreateAppointment } from '../hooks/useAppointments';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardBody,
  Button,
  Badge,
  StatusBadge,
  Modal,
  Input,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableActions,
  ActionButton,
  DataTableHeader,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../components/ui-new';
import { Calendar } from '../components/calendar';
import type { CalendarEvent, Resource } from '../components/calendar';
import toast from 'react-hot-toast';
import { addHours, format } from 'date-fns';
import { ro } from 'date-fns/locale';

type ViewMode = 'calendar' | 'list';
type CalendarView = 'day' | 'week' | 'month';

export default function AppointmentsListPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedProviders, setSelectedProviders] = useState<string[] | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickDraft, setQuickDraft] = useState({
    patientId: '',
    providerId: '',
    serviceCode: '',
    start: new Date(),
    end: addHours(new Date(), 1),
  });

  const { data, isLoading, error, refetch } = useAppointments({
    startDate: currentDate,
    endDate: currentDate,
  });

  const createAppointment = useCreateAppointment();

  // Build resources from appointments
  const resources = useMemo<Resource[]>(() => {
    const providers = new Map<string, string>();
    const appointments = data?.data ?? [];
    appointments.forEach((a) => {
      if (a?.providerId) {
        providers.set(a.providerId, `Dr. ${a.providerId.slice(0, 8)}`);
      }
    });
    if (providers.size === 0) {
      providers.set('default', 'Cabinet 1');
    }
    return Array.from(providers.entries()).map(([id, title]) => ({ id, title }));
  }, [data?.data]);

  // Filter resources
  const filteredResources = useMemo(() => {
    if (!selectedProviders || selectedProviders.length === 0) return resources;
    return resources.filter((r) => selectedProviders.includes(r.id));
  }, [resources, selectedProviders]);

  // Build calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const appointments = data?.data ?? [];
    return appointments.map((a) => {
      // Ensure start and end are valid dates
      const startDate = a?.start ? new Date(a.start) : new Date();
      const endDate = a?.end ? new Date(a.end) : new Date();

      // Map 'pending' to 'scheduled' for calendar compatibility
      let eventStatus: CalendarEvent['status'] = 'scheduled';
      if (a?.status) {
        if (a.status === 'pending') {
          eventStatus = 'scheduled';
        } else if (['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(a.status)) {
          eventStatus = a.status as CalendarEvent['status'];
        }
      }

      return {
        id: a?.id || '',
        title: `Pacient ${a?.patientId?.slice(0, 8) || 'N/A'}`,
        start: isNaN(startDate.getTime()) ? new Date() : startDate,
        end: isNaN(endDate.getTime()) ? new Date() : endDate,
        resourceId: a?.providerId ?? 'default',
        status: eventStatus,
        patientName: `Pacient ${a?.patientId?.slice(0, 8) || 'N/A'}`,
        providerName: a?.providerId ? `Dr. ${a.providerId.slice(0, 8)}` : undefined,
      };
    });
  }, [data?.data]);

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment.mutateAsync({
        patientId: quickDraft.patientId,
        providerId: quickDraft.providerId,
        locationId: 'LOC-01',
        serviceCode: quickDraft.serviceCode,
        start: quickDraft.start,
        end: quickDraft.end,
      });
      toast.success('Programare creata cu succes');
      setShowQuickCreate(false);
      setQuickDraft({
        patientId: '',
        providerId: '',
        serviceCode: '',
        start: new Date(),
        end: addHours(new Date(), 1),
      });
    } catch {
      toast.error('Eroare la crearea programarii');
    }
  };

  const toggleProvider = (id: string) => {
    if (!selectedProviders || selectedProviders.length === 0) {
      setSelectedProviders([id]);
      return;
    }
    if (selectedProviders.includes(id)) {
      const next = selectedProviders.filter((x) => x !== id);
      setSelectedProviders(next.length ? next : null);
    } else {
      setSelectedProviders([...selectedProviders, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <StatusBadge status="active">Confirmat</StatusBadge>;
      case 'pending':
        return <StatusBadge status="pending">In asteptare</StatusBadge>;
      case 'completed':
        return <StatusBadge status="completed">Finalizat</StatusBadge>;
      case 'cancelled':
        return <Badge variant="soft-danger">Anulat</Badge>;
      case 'no_show':
        return <Badge variant="soft-warning">Absent</Badge>;
      case 'in_progress':
        return <Badge variant="soft-info">In desfasurare</Badge>;
      default:
        return <Badge variant="soft-secondary">{status}</Badge>;
    }
  };

  const handleEventClick = (_event: CalendarEvent) => {
    navigate('/reception');
  };

  const handleSlotClick = (date: Date, resourceId?: string) => {
    setQuickDraft({
      patientId: '',
      providerId: resourceId ?? '',
      start: date,
      end: addHours(date, 1),
      serviceCode: '',
    });
    setShowQuickCreate(true);
  };

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Acasa', path: '/dashboard', icon: 'ti ti-home' },
    { label: 'Programari', path: '/appointments' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <AppShell
        title="Programari"
        subtitle="Calendar si lista programari"
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="primary" onClick={() => navigate('/appointments/create')}>
            <i className="ti ti-plus me-1"></i>
            Adauga Programare
          </Button>
        }
      >
        <Card className="shadow-sm">
          <CardBody>
            <LoadingState type="page" message="Se incarca programarile..." />
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  // Error state
  if (error) {
    return (
      <AppShell
        title="Programari"
        subtitle="Calendar si lista programari"
        breadcrumbs={breadcrumbs}
      >
        <Card className="shadow-sm border-danger">
          <CardBody>
            <ErrorState
              title="Eroare la incarcarea programarilor"
              message={(error as Error).message || 'Nu am putut incarca programarile. Va rugam incercati din nou.'}
              actions={
                <Button variant="primary" onClick={() => refetch()}>
                  <i className="ti ti-refresh me-1"></i>
                  Reincearca
                </Button>
              }
            />
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  const appointments = data?.data || [];

  return (
    <AppShell
      title="Programari"
      subtitle="Calendar si lista programari"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => setShowQuickCreate(true)}>
            <i className="ti ti-bolt me-1"></i>
            Adaugare Rapida
          </Button>
          <Button variant="primary" onClick={() => navigate('/appointments/create')}>
            <i className="ti ti-plus me-1"></i>
            Adauga Programare
          </Button>
        </div>
      }
    >
      {/* Filters Bar */}
      <Card className="shadow-sm mb-4">
        <CardBody className="py-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Provider Filters */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-muted small text-uppercase fw-medium">Doctori:</span>
              {resources.map((r) => (
                <Button
                  key={r.id}
                  variant={selectedProviders?.includes(r.id) ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => toggleProvider(r.id)}
                >
                  {r.title}
                </Button>
              ))}
              {resources.length > 1 && selectedProviders && (
                <Button variant="link" size="sm" onClick={() => setSelectedProviders(null)}>
                  <i className="ti ti-x me-1"></i>
                  Resetare
                </Button>
              )}
            </div>

            {/* View Toggle */}
            <div className="d-flex align-items-center gap-2">
              <div className="btn-group" role="group">
                <Button
                  variant={viewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <i className="ti ti-calendar me-1"></i>
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <i className="ti ti-list me-1"></i>
                  Lista
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="shadow-sm mb-4">
          <Calendar
            events={calendarEvents}
            resources={filteredResources}
            initialView={calendarView}
            initialDate={currentDate}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
            onDateChange={setCurrentDate}
            onViewChange={setCalendarView}
          />
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="shadow-sm">
          <DataTableHeader
            title="Lista Programari"
            subtitle={`${appointments.length} programari`}
            actions={
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm">
                  <i className="ti ti-filter me-1"></i>
                  Filtre
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="ti ti-download me-1"></i>
                  Export
                </Button>
              </div>
            }
          />

          <CardBody className="p-0">
            {appointments.length === 0 ? (
              <EmptyState
                icon="ti ti-calendar-off"
                title="Nicio programare"
                description="Nu exista programari in intervalul selectat. Adauga o programare noua pentru a incepe."
                action={
                  <Button variant="primary" onClick={() => navigate('/appointments/create')}>
                    <i className="ti ti-plus me-1"></i>
                    Adauga Programare
                  </Button>
                }
              />
            ) : (
              <Table hover>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Pacient</TableHeaderCell>
                    <TableHeaderCell>Data & Ora</TableHeaderCell>
                    <TableHeaderCell>Serviciu</TableHeaderCell>
                    <TableHeaderCell>Doctor</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell style={{ width: 120 }}>Actiuni</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow
                      key={apt.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/reception`)}
                    >
                      {/* Patient */}
                      <TableCell>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar avatar-sm bg-primary-transparent rounded-circle">
                            <span className="avatar-text text-primary fw-medium">
                              {apt.patientId?.slice(0, 2).toUpperCase() || 'PA'}
                            </span>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-semibold">
                              Pacient {apt.patientId?.slice(0, 8) || 'N/A'}
                            </h6>
                            <small className="text-muted">ID: {apt.id.slice(0, 8)}...</small>
                          </div>
                        </div>
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell>
                        <div>
                          <span className="fw-medium">
                            {format(new Date(apt.start), 'dd MMM yyyy', { locale: ro })}
                          </span>
                          <small className="d-block text-muted">
                            {format(new Date(apt.start), 'HH:mm')} -{' '}
                            {format(new Date(apt.end), 'HH:mm')}
                          </small>
                        </div>
                      </TableCell>

                      {/* Service */}
                      <TableCell>
                        <Badge variant="soft-info">
                          {apt.serviceCode || 'N/A'}
                        </Badge>
                      </TableCell>

                      {/* Provider */}
                      <TableCell>
                        <span className="text-muted">
                          {apt.providerId ? `Dr. ${apt.providerId.slice(0, 8)}` : 'Nealocat'}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>

                      {/* Actions */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <TableActions>
                          <ActionButton
                            icon="ti ti-eye"
                            actionType="view"
                            tooltip="Vezi detalii"
                            onClick={() => navigate(`/reception`)}
                          />
                          <ActionButton
                            icon="ti ti-edit"
                            actionType="edit"
                            tooltip="Editeaza"
                            onClick={() => navigate(`/appointments/create?edit=${apt.id}`)}
                          />
                          <ActionButton
                            icon="ti ti-check"
                            actionType="default"
                            tooltip="Check-in"
                            onClick={() => navigate(`/reception`)}
                          />
                        </TableActions>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}

      {/* Appointments Cards Grid (below calendar) */}
      {viewMode === 'calendar' && appointments.length > 0 && (
        <div className="row g-3">
          {appointments.slice(0, 6).map((apt) => (
            <div key={apt.id} className="col-sm-6 col-xl-4">
              <Card className="shadow-sm h-100 hover-shadow cursor-pointer" onClick={() => navigate('/reception')}>
                <CardBody>
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-sm bg-primary-transparent rounded-circle">
                        <span className="avatar-text text-primary fw-medium">
                          {apt.patientId?.slice(0, 2).toUpperCase() || 'PA'}
                        </span>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-semibold">Pacient {apt.patientId?.slice(0, 8)}</h6>
                        <small className="text-muted">{apt.serviceCode || 'Consultatie'}</small>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                    <i className="ti ti-calendar"></i>
                    <span>{format(new Date(apt.start), 'dd MMM yyyy, HH:mm', { locale: ro })}</span>
                  </div>

                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <i className="ti ti-user"></i>
                    <span>{apt.providerId ? `Dr. ${apt.providerId.slice(0, 8)}` : 'Nealocat'}</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Quick Create Modal */}
      <Modal
        open={showQuickCreate}
        onClose={() => setShowQuickCreate(false)}
        title="Creare Rapida Programare"
        size="md"
      >
        <form onSubmit={handleQuickCreate}>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Input
                label="ID Pacient"
                value={quickDraft.patientId}
                onChange={(e) => setQuickDraft({ ...quickDraft, patientId: e.target.value })}
                required
                placeholder="PAT-001"
                icon="ti ti-user"
              />
            </div>
            <div className="col-md-6">
              <Input
                label="ID Doctor"
                value={quickDraft.providerId}
                onChange={(e) => setQuickDraft({ ...quickDraft, providerId: e.target.value })}
                placeholder="PRV-001"
                icon="ti ti-stethoscope"
              />
            </div>
            <div className="col-12">
              <Input
                label="Cod Serviciu"
                value={quickDraft.serviceCode}
                onChange={(e) => setQuickDraft({ ...quickDraft, serviceCode: e.target.value })}
                required
                placeholder="CONSULTATIE"
                icon="ti ti-dental"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Data si Ora Inceput</label>
              <input
                type="datetime-local"
                className="form-control"
                value={quickDraft.start ? format(quickDraft.start, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setQuickDraft({ ...quickDraft, start: newDate });
                  }
                }}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Data si Ora Sfarsit</label>
              <input
                type="datetime-local"
                className="form-control"
                value={quickDraft.end ? format(quickDraft.end, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setQuickDraft({ ...quickDraft, end: newDate });
                  }
                }}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => setShowQuickCreate(false)}
            >
              Anuleaza
            </Button>
            <Button type="submit" variant="primary" loading={createAppointment.isPending}>
              {createAppointment.isPending ? 'Se salveaza...' : 'Salveaza'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
