/**
 * Patient Context Bar - Sticky patient information header for clinical workflows
 *
 * Displays essential patient information, medical alerts, quick stats,
 * and common actions. Always visible while charting.
 */

import { useState } from 'react';
import { Badge } from '../ui-new/Badge';
import { Button } from '../ui-new/Button';

interface PatientAlert {
  allergies?: Array<{ allergen: string; severity?: string; reaction?: string }>;
  medicalConditions?: Array<{ condition: string; icd10Code?: string; status?: string }>;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date;
  gender?: string;
  photo?: { url?: string; thumbnail?: string };
  alerts?: PatientAlert;
}

interface PatientQuickStats {
  lastVisit?: string;
  treatmentPlanStatus?: 'none' | 'pending' | 'in_progress' | 'completed';
  balance?: number;
  upcomingAppointments?: number;
}

interface PatientContextBarProps {
  patient: Patient;
  quickStats?: PatientQuickStats;
  onAddNote?: () => void;
  onCreateTreatmentPlan?: () => void;
  onViewHistory?: () => void;
  onViewFinancials?: () => void;
  sticky?: boolean;
}

export function PatientContextBar({
  patient,
  quickStats,
  onAddNote,
  onCreateTreatmentPlan,
  onViewHistory,
  onViewFinancials,
  sticky = true,
}: PatientContextBarProps) {
  const [showAlertDetails, setShowAlertDetails] = useState(false);

  const getPatientAge = () => {
    if (!patient.dateOfBirth) return null;
    const birthDate = typeof patient.dateOfBirth === 'string'
      ? new Date(patient.dateOfBirth)
      : patient.dateOfBirth;
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getPatientInitials = () => {
    const firstName = patient.firstName || '';
    const lastName = patient.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const allergiesCount = patient.alerts?.allergies?.length || 0;
  const conditionsCount = patient.alerts?.medicalConditions?.length || 0;
  const hasAlerts = allergiesCount > 0 || conditionsCount > 0;

  const treatmentStatusConfig = {
    none: { label: 'Fara Plan', variant: 'soft-secondary' as const },
    pending: { label: 'In Asteptare', variant: 'soft-warning' as const },
    in_progress: { label: 'In Derulare', variant: 'soft-info' as const },
    completed: { label: 'Finalizat', variant: 'soft-success' as const },
  };

  return (
    <div
      className={`patient-context-bar bg-white border-bottom shadow-sm ${
        sticky ? 'sticky-top' : ''
      }`}
      style={sticky ? { top: 0, zIndex: 1020 } : {}}
    >
      <div className="container-fluid py-3">
        <div className="row align-items-center g-3">
          {/* Patient Identity Section */}
          <div className="col-lg-3 col-md-6">
            <div className="d-flex align-items-center gap-3">
              {/* Avatar */}
              <div className="position-relative">
                {patient.photo?.thumbnail || patient.photo?.url ? (
                  <img
                    src={patient.photo.thumbnail || patient.photo.url}
                    alt={`${patient.firstName} ${patient.lastName}`}
                    className="rounded-circle"
                    style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="avatar avatar-xl rounded-circle bg-primary-light">
                    <span className="avatar-text text-primary fw-bold fs-5">
                      {getPatientInitials()}
                    </span>
                  </div>
                )}
                {/* Online Indicator (future feature) */}
                <span
                  className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                  style={{ width: '14px', height: '14px' }}
                  title="Activ in Portal Pacient"
                />
              </div>

              {/* Patient Info */}
              <div className="flex-grow-1 min-w-0">
                <h5 className="mb-0 fw-bold text-truncate">
                  {patient.firstName} {patient.lastName}
                </h5>
                <div className="d-flex gap-2 text-muted small">
                  {getPatientAge() && <span>{getPatientAge()} ani</span>}
                  {getPatientAge() && patient.gender && <span>•</span>}
                  {patient.gender && (
                    <span className="text-capitalize">
                      {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : patient.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Medical Alerts Section */}
          <div className="col-lg-3 col-md-6">
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {!hasAlerts ? (
                  <Badge variant="soft-success" icon="ti ti-check" size="sm">
                    Fara Alerte Medicale
                  </Badge>
                ) : (
                  <>
                    {allergiesCount > 0 && (
                      <Badge
                        variant="soft-danger"
                        icon="ti ti-alert-triangle"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setShowAlertDetails(!showAlertDetails)}
                      >
                        {allergiesCount} Alerg{allergiesCount === 1 ? 'ie' : 'ii'}
                      </Badge>
                    )}
                    {conditionsCount > 0 && (
                      <Badge
                        variant="soft-warning"
                        icon="ti ti-heart-pulse"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setShowAlertDetails(!showAlertDetails)}
                      >
                        {conditionsCount} Afectiune{conditionsCount === 1 ? '' : 'i'}
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* Alert Details Dropdown */}
              {showAlertDetails && hasAlerts && (
                <div className="card position-absolute mt-5 shadow-lg" style={{ zIndex: 1030, minWidth: '300px' }}>
                  <div className="card-body p-3">
                    {allergiesCount > 0 && (
                      <div className="mb-3">
                        <div className="fw-semibold text-danger mb-2">
                          <i className="ti ti-alert-triangle me-1"></i>
                          Alergii:
                        </div>
                        <ul className="list-unstyled mb-0">
                          {patient.alerts!.allergies!.map((allergy, idx) => (
                            <li key={idx} className="mb-1">
                              <span className="fw-medium">{allergy.allergen}</span>
                              {allergy.severity && (
                                <Badge variant="soft-danger" size="sm" className="ms-2">
                                  {allergy.severity}
                                </Badge>
                              )}
                              {allergy.reaction && (
                                <div className="text-muted small">{allergy.reaction}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {conditionsCount > 0 && (
                      <div>
                        <div className="fw-semibold text-warning mb-2">
                          <i className="ti ti-heart-pulse me-1"></i>
                          Afectiuni Medicale:
                        </div>
                        <ul className="list-unstyled mb-0">
                          {patient.alerts!.medicalConditions!.map((condition, idx) => (
                            <li key={idx} className="mb-1">
                              <span className="fw-medium">{condition.condition}</span>
                              {condition.status && (
                                <Badge variant="soft-secondary" size="sm" className="ms-2">
                                  {condition.status}
                                </Badge>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="col-lg-3 col-md-6">
            <div className="d-flex gap-3 flex-wrap">
              {quickStats?.lastVisit && (
                <div className="d-flex flex-column">
                  <span className="text-muted small">Ultima Vizita</span>
                  <span className="fw-semibold small">{formatDate(quickStats.lastVisit)}</span>
                </div>
              )}

              {quickStats?.treatmentPlanStatus && (
                <div className="d-flex flex-column">
                  <span className="text-muted small">Plan Tratament</span>
                  <Badge
                    variant={treatmentStatusConfig[quickStats.treatmentPlanStatus].variant}
                    size="sm"
                  >
                    {treatmentStatusConfig[quickStats.treatmentPlanStatus].label}
                  </Badge>
                </div>
              )}

              {quickStats?.balance !== undefined && (
                <div className="d-flex flex-column">
                  <span className="text-muted small">Sold Curent</span>
                  <span
                    className={`fw-semibold small ${
                      quickStats.balance > 0 ? 'text-danger' : 'text-success'
                    }`}
                  >
                    {quickStats.balance > 0 ? '+' : ''}
                    {quickStats.balance.toFixed(2)} RON
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="col-lg-3 col-md-6">
            <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
              {onAddNote && (
                <Button
                  variant="outline-primary"
                  icon="ti ti-notes"
                  size="sm"
                  onClick={onAddNote}
                  title="Adauga Nota Clinica (Shift+N)"
                >
                  Nota Noua
                </Button>
              )}

              {onCreateTreatmentPlan && (
                <Button
                  variant="outline-secondary"
                  icon="ti ti-list-check"
                  size="sm"
                  onClick={onCreateTreatmentPlan}
                  title="Creaza Plan Tratament (Shift+T)"
                >
                  Plan
                </Button>
              )}

              {/* More Actions Dropdown */}
              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  title="Mai multe actiuni"
                >
                  <i className="ti ti-dots-vertical"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {onViewHistory && (
                    <li>
                      <button className="dropdown-item" onClick={onViewHistory}>
                        <i className="ti ti-history me-2"></i>
                        Istoric Complet
                      </button>
                    </li>
                  )}
                  {onViewFinancials && (
                    <li>
                      <button className="dropdown-item" onClick={onViewFinancials}>
                        <i className="ti ti-receipt me-2"></i>
                        Situatie Financiara
                      </button>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <i className="ti ti-upload me-2"></i>
                      Incarca Fisier Medical
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <i className="ti ti-mail me-2"></i>
                      Trimite Mesaj
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
