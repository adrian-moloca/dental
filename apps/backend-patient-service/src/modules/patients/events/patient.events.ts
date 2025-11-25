/**
 * Patient Domain Events
 *
 * Events emitted when significant actions occur on patient entities.
 * These events enable event-driven architecture and audit trails.
 *
 * NOTE: Due to Object.freeze() in the DomainEvent base class, we cannot assign
 * properties after calling super(). Instead, we store data in metadata and retrieve
 * it through getter methods.
 *
 * @module modules/patients/events
 */

import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, ISODateString, Metadata } from '@dentalos/shared-types';

/**
 * Patient Created Event
 *
 * Emitted when a new patient is created in the system.
 */
export class PatientCreatedEvent extends DomainEvent {
  constructor(
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    email: string | undefined,
    phone: string | undefined,
    metadata: Metadata = {},
  ) {
    const eventMetadata: Metadata = {
      ...metadata,
      patientId,
      tenantId,
      organizationId,
      clinicId,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth.toISOString(),
    };

    // Only add email and phone if defined
    if (email !== undefined) {
      eventMetadata.email = email;
    }
    if (phone !== undefined) {
      eventMetadata.phone = phone;
    }

    super('PatientCreated', patientId, 1, eventMetadata);
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

  get firstName(): string {
    return this.getMetadata<string>('firstName')!;
  }

  get lastName(): string {
    return this.getMetadata<string>('lastName')!;
  }

  get dateOfBirth(): Date {
    const isoString = this.getMetadata<string>('dateOfBirth')!;
    return new Date(isoString);
  }

  get email(): string | undefined {
    return this.getMetadata<string>('email');
  }

  get phone(): string | undefined {
    return this.getMetadata<string>('phone');
  }
}

/**
 * Patient Updated Event
 *
 * Emitted when patient information is updated.
 */
export class PatientUpdatedEvent extends DomainEvent {
  constructor(
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    updatedFields: string[],
    previousValues: Record<string, unknown> | undefined,
    metadata: Metadata = {},
  ) {
    const eventMetadata: Metadata = {
      ...metadata,
      patientId,
      tenantId,
      organizationId,
      updatedFields,
    };

    // Only add previousValues if defined
    if (previousValues !== undefined) {
      eventMetadata.previousValues = JSON.parse(JSON.stringify(previousValues));
    }

    super('PatientUpdated', patientId, 1, eventMetadata);
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

  get updatedFields(): string[] {
    return this.getMetadata<string[]>('updatedFields')!;
  }

  get previousValues(): Record<string, unknown> | undefined {
    return this.getMetadata<Record<string, unknown>>('previousValues');
  }
}

/**
 * Patient Deleted Event
 *
 * Emitted when a patient is soft-deleted.
 */
export class PatientDeletedEvent extends DomainEvent {
  constructor(
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    deletedAt: ISODateString,
    metadata: Metadata = {},
  ) {
    super('PatientDeleted', patientId, 1, {
      ...metadata,
      patientId,
      tenantId,
      organizationId,
      deletedAt,
    });
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

  get deletedAt(): ISODateString {
    return this.getMetadata<ISODateString>('deletedAt')!;
  }
}

/**
 * Patient Merged Event
 *
 * Emitted when two patient records are merged (duplicate resolution).
 */
export class PatientMergedEvent extends DomainEvent {
  constructor(
    masterId: UUID,
    duplicateId: UUID,
    tenantId: string,
    organizationId: string,
    mergedAt: ISODateString,
    metadata: Metadata = {},
  ) {
    super('PatientMerged', masterId, 1, {
      ...metadata,
      masterId,
      duplicateId,
      tenantId,
      organizationId,
      mergedAt,
    });
  }

  get masterId(): UUID {
    return this.getMetadata<UUID>('masterId')!;
  }

  get duplicateId(): UUID {
    return this.getMetadata<UUID>('duplicateId')!;
  }

  get tenantId(): string {
    return this.getMetadata<string>('tenantId')!;
  }

  get organizationId(): string {
    return this.getMetadata<string>('organizationId')!;
  }

  get mergedAt(): ISODateString {
    return this.getMetadata<ISODateString>('mergedAt')!;
  }
}

/**
 * Patient Anonymized Event
 *
 * Emitted when patient data is anonymized for GDPR compliance.
 */
export class PatientAnonymizedEvent extends DomainEvent {
  constructor(
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    anonymizedAt: ISODateString,
    reason: string,
    metadata: Metadata = {},
  ) {
    super('PatientAnonymized', patientId, 1, {
      ...metadata,
      patientId,
      tenantId,
      organizationId,
      anonymizedAt,
      reason,
    });
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

  get anonymizedAt(): ISODateString {
    return this.getMetadata<ISODateString>('anonymizedAt')!;
  }

  get reason(): string {
    return this.getMetadata<string>('reason')!;
  }
}
