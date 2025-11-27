/**
 * PatientSummaryCard Component
 *
 * Displays a summary of the selected patient's information.
 * Shows after patient is selected in appointment creation.
 */

import type { PatientDto } from '../../types/patient.types';

interface PatientSummaryCardProps {
  patient: PatientDto;
}

export function PatientSummaryCard({ patient }: PatientSummaryCardProps) {
  const primaryPhone = patient.phones?.find((p) => p.isPrimary) || patient.phones?.[0];
  const primaryEmail = patient.emails?.find((e) => e.isPrimary) || patient.emails?.[0];

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card border-start border-primary border-4">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div>
            <h5 className="card-title mb-1">
              {patient.firstName} {patient.lastName}
            </h5>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="text-muted small">
                {calculateAge(patient.dateOfBirth)} ani
              </span>
              {patient.gender && (
                <>
                  <span className="text-muted">•</span>
                  <span className="badge bg-secondary-subtle text-secondary text-capitalize">
                    {patient.gender}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="vstack gap-2">
          {/* Contact Information */}
          <div className="row g-3">
            {primaryPhone && (
              <div className="col-sm-6">
                <div className="d-flex align-items-center gap-2 small">
                  <i className="ti ti-phone text-muted" aria-hidden="true"></i>
                  <span>{primaryPhone.number}</span>
                  {primaryPhone.type && (
                    <span className="badge bg-light text-dark ms-auto">
                      {primaryPhone.type}
                    </span>
                  )}
                </div>
              </div>
            )}

            {primaryEmail && (
              <div className="col-sm-6">
                <div className="d-flex align-items-center gap-2 small">
                  <i className="ti ti-mail text-muted" aria-hidden="true"></i>
                  <span className="text-truncate">{primaryEmail.address}</span>
                </div>
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div className="d-flex align-items-center gap-2 small">
            <i className="ti ti-calendar text-muted" aria-hidden="true"></i>
            <span className="text-muted">Nascut:</span>
            <span>{formatDate(patient.dateOfBirth)}</span>
          </div>

          {/* Address */}
          {patient.address && (
            <div className="d-flex align-items-start gap-2 small">
              <i className="ti ti-map-pin text-muted mt-1" aria-hidden="true"></i>
              <span>
                {patient.address.street}, {patient.address.city}, {patient.address.state}{' '}
                {patient.address.postalCode}
              </span>
            </div>
          )}

          {/* Emergency Contact */}
          {patient.emergencyContact && (
            <div className="d-flex align-items-start gap-2 small pt-2 border-top">
              <i className="ti ti-alert-circle text-warning mt-1" aria-hidden="true"></i>
              <div>
                <span className="text-muted">Contact urgenta:</span>{' '}
                <span>
                  {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                </span>
                {patient.emergencyContact.phone && (
                  <span className="text-muted ms-2">
                    {patient.emergencyContact.phone}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Medical Notes/Alerts */}
          {patient.notes && (
            <div className="d-flex align-items-start gap-2 small pt-2 border-top">
              <i className="ti ti-info-circle text-info mt-1" aria-hidden="true"></i>
              <div>
                <span className="text-muted">Note:</span>{' '}
                <span>{patient.notes}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
