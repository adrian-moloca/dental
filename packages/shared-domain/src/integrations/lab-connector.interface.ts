/**
 * Lab Connector Domain Types
 */

import {
  BaseIntegrationConfig,
  IntegrationResult,
  TenantId,
  OrganizationId,
  ClinicId,
} from './integration-types';

export enum LabType {
  ALIGNER = 'ALIGNER',
  CROWN_BRIDGE = 'CROWN_BRIDGE',
  DENTURE = 'DENTURE',
  IMPLANT = 'IMPLANT',
  ORTHODONTIC = 'ORTHODONTIC',
}

export enum LabCaseStatus {
  SUBMITTED = 'SUBMITTED',
  RECEIVED = 'RECEIVED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  QUALITY_CHECK = 'QUALITY_CHECK',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

export enum LabPriority {
  STANDARD = 'STANDARD',
  RUSH = 'RUSH',
  URGENT = 'URGENT',
}

export interface LabProviderConfig extends BaseIntegrationConfig {
  labName: string;
  labType: LabType;
  apiEndpoint: string;
  supportsDigitalFiles: boolean;
  supportedFileFormats: string[];
}

export interface LabCasePatient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface LabCaseItem {
  toothNumber?: string;
  shade?: string;
  material?: string;
  instructions?: string;
}

export interface SendLabCaseRequest {
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;
  labType: LabType;
  patient: LabCasePatient;
  providerId: string;
  providerName: string;
  items: LabCaseItem[];
  priority: LabPriority;
  dueDate?: Date;
  instructions?: string;
  digitalFilesUrls?: string[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  correlationId: string;
  metadata?: Record<string, any>;
}

export interface LabCaseExternal {
  externalCaseId: string;
  internalCaseId: string;
  labName: string;
  status: LabCaseStatus;
  submittedAt: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  cost?: number;
  currency?: string;
}

export interface LabCaseStatusResponse {
  externalCaseId: string;
  status: LabCaseStatus;
  statusUpdatedAt: Date;
  notes?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
}

export interface LabConnectorAdapter {
  sendCase(request: SendLabCaseRequest): Promise<IntegrationResult<LabCaseExternal>>;
  getCaseStatus(externalCaseId: string): Promise<IntegrationResult<LabCaseStatusResponse>>;
  cancelCase(externalCaseId: string, reason?: string): Promise<IntegrationResult<{ canceled: boolean }>>;
}
