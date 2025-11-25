/**
 * E-Factura Romania Domain Types
 */

import {
  BaseIntegrationConfig,
  IntegrationResult,
  TenantId,
  OrganizationId,
  ClinicId,
} from './integration-types';

export enum EFacturaStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

export enum EFacturaDocumentType {
  INVOICE = 'INVOICE',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
}

export interface EFacturaProviderConfig extends BaseIntegrationConfig {
  anafUrl: string;
  cui: string;
  certificatePath?: string;
  testMode: boolean;
}

export interface EFacturaParty {
  cui: string;
  name: string;
  registrationNumber?: string;
  address: {
    street: string;
    city: string;
    county: string;
    postalCode: string;
    country: string;
  };
  email?: string;
  phone?: string;
  bankAccount?: string;
  bankName?: string;
}

export interface EFacturaLineItem {
  lineNumber: number;
  itemCode?: string;
  itemName: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  discountAmount?: number;
}

export interface SubmitEFacturaRequest {
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  documentType: EFacturaDocumentType;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  supplier: EFacturaParty;
  customer: EFacturaParty;
  lineItems: EFacturaLineItem[];
  totalAmountWithoutVat: number;
  totalVatAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  notes?: string;
  correlationId: string;
  metadata?: Record<string, any>;
}

export interface EFacturaSubmission {
  submissionId: string;
  downloadId: string;
  invoiceNumber: string;
  status: EFacturaStatus;
  submittedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  anafResponse?: any;
}

export interface EFacturaStatusResponse {
  submissionId: string;
  downloadId: string;
  status: EFacturaStatus;
  statusUpdatedAt: Date;
  rejectionReason?: string;
  validationErrors?: string[];
}

export interface EFacturaProviderAdapter {
  submit(request: SubmitEFacturaRequest): Promise<IntegrationResult<EFacturaSubmission>>;
  getStatus(submissionId: string): Promise<IntegrationResult<EFacturaStatusResponse>>;
  cancel(submissionId: string, reason: string): Promise<IntegrationResult<{ canceled: boolean }>>;
  downloadXml(downloadId: string): Promise<IntegrationResult<{ xml: string }>>;
}
