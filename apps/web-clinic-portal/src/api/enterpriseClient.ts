/**
 * Enterprise API Client
 *
 * Endpoints aligned with backend-enterprise-service
 * Base URL: http://localhost:3307
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const enterpriseApi = createApiClient(env.ENTERPRISE_API_URL || 'http://localhost:3307');

export interface ClinicLocation {
  id: string;
  clinicId: string;
  type: string;
  name: string;
  code: string;
  floor?: number;
  capacity?: number;
  notes?: string;
}

export interface ClinicDto {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  phone: string;
  email: string;
}

export interface Provider {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface ProviderAssignment {
  providerId: string;
  clinicId: string;
  role: 'primary' | 'secondary' | 'visiting';
  isActive: boolean;
}

export const enterpriseClient = {
  /**
   * GET /enterprise/organizations/:orgId/clinics
   * List all clinics for organization
   */
  async getClinics(orgId: string): Promise<{ data: ClinicDto[]; total: number }> {
    const response = await enterpriseApi.get(`/enterprise/organizations/${orgId}/clinics`);
    return response.data;
  },

  /**
   * GET /enterprise/clinics/:clinicId
   * Get clinic by ID
   */
  async getClinic(clinicId: string): Promise<ClinicDto> {
    const response = await enterpriseApi.get(`/enterprise/clinics/${clinicId}`);
    return response.data;
  },

  /**
   * GET /enterprise/clinics/:clinicId/locations
   * List all locations for a clinic
   */
  async getLocations(clinicId: string): Promise<ClinicLocation[]> {
    const response = await enterpriseApi.get(`/enterprise/clinics/${clinicId}/locations`);
    return response.data;
  },

  /**
   * GET /enterprise/providers/:staffId/clinics
   * Get clinics assigned to a provider
   */
  async getProviderClinics(staffId: string): Promise<ProviderAssignment[]> {
    const response = await enterpriseApi.get(`/enterprise/providers/${staffId}/clinics`);
    return response.data;
  },

  /**
   * GET /enterprise/clinics/:clinicId/staff
   * List all staff (providers) assigned to a clinic
   */
  async getClinicStaff(clinicId: string): Promise<ProviderAssignment[]> {
    const response = await enterpriseApi.get(`/enterprise/clinics/${clinicId}/staff`);
    return response.data;
  },

  /**
   * POST /enterprise/providers/:staffId/assign
   * Assign a provider to a clinic
   */
  async assignProvider(
    staffId: string,
    data: { clinicId: string; role?: 'primary' | 'secondary' | 'visiting' }
  ): Promise<ProviderAssignment> {
    const response = await enterpriseApi.post(`/enterprise/providers/${staffId}/assign`, data);
    return response.data;
  },
};
