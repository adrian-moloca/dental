/**
 * Patient Domain Events
 *
 * Events related to patient lifecycle in the dental practice management system.
 * These events capture patient registration, updates, and deletion.
 *
 * @module shared-events/contracts
 */

import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';

/**
 * Published when a new patient is registered
 *
 * Triggers:
 * - Front desk registers new patient
 * - Online patient registration
 * - Patient import from external system
 *
 * Consumers:
 * - Search index (index patient for search)
 * - Notification service (send welcome message)
 * - Analytics service (track patient acquisition)
 * - Billing service (setup patient account)
 */
export class PatientCreated extends DomainEvent {
  public readonly patientId: UUID;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email?: string;
  public readonly phone?: string;
  public readonly dateOfBirth?: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;

  constructor(params: {
    aggregateId: UUID;
    patientId: UUID;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
  }) {
    super('PatientCreated', params.aggregateId, 1);
    this.patientId = params.patientId;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.email = params.email;
    this.phone = params.phone;
    this.dateOfBirth = params.dateOfBirth;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
  }
}

/**
 * Published when patient information is updated
 *
 * Triggers:
 * - Patient updates their profile
 * - Front desk updates patient information
 * - Contact information change
 * - Medical history update
 *
 * Consumers:
 * - Search index (update patient data)
 * - Cache invalidation service
 * - Notification service (send confirmation)
 * - Audit service (log changes for compliance)
 */
export class PatientUpdated extends DomainEvent {
  public readonly patientId: UUID;
  public readonly firstName?: string;
  public readonly lastName?: string;
  public readonly email?: string;
  public readonly phone?: string;
  public readonly dateOfBirth?: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly updatedFields: readonly string[];

  constructor(params: {
    aggregateId: UUID;
    patientId: UUID;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    updatedFields: readonly string[];
  }) {
    super('PatientUpdated', params.aggregateId, 1);
    this.patientId = params.patientId;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.email = params.email;
    this.phone = params.phone;
    this.dateOfBirth = params.dateOfBirth;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.updatedFields = params.updatedFields;
  }
}

/**
 * Published when a patient record is deleted
 *
 * Triggers:
 * - Patient requests data deletion (GDPR/privacy)
 * - Admin deletes duplicate or test record
 * - Data retention policy enforcement
 *
 * Consumers:
 * - Search index (remove patient from search)
 * - Appointment service (cancel future appointments)
 * - Billing service (finalize patient account)
 * - Audit service (log deletion for compliance)
 * - Data archival service (archive patient data)
 *
 * Note: May be a soft delete for compliance reasons, but published
 * as deletion event for downstream consumers.
 */
export class PatientDeleted extends DomainEvent {
  public readonly patientId: UUID;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly deletedBy: UUID;
  public readonly reason?: string;

  constructor(params: {
    aggregateId: UUID;
    patientId: UUID;
    firstName: string;
    lastName: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    deletedBy: UUID;
    reason?: string;
  }) {
    super('PatientDeleted', params.aggregateId, 1);
    this.patientId = params.patientId;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.deletedBy = params.deletedBy;
    this.reason = params.reason;
  }
}
