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
   * GET /providers/:id/availability
   * Get provider availability for specific date
   */
  async getAvailability(
    providerId: string,
    params: { date: string; duration?: number; clinicId?: string; timezone?: string }
  ): Promise<AvailabilityDto> {
    const response = await providersApi.get(`/providers/${providerId}/availability`, { params });
    return response.data;
  },

  /**
   * GET /providers/:id/schedules
   * Get all schedules for a provider
   */
  async getSchedules(providerId: string): Promise<ScheduleDto[]> {
    const response = await providersApi.get(`/providers/${providerId}/schedules`);
    return response.data;
  },

  /**
   * POST /providers/:id/schedule
   * Create a new schedule for provider
   */
  async createSchedule(providerId: string, data: UpdateScheduleDto & { clinicId: string }): Promise<ScheduleDto> {
    const response = await providersApi.post(`/providers/${providerId}/schedule`, data);
    return response.data;
  },

  /**
   * DELETE /providers/:id/schedule/:clinicId
   * Delete provider schedule for a clinic
   */
  async deleteSchedule(providerId: string, clinicId: string): Promise<void> {
    await providersApi.delete(`/providers/${providerId}/schedule/${clinicId}`);
  },

  /**
   * POST /providers/:id/exceptions
   * Create schedule exception
   */
  async createException(
    providerId: string,
    data: { date: string; clinicId: string; hours?: Array<{ start: string; end: string }>; reason?: string }
  ): Promise<any> {
    const response = await providersApi.post(`/providers/${providerId}/exceptions`, data);
    return response.data;
  },

  /**
   * GET /providers/:id/exceptions
   * Get schedule exceptions
   */
  async getExceptions(
    providerId: string,
    params?: { startDate?: string; endDate?: string; clinicId?: string }
  ): Promise<any[]> {
    const response = await providersApi.get(`/providers/${providerId}/exceptions`, { params });
    return response.data;
  },

  /**
   * DELETE /providers/:id/exceptions/:exceptionId
   * Delete schedule exception
   */
  async deleteException(providerId: string, exceptionId: string): Promise<void> {
    await providersApi.delete(`/providers/${providerId}/exceptions/${exceptionId}`);
  },
};
