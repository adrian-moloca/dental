/**
 * E-Factura Domain Events
 *
 * These events are emitted throughout the E-Factura lifecycle and can be
 * used for:
 * - Audit logging
 * - Notifications
 * - Integration with other services
 * - Analytics and reporting
 *
 * Event naming convention: efactura.{action}
 */

import { Types } from 'mongoose';

/**
 * Base interface for all E-Factura events
 */
export interface EFacturaEventBase {
  /** Timestamp when the event occurred */
  timestamp: Date;
  /** Tenant context */
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  /** User who triggered the action (if manual) */
  userId?: string;
  /** Correlation ID for distributed tracing */
  correlationId?: string;
}

/**
 * Event emitted when E-Factura XML is generated
 */
export interface EFacturaGeneratedEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission */
  submissionId: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber: string;
  /** SHA-256 hash of the generated XML */
  xmlHash: string;
  /** Size of the XML in bytes */
  xmlSizeBytes: number;
  /** Whether this is a credit note */
  isCreditNote: boolean;
}

/**
 * Event emitted when E-Factura is submitted to ANAF
 */
export interface EFacturaSubmittedEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission */
  submissionId: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber: string;
  /** ANAF upload index (id_incarcare) */
  uploadIndex: string;
  /** Seller CUI */
  sellerCui: string;
  /** Whether this is a retry submission */
  isRetry: boolean;
  /** Retry count if this is a retry */
  retryCount?: number;
}

/**
 * Event emitted when ANAF validates the E-Factura (positive or negative)
 */
export interface EFacturaValidatedEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission */
  submissionId: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber: string;
  /** ANAF upload index */
  uploadIndex: string;
  /** Whether validation passed */
  isValid: boolean;
  /** Number of errors if validation failed */
  errorCount?: number;
  /** Number of warnings */
  warningCount?: number;
  /** Time taken for ANAF to process (in ms from submission to validation) */
  processingTimeMs?: number;
}

/**
 * Event emitted when ANAF accepts and signs the E-Factura
 */
export interface EFacturaAcceptedEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission */
  submissionId: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber: string;
  /** ANAF upload index */
  uploadIndex: string;
  /** ANAF download ID for signed invoice */
  downloadId: string;
  /** Total invoice amount */
  invoiceTotal: number;
  /** Invoice currency */
  currency: string;
  /** Seller CUI */
  sellerCui: string;
  /** Buyer CUI (if B2B) */
  buyerCui?: string;
}

/**
 * Event emitted when ANAF rejects the E-Factura
 */
export interface EFacturaRejectedEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission */
  submissionId: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber: string;
  /** ANAF upload index */
  uploadIndex: string;
  /** Rejection errors from ANAF */
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  /** Whether retry is possible */
  canRetry: boolean;
  /** Suggested action for the user */
  suggestedAction?: string;
}

/**
 * Event emitted when an E-Factura submission fails due to technical error
 */
export interface EFacturaErrorEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission (if exists) */
  submissionId?: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber?: string;
  /** Error code */
  errorCode: string;
  /** Error message */
  errorMessage: string;
  /** Error category */
  errorCategory: 'XML_GENERATION' | 'VALIDATION' | 'NETWORK' | 'AUTH' | 'ANAF_API' | 'INTERNAL';
  /** Whether automatic retry is scheduled */
  willRetry: boolean;
  /** Next retry timestamp if scheduled */
  nextRetryAt?: Date;
}

/**
 * Event emitted when signed invoice is downloaded from ANAF
 */
export interface EFacturaDownloadedEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission */
  submissionId: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber: string;
  /** ANAF download ID */
  downloadId: string;
  /** Size of the downloaded ZIP file */
  fileSizeBytes: number;
}

/**
 * Event emitted when E-Factura submission is cancelled
 */
export interface EFacturaCancelledEvent extends EFacturaEventBase {
  /** MongoDB ObjectId of the submission */
  submissionId: Types.ObjectId;
  /** Invoice ID */
  invoiceId: string;
  /** Invoice number */
  invoiceNumber: string;
  /** Status at the time of cancellation */
  previousStatus: string;
  /** Reason for cancellation */
  reason?: string;
  /** Whether cancelled by user or system */
  cancelledBy: 'user' | 'system';
}

