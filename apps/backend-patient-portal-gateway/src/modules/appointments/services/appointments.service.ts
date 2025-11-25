import { Injectable } from '@nestjs/common';
import { SchedulingServiceClient } from '@/common/http/clients/scheduling-service.client';
import { TenantContext } from '@/common/http/http-microservice.client';

@Injectable()
export class AppointmentsService {
  constructor(private readonly schedulingClient: SchedulingServiceClient) {}

  async listAppointments(patientId: string, tenantContext: TenantContext, params?: any) {
    return this.schedulingClient.listAppointments(patientId, tenantContext, params);
  }

  async getAppointment(appointmentId: string, tenantContext: TenantContext) {
    return this.schedulingClient.getAppointment(appointmentId, tenantContext);
  }

  async createAppointment(dto: any, tenantContext: TenantContext) {
    return this.schedulingClient.createAppointment(dto, tenantContext);
  }

  async updateAppointment(appointmentId: string, dto: any, tenantContext: TenantContext) {
    return this.schedulingClient.updateAppointment(appointmentId, dto, tenantContext);
  }

  async cancelAppointment(appointmentId: string, tenantContext: TenantContext) {
    await this.schedulingClient.cancelAppointment(appointmentId, tenantContext);
  }
}
