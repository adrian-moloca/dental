/**
 * Patient Details Page - Modern Preclinic Design
 *
 * Comprehensive patient profile with medical alerts, stats, tabbed content, and quick actions.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient, usePatientBalance, useDeletePatient } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  StatusBadge,
  StatsCard,
  ConfirmModal,
  Breadcrumb,
  type BreadcrumbItem,
  Tooltip,
} from '../components/ui-new';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';

type TabType = 'overview' | 'timeline' | 'documents';

// Type definitions for nested data structures
interface Allergy {
  allergen: string;
  severity?: string;
  reaction?: string;
}

interface MedicalCondition {
  condition?: string;
}

interface Medication {
  name?: string;
  dosage?: string;
}

interface InsuranceInfo {
  provider?: string;
  policyNumber?: string;
  coverage?: {
    annual_max?: number;
    remaining?: number;
  };
}

interface FamilyMember {
  name?: string;
  relationship?: string;
  isPrimaryContact?: boolean;
}

interface AppointmentItem {
  id: string;
  status: string;
  startTime: string;
  appointmentType?: {
    name: string;
  };
  provider?: {
    firstName?: string;
    lastName?: string;
  };
  providerName?: string;
  notes?: string;
  reasonForVisit?: string;
}

export default function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/patients');
    }
  };

  // Fetch patient data
  const { data: patientData, isLoading, error } = usePatient(id);
  const { data: balanceData } = usePatientBalance(id);
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({
    patientId: id,
    limit: 10,
  });
  const deletePatient = useDeletePatient();

  const patient = patientData?.data;

  // Calculate stats
  const totalVisits = appointmentsData?.data?.filter((a: { status: string }) => a.status === 'completed')?.length || 0;
  const outstandingBalance = balanceData?.data?.currentBalance ?? 0;
  const lastVisit = appointmentsData?.data?.find((a: { status: string }) => a.status === 'completed');
  const nextAppointment = appointmentsData?.data?.find(
    (a: { status: string }) => a.status === 'scheduled' || a.status === 'confirmed'
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle delete
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    if (deletePatient.isPending) return; // Prevent double-click

    try {
      await deletePatient.mutateAsync(id);
      toast.success('Pacient sters cu succes');
      setShowDeleteConfirm(false);
      navigate('/patients');
    } catch {
      toast.error('Eroare la stergerea pacientului');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppShell title="Detalii Pacient">
        <Card className="shadow-sm">
          <CardBody>
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se incarca...</span>
              </div>
              <p className="text-muted mt-3">Se incarca detaliile pacientului...</p>
            </div>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <AppShell title="Detalii Pacient">
        <Card className="shadow-sm border-danger">
          <CardBody className="text-center py-5">
            <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
              <i className="ti ti-alert-circle fs-32 text-danger"></i>
            </div>
            <h5 className="fw-bold mb-2">Eroare la incarcarea pacientului</h5>
            <p className="text-muted mb-4">
              {error ? (error as Error).message : 'Pacientul nu a fost gasit'}
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button variant="outline-primary" onClick={() => window.location.reload()}>
                <i className="ti ti-refresh me-1"></i>
                Reincearca
              </Button>
              <Button variant="outline-secondary" onClick={handleBack}>
                <i className="ti ti-arrow-left me-1"></i>
                Inapoi
              </Button>
            </div>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  // Extract medical alerts
  const allergies = (patient.medicalHistory?.allergies || []) as Allergy[];
  const medicalConditions = (patient.medicalHistory?.conditions || []) as (MedicalCondition | string)[];
  const medications = (patient.medicalHistory?.medications || []) as (Medication | string)[];
  const hasAlerts = allergies.length > 0 || medicalConditions.length > 0 || medications.length > 0;

  // Breadcrumb navigation
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'ti ti-home' },
    { label: 'Pacienti', href: '/patients', icon: 'ti ti-users' },
    { label: `${patient.firstName} ${patient.lastName}`, icon: 'ti ti-user' },
  ];

  return (
    <AppShell
      title="Detalii Pacient"
      subtitle="Profil complet, contact si istoricul pacientului"
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleBack}>
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Button>
        </div>
      }
    >
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} className="mb-3" />
      {/* Patient Header Section */}
      <Card className="shadow-sm mb-4">
        <CardBody>
          <div className="row align-items-center">
            {/* Avatar and Name */}
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="avatar avatar-xxl rounded-circle bg-primary-transparent d-flex align-items-center justify-content-center"
                  style={{ fontSize: 32, fontWeight: 600 }}
                >
                  {patient.firstName?.[0]}
                  {patient.lastName?.[0]}
                </div>
                <div>
                  <h3 className="mb-1 fw-bold">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Badge variant="soft-secondary" size="sm">
                      ID: {patient.patientNumber || patient.id?.slice(0, 8)}
                    </Badge>
                    <StatusBadge status="active">Activ</StatusBadge>
                  </div>
                  <div className="text-muted small">
                    {patient.dateOfBirth && (
                      <>
                        <i className="ti ti-calendar me-1"></i>
                        {format(new Date(patient.dateOfBirth), 'dd MMMM yyyy', { locale: ro })}
                      </>
                    )}
                    {patient.dateOfBirth && patient.gender && ' • '}
                    {patient.gender && (
                      <>
                        <i className="ti ti-user me-1"></i>
                        {patient.gender === 'male' ? 'Barbat' : patient.gender === 'female' ? 'Femeie' : 'Altul'}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="col-md-6">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate(`/patients/${id}/edit`)}
                >
                  <i className="ti ti-edit me-1"></i>
                  Editeaza
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    navigate('/appointments/create', { state: { patientId: patient.id } })
                  }
                >
                  <i className="ti ti-calendar-plus me-1"></i>
                  Programeaza
                </Button>
                <Button
                  variant="soft-info"
                  size="sm"
                  onClick={() => navigate(`/clinical/charting?patientId=${patient.id}`)}
                >
                  <i className="ti ti-dental me-1"></i>
                  Fisa Clinica
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Medical Alerts Banner */}
      {hasAlerts && (
        <Card className="shadow-sm mb-4 border-danger">
          <CardHeader className="bg-danger-transparent">
            <h5 className="mb-0 text-danger">
              <i className="ti ti-alert-triangle me-2"></i>
              Alerte Medicale
            </h5>
          </CardHeader>
          <CardBody>
            <div className="row g-3">
              {/* Allergies */}
              {allergies.length > 0 && (
                <div className="col-md-4">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ti ti-alert-circle text-danger mt-1"></i>
                    <div>
                      <h6 className="mb-1 fw-bold text-danger">Alergii</h6>
                      <ul className="list-unstyled mb-0 small">
                        {allergies.map((allergy, idx) => (
                          <li key={idx}>
                            • {allergy.allergen}{' '}
                            {allergy.severity && (
                              <Badge variant="soft-danger" size="sm">
                                {allergy.severity}
                              </Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Conditions */}
              {medicalConditions.length > 0 && (
                <div className="col-md-4">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ti ti-heart-rate-monitor text-warning mt-1"></i>
                    <div>
                      <h6 className="mb-1 fw-bold text-warning">Conditii Medicale</h6>
                      <ul className="list-unstyled mb-0 small">
                        {medicalConditions.map((condition, idx) => (
                          <li key={idx}>• {typeof condition === 'string' ? condition : condition.condition}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Medications */}
              {medications.length > 0 && (
                <div className="col-md-4">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ti ti-pill text-info mt-1"></i>
                    <div>
                      <h6 className="mb-1 fw-bold text-info">Medicamente Curente</h6>
                      <ul className="list-unstyled mb-0 small">
                        {medications.map((med, idx) => (
                          <li key={idx}>
                            • {typeof med === 'string' ? med : med.name}{' '}
                            {typeof med !== 'string' && med.dosage && <span className="text-muted">({med.dosage})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            value={totalVisits}
            label="Vizite Totale"
            icon="ti ti-calendar-check"
            iconColor="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            value={formatCurrency(outstandingBalance)}
            label="Sold Restant"
            icon="ti ti-currency-lei"
            iconColor={outstandingBalance > 0 ? 'warning' : 'success'}
            footer={
              outstandingBalance > 0 ? (
                <Button
                  variant="soft-warning"
                  size="sm"
                  block
                  onClick={() => navigate(`/billing/payments/new?patientId=${id}`)}
                >
                  <i className="ti ti-cash me-1"></i>
                  Incaseaza
                </Button>
              ) : undefined
            }
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            value={
              lastVisit?.startTime
                ? (() => {
                    try {
                      return format(new Date(lastVisit.startTime), 'dd MMM yyyy', { locale: ro });
                    } catch {
                      return 'N/A';
                    }
                  })()
                : 'N/A'
            }
            label="Ultima Vizita"
            icon="ti ti-history"
            iconColor="info"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            value={
              nextAppointment?.startTime
                ? (() => {
                    try {
                      return format(new Date(nextAppointment.startTime), 'dd MMM yyyy', { locale: ro });
                    } catch {
                      return 'Niciuna';
                    }
                  })()
                : 'Niciuna'
            }
            label="Urmatoarea Programare"
            icon="ti ti-calendar-event"
            iconColor="success"
            footer={
              !nextAppointment ? (
                <Button
                  variant="soft-success"
                  size="sm"
                  block
                  onClick={() =>
                    navigate('/appointments/create', { state: { patientId: patient.id } })
                  }
                >
                  <i className="ti ti-plus me-1"></i>
                  Programeaza
                </Button>
              ) : undefined
            }
          />
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs nav-tabs-header mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            type="button"
          >
            <i className="ti ti-user me-2"></i>
            Prezentare Generala
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
            type="button"
          >
            <i className="ti ti-timeline me-2"></i>
            Istoric Vizite
            {totalVisits > 0 && (
              <Badge variant="soft-primary" size="sm" className="ms-2">
                {totalVisits}
              </Badge>
            )}
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
            type="button"
          >
            <i className="ti ti-file me-2"></i>
            Documente
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="row">
        {/* Main Content */}
        <div className="col-xl-8">
          {activeTab === 'overview' && (
            <>
              {/* Contact Information */}
              <Card className="shadow-sm mb-4">
                <CardHeader title="Informatii Contact" icon="ti ti-address-book" />
                <CardBody>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">Email</label>
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-mail text-primary"></i>
                        <span>{patient.emails?.[0]?.address || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">Telefon</label>
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-phone text-primary"></i>
                        <span>{patient.phones?.[0]?.number || 'N/A'}</span>
                      </div>
                    </div>
                    {patient.address && (
                      <div className="col-12">
                        <label className="form-label text-muted small mb-1">Adresa</label>
                        <div className="d-flex align-items-start gap-2">
                          <i className="ti ti-map-pin text-primary mt-1"></i>
                          <span>
                            {[
                              patient.address.street,
                              patient.address.city,
                              patient.address.state,
                              patient.address.postalCode,
                            ]
                              .filter(Boolean)
                              .join(', ') || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                    {patient.notes && (
                      <div className="col-12">
                        <label className="form-label text-muted small mb-1">Note</label>
                        <div className="alert alert-soft-info mb-0">
                          <i className="ti ti-note me-2"></i>
                          {patient.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Insurance Information */}
              {patient.insurance && Array.isArray(patient.insurance) && patient.insurance.length > 0 && (
                <Card className="shadow-sm mb-4">
                  <CardHeader title="Asigurare Medicala" icon="ti ti-shield-check" />
                  <CardBody>
                    {patient.insurance.map((ins: InsuranceInfo, idx: number) => (
                      <div
                        key={idx}
                        className={`${idx > 0 ? 'border-top pt-3 mt-3' : ''}`}
                      >
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-muted small mb-1">Furnizor</label>
                            <div>{ins.provider || 'N/A'}</div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small mb-1">
                              Numar Polita
                            </label>
                            <div>{ins.policyNumber || 'N/A'}</div>
                          </div>
                          {ins.coverage && (
                            <div className="col-12">
                              <label className="form-label text-muted small mb-1">
                                Acoperire
                              </label>
                              <div className="small">
                                Maxim anual: {formatCurrency(ins.coverage.annual_max || 0)} •
                                Ramas: {formatCurrency(ins.coverage.remaining || 0)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}

              {/* Family Members */}
              {patient.family?.members && Array.isArray(patient.family.members) && patient.family.members.length > 0 && (
                <Card className="shadow-sm mb-4">
                  <CardHeader title="Membrii Familiei" icon="ti ti-users-group" />
                  <CardBody>
                    <div className="list-group list-group-flush">
                      {patient.family.members.map((member: FamilyMember, idx: number) => (
                        <div
                          key={idx}
                          className="list-group-item d-flex justify-content-between align-items-center px-0"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar avatar-sm bg-secondary-transparent rounded-circle">
                              <i className="ti ti-user"></i>
                            </div>
                            <div>
                              <div className="fw-medium">{member.name || 'N/A'}</div>
                              <small className="text-muted">{member.relationship || ''}</small>
                            </div>
                          </div>
                          {member.isPrimaryContact && (
                            <Badge variant="soft-primary" size="sm">
                              Contact Principal
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {activeTab === 'timeline' && (
            <Card className="shadow-sm">
              <CardHeader title="Istoric Vizite" icon="ti ti-timeline" />
              <CardBody>
                {appointmentsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Se incarca...</span>
                    </div>
                  </div>
                ) : appointmentsData?.data && appointmentsData.data.length > 0 ? (
                  <div className="timeline">
                    {appointmentsData.data.map((appointment: AppointmentItem) => (
                      <div key={appointment.id} className="timeline-item">
                        <div className="timeline-marker">
                          <div
                            className={`avatar avatar-sm rounded-circle ${
                              appointment.status === 'completed'
                                ? 'bg-success-transparent'
                                : appointment.status === 'cancelled'
                                ? 'bg-danger-transparent'
                                : 'bg-primary-transparent'
                            }`}
                          >
                            <i
                              className={`ti ${
                                appointment.status === 'completed'
                                  ? 'ti-check'
                                  : appointment.status === 'cancelled'
                                  ? 'ti-x'
                                  : 'ti-calendar'
                              }`}
                            ></i>
                          </div>
                        </div>
                        <div className="timeline-content">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1 fw-bold">
                                {appointment.appointmentType?.name || 'Consultatie Generala'}
                              </h6>
                              <div className="text-muted small">
                                <i className="ti ti-calendar me-1"></i>
                                {format(new Date(appointment.startTime), 'dd MMMM yyyy, HH:mm', {
                                  locale: ro,
                                })}
                                {(appointment.providerName || (appointment.provider?.firstName && appointment.provider?.lastName)) && (
                                  <>
                                    {' • '}
                                    <i className="ti ti-user-md me-1"></i>
                                    {appointment.providerName || `${appointment.provider?.firstName} ${appointment.provider?.lastName}`}
                                  </>
                                )}
                              </div>
                            </div>
                            {appointment.status === 'completed' ? (
                              <StatusBadge status="completed">Finalizata</StatusBadge>
                            ) : appointment.status === 'cancelled' ? (
                              <StatusBadge status="cancelled">Anulata</StatusBadge>
                            ) : appointment.status === 'confirmed' ? (
                              <StatusBadge status="confirmed">Confirmata</StatusBadge>
                            ) : (
                              <StatusBadge status="scheduled">Programata</StatusBadge>
                            )}
                          </div>
                          {appointment.notes && (
                            <p className="mb-0 small text-muted">{appointment.notes}</p>
                          )}
                          {appointment.reasonForVisit && (
                            <div className="mt-2 small">
                              <span className="text-muted">Motiv: </span>
                              {appointment.reasonForVisit}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="ti ti-calendar-off fs-48 text-muted"></i>
                    <p className="text-muted mt-3 mb-0">Nicio vizita inregistrata</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === 'documents' && (
            <Card className="shadow-sm">
              <CardHeader
                title="Documente"
                icon="ti ti-file"
                actions={
                  <Button variant="soft-primary" size="sm">
                    <i className="ti ti-upload me-1"></i>
                    Incarca
                  </Button>
                }
              />
              <CardBody>
                <div className="text-center py-5">
                  <i className="ti ti-file-off fs-48 text-muted"></i>
                  <p className="text-muted mt-3 mb-0">Niciun document disponibil</p>
                  <p className="text-muted small">
                    Urca documente cum ar fi consimtaminte, radiografii sau rapoarte
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-xl-4">
          {/* Quick Actions */}
          <Card className="shadow-sm mb-4 sticky-top" style={{ top: 80 }}>
            <CardHeader title="Actiuni Rapide" icon="ti ti-bolt" />
            <CardBody>
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    navigate('/appointments/create', { state: { patientId: patient.id } })
                  }
                >
                  <i className="ti ti-calendar-plus me-2"></i>
                  Programeaza Vizita
                </Button>
                <Button
                  variant="soft-info"
                  onClick={() => navigate(`/clinical/charting?patientId=${patient.id}`)}
                >
                  <i className="ti ti-dental me-2"></i>
                  Fisa Clinica
                </Button>
                <Button
                  variant="soft-warning"
                  onClick={() => navigate(`/clinical/treatment-plans?patientId=${patient.id}`)}
                >
                  <i className="ti ti-file-description me-2"></i>
                  Plan Tratament
                </Button>
                <Button
                  variant="soft-success"
                  onClick={() => navigate(`/billing/invoices/new?patientId=${patient.id}`)}
                >
                  <i className="ti ti-file-invoice me-2"></i>
                  Factura Noua
                </Button>
                <Button
                  variant="soft-secondary"
                  onClick={() => navigate(`/patients/${id}/edit`)}
                >
                  <i className="ti ti-edit me-2"></i>
                  Editeaza Profil
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm mb-4">
            <CardHeader title="Activitate Recenta" icon="ti ti-activity" />
            <CardBody>
              <div className="text-center py-4">
                <i className="ti ti-history fs-48 text-muted"></i>
                <p className="text-muted mt-3 mb-0 small">Nicio activitate recenta</p>
              </div>
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-sm border-danger">
            <CardHeader className="bg-danger-transparent">
              <h6 className="mb-0 text-danger">
                <i className="ti ti-alert-triangle me-2"></i>
                Zona Periculoasa
              </h6>
            </CardHeader>
            <CardBody>
              <p className="text-muted small mb-3">
                Stergerea acestui pacient va elimina permanent toate datele asociate.
              </p>
              <Button
                variant="outline-danger"
                size="sm"
                block
                onClick={handleDeleteClick}
                disabled={deletePatient.isPending}
              >
                <i className="ti ti-trash me-2"></i>
                Sterge Pacient
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        type="danger"
        title="Sterge Pacient"
        message={`Esti sigur ca vrei sa stergi pacientul ${patient?.firstName} ${patient?.lastName}? Toate datele asociate (istoric medical, programari, facturi) vor fi sterse permanent. Aceasta actiune nu poate fi anulata.`}
        confirmText="Da, Sterge Definitiv"
        cancelText="Anuleaza"
        loading={deletePatient.isPending}
      />
    </AppShell>
  );
}
