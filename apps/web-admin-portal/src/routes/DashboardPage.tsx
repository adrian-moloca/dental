import { Row, Col, Table, Card as BsCard } from 'react-bootstrap';
import { AppShell } from '../components/layout';
import { KPICard, Badge } from '../components/ui';
import {
  mockOrganizations as organizations,
  mockCabinets as cabinets,
  mockSubscriptions as subscriptions,
  mockPlans as plans,
  mockModules as modules,
  mockUsers as users,
} from '../data/mockData';
// Types removed - Organization and Subscription currently unused

// Calculate real stats from mock data
const totalOrganizations = organizations.length;
const activeOrganizations = organizations.filter((o) => o.status === 'active').length;
const totalCabinets = cabinets.length;
const activeCabinets = cabinets.filter((c) => c.status === 'active').length;
const _totalSubscriptions = subscriptions.length;
const activeSubscriptions = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial').length;
const totalUsers = users.length;
const activeUsers = users.filter((u) => u.status === 'active').length;
const activeModules = modules.filter((m) => m.status === 'active').length;

// Calculate MRR
const mrr = subscriptions
  .filter((s) => s.status === 'active' || s.status === 'trial')
  .reduce((sum, s) => {
    if (s.billingCycle === 'monthly') return sum + s.monthlyPrice;
    return sum + s.monthlyPrice; // Use monthly price for yearly too for MRR
  }, 0);

const kpiData = [
  {
    title: 'Total Organizations',
    value: totalOrganizations.toString(),
    icon: <i className="ti ti-building text-primary fs-4" />,
    iconVariant: 'primary' as const,
    trend: { value: 12.5, isPositive: true },
    subtitle: `${activeOrganizations} active`,
  },
  {
    title: 'Active Cabinets',
    value: activeCabinets.toString(),
    icon: <i className="ti ti-building-hospital text-success fs-4" />,
    iconVariant: 'success' as const,
    trend: { value: 8.3, isPositive: true },
    subtitle: `${totalCabinets} total`,
  },
  {
    title: 'Monthly Revenue',
    value: `${mrr.toLocaleString('ro-RO')} RON`,
    icon: <i className="ti ti-currency-dollar text-warning fs-4" />,
    iconVariant: 'warning' as const,
    trend: { value: 15.2, isPositive: true },
    subtitle: `${activeSubscriptions} subscriptions`,
  },
  {
    title: 'Total Users',
    value: totalUsers.toString(),
    icon: <i className="ti ti-users text-info fs-4" />,
    iconVariant: 'info' as const,
    trend: { value: 5.1, isPositive: true },
    subtitle: `${activeUsers} active`,
  },
];

// Recent organizations
const recentOrganizations = organizations
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 5)
  .map((org) => ({
    id: org.id,
    name: org.name,
    cabinets: org.cabinetsCount,
    status: org.status,
    plan: subscriptions.find((s) => s.organizationId === org.id)?.planName || 'No Plan',
    date: getRelativeTime(org.createdAt),
  }));

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

// System health
const systemHealth = [
  { name: 'Auth Service', status: 'healthy', latency: '23ms', port: 3301 },
  { name: 'Scheduling Service', status: 'healthy', latency: '45ms', port: 3302 },
  { name: 'Patient Service', status: 'healthy', latency: '31ms', port: 3303 },
  { name: 'Clinical Service', status: 'healthy', latency: '28ms', port: 3304 },
  { name: 'Billing Service', status: 'healthy', latency: '42ms', port: 3305 },
  { name: 'Inventory Service', status: 'healthy', latency: '35ms', port: 3306 },
  { name: 'Enterprise Service', status: 'healthy', latency: '29ms', port: 3307 },
  { name: 'Subscription Service', status: 'healthy', latency: '33ms', port: 3309 },
];

const statusBadges: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  trial: { variant: 'info', label: 'Trial' },
  past_due: { variant: 'danger', label: 'Past Due' },
  suspended: { variant: 'warning', label: 'Suspended' },
  inactive: { variant: 'warning', label: 'Inactive' },
};

const healthBadges: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  healthy: { variant: 'success', label: 'Healthy' },
  degraded: { variant: 'warning', label: 'Degraded' },
  down: { variant: 'danger', label: 'Down' },
};

