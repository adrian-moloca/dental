/**
 * Reports Dashboard Page - Preclinic-style Analytics & Reports
 *
 * Comprehensive analytics dashboard with KPIs, charts, and performance metrics
 * for dental clinic operations.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Badge, StatsCard } from '../components/ui-new';
import { AppShell } from '../components/layout/AppShell';

// Date range options
type DateRange = 'this_month' | 'last_month' | 'this_year' | 'custom';

interface DateRangeOption {
  value: DateRange;
  label: string;
}

const dateRangeOptions: DateRangeOption[] = [
  { value: 'this_month', label: 'Luna Aceasta' },
  { value: 'last_month', label: 'Luna Trecuta' },
  { value: 'this_year', label: 'Anul Acesta' },
  { value: 'custom', label: 'Personalizat' },
];

export function ReportsPage() {
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<DateRange>('this_month');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Format currency in RON
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ro-RO').format(num);
  };

  // Mock KPI data
  const kpiData = {
    revenue: {
      value: 127500,
      trend: 12.5,
      label: 'vs luna trecuta',
    },
    newPatients: {
      value: 34,
      trend: 8.3,
      label: 'vs luna trecuta',
    },
    appointments: {
      value: 287,
      completionRate: 94,
      trend: 5.2,
      label: 'vs luna trecuta',
    },
    collections: {
      value: 112300,
      percentage: 88,
      trend: -3.1,
      label: 'vs luna trecuta',
    },
  };

  // Mock monthly revenue data
  const monthlyRevenue = [
    { month: 'Ian', revenue: 98000 },
    { month: 'Feb', revenue: 105000 },
    { month: 'Mar', revenue: 112000 },
    { month: 'Apr', revenue: 108000 },
    { month: 'Mai', revenue: 115000 },
    { month: 'Iun', revenue: 122000 },
    { month: 'Iul', revenue: 127500 },
  ];

  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const maxRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue));

  // Mock top services data
  const topServices = [
    { name: 'Implant Dentar', count: 45, revenue: 45000, percentage: 35 },
    { name: 'Tratament Canal', count: 78, revenue: 31200, percentage: 24 },
    { name: 'Coroana Ceramica', count: 52, revenue: 26000, percentage: 20 },
    { name: 'Detartraj', count: 156, revenue: 15600, percentage: 12 },
    { name: 'Albire Dentara', count: 34, revenue: 10200, percentage: 9 },
  ];

  // Mock provider performance data
  const providerPerformance = [
    {
      id: '1',
      name: 'Dr. Maria Ionescu',
      avatar: 'MI',
      appointments: 98,
      revenue: 52300,
      avgPerVisit: 533,
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Dr. Alexandru Popescu',
      avatar: 'AP',
      appointments: 87,
      revenue: 45600,
      avgPerVisit: 524,
      rating: 4.8,
    },
    {
      id: '3',
      name: 'Dr. Elena Marinescu',
      avatar: 'EM',
      appointments: 76,
      revenue: 38200,
      avgPerVisit: 503,
      rating: 4.7,
    },
    {
      id: '4',
      name: 'Dr. Andrei Dumitrescu',
      avatar: 'AD',
      appointments: 65,
      revenue: 29400,
      avgPerVisit: 452,
      rating: 4.6,
    },
  ];

  // Mock recent transactions
  const recentTransactions = [
    {
      id: '1',
      date: '2025-11-26',
      time: '14:30',
      patient: 'Maria Popescu',
      amount: 2500,
      method: 'card',
    },
    {
      id: '2',
      date: '2025-11-26',
      time: '12:15',
      patient: 'Ion Georgescu',
      amount: 450,
      method: 'cash',
    },
    {
      id: '3',
      date: '2025-11-26',
      time: '10:45',
      patient: 'Elena Dumitrescu',
      amount: 1200,
      method: 'transfer',
    },
    {
      id: '4',
      date: '2025-11-25',
      time: '16:20',
      patient: 'Alexandru Popa',
      amount: 3500,
      method: 'card',
    },
    {
      id: '5',
      date: '2025-11-25',
      time: '14:00',
      patient: 'Ana Vasilescu',
      amount: 850,
      method: 'cash',
    },
  ];

  // Mock appointment stats
  const appointmentStats = {
    completed: 268,
    cancelled: 12,
    noShow: 7,
    total: 287,
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting report as ${format}`);
    setShowExportMenu(false);
    // TODO: Implement actual export functionality
  };

  const getPaymentMethodBadge = (method: string) => {
    const configs = {
      card: { variant: 'soft-primary' as const, icon: 'ti-credit-card', label: 'Card' },
      cash: { variant: 'soft-success' as const, icon: 'ti-cash', label: 'Numerar' },
      transfer: { variant: 'soft-info' as const, icon: 'ti-building-bank', label: 'Transfer' },
    };
    const config = configs[method as keyof typeof configs] || configs.cash;
    return (
      <Badge variant={config.variant}>
        <i className={`ti ${config.icon} me-1`}></i>
        {config.label}
      </Badge>
    );
  };

  return (
    <AppShell>
      <div className="content">
        {/* Page Header */}
        <div className="d-flex align-items-sm-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <h4 className="fw-bold mb-1">Rapoarte si Analize</h4>
            <p className="text-muted mb-0">
              Analiza performantei si monitorizare financiara
            </p>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            {/* Date Range Selector */}
            <div className="btn-group">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`btn btn-sm ${
                    selectedRange === option.value
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  }`}
                  onClick={() => setSelectedRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <div className="position-relative">
              <Button
                variant="outline-primary"
                size="sm"
                icon="ti ti-download"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Export
              </Button>
              {showExportMenu && (
                <div
                  className="dropdown-menu dropdown-menu-end show"
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4 }}
                >
                  <button
                    className="dropdown-item"
                    onClick={() => handleExport('pdf')}
                  >
                    <i className="ti ti-file-type-pdf me-2"></i>
                    Export PDF
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => handleExport('excel')}
                  >
                    <i className="ti ti-file-type-xls me-2"></i>
                    Export Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Stats Row */}
        <div className="row">
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatCurrency(kpiData.revenue.value)}
              label="Venituri Totale"
              icon="ti ti-currency-dollar"
              iconColor="success"
              trend={kpiData.revenue.trend}
              trendLabel={kpiData.revenue.label}
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatNumber(kpiData.newPatients.value)}
              label="Pacienti Noi"
              icon="ti ti-user-plus"
              iconColor="primary"
              trend={kpiData.newPatients.trend}
              trendLabel={kpiData.newPatients.label}
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatNumber(kpiData.appointments.value)}
              label="Programari"
              icon="ti ti-calendar-event"
              iconColor="info"
              trend={kpiData.appointments.trend}
              trendLabel={kpiData.appointments.label}
              footer={
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Rata finalizare</span>
                  <span className="fw-bold text-success">
                    {kpiData.appointments.completionRate}%
                  </span>
                </div>
              }
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatCurrency(kpiData.collections.value)}
              label="Incasari"
              icon="ti ti-receipt"
              iconColor="warning"
              trend={kpiData.collections.trend}
              trendLabel={kpiData.collections.label}
              footer={
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Din venituri</span>
                  <span className="fw-bold text-warning">
                    {kpiData.collections.percentage}%
                  </span>
                </div>
              }
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="row">
          {/* Revenue Chart Card */}
          <div className="col-lg-8 mb-4">
            <Card className="shadow-sm" fullHeight>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="fw-bold mb-1">Evolutie Venituri</h5>
                  <p className="text-muted small mb-0">
                    Total perioada: {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <Badge variant="soft-primary">Ultimele 7 luni</Badge>
              </CardHeader>
              <CardBody>
                {/* Simple Bar Chart Visualization */}
                <div className="chart-container" style={{ height: 320 }}>
                  <div className="d-flex align-items-end justify-content-between h-100 gap-2">
                    {monthlyRevenue.map((item, index) => (
                      <div
                        key={index}
                        className="d-flex flex-column align-items-center flex-grow-1"
                        style={{ height: '100%' }}
                      >
                        <div
                          className="d-flex align-items-end justify-content-center w-100"
                          style={{ height: 280 }}
                        >
                          <div
                            className="bg-primary rounded-top position-relative"
                            style={{
                              width: '100%',
                              height: `${(item.revenue / maxRevenue) * 100}%`,
                              minHeight: 40,
                              transition: 'height 0.3s ease',
                            }}
                            title={formatCurrency(item.revenue)}
                          >
                            <div
                              className="position-absolute w-100 text-center fw-bold text-white small"
                              style={{ top: -24 }}
                            >
                              {formatCurrency(item.revenue / 1000)}k
                            </div>
                          </div>
                        </div>
                        <div className="text-muted small mt-2 fw-medium">
                          {item.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Top Services Card */}
          <div className="col-lg-4 mb-4">
            <Card className="shadow-sm" fullHeight>
              <CardHeader>
                <h5 className="fw-bold mb-0">Servicii Populare</h5>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-column gap-4">
                  {topServices.map((service, index) => (
                    <div key={index}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <div className="fw-medium mb-1">{service.name}</div>
                          <div className="text-muted small">
                            {service.count} proceduri
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-primary">
                            {formatCurrency(service.revenue)}
                          </div>
                        </div>
                      </div>
                      <div className="progress" style={{ height: 6 }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${service.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Provider Performance Card */}
        <div className="row">
          <div className="col-12 mb-4">
            <Card className="shadow-sm">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Performanta Medici</h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  icon="ti ti-file-download"
                >
                  Export Detaliat
                </Button>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Medic</th>
                        <th className="text-center">Programari</th>
                        <th className="text-end">Venituri</th>
                        <th className="text-end">Medie / Vizita</th>
                        <th className="text-center">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providerPerformance.map((provider, index) => (
                        <tr key={provider.id} className="cursor-pointer">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm me-3 bg-primary-transparent rounded-circle">
                                <span className="avatar-text">{provider.avatar}</span>
                              </div>
                              <div>
                                <div className="fw-medium">{provider.name}</div>
                                <div className="text-muted small">
                                  #{index + 1} Top Performer
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-soft-info px-3 py-2">
                              {provider.appointments}
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="fw-bold text-success">
                              {formatCurrency(provider.revenue)}
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="text-muted">
                              {formatCurrency(provider.avgPerVisit)}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <i className="ti ti-star-filled text-warning fs-16"></i>
                              <span className="fw-medium">{provider.rating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Bottom Row: Transactions & Appointment Stats */}
        <div className="row">
          {/* Recent Transactions Card */}
          <div className="col-lg-6 mb-4">
            <Card className="shadow-sm">
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">Tranzactii Recente</h5>
                <button
                  className="btn btn-link btn-sm text-primary p-0"
                  onClick={() => navigate('/billing')}
                >
                  Vezi Toate
                  <i className="ti ti-chevron-right ms-1"></i>
                </button>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-column gap-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="d-flex align-items-center justify-content-between pb-3 border-bottom"
                    >
                      <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="avatar avatar-sm bg-success-transparent rounded-circle">
                          <i className="ti ti-receipt text-success"></i>
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <div className="fw-medium text-truncate">
                            {transaction.patient}
                          </div>
                          <div className="text-muted small">
                            {new Date(transaction.date).toLocaleDateString('ro-RO', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            la {transaction.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-end ms-3">
                        <div className="fw-bold text-success mb-1">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div>{getPaymentMethodBadge(transaction.method)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Appointment Stats Card */}
          <div className="col-lg-6 mb-4">
            <Card className="shadow-sm">
              <CardHeader>
                <h5 className="fw-bold mb-0">Statistici Programari</h5>
              </CardHeader>
              <CardBody>
                {/* Pie Chart Visualization */}
                <div className="d-flex align-items-center justify-content-center mb-4">
                  <div
                    className="position-relative d-flex align-items-center justify-content-center"
                    style={{ width: 200, height: 200 }}
                  >
                    {/* Simplified Pie Chart using conic-gradient */}
                    <div
                      className="rounded-circle"
                      style={{
                        width: 180,
                        height: 180,
                        background: `conic-gradient(
                          #28a745 0deg ${
                            (appointmentStats.completed / appointmentStats.total) * 360
                          }deg,
                          #dc3545 ${
                            (appointmentStats.completed / appointmentStats.total) * 360
                          }deg ${
                            ((appointmentStats.completed + appointmentStats.cancelled) /
                              appointmentStats.total) *
                            360
                          }deg,
                          #fd7e14 ${
                            ((appointmentStats.completed + appointmentStats.cancelled) /
                              appointmentStats.total) *
                            360
                          }deg 360deg
                        )`,
                      }}
                    >
                      <div
                        className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                        style={{
                          width: 120,
                          height: 120,
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="text-center">
                          <div className="fw-bold fs-24">
                            {appointmentStats.total}
                          </div>
                          <div className="text-muted small">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded"
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#28a745',
                        }}
                      ></div>
                      <span className="text-muted">Finalizate</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">{appointmentStats.completed}</span>
                      <span className="text-muted small">
                        (
                        {Math.round(
                          (appointmentStats.completed / appointmentStats.total) * 100
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded"
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#dc3545',
                        }}
                      ></div>
                      <span className="text-muted">Anulate</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">{appointmentStats.cancelled}</span>
                      <span className="text-muted small">
                        (
                        {Math.round(
                          (appointmentStats.cancelled / appointmentStats.total) * 100
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded"
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#fd7e14',
                        }}
                      ></div>
                      <span className="text-muted">Neprezentati</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">{appointmentStats.noShow}</span>
                      <span className="text-muted small">
                        (
                        {Math.round(
                          (appointmentStats.noShow / appointmentStats.total) * 100
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ReportsPage;
