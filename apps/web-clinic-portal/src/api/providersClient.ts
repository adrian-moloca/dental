/**
 * Provider Schedule API Client
 *
 * Endpoints aligned with backend-provider-schedule service
 * Base URL: http://localhost:3003
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';
import type {
  UpdateScheduleDto,
  ScheduleDto,
  CreateAbsenceDto,
  AbsenceDto,
  ProviderScheduleResponse,
  AvailabilityDto,
} from '../types/provider.types';

const providersApi = createApiClient(env.PROVIDER_API_URL);

export const providersClient = {
  /**
   * GET /providers/:id/schedule
   * Get provider's schedule and absences
   */
  async getSchedule(providerId: string): Promise<ProviderScheduleResponse> {
    const response = await providersApi.get(`/providers/${providerId}/schedule`);
    return response.data;
  },

  /**
   * PUT /providers/:id/schedule
   * Update provider's working hours
   */
  async updateSchedule(providerId: string, data: UpdateScheduleDto): Promise<ScheduleDto> {
    const response = await providersApi.put(`/providers/${providerId}/schedule`, data);
    return response.data;
  },

  /**
   * POST /providers/:id/absences
   * Create provider absence
   */
  async createAbsence(providerId: string, data: CreateAbsenceDto): Promise<AbsenceDto> {
    const response = await providersApi.post(`/providers/${providerId}/absences`, data);
    return response.data;
  },

  /**
   * DELETE /providers/:id/absences/:absenceId
   * Delete provider absence
   */
  async deleteAbsence(providerId: string, absenceId: string): Promise<void> {
    await providersApi.delete(`/providers/${providerId}/absences/${absenceId}`);
  },

  /**
   * GET /providers/:id/availability/:date
   * Get provider availability for specific date
   */
  async getAvailability(providerId: string, date: string): Promise<AvailabilityDto> {
    const response = await providersApi.get(`/providers/${providerId}/availability/${date}`);
    return response.data;
  },
};
