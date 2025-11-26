/**
 * GDPR Domain Events
 *
 * Events emitted when GDPR-related actions occur.
 * These events enable audit trails and cross-service integration.
 *
 * @module modules/gdpr/events
 */

import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, ISODateString, Metadata } from '@dentalos/shared-types';

/**
 * GDPR Access Requested Event
 *
 * Emitted when a patient or admin initiates a data access request.
 */
export class GdprAccessRequestedEvent extends DomainEvent {
  constructor(
    requestId: UUID,
    patientId: UUID,
    tenantId: string,
    requestedBy: string,
    format: 'json' | 'pdf' | 'zip',
    metadata: Metadata = {},
  ) {
    super('GdprAccessRequested', requestId, 1, {
      ...metadata,
      requestId,
      patientId,
      tenantId,
      requestedBy,
      format,
    });
  }

  get requestId(): UUID {
    return this.getMetadata<UUID>('requestId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get requestedBy(): string {
    return this.getMetadata<string>('requestedBy')!;
  }

  get format(): 'json' | 'pdf' | 'zip' {
    return this.getMetadata<'json' | 'pdf' | 'zip'>('format')!;
  }
}

/**
 * GDPR Erasure Requested Event
 *
 * Emitted when a patient or admin initiates an erasure request.
 */
export class GdprErasureRequestedEvent extends DomainEvent {
  constructor(
    requestId: UUID,
    patientId: UUID,
    tenantId: string,
    requestedBy: string,
    erasureMethod: 'pseudonymization' | 'full_deletion',
    metadata: Metadata = {},
  ) {
    super('GdprErasureRequested', requestId, 1, {
      ...metadata,
      requestId,
      patientId,
      tenantId,
      requestedBy,
      erasureMethod,
    });
  }

  get requestId(): UUID {
    return this.getMetadata<UUID>('requestId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get requestedBy(): string {
    return this.getMetadata<string>('requestedBy')!;
  }

  get erasureMethod(): 'pseudonymization' | 'full_deletion' {
    return this.getMetadata<'pseudonymization' | 'full_deletion'>('erasureMethod')!;
  }
}

/**
 * GDPR Portability Requested Event
 *
 * Emitted when a patient requests data portability.
 */
export class GdprPortabilityRequestedEvent extends DomainEvent {
  constructor(
    requestId: UUID,
    patientId: UUID,
    tenantId: string,
    requestedBy: string,
    format: 'json' | 'pdf',
    metadata: Metadata = {},
  ) {
    super('GdprPortabilityRequested', requestId, 1, {
      ...metadata,
      requestId,
      patientId,
      tenantId,
      requestedBy,
      format,
    });
  }

  get requestId(): UUID {
    return this.getMetadata<UUID>('requestId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get requestedBy(): string {
    return this.getMetadata<string>('requestedBy')!;
  }

  get format(): 'json' | 'pdf' {
    return this.getMetadata<'json' | 'pdf'>('format')!;
  }
}

/**
 * GDPR Request Completed Event
 *
 * Emitted when a GDPR request is successfully completed.
 */
export class GdprRequestCompletedEvent extends DomainEvent {
  constructor(
    requestId: UUID,
    patientId: UUID,
    tenantId: string,
    requestType: 'access' | 'erasure' | 'portability',
    completedBy: string,
    completedAt: ISODateString,
    metadata: Metadata = {},
  ) {
    super('GdprRequestCompleted', requestId, 1, {
      ...metadata,
      requestId,
      patientId,
      tenantId,
      requestType,
      completedBy,
      completedAt,
    });
  }

  get requestId(): UUID {
    return this.getMetadata<UUID>('requestId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get requestType(): 'access' | 'erasure' | 'portability' {
    return this.getMetadata<'access' | 'erasure' | 'portability'>('requestType')!;
  }

  get completedBy(): string {
    return this.getMetadata<string>('completedBy')!;
  }

  get completedAt(): ISODateString {
    return this.getMetadata<ISODateString>('completedAt')!;
  }
}

/**
 * GDPR Request Rejected Event
 *
 * Emitted when a GDPR request is rejected by admin.
 */
export class GdprRequestRejectedEvent extends DomainEvent {
  constructor(
    requestId: UUID,
    patientId: UUID,
    tenantId: string,
    requestType: 'access' | 'erasure' | 'portability',
    rejectedBy: string,
    reason: string,
    metadata: Metadata = {},
  ) {
    super('GdprRequestRejected', requestId, 1, {
      ...metadata,
      requestId,
      patientId,
      tenantId,
      requestType,
      rejectedBy,
      reason,
    });
  }

  get requestId(): UUID {
    return this.getMetadata<UUID>('requestId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get requestType(): 'access' | 'erasure' | 'portability' {
    return this.getMetadata<'access' | 'erasure' | 'portability'>('requestType')!;
  }

  get rejectedBy(): string {
    return this.getMetadata<string>('rejectedBy')!;
  }

  get reason(): string {
    return this.getMetadata<string>('reason')!;
  }
}
