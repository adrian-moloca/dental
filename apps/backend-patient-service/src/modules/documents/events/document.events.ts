/**
 * Patient Document Domain Events
 *
 * Events emitted when significant actions occur on patient documents.
 * These events enable event-driven architecture, audit trails, and integration.
 *
 * COMPLIANCE:
 * - All document events must be logged for HIPAA audit trail
 * - Events should never contain PHI in plain text
 * - Use document IDs, not document content
 *
 * @module modules/documents/events
 */

import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, ISODateString, Metadata } from '@dentalos/shared-types';
import type { DocumentCategory, DocumentSource } from '../entities';

/**
 * Document Uploaded Event
 *
 * Emitted when a new document is uploaded to the system.
 */
export class DocumentUploadedEvent extends DomainEvent {
  constructor(
    documentId: UUID,
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    category: DocumentCategory,
    title: string,
    source: DocumentSource,
    uploadedBy: string,
    appointmentId: string | undefined,
    metadata: Metadata = {},
  ) {
    const eventMetadata: Metadata = {
      ...metadata,
      documentId,
      patientId,
      tenantId,
      organizationId,
      clinicId,
      category,
      title,
      source,
      uploadedBy,
    };

    if (appointmentId !== undefined) {
      eventMetadata.appointmentId = appointmentId;
    }

    super('DocumentUploaded', documentId, 1, eventMetadata);
  }

  get documentId(): UUID {
    return this.getMetadata<UUID>('documentId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get clinicId(): string {
    return this.getMetadata<string>('clinicId')!;
  }

  get category(): DocumentCategory {
    return this.getMetadata<DocumentCategory>('category')!;
  }

  get title(): string {
    return this.getMetadata<string>('title')!;
  }

  get source(): DocumentSource {
    return this.getMetadata<DocumentSource>('source')!;
  }

  get uploadedBy(): string {
    return this.getMetadata<string>('uploadedBy')!;
  }

  get appointmentId(): string | undefined {
    return this.getMetadata<string>('appointmentId');
  }
}

/**
 * Document Signed Event
 *
 * Emitted when a document receives a signature.
 * This is a significant legal event for consent documents.
 */
export class DocumentSignedEvent extends DomainEvent {
  constructor(
    documentId: UUID,
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    signedBy: string,
    signedAt: ISODateString,
    signatureMethod: string,
    signerRole: string | undefined,
    isAdditionalSignature: boolean,
    metadata: Metadata = {},
  ) {
    const eventMetadata: Metadata = {
      ...metadata,
      documentId,
      patientId,
      tenantId,
      organizationId,
      signedBy,
      signedAt,
      signatureMethod,
      isAdditionalSignature,
    };

    if (signerRole !== undefined) {
      eventMetadata.signerRole = signerRole;
    }

    super('DocumentSigned', documentId, 1, eventMetadata);
  }

  get documentId(): UUID {
    return this.getMetadata<UUID>('documentId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get signedBy(): string {
    return this.getMetadata<string>('signedBy')!;
  }

  get signedAt(): ISODateString {
    return this.getMetadata<ISODateString>('signedAt')!;
  }

  get signatureMethod(): string {
    return this.getMetadata<string>('signatureMethod')!;
  }

  get signerRole(): string | undefined {
    return this.getMetadata<string>('signerRole');
  }

  get isAdditionalSignature(): boolean {
    return this.getMetadata<boolean>('isAdditionalSignature')!;
  }
}

/**
 * Document Deleted Event
 *
 * Emitted when a document is soft-deleted.
 * Includes deletion reason for audit compliance.
 */
export class DocumentDeletedEvent extends DomainEvent {
  constructor(
    documentId: UUID,
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    deletedBy: string,
    deletedAt: ISODateString,
    deletionReason: string | undefined,
    metadata: Metadata = {},
  ) {
    const eventMetadata: Metadata = {
      ...metadata,
      documentId,
      patientId,
      tenantId,
      organizationId,
      deletedBy,
      deletedAt,
    };

    if (deletionReason !== undefined) {
      eventMetadata.deletionReason = deletionReason;
    }

    super('DocumentDeleted', documentId, 1, eventMetadata);
  }

