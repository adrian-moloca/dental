/**
 * Clinical API Client - Notes, Procedures, Treatment Plans
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const client = createApiClient(env.CLINICAL_API_URL);

export type NoteStatus = 'draft' | 'signed' | 'amended';

export interface NoteSignature {
  signedBy: string;
  signedByName: string;
  signedByCredentials: string;
  signedAt: string;
}

export interface NoteAmendment {
  id: string;
  version: number;
  amendedBy: string;
  amendedByName: string;
  amendedAt: string;
  reason: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  content?: string;
  signature?: NoteSignature;
}

export interface ClinicalNoteDto {
  id: string;
  patientId: string;
  providerId: string;
  providerName?: string;
  providerCredentials?: string;
  type: 'soap' | 'progress' | 'consult' | 'emergency' | 'operative';
  title: string;
  encounterDate: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  content?: string;
  isFinalized: boolean;
  isSigned: boolean;
  status: NoteStatus;
  signature?: NoteSignature;
  amendments?: NoteAmendment[];
  version: number;
  attachments: Array<{
    fileId: string;
    filename: string;
    category: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignNoteRequest {
  password: string;
}

export interface SignNoteResponse {
  success: boolean;
  note: ClinicalNoteDto;
  message: string;
}

export interface AmendNoteRequest {
  password: string;
  reason: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  content?: string;
}

export interface AmendNoteResponse {
  success: boolean;
  note: ClinicalNoteDto;
  amendment: NoteAmendment;
  message: string;
}

export interface TreatmentPlanDto {
  id: string;
  patientId: string;
  providerId: string;
  title: string;
  status: 'draft' | 'pending' | 'approved' | 'in_progress' | 'completed';
  options: Array<{
    optionId: string;
    name: string;
    procedures: Array<{
      code: string;
      description: string;
      estimatedCost: number;
    }>;
    totalEstimatedCost: number;
  }>;
  planDate: string;
}

export interface ProcedureDto {
  id: string;
  patientId: string;
  providerId: string;
  code: string;
  description: string;
  procedureDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  teeth: number[];
  fee: number;
}

export interface OdontogramDto {
  patientId: string;
  entries: Array<{
    chartedAt: string;
    teeth: Array<{
      toothNumber: number;
      conditions: Array<{
        condition: string;
        surfaces: string[];
      }>;
    }>;
  }>;
}

export interface ProcedureCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  defaultPrice: number;
  estimatedDuration?: number;
}

export interface ProcedureCatalogResponse {
  data: ProcedureCatalogItem[];
  total: number;
}

export const clinicalClient = {
  // Clinical Notes
  createNote: (data: Partial<ClinicalNoteDto>) =>
    client.post<ClinicalNoteDto>(`/clinical/patients/${data.patientId}/clinical-notes`, data),

  getNotes: (patientId: string) =>
    client.get<ClinicalNoteDto[]>(`/clinical/patients/${patientId}/clinical-notes`),

  getNote: (id: string) =>
    client.get<ClinicalNoteDto>(`/clinical/notes/${id}`),

  signNote: (noteId: string, data: SignNoteRequest) =>
    client.post<SignNoteResponse>(`/clinical-notes/${noteId}/sign`, data),

  amendNote: (noteId: string, data: AmendNoteRequest) =>
    client.post<AmendNoteResponse>(`/clinical-notes/${noteId}/amend`, data),

  // Treatment Plans
  createTreatmentPlan: (patientId: string, data: Partial<TreatmentPlanDto>) =>
    client.post<TreatmentPlanDto>(`/clinical/patients/${patientId}/treatment-plans`, data),

  getTreatmentPlans: (patientId: string) =>
    client.get<TreatmentPlanDto[]>(`/clinical/patients/${patientId}/treatment-plans`),

  acceptOption: (planId: string, optionId: string) =>
    client.post(`/clinical/treatment-plans/${planId}/accept-option`, { optionId }),

  // Procedures
  createProcedure: (patientId: string, data: Partial<ProcedureDto>) =>
    client.post<ProcedureDto>(`/clinical/patients/${patientId}/procedures`, data),

  getProcedures: (patientId: string) =>
    client.get<ProcedureDto[]>(`/clinical/patients/${patientId}/procedures`),

  completeProcedure: (procedureId: string) =>
    client.post(`/clinical/procedures/${procedureId}/complete`),

  // Procedure Catalog
  getProcedureCatalog: (params?: { search?: string; category?: string; limit?: number }) =>
    client.get<ProcedureCatalogResponse>('/clinical/procedures/catalog', { params }),

  // Odontogram
  getOdontogram: (patientId: string) =>
    client.get<OdontogramDto>(`/clinical/patients/${patientId}/odontogram`),

  updateOdontogram: (patientId: string, data: Partial<OdontogramDto>) =>
    client.post(`/clinical/patients/${patientId}/odontogram`, data),
};
