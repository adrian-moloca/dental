/**
 * DocumentUploadModal Component
 *
 * Modal for uploading new patient documents with drag & drop support
 */

import { useState, useCallback } from 'react';
import { Modal, Button, Badge } from '../../ui-new';
import { useUploadDocument } from '../../../hooks/usePatientDocuments';
import type { UploadDocumentDto } from '../../../api/documentsClient';

interface DocumentUploadModalProps {
  patientId: string;
  open: boolean;
  onClose: () => void;
}

const DOCUMENT_CATEGORIES = [
  { value: 'consent', label: 'Consimtamant', icon: 'ti-file-check' },
  { value: 'radiology', label: 'Radiografie', icon: 'ti-radiation' },
  { value: 'invoice', label: 'Factura', icon: 'ti-file-invoice' },
  { value: 'lab_report', label: 'Raport Laborator', icon: 'ti-report-medical' },
  { value: 'prescription', label: 'Reteta', icon: 'ti-pill' },
  { value: 'other', label: 'Altele', icon: 'ti-file' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function DocumentUploadModal({
  patientId,
  open,
  onClose,
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<UploadDocumentDto>({
    title: '',
    category: 'other',
    description: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const uploadMutation = useUploadDocument(patientId);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      alert('Tip fisier neacceptat. Va rugam incarcati PDF, imagini sau documente Word.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('Fisierul este prea mare. Dimensiunea maxima este 10MB.');
      return;
    }

    setSelectedFile(file);

    // Auto-fill title from filename
    if (!formData.title) {
      const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setFormData((prev) => ({ ...prev, title: filename }));
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Va rugam selectati un fisier');
      return;
    }

    if (!formData.title.trim()) {
      alert('Va rugam introduceti un titlu');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        data: formData,
      });
      handleClose();
    } catch (_error) {
      // Error handled by mutation
    }
  };

  // Reset and close
  const handleClose = () => {
    setSelectedFile(null);
    setFormData({
      title: '',
      category: 'other',
      description: '',
      tags: [],
    });
    setTagInput('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Incarca Document Nou"
      icon="ti ti-upload"
      size="lg"
      footer={
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="outline-secondary" onClick={handleClose}>
            Anuleaza
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending && <span className="btn-loading me-2"></span>}
            <i className="ti ti-upload me-1"></i>
            Incarca Document
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* File Dropzone */}
        <div
          className={`dropzone mb-4 ${dragActive ? 'dropzone-active' : ''} ${selectedFile ? 'dropzone-has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? '#f0f8ff' : selectedFile ? '#f8f9fa' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <input
            id="file-input"
            type="file"
            className="d-none"
            onChange={handleFileInputChange}
            accept={ACCEPTED_FILE_TYPES.join(',')}
          />

          {!selectedFile ? (
            <>
              <i className="ti ti-cloud-upload fs-48 text-primary mb-3 d-block"></i>
              <p className="mb-2 fw-medium">Trage si plaseaza fisierul aici</p>
              <p className="text-muted small mb-0">sau apasa pentru a selecta</p>
              <p className="text-muted small mt-2">
                Formate acceptate: PDF, JPG, PNG, DOCX (max 10MB)
              </p>
            </>
          ) : (
            <>
              <i className="ti ti-file-check fs-48 text-success mb-3 d-block"></i>
              <p className="mb-1 fw-medium">{selectedFile.name}</p>
              <p className="text-muted small">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                variant="soft-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                <i className="ti ti-x me-1"></i>
                Elimina
              </Button>
            </>
          )}
        </div>

        {/* Form Fields */}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">
              Titlu <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="ex: Radiografie panoramica"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Categorie <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              required
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Data Document</label>
            <input
              type="date"
              className="form-control"
              value={formData.documentDate || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, documentDate: e.target.value }))
              }
            />
            <div className="form-text">Daca e diferita de data incarcarii</div>
          </div>

          <div className="col-12">
            <label className="form-label">Descriere</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Detalii optionale despre document"
            />
          </div>

          <div className="col-12">
            <label className="form-label">Etichete</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Adauga eticheta si apasa Enter"
              />
              <Button variant="outline-primary" onClick={handleAddTag}>
                <i className="ti ti-plus"></i>
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="soft-primary"
                    className="d-flex align-items-center gap-1"
                  >
                    {tag}
                    <i
                      className="ti ti-x cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                      style={{ cursor: 'pointer' }}
                    ></i>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default DocumentUploadModal;
