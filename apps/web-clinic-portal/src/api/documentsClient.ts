/**
 * Documents API Client
 *
 * Handles patient document management operations
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const documentsApi = createApiClient(env.PATIENT_API_URL);

export interface DocumentFilters {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface PatientDocument {
  id: string;
  patientId: string;
  title: string;
  category: 'consent' | 'radiology' | 'invoice' | 'lab_report' | 'prescription' | 'other';
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName?: string;
  documentDate?: string;
  tags: string[];
  appointmentId?: string;
  metadata: Record<string, any>;
}

export interface DocumentListResponse {
  data: PatientDocument[];
  total: number;
  limit: number;
  offset: number;
}

export interface UploadDocumentDto {
  title: string;
  category: string;
  description?: string;
  documentDate?: string;
  tags?: string[];
  appointmentId?: string;
}

export interface GenerateDocumentDto {
  templateId: string;
  data: Record<string, any>;
  title: string;
  category: string;
}

export const documentsClient = {
  /**
   * GET /patients/:patientId/documents
   * Get patient documents list
   */
  async getDocuments(
    patientId: string,
    filters: DocumentFilters = {}
  ): Promise<DocumentListResponse> {
    const response = await documentsApi.get(`/patients/${patientId}/documents`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * GET /patients/:patientId/documents/:documentId
   * Get single document details
   */
  async getDocument(patientId: string, documentId: string): Promise<PatientDocument> {
    const response = await documentsApi.get(
      `/patients/${patientId}/documents/${documentId}`
    );
    return response.data;
  },

  /**
   * POST /patients/:patientId/documents/upload
   * Upload a new document
   */
  async uploadDocument(
    patientId: string,
    file: File,
    data: UploadDocumentDto
  ): Promise<PatientDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.documentDate) formData.append('documentDate', data.documentDate);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.appointmentId) formData.append('appointmentId', data.appointmentId);

    const response = await documentsApi.post(
      `/patients/${patientId}/documents/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * POST /patients/:patientId/documents/generate
   * Generate document from template
   */
  async generateDocument(
    patientId: string,
    data: GenerateDocumentDto
  ): Promise<PatientDocument> {
    const response = await documentsApi.post(
      `/patients/${patientId}/documents/generate`,
      data
    );
    return response.data;
  },

  /**
   * DELETE /patients/:patientId/documents/:documentId
   * Delete document
   */
  async deleteDocument(patientId: string, documentId: string): Promise<void> {
    await documentsApi.delete(`/patients/${patientId}/documents/${documentId}`);
  },

  /**
   * GET /patients/:patientId/documents/:documentId/download
   * Get document download URL
   */
  async getDownloadUrl(patientId: string, documentId: string): Promise<string> {
    const response = await documentsApi.get(
      `/patients/${patientId}/documents/${documentId}/download`
    );
    return response.data.url;
  },

  /**
   * POST /patients/:patientId/documents/:documentId/share
   * Generate shareable link
   */
  async generateShareLink(
    patientId: string,
    documentId: string,
    expiresIn?: number
  ): Promise<{ url: string; expiresAt: string }> {
    const response = await documentsApi.post(
      `/patients/${patientId}/documents/${documentId}/share`,
      { expiresIn }
    );
    return response.data;
  },

  /**
   * GET /document-templates
   * Get available document templates
   */
  async getTemplates(): Promise<
    Array<{ id: string; name: string; category: string; description?: string }>
  > {
    const response = await documentsApi.get('/document-templates');
    return response.data;
  },
};
