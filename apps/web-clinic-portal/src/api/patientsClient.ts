/**
 * Patients API Client
 *
 * Endpoints aligned with backend-patient-service
 * Base URL: http://localhost:3004
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';
import type {
  CreatePatientDto,
  UpdatePatientDto,
  SearchPatientDto,
  PatientDto,
  PatientListResponse,
} from '../types/patient.types';

const patientsApi = createApiClient(env.PATIENT_API_URL);

export const patientsClient = {
  /**
   * POST /patients
   * Create a new patient
   * Note: Response is auto-unwrapped by axios interceptor
   */
  async create(data: CreatePatientDto): Promise<PatientDto> {
    const response = await patientsApi.post('/patients', data);
    return response.data;
  },

  /**
   * GET /patients/:id
   * Get patient by ID
   * Note: Response is auto-unwrapped by axios interceptor
   */
  async getById(id: string): Promise<PatientDto> {
    const response = await patientsApi.get(`/patients/${id}`);
    return response.data;
  },

  /**
   * PATCH /patients/:id
   * Update patient information
   * Note: Response is auto-unwrapped by axios interceptor
   */
  async update(id: string, data: UpdatePatientDto): Promise<PatientDto> {
    const response = await patientsApi.patch(`/patients/${id}`, data);
    return response.data;
  },

  /**
   * GET /patients
   * Search/list patients with filters
   * Note: Response is auto-unwrapped by axios interceptor
   */
  async search(params: SearchPatientDto): Promise<PatientListResponse> {
    const response = await patientsApi.get('/patients', { params });
    return response.data;
  },

  /**
   * DELETE /patients/:id
   * Soft delete patient
   * Note: Response is auto-unwrapped by axios interceptor
   */
  async delete(id: string): Promise<void> {
    await patientsApi.delete(`/patients/${id}`);
  },

  /**
   * GET /patients/duplicates/search
   * Search for duplicate patients
   */
  async searchDuplicates(params: any): Promise<any> {
    const response = await patientsApi.get('/patients/duplicates/search', { params });
    return response.data;
  },

  /**
   * POST /patients/merge
   * Merge duplicate patients
   */
  async merge(data: any): Promise<any> {
    const response = await patientsApi.post('/patients/merge', data);
    return response.data;
  },
};
