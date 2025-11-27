/**
 * Dashboard Page - Preclinic-style Admin Dashboard
 *
 * Overview and key metrics for the dental clinic.
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

// Loading skeleton component
function StatSkeleton() {
  return (
    <div className="placeholder-glow">
      <span className="placeholder col-6 mb-2" style={{ height: 20 }}></span>
      <span className="placeholder col-8" style={{ height: 32 }}></span>
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
  const formatCurrency = (amount: number, currency: string = 'RON') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ro-RO').format(num);
  };

  // Mock data for demo sections (will be replaced with real data)
  const upcomingAppointments = [
    {
      id: '1',
      patient: 'Maria Popescu',
      time: '09:00',
      type: 'Consultatie',
      provider: 'Dr. Ionescu',
      status: 'confirmed',
    },
    {
      id: '2',
      patient: 'Ion Georgescu',
      time: '10:30',
      type: 'Tratament Canal',
      provider: 'Dr. Marinescu',
      status: 'pending',
    },
    {
      id: '3',
      patient: 'Elena Dumitrescu',
      time: '14:00',
      type: 'Detartraj',
      provider: 'Dr. Ionescu',
      status: 'confirmed',
    },
  ];

  const recentActivity = [
    {
      type: 'appointment',
      title: 'Programare finalizata',
      description: 'Maria Popescu - Consultatie',
      time: 'Acum 10 minute',
      icon: 'ti ti-check',
      color: 'success',
    },
    {
      type: 'payment',
      title: 'Plata primita',
      description: '450 RON de la Ion Georgescu',
      time: 'Acum 25 minute',
      icon: 'ti ti-cash',
      color: 'primary',
    },
    {
      type: 'patient',
      title: 'Pacient nou inregistrat',
      description: 'Alexandru Popa',
      time: 'Acum 1 ora',
      icon: 'ti ti-user-plus',
      color: 'info',
    },
    {
      type: 'inventory',
      title: 'Alerta stoc scazut',
      description: 'Compozit A2 - 2 unitati ramase',
      time: 'Acum 2 ore',
      icon: 'ti ti-alert-triangle',
      color: 'warning',
    },
  ];

  return (
    <div className="content">
      {/* Page Header */}
      <div className="d-flex align-items-sm-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            Bine ai venit, {user?.firstName || 'Doctor'}!
          </h4>
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
            <i className="ti ti-plus me-1"></i>
            Programare Noua
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/patients/new')}
          >
            <i className="ti ti-user-plus me-1"></i>
            Pacient Nou
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row">
        {/* Total Patients */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border shadow-sm cursor-pointer hover-shadow"
            onClick={() => !patientsLoading && navigate('/patients')}
            role="button"
            tabIndex={0}
          >
            <div className="card-body">
              <div className="d-flex align-items-center mb-2 justify-content-between">
                <span className="avatar bg-primary rounded-circle">
                  <i className="ti ti-users fs-24"></i>
                </span>
                <div className="text-end">
                  <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-success">
                    Activi
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Total Pacienti</p>
                  {patientsLoading ? (
                    <StatSkeleton />
                  ) : patientsError ? (
                    <div>
                      <h3 className="fw-bold mb-0 text-danger">Eroare</h3>
                      <button
                        className="btn btn-link btn-sm p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          refetchPatients();
                        }}
                      >
                        Reincearca
                      </button>
                    </div>
                  ) : (
                    <h3 className="fw-bold mb-0">
                      {formatNumber(patientsCount || 0)}
                    </h3>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border shadow-sm cursor-pointer hover-shadow"
            onClick={() => !appointmentsLoading && navigate('/appointments')}
            role="button"
            tabIndex={0}
          >
            <div className="card-body">
              <div className="d-flex align-items-center mb-2 justify-content-between">
                <span className="avatar bg-info rounded-circle">
                  <i className="ti ti-calendar-event fs-24"></i>
                </span>
                <div className="text-end">
                  {appointmentsData?.pending ? (
                    <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-warning">
                      {appointmentsData.pending} de confirmat
                    </span>
                  ) : (
                    <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-success">
                      Confirmate
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Programari Azi</p>
                  {appointmentsLoading ? (
                    <StatSkeleton />
                  ) : appointmentsError ? (
                    <div>
                      <h3 className="fw-bold mb-0 text-danger">Eroare</h3>
                      <button
                        className="btn btn-link btn-sm p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          refetchAppointments();
                        }}
                      >
                        Reincearca
                      </button>
                    </div>
                  ) : (
                    <h3 className="fw-bold mb-0">{appointmentsData?.total || 0}</h3>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border shadow-sm cursor-pointer hover-shadow"
            onClick={() => !balanceLoading && navigate('/billing')}
            role="button"
            tabIndex={0}
          >
            <div className="card-body">
              <div className="d-flex align-items-center mb-2 justify-content-between">
                <span className="avatar bg-success rounded-circle">
                  <i className="ti ti-currency-dollar fs-24"></i>
                </span>
                <div className="text-end">
                  {balanceData?.overdueCount ? (
                    <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-danger">
                      {balanceData.overdueCount} restante
                    </span>
                  ) : (
                    <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-success">
                      La zi
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Sold Restant</p>
                  {balanceLoading ? (
                    <StatSkeleton />
                  ) : balanceError ? (
                    <div>
                      <h3 className="fw-bold mb-0 text-danger">Eroare</h3>
                      <button
                        className="btn btn-link btn-sm p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          refetchBalance();
                        }}
                      >
                        Reincearca
                      </button>
                    </div>
                  ) : (
                    <h3 className="fw-bold mb-0">
                      {formatCurrency(balanceData?.total || 0, balanceData?.currency)}
                    </h3>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border shadow-sm cursor-pointer hover-shadow"
            onClick={() => !inventoryLoading && navigate('/inventory')}
            role="button"
            tabIndex={0}
          >
            <div className="card-body">
              <div className="d-flex align-items-center mb-2 justify-content-between">
                <span className="avatar bg-danger rounded-circle">
                  <i className="ti ti-package fs-24"></i>
                </span>
                <div className="text-end">
                  {inventoryData?.criticalCount ? (
                    <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-danger">
                      {inventoryData.criticalCount} critice
                    </span>
                  ) : inventoryData?.count ? (
                    <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-warning">
                      Atentie
                    </span>
                  ) : (
                    <span className="badge px-2 py-1 fs-12 fw-medium d-inline-flex mb-1 bg-success">
                      OK
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-muted">Stoc Scazut</p>
                  {inventoryLoading ? (
                    <StatSkeleton />
                  ) : inventoryError ? (
                    <div>
                      <h3 className="fw-bold mb-0 text-danger">Eroare</h3>
                      <button
                        className="btn btn-link btn-sm p-0 text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          refetchInventory();
                        }}
                      >
                        Reincearca
                      </button>
                    </div>
                  ) : (
                    <h3 className="fw-bold mb-0">{inventoryData?.count || 0}</h3>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="row">
        {/* Upcoming Appointments */}
        <div className="col-xl-8">
          <Card className="shadow-sm">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h5 className="fw-bold mb-0">Programari de Azi</h5>
              <Link to="/appointments" className="btn btn-outline-primary btn-sm">
                Vezi Toate
              </Link>
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ora</th>
                      <th>Pacient</th>
                      <th>Procedura</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((appt) => (
                      <tr key={appt.id} className="cursor-pointer">
                        <td>
                          <span className="fw-semibold text-primary">
                            {appt.time}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2 bg-primary-transparent rounded-circle">
                              <span className="avatar-text">
                                {appt.patient
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </span>
                            </div>
                            <span className="fw-medium">{appt.patient}</span>
                          </div>
                        </td>
                        <td>{appt.type}</td>
                        <td>{appt.provider}</td>
                        <td>
                          <Badge
                            variant={
                              appt.status === 'confirmed' ? 'soft-success' : 'soft-warning'
                            }
                          >
                            {appt.status === 'confirmed'
                              ? 'Confirmat'
                              : 'In asteptare'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {upcomingAppointments.length === 0 && (
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

          {/* Quick Actions */}
          <Card className="shadow-sm mt-4">
            <CardHeader>
              <h5 className="fw-bold mb-0">Actiuni Rapide</h5>
            </CardHeader>
            <CardBody>
              <div className="row g-3">
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-primary"
                    onClick={() => navigate('/patients/new')}
                  >
                    <div className="avatar avatar-lg bg-primary-transparent rounded-circle">
                      <i className="ti ti-user-plus fs-24 text-primary"></i>
                    </div>
                    <span className="fw-medium">Pacient Nou</span>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-primary"
                    onClick={() => navigate('/appointments/create')}
                  >
                    <div className="avatar avatar-lg bg-info-transparent rounded-circle">
                      <i className="ti ti-calendar-plus fs-24 text-info"></i>
                    </div>
                    <span className="fw-medium">Programare</span>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-primary"
                    onClick={() => navigate('/billing/invoices/new')}
                  >
                    <div className="avatar avatar-lg bg-success-transparent rounded-circle">
                      <i className="ti ti-file-invoice fs-24 text-success"></i>
                    </div>
                    <span className="fw-medium">Factura Noua</span>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className="btn btn-light w-100 h-100 py-4 d-flex flex-column align-items-center gap-2 hover-primary"
                    onClick={() => navigate('/clinical/treatments')}
                  >
                    <div className="avatar avatar-lg bg-warning-transparent rounded-circle">
                      <i className="ti ti-dental fs-24 text-warning"></i>
                    </div>
                    <span className="fw-medium">Plan Tratament</span>
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="col-xl-4">
          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <h5 className="fw-bold mb-0">Activitate Recenta</h5>
            </CardHeader>
            <CardBody>
              <div className="activity-feed">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className={`d-flex gap-3 ${
                      idx < recentActivity.length - 1 ? 'mb-3 pb-3 border-bottom' : ''
                    }`}
                  >
                    <div
                      className={`avatar avatar-sm bg-${activity.color}-transparent rounded-circle flex-shrink-0`}
                    >
                      <i className={`${activity.icon} text-${activity.color}`}></i>
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <p className="mb-1 fw-medium text-truncate">
                        {activity.title}
                      </p>
                      <p className="mb-1 text-muted small text-truncate">
                        {activity.description}
                      </p>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Performance Metrics */}
          <Card className="shadow-sm mt-4">
            <CardHeader>
              <h5 className="fw-bold mb-0">Performanta Saptamana</h5>
            </CardHeader>
            <CardBody>
              {/* Appointment Rate */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Rata Prezenta</span>
                  <span className="fw-bold">94%</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: '94%' }}
                  ></div>
                </div>
              </div>

              {/* Collection Rate */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Rata Incasare</span>
                  <span className="fw-bold">87%</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: '87%' }}
                  ></div>
                </div>
              </div>

              {/* Patient Satisfaction */}
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Satisfactie Pacienti</span>
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

          {/* Inventory Alerts */}
          {inventoryData?.count && inventoryData.count > 0 && (
            <Card className="shadow-sm mt-4 border-warning">
              <CardHeader className="bg-warning-transparent">
                <h5 className="fw-bold mb-0 text-warning">
                  <i className="ti ti-alert-triangle me-2"></i>
                  Alerte Stoc
                </h5>
              </CardHeader>
              <CardBody>
                <p className="text-muted mb-3">
                  {inventoryData.count} produse au stoc scazut si necesita
                  reaprovizionare.
                </p>
                <Button
                  variant="warning"
                  size="sm"
                  className="w-100"
                  onClick={() => navigate('/inventory?filter=low-stock')}
                >
                  Vezi Produse
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
