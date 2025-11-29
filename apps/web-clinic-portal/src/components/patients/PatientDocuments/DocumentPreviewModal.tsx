/**
 * DocumentPreviewModal Component
 *
 * Preview document in modal with download, print, and share options
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Modal, Button, Badge } from '../../ui-new';
import { usePatientDocument, useGenerateShareLink } from '../../../hooks/usePatientDocuments';

interface DocumentPreviewModalProps {
  patientId: string;
  documentId: string;
  open: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  consent: 'Consimtamant',
  radiology: 'Radiografie',
  invoice: 'Factura',
  lab_report: 'Raport Laborator',
  prescription: 'Reteta',
  other: 'Altele',
};

export function DocumentPreviewModal({
  patientId,
  documentId,
  open,
  onClose,
}: DocumentPreviewModalProps) {
  const [showMetadata, setShowMetadata] = useState(true);

  const { data: document, isLoading, error } = usePatientDocument(patientId, documentId);
  const shareLinkMutation = useGenerateShareLink(patientId);

  const handleDownload = async () => {
    if (!document) return;

    // Open download URL in new tab
    window.open(document.fileUrl, '_blank');
  };

  const handlePrint = () => {
    if (!document) return;

    // Open in new window for printing
    const printWindow = window.open(document.fileUrl, '_blank');
    printWindow?.addEventListener('load', () => {
      printWindow.print();
    });
  };

  const handleShare = async () => {
    if (!documentId) return;

    try {
      await shareLinkMutation.mutateAsync({
        documentId,
        expiresIn: 24 * 60 * 60, // 24 hours
      });
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const isPDF = document?.fileType === 'application/pdf';
  const isImage = document?.fileType.startsWith('image/');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={document?.title || 'Previzualizare Document'}
      icon="ti ti-file"
      size="fullscreen"
      footer={
        <div className="d-flex gap-2 justify-content-between w-100">
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => setShowMetadata(!showMetadata)}
            >
              <i className={`ti ${showMetadata ? 'ti-eye-off' : 'ti-eye'} me-1`}></i>
              {showMetadata ? 'Ascunde' : 'Arata'} Metadata
            </Button>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={handleDownload}>
              <i className="ti ti-download me-1"></i>
              Descarca
            </Button>
            <Button variant="outline-info" onClick={handlePrint}>
              <i className="ti ti-printer me-1"></i>
              Printeaza
            </Button>
            <Button
              variant="outline-success"
              onClick={handleShare}
              disabled={shareLinkMutation.isPending}
            >
              {shareLinkMutation.isPending ? (
                <span className="btn-loading me-2"></span>
              ) : (
                <i className="ti ti-share me-1"></i>
              )}
              Genereaza Link
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Inchide
            </Button>
          </div>
        </div>
      }
    >
      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se incarca...</span>
          </div>
          <p className="text-muted mt-3">Se incarca documentul...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="ti ti-alert-circle me-2"></i>
          Eroare la incarcarea documentului
        </div>
      )}

      {!isLoading && !error && document && (
        <div className="row g-3" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Metadata Sidebar */}
          {showMetadata && (
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="mb-3 fw-bold">
                    <i className="ti ti-info-circle me-2"></i>
                    Informatii Document
                  </h6>

                  <div className="mb-3">
                    <div className="small text-muted mb-1">Categorie</div>
                    <Badge variant="soft-primary">
                      {CATEGORY_LABELS[document.category] || document.category}
                    </Badge>
                  </div>

                  {document.description && (
                    <div className="mb-3">
                      <div className="small text-muted mb-1">Descriere</div>
                      <p className="small mb-0">{document.description}</p>
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="small text-muted mb-1">Dimensiune</div>
                    <div className="small">
                      {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="small text-muted mb-1">Tip Fisier</div>
                    <div className="small">{document.fileType}</div>
                  </div>

                  <div className="mb-3">
                    <div className="small text-muted mb-1">Data Incarcare</div>
                    <div className="small">
                      {format(new Date(document.uploadedAt), 'dd MMMM yyyy, HH:mm', {
                        locale: ro,
                      })}
                    </div>
                  </div>

                  {document.uploadedByName && (
                    <div className="mb-3">
                      <div className="small text-muted mb-1">Incarcat De</div>
                      <div className="small">{document.uploadedByName}</div>
                    </div>
                  )}

                  {document.documentDate && (
                    <div className="mb-3">
                      <div className="small text-muted mb-1">Data Document</div>
                      <div className="small">
                        {format(new Date(document.documentDate), 'dd MMMM yyyy', {
                          locale: ro,
                        })}
                      </div>
                    </div>
                  )}

                  {document.tags && document.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="small text-muted mb-2">Etichete</div>
                      <div className="d-flex flex-wrap gap-1">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="soft-secondary" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {document.appointmentId && (
                    <div className="mb-3">
                      <div className="small text-muted mb-1">Legat de Programarea</div>
                      <Button
                        variant="soft-primary"
                        size="sm"
                        block
                        onClick={() => {
                          window.location.href = `/appointments/${document.appointmentId}`;
                        }}
                      >
                        <i className="ti ti-calendar me-1"></i>
                        Vezi Programarea
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Document Preview */}
          <div className={showMetadata ? 'col-md-9' : 'col-12'}>
            <div className="card h-100">
              <div className="card-body p-0">
                {/* PDF Viewer */}
                {isPDF && (
                  <iframe
                    src={document.fileUrl}
                    className="w-100 h-100"
                    style={{ border: 'none', minHeight: '600px' }}
                    title={document.title}
                  />
                )}

                {/* Image Viewer */}
                {isImage && (
                  <div className="p-4 text-center">
                    <img
                      src={document.fileUrl}
                      alt={document.title}
                      className="img-fluid"
                      style={{ maxHeight: 'calc(100vh - 300px)' }}
                    />
                  </div>
                )}

                {/* Unsupported File Type */}
                {!isPDF && !isImage && (
                  <div className="text-center py-5">
                    <i className="ti ti-file-x fs-48 text-muted"></i>
                    <p className="text-muted mt-3 mb-0">
                      Previzualizarea nu este disponibila pentru acest tip de fisier
                    </p>
                    <p className="text-muted small">
                      Va rugam descarcati fisierul pentru a-l vizualiza
                    </p>
                    <Button variant="primary" onClick={handleDownload} className="mt-3">
                      <i className="ti ti-download me-1"></i>
                      Descarca Document
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default DocumentPreviewModal;
