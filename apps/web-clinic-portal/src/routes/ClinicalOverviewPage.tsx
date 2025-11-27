/**
 * Clinical Overview Page
 *
 * Landing page for clinical data management.
 * Shows quick access to interventions, procedures catalog, and clinical settings.
 */

import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardBody, Badge } from '../components/ui-new';

// Quick stats for demo
const STATS = [
  { label: 'Interventii Active', value: 24, icon: 'ti-clipboard-check', color: 'primary', href: '/clinical/interventions' },
  { label: 'Proceduri Efectuate Luna', value: 156, icon: 'ti-activity', color: 'success', href: '/reports' },
  { label: 'Planuri Tratament Active', value: 18, icon: 'ti-file-description', color: 'info', href: '/patients' },
  { label: 'Pacienti cu Tratamente', value: 89, icon: 'ti-users', color: 'warning', href: '/patients' },
];

const QUICK_ACTIONS = [
  {
    title: 'Catalog Interventii',
    description: 'Configureaza interventiile si materialele necesare pentru deducere automata din stoc',
    icon: 'ti-clipboard-list',
    color: 'primary',
    href: '/clinical/interventions',
    badge: 'Recomandat',
  },
  {
    title: 'Creare Plan Tratament',
    description: 'Creeaza un plan de tratament nou pentru un pacient',
    icon: 'ti-file-plus',
    color: 'success',
    href: '/clinical/treatment-plans/create',
  },
  {
    title: 'Raport Proceduri',
    description: 'Vezi rapoartele detaliate despre procedurile efectuate',
    icon: 'ti-chart-bar',
    color: 'info',
    href: '/reports',
  },
  {
    title: 'Setari Clinice',
    description: 'Configureaza serviciile, preturile si timpii de lucru',
    icon: 'ti-settings',
    color: 'secondary',
    href: '/settings',
  },
];

const RECENT_PROCEDURES = [
  { patient: 'Ion Popescu', procedure: 'Obturatie compozit simpla', provider: 'Dr. Maria Ionescu', date: '2025-01-27', status: 'completed' },
  { patient: 'Ana Georgescu', procedure: 'Detartraj si periaj profesional', provider: 'Dr. Andrei Popa', date: '2025-01-27', status: 'completed' },
  { patient: 'Mihai Dumitrescu', procedure: 'Tratament endodontic', provider: 'Dr. Maria Ionescu', date: '2025-01-26', status: 'in_progress' },
  { patient: 'Elena Radu', procedure: 'Consultatie generala', provider: 'Dr. Andrei Popa', date: '2025-01-26', status: 'completed' },
  { patient: 'Vasile Marin', procedure: 'Extractie dinte', provider: 'Dr. Maria Ionescu', date: '2025-01-25', status: 'completed' },
];

export function ClinicalOverviewPage() {
  return (
    <AppShell
      title="Date Clinice"
      subtitle="Gestioneaza interventiile, procedurile si planurile de tratament"
    >
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/dashboard">Acasa</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Date Clinice</li>
        </ol>
      </nav>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {STATS.map((stat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <Link to={stat.href} className="text-decoration-none">
              <Card className="h-100 hover-shadow transition-all">
                <CardBody>
                  <div className="d-flex align-items-center gap-3">
                    <div className={`avatar avatar-lg bg-${stat.color}-subtle text-${stat.color} rounded`}>
                      <i className={`ti ${stat.icon} fs-4`}></i>
                    </div>
                    <div>
                      <div className="text-muted small">{stat.label}</div>
                      <div className="h4 mb-0 fw-bold">{stat.value}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <h5 className="fw-semibold mb-3">
            <i className="ti ti-bolt me-2 text-warning"></i>
            Actiuni Rapide
          </h5>
        </div>
        {QUICK_ACTIONS.map((action, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <Link to={action.href} className="text-decoration-none">
              <Card className="h-100 hover-lift transition-all border-0 shadow-sm">
                <CardBody className="text-center py-4">
                  <div className={`avatar avatar-xl bg-${action.color}-subtle text-${action.color} rounded-circle mx-auto mb-3`}>
                    <i className={`ti ${action.icon} fs-2`}></i>
                  </div>
                  <h6 className="fw-semibold mb-2">
                    {action.title}
                    {action.badge && (
                      <Badge variant="soft-success" size="sm" className="ms-2">
                        {action.badge}
                      </Badge>
                    )}
                  </h6>
                  <p className="text-muted small mb-0">{action.description}</p>
                </CardBody>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Procedures */}
      <div className="row g-4">
        <div className="col-12">
          <Card className="shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-semibold mb-0">
                  <i className="ti ti-history me-2 text-primary"></i>
                  Proceduri Recente
                </h5>
                <Link to="/reports" className="btn btn-sm btn-outline-primary">
                  <i className="ti ti-eye me-1"></i>
                  Vezi toate
                </Link>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Pacient</th>
                      <th>Procedura</th>
                      <th>Medic</th>
                      <th>Data</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_PROCEDURES.map((proc, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar avatar-sm bg-light rounded-circle">
                              <span className="text-muted small">
                                {proc.patient.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="fw-medium">{proc.patient}</span>
                          </div>
                        </td>
                        <td>{proc.procedure}</td>
                        <td className="text-muted">{proc.provider}</td>
                        <td className="text-muted">
                          {new Date(proc.date).toLocaleDateString('ro-RO', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td>
                          {proc.status === 'completed' ? (
                            <Badge variant="soft-success">
                              <i className="ti ti-check me-1"></i>
                              Finalizat
                            </Badge>
                          ) : (
                            <Badge variant="soft-warning">
                              <i className="ti ti-clock me-1"></i>
                              In curs
                            </Badge>
                          )}
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

      {/* Help Section */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-start gap-3 mb-0">
            <i className="ti ti-bulb fs-4"></i>
            <div>
              <h6 className="alert-heading mb-1">Sfat: Configureaza interventiile</h6>
              <p className="mb-2">
                Pentru a beneficia de deducerea automata a materialelor din stoc la finalizarea procedurilor,
                configureaza <strong>Catalogul de Interventii</strong> cu materialele necesare pentru fiecare procedura.
              </p>
              <Link to="/clinical/interventions" className="btn btn-sm btn-info">
                <i className="ti ti-arrow-right me-1"></i>
                Mergi la Catalog Interventii
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ClinicalOverviewPage;
