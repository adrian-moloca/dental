/**
 * Reports & Analytics Dashboard - Comprehensive DentalOS Reports
 *
 * Complete analytics dashboard with:
 * - Date range selector with presets and comparison mode
 * - Financial reports (revenue, invoices, top procedures, by provider)
 * - Patient reports (new vs existing, retention, demographics)
 * - Appointment reports (attendance, no-show, service types, heatmap)
 * - Provider performance metrics
 * - Export functionality (CSV, PDF, Print, Schedule)
 * - Quick insights cards
 */

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardBody, Button, Badge, StatsCard } from '../components/ui-new';
import { AppShell } from '../components/layout/AppShell';

// ============================================================================
// Types
// ============================================================================

type DateRangePreset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface DateRangeOption {
  value: DateRangePreset;
  label: string;
}

interface CustomDateRange {
  from: string;
  to: string;
}

type ReportSection = 'financial' | 'patients' | 'appointments' | 'providers';

// ============================================================================
// Constants
// ============================================================================

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { value: 'today', label: 'Azi' },
  { value: 'week', label: 'Saptamana' },
  { value: 'month', label: 'Luna' },
  { value: 'quarter', label: 'Trimestru' },
  { value: 'year', label: 'An' },
  { value: 'custom', label: 'Personalizat' },
];

const DAYS_OF_WEEK = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];
const HOURS_OF_DAY = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

// ============================================================================
// Mock Data
// ============================================================================

