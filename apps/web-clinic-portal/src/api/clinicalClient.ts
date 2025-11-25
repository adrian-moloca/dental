/**
 * Clinical API Client - Notes, Procedures, Treatment Plans
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const client = createApiClient(env.CLINICAL_API_URL);

export interface ClinicalNoteDto {
  id: string;
  patientId: string;
  providerId: string;
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
  attachments: Array<{
    fileId: string;
    filename: string;
    category: string;
  }>;
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

export const clinicalClient = {
  // Clinical Notes
  createNote: (data: Partial<ClinicalNoteDto>) =>
    client.post<ClinicalNoteDto>(`/clinical/patients/${data.patientId}/clinical-notes`, data),

  getNotes: (patientId: string) =>
    client.get<ClinicalNoteDto[]>(`/clinical/patients/${patientId}/clinical-notes`),

  getNote: (id: string) =>
    client.get<ClinicalNoteDto>(`/clinical/notes/${id}`),

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

  // Odontogram
  getOdontogram: (patientId: string) =>
    client.get<OdontogramDto>(`/clinical/patients/${patientId}/odontogram`),

  updateOdontogram: (patientId: string, data: Partial<OdontogramDto>) =>
    client.post(`/clinical/patients/${patientId}/odontogram`, data),
};
