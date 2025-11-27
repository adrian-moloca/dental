/**
 * Imaging Page - Radiografii si Studii Imagistice
 *
 * Gestionare completa a studiilor imagistice dentare:
 * - Radiografii panoramice, periapicale, CBCT
 * - Fotografii intraorale
 * - Analiza AI pentru detectie carii si evaluare parodontala
 * - Organizare si vizualizare studii
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Badge } from '../components/ui-new/Badge';
import { Modal } from '../components/ui-new/Modal';
import { Input, SearchInput, Textarea } from '../components/ui-new/Input';
import { Breadcrumb, type BreadcrumbItem } from '../components/ui-new/Breadcrumb';
import { PatientQuickInfoCard } from '../components/patients/PatientQuickInfoCard';
import { usePatient } from '../hooks/usePatients';

// Types
type ModalityType = 'toate' | 'panoramic' | 'periapical' | 'cbct' | 'foto';

interface ImagingStudy {
  id: string;
  patientName: string;
  patientId: string;
  studyType: ModalityType;
  dateTaken: Date;
  provider: string;
  thumbnailUrl?: string;
  hasAIAnalysis: boolean;
  aiFindings?: AIFinding[];
  notes?: string;
}

interface AIFinding {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  tooth?: string;
}

// Mock Data
const MOCK_STUDIES: ImagingStudy[] = [
  {
    id: '1',
    patientName: 'Popescu Maria',
    patientId: 'P-2024-001',
    studyType: 'panoramic',
    dateTaken: new Date(2025, 10, 20),
    provider: 'Dr. Ion Vasilescu',
    hasAIAnalysis: true,
    aiFindings: [
      {
        id: 'f1',
        description: 'Carie dentara detectata',
        severity: 'high',
        confidence: 0.92,
        tooth: '16',
      },
      {
        id: 'f2',
        description: 'Pierdere osoasa marginala',
        severity: 'medium',
        confidence: 0.85,
        tooth: '26',
      },
    ],
    notes: 'Radiografie panoramica de rutina',
  },
  {
    id: '2',
    patientName: 'Ionescu Alexandru',
    patientId: 'P-2024-002',
    studyType: 'periapical',
    dateTaken: new Date(2025, 10, 19),
    provider: 'Dr. Elena Marinescu',
    hasAIAnalysis: false,
    notes: 'Radiografie periapicala zona 3.6',
  },
  {
    id: '3',
    patientName: 'Georgescu Ana',
    patientId: 'P-2024-003',
    studyType: 'cbct',
    dateTaken: new Date(2025, 10, 18),
    provider: 'Dr. Ion Vasilescu',
    hasAIAnalysis: true,
    aiFindings: [
      {
        id: 'f3',
        description: 'Densitate osoasa adecvata pentru implant',
        severity: 'low',
        confidence: 0.88,
      },
    ],
    notes: 'CBCT pentru planificare implant mandibular',
  },
  {
    id: '4',
    patientName: 'Dumitrescu Mihai',
    patientId: 'P-2024-004',
    studyType: 'foto',
    dateTaken: new Date(2025, 10, 17),
    provider: 'Dr. Elena Marinescu',
    hasAIAnalysis: false,
    notes: 'Fotografii intraorale pre-tratament ortodontic',
  },
  {
    id: '5',
    patientName: 'Stan Cristina',
    patientId: 'P-2024-005',
    studyType: 'panoramic',
    dateTaken: new Date(2025, 10, 15),
    provider: 'Dr. Ion Vasilescu',
    hasAIAnalysis: true,
    aiFindings: [
      {
        id: 'f4',
        description: 'Dintii de minte inclusi',
        severity: 'medium',
        confidence: 0.94,
        tooth: '38, 48',
      },
    ],
  },
  {
    id: '6',
    patientName: 'Radu Elena',
    patientId: 'P-2024-006',
    studyType: 'periapical',
    dateTaken: new Date(2025, 10, 14),
    provider: 'Dr. Elena Marinescu',
    hasAIAnalysis: false,
    notes: 'Control post-tratament endodontic',
  },
];

export function ImagingPage() {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<ModalityType>('toate');
  const [selectedStudy, setSelectedStudy] = useState<ImagingStudy | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch patient data if patientId is provided
  const { data: patientResponse } = usePatient(patientId);
  const patient = patientResponse?.data;

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    patientSearch: '',
    selectedPatient: null as { id: string; name: string } | null,
    modality: 'panoramic' as ModalityType,
    notes: '',
    files: [] as File[],
  });

  // Filter studies
  const filteredStudies = MOCK_STUDIES.filter((study) => {
    const matchesSearch =
      study.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModality =
      modalityFilter === 'toate' || study.studyType === modalityFilter;

    return matchesSearch && matchesModality;
  });

  // Modality labels
  const modalityLabels: Record<ModalityType, string> = {
    toate: 'Toate',
    panoramic: 'Panoramic',
    periapical: 'Periapical',
    cbct: 'CBCT',
    foto: 'Foto Intraorale',
  };

  // Severity labels
  const severityLabels = {
    low: 'Scazut',
    medium: 'Mediu',
    high: 'Ridicat',
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadForm((prev) => ({ ...prev, files }));
  };

  // Handle upload submission
  const handleUploadSubmit = () => {
    // TODO: Implement actual upload logic
    console.log('Upload study:', uploadForm);
    setShowUploadModal(false);
    // Reset form
    setUploadForm({
      patientSearch: '',
      selectedPatient: null,
      modality: 'panoramic',
      notes: '',
      files: [],
    });
  };

  // Get modality icon
  const getModalityIcon = (type: ModalityType) => {
    switch (type) {
      case 'panoramic':
        return 'ti ti-dental';
      case 'periapical':
        return 'ti ti-dental-broken';
      case 'cbct':
        return 'ti ti-3d-cube-sphere';
      case 'foto':
        return 'ti ti-camera';
      default:
        return 'ti ti-photo';
    }
  };

  // Get severity badge variant
  const getSeverityVariant = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'soft-success';
      case 'medium':
        return 'soft-warning';
      case 'high':
        return 'soft-danger';
    }
  };

  // Breadcrumb navigation
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'ti ti-home' },
    ...(patientId && patient
      ? [
          { label: 'Pacienti', href: '/patients', icon: 'ti ti-users' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${patientId}`, icon: 'ti ti-user' },
        ]
      : []),
    { label: 'Imagistica', icon: 'ti ti-photo' },
  ];

  const handleBack = () => {
    if (patientId) {
      navigate(`/patients/${patientId}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AppShell
      title="Imagistica"
      subtitle="Radiografii si studii imagistice"
      actions={
        <div className="d-flex gap-2">
          {patientId && (
            <Button variant="outline-secondary" icon="ti ti-arrow-left" onClick={handleBack}>
              Inapoi
            </Button>
          )}
          <Button icon="ti ti-upload" onClick={() => setShowUploadModal(true)}>
            Incarca Imagine
          </Button>
        </div>
      }
    >
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} className="mb-3" />

      {/* Patient Quick Info Card (when viewing patient-specific imaging) */}
      {patientId && patient && (
        <div className="mb-4">
          <PatientQuickInfoCard
            patient={{
              id: patient.id,
              firstName: patient.firstName || '',
              lastName: patient.lastName || '',
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender as 'male' | 'female' | 'other' | undefined,
              medicalAlerts: patient.medicalHistory
                ? {
                    allergies: patient.medicalHistory.allergies as Array<{ allergen: string; severity?: string }>,
                    conditions: patient.medicalHistory.conditions as Array<{ condition: string }>,
                    medications: patient.medicalHistory.medications as Array<{ name: string }>,
                  }
                : undefined,
            }}
            compact={true}
            showActions={false}
          />
        </div>
      )}

      <div className="row">
        {/* Filter Bar */}
        <div className="col-12 mb-4">
          <Card>
            <CardBody>
              <div className="row g-3 align-items-end">
                {/* Search */}
                <div className="col-lg-4 col-md-6">
                  <SearchInput
                    placeholder="Cauta pacient sau ID studiu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                  />
                </div>

                {/* Modality Filters */}
                <div className="col-lg-8 col-md-6">
                  <div className="d-flex flex-wrap gap-2">
                    {(Object.keys(modalityLabels) as ModalityType[]).map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={modalityFilter === type ? 'primary' : 'outline-primary'}
                        onClick={() => setModalityFilter(type)}
                        icon={type !== 'toate' ? getModalityIcon(type) : undefined}
                      >
                        {modalityLabels[type]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Studies Grid */}
        {filteredStudies.length === 0 ? (
          <div className="col-12">
            <Card>
              <CardBody>
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="ti ti-photo-off display-1 text-muted opacity-50"></i>
                  </div>
                  <h4 className="text-muted mb-2">Niciun studiu gasit</h4>
                  <p className="text-muted mb-4">
                    {searchQuery || modalityFilter !== 'toate'
                      ? 'Incercati sa ajustati filtrele de cautare'
                      : 'Incarcati prima imagine pentru a incepe'}
                  </p>
                  {!searchQuery && modalityFilter === 'toate' && (
                    <Button icon="ti ti-upload" onClick={() => setShowUploadModal(true)}>
                      Incarca Prima Imagine
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          filteredStudies.map((study) => (
            <div key={study.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <Card hoverable onClick={() => setSelectedStudy(study)}>
                <CardBody>
                  {/* Thumbnail */}
                  <div
                    className="mb-3 rounded d-flex align-items-center justify-content-center bg-light"
                    style={{ height: '180px', cursor: 'pointer' }}
                  >
                    {study.thumbnailUrl ? (
                      <img
                        src={study.thumbnailUrl}
                        alt={study.patientName}
                        className="img-fluid rounded"
                      />
                    ) : (
                      <i
                        className={`${getModalityIcon(study.studyType)} display-1 text-muted opacity-25`}
                      ></i>
                    )}
                  </div>

                  {/* Patient Name */}
                  <h6 className="mb-1">{study.patientName}</h6>
                  <p className="text-muted small mb-2">{study.patientId}</p>

                  {/* Study Type & Date */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <Badge variant="soft-primary" icon={getModalityIcon(study.studyType)}>
                      {modalityLabels[study.studyType]}
                    </Badge>
                    <span className="text-muted small">
                      {format(study.dateTaken, 'dd MMM yyyy', { locale: ro })}
                    </span>
                  </div>

                  {/* AI Analysis Badge */}
                  {study.hasAIAnalysis && (
                    <Badge variant="soft-purple" icon="ti ti-sparkles" size="sm">
                      Analiza AI
                    </Badge>
                  )}
                </CardBody>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Study Detail Modal */}
      {selectedStudy && (
        <Modal
          open={!!selectedStudy}
          onClose={() => setSelectedStudy(null)}
          title={`Studiu ${selectedStudy.id}`}
          icon="ti ti-photo"
          size="xl"
          footer={
            <div className="d-flex justify-content-between w-100">
              <Button
                variant="outline-primary"
                icon="ti ti-download"
                onClick={() => console.log('Download', selectedStudy.id)}
              >
                Descarca
              </Button>
              <Button variant="light" onClick={() => setSelectedStudy(null)}>
                Inchide
              </Button>
            </div>
          }
        >
          <div className="row g-4">
            {/* Image Viewer */}
            <div className="col-lg-8">
              <div
                className="bg-dark rounded d-flex align-items-center justify-content-center"
                style={{ minHeight: '500px' }}
              >
                {selectedStudy.thumbnailUrl ? (
                  <img
                    src={selectedStudy.thumbnailUrl}
                    alt={selectedStudy.patientName}
                    className="img-fluid rounded"
                    style={{ maxHeight: '500px' }}
                  />
                ) : (
                  <div className="text-center">
                    <i
                      className={`${getModalityIcon(selectedStudy.studyType)} display-1 text-white opacity-25`}
                    ></i>
                    <p className="text-white-50 mt-3">Previzualizare imagine</p>
                  </div>
                )}
              </div>
            </div>

            {/* Study Metadata */}
            <div className="col-lg-4">
              <Card>
                <CardHeader title="Detalii Studiu" icon="ti ti-info-circle" />
                <CardBody>
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Pacient</label>
                    <p className="mb-0 fw-semibold">{selectedStudy.patientName}</p>
                    <p className="text-muted small mb-0">{selectedStudy.patientId}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Tip Studiu</label>
                    <div>
                      <Badge variant="soft-primary" icon={getModalityIcon(selectedStudy.studyType)}>
                        {modalityLabels[selectedStudy.studyType]}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Data</label>
                    <p className="mb-0">
                      {format(selectedStudy.dateTaken, 'dd MMMM yyyy, HH:mm', { locale: ro })}
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">Doctor</label>
                    <p className="mb-0">{selectedStudy.provider}</p>
                  </div>

                  {selectedStudy.notes && (
                    <div>
                      <label className="form-label text-muted small mb-1">Notite</label>
                      <p className="mb-0 small">{selectedStudy.notes}</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* AI Analysis Results */}
              {selectedStudy.hasAIAnalysis && selectedStudy.aiFindings && (
                <Card className="mt-3">
                  <CardHeader title="Rezultate Analiza AI" icon="ti ti-sparkles" />
                  <CardBody>
                    {selectedStudy.aiFindings.length === 0 ? (
                      <div className="text-center py-3">
                        <i className="ti ti-robot-off text-muted opacity-50 display-4"></i>
                        <p className="text-muted small mt-2 mb-0">
                          Niciun rezultat disponibil
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedStudy.aiFindings.map((finding) => (
                          <div key={finding.id} className="border-bottom pb-3 mb-3 last:border-0">
                            <div className="d-flex align-items-start justify-content-between mb-2">
                              <div className="flex-grow-1">
                                <p className="mb-1 fw-medium">{finding.description}</p>
                                {finding.tooth && (
                                  <p className="text-muted small mb-0">Dinte: {finding.tooth}</p>
                                )}
                              </div>
                              <Badge variant={getSeverityVariant(finding.severity)} size="sm">
                                {severityLabels[finding.severity]}
                              </Badge>
                            </div>
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1 me-2">
                                <div className="progress" style={{ height: '6px' }}>
                                  <div
                                    className="progress-bar bg-primary"
                                    role="progressbar"
                                    style={{ width: `${finding.confidence * 100}%` }}
                                    aria-valuenow={finding.confidence * 100}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-muted small">
                                {(finding.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Incarca Imagine Noua"
        icon="ti ti-upload"
        size="lg"
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button variant="light" onClick={() => setShowUploadModal(false)}>
              Anuleaza
            </Button>
            <Button
              variant="primary"
              icon="ti ti-upload"
              onClick={handleUploadSubmit}
              disabled={!uploadForm.selectedPatient || uploadForm.files.length === 0}
            >
              Incarca
            </Button>
          </div>
        }
      >
        <div className="row g-4">
          {/* Patient Search */}
          <div className="col-12">
            <Input
              label="Pacient"
              placeholder="Cauta si selecteaza pacient..."
              icon="ti ti-user"
              value={uploadForm.patientSearch}
              onChange={(e) =>
                setUploadForm((prev) => ({ ...prev, patientSearch: e.target.value }))
              }
              required
            />
            {uploadForm.selectedPatient && (
              <div className="alert alert-success mt-2 d-flex align-items-center justify-content-between">
                <div>
                  <i className="ti ti-check me-2"></i>
                  <strong>{uploadForm.selectedPatient.name}</strong> selectat
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUploadForm((prev) => ({ ...prev, selectedPatient: null }))}
                ></button>
              </div>
            )}
          </div>

          {/* Modality Select */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                Tip Studiu <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={uploadForm.modality}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    modality: e.target.value as ModalityType,
                  }))
                }
              >
                <option value="panoramic">Panoramic</option>
                <option value="periapical">Periapical</option>
                <option value="cbct">CBCT</option>
                <option value="foto">Foto Intraorale</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div className="col-12">
            <div className="form-group">
              <label className="form-label">
                Fisiere <span className="required">*</span>
              </label>
              <div
                className="border border-2 border-dashed rounded p-4 text-center"
                style={{ cursor: 'pointer' }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {uploadForm.files.length === 0 ? (
                  <>
                    <i className="ti ti-cloud-upload display-4 text-primary mb-2"></i>
                    <p className="mb-1">Click pentru a selecta fisiere</p>
                    <p className="text-muted small mb-0">sau gliseaza fisierele aici</p>
                    <p className="text-muted small mt-2">
                      Formate acceptate: JPG, PNG, DICOM (.dcm)
                    </p>
                  </>
                ) : (
                  <div>
                    <i className="ti ti-file-check display-4 text-success mb-2"></i>
                    <p className="mb-1">
                      <strong>{uploadForm.files.length}</strong> fisier(e) selectat(e)
                    </p>
                    <ul className="list-unstyled small text-start mt-2">
                      {uploadForm.files.map((file, idx) => (
                        <li key={idx} className="mb-1">
                          <i className="ti ti-file me-2"></i>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,.dcm"
                  onChange={handleFileSelect}
                  className="d-none"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="col-12">
            <Textarea
              label="Notite (optional)"
              placeholder="Adauga notite despre studiu..."
              rows={3}
              value={uploadForm.notes}
              onChange={(e) => setUploadForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

export default ImagingPage;
