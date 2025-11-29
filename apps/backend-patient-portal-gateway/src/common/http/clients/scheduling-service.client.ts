/**
 * Scheduling Service Client
 *
 * Client for making requests to the backend-scheduling microservice.
 *
 * @module common/http/clients/scheduling-service-client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMicroserviceClient, TenantContext } from '../http-microservice.client';
import type { AppConfig } from '@/config/configuration';

export interface AppointmentDto {
  appointmentId: string;
  patientId: string;
  providerId: string;
  clinicId: string;
  appointmentTypeId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    title: string;
  };
  clinic: {
    clinicId: string;
    name: string;
    address: any;
  };
  appointmentType: {
    name: string;
    duration: number;
  };
}

export interface CreateAppointmentDto {
  patientId: string;
  providerId: string;
  clinicId: string;
  appointmentTypeId: string;
  startTime: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  startTime?: string;
  providerId?: string;
  notes?: string;
}

@Injectable()
export class SchedulingServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpMicroserviceClient,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = this.configService.get('microservices.schedulingServiceUrl', {
      infer: true,
    });
  }

  /**
   * List appointments for a patient
   */
  async listAppointments(
    patientId: string,
    tenantContext: TenantContext,
    params?: {
      startDate?: string;
      endDate?: string;
      status?: string;
    },
  ): Promise<AppointmentDto[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const path = `/api/appointments/patient/${patientId}${query ? `?${query}` : ''}`;

    return this.httpClient.get<AppointmentDto[]>(this.baseUrl, path, tenantContext);
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(
    appointmentId: string,
    tenantContext: TenantContext,
  ): Promise<AppointmentDto> {
    return this.httpClient.get<AppointmentDto>(
      this.baseUrl,
      `/api/appointments/${appointmentId}`,
      tenantContext,
    );
  }

  /**
   * Create new appointment
   */
  async createAppointment(
    dto: CreateAppointmentDto,
    tenantContext: TenantContext,
  ): Promise<AppointmentDto> {
    return this.httpClient.post<AppointmentDto>(
      this.baseUrl,
      '/api/appointments',
      tenantContext,
      dto,
    );
  }

  /**
   * Update appointment (reschedule)
   */
  async updateAppointment(
    appointmentId: string,
    dto: UpdateAppointmentDto,
    tenantContext: TenantContext,
  ): Promise<AppointmentDto> {
    return this.httpClient.patch<AppointmentDto>(
      this.baseUrl,
      `/api/appointments/${appointmentId}`,
      tenantContext,
      dto,
    );
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: string, tenantContext: TenantContext): Promise<void> {
    await this.httpClient.delete<void>(
      this.baseUrl,
      `/api/appointments/${appointmentId}`,
      tenantContext,
    );
  }
}
