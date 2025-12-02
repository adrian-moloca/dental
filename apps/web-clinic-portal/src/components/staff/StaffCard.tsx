/**
 * StaffCard Component
 *
 * Card component for displaying staff member in grid view.
 * Features avatar, role badge, contact info, and quick actions.
 */

import { Badge } from '../ui-new';
import type { StaffMember } from '../../types/staff.types';

interface RoleConfig {
  label: string;
  color: string;
  icon: string;
}

interface StatusConfig {
  label: string;
  color: string;
}

export interface StaffCardProps {
  staff: StaffMember;
  roleConfig: Record<StaffMember['role'], RoleConfig>;
  statusConfig: Record<StaffMember['status'], StatusConfig>;
  onView: () => void;
  onEdit: () => void;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function StaffCard({
  staff,
  roleConfig,
  statusConfig,
  onView,
  onEdit,
  selected = false,
  onSelect,
}: StaffCardProps) {
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getRoleColorClass = (role: StaffMember['role']): string => {
    const color = roleConfig[role].color.replace('soft-', '');
    return color;
  };

  return (
    <div
      className={`card h-100 staff-card ${selected ? 'border-primary' : ''}`}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={onView}
    >
      <div className="card-body text-center p-4">
        {/* Selection Checkbox */}
        {onSelect && (
          <div
            className="position-absolute top-0 start-0 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="form-check-input"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="position-absolute top-0 end-0 p-3">
          <Badge variant={statusConfig[staff.status].color as 'soft-success'} size="sm">
            {statusConfig[staff.status].label}
          </Badge>
        </div>

        {/* Avatar */}
        <div className="mb-3 mt-2">
          <div
            className={`avatar avatar-lg bg-${getRoleColorClass(staff.role)}-transparent rounded-circle mx-auto d-flex align-items-center justify-content-center`}
            style={{ width: 80, height: 80 }}
          >
            {staff.avatar ? (
              <img
                src={staff.avatar}
                alt={`${staff.firstName} ${staff.lastName}`}
                className="avatar-img rounded-circle"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span
                className={`fs-2 fw-semibold text-${getRoleColorClass(staff.role)}`}
              >
                {getInitials(staff.firstName, staff.lastName)}
              </span>
            )}
          </div>
        </div>

        {/* Name & Role */}
        <h6 className="fw-bold mb-1">
          {staff.firstName} {staff.lastName}
        </h6>
        <Badge variant={roleConfig[staff.role].color as 'soft-primary'} className="mb-3">
          <i className={`${roleConfig[staff.role].icon} me-1`}></i>
          {roleConfig[staff.role].label}
        </Badge>

        {/* Department */}
        <p className="text-muted small mb-3">{staff.department}</p>

        {/* Specializations */}
        {staff.specializations.length > 0 && (
          <div className="d-flex gap-1 flex-wrap justify-content-center mb-3">
            {staff.specializations.slice(0, 2).map((spec: string, idx: number) => (
              <Badge key={idx} variant="soft-secondary" size="sm">
                {spec}
              </Badge>
            ))}
            {staff.specializations.length > 2 && (
              <Badge variant="soft-secondary" size="sm">
                +{staff.specializations.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="border-top pt-3">
          <div className="d-flex align-items-center justify-content-center gap-1 text-muted small mb-1">
            <i className="ti ti-mail"></i>
            <span className="text-truncate" style={{ maxWidth: 180 }}>
              {staff.email}
            </span>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-1 text-muted small">
            <i className="ti ti-phone"></i>
            <span>{staff.phone}</span>
          </div>
        </div>

        {/* Patient Count (for doctors) */}
        {staff.role === 'doctor' && typeof staff.patientsCount === 'number' && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <i className="ti ti-users text-primary"></i>
              <span className="fw-semibold">{staff.patientsCount}</span>
              <span className="text-muted small">pacienti</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="card-footer bg-light border-top p-2">
        <div className="d-flex justify-content-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onView}
            title="Vezi Detalii"
          >
            <i className="ti ti-eye"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={onEdit}
            title="Editeaza"
          >
            <i className="ti ti-edit"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => console.log('Schedule:', staff.id)}
            title="Program Lucru"
          >
            <i className="ti ti-calendar"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light"
            onClick={() => window.open(`mailto:${staff.email}`, '_blank')}
            title="Trimite Email"
          >
            <i className="ti ti-send"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffCard;
