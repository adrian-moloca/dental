/**
 * Reception Queue Page - Preclinic-style
 *
 * Today's appointments with check-in workflow and status management.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAppointments,
  useCheckInAppointment,
  useStartAppointment,
  useCompleteAppointment,
  useNoShowAppointment,
} from '../hooks/useAppointments';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardBody,
  Button,
  Badge,
  StatusBadge,
  SearchInput,
} from '../components/ui-new';
import toast from 'react-hot-toast';
import { format, differenceInMinutes, isBefore } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { AppointmentStatus } from '../types/appointment.types';

type FilterStatus = AppointmentStatus | 'all';

interface StatusCount {
  all: number;
  pending: number;
  confirmed: number;
  checked_in: number;
  in_progress: number;
  completed: number;
  no_show: number;
  cancelled: number;
}

export default function ReceptionQueuePage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, isLoading, error, refetch } = useAppointments({
    startDate: today,
    endDate: tomorrow,
  });

  const checkIn = useCheckInAppointment();
  const startAppointment = useStartAppointment();
  const completeAppointment = useCompleteAppointment();
  const noShowAppointment = useNoShowAppointment();

  // Filter appointments
  const appointments = data?.data ?? [];
  const filteredAppointments = appointments.filter((apt) => {
    if (!apt) return false;
    // Status filter
    if (statusFilter !== 'all' && apt?.status !== statusFilter) {
      return false;
    }
    // Search filter (by patient ID for now)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const patientMatch = apt?.patientId?.toLowerCase().includes(searchLower);
      const serviceMatch = apt?.serviceCode?.toLowerCase().includes(searchLower);
      if (!patientMatch && !serviceMatch) return false;
    }
    return true;
  });

  // Calculate status counts
  const statusCounts: StatusCount = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    checked_in: appointments.filter((a) => a.status === 'checked_in').length,
    in_progress: appointments.filter((a) => a.status === 'in_progress').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    no_show: appointments.filter((a) => a.status === 'no_show').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  // Handlers
  const handleCheckIn = async (id: string) => {
    if (checkIn.isPending) return; // Prevent double-click
    try {
      await checkIn.mutateAsync(id);
      toast.success('Pacient inregistrat cu succes!');
    } catch {
      toast.error('Eroare la inregistrare');
    }
  };

  const handleStart = async (id: string) => {
    if (startAppointment.isPending) return; // Prevent double-click
    try {
      await startAppointment.mutateAsync(id);
      toast.success('Consultatie inceputa!');
    } catch {
      toast.error('Eroare la inceperea consultatiei');
    }
  };

  const handleComplete = async (id: string) => {
    if (completeAppointment.isPending) return; // Prevent double-click
    try {
      await completeAppointment.mutateAsync({ id });
      toast.success('Consultatie finalizata!');
    } catch {
      toast.error('Eroare la finalizarea consultatiei');
    }
  };

  const handleNoShow = async (id: string) => {
    if (noShowAppointment.isPending) return; // Prevent double-click
    try {
      await noShowAppointment.mutateAsync(id);
      toast.success('Pacient marcat ca absent');
    } catch {
      toast.error('Eroare la marcare');
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <StatusBadge status="active">Confirmat</StatusBadge>;
      case 'pending':
        return <StatusBadge status="pending">In asteptare</StatusBadge>;
      case 'checked_in':
        return <Badge variant="soft-info">Check-in</Badge>;
      case 'in_progress':
        return <Badge variant="soft-primary">In consultatie</Badge>;
      case 'completed':
        return <StatusBadge status="completed">Finalizat</StatusBadge>;
      case 'cancelled':
        return <Badge variant="soft-danger">Anulat</Badge>;
      case 'no_show':
        return <Badge variant="soft-warning">Absent</Badge>;
      default:
        return <Badge variant="soft-secondary">{status}</Badge>;
    }
  };

  const getWaitTime = (apt: typeof appointments[0]) => {
    if (apt?.status === 'checked_in' && apt?.start) {
      try {
        const now = new Date();
        const startTime = new Date(apt.start);
        if (isNaN(startTime.getTime())) return null;
        const waitMins = differenceInMinutes(now, startTime);
        if (waitMins > 0) {
          return (
            <span className={`small ${waitMins > 15 ? 'text-danger' : 'text-warning'}`}>
              <i className="ti ti-clock me-1"></i>
              Asteapta {waitMins} min
            </span>
          );
        }
      } catch {
        return null;
      }
    }
    return null;
  };

  const getTimeStatus = (apt: typeof appointments[0]) => {
    if (!apt?.start || !apt?.status) return null;

    try {
      const now = new Date();
      const startTime = new Date(apt.start);

      if (isNaN(startTime.getTime())) return null;

      if (apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show') {
        return null;
      }

      if (isBefore(startTime, now)) {
        const lateMins = differenceInMinutes(now, startTime);
        if (lateMins > 0) {
          return (
            <Badge variant="soft-danger" className="ms-2">
              -{lateMins} min
            </Badge>
          );
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  // Filter buttons config
  const filterButtons: { key: FilterStatus; label: string; icon: string }[] = [
    { key: 'all', label: 'Toate', icon: 'ti-list' },
    { key: 'pending', label: 'Asteptare', icon: 'ti-clock' },
    { key: 'confirmed', label: 'Confirmate', icon: 'ti-check' },
    { key: 'checked_in', label: 'Check-in', icon: 'ti-user-check' },
    { key: 'in_progress', label: 'In consultatie', icon: 'ti-stethoscope' },
    { key: 'completed', label: 'Finalizate', icon: 'ti-check-circle' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <AppShell
        title="Receptie"
        subtitle={`Programari pentru ${format(today, 'dd MMMM yyyy', { locale: ro })}`}
      >
        <Card className="shadow-sm">
          <CardBody>
            <div className="placeholder-glow">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="d-flex gap-3 py-3 border-bottom">
                  <span className="placeholder col-1"></span>
                  <span className="placeholder col-3"></span>
                  <span className="placeholder col-2"></span>
                  <span className="placeholder col-2"></span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  // Error state
  if (error) {
    return (
      <AppShell title="Receptie" subtitle="Programari pentru azi">
        <Card className="shadow-sm border-danger">
          <CardBody className="text-center py-5">
            <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
              <i className="ti ti-alert-circle fs-32 text-danger"></i>
            </div>
            <h5 className="fw-bold mb-2">Eroare la incarcarea programarilor</h5>
            <p className="text-muted mb-4">{(error as Error).message}</p>
            <Button variant="primary" onClick={() => refetch()}>
              <i className="ti ti-refresh me-1"></i>
              Reincearca
            </Button>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Receptie"
      subtitle={`${filteredAppointments.length} programari pentru ${format(today, 'dd MMMM yyyy', { locale: ro })}`}
      actions={
        <Button variant="primary" onClick={() => navigate('/appointments/create')}>
          <i className="ti ti-plus me-1"></i>
          Programare Noua
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <Card className="shadow-sm">
            <CardBody className="py-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar avatar-md bg-primary-transparent rounded-circle">
                  <i className="ti ti-calendar-event text-primary"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statusCounts.all}</h3>
                  <small className="text-muted">Total Azi</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-6 col-lg-3">
          <Card className="shadow-sm">
            <CardBody className="py-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar avatar-md bg-info-transparent rounded-circle">
                  <i className="ti ti-user-check text-info"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statusCounts.checked_in}</h3>
                  <small className="text-muted">Check-in</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-6 col-lg-3">
          <Card className="shadow-sm">
            <CardBody className="py-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar avatar-md bg-warning-transparent rounded-circle">
                  <i className="ti ti-stethoscope text-warning"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statusCounts.in_progress}</h3>
                  <small className="text-muted">In Consultatie</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-6 col-lg-3">
          <Card className="shadow-sm">
            <CardBody className="py-3">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar avatar-md bg-success-transparent rounded-circle">
                  <i className="ti ti-check-circle text-success"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{statusCounts.completed}</h3>
                  <small className="text-muted">Finalizate</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm mb-4">
        <CardBody className="py-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Status Filters */}
            <div className="d-flex flex-wrap gap-2">
              {filterButtons.map((btn) => (
                <Button
                  key={btn.key}
                  variant={statusFilter === btn.key ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setStatusFilter(btn.key)}
                >
                  <i className={`ti ${btn.icon} me-1`}></i>
                  {btn.label}
                  {btn.key !== 'all' && (
                    <Badge
                      variant={statusFilter === btn.key ? 'light' : 'secondary'}
                      className="ms-1"
                    >
                      {statusCounts[btn.key as keyof StatusCount]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Search */}
            <SearchInput
              placeholder="Cauta pacient sau serviciu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              style={{ minWidth: 250 }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Appointments Grid */}
      {filteredAppointments.length === 0 ? (
        <Card className="shadow-sm">
          <CardBody className="text-center py-5">
            <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
              <i className="ti ti-calendar-off fs-32 text-muted"></i>
            </div>
            <h5 className="fw-semibold mb-2">Nicio programare gasita</h5>
            <p className="text-muted mb-4">
              {statusFilter !== 'all'
                ? `Nu exista programari cu statusul: ${filterButtons.find((b) => b.key === statusFilter)?.label}`
                : 'Nu exista programari pentru azi'}
            </p>
            {statusFilter !== 'all' && (
              <Button variant="outline-secondary" onClick={() => setStatusFilter('all')}>
                <i className="ti ti-filter-off me-1"></i>
                Sterge Filtrul
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="row g-3">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="col-md-6 col-xl-4">
              <Card className="shadow-sm h-100 hover-shadow">
                <CardBody>
                  {/* Header */}
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar avatar-md bg-primary-transparent rounded-circle">
                        <span className="avatar-text text-primary fw-bold">
                          {apt.patientId?.slice(0, 2).toUpperCase() || 'PA'}
                        </span>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-semibold">
                          Pacient {apt.patientId?.slice(0, 8) || 'N/A'}
                        </h6>
                        <div className="d-flex align-items-center gap-1">
                          <small className="text-muted">{apt.serviceCode || 'Consultatie'}</small>
                          {getTimeStatus(apt)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  {/* Time Info */}
                  <div className="border rounded p-2 mb-3 bg-light">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-clock text-muted"></i>
                        <span className="fw-medium">
                          {format(new Date(apt.start), 'HH:mm')} -{' '}
                          {format(new Date(apt.end), 'HH:mm')}
                        </span>
                      </div>
                      {getWaitTime(apt)}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                    <i className="ti ti-stethoscope"></i>
                    <span>
                      {apt.providerId ? `Dr. ${apt.providerId.slice(0, 8)}` : 'Doctor nealocat'}
                    </span>
                  </div>

                  {/* Actions based on status */}
                  <div className="d-flex gap-2">
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-fill"
                          onClick={() => handleCheckIn(apt.id)}
                          loading={checkIn.isPending}
                        >
                          <i className="ti ti-user-check me-1"></i>
                          Check-in
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleNoShow(apt.id)}
                          loading={noShowAppointment.isPending}
                        >
                          <i className="ti ti-user-x"></i>
                        </Button>
                      </>
                    )}

                    {apt.status === 'checked_in' && (
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-fill"
                        onClick={() => handleStart(apt.id)}
                        loading={startAppointment.isPending}
                      >
                        <i className="ti ti-player-play me-1"></i>
                        Incepe Consultatia
                      </Button>
                    )}

                    {apt.status === 'in_progress' && (
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-fill"
                        onClick={() => handleComplete(apt.id)}
                        loading={completeAppointment.isPending}
                      >
                        <i className="ti ti-check me-1"></i>
                        Finalizeaza
                      </Button>
                    )}

                    {(apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show') && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="flex-fill"
                        onClick={() => navigate(`/patients/${apt.patientId}`)}
                      >
                        <i className="ti ti-eye me-1"></i>
                        Vezi Fisa
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
