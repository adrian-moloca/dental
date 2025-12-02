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
  async confirm(
    id: string,
    confirmationMethod: 'phone' | 'sms' | 'email' | 'patient_portal'
  ): Promise<AppointmentDto> {
    const response = await schedulingApi.post(`/appointments/${id}/confirm`, { confirmationMethod });
    return response.data;
  },

  /**
   * POST /appointments/bulk-confirm
   * Confirm multiple appointments
   */
  async bulkConfirm(
    ids: string[],
    confirmationMethod: 'phone' | 'sms' | 'email' | 'patient_portal'
  ): Promise<{ confirmed: string[]; failed: string[] }> {
    const response = await schedulingApi.post('/appointments/bulk-confirm', { ids, confirmationMethod });
    return response.data;
  },

  /**
   * GET /availability/slots
   * Get available time slots for booking
   */
  async getAvailableSlots(params: {
    providerId: string;
    date: string; // ISO date string
    duration: number; // minutes
    appointmentTypeId?: string;
  }): Promise<{
    date: string;
    slots: Array<{
      start: string; // ISO datetime
      end: string; // ISO datetime
      isAvailable: boolean;
      reason?: string;
    }>;
  }> {
    const response = await schedulingApi.get('/availability/slots', { params });
    return response.data;
  },

  /**
   * POST /appointments/:id/reschedule
   * Reschedule an existing appointment
   */
  async reschedule(
    id: string,
    data: {
      newStart: Date;
      newEnd: Date;
      reason: string;
      notes?: string;
      providerId?: string;
      notifyPatient?: boolean;
    }
  ): Promise<AppointmentDto> {
    const response = await schedulingApi.post(`/appointments/${id}/reschedule`, data);
    return response.data;
  },

  /**
   * GET /appointment-types
   * List all appointment types
   */
  async getAppointmentTypes(): Promise<
    Array<{
      id: string;
      name: string;
      duration: number;
      color?: string;
      description?: string;
    }>
  > {
    const response = await schedulingApi.get('/appointment-types');
    return response.data;
  },

  /**
   * GET /providers
   * List all providers
   */
  async getProviders(params?: { clinicId?: string }): Promise<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      specialty?: string;
      photo?: string;
    }>
  > {
    const response = await schedulingApi.get('/providers', { params });
    return response.data;
  },
};
