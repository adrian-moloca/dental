/**
 * Clinical Page - Enhanced with Quick Actions
 *
 * Main clinical module entry point showing odontogram, clinical notes,
 * procedures, and treatment plans for a specific patient.
 *
 * ENHANCEMENTS:
 * - Quick Actions Panel in sidebar
 * - Patient Contact Actions (click-to-call, click-to-email)
 * - Floating Action Button for mobile-like quick access
 * - Keyboard shortcuts for navigation
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Badge } from '../components/ui-new/Badge';
import { Breadcrumb, type BreadcrumbItem } from '../components/ui-new/Breadcrumb';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
} from '../components/ui-new/Table';
import {
  useClinicalNotes,
  useTreatmentPlans,
  useProcedures,
  useOdontogram,
  useBulkUpdateTeeth,
} from '../hooks/useClinical';
import type {
  ToothConditionType,
  ToothSurface,
} from '../api/clinicalClient';
import { usePatient } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import { OdontogramEditor } from '../components/clinical/OdontogramEditor';
import { QuickActionsToolbar } from '../components/clinical/QuickActionsToolbar';
import { QuickActionsPanel } from '../components/clinical/QuickActionsPanel';
import { PatientContactActions } from '../components/clinical/PatientContactActions';
import { FloatingActionButton } from '../components/clinical/FloatingActionButton';
import clsx from 'clsx';
import toast from 'react-hot-toast';

type TabType = 'odontogram' | 'notes' | 'procedures' | 'plans';

// Extended patient interface to match backend response structure
interface PatientAlert {
  allergies?: Array<{ allergen: string; severity: string; reaction?: string }>;
  medicalConditions?: Array<{ condition: string; icd10Code?: string; status?: string }>;
}

interface ToothData {
  toothNumber: number;
  conditions: Array<{
    condition: string;
    surfaces: string[];
  }>;
}

export function ClinicalPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('odontogram');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/patients/${patientId}`);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if Shift is pressed and no input is focused
      if (!e.shiftKey || (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        return;
      }

      switch (e.key.toUpperCase()) {
        case 'N':
          e.preventDefault();
          setActiveTab('notes');
          toast.success('Shortcut: Note Clinice');
          break;
        case 'O':
          e.preventDefault();
          setActiveTab('odontogram');
          toast.success('Shortcut: Odontograma');
          break;
        case 'P':
          e.preventDefault();
          setActiveTab('procedures');
          toast.success('Shortcut: Proceduri');
          break;
        case 'T':
          e.preventDefault();
          setActiveTab('plans');
          toast.success('Shortcut: Planuri Tratament');
          break;
        case 'B':
          e.preventDefault();
          handleBack();
          break;
        case '?':
          e.preventDefault();
          toast.success('Comenzi rapide:\nShift+N: Note\nShift+O: Odontogram\nShift+P: Proceduri\nShift+T: Planuri\nShift+B: Inapoi', {
            duration: 6000
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, handleBack]);

  // Fetch patient data
  const { data: patientResponse, isLoading: patientLoading } = usePatient(patientId);
  const patient = patientResponse?.data;

  // Fetch clinical data
  const { data: notes, isLoading: notesLoading } = useClinicalNotes(patientId!);
  const { data: treatments, isLoading: treatmentsLoading } = useTreatmentPlans(patientId!);
  const { data: procedures, isLoading: proceduresLoading } = useProcedures(patientId!);
  const { data: odontogram, isLoading: odontogramLoading } = useOdontogram(patientId);
  const bulkUpdateTeeth = useBulkUpdateTeeth();

  // Fetch appointments for contact actions
  const { data: appointmentsData } = useAppointments({
    patientId,
    limit: 10,
  });

  const nextAppointment = appointmentsData?.data?.find(
    (a: { status: string }) => a.status === 'scheduled' || a.status === 'confirmed'
  );

  /**
   * Convert frontend ToothData format to backend BulkUpdateTeethDto format
   */
  const handleSaveOdontogram = async (data: ToothData[]) => {
    // Transform frontend format to backend bulk update format
    const teethUpdates = data.map((tooth) => ({
      toothNumber: tooth.toothNumber.toString(),
      conditions: tooth.conditions.map((c) => ({
        condition: c.condition as ToothConditionType,
        surfaces: (c.surfaces || []) as ToothSurface[],
      })),
    }));

    await bulkUpdateTeeth.mutateAsync({
      patientId: patientId!,
      data: {
        teeth: teethUpdates,
      },
    });
  };

  /**
   * Convert backend odontogram data to frontend ToothData format
   */
  const mapOdontogramToToothData = (odontogramData: OdontogramDto | undefined): ToothData[] => {
    if (!odontogramData?.teeth) return [];

    return Object.entries(odontogramData.teeth).map(([toothNumber, tooth]) => ({
      toothNumber: parseInt(toothNumber, 10),
      conditions: (tooth.conditions || [])
        .filter((c) => !c.deletedAt) // Only show active conditions
        .map((c) => ({
          condition: c.condition,
          surfaces: c.surfaces || [],
        })),
    }));
  };

  const getPatientAge = () => {
    if (!patient?.dateOfBirth) return null;
    const birthDate = new Date(patient.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPatientInitials = () => {
    if (!patient) return '?';
    const firstName = patient.firstName || '';
    const lastName = patient.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const alertsCount = () => {
    const patientWithAlerts = patient as typeof patient & { alerts?: PatientAlert };
    const allergies = patientWithAlerts?.alerts?.allergies?.length || 0;
    const conditions = patientWithAlerts?.alerts?.medicalConditions?.length || 0;
    return allergies + conditions;
  };

  // Tab definitions with shortcuts
  const tabs = [
    { id: 'odontogram' as TabType, label: 'Odontograma', icon: 'ti ti-dental', shortcut: 'Shift+O' },
    { id: 'notes' as TabType, label: 'Note Clinice', icon: 'ti ti-notes', shortcut: 'Shift+N' },
    { id: 'procedures' as TabType, label: 'Proceduri', icon: 'ti ti-clipboard-list', shortcut: 'Shift+P' },
    { id: 'plans' as TabType, label: 'Planuri Tratament', icon: 'ti ti-list-check', shortcut: 'Shift+T' },
  ];

  // Quick actions for common procedures
  const handleQuickProcedure = (procedureType: string) => {
    toast.success(`Adaugare rapida: ${procedureType}`, { icon: '⚡' });
    setActiveTab('procedures');
  };

  // Breadcrumb navigation
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'ti ti-home' },
    { label: 'Pacienti', href: '/patients', icon: 'ti ti-users' },
    ...(patient ? [
      { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${patientId}`, icon: 'ti ti-user' }
    ] : []),
    { label: 'Date Clinice', icon: 'ti ti-dental' }
  ];

  // Page actions
  const pageActions = (
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary"
        icon="ti ti-arrow-left"
        onClick={handleBack}
        title="Inapoi (Shift+B)"
      >
        Inapoi
      </Button>
      <Button
        variant="outline-primary"
        icon="ti ti-printer"
        onClick={() => toast('Functionalitate in dezvoltare')}
      >
        Printeaza Fisa
      </Button>
      <Button
        variant="soft-info"
        icon="ti ti-keyboard"
        onClick={() => toast.success('Comenzi rapide:\nShift+N: Note\nShift+O: Odontogram\nShift+P: Proceduri\nShift+T: Planuri\nShift+B: Inapoi\nShift+?: Ajutor', {
          duration: 6000
        })}
        title="Vezi comenzile rapide (Shift+?)"
      >
        <i className="ti ti-keyboard"></i>
      </Button>
    </div>
  );

  if (patientLoading) {
    return (
      <AppShell>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se incarca...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const patientPhone = patient?.phones?.[0]?.number;
  const patientEmail = patient?.emails?.[0]?.address;

  return (
    <AppShell
      title="Date Clinice"
      subtitle="Gestioneaza informatiile clinice ale pacientului"
      actions={pageActions}
    >
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} className="mb-3" />

      {/* Patient Header with Contact Actions */}
      <Card className="mb-4 shadow-sm">
        <CardBody>
          <div className="row align-items-center">
            {/* Avatar and Name */}
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar avatar-xl rounded-circle bg-primary-light">
                  <span className="avatar-text text-primary fw-bold fs-4">
                    {getPatientInitials()}
                  </span>
                </div>
                <div>
                  <h4 className="mb-1">
                    {patient?.firstName} {patient?.lastName}
                  </h4>
                  <div className="d-flex gap-3 text-muted">
                    {getPatientAge() && <span>Varsta: {getPatientAge()} ani</span>}
                    {patient?.id && (
                      <>
                        <span>•</span>
                        <span>ID: {patient.id.slice(0, 8)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="col-md-6">
              <PatientContactActions
                phone={patientPhone}
                email={patientEmail}
                nextAppointmentDate={nextAppointment?.startTime}
                appointmentStatus={nextAppointment?.status}
                className="justify-content-md-end"
              />
            </div>
          </div>

          {/* Medical Alerts Summary */}
          {alertsCount() > 0 && (
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-start gap-3">
                {(() => {
                  const patientWithAlerts = patient as typeof patient & { alerts?: PatientAlert };
                  const allergiesCount = patientWithAlerts?.alerts?.allergies?.length || 0;
                  const conditionsCount = patientWithAlerts?.alerts?.medicalConditions?.length || 0;

                  return (
                    <>
                      {allergiesCount > 0 && (
                        <Badge variant="soft-danger" icon="ti ti-alert-triangle">
                          {allergiesCount} Alergii
                        </Badge>
                      )}
                      {conditionsCount > 0 && (
                        <Badge variant="soft-warning" icon="ti ti-heart-pulse">
                          {conditionsCount} Afectiuni
                        </Badge>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="row">
        {/* Main Content Area */}
        <div className="col-xl-9">
          {/* Quick Actions Toolbar for Procedures Tab */}
          {activeTab === 'procedures' && (
            <div className="mb-4">
              <QuickActionsToolbar
                onAddExam={() => handleQuickProcedure('Examinare Clinica')}
                onAddCleaning={() => handleQuickProcedure('Detartraj')}
                onAddFilling={() => handleQuickProcedure('Plomba')}
                onAddExtraction={() => handleQuickProcedure('Extractie')}
                onAddRootCanal={() => handleQuickProcedure('Canal Radicular')}
                onAddCrown={() => handleQuickProcedure('Coroana')}
                onAddXray={() => navigate(`/imaging/${patientId}`)}
                onAddNote={() => setActiveTab('notes')}
              />
            </div>
          )}

          {/* Bootstrap Nav Tabs */}
          <ul className="nav nav-tabs nav-tabs-bottom mb-4" role="tablist">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item" role="presentation">
                <button
                  className={clsx('nav-link', { active: activeTab === tab.id })}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.shortcut}
                >
                  <i className={tab.icon}></i>
                  <span className="ms-2">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Odontogram Tab */}
            {activeTab === 'odontogram' && (
              <div className="tab-pane fade show active">
                <Card>
                  <CardHeader title="Odontograma" icon="ti ti-dental" />
                  <CardBody>
                    {odontogramLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Se incarca...</span>
                        </div>
                      </div>
                    ) : (
                      <OdontogramEditor
                        patientId={patientId!}
                        data={mapOdontogramToToothData(odontogram)}
                        onSave={handleSaveOdontogram}
                      />
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Clinical Notes Tab */}
            {activeTab === 'notes' && (
              <div className="tab-pane fade show active">
                <Card>
                  <CardHeader
                    title="Note Clinice"
                    icon="ti ti-notes"
                    actions={
                      <Button variant="primary" icon="ti ti-plus" size="sm">
                        Nota Noua
                      </Button>
                    }
                  />
                  <CardBody>
                    {notesLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Se incarca...</span>
                        </div>
                      </div>
                    ) : !notes?.data || notes.data.length === 0 ? (
                      <TableEmpty
                        icon="ti ti-notes-off"
                        title="Nicio nota clinica"
                        description="Incepe sa documentezi consultatiile pacientului"
                        action={
                          <Button variant="primary" icon="ti ti-plus">
                            Creaza Prima Nota
                          </Button>
                        }
                      />
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {notes.data.map((note) => (
                          <Card key={note.id} className="border">
                            <CardBody>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h5 className="mb-1">{note.title || 'Nota Clinica'}</h5>
                                  <div className="d-flex gap-2 align-items-center text-muted small">
                                    <span>{formatDate(note.encounterDate)}</span>
                                    <span>•</span>
                                    <span className="text-capitalize">{note.type || 'SOAP'}</span>
                                    {note.providerId && (
                                      <>
                                        <span>•</span>
                                        <span>Dr. {note.providerId}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  {note.isFinalized && (
                                    <Badge variant="soft-info" size="sm">
                                      Finalizat
                                    </Badge>
                                  )}
                                  {note.isSigned && (
                                    <Badge variant="soft-success" size="sm">
                                      Semnat
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {note.soap && (
                                <div className="d-flex flex-column gap-3">
                                  {note.soap.subjective && (
                                    <div>
                                      <div className="text-uppercase text-muted small fw-semibold mb-1">
                                        Subiectiv
                                      </div>
                                      <p className="mb-0">{note.soap.subjective}</p>
                                    </div>
                                  )}
                                  {note.soap.objective && (
                                    <div>
                                      <div className="text-uppercase text-muted small fw-semibold mb-1">
                                        Obiectiv
                                      </div>
                                      <p className="mb-0">{note.soap.objective}</p>
                                    </div>
                                  )}
                                  {note.soap.assessment && (
                                    <div>
                                      <div className="text-uppercase text-muted small fw-semibold mb-1">
                                        Evaluare
                                      </div>
                                      <p className="mb-0">{note.soap.assessment}</p>
                                    </div>
                                  )}
                                  {note.soap.plan && (
                                    <div>
                                      <div className="text-uppercase text-muted small fw-semibold mb-1">
                                        Plan
                                      </div>
                                      <p className="mb-0">{note.soap.plan}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {note.content && !note.soap && (
                                <p className="mb-0 text-pre-wrap">{note.content}</p>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Procedures Tab */}
            {activeTab === 'procedures' && (
              <div className="tab-pane fade show active">
                <Card>
                  <CardHeader
                    title="Proceduri"
                    icon="ti ti-clipboard-list"
                    actions={
                      <Button variant="primary" icon="ti ti-plus" size="sm">
                        Procedura Noua
                      </Button>
                    }
                  />
                  <CardBody>
                    {proceduresLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Se incarca...</span>
                        </div>
                      </div>
                    ) : !procedures?.data || procedures.data.length === 0 ? (
                      <TableEmpty
                        icon="ti ti-clipboard-off"
                        title="Nicio procedura"
                        description="Procedurile vor aparea aici odata documentate"
                      />
                    ) : (
                      <Table hover>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>Data</TableHeaderCell>
                            <TableHeaderCell>Cod</TableHeaderCell>
                            <TableHeaderCell>Descriere</TableHeaderCell>
                            <TableHeaderCell>Dinti</TableHeaderCell>
                            <TableHeaderCell>Furnizor</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell className="text-end">Pret</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {procedures.data.map((proc) => (
                            <TableRow key={proc.id}>
                              <TableCell>{formatDate(proc.procedureDate)}</TableCell>
                              <TableCell>
                                <code className="text-primary">{proc.code}</code>
                              </TableCell>
                              <TableCell>{proc.description}</TableCell>
                              <TableCell className="text-muted">
                                {proc.teeth?.join(', ') || '-'}
                              </TableCell>
                              <TableCell className="text-muted">
                                {proc.providerId ? `Dr. ${proc.providerId}` : '-'}
                              </TableCell>
                              <TableCell>
                                {proc.status === 'completed' && (
                                  <Badge variant="soft-success">Completat</Badge>
                                )}
                                {proc.status === 'in_progress' && (
                                  <Badge variant="soft-info">In Progres</Badge>
                                )}
                                {proc.status === 'planned' && (
                                  <Badge variant="soft-warning">Planificat</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-end fw-semibold">
                                {proc.fee ? `${proc.fee.toFixed(2)} RON` : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Treatment Plans Tab */}
            {activeTab === 'plans' && (
              <div className="tab-pane fade show active">
                <Card>
                  <CardHeader
                    title="Planuri de Tratament"
                    icon="ti ti-list-check"
                    actions={
                      <Button variant="primary" icon="ti ti-plus" size="sm">
                        Plan Nou
                      </Button>
                    }
                  />
                  <CardBody>
                    {treatmentsLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Se incarca...</span>
                        </div>
                      </div>
                    ) : !treatments?.data || treatments.data.length === 0 ? (
                      <TableEmpty
                        icon="ti ti-list-check-off"
                        title="Niciun plan de tratament"
                        description="Creaza planuri de tratament cu multiple optiuni"
                        action={
                          <Button variant="primary" icon="ti ti-plus">
                            Creaza Plan de Tratament
                          </Button>
                        }
                      />
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {treatments.data.map((plan) => (
                          <Card key={plan.id} className="border">
                            <CardBody>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h5 className="mb-1">{plan.title}</h5>
                                  <div className="text-muted small">
                                    {formatDate(plan.planDate)}
                                  </div>
                                </div>
                                <div>
                                  {plan.status === 'completed' && (
                                    <Badge variant="soft-success">Completat</Badge>
                                  )}
                                  {plan.status === 'in_progress' && (
                                    <Badge variant="soft-info">In Progres</Badge>
                                  )}
                                  {plan.status === 'approved' && (
                                    <Badge variant="soft-cyan">Aprobat</Badge>
                                  )}
                                  {plan.status === 'pending' && (
                                    <Badge variant="soft-warning">In Asteptare</Badge>
                                  )}
                                  {plan.status === 'draft' && (
                                    <Badge variant="soft-secondary">Ciorna</Badge>
                                  )}
                                </div>
                              </div>

                              {plan.options && plan.options.length > 0 && (
                                <div className="d-flex flex-column gap-2">
                                  {plan.options.map((option) => (
                                    <div
                                      key={option.optionId}
                                      className="p-3 bg-light rounded border"
                                    >
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-semibold">{option.name}</span>
                                        <span className="text-primary fw-bold">
                                          {option.totalEstimatedCost.toFixed(2)} RON
                                        </span>
                                      </div>
                                      {option.procedures && option.procedures.length > 0 && (
                                        <div className="d-flex flex-column gap-1">
                                          {option.procedures.map((proc, idx) => (
                                            <div
                                              key={idx}
                                              className="d-flex justify-content-between text-muted small"
                                            >
                                              <span>{proc.description}</span>
                                              <span>{proc.estimatedCost.toFixed(2)} RON</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {plan.options && plan.options.length > 0 && (
                                <div className="mt-2 text-muted small">
                                  <i className="ti ti-layers-linked me-1"></i>
                                  {plan.options.length} {plan.options.length === 1 ? 'Optiune' : 'Optiuni'}
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions Panel */}
        <div className="col-xl-3">
          <div className="sticky-top" style={{ top: '80px' }}>
            <QuickActionsPanel
              patientId={patientId!}
              patientName={patient ? `${patient.firstName} ${patient.lastName}` : undefined}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {patient && (
        <FloatingActionButton
          patientId={patientId!}
          position="bottom-right"
        />
      )}
    </AppShell>
  );
}

export default ClinicalPage;