const generateMockData = () => ({
  // Financial Data
  financial: {
    totalRevenue: 287500,
    revenueTrend: 12.5,
    invoicesIssued: 156,
    invoicesCollected: 142,
    collectionRate: 91.0,
    avgInvoiceValue: 1843,
    topProcedures: [
      { name: 'Implant Dentar', count: 45, revenue: 67500, percentage: 23.5 },
      { name: 'Tratament de Canal', count: 78, revenue: 46800, percentage: 16.3 },
      { name: 'Coroana Ceramica', count: 52, revenue: 41600, percentage: 14.5 },
      { name: 'Extractie Dentara', count: 89, revenue: 26700, percentage: 9.3 },
      { name: 'Detartraj Profesional', count: 156, revenue: 23400, percentage: 8.1 },
      { name: 'Albire Profesionala', count: 34, revenue: 20400, percentage: 7.1 },
      { name: 'Plombe Estetice', count: 112, revenue: 16800, percentage: 5.8 },
      { name: 'Gutiera Ortodontica', count: 23, revenue: 13800, percentage: 4.8 },
      { name: 'Consultatie', count: 234, revenue: 11700, percentage: 4.1 },
      { name: 'Radiografie Panoramica', count: 187, revenue: 9350, percentage: 3.3 },
    ],
    revenueByProvider: [
      { name: 'Dr. Maria Ionescu', revenue: 78500, appointments: 98, specialty: 'Implantologie' },
      { name: 'Dr. Alexandru Popescu', revenue: 65200, appointments: 87, specialty: 'Endodontie' },
      { name: 'Dr. Elena Marinescu', revenue: 52300, appointments: 76, specialty: 'Protetica' },
      { name: 'Dr. Andrei Dumitrescu', revenue: 48700, appointments: 65, specialty: 'Ortodontie' },
      { name: 'Dr. Cristina Vasile', revenue: 42800, appointments: 72, specialty: 'Parodontologie' },
    ],
    monthlyRevenue: [
      { month: 'Ian', revenue: 198000, previous: 175000 },
      { month: 'Feb', revenue: 215000, previous: 192000 },
      { month: 'Mar', revenue: 234000, previous: 208000 },
      { month: 'Apr', revenue: 228000, previous: 215000 },
      { month: 'Mai', revenue: 245000, previous: 228000 },
      { month: 'Iun', revenue: 262000, previous: 241000 },
      { month: 'Iul', revenue: 278000, previous: 255000 },
      { month: 'Aug', revenue: 265000, previous: 248000 },
      { month: 'Sep', revenue: 285000, previous: 262000 },
      { month: 'Oct', revenue: 295000, previous: 278000 },
      { month: 'Nov', revenue: 287500, previous: 285000 },
    ],
  },

  // Patient Data
  patients: {
    totalPatients: 1847,
    newPatients: 89,
    newPatientsTrend: 15.2,
    existingPatients: 1758,
    activePatients: 1234,
    inactivePatients: 613,
    retentionRate: 87.5,
    retentionTrend: 2.3,
    avgVisitsPerPatient: 3.2,
    demographics: {
      ageGroups: [
        { range: '0-17', count: 185, percentage: 10 },
        { range: '18-25', count: 222, percentage: 12 },
        { range: '26-35', count: 369, percentage: 20 },
        { range: '36-45', count: 351, percentage: 19 },
        { range: '46-55', count: 314, percentage: 17 },
        { range: '56-65', count: 240, percentage: 13 },
        { range: '65+', count: 166, percentage: 9 },
      ],
      gender: {
        female: 58,
        male: 42,
      },
    },
    patientFlow: {
      leads: 45,
      new: 89,
      active: 1234,
      atRisk: 156,
      churned: 78,
    },
  },

  // Appointment Data
  appointments: {
    total: 567,
    completed: 498,
    cancelled: 42,
    noShow: 27,
    attendanceRate: 87.8,
    noShowRate: 4.8,
    avgWaitTime: 8.5, // minutes
    avgDuration: 42, // minutes
    byServiceType: [
      { type: 'Consultatie', count: 156, percentage: 27.5 },
      { type: 'Tratament', count: 189, percentage: 33.3 },
      { type: 'Chirurgie', count: 67, percentage: 11.8 },
      { type: 'Estetica', count: 89, percentage: 15.7 },
      { type: 'Ortodontie', count: 45, percentage: 7.9 },
      { type: 'Control', count: 21, percentage: 3.7 },
    ],
    // Heatmap data: appointments per hour per day
    heatmap: [
      // Mon-Sat, 08:00-19:00
      [3, 8, 12, 15, 14, 10, 12, 16, 14, 11, 8, 5], // Luni
      [4, 9, 14, 16, 13, 11, 14, 18, 15, 12, 7, 4], // Marti
      [5, 10, 15, 18, 16, 12, 15, 19, 17, 13, 9, 6], // Miercuri
      [4, 8, 13, 15, 14, 10, 13, 17, 15, 11, 7, 4], // Joi
      [6, 11, 16, 19, 17, 13, 16, 20, 18, 14, 10, 7], // Vineri
      [8, 14, 18, 20, 16, 12, 10, 8, 6, 4, 2, 1], // Sambata
    ],
    peakHour: '15:00 - 16:00',
    peakDay: 'Vineri',
  },

  // Provider Performance
  providers: [
    {
      id: '1',
      name: 'Dr. Maria Ionescu',
      avatar: 'MI',
      specialty: 'Implantologie',
      appointments: 98,
      completedAppointments: 94,
      revenue: 78500,
      avgPerVisit: 801,
      rating: 4.9,
      utilization: 92,
      noShowRate: 2.1,
      avgWaitTime: 6,
    },
    {
      id: '2',
      name: 'Dr. Alexandru Popescu',
      avatar: 'AP',
      specialty: 'Endodontie',
      appointments: 87,
      completedAppointments: 82,
      revenue: 65200,
      avgPerVisit: 749,
      rating: 4.8,
      utilization: 88,
      noShowRate: 3.5,
      avgWaitTime: 8,
    },
    {
      id: '3',
      name: 'Dr. Elena Marinescu',
      avatar: 'EM',
      specialty: 'Protetica',
      appointments: 76,
      completedAppointments: 71,
      revenue: 52300,
      avgPerVisit: 688,
      rating: 4.7,
      utilization: 85,
      noShowRate: 4.2,
      avgWaitTime: 10,
    },
    {
      id: '4',
      name: 'Dr. Andrei Dumitrescu',
      avatar: 'AD',
      specialty: 'Ortodontie',
      appointments: 65,
      completedAppointments: 61,
      revenue: 48700,
      avgPerVisit: 749,
      rating: 4.8,
      utilization: 78,
      noShowRate: 3.1,
      avgWaitTime: 7,
    },
    {
      id: '5',
      name: 'Dr. Cristina Vasile',
      avatar: 'CV',
      specialty: 'Parodontologie',
      appointments: 72,
      completedAppointments: 67,
      revenue: 42800,
      avgPerVisit: 594,
      rating: 4.6,
      utilization: 82,
      noShowRate: 4.8,
      avgWaitTime: 11,
    },
  ],

  // Quick Insights
  insights: {
    bestDay: { day: 'Vineri', revenue: 58200 },
    popularService: { name: 'Implant Dentar', count: 45 },
    topReferrer: { name: 'Maria Popescu', referrals: 8 },
    growthVsLastPeriod: 12.5,
    outstandingBalance: 28400,
    upcomingAppointments: 45,
  },
});

// ============================================================================
// Utility Functions
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ro-RO').format(num);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const getHeatmapColor = (value: number, max: number): string => {
  const intensity = value / max;
  if (intensity < 0.2) return 'var(--bs-success-bg-subtle)';
  if (intensity < 0.4) return 'var(--bs-success)';
  if (intensity < 0.6) return 'var(--bs-warning)';
  if (intensity < 0.8) return 'var(--bs-orange)';
  return 'var(--bs-danger)';
};

const getHeatmapTextColor = (value: number, max: number): string => {
  const intensity = value / max;
  return intensity >= 0.4 ? 'white' : 'var(--bs-body-color)';
};

// ============================================================================
// Sub-Components
// ============================================================================

interface BarChartProps {
  data: Array<{ label: string; value: number; previousValue?: number }>;
  maxValue?: number;
  showComparison?: boolean;
  height?: number;
  valueFormatter?: (value: number) => string;
}

