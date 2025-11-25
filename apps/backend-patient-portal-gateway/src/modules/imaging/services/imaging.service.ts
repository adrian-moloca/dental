import { Injectable } from '@nestjs/common';
import { ImagingServiceClient } from '@/common/http/clients/imaging-service.client';
import { TenantContext } from '@/common/http/http-microservice.client';

@Injectable()
export class ImagingService {
  constructor(private readonly imagingClient: ImagingServiceClient) {}

  async listStudies(patientId: string, tenantContext: TenantContext) {
    return this.imagingClient.listStudies(patientId, tenantContext);
  }

  async getStudy(studyId: string, tenantContext: TenantContext) {
    return this.imagingClient.getStudy(studyId, tenantContext);
  }
}
