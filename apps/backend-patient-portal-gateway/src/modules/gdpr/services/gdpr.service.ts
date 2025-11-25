import { Injectable } from '@nestjs/common';
import { PatientServiceClient } from '@/common/http/clients/patient-service.client';
import { TenantContext } from '@/common/http/http-microservice.client';

@Injectable()
export class GdprService {
  constructor(private readonly patientClient: PatientServiceClient) {}

  async exportData(patientId: string, tenantContext: TenantContext) {
    return this.patientClient.exportPatientData(patientId, tenantContext);
  }

  async requestDeletion(patientId: string, tenantContext: TenantContext) {
    return this.patientClient.requestDeletion(patientId, tenantContext);
  }

  async getConsents(patientId: string, tenantContext: TenantContext) {
    return this.patientClient.getConsents(patientId, tenantContext);
  }
}
