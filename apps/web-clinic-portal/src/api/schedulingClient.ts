/**
 * Scheduling API Client
 *
 * Endpoints aligned with backend-scheduling service
 * Base URL: http://localhost:3002
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto,
  QueryAppointmentsDto,
  AppointmentDto,
  AppointmentListResponse,
} from '../types/appointment.types';

const schedulingApi = createApiClient(env.SCHEDULING_API_URL);

export const schedulingClient = {
  /**
   * POST /appointments
   * Book a new appointment
   */
  async create(data: CreateAppointmentDto): Promise<AppointmentDto> {
    const response = await schedulingApi.post('/appointments', data);
    return response.data;
  },

  /**
   * GET /appointments/:id
   * Get appointment by ID
   */
  async getById(id: string): Promise<AppointmentDto> {
    const response = await schedulingApi.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * GET /appointments
   * List appointments with filters
   */
  async list(params: QueryAppointmentsDto): Promise<AppointmentListResponse> {
    const response = await schedulingApi.get('/appointments', { params });
    return response.data;
  },

  /**
   * PUT /appointments/:id
   * Reschedule an appointment
   */
  async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentDto> {
    const response = await schedulingApi.put(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /appointments/:id
   * Cancel an appointment
   */
  async cancel(id: string, data: CancelAppointmentDto): Promise<AppointmentDto> {
    const response = await schedulingApi.delete(`/appointments/${id}`, { data });
    return response.data;
  },

  /**
   * POST /appointments/:id/no-show
   * Record appointment no-show
   */
  async recordNoShow(id: string): Promise<AppointmentDto> {
    const response = await schedulingApi.post(`/appointments/${id}/no-show`);
    return response.data;
  },

  /**
   * POST /appointments/:id/check-in
   * Check in a patient for their appointment
   */
  async checkIn(id: string): Promise<AppointmentDto> {
    const response = await schedulingApi.post(`/appointments/${id}/check-in`);
    return response.data;
  },

  /**
   * POST /appointments/:id/start
   * Start appointment (mark as in progress)
   */
  async start(id: string): Promise<AppointmentDto> {
    const response = await schedulingApi.post(`/appointments/${id}/start`);
    return response.data;
  },

  /**
   * POST /appointments/:id/complete
   * Complete appointment with procedures
   */
  async complete(
    id: string,
    payload?: {
      procedures?: Array<{
        procedureId: string;
        quantity: number;
        price: number;
        tooth?: string;
        surfaces?: string[];
      }>;
    }
  ): Promise<{
    appointment: AppointmentDto;
    invoice?: {
      id: string;
      invoiceNumber: string;
      status: string;
      total: number;
    };
  }> {
    const response = await schedulingApi.post(`/appointments/${id}/complete`, payload);
    return response.data;
  },

  /**
   * POST /appointments/:id/confirm
   * Confirm an appointment
   */
  async confirm(id: string, method: 'phone' | 'sms' | 'email' | 'portal'): Promise<AppointmentDto> {
    const response = await schedulingApi.post(`/appointments/${id}/confirm`, { method });
    return response.data;
  },

  /**
   * POST /appointments/bulk-confirm
   * Confirm multiple appointments
   */
  async bulkConfirm(
    ids: string[],
    method: 'phone' | 'sms' | 'email' | 'portal'
  ): Promise<{ confirmed: string[]; failed: string[] }> {
    const response = await schedulingApi.post('/appointments/bulk-confirm', { ids, method });
    return response.data;
  },
};
