/**
 * Imaging Service Client
 *
 * Client for making requests to the backend-imaging-service microservice.
 *
 * @module common/http/clients/imaging-service-client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMicroserviceClient, TenantContext } from '../http-microservice.client';
import type { AppConfig } from '@/config/configuration';

export interface ImagingStudy {
  studyId: string;
  patientId: string;
  studyDate: string;
  modality: string;
  studyDescription: string;
  seriesCount: number;
  imageCount: number;
  status: string;
  viewerUrl?: string;
}

export interface ImagingStudyDetails extends ImagingStudy {
  series: Array<{
    seriesId: string;
    seriesNumber: number;
    modality: string;
    seriesDescription: string;
    images: Array<{
      imageId: string;
      instanceNumber: number;
      thumbnailUrl?: string;
      viewerUrl?: string;
    }>;
  }>;
}

@Injectable()
export class ImagingServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpMicroserviceClient,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = this.configService.get('microservices.imagingServiceUrl', {
      infer: true,
    });
  }

  /**
   * List imaging studies for patient
   */
  async listStudies(patientId: string, tenantContext: TenantContext): Promise<ImagingStudy[]> {
    return this.httpClient.get<ImagingStudy[]>(
      this.baseUrl,
      `/api/patients/${patientId}/imaging-studies`,
      tenantContext,
    );
  }

  /**
   * Get imaging study details
   */
  async getStudy(studyId: string, tenantContext: TenantContext): Promise<ImagingStudyDetails> {
    return this.httpClient.get<ImagingStudyDetails>(
      this.baseUrl,
      `/api/imaging-studies/${studyId}`,
      tenantContext,
    );
  }
}