export default function DashboardPage() {
  const allHealthy = systemHealth.every((s) => s.status === 'healthy');

  return (
    <AppShell
      title="Dashboard"
      subtitle="Platform overview and key metrics"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        {kpiData.map((kpi, index) => (
          <Col key={index} sm={6} xl={3}>
            <KPICard {...kpi} />
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Recent Organizations */}
        <Col xl={8}>
          <BsCard className="border-0 shadow-sm h-100">
            <BsCard.Header className="bg-white border-bottom py-3">
              <div className="d-flex align-items-center gap-3">
                <div className="stats-icon primary">
                  <i className="ti ti-building" />
                </div>
                <div>
                  <h5 className="mb-0">Recent Organizations</h5>
                  <small className="text-muted">Latest registered organizations</small>
                </div>
              </div>
            </BsCard.Header>
            <BsCard.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Organization</th>
                    <th>Cabinets</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrganizations.map((org) => (
                    <tr key={org.id} className="cursor-pointer">
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="stats-icon primary" style={{ width: 36, height: 36 }}>
                            <i className="ti ti-building" />
                          </div>
                          <span className="fw-medium">{org.name}</span>
                        </div>
                      </td>
                      <td>{org.cabinets}</td>
                      <td>{org.plan}</td>
                      <td>
                        <Badge variant={statusBadges[org.status]?.variant || 'warning'} dot>
                          {statusBadges[org.status]?.label || org.status}
                        </Badge>
                      </td>
                      <td className="text-muted">{org.date}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </BsCard.Body>
          </BsCard>
        </Col>

        {/* System Health */}
        <Col xl={4}>
          <BsCard className="border-0 shadow-sm h-100">
            <BsCard.Header className="bg-white border-bottom py-3">
              <div className="d-flex align-items-center gap-3">
                <div className={`stats-icon ${allHealthy ? 'success' : 'warning'}`}>
                  <i className="ti ti-heartbeat" />
                </div>
                <div>
                  <h5 className="mb-0">System Health</h5>
                  <small className={allHealthy ? 'text-success' : 'text-warning'}>
                    {allHealthy ? 'All Systems Operational' : 'Some Issues Detected'}
                  </small>
                </div>
              </div>
            </BsCard.Header>
            <BsCard.Body className="p-3">
              <div className="d-flex flex-column gap-2">
                {systemHealth.map((service) => (
                  <div
                    key={service.name}
                    className="d-flex align-items-center justify-content-between p-2 rounded bg-light"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`d-inline-block rounded-circle ${
                          service.status === 'healthy'
                            ? 'bg-success'
                            : service.status === 'degraded'
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}
                        style={{ width: 8, height: 8 }}
                      />
                      <span className="small">{service.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">{service.latency}</span>
                      <Badge variant={healthBadges[service.status].variant} size="sm">
                        {healthBadges[service.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </BsCard.Body>
          </BsCard>
        </Col>
      </Row>

      {/* Quick Stats Row */}
      <Row className="g-4 mt-2">
        <Col md={4}>
          <BsCard className="border-0 shadow-sm">
            <BsCard.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="stats-icon" style={{ backgroundColor: 'var(--purple-transparent)', color: 'var(--purple)' }}>
                  <i className="ti ti-puzzle fs-4" />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{activeModules}</h3>
                  <small className="text-muted">Active Modules</small>
                </div>
              </div>
            </BsCard.Body>
          </BsCard>
        </Col>

        <Col md={4}>
          <BsCard className="border-0 shadow-sm">
            <BsCard.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="stats-icon secondary">
                  <i className="ti ti-package fs-4" />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{plans.length}</h3>
                  <small className="text-muted">Subscription Plans</small>
                </div>
              </div>
            </BsCard.Body>
          </BsCard>
        </Col>

        <Col md={4}>
          <BsCard className="border-0 shadow-sm">
            <BsCard.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="stats-icon danger">
                  <i className="ti ti-alert-triangle fs-4" />
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">
                    {subscriptions.filter((s) => s.status === 'past_due').length}
                  </h3>
                  <small className="text-muted">Past Due Subscriptions</small>
                </div>
              </div>
            </BsCard.Body>
          </BsCard>
        </Col>
      </Row>
    </AppShell>
  );
}
