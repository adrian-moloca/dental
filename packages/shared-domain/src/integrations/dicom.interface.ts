/**
 * DICOM / PACS Provider Domain Types
 */

import {
  BaseIntegrationConfig,
  IntegrationResult,
  TenantId,
  OrganizationId,
  ClinicId,
} from './integration-types';

export enum DicomStandard {
  WADO = 'WADO',
  QIDO = 'QIDO',
  STOW = 'STOW',
}

export enum DicomModality {
  CR = 'CR',
  CT = 'CT',
  MR = 'MR',
  US = 'US',
  XA = 'XA',
  DX = 'DX',
  IO = 'IO',
  PX = 'PX',
}

export enum DicomQueryLevel {
  PATIENT = 'PATIENT',
  STUDY = 'STUDY',
  SERIES = 'SERIES',
  INSTANCE = 'INSTANCE',
}

export interface DicomProviderConfig extends BaseIntegrationConfig {
  pacsUrl: string;
  wadoUrl: string;
  qidoUrl: string;
  stowUrl: string;
  aeTitle: string;
  supportsCompression: boolean;
  supportedModalities: DicomModality[];
}

export interface DicomQueryRequest {
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  queryLevel: DicomQueryLevel;
  patientId?: string;
  studyInstanceUID?: string;
  seriesInstanceUID?: string;
  modality?: DicomModality;
  studyDate?: string;
  accessionNumber?: string;
  correlationId: string;
}

export interface DicomStudy {
  studyInstanceUID: string;
  patientID: string;
  patientName: string;
  studyDate: string;
  studyTime?: string;
  studyDescription?: string;
  modality: DicomModality;
  accessionNumber?: string;
  numberOfSeries: number;
  numberOfInstances: number;
}

export interface DicomSeries {
  seriesInstanceUID: string;
  studyInstanceUID: string;
  seriesNumber: number;
  modality: DicomModality;
  seriesDescription?: string;
  numberOfInstances: number;
}

export interface DicomInstance {
  sopInstanceUID: string;
  seriesInstanceUID: string;
  instanceNumber: number;
  sopClassUID: string;
  rows?: number;
  columns?: number;
  bitsAllocated?: number;
  pixelSpacing?: number[];
}

export interface DicomRetrieveRequest {
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  studyInstanceUID: string;
  seriesInstanceUID?: string;
  sopInstanceUID?: string;
  transferSyntax?: string;
  correlationId: string;
}

export interface DicomRetrieveResponse {
  fileUrl: string;
  contentType: string;
  size: number;
  retrievedAt: Date;
}

export interface DicomStoreRequest {
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  dicomFile: Uint8Array;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  sopInstanceUID: string;
  correlationId: string;
}

export interface DicomStoreResponse {
  studyInstanceUID: string;
  seriesInstanceUID: string;
  sopInstanceUID: string;
  storedAt: Date;
  status: 'SUCCESS' | 'FAILED';
}

export interface DicomProviderAdapter {
  query(request: DicomQueryRequest): Promise<IntegrationResult<DicomStudy[]>>;
  retrieve(request: DicomRetrieveRequest): Promise<IntegrationResult<DicomRetrieveResponse>>;
  store(request: DicomStoreRequest): Promise<IntegrationResult<DicomStoreResponse>>;
}