/**
 * Event emitted when OAuth token is refreshed for ANAF
 */
export interface EFacturaTokenRefreshedEvent extends EFacturaEventBase {
  /** CUI for which token was refreshed */
  cui: string;
  /** Token expiry time */
  expiresAt: Date;
  /** Whether this was an automatic or manual refresh */
  refreshType: 'automatic' | 'manual';
}

/**
 * Event emitted when OAuth authorization is required
 */
export interface EFacturaAuthRequiredEvent extends EFacturaEventBase {
  /** CUI for which auth is required */
  cui: string;
  /** Reason auth is required */
  reason: 'token_expired' | 'token_not_found' | 'token_revoked';
  /** Authorization URL to redirect user */
  authorizationUrl?: string;
}

/**
 * Event names as constants for type safety
 */
export const EFACTURA_EVENTS = {
  /** E-Factura XML was generated */
  GENERATED: 'efactura.generated',
  /** E-Factura was submitted to ANAF */
  SUBMITTED: 'efactura.submitted',
  /** ANAF validated the submission */
  VALIDATED: 'efactura.validated',
  /** ANAF accepted and signed the invoice */
  ACCEPTED: 'efactura.accepted',
  /** ANAF rejected the submission */
  REJECTED: 'efactura.rejected',
  /** Technical error occurred */
  ERROR: 'efactura.error',
  /** Signed invoice was downloaded */
  DOWNLOADED: 'efactura.downloaded',
  /** Submission was cancelled */
  CANCELLED: 'efactura.cancelled',
  /** OAuth token was refreshed */
  TOKEN_REFRESHED: 'efactura.token_refreshed',
  /** OAuth authorization is required */
  AUTH_REQUIRED: 'efactura.auth_required',
} as const;

export type EFacturaEventName = (typeof EFACTURA_EVENTS)[keyof typeof EFACTURA_EVENTS];

/**
 * Union type of all E-Factura events
 */
export type EFacturaEvent =
  | EFacturaGeneratedEvent
  | EFacturaSubmittedEvent
  | EFacturaValidatedEvent
  | EFacturaAcceptedEvent
  | EFacturaRejectedEvent
  | EFacturaErrorEvent
  | EFacturaDownloadedEvent
  | EFacturaCancelledEvent
  | EFacturaTokenRefreshedEvent
  | EFacturaAuthRequiredEvent;

/**
 * Factory functions for creating events
 */
export function createEFacturaGeneratedEvent(
  data: Omit<EFacturaGeneratedEvent, 'timestamp'>,
): EFacturaGeneratedEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaSubmittedEvent(
  data: Omit<EFacturaSubmittedEvent, 'timestamp'>,
): EFacturaSubmittedEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaValidatedEvent(
  data: Omit<EFacturaValidatedEvent, 'timestamp'>,
): EFacturaValidatedEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaAcceptedEvent(
  data: Omit<EFacturaAcceptedEvent, 'timestamp'>,
): EFacturaAcceptedEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaRejectedEvent(
  data: Omit<EFacturaRejectedEvent, 'timestamp'>,
): EFacturaRejectedEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaErrorEvent(
  data: Omit<EFacturaErrorEvent, 'timestamp'>,
): EFacturaErrorEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaDownloadedEvent(
  data: Omit<EFacturaDownloadedEvent, 'timestamp'>,
): EFacturaDownloadedEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaCancelledEvent(
  data: Omit<EFacturaCancelledEvent, 'timestamp'>,
): EFacturaCancelledEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaTokenRefreshedEvent(
  data: Omit<EFacturaTokenRefreshedEvent, 'timestamp'>,
): EFacturaTokenRefreshedEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}

export function createEFacturaAuthRequiredEvent(
  data: Omit<EFacturaAuthRequiredEvent, 'timestamp'>,
): EFacturaAuthRequiredEvent {
  return {
    ...data,
    timestamp: new Date(),
  };
}
