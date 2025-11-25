/**
 * Imaging API Client - X-rays, DICOM studies, AI analysis
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const client = createApiClient(env.IMAGING_API_URL);

export interface ImagingStudyDto {
  id: string;
  studyId: string;
  patientId: string;
  modality: 'PA' | 'PANO' | 'CEPH' | 'CBCT' | '3D';
  studyDate: string;
  studyDescription?: string;
  status: 'pending' | 'available' | 'archived';
  files: Array<{
    fileId: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
  }>;
}

export interface ImagingAIResultDto {
  resultId: string;
  studyId: string;
  analysisType: 'caries_detection' | 'periodontal_assessment' | 'bone_level';
  findings: Array<{
    tooth: number;
    surface: string;
    confidence: number;
    finding: string;
    severity?: 'mild' | 'moderate' | 'severe';
  }>;
  overallAssessment: string;
  analysisDate: string;
}

export const imagingClient = {
  // Studies
  createStudy: (data: Partial<ImagingStudyDto>) =>
    client.post<ImagingStudyDto>('/imaging/studies', data),

  getStudies: (params?: { patientId?: string; modality?: string }) =>
    client.get<{ data: ImagingStudyDto[]; total: number }>('/imaging/studies', { params }),

  getStudy: (id: string) =>
    client.get<ImagingStudyDto>(`/imaging/studies/${id}`),

  // Files
  uploadFile: (studyId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studyId', studyId);
    return client.post('/imaging/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getFile: (fileId: string) =>
    client.get(`/imaging/files/${fileId}`, { responseType: 'blob' }),

  // AI Analysis
  getAIResults: (studyId: string) =>
    client.get<ImagingAIResultDto[]>(`/imaging/ai-results/${studyId}`),

  requestAIAnalysis: (studyId: string, analysisType: string) =>
    client.post('/imaging/ai-results', { studyId, analysisType }),

  // Patient imaging
  getPatientImaging: (patientId: string) =>
    client.get<ImagingStudyDto[]>(`/imaging/patients/${patientId}`),
};