  get documentId(): UUID {
    return this.getMetadata<UUID>('documentId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get deletedBy(): string {
    return this.getMetadata<string>('deletedBy')!;
  }

  get deletedAt(): ISODateString {
    return this.getMetadata<ISODateString>('deletedAt')!;
  }

  get deletionReason(): string | undefined {
    return this.getMetadata<string>('deletionReason');
  }
}

/**
 * Document Generated Event
 *
 * Emitted when a document is generated from a template.
 * Used for consent forms, patient information sheets, etc.
 */
export class DocumentGeneratedEvent extends DomainEvent {
  constructor(
    documentId: UUID,
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    templateId: string,
    generatedBy: string,
    appointmentId: string | undefined,
    metadata: Metadata = {},
  ) {
    const eventMetadata: Metadata = {
      ...metadata,
      documentId,
      patientId,
      tenantId,
      organizationId,
      clinicId,
      templateId,
      generatedBy,
    };

    if (appointmentId !== undefined) {
      eventMetadata.appointmentId = appointmentId;
    }

    super('DocumentGenerated', documentId, 1, eventMetadata);
  }

  get documentId(): UUID {
    return this.getMetadata<UUID>('documentId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get clinicId(): string {
    return this.getMetadata<string>('clinicId')!;
  }

  get templateId(): string {
    return this.getMetadata<string>('templateId')!;
  }

  get generatedBy(): string {
    return this.getMetadata<string>('generatedBy')!;
  }

  get appointmentId(): string | undefined {
    return this.getMetadata<string>('appointmentId');
  }
}

/**
 * Document Updated Event
 *
 * Emitted when document metadata is updated.
 */
export class DocumentUpdatedEvent extends DomainEvent {
  constructor(
    documentId: UUID,
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    updatedBy: string,
    updatedFields: string[],
    metadata: Metadata = {},
  ) {
    super('DocumentUpdated', documentId, 1, {
      ...metadata,
      documentId,
      patientId,
      tenantId,
      organizationId,
      updatedBy,
      updatedFields,
    });
  }

  get documentId(): UUID {
    return this.getMetadata<UUID>('documentId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get updatedBy(): string {
    return this.getMetadata<string>('updatedBy')!;
  }

  get updatedFields(): string[] {
    return this.getMetadata<string[]>('updatedFields')!;
  }
}

/**
 * Document Accessed Event
 *
 * Emitted when a document is accessed/downloaded.
 * Required for HIPAA audit trail.
 */
export class DocumentAccessedEvent extends DomainEvent {
  constructor(
    documentId: UUID,
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    accessedBy: string,
    accessType: 'view' | 'download',
    ipAddress: string | undefined,
    metadata: Metadata = {},
  ) {
    const eventMetadata: Metadata = {
      ...metadata,
      documentId,
      patientId,
      tenantId,
      organizationId,
      accessedBy,
      accessType,
    };

    if (ipAddress !== undefined) {
      eventMetadata.ipAddress = ipAddress;
    }

    super('DocumentAccessed', documentId, 1, eventMetadata);
  }

  get documentId(): UUID {
    return this.getMetadata<UUID>('documentId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get accessedBy(): string {
    return this.getMetadata<string>('accessedBy')!;
  }

  get accessType(): 'view' | 'download' {
    return this.getMetadata<'view' | 'download'>('accessType')!;
  }

  get ipAddress(): string | undefined {
    return this.getMetadata<string>('ipAddress');
  }
}

/**
 * Document Expiring Event
 *
 * Emitted when a document is approaching its expiry date.
 * Used for consent renewal reminders.
 */
export class DocumentExpiringEvent extends DomainEvent {
  constructor(
    documentId: UUID,
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    category: DocumentCategory,
    expiryDate: ISODateString,
    daysUntilExpiry: number,
    metadata: Metadata = {},
  ) {
    super('DocumentExpiring', documentId, 1, {
      ...metadata,
      documentId,
      patientId,
      tenantId,
      organizationId,
      category,
      expiryDate,
      daysUntilExpiry,
    });
  }

  get documentId(): UUID {
    return this.getMetadata<UUID>('documentId')!;
  }

  get patientId(): UUID {
    return this.getMetadata<UUID>('patientId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get category(): DocumentCategory {
    return this.getMetadata<DocumentCategory>('category')!;
  }

  get expiryDate(): ISODateString {
    return this.getMetadata<ISODateString>('expiryDate')!;
  }

  get daysUntilExpiry(): number {
    return this.getMetadata<number>('daysUntilExpiry')!;
  }
}
