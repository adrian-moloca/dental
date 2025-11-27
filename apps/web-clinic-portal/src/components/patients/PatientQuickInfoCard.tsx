/**
 * Patient Quick Info Card Component
 *
 * Compact card showing essential patient information on clinical pages.
 * Displays patient photo, name, age, last visit, treatment plan status, and medical alerts.
 * Can be placed on clinical pages to provide context about the patient being treated.
 */

import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../ui-new/Card';
import { Badge } from '../ui-new/Badge';
import { Button } from '../ui-new/Button';

interface _MedicalAlert {
  type: 'allergy' | 'condition' | 'medication';
  allergen?: string;
  condition?: string;
  severity?: string;
}

interface PatientQuickInfo {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date;
  gender?: 'male' | 'female' | 'other';
  photo?: {
    url?: string;
    thumbnail?: string;
  };
  lastVisitDate?: string | Date;
  treatmentPlanStatus?: 'none' | 'pending' | 'in_progress' | 'completed';
  balance?: number;
  medicalAlerts?: {
    allergies?: Array<{ allergen: string; severity?: string }>;
    conditions?: Array<{ condition: string }>;
    medications?: Array<{ name: string }>;
  };
}

interface PatientQuickInfoCardProps {
  patient: PatientQuickInfo;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

export function PatientQuickInfoCard({
  patient,
  compact = false,
  showActions = true,
  className = '',
}: PatientQuickInfoCardProps) {
  const navigate = useNavigate();

  const calculateAge = (dob: string | Date): number => {
    const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (): string => {
    return `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'dd MMM yyyy', { locale: ro });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const allergiesCount = patient.medicalAlerts?.allergies?.length || 0;
  const conditionsCount = patient.medicalAlerts?.conditions?.length || 0;
  const medicationsCount = patient.medicalAlerts?.medications?.length || 0;
  const hasAlerts = allergiesCount > 0 || conditionsCount > 0 || medicationsCount > 0;

  const treatmentStatusConfig = {
    none: { label: 'Fara Plan', variant: 'soft-secondary' as const },
    pending: { label: 'In Asteptare', variant: 'soft-warning' as const },
    in_progress: { label: 'In Derulare', variant: 'soft-info' as const },
    completed: { label: 'Finalizat', variant: 'soft-success' as const },
  };

  if (compact) {
    return (
      <Card className={`shadow-sm ${className}`}>
        <CardBody className="p-3">
          <div className="d-flex align-items-center gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {patient.photo?.thumbnail || patient.photo?.url ? (
                <img
                  src={patient.photo.thumbnail || patient.photo.url}
                  alt={`${patient.firstName} ${patient.lastName}`}
                  className="rounded-circle"
                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                />
              ) : (
                <div className="avatar avatar-lg rounded-circle bg-primary-light">
                  <span className="avatar-text text-primary fw-bold">{getInitials()}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow-1 min-w-0">
              <h6 className="mb-1 fw-bold text-truncate">
                {patient.firstName} {patient.lastName}
              </h6>
              <div className="d-flex flex-wrap gap-2 align-items-center small text-muted">
                {patient.dateOfBirth && <span>{calculateAge(patient.dateOfBirth)} ani</span>}
                {patient.dateOfBirth && patient.lastVisitDate && <span>•</span>}
                {patient.lastVisitDate && (
                  <span>Ultima vizita: {formatDate(patient.lastVisitDate)}</span>
                )}
              </div>
            </div>

            {/* Alerts Indicator */}
            {hasAlerts && (
              <div className="flex-shrink-0">
                <Badge variant="soft-danger" icon="ti ti-alert-triangle" size="sm">
                  {allergiesCount + conditionsCount} Alerte
                </Badge>
              </div>
            )}

            {/* Action */}
            {showActions && (
              <div className="flex-shrink-0">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  title="Vezi profil complet"
                >
                  <i className="ti ti-arrow-right"></i>
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardBody>
        {/* Header with Patient Info */}
        <div className="d-flex align-items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {patient.photo?.thumbnail || patient.photo?.url ? (
              <img
                src={patient.photo.thumbnail || patient.photo.url}
                alt={`${patient.firstName} ${patient.lastName}`}
                className="rounded-circle"
                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
              />
            ) : (
              <div className="avatar avatar-xl rounded-circle bg-primary-light">
                <span className="avatar-text text-primary fw-bold fs-4">{getInitials()}</span>
              </div>
            )}
          </div>

          {/* Patient Details */}
          <div className="flex-grow-1 min-w-0">
            <h5 className="mb-1 fw-bold">
              {patient.firstName} {patient.lastName}
            </h5>
            <div className="d-flex flex-wrap gap-2 align-items-center text-muted small mb-2">
              {patient.dateOfBirth && (
                <>
                  <span>{calculateAge(patient.dateOfBirth)} ani</span>
                  {patient.gender && <span>•</span>}
                </>
              )}
              {patient.gender && (
                <span className="text-capitalize">
                  {patient.gender === 'male' ? 'Barbat' : patient.gender === 'female' ? 'Femeie' : 'Altul'}
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="d-flex flex-wrap gap-3">
              {patient.lastVisitDate && (
                <div className="d-flex align-items-center gap-1 small">
                  <i className="ti ti-calendar-check text-info"></i>
                  <span className="text-muted">Ultima vizita:</span>
                  <span className="fw-medium">{formatDate(patient.lastVisitDate)}</span>
                </div>
              )}

              {patient.treatmentPlanStatus && (
                <div className="d-flex align-items-center gap-1 small">
                  <i className="ti ti-file-description text-warning"></i>
                  <span className="text-muted">Plan:</span>
                  <Badge variant={treatmentStatusConfig[patient.treatmentPlanStatus].variant} size="sm">
                    {treatmentStatusConfig[patient.treatmentPlanStatus].label}
                  </Badge>
                </div>
              )}

              {patient.balance !== undefined && patient.balance !== 0 && (
                <div className="d-flex align-items-center gap-1 small">
                  <i className={`ti ti-currency-lei ${patient.balance > 0 ? 'text-danger' : 'text-success'}`}></i>
                  <span className="text-muted">Sold:</span>
                  <span className={`fw-medium ${patient.balance > 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(patient.balance)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Alerts */}
        {hasAlerts && (
          <div className="alert alert-soft-danger mb-3">
            <div className="d-flex align-items-start gap-2">
              <i className="ti ti-alert-triangle text-danger mt-1"></i>
              <div className="flex-grow-1">
                <div className="fw-semibold text-danger mb-2">Alerte Medicale</div>
                <div className="d-flex flex-wrap gap-2">
                  {allergiesCount > 0 && (
                    <Badge variant="soft-danger" icon="ti ti-alert-circle" size="sm">
                      {allergiesCount} Alergi{allergiesCount === 1 ? 'e' : 'i'}
                    </Badge>
                  )}
                  {conditionsCount > 0 && (
                    <Badge variant="soft-warning" icon="ti ti-heart-pulse" size="sm">
                      {conditionsCount} Afectiune{conditionsCount === 1 ? '' : 'i'}
                    </Badge>
                  )}
                  {medicationsCount > 0 && (
                    <Badge variant="soft-info" icon="ti ti-pill" size="sm">
                      {medicationsCount} Medicament{medicationsCount === 1 ? '' : 'e'}
                    </Badge>
                  )}
                </div>

                {/* Expandable Alert Details */}
                <div className="mt-2 small">
                  {allergiesCount > 0 && (
                    <div className="mb-1">
                      <span className="text-danger fw-medium">Alergii: </span>
                      {patient.medicalAlerts!.allergies!.map((a, idx) => (
                        <span key={idx}>
                          {a.allergen}
                          {a.severity && ` (${a.severity})`}
                          {idx < patient.medicalAlerts!.allergies!.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {conditionsCount > 0 && (
                    <div className="mb-1">
                      <span className="text-warning fw-medium">Afectiuni: </span>
                      {patient.medicalAlerts!.conditions!.map((c, idx) => (
                        <span key={idx}>
                          {c.condition}
                          {idx < patient.medicalAlerts!.conditions!.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showActions && (
          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <i className="ti ti-user me-1"></i>
              Vezi Profil Complet
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(`/appointments?patientId=${patient.id}`)}
            >
              <i className="ti ti-calendar me-1"></i>
              Programari
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => navigate(`/billing?patientId=${patient.id}`)}
            >
              <i className="ti ti-file-invoice me-1"></i>
              Facturi
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
