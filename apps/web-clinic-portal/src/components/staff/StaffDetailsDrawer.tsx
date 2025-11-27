/**
 * StaffDetailsDrawer Component
 *
 * Side drawer for quick viewing staff member details.
 * Shows complete profile info, recent activity, schedule overview,
 * and quick edit option.
 */

import { Modal, Button, Badge } from '../ui-new';
import type { StaffMember } from '../../routes/StaffPage';

interface RoleConfig {
  label: string;
  color: string;
  icon: string;
}

interface StatusConfig {
  label: string;
  color: string;
}

export interface StaffDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  roleConfig: Record<StaffMember['role'], RoleConfig>;
  statusConfig: Record<StaffMember['status'], StatusConfig>;
  onEdit: (staff: StaffMember) => void;
}

// Mock recent activity data
const mockRecentActivity = [
  {
    id: '1',
    type: 'login',
    description: 'Autentificare in sistem',
    timestamp: '2025-11-27T09:30:00',
  },
  {
    id: '2',
    type: 'appointment',
    description: 'Consultatie - Pacient Ion Popescu',
    timestamp: '2025-11-27T10:00:00',
  },
  {
    id: '3',
    type: 'note',
    description: 'Adaugare nota clinica',
    timestamp: '2025-11-27T10:45:00',
  },
  {
    id: '4',
    type: 'treatment',
    description: 'Plan tratament finalizat - Maria Ionescu',
    timestamp: '2025-11-26T15:30:00',
  },
  {
    id: '5',
    type: 'logout',
    description: 'Deconectare din sistem',
    timestamp: '2025-11-26T18:00:00',
  },
];

// Activity type icons
const activityIcons: Record<string, { icon: string; color: string }> = {
  login: { icon: 'ti ti-login', color: 'success' },
  logout: { icon: 'ti ti-logout', color: 'secondary' },
  appointment: { icon: 'ti ti-calendar-event', color: 'primary' },
  note: { icon: 'ti ti-notes', color: 'info' },
  treatment: { icon: 'ti ti-clipboard-check', color: 'warning' },
  default: { icon: 'ti ti-activity', color: 'secondary' },
};

