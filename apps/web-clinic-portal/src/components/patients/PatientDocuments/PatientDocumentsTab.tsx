/**
 * PatientDocumentsTab Component
 *
 * Full documents management UI with grid/list views, filters, upload, and generation
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  usePatientDocuments,
  useDeleteDocument,
  useDocumentTemplates,
} from '../../../hooks/usePatientDocuments';
import { Card, CardHeader, CardBody, Button, Badge, EmptyState, ViewToggle } from '../../ui-new';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import type { PatientDocument } from '../../../api/documentsClient';

interface PatientDocumentsTabProps {
  patientId: string;
}

const DOCUMENT_CATEGORIES = [
  { value: '', label: 'Toate', icon: 'ti-files' },
  { value: 'consent', label: 'Consimtaminte', icon: 'ti-file-check' },
  { value: 'radiology', label: 'Radiografii', icon: 'ti-radiation' },
  { value: 'invoice', label: 'Facturi', icon: 'ti-file-invoice' },
  { value: 'lab_report', label: 'Rapoarte Laborator', icon: 'ti-report-medical' },
  { value: 'prescription', label: 'Retete', icon: 'ti-pill' },
  { value: 'other', label: 'Altele', icon: 'ti-file' },
];

const CATEGORY_LABELS: Record<string, string> = {
  consent: 'Consimtamant',
  radiology: 'Radiografie',
  invoice: 'Factura',
  lab_report: 'Raport Laborator',
  prescription: 'Reteta',
  other: 'Altele',
};

export function PatientDocumentsTab({ patientId }: PatientDocumentsTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const { data, isLoading, error } = usePatientDocuments(patientId, {
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  // Templates loaded for future use
  useDocumentTemplates();
  const deleteMutation = useDeleteDocument(patientId);

  const documents = data?.data || [];

  const handlePreview = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setPreviewModalOpen(true);
  };

  const handleDelete = async (documentId: string, documentTitle: string) => {
    if (window.confirm(`Sigur doriti sa stergeti documentul "${documentTitle}"?`)) {
      await deleteMutation.mutateAsync(documentId);
    }
  };

  const handleDownload = (document: PatientDocument) => {
    window.open(document.fileUrl, '_blank');
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader
          title="Documente Pacient"
          icon="ti ti-files"
          actions={
            <div className="d-flex gap-2">
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <Button
                variant="primary"
                size="sm"
                onClick={() => setUploadModalOpen(true)}
              >
                <i className="ti ti-upload me-1"></i>
                Incarca Document
              </Button>
            </div>
          }
        />

        <CardBody>
          {/* Filters */}
          <div className="mb-4">
            {/* Category Tabs */}
            <ul className="nav nav-tabs nav-tabs-filter mb-3" role="tablist">
              {DOCUMENT_CATEGORIES.map((category) => (
                <li key={category.value} className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.value)}
                    type="button"
                  >
                    <i className={`ti ${category.icon} me-2`}></i>
                    {category.label}
                    {category.value === '' && documents.length > 0 && (
                      <Badge variant="soft-primary" size="sm" className="ms-2">
                        {documents.length}
                      </Badge>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Search */}
            <div className="row g-2">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cauta dupa titlu, descriere sau etichete..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Se incarca...</span>
              </div>
              <p className="text-muted mt-3">Se incarca documentele...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-danger">
              <i className="ti ti-alert-circle me-2"></i>
              Eroare la incarcarea documentelor
            </div>
          )}

          {/* Documents Grid View */}
          {!isLoading && !error && viewMode === 'grid' && documents.length > 0 && (
            <div className="row g-3">
              {documents.map((document) => (
                <div key={document.id} className="col-sm-6 col-lg-4 col-xl-3">
                  <div className="card document-card h-100">
                    <div
                      className="card-img-top bg-light d-flex align-items-center justify-content-center"
                      style={{ height: '160px', cursor: 'pointer' }}
                      onClick={() => handlePreview(document.id)}
                    >
                      {document.thumbnailUrl ? (
                        <img
                          src={document.thumbnailUrl}
                          alt={document.title}
                          className="img-fluid"
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <i className="ti ti-file fs-48 text-muted"></i>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <h6 className="card-title mb-0 flex-1" style={{ fontSize: '14px' }}>
                          {document.title}
                        </h6>
                        <Badge variant="soft-primary" size="sm">
                          {CATEGORY_LABELS[document.category]}
                        </Badge>
                      </div>

                      <div className="text-muted small mb-2">
                        <i className="ti ti-calendar me-1"></i>
                        {format(new Date(document.uploadedAt), 'dd MMM yyyy', { locale: ro })}
                      </div>

                      <div className="text-muted small mb-3">
                        <i className="ti ti-file me-1"></i>
                        {(document.fileSize / 1024).toFixed(0)} KB
                      </div>

                      <div className="d-grid gap-2">
                        <Button
                          variant="soft-primary"
                          size="sm"
                          block
                          onClick={() => handlePreview(document.id)}
                        >
                          <i className="ti ti-eye me-1"></i>
                          Previzualizeaza
                        </Button>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownload(document)}
                          >
                            <i className="ti ti-download"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(document.id, document.title)}
                            disabled={deleteMutation.isPending}
                          >
                            <i className="ti ti-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents List View */}
          {!isLoading && !error && viewMode === 'list' && documents.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Categorie</th>
                    <th>Data Incarcare</th>
                    <th>Dimensiune</th>
                    <th>Etichete</th>
                    <th className="text-end">Actiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className="ti ti-file fs-24 text-primary"></i>
                          <div>
                            <div className="fw-medium">{document.title}</div>
                            {document.description && (
                              <div className="text-muted small">{document.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="soft-primary">
                          {CATEGORY_LABELS[document.category]}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {format(new Date(document.uploadedAt), 'dd MMM yyyy, HH:mm', {
                          locale: ro,
                        })}
                      </td>
                      <td className="text-muted small">
                        {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td>
                        {document.tags.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {document.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="soft-secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                            {document.tags.length > 2 && (
                              <Badge variant="soft-secondary" size="sm">
                                +{document.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="soft-primary"
                            size="sm"
                            onClick={() => handlePreview(document.id)}
                          >
                            <i className="ti ti-eye"></i>
                          </Button>
                          <Button
                            variant="soft-secondary"
                            size="sm"
                            onClick={() => handleDownload(document)}
                          >
                            <i className="ti ti-download"></i>
                          </Button>
                          <Button
                            variant="soft-danger"
                            size="sm"
                            onClick={() => handleDelete(document.id, document.title)}
                            disabled={deleteMutation.isPending}
                          >
                            <i className="ti ti-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && documents.length === 0 && (
            <EmptyState
              icon="ti-file-off"
              title="Niciun document disponibil"
              description={
                searchQuery || selectedCategory
                  ? 'Niciun document gasit cu filtrele selectate'
                  : 'Urca primul document pentru acest pacient'
              }
              action={
                <Button variant="primary" onClick={() => setUploadModalOpen(true)}>
                  <i className="ti ti-upload me-1"></i>
                  Incarca Document
                </Button>
              }
            />
          )}
        </CardBody>
      </Card>

      {/* Upload Modal */}
      <DocumentUploadModal
        patientId={patientId}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      {/* Preview Modal */}
      {selectedDocumentId && (
        <DocumentPreviewModal
          patientId={patientId}
          documentId={selectedDocumentId}
          open={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedDocumentId(null);
          }}
        />
      )}
    </>
  );
}

export default PatientDocumentsTab;
