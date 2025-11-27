/**
 * Enhanced Clinical Page - Optimized for clinical workflows
 *
 * Features:
 * - Sticky Patient Context Bar with medical alerts
 * - Split-view resizable layout (Odontogram + Tabs)
 * - Quick Actions Toolbar
 * - Keyboard shortcuts
 * - Enhanced odontogram with FDI/Universal toggle
 * - Clinical note templates
 * - Print/Export functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Badge } from '../components/ui-new/Badge';
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
  useUpdateOdontogram,
} from '../hooks/useClinical';
import { usePatient } from '../hooks/usePatients';
import { OdontogramEditorEnhanced } from '../components/clinical/OdontogramEditorEnhanced';
import { PatientContextBar } from '../components/clinical/PatientContextBar';
import { QuickActionsToolbar } from '../components/clinical/QuickActionsToolbar';
import { KeyboardShortcutsModal } from '../components/clinical/KeyboardShortcutsModal';
import { ClinicalNoteTemplates } from '../components/clinical/ClinicalNoteTemplates';
import clsx from 'clsx';

type TabType = 'odontogram' | 'notes' | 'procedures' | 'plans';

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
  treatmentStatus?: 'planned' | 'in_progress' | 'completed';
}

export function ClinicalPageEnhanced() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('odontogram');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/patients/${patientId}`);
    }
  };

  // Fetch patient data
  const { data: patientResponse, isLoading: patientLoading } = usePatient(patientId);
  const patient = patientResponse?.data;

  // Fetch clinical data
  const { data: notes, isLoading: notesLoading } = useClinicalNotes(patientId!);
  const { data: treatments, isLoading: treatmentsLoading } = useTreatmentPlans(patientId!);
  const { data: procedures, isLoading: proceduresLoading } = useProcedures(patientId!);
  const { data: odontogram, isLoading: odontogramLoading } = useOdontogram(patientId!);
  const updateOdontogram = useUpdateOdontogram();

  const handleSaveOdontogram = async (data: ToothData[]) => {
    await updateOdontogram.mutateAsync({
      patientId: patientId!,
      data: {
        patientId: patientId!,
        entries: [
          {
            chartedAt: new Date().toISOString(),
            teeth: data,
          },
        ],
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate quick stats
  const quickStats = {
    lastVisit: procedures?.data?.[0]?.procedureDate,
    treatmentPlanStatus: treatments?.data?.[0]?.status === 'in_progress'
      ? 'in_progress' as const
      : treatments?.data?.[0]?.status === 'completed'
      ? 'completed' as const
      : (treatments?.data?.length ?? 0) > 0
      ? 'pending' as const
      : 'none' as const,
    balance: 0, // This would come from billing service
    upcomingAppointments: 0,
  };

  // Tab definitions
  const tabs = [
    { id: 'odontogram' as TabType, label: 'Odontograma', icon: 'ti ti-dental' },
    { id: 'notes' as TabType, label: 'Note Clinice', icon: 'ti ti-notes' },
    { id: 'procedures' as TabType, label: 'Proceduri', icon: 'ti ti-clipboard-list' },
    { id: 'plans' as TabType, label: 'Planuri Tratament', icon: 'ti ti-list-check' },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+1-4 for tab switching
      if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
        const tabIndex = parseInt(e.key) - 1;
        if (tabIndex < tabs.length) {
          setActiveTab(tabs[tabIndex].id);
        }
        e.preventDefault();
      }

      // Shift+N for new note
      if (e.shiftKey && e.key === 'N') {
        setShowTemplateModal(true);
        e.preventDefault();
      }

      // Shift+T for new treatment plan
      if (e.shiftKey && e.key === 'T') {
        // Navigate to treatment plan creation
        e.preventDefault();
      }

      // Shift+P for print
      if (e.shiftKey && e.key === 'P') {
        handlePrint();
        e.preventDefault();
      }

      // Ctrl+S for save
      if (e.ctrlKey && e.key === 's') {
        // Save current changes
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tabs]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // Implementation for PDF export
    alert('Exportare PDF - in implementare');
  };

  // Resizing logic
  const startResize = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 30 && newWidth < 70) {
          setLeftPanelWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, resize, stopResize]);

  // Page actions
  const pageActions = (
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary"
        icon="ti ti-arrow-left"
        onClick={handleBack}
      >
        Inapoi
      </Button>
      <Button
        variant="outline-primary"
        icon="ti ti-printer"
        onClick={handlePrint}
        title="Printeaza Fisa (Shift+P)"
      >
        Printeaza
      </Button>
      <Button
        variant="outline-primary"
        icon="ti ti-file-export"
        onClick={handleExportPDF}
      >
        Export PDF
      </Button>
      <button
        className="btn btn-outline-secondary"
        data-bs-toggle="modal"
        data-bs-target="#keyboardShortcutsModal"
        title="Vezi comenzile rapide"
      >
        <i className="ti ti-keyboard"></i>
      </button>
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

  return (
    <AppShell
      title="Date Clinice"
      subtitle="Gestionare optimizata pentru fluxuri clinice"
      actions={pageActions}
    >
      {/* Patient Context Bar - Sticky */}
      {patient && (
        <PatientContextBar
          patient={patient as any}
          quickStats={quickStats}
          onAddNote={() => setShowTemplateModal(true)}
          onCreateTreatmentPlan={() => setActiveTab('plans')}
          sticky={true}
        />
      )}

      {/* Quick Actions Toolbar */}
      <div className="mb-4">
        <QuickActionsToolbar
          onAddNote={() => setShowTemplateModal(true)}
          onAddExam={() => console.log('Add exam')}
          onAddCleaning={() => console.log('Add cleaning')}
          onAddFilling={() => console.log('Add filling')}
          onAddExtraction={() => console.log('Add extraction')}
          onAddRootCanal={() => console.log('Add root canal')}
          onAddCrown={() => console.log('Add crown')}
          onAddXray={() => console.log('Add xray')}
        />
      </div>

      {/* Main Content - Split View */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex" style={{ height: 'calc(100vh - 350px)', minHeight: '600px' }}>
            {/* Left Panel - Odontogram */}
            <div
              className="clinical-left-panel"
              style={{
                width: `${leftPanelWidth}%`,
                overflow: 'auto',
                paddingRight: '8px',
              }}
            >
              <Card className="h-100">
                <CardHeader
                  title="Odontograma Interactiva"
                  icon="ti ti-dental"
                  actions={
                    <div className="d-flex gap-2">
                      <Badge variant="soft-info" icon="ti ti-info-circle">
                        Foloseste Q pentru Quick Exam
                      </Badge>
                    </div>
                  }
                />
                <CardBody>
                  {odontogramLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Se incarca...</span>
                      </div>
                    </div>
                  ) : (
                    <OdontogramEditorEnhanced
                      patientId={patientId!}
                      data={(odontogram?.data?.entries?.[0]?.teeth as ToothData[]) || []}
                      onSave={handleSaveOdontogram}
                      showTreatmentStatus={true}
                    />
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Resizer */}
            <div
              className="clinical-resizer"
              onMouseDown={startResize}
              style={{
                width: '4px',
                cursor: 'col-resize',
                backgroundColor: isResizing ? '#0d6efd' : '#dee2e6',
                margin: '0 8px',
                borderRadius: '2px',
                transition: 'background-color 0.2s',
              }}
            />

            {/* Right Panel - Tabs */}
            <div
              className="clinical-right-panel"
              style={{
                width: `${100 - leftPanelWidth - 1}%`,
                overflow: 'auto',
                paddingLeft: '8px',
              }}
            >
              {/* Bootstrap Nav Tabs */}
              <ul className="nav nav-tabs nav-tabs-bottom mb-3" role="tablist">
                {tabs.map((tab, idx) => (
                  <li key={tab.id} className="nav-item" role="presentation">
                    <button
                      className={clsx('nav-link', { active: activeTab === tab.id })}
                      type="button"
                      role="tab"
                      onClick={() => setActiveTab(tab.id)}
                      title={`${tab.label} (Ctrl+${idx + 1})`}
                    >
                      <i className={tab.icon}></i>
                      <span className="ms-2">{tab.label}</span>
                      <kbd className="ms-2 small opacity-75">Ctrl+{idx + 1}</kbd>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Tab Content */}
              <div className="tab-content">
                {/* Clinical Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="tab-pane fade show active">
                    <Card>
                      <CardHeader
                        title="Note Clinice"
                        icon="ti ti-notes"
                        actions={
                          <Button
                            variant="primary"
                            icon="ti ti-plus"
                            size="sm"
                            onClick={() => setShowTemplateModal(true)}
                            title="Nota Noua (Shift+N)"
                          >
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
                              <Button
                                variant="primary"
                                icon="ti ti-plus"
                                onClick={() => setShowTemplateModal(true)}
                              >
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
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="ti ti-template me-2"></i>
                  Selecteaza Template Nota Clinica
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTemplateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ClinicalNoteTemplates
                  onSelectTemplate={(template) => {
                    console.log('Selected template:', template);
                    // Navigate to note creation with template
                  }}
                  onClose={() => setShowTemplateModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default ClinicalPageEnhanced;