export function StaffDetailsDrawer({
  open,
  onClose,
  staff,
  roleConfig,
  statusConfig,
  onEdit,
}: StaffDetailsDrawerProps) {
  if (!staff) return null;

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getRoleColorClass = (role: StaffMember['role']): string => {
    return roleConfig[role].color.replace('soft-', '');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `Acum ${diffMins} min`;
    if (diffHours < 24) return `Acum ${diffHours} ore`;
    if (diffDays === 1) return 'Ieri';
    return `Acum ${diffDays} zile`;
  };

  // Calculate days since hire
  const daysSinceHire = Math.floor(
    (new Date().getTime() - new Date(staff.hireDate).getTime()) / 86400000
  );
  const yearsSinceHire = Math.floor(daysSinceHire / 365);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalii Angajat"
      icon="ti ti-user"
      drawer
      drawerPosition="right"
      size="lg"
      footer={
        <div className="d-flex gap-2 w-100">
          <Button variant="light" onClick={onClose} className="flex-1">
            Inchide
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(staff);
            }}
            className="flex-1"
          >
            <i className="ti ti-edit me-1"></i>
            Editeaza
          </Button>
        </div>
      }
    >
      {/* Profile Header */}
      <div className="text-center mb-4 pb-4 border-bottom">
        {/* Avatar */}
        <div
          className={`avatar avatar-xl bg-${getRoleColorClass(staff.role)}-transparent rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center`}
          style={{ width: 100, height: 100 }}
        >
          {staff.avatar ? (
            <img
              src={staff.avatar}
              alt={`${staff.firstName} ${staff.lastName}`}
              className="avatar-img rounded-circle"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span className={`fs-1 fw-semibold text-${getRoleColorClass(staff.role)}`}>
              {getInitials(staff.firstName, staff.lastName)}
            </span>
          )}
        </div>

        {/* Name & Role */}
        <h4 className="mb-2">
          {staff.firstName} {staff.lastName}
        </h4>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <Badge variant={roleConfig[staff.role].color as 'soft-primary'}>
            <i className={`${roleConfig[staff.role].icon} me-1`}></i>
            {roleConfig[staff.role].label}
          </Badge>
          <Badge variant={statusConfig[staff.status].color as 'soft-success'}>
            {statusConfig[staff.status].label}
          </Badge>
        </div>
        <p className="text-muted mb-0">{staff.department}</p>
      </div>

      {/* Contact Info */}
      <div className="mb-4">
        <h6 className="text-muted fw-semibold mb-3">
          <i className="ti ti-address-book me-2"></i>
          Informatii Contact
        </h6>
        <div className="card bg-light border-0">
          <div className="card-body py-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="avatar avatar-sm bg-primary-transparent rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36 }}
              >
                <i className="ti ti-mail text-primary"></i>
              </div>
              <div>
                <small className="text-muted d-block">Email</small>
                <a href={`mailto:${staff.email}`} className="text-dark">
                  {staff.email}
                </a>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div
                className="avatar avatar-sm bg-success-transparent rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36 }}
              >
                <i className="ti ti-phone text-success"></i>
              </div>
              <div>
                <small className="text-muted d-block">Telefon</small>
                <a href={`tel:${staff.phone}`} className="text-dark">
                  {staff.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {staff.role === 'doctor' && (
        <div className="mb-4">
          <h6 className="text-muted fw-semibold mb-3">
            <i className="ti ti-chart-bar me-2"></i>
            Statistici
          </h6>
          <div className="row g-3">
            <div className="col-6">
              <div className="card bg-primary-transparent border-0">
                <div className="card-body text-center py-3">
                  <h3 className="text-primary mb-1">{staff.patientsCount || 0}</h3>
                  <small className="text-muted">Pacienti</small>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-success-transparent border-0">
                <div className="card-body text-center py-3">
                  <h3 className="text-success mb-1">
                    {yearsSinceHire > 0 ? `${yearsSinceHire} ani` : `${daysSinceHire} zile`}
                  </h3>
                  <small className="text-muted">Experienta</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Specializations */}
      {staff.specializations.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted fw-semibold mb-3">
            <i className="ti ti-certificate me-2"></i>
            Specializari
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {staff.specializations.map((spec, idx) => (
              <Badge key={idx} variant="soft-primary">
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Overview */}
      <div className="mb-4">
        <h6 className="text-muted fw-semibold mb-3">
          <i className="ti ti-calendar-time me-2"></i>
          Program Lucru
        </h6>
        <div className="card bg-light border-0">
          <div className="card-body py-2 px-3">
            {staff.schedule ? (
              <ul className="list-unstyled mb-0">
                {Object.entries(staff.schedule).map(([day, hours]) => (
                  <li
                    key={day}
                    className="d-flex justify-content-between py-1 border-bottom last-no-border"
                  >
                    <span className="text-capitalize">{day}</span>
                    <span className="text-muted">{hours}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted py-2">
                <i className="ti ti-calendar-off fs-4 mb-2 d-block"></i>
                <small>Program nesetat</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employment Info */}
      <div className="mb-4">
        <h6 className="text-muted fw-semibold mb-3">
          <i className="ti ti-briefcase me-2"></i>
          Informatii Angajare
        </h6>
        <div className="card bg-light border-0">
          <div className="card-body py-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Data angajarii</span>
              <span className="fw-medium">{formatDate(staff.hireDate)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Departament</span>
              <span className="fw-medium">{staff.department}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">ID Angajat</span>
              <span className="fw-medium text-muted font-monospace">{staff.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted fw-semibold mb-0">
            <i className="ti ti-history me-2"></i>
            Activitate Recenta
          </h6>
          <Button variant="link" size="sm" className="p-0 text-muted">
            Vezi tot
          </Button>
        </div>
        <div className="activity-timeline">
          {mockRecentActivity.slice(0, 5).map((activity, idx) => {
            const activityStyle = activityIcons[activity.type] || activityIcons.default;
            return (
              <div
                key={activity.id}
                className={`d-flex gap-3 ${idx < mockRecentActivity.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}`}
              >
                <div
                  className={`avatar avatar-xs bg-${activityStyle.color}-transparent rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                  style={{ width: 32, height: 32 }}
                >
                  <i className={`${activityStyle.icon} text-${activityStyle.color} fs-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="mb-0 text-truncate">{activity.description}</p>
                  <small className="text-muted">
                    {formatRelativeTime(activity.timestamp)} - {formatTime(activity.timestamp)}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-top pt-4">
        <h6 className="text-muted fw-semibold mb-3">
          <i className="ti ti-bolt me-2"></i>
          Actiuni Rapide
        </h6>
        <div className="d-flex flex-wrap gap-2">
          <Button
            variant="soft-primary"
            size="sm"
            onClick={() => window.open(`mailto:${staff.email}`, '_blank')}
          >
            <i className="ti ti-mail me-1"></i>
            Email
          </Button>
          <Button
            variant="soft-success"
            size="sm"
            onClick={() => window.open(`tel:${staff.phone}`, '_blank')}
          >
            <i className="ti ti-phone me-1"></i>
            Suna
          </Button>
          <Button variant="soft-info" size="sm" onClick={() => console.log('View calendar')}>
            <i className="ti ti-calendar me-1"></i>
            Calendar
          </Button>
          <Button variant="soft-warning" size="sm" onClick={() => console.log('View reports')}>
            <i className="ti ti-report me-1"></i>
            Rapoarte
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default StaffDetailsDrawer;