function SimpleBarChart({
  data,
  maxValue,
  showComparison = false,
  height = 240,
  valueFormatter = formatCurrency,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => Math.max(d.value, d.previousValue || 0)));

  return (
    <div className="d-flex align-items-end justify-content-between gap-2" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%' }}>
          <div className="d-flex align-items-end justify-content-center gap-1 w-100" style={{ height: height - 32 }}>
            {showComparison && item.previousValue !== undefined && (
              <div
                className="rounded-top"
                style={{
                  width: '40%',
                  height: `${(item.previousValue / max) * 100}%`,
                  minHeight: 4,
                  backgroundColor: 'var(--bs-secondary-bg)',
                  transition: 'height 0.3s ease',
                }}
                title={`Anterior: ${valueFormatter(item.previousValue)}`}
              />
            )}
            <div
              className="bg-primary rounded-top position-relative"
              style={{
                width: showComparison ? '40%' : '70%',
                height: `${(item.value / max) * 100}%`,
                minHeight: 4,
                transition: 'height 0.3s ease',
              }}
              title={valueFormatter(item.value)}
            />
          </div>
          <div className="text-muted small mt-2 fw-medium text-center" style={{ fontSize: 11 }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

interface HorizontalBarProps {
  label: string;
  value: number;
  maxValue: number;
  displayValue: string;
  color?: string;
}

function HorizontalBar({ label, value, maxValue, displayValue, color = 'primary' }: HorizontalBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="text-truncate" style={{ maxWidth: '60%' }}>
          {label}
        </span>
        <span className="fw-bold text-primary">{displayValue}</span>
      </div>
      <div className="progress" style={{ height: 6 }}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${percentage}%`, transition: 'width 0.3s ease' }}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
        />
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
}

function DonutChart({ data, centerLabel, centerValue, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const segments = data.reduce<Array<typeof data[0] & { percentage: number; startAngle: number; endAngle: number }>>((acc, item) => {
    const percentage = (item.value / total) * 100;
    const startAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const endAngle = startAngle + (percentage / 100) * 360;
    return [...acc, { ...item, percentage, startAngle, endAngle }];
  }, []);

  const gradientStops = segments.map((seg) => `${seg.color} ${seg.startAngle}deg ${seg.endAngle}deg`).join(', ');

  return (
    <div className="d-flex align-items-center gap-4">
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{ width: size, height: size }}
      >
        <div
          className="rounded-circle"
          style={{
            width: size,
            height: size,
            background: `conic-gradient(${gradientStops})`,
          }}
        />
        <div
          className="rounded-circle bg-white d-flex align-items-center justify-content-center position-absolute"
          style={{
            width: size * 0.65,
            height: size * 0.65,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="text-center">
            {centerValue !== undefined && <div className="fw-bold fs-5">{centerValue}</div>}
            {centerLabel && <div className="text-muted small">{centerLabel}</div>}
          </div>
        </div>
      </div>
      <div className="d-flex flex-column gap-2">
        {segments.map((seg, idx) => (
          <div key={idx} className="d-flex align-items-center gap-2">
            <div className="rounded" style={{ width: 12, height: 12, backgroundColor: seg.color }} />
            <span className="text-muted small">{seg.label}</span>
            <span className="fw-medium small ms-auto">{seg.value}</span>
            <span className="text-muted small">({seg.percentage.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HeatmapProps {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
}

function Heatmap({ data, xLabels, yLabels }: HeatmapProps) {
  const maxValue = Math.max(...data.flat());

  return (
    <div className="table-responsive">
      <table className="table table-bordered mb-0" style={{ fontSize: 11 }}>
        <thead>
          <tr>
            <th className="text-center bg-light" style={{ width: 80 }}>
              Ora / Zi
            </th>
            {yLabels.map((label, idx) => (
              <th key={idx} className="text-center bg-light" style={{ minWidth: 50 }}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {xLabels.map((hour, rowIdx) => (
            <tr key={rowIdx}>
              <td className="text-center fw-medium bg-light">{hour}</td>
              {data.map((dayData, colIdx) => {
                const value = dayData[rowIdx] || 0;
                return (
                  <td
                    key={colIdx}
                    className="text-center p-1"
                    style={{
                      backgroundColor: getHeatmapColor(value, maxValue),
                      color: getHeatmapTextColor(value, maxValue),
                      fontWeight: 500,
                    }}
                    title={`${yLabels[colIdx]} ${hour}: ${value} programari`}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface InsightCardProps {
  icon: string;
  iconColor: string;
  title: string;
  value: string;
  subtitle?: string;
}

function InsightCard({ icon, iconColor, title, value, subtitle }: InsightCardProps) {
  return (
    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
      <div
        className={`d-flex align-items-center justify-content-center rounded-2 bg-${iconColor}-transparent`}
        style={{ width: 48, height: 48, flexShrink: 0 }}
      >
        <i className={`${icon} text-${iconColor}`} style={{ fontSize: 20 }}></i>
      </div>
      <div className="flex-grow-1 min-width-0">
        <div className="text-muted small mb-1">{title}</div>
        <div className="fw-bold text-truncate">{value}</div>
        {subtitle && <div className="text-muted small">{subtitle}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ReportsPage() {
  // State
  const [selectedRange, setSelectedRange] = useState<DateRangePreset>('month');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      from: thirtyDaysAgo.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    };
  });
  const [showComparison, setShowComparison] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeSection, setActiveSection] = useState<ReportSection | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  // Mock data (in real app, this would come from API based on date range)
  const data = useMemo(() => generateMockData(), []);

  // Handlers
  const handleExport = useCallback((format: 'csv' | 'pdf' | 'print') => {
    setShowExportMenu(false);
    switch (format) {
      case 'csv':
        console.log('Exporting to CSV...');
        // In real implementation: generate CSV and trigger download
        alert('Export CSV in curs de dezvoltare');
        break;
      case 'pdf':
        console.log('Exporting to PDF...');
        // In real implementation: generate PDF using jsPDF or server-side
        alert('Export PDF in curs de dezvoltare');
        break;
      case 'print':
        window.print();
        break;
    }
  }, []);

  const handleScheduleReport = useCallback(() => {
    setShowExportMenu(false);
    setShowScheduleModal(true);
  }, []);

  const maxRevenueByProvider = Math.max(...data.financial.revenueByProvider.map((p) => p.revenue));
  const maxProcedureRevenue = Math.max(...data.financial.topProcedures.map((p) => p.revenue));

  return (
    <AppShell>
      <div className="content">
        {/* Page Header */}
        <div className="d-flex align-items-sm-center justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <h4 className="fw-bold mb-1">Rapoarte si Analize</h4>
            <p className="text-muted mb-0">Analiza completa a performantei clinicii</p>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            {/* Date Range Selector */}
            <div className="btn-group">
              {DATE_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`btn btn-sm ${selectedRange === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Picker */}
            {selectedRange === 'custom' && (
              <div className="d-flex align-items-center gap-2">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={customDateRange.from}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, from: e.target.value }))}
                  style={{ width: 140 }}
                />
                <span className="text-muted">-</span>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={customDateRange.to}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, to: e.target.value }))}
                  style={{ width: 140 }}
                />
              </div>
            )}

            {/* Compare Toggle */}
            <div className="form-check form-switch ms-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="compareToggle"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="compareToggle">
                Compara cu perioada anterioara
              </label>
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
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 1000 }}
                >
                  <button className="dropdown-item" onClick={() => handleExport('csv')}>
                    <i className="ti ti-file-type-csv me-2"></i>
                    Export Excel (CSV)
                  </button>
                  <button className="dropdown-item" onClick={() => handleExport('pdf')}>
                    <i className="ti ti-file-type-pdf me-2"></i>
                    Export PDF
                  </button>
                  <button className="dropdown-item" onClick={() => handleExport('print')}>
                    <i className="ti ti-printer me-2"></i>
                    Printeaza Raport
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleScheduleReport}>
                    <i className="ti ti-clock me-2"></i>
                    Programeaza Raport Automat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Insights Cards */}
        <div className="row mb-4">
          <div className="col-12">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <i className="ti ti-bulb text-warning"></i>
                  <h6 className="fw-bold mb-0">Informatii Rapide</h6>
                </div>
              </CardHeader>
              <CardBody>
                <div className="row g-3">
                  <div className="col-md-3 col-sm-6">
                    <InsightCard
                      icon="ti ti-calendar-star"
                      iconColor="success"
                      title="Cea mai buna zi"
                      value={data.insights.bestDay.day}
                      subtitle={formatCurrency(data.insights.bestDay.revenue)}
                    />
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <InsightCard
                      icon="ti ti-star"
                      iconColor="primary"
                      title="Serviciu popular"
                      value={data.insights.popularService.name}
                      subtitle={`${data.insights.popularService.count} proceduri`}
                    />
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <InsightCard
                      icon="ti ti-users"
                      iconColor="info"
                      title="Top referral"
                      value={data.insights.topReferrer.name}
                      subtitle={`${data.insights.topReferrer.referrals} recomandari`}
                    />
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <InsightCard
                      icon="ti ti-trending-up"
                      iconColor="success"
                      title="Crestere vs perioada anterioara"
                      value={`+${data.insights.growthVsLastPeriod}%`}
                      subtitle="Venituri"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* KPI Stats Row */}
        <div className="row">
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatCurrency(data.financial.totalRevenue)}
              label="Venituri Totale"
              icon="ti ti-currency-dollar"
              iconColor="success"
              trend={data.financial.revenueTrend}
              trendLabel="vs perioada anterioara"
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatNumber(data.patients.newPatients)}
              label="Pacienti Noi"
              icon="ti ti-user-plus"
              iconColor="primary"
              trend={data.patients.newPatientsTrend}
              trendLabel="vs perioada anterioara"
              footer={
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Total pacienti</span>
                  <span className="fw-bold">{formatNumber(data.patients.totalPatients)}</span>
                </div>
              }
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatNumber(data.appointments.total)}
              label="Programari"
              icon="ti ti-calendar-event"
              iconColor="info"
              footer={
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Rata prezenta</span>
                  <span className="fw-bold text-success">{formatPercent(data.appointments.attendanceRate)}</span>
                </div>
              }
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <StatsCard
              value={formatPercent(data.patients.retentionRate)}
              label="Rata Retentie"
              icon="ti ti-repeat"
              iconColor="warning"
              trend={data.patients.retentionTrend}
              trendLabel="vs perioada anterioara"
              footer={
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Pacienti activi</span>
                  <span className="fw-bold">{formatNumber(data.patients.activePatients)}</span>
                </div>
              }
            />
          </div>
        </div>

        {/* ================================================================ */}
        {/* FINANCIAL REPORTS SECTION */}
        {/* ================================================================ */}
        <div className="mb-4">
          <div
            className="d-flex align-items-center gap-2 mb-3 cursor-pointer"
            onClick={() => setActiveSection(activeSection === 'financial' ? null : 'financial')}
            style={{ cursor: 'pointer' }}
          >
            <i className={`ti ti-chevron-${activeSection === 'financial' ? 'down' : 'right'} text-muted`}></i>
            <h5 className="fw-bold mb-0">
              <i className="ti ti-report-money text-success me-2"></i>
              Rapoarte Financiare
            </h5>
          </div>

          <div className="row">
            {/* Revenue Evolution Chart */}
            <div className="col-lg-8 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-1">Evolutie Venituri Lunare</h6>
                    <p className="text-muted small mb-0">
                      Total YTD:{' '}
                      {formatCurrency(data.financial.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0))}
                    </p>
                  </div>
                  {showComparison && (
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center gap-1">
                        <div className="bg-primary rounded" style={{ width: 12, height: 12 }}></div>
                        <span className="small text-muted">Curent</span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <div className="bg-secondary-subtle rounded" style={{ width: 12, height: 12 }}></div>
                        <span className="small text-muted">Anterior</span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardBody>
                  <SimpleBarChart
                    data={data.financial.monthlyRevenue.map((m) => ({
                      label: m.month,
                      value: m.revenue,
                      previousValue: m.previous,
                    }))}
                    showComparison={showComparison}
                    height={280}
                    valueFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Invoices Summary */}
            <div className="col-lg-4 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader>
                  <h6 className="fw-bold mb-0">Facturi Emise vs Incasate</h6>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column gap-4">
                    <div className="text-center py-3">
                      <div className="d-flex align-items-center justify-content-center gap-4 mb-3">
                        <div>
                          <div className="fs-3 fw-bold text-primary">{data.financial.invoicesIssued}</div>
                          <div className="text-muted small">Emise</div>
                        </div>
                        <div className="text-muted fs-4">/</div>
                        <div>
                          <div className="fs-3 fw-bold text-success">{data.financial.invoicesCollected}</div>
                          <div className="text-muted small">Incasate</div>
                        </div>
                      </div>
                      <Badge variant="soft-success" size="lg">
                        <i className="ti ti-check me-1"></i>
                        {formatPercent(data.financial.collectionRate)} rata incasare
                      </Badge>
                    </div>

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Valoare medie factura</span>
                        <span className="fw-bold">{formatCurrency(data.financial.avgInvoiceValue)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Sold restant</span>
                        <span className="fw-bold text-danger">{formatCurrency(data.insights.outstandingBalance)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Facturi neincasate</span>
                        <span className="fw-bold">{data.financial.invoicesIssued - data.financial.invoicesCollected}</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          <div className="row">
            {/* Top 10 Procedures by Revenue */}
            <div className="col-lg-6 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="fw-bold mb-0">Top 10 Proceduri dupa Venit</h6>
                  <Badge variant="soft-primary">Luna curenta</Badge>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column">
                    {data.financial.topProcedures.map((proc, idx) => (
                      <HorizontalBar
                        key={idx}
                        label={`${idx + 1}. ${proc.name}`}
                        value={proc.revenue}
                        maxValue={maxProcedureRevenue}
                        displayValue={formatCurrency(proc.revenue)}
                        color={idx < 3 ? 'success' : 'primary'}
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Revenue by Provider */}
            <div className="col-lg-6 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="fw-bold mb-0">Venituri pe Furnizor</h6>
                  <Badge variant="soft-info">Top 5</Badge>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column">
                    {data.financial.revenueByProvider.map((provider, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="avatar avatar-sm bg-primary-transparent rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: 32, height: 32, fontSize: 11 }}
                            >
                              {provider.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <div className="fw-medium small">{provider.name}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>
                                {provider.specialty} - {provider.appointments} programari
                              </div>
                            </div>
                          </div>
                          <span className="fw-bold text-success">{formatCurrency(provider.revenue)}</span>
                        </div>
                        <div className="progress" style={{ height: 4 }}>
                          <div
                            className={`progress-bar ${idx === 0 ? 'bg-success' : 'bg-primary'}`}
                            style={{ width: `${(provider.revenue / maxRevenueByProvider) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PATIENT REPORTS SECTION */}
        {/* ================================================================ */}
        <div className="mb-4">
          <div
            className="d-flex align-items-center gap-2 mb-3"
            onClick={() => setActiveSection(activeSection === 'patients' ? null : 'patients')}
            style={{ cursor: 'pointer' }}
          >
            <i className={`ti ti-chevron-${activeSection === 'patients' ? 'down' : 'right'} text-muted`}></i>
            <h5 className="fw-bold mb-0">
              <i className="ti ti-users text-primary me-2"></i>
              Rapoarte Pacienti
            </h5>
          </div>

          <div className="row">
            {/* New vs Existing Patients */}
            <div className="col-lg-4 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader>
                  <h6 className="fw-bold mb-0">Pacienti Noi vs Existenti</h6>
                </CardHeader>
                <CardBody>
                  <DonutChart
                    data={[
                      { label: 'Noi', value: data.patients.newPatients, color: '#0d6efd' },
                      { label: 'Existenti', value: data.patients.existingPatients, color: '#198754' },
                    ]}
                    centerLabel="Total"
                    centerValue={data.patients.totalPatients}
                    size={140}
                  />
                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Vizite medii / pacient</span>
                      <span className="fw-bold">{data.patients.avgVisitsPerPatient}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Active vs Inactive */}
            <div className="col-lg-4 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader>
                  <h6 className="fw-bold mb-0">Pacienti Activi vs Inactivi</h6>
                </CardHeader>
                <CardBody>
                  <DonutChart
                    data={[
                      { label: 'Activi', value: data.patients.activePatients, color: '#198754' },
                      { label: 'Inactivi', value: data.patients.inactivePatients, color: '#dc3545' },
                    ]}
                    centerLabel="Activi"
                    centerValue={formatPercent((data.patients.activePatients / data.patients.totalPatients) * 100)}
                    size={140}
                  />
                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Rata retentie</span>
                      <span className="fw-bold text-success">{formatPercent(data.patients.retentionRate)}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Demographics - Age Groups */}
            <div className="col-lg-4 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader>
                  <h6 className="fw-bold mb-0">Distributie pe Varsta</h6>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column gap-2">
                    {data.patients.demographics.ageGroups.map((group, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2">
                        <span className="text-muted small" style={{ minWidth: 45 }}>
                          {group.range}
                        </span>
                        <div className="flex-grow-1">
                          <div className="progress" style={{ height: 16 }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${group.percentage}%`,
                                backgroundColor:
                                  idx < 2
                                    ? 'var(--bs-info)'
                                    : idx < 5
                                      ? 'var(--bs-primary)'
                                      : 'var(--bs-secondary)',
                              }}
                            />
                          </div>
                        </div>
                        <span className="fw-medium small" style={{ minWidth: 40, textAlign: 'right' }}>
                          {group.count}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-around text-center">
                      <div>
                        <div className="fw-bold fs-5 text-pink">{data.patients.demographics.gender.female}%</div>
                        <div className="text-muted small">
                          <i className="ti ti-gender-female me-1"></i>Feminin
                        </div>
                      </div>
                      <div>
                        <div className="fw-bold fs-5 text-primary">{data.patients.demographics.gender.male}%</div>
                        <div className="text-muted small">
                          <i className="ti ti-gender-male me-1"></i>Masculin
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Patient Lifecycle Funnel */}
          <div className="row">
            <div className="col-12 mb-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <h6 className="fw-bold mb-0">Ciclu de Viata Pacienti</h6>
                </CardHeader>
                <CardBody>
                  <div className="d-flex align-items-end justify-content-between gap-3">
                    {[
                      { label: 'Lead-uri', value: data.patients.patientFlow.leads, color: 'info', icon: 'ti-target' },
                      { label: 'Noi', value: data.patients.patientFlow.new, color: 'primary', icon: 'ti-user-plus' },
                      { label: 'Activi', value: data.patients.patientFlow.active, color: 'success', icon: 'ti-users' },
                      {
                        label: 'La Risc',
                        value: data.patients.patientFlow.atRisk,
                        color: 'warning',
                        icon: 'ti-alert-triangle',
                      },
                      {
                        label: 'Pierduti',
                        value: data.patients.patientFlow.churned,
                        color: 'danger',
                        icon: 'ti-user-off',
                      },
                    ].map((stage, idx) => (
                      <div key={idx} className="text-center flex-grow-1">
                        <div
                          className={`mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle bg-${stage.color}-transparent`}
                          style={{ width: 56, height: 56 }}
                        >
                          <i className={`ti ${stage.icon} text-${stage.color}`} style={{ fontSize: 24 }}></i>
                        </div>
                        <div className="fw-bold fs-5">{formatNumber(stage.value)}</div>
                        <div className="text-muted small">{stage.label}</div>
                        {idx < 4 && (
                          <div className="position-absolute" style={{ right: -20, top: '50%' }}>
                            <i className="ti ti-arrow-right text-muted"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* APPOINTMENT REPORTS SECTION */}
        {/* ================================================================ */}
        <div className="mb-4">
          <div
            className="d-flex align-items-center gap-2 mb-3"
            onClick={() => setActiveSection(activeSection === 'appointments' ? null : 'appointments')}
            style={{ cursor: 'pointer' }}
          >
            <i className={`ti ti-chevron-${activeSection === 'appointments' ? 'down' : 'right'} text-muted`}></i>
            <h5 className="fw-bold mb-0">
              <i className="ti ti-calendar-event text-info me-2"></i>
              Rapoarte Programari
            </h5>
          </div>

          <div className="row">
            {/* Appointment Stats */}
            <div className="col-lg-3 col-md-6 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardBody className="d-flex flex-column justify-content-center">
                  <div className="text-center">
                    <div className="fs-1 fw-bold text-primary">{data.appointments.total}</div>
                    <div className="text-muted mb-3">Total Programari</div>
                    <div className="d-flex justify-content-around">
                      <div>
                        <div className="fw-bold text-success">{data.appointments.completed}</div>
                        <div className="text-muted small">Finalizate</div>
                      </div>
                      <div>
                        <div className="fw-bold text-danger">{data.appointments.cancelled}</div>
                        <div className="text-muted small">Anulate</div>
                      </div>
                      <div>
                        <div className="fw-bold text-warning">{data.appointments.noShow}</div>
                        <div className="text-muted small">No-show</div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Attendance Rate */}
            <div className="col-lg-3 col-md-6 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardBody className="d-flex flex-column justify-content-center">
                  <div className="text-center">
                    <DonutChart
                      data={[
                        { label: 'Prezenti', value: data.appointments.completed, color: '#198754' },
                        { label: 'No-show', value: data.appointments.noShow, color: '#dc3545' },
                        { label: 'Anulat', value: data.appointments.cancelled, color: '#6c757d' },
                      ]}
                      centerLabel="Prezenta"
                      centerValue={`${data.appointments.attendanceRate.toFixed(0)}%`}
                      size={120}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Wait Time & Duration */}
            <div className="col-lg-3 col-md-6 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader>
                  <h6 className="fw-bold mb-0">Timp Mediu</h6>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column gap-4">
                    <div className="text-center p-3 bg-light rounded">
                      <i className="ti ti-clock-hour-4 text-warning fs-3 mb-2 d-block"></i>
                      <div className="fs-4 fw-bold">{data.appointments.avgWaitTime} min</div>
                      <div className="text-muted small">Asteptare</div>
                    </div>
                    <div className="text-center p-3 bg-light rounded">
                      <i className="ti ti-hourglass text-info fs-3 mb-2 d-block"></i>
                      <div className="fs-4 fw-bold">{data.appointments.avgDuration} min</div>
                      <div className="text-muted small">Durata medie</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* By Service Type */}
            <div className="col-lg-3 col-md-6 mb-4">
              <Card className="shadow-sm" fullHeight>
                <CardHeader>
                  <h6 className="fw-bold mb-0">Pe Tip Serviciu</h6>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column gap-2">
                    {data.appointments.byServiceType.map((service, idx) => (
                      <div key={idx}>
                        <div className="d-flex justify-content-between align-items-center small mb-1">
                          <span className="text-truncate">{service.type}</span>
                          <span className="fw-medium">{service.count}</span>
                        </div>
                        <div className="progress" style={{ height: 4 }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${service.percentage}%`,
                              backgroundColor: ['#0d6efd', '#198754', '#dc3545', '#fd7e14', '#6f42c1', '#20c997'][idx],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Appointment Heatmap */}
          <div className="row">
            <div className="col-12 mb-4">
              <Card className="shadow-sm">
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-1">Harta Programari pe Ora / Zi</h6>
                    <p className="text-muted small mb-0">
                      Varful: {data.appointments.peakDay} intre {data.appointments.peakHour}
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small text-muted">Intensitate:</span>
                    <div
                      className="d-flex gap-1"
                      style={{ background: 'linear-gradient(to right, var(--bs-success-bg-subtle), var(--bs-danger))', width: 80, height: 12, borderRadius: 4 }}
                    ></div>
                  </div>
                </CardHeader>
                <CardBody>
                  <Heatmap data={data.appointments.heatmap} xLabels={HOURS_OF_DAY} yLabels={DAYS_OF_WEEK} />
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PROVIDER PERFORMANCE SECTION */}
        {/* ================================================================ */}
        <div className="mb-4">
          <div
            className="d-flex align-items-center gap-2 mb-3"
            onClick={() => setActiveSection(activeSection === 'providers' ? null : 'providers')}
            style={{ cursor: 'pointer' }}
          >
            <i className={`ti ti-chevron-${activeSection === 'providers' ? 'down' : 'right'} text-muted`}></i>
            <h5 className="fw-bold mb-0">
              <i className="ti ti-stethoscope text-purple me-2"></i>
              Performanta Furnizori
            </h5>
          </div>

          <div className="row">
            <div className="col-12 mb-4">
              <Card className="shadow-sm">
                <CardHeader className="d-flex align-items-center justify-content-between">
                  <h6 className="fw-bold mb-0">Analiza Detaliata Furnizori</h6>
                  <Button variant="outline-primary" size="sm" icon="ti ti-file-export">
                    Export Detaliat
                  </Button>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Furnizor</th>
                          <th className="text-center">Programari</th>
                          <th className="text-center">Finalizate</th>
                          <th className="text-end">Venituri</th>
                          <th className="text-end">Medie/Vizita</th>
                          <th className="text-center">Utilizare</th>
                          <th className="text-center">No-show</th>
                          <th className="text-center">Asteptare</th>
                          <th className="text-center">Rating</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.providers.map((provider) => (
                          <>
                            <tr
                              key={provider.id}
                              className="cursor-pointer"
                              onClick={() =>
                                setExpandedProvider(expandedProvider === provider.id ? null : provider.id)
                              }
                              style={{ cursor: 'pointer' }}
                            >
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="avatar avatar-sm bg-primary-transparent rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: 36, height: 36 }}
                                  >
                                    <span className="avatar-text small">{provider.avatar}</span>
                                  </div>
                                  <div>
                                    <div className="fw-medium">{provider.name}</div>
                                    <div className="text-muted small">{provider.specialty}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                <span className="badge badge-soft-info px-3 py-2">{provider.appointments}</span>
                              </td>
                              <td className="text-center">
                                <span className="badge badge-soft-success px-3 py-2">
                                  {provider.completedAppointments}
                                </span>
                              </td>
                              <td className="text-end">
                                <span className="fw-bold text-success">{formatCurrency(provider.revenue)}</span>
                              </td>
                              <td className="text-end">
                                <span className="text-muted">{formatCurrency(provider.avgPerVisit)}</span>
                              </td>
                              <td className="text-center">
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <div
                                    className="progress flex-grow-1"
                                    style={{ height: 6, width: 60, maxWidth: 60 }}
                                  >
                                    <div
                                      className={`progress-bar ${provider.utilization >= 85 ? 'bg-success' : provider.utilization >= 70 ? 'bg-warning' : 'bg-danger'}`}
                                      style={{ width: `${provider.utilization}%` }}
                                    />
                                  </div>
                                  <span className="small fw-medium">{provider.utilization}%</span>
                                </div>
                              </td>
                              <td className="text-center">
                                <span
                                  className={`badge ${provider.noShowRate <= 3 ? 'badge-soft-success' : provider.noShowRate <= 5 ? 'badge-soft-warning' : 'badge-soft-danger'}`}
                                >
                                  {provider.noShowRate}%
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="text-muted">{provider.avgWaitTime} min</span>
                              </td>
                              <td className="text-center">
                                <div className="d-flex align-items-center justify-content-center gap-1">
                                  <i className="ti ti-star-filled text-warning" style={{ fontSize: 14 }}></i>
                                  <span className="fw-medium">{provider.rating}</span>
                                </div>
                              </td>
                              <td>
                                <i
                                  className={`ti ti-chevron-${expandedProvider === provider.id ? 'up' : 'down'} text-muted`}
                                ></i>
                              </td>
                            </tr>
                            {expandedProvider === provider.id && (
                              <tr key={`${provider.id}-details`}>
                                <td colSpan={10} className="bg-light">
                                  <div className="p-3">
                                    <div className="row g-3">
                                      <div className="col-md-3">
                                        <div className="p-3 bg-white rounded">
                                          <div className="text-muted small mb-1">Eficienta Programari</div>
                                          <div className="d-flex align-items-baseline gap-2">
                                            <span className="fs-4 fw-bold">
                                              {Math.round(
                                                (provider.completedAppointments / provider.appointments) * 100
                                              )}
                                              %
                                            </span>
                                            <span className="text-success small">
                                              <i className="ti ti-trending-up"></i> +2.3%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="p-3 bg-white rounded">
                                          <div className="text-muted small mb-1">Satisfactie Pacienti</div>
                                          <div className="d-flex align-items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <i
                                                key={star}
                                                className={`ti ti-star${star <= Math.floor(provider.rating) ? '-filled' : ''} text-warning`}
                                              ></i>
                                            ))}
                                            <span className="fw-medium ms-1">{provider.rating}/5</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="p-3 bg-white rounded">
                                          <div className="text-muted small mb-1">Timp Raspuns</div>
                                          <div className="fs-4 fw-bold">{provider.avgWaitTime} min</div>
                                        </div>
                                      </div>
                                      <div className="col-md-3">
                                        <div className="p-3 bg-white rounded">
                                          <div className="text-muted small mb-1">Total Luna</div>
                                          <div className="fs-4 fw-bold text-success">
                                            {formatCurrency(provider.revenue)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Schedule Report Modal */}
        {showScheduleModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="ti ti-clock me-2"></i>
                    Programeaza Raport Automat
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowScheduleModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Frecventa</label>
                    <select className="form-select">
                      <option value="daily">Zilnic</option>
                      <option value="weekly">Saptamanal</option>
                      <option value="monthly" selected>
                        Lunar
                      </option>
                      <option value="quarterly">Trimestrial</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Format</label>
                    <select className="form-select">
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel (CSV)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Destinatari Email</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="email1@clinica.ro, email2@clinica.ro"
                    />
                    <div className="form-text">Separati adresele cu virgula</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sectiuni incluse</label>
                    <div className="d-flex flex-wrap gap-2">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="secFinancial" checked />
                        <label className="form-check-label" htmlFor="secFinancial">
                          Financiar
                        </label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="secPatients" checked />
                        <label className="form-check-label" htmlFor="secPatients">
                          Pacienti
                        </label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="secAppointments" checked />
                        <label className="form-check-label" htmlFor="secAppointments">
                          Programari
                        </label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="secProviders" checked />
                        <label className="form-check-label" htmlFor="secProviders">
                          Furnizori
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
                    Anuleaza
                  </Button>
                  <Button
                    variant="primary"
                    icon="ti ti-check"
                    onClick={() => {
                      alert('Raport programat cu succes!');
                      setShowScheduleModal(false);
                    }}
                  >
                    Programeaza
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default ReportsPage;
