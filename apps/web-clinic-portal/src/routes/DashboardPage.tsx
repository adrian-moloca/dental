/**
 * Dashboard Page - Enhanced World-Class Admin Dashboard
 *
 * Overview and key metrics for the dental clinic with complete KPIs,
 * today's schedule, quick actions, activity feed, alerts, and charts.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  useTotalPatientsCount,
  useTodaysAppointments,
  useOutstandingBalance,
  useLowStockItems,
} from '../hooks/useDashboardStats';
import { Card, CardHeader, CardBody, Button, Badge } from '../components/ui-new';

// Mock data for enhanced features
const MOCK_DASHBOARD_DATA = {
  kpis: {
    todayAppointments: { count: 12, trend: 8 }, // +8% vs yesterday
    newPatientsThisMonth: { count: 24, trend: 15 }, // +15% vs last month
    monthlyRevenue: { amount: 45230, trend: -3 }, // -3% vs last month
    occupancyRate: { percentage: 87, trend: 5 }, // +5% vs last week
  },
  todaySchedule: [
    {
      id: '1',
      patientName: 'Maria Popescu',
      time: '09:00',
      duration: 30,
      procedureType: 'Consultatie Initiala',
      provider: 'Dr. Ionescu',
      status: 'checked_in' as const,
      canCheckIn: false,
      canStart: true,
      canComplete: false,
    },
    {
      id: '2',
      patientName: 'Ion Georgescu',
      time: '09:30',
      duration: 60,
      procedureType: 'Tratament Canal',
      provider: 'Dr. Marinescu',
      status: 'confirmed' as const,
      canCheckIn: true,
      canStart: false,
      canComplete: false,
    },
    {
      id: '3',
      patientName: 'Elena Dumitrescu',
      time: '10:30',
      duration: 45,
      procedureType: 'Detartraj + Periaj Profesional',
      provider: 'Ig. Popa',
      status: 'scheduled' as const,
      canCheckIn: false,
      canStart: false,
      canComplete: false,
    },
    {
      id: '4',
      patientName: 'Andrei Stancu',
      time: '11:30',
      duration: 90,
      procedureType: 'Implant Dentar',
      provider: 'Dr. Ionescu',
      status: 'in_progress' as const,
      canCheckIn: false,
      canStart: false,
      canComplete: true,
    },
    {
      id: '5',
      patientName: 'Cristina Radu',
      time: '14:00',
      duration: 30,
      procedureType: 'Control Post-Tratament',
      provider: 'Dr. Marinescu',
      status: 'completed' as const,
      canCheckIn: false,
      canStart: false,
      canComplete: false,
    },
  ],
  recentActivity: [
    {
      id: '1',
      type: 'payment',
      title: 'Plata primita',
      description: 'Maria Popescu - 850 RON',
      time: 'Acum 5 minute',
      icon: 'ti ti-cash',
      color: 'success',
    },
    {
      id: '2',
      type: 'appointment',
      title: 'Programare confirmata',
      description: 'Ion Georgescu - Tratament Canal',
      time: 'Acum 12 minute',
      icon: 'ti ti-calendar-check',
      color: 'primary',
    },
    {
      id: '3',
      type: 'patient',
      title: 'Pacient nou inregistrat',
      description: 'Alexandru Popa',
      time: 'Acum 25 minute',
      icon: 'ti ti-user-plus',
      color: 'info',
    },
    {
      id: '4',
      type: 'note',
      title: 'Nota clinica adaugata',
      description: 'Elena Dumitrescu - Consultatie',
      time: 'Acum 45 minute',
      icon: 'ti ti-file-text',
      color: 'secondary',
    },
    {
      id: '5',
      type: 'invoice',
      title: 'Factura emisa',
      description: 'Factura #INV-2025-00234 - 1,250 RON',
      time: 'Acum 1 ora',
      icon: 'ti ti-file-invoice',
      color: 'warning',
    },
    {
      id: '6',
      type: 'appointment',
      title: 'Programare finalizata',
      description: 'Cristina Radu - Control',
      time: 'Acum 2 ore',
      icon: 'ti ti-check',
      color: 'success',
    },
  ],
  alerts: [
    {
      id: '1',
      type: 'inventory',
      severity: 'high',
      title: 'Stoc scazut - Compozit A2',
      description: 'Doar 2 unitati ramase',
      action: '/inventory?filter=low-stock',
      actionLabel: 'Vezi Detalii',
      icon: 'ti ti-alert-triangle',
    },
    {
      id: '2',
      type: 'birthday',
      severity: 'low',
      title: '3 pacienti au ziua de nastere saptamana aceasta',
      description: 'Maria Popescu (28 Nov), Ion Georgescu (29 Nov), Elena Dumitrescu (1 Dec)',
      action: '/patients?filter=birthday-week',
      actionLabel: 'Trimite Felicitari',
      icon: 'ti ti-cake',
    },
    {
      id: '3',
      type: 'payment',
      severity: 'medium',
      title: '5 facturi restante',
      description: 'Total restant: 3,450 RON',
      action: '/billing?status=overdue',
      actionLabel: 'Vezi Facturi',
      icon: 'ti ti-coin',
    },
    {
      id: '4',
      type: 'recall',
      severity: 'medium',
      title: '12 pacienti necesita recall',
      description: 'Control periodic sau detartraj',
      action: '/patients?filter=recall-due',
      actionLabel: 'Contacteaza Pacienti',
      icon: 'ti ti-bell',
    },
  ],
  weeklyAppointments: [
    { day: 'Lun', count: 14 },
    { day: 'Mar', count: 18 },
    { day: 'Mie', count: 12 },
    { day: 'Joi', count: 20 },
    { day: 'Vin', count: 16 },
    { day: 'Sam', count: 8 },
    { day: 'Dum', count: 0 },
  ],
  weeklyRevenue: {
    thisWeek: 12450,
    lastWeek: 11200,
  },
};

// Loading skeleton component
function StatSkeleton() {
  return (
    <div className="placeholder-glow">
      <span className="placeholder col-6 mb-2" style={{ height: 20 }}></span>
      <span className="placeholder col-8" style={{ height: 32 }}></span>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: string;
  color: string;
  loading?: boolean;
  onClick?: () => void;
}

function KPICard({ title, value, trend, icon, color, loading, onClick }: KPICardProps) {
  const trendPositive = trend !== undefined && trend >= 0;
  const trendIcon = trendPositive ? 'ti ti-trending-up' : 'ti ti-trending-down';
  const trendColor = trendPositive ? 'text-success' : 'text-danger';

  return (
    <div
      className={`card border shadow-sm ${onClick ? 'cursor-pointer hover-shadow' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Vezi detalii pentru ${title}` : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className={`avatar bg-${color} bg-opacity-10 rounded-2`} aria-hidden="true">
            <i className={`${icon} fs-24 text-${color}`}></i>
          </div>
          {trend !== undefined && (
            <span className={`badge badge-soft-${trendPositive ? 'success' : 'danger'}`}>
              <i className={`${trendIcon} fs-12`} aria-hidden="true"></i>
              <span className="ms-1" aria-label={`Tendinta ${trendPositive ? 'pozitiva' : 'negativa'} ${Math.abs(trend)} procente`}>
                {Math.abs(trend)}%
              </span>
            </span>
          )}
        </div>
        <p className="text-muted mb-2 fs-14">{title}</p>
        {loading ? (
          <StatSkeleton />
        ) : (
          <h3 className="fw-bold mb-0">{value}</h3>
        )}
      </div>
    </div>
  );
}

// Appointment Status Badge
interface AppointmentStatusBadgeProps {
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed';
}

function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const statusConfig = {
    scheduled: { label: 'Programat', variant: 'soft-secondary' as const },
    confirmed: { label: 'Confirmat', variant: 'soft-info' as const },
    checked_in: { label: 'Prezent', variant: 'soft-primary' as const },
    in_progress: { label: 'In desfasurare', variant: 'soft-warning' as const },
    completed: { label: 'Finalizat', variant: 'soft-success' as const },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Simple Chart Component
interface SimpleBarChartProps {
  data: Array<{ day: string; count: number }>;
}

function SimpleBarChart({ data }: SimpleBarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="d-flex align-items-end gap-2" style={{ height: 160 }}>
      {data.map((item) => {
        const heightPercentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        return (
          <div key={item.day} className="flex-fill text-center">
            <div className="d-flex flex-column align-items-center justify-content-end" style={{ height: 140 }}>
              <div
                className="w-100 bg-primary bg-opacity-75 rounded-top position-relative"
                style={{
                  height: `${heightPercentage}%`,
                  minHeight: item.count > 0 ? '4px' : '0',
                }}
                title={`${item.count} programari`}
              >
                <span className="position-absolute top-0 start-50 translate-middle-x text-white fw-semibold fs-12">
                  {item.count > 0 ? item.count : ''}
                </span>
              </div>
            </div>
            <div className="mt-2 fs-12 text-muted fw-medium">{item.day}</div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Fetch real data from APIs
  const {
    data: patientsCount,
    isLoading: patientsLoading,
    isError: patientsError,
    refetch: refetchPatients,
  } = useTotalPatientsCount();

  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    refetch: refetchAppointments,
  } = useTodaysAppointments();

  const {
    data: balanceData,
    isLoading: balanceLoading,
    isError: balanceError,
    refetch: refetchBalance,
  } = useOutstandingBalance();

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    isError: inventoryError,
    refetch: refetchInventory,
  } = useLowStockItems();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle appointment actions
  const handleCheckIn = (appointmentId: string) => {
    console.log('Check in appointment:', appointmentId);
    // TODO: Implement check-in logic
  };

  const handleStartAppointment = (appointmentId: string) => {
    console.log('Start appointment:', appointmentId);
    // TODO: Implement start logic
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    console.log('Complete appointment:', appointmentId);
    // TODO: Implement complete logic
  };

  const handleReschedule = (appointmentId: string) => {
    console.log('Reschedule appointment:', appointmentId);
    navigate(`/appointments/${appointmentId}/reschedule`);
  };

  return (
    <div className="content">
      {/* Page Header */}
      <div className="d-flex align-items-sm-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">
            Bine ai venit, {user?.firstName || 'Doctor'}!
          </h1>
          <p className="text-muted mb-0">
            {new Date().toLocaleDateString('ro-RO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/appointments/create')}
          >
            <i className="ti ti-plus me-2"></i>
            Programare Noua
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/patients/new')}
          >
            <i className="ti ti-user-plus me-2"></i>
            Pacient Nou
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <KPICard
            title="Programari Azi"
            value={appointmentsData?.total || MOCK_DASHBOARD_DATA.kpis.todayAppointments.count}
            trend={MOCK_DASHBOARD_DATA.kpis.todayAppointments.trend}
            icon="ti ti-calendar-event"
            color="primary"
            loading={appointmentsLoading}
            onClick={() => navigate('/appointments')}
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPICard
            title="Pacienti Noi Luna Aceasta"
            value={MOCK_DASHBOARD_DATA.kpis.newPatientsThisMonth.count}
            trend={MOCK_DASHBOARD_DATA.kpis.newPatientsThisMonth.trend}
            icon="ti ti-user-plus"
            color="success"
            onClick={() => navigate('/patients?filter=new-this-month')}
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPICard
            title="Venituri Luna"
            value={formatCurrency(MOCK_DASHBOARD_DATA.kpis.monthlyRevenue.amount)}
            trend={MOCK_DASHBOARD_DATA.kpis.monthlyRevenue.trend}
            icon="ti ti-coin"
            color="info"
            onClick={() => navigate('/billing')}
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <KPICard
            title="Rata Ocupare"
            value={`${MOCK_DASHBOARD_DATA.kpis.occupancyRate.percentage}%`}
            trend={MOCK_DASHBOARD_DATA.kpis.occupancyRate.trend}
            icon="ti ti-chart-line"
            color="warning"
          />
        </div>
      </div>

      {/* Main Content Row */}
      <div className="row g-4">
        {/* Left Column - Schedule & Actions */}
        <div className="col-xl-8">
          {/* Today's Schedule */}
          <Card className="shadow-sm mb-4">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h2 className="h5 fw-bold mb-0">Agenda de Azi</h2>
              <Link to="/appointments" className="btn btn-outline-primary btn-sm">
                <i className="ti ti-calendar me-1"></i>
                Vezi Toate
              </Link>
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ora</th>
                      <th>Pacient</th>
                      <th>Procedura</th>
                      <th>Doctor</th>
                      <th>Status</th>
                      <th className="text-end">Actiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_DASHBOARD_DATA.todaySchedule.map((appt) => (
                      <tr key={appt.id}>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-semibold text-primary">{appt.time}</span>
                            <span className="fs-12 text-muted">{appt.duration} min</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2 bg-primary bg-opacity-10 rounded-circle">
                              <span className="avatar-text text-primary fw-semibold">
                                {appt.patientName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </span>
                            </div>
                            <span className="fw-medium">{appt.patientName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-dark">{appt.procedureType}</span>
                        </td>
                        <td>
                          <span className="text-muted">{appt.provider}</span>
                        </td>
                        <td>
                          <AppointmentStatusBadge status={appt.status} />
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end">
                            {appt.canCheckIn && (
                              <button
                                className="btn btn-sm btn-soft-success"
                                onClick={() => handleCheckIn(appt.id)}
                                aria-label={`Check-in pacient ${appt.patientName}`}
                                title="Check-in"
                              >
                                <i className="ti ti-login" aria-hidden="true"></i>
                              </button>
                            )}
                            {appt.canStart && (
                              <button
                                className="btn btn-sm btn-soft-primary"
                                onClick={() => handleStartAppointment(appt.id)}
                                aria-label={`Incepe tratament pentru ${appt.patientName}`}
                                title="Incepe tratament"
                              >
                                <i className="ti ti-player-play" aria-hidden="true"></i>
                              </button>
                            )}
                            {appt.canComplete && (
                              <button
                                className="btn btn-sm btn-soft-warning"
                                onClick={() => handleCompleteAppointment(appt.id)}
                                aria-label={`Finalizeaza tratament pentru ${appt.patientName}`}
                                title="Finalizeaza"
                              >
                                <i className="ti ti-check" aria-hidden="true"></i>
                              </button>
                            )}
                            {appt.status !== 'completed' && (
                              <button
                                className="btn btn-sm btn-soft-secondary"
                                onClick={() => handleReschedule(appt.id)}
                                aria-label={`Reprogrameaza pentru ${appt.patientName}`}
                                title="Reprogrameaza"
                              >
                                <i className="ti ti-calendar-time" aria-hidden="true"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {MOCK_DASHBOARD_DATA.todaySchedule.length === 0 && (
                <div className="text-center py-5">
                  <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
                    <i className="ti ti-calendar-off fs-48 text-muted"></i>
                  </div>
                  <h6 className="fw-semibold mb-2">Nicio programare pentru azi</h6>
                  <p className="text-muted mb-4 small">
                    Incepe ziua adaugand prima programare sau verifica programarile viitoare
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/appointments/create')}
                    >
                      <i className="ti ti-plus me-1"></i>
                      Adauga Programare
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => navigate('/appointments')}
                    >
                      <i className="ti ti-calendar me-1"></i>
                      Vezi Calendarul
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="shadow-sm mb-4">
            <CardHeader>
              <h2 className="h5 fw-bold mb-0">Actiuni Rapide</h2>
            </CardHeader>
            <CardBody>
              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-shadow border"
                    onClick={() => navigate('/appointments/create')}
                  >
                    <div className="avatar avatar-lg bg-primary bg-opacity-10 rounded-circle">
                      <i className="ti ti-calendar-plus fs-24 text-primary"></i>
                    </div>
                    <span className="fw-medium">Programare Noua</span>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-shadow border"
                    onClick={() => navigate('/patients/new')}
                  >
                    <div className="avatar avatar-lg bg-success bg-opacity-10 rounded-circle">
                      <i className="ti ti-user-plus fs-24 text-success"></i>
                    </div>
                    <span className="fw-medium">Pacient Nou</span>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-shadow border"
                    onClick={() => navigate('/billing/invoices/new')}
                  >
                    <div className="avatar avatar-lg bg-info bg-opacity-10 rounded-circle">
                      <i className="ti ti-file-invoice fs-24 text-info"></i>
                    </div>
                    <span className="fw-medium">Factura Noua</span>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-shadow border"
                    onClick={() => navigate('/clinical/notes/new')}
                  >
                    <div className="avatar avatar-lg bg-warning bg-opacity-10 rounded-circle">
                      <i className="ti ti-file-text fs-24 text-warning"></i>
                    </div>
                    <span className="fw-medium">Nota Clinica</span>
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Charts */}
          <Card className="shadow-sm">
            <CardHeader>
              <h2 className="h5 fw-bold mb-0">Statistici Saptamanale</h2>
            </CardHeader>
            <CardBody>
              <div className="row">
                {/* Weekly Appointments Chart */}
                <div className="col-md-7 mb-4 mb-md-0">
                  <h6 className="text-muted mb-3 fs-14 fw-semibold">Programari pe Saptamana</h6>
                  <SimpleBarChart data={MOCK_DASHBOARD_DATA.weeklyAppointments} />
                </div>

                {/* Revenue Comparison */}
                <div className="col-md-5">
                  <h6 className="text-muted mb-3 fs-14 fw-semibold">Venituri</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                      <div>
                        <div className="text-muted fs-12 mb-1">Saptamana Aceasta</div>
                        <div className="fw-bold fs-20">
                          {formatCurrency(MOCK_DASHBOARD_DATA.weeklyRevenue.thisWeek)}
                        </div>
                      </div>
                      <div className="avatar bg-success bg-opacity-10 rounded-circle">
                        <i className="ti ti-trending-up fs-24 text-success"></i>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                      <div>
                        <div className="text-muted fs-12 mb-1">Saptamana Trecuta</div>
                        <div className="fw-bold fs-20">
                          {formatCurrency(MOCK_DASHBOARD_DATA.weeklyRevenue.lastWeek)}
                        </div>
                      </div>
                      <div className="avatar bg-secondary bg-opacity-10 rounded-circle">
                        <i className="ti ti-coin fs-24 text-secondary"></i>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant="soft-success">
                        <i className="ti ti-arrow-up me-1"></i>
                        +{Math.round(((MOCK_DASHBOARD_DATA.weeklyRevenue.thisWeek - MOCK_DASHBOARD_DATA.weeklyRevenue.lastWeek) / MOCK_DASHBOARD_DATA.weeklyRevenue.lastWeek) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Activity & Alerts */}
        <div className="col-xl-4">
          {/* Alerts/Notifications Section */}
          <Card className="shadow-sm mb-4">
            <CardHeader className="bg-warning bg-opacity-10">
              <h2 className="h5 fw-bold mb-0 text-warning">
                <i className="ti ti-bell-ringing me-2" aria-hidden="true"></i>
                Alerte si Notificari
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="list-group list-group-flush">
                {MOCK_DASHBOARD_DATA.alerts.map((alert) => (
                  <div key={alert.id} className="list-group-item">
                    <div className="d-flex gap-3">
                      <div
                        className={`avatar avatar-sm flex-shrink-0 rounded-circle ${
                          alert.severity === 'high'
                            ? 'bg-danger bg-opacity-10'
                            : alert.severity === 'medium'
                            ? 'bg-warning bg-opacity-10'
                            : 'bg-info bg-opacity-10'
                        }`}
                      >
                        <i
                          className={`${alert.icon} ${
                            alert.severity === 'high'
                              ? 'text-danger'
                              : alert.severity === 'medium'
                              ? 'text-warning'
                              : 'text-info'
                          }`}
                        ></i>
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <p className="mb-1 fw-semibold fs-14">{alert.title}</p>
                        <p className="mb-2 text-muted fs-13">{alert.description}</p>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(alert.action)}
                        >
                          {alert.actionLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="shadow-sm mb-4">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h2 className="h5 fw-bold mb-0">Activitate Recenta</h2>
              <button className="btn btn-link btn-sm text-decoration-none p-0" aria-label="Vezi toate activitatile">
                Vezi Tot
              </button>
            </CardHeader>
            <CardBody>
              <div className="activity-feed">
                {MOCK_DASHBOARD_DATA.recentActivity.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className={`d-flex gap-3 ${
                      idx < MOCK_DASHBOARD_DATA.recentActivity.length - 1
                        ? 'mb-3 pb-3 border-bottom'
                        : ''
                    }`}
                  >
                    <div
                      className={`avatar avatar-sm bg-${activity.color} bg-opacity-10 rounded-circle flex-shrink-0`}
                    >
                      <i className={`${activity.icon} text-${activity.color}`}></i>
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <p className="mb-1 fw-medium text-truncate fs-14">
                        {activity.title}
                      </p>
                      <p className="mb-1 text-muted fs-13 text-truncate">
                        {activity.description}
                      </p>
                      <small className="text-muted fs-12">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Performance Metrics */}
          <Card className="shadow-sm">
            <CardHeader>
              <h2 className="h5 fw-bold mb-0">Performanta Saptamana</h2>
            </CardHeader>
            <CardBody>
              {/* Appointment Rate */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fs-14">Rata Prezenta</span>
                  <span className="fw-bold">94%</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: '94%' }}
                    role="progressbar"
                    aria-valuenow={94}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              {/* Collection Rate */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fs-14">Rata Incasare</span>
                  <span className="fw-bold">87%</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: '87%' }}
                    role="progressbar"
                    aria-valuenow={87}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              {/* Patient Satisfaction */}
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fs-14">Satisfactie Pacienti</span>
                  <span className="fw-bold">4.8/5</span>
                </div>
                <div className="d-flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`ti ti-star-filled fs-20 ${
                        star <= 4 ? 'text-warning' : 'text-muted'
                      }`}
                    ></i>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
