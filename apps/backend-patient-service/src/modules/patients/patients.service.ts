/**
 * Patients Service
 *
 * Business logic layer for patient management.
 * Handles CRUD operations, validation, event emission, and complex operations.
 *
 * @module modules/patients
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PatientsRepository,
  PatientSearchCriteria,
  PaginationOptions,
} from './patients.repository';
import { CreatePatientDto, UpdatePatientDto, SearchPatientDto, MergePatientsDto } from './dto';
import { Patient, PatientDocument } from './entities/patient.schema';
import {
  PatientCreatedEvent,
  PatientUpdatedEvent,
  PatientDeletedEvent,
  PatientMergedEvent,
} from './events/patient.events';
import { ValidationError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

/**
 * Patients Service
 *
 * Provides business logic for patient management with:
 * - Patient CRUD operations
 * - Event emission for audit and integration
 * - Tenant isolation
 * - Search and filtering
 * - Duplicate detection and merging
 */
@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    private readonly patientsRepository: PatientsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new patient
   *
   * @param dto - Patient creation data
   * @param tenantId - Tenant ID for isolation
   * @param organizationId - Organization ID
   * @param userId - User ID creating the patient
   * @returns Created patient
   * @throws {ValidationError} If required fields are missing or invalid
   */
  async create(
    dto: CreatePatientDto,
    tenantId: string,
    organizationId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Creating patient for tenant ${tenantId}`);

    // Validate required fields
    this.validateCreatePatient(dto);

    // Generate unique patient ID
    const patientId = crypto.randomUUID() as UUID;

    // Build patient object
    const patientData: Partial<Patient> = {
      id: patientId,
      tenantId,
      organizationId,
      clinicId: dto.clinicId,
      patientNumber: dto.patientNumber,
      person: {
        firstName: dto.person.firstName.trim(),
        lastName: dto.person.lastName.trim(),
        middleName: dto.person.middleName?.trim(),
        preferredName: dto.person.preferredName?.trim(),
        dateOfBirth: dto.person.dateOfBirth,
        gender: dto.person.gender,
        ssn: dto.person.ssn, // TODO: Encrypt before storage
      },
      contacts: {
        phones: (dto.contacts?.phones || []).map((p) => ({
          type: p.type,
          number: p.number,
          isPrimary: p.isPrimary ?? false,
          isActive: true,
        })),
        emails: (dto.contacts?.emails || []).map((e) => ({
          type: e.type,
          address: e.address,
          isPrimary: e.isPrimary ?? false,
          isVerified: false,
        })),
        addresses: (dto.contacts?.addresses || []).map((a) => ({
          street: a.street,
          street2: a.street2,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          country: a.country || 'USA',
          isPrimary: a.isPrimary ?? false,
        })),
      },
      demographics: dto.demographics,
      medical: {
        allergies: dto.medical?.allergies || [],
        medications: dto.medical?.medications || [],
        conditions: dto.medical?.conditions || [],
        flags: dto.medical?.flags || [],
      },
      insurance: {
        primary: dto.primaryInsurance
          ? {
              provider: dto.primaryInsurance.provider,
              policyNumber: dto.primaryInsurance.policyNumber,
              groupNumber: dto.primaryInsurance.groupNumber,
              subscriberName: dto.primaryInsurance.subscriberName,
              subscriberRelationship: dto.primaryInsurance.subscriberRelationship,
              subscriberDateOfBirth: dto.primaryInsurance.subscriberDateOfBirth,
              effectiveDate: dto.primaryInsurance.effectiveDate,
              expirationDate: dto.primaryInsurance.expirationDate,
              isPrimary: dto.primaryInsurance.isPrimary ?? true,
              isActive: true,
            }
          : undefined,
        secondary: dto.secondaryInsurance
          ? {
              provider: dto.secondaryInsurance.provider,
              policyNumber: dto.secondaryInsurance.policyNumber,
              groupNumber: dto.secondaryInsurance.groupNumber,
              subscriberName: dto.secondaryInsurance.subscriberName,
              subscriberRelationship: dto.secondaryInsurance.subscriberRelationship,
              subscriberDateOfBirth: dto.secondaryInsurance.subscriberDateOfBirth,
              effectiveDate: dto.secondaryInsurance.effectiveDate,
              expirationDate: dto.secondaryInsurance.expirationDate,
              isPrimary: dto.secondaryInsurance.isPrimary ?? false,
              isActive: true,
            }
          : undefined,
      },
      tags: dto.tags || [],
      communicationPreferences: {
        preferredChannel: dto.communicationPreferences?.preferredChannel || 'email',
        appointmentReminders: dto.communicationPreferences?.appointmentReminders ?? true,
        marketingConsent: dto.communicationPreferences?.marketingConsent ?? false,
        recallReminders: dto.communicationPreferences?.recallReminders ?? true,
        smsNotifications: dto.communicationPreferences?.smsNotifications ?? false,
        emailNotifications: dto.communicationPreferences?.emailNotifications ?? true,
      },
      consent: {
        gdprConsent: dto.consent.gdprConsent,
        gdprConsentDate: dto.consent.gdprConsent ? new Date() : undefined,
        marketingConsent: dto.consent.marketingConsent ?? false,
        marketingConsentDate: dto.consent.marketingConsent ? new Date() : undefined,
        dataProcessingConsent: dto.consent.dataProcessingConsent ?? false,
        dataProcessingConsentDate: dto.consent.dataProcessingConsent ? new Date() : undefined,
        treatmentConsent: dto.consent.treatmentConsent ?? false,
        treatmentConsentDate: dto.consent.treatmentConsent ? new Date() : undefined,
      },
      valueScore: 0, // Initial value score
      status: 'active',
      assignedProviderId: dto.assignedProviderId,
      referredBy: dto.referredBy,
      notes: dto.notes,
      isDeleted: false,
      isAnonymized: false,
      createdBy: userId,
      updatedBy: userId,
      version: 1,
    };

    // Create patient
    const patient = await this.patientsRepository.create(patientData);

    // Emit event
    const primaryEmail = dto.contacts?.emails?.find((e) => e.isPrimary)?.address;
    const primaryPhone = dto.contacts?.phones?.find((p) => p.isPrimary)?.number;

    const event = new PatientCreatedEvent(
      patientId,
      tenantId,
      organizationId,
      dto.clinicId,
      dto.person.firstName,
      dto.person.lastName,
      dto.person.dateOfBirth,
      primaryEmail || undefined,
      primaryPhone || undefined,
      { userId: userId || 'system' },
    );

    this.eventEmitter.emit('patient.created', event);

    this.logger.log(`Patient created: ${patientId}`);
    return patient;
  }

  /**
   * Find all patients with pagination
   *
   * Simplified list endpoint without filters.
   *
   * @param tenantId - Tenant ID for isolation
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Paginated patient results
   */
  async findAll(tenantId: string, page = 1, limit = 20) {
    this.logger.log(`Listing patients for tenant ${tenantId}`);

    const criteria: PatientSearchCriteria = {
      tenantId,
    };

    const options: PaginationOptions = {
      page,
      limit,
      sortBy: 'person.lastName',
      sortOrder: 'asc',
    };

    return this.patientsRepository.search(criteria, options);
  }

  /**
   * Find patient by ID
   *
   * @param id - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Patient document
   * @throws {NotFoundError} If patient not found
   */
  async findById(id: UUID, tenantId: string): Promise<PatientDocument> {
    return this.patientsRepository.findByIdOrFail(id, tenantId);
  }

  /**
   * Update patient
   *
   * @param id - Patient ID
   * @param dto - Update data
   * @param tenantId - Tenant ID for isolation
   * @param organizationId - Organization ID
   * @param userId - User ID updating the patient
   * @returns Updated patient
   * @throws {NotFoundError} If patient not found
   */
  async update(
    id: UUID,
    dto: UpdatePatientDto,
    tenantId: string,
    organizationId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Updating patient ${id} for tenant ${tenantId}`);

    // Fetch existing patient
    const existingPatient = await this.patientsRepository.findByIdOrFail(id, tenantId);

    // Build update object
    const updateData: Partial<Patient> = {
      updatedBy: userId,
    };

    // Map DTO fields to patient fields
    if (dto.person) {
      updateData.person = {
        ...existingPatient.person,
        ...dto.person,
      };
    }

    if (dto.contacts) {
      updateData.contacts = {
        phones: dto.contacts.phones
          ? dto.contacts.phones.map((p) => ({
              type: p.type,
              number: p.number,
              isPrimary: p.isPrimary ?? false,
              isActive: true,
            }))
          : existingPatient.contacts.phones,
        emails: dto.contacts.emails
          ? dto.contacts.emails.map((e) => ({
              type: e.type,
              address: e.address,
              isPrimary: e.isPrimary ?? false,
              isVerified: false,
            }))
          : existingPatient.contacts.emails,
        addresses: dto.contacts.addresses
          ? dto.contacts.addresses.map((a) => ({
              street: a.street,
              street2: a.street2,
              city: a.city,
              state: a.state,
              postalCode: a.postalCode,
              country: a.country || 'USA',
              isPrimary: a.isPrimary ?? false,
            }))
          : existingPatient.contacts.addresses,
      };
    }

    if (dto.demographics) {
      updateData.demographics = {
        ...existingPatient.demographics,
        ...dto.demographics,
      };
    }

    if (dto.medical) {
      updateData.medical = {
        allergies: dto.medical.allergies || existingPatient.medical.allergies,
        medications: dto.medical.medications || existingPatient.medical.medications,
        conditions: dto.medical.conditions || existingPatient.medical.conditions,
        flags: dto.medical.flags || existingPatient.medical.flags,
      };
    }

    if (dto.primaryInsurance || dto.secondaryInsurance) {
      updateData.insurance = {
        primary: dto.primaryInsurance
          ? {
              provider: dto.primaryInsurance.provider,
              policyNumber: dto.primaryInsurance.policyNumber,
              groupNumber: dto.primaryInsurance.groupNumber,
              subscriberName: dto.primaryInsurance.subscriberName,
              subscriberRelationship: dto.primaryInsurance.subscriberRelationship,
              subscriberDateOfBirth: dto.primaryInsurance.subscriberDateOfBirth,
              effectiveDate: dto.primaryInsurance.effectiveDate,
              expirationDate: dto.primaryInsurance.expirationDate,
              isPrimary: dto.primaryInsurance.isPrimary ?? true,
              isActive: true,
            }
          : existingPatient.insurance?.primary,
        secondary: dto.secondaryInsurance
          ? {
              provider: dto.secondaryInsurance.provider,
              policyNumber: dto.secondaryInsurance.policyNumber,
              groupNumber: dto.secondaryInsurance.groupNumber,
              subscriberName: dto.secondaryInsurance.subscriberName,
              subscriberRelationship: dto.secondaryInsurance.subscriberRelationship,
              subscriberDateOfBirth: dto.secondaryInsurance.subscriberDateOfBirth,
              effectiveDate: dto.secondaryInsurance.effectiveDate,
              expirationDate: dto.secondaryInsurance.expirationDate,
              isPrimary: dto.secondaryInsurance.isPrimary ?? false,
              isActive: true,
            }
          : existingPatient.insurance?.secondary,
      };
    }

    if (dto.communicationPreferences) {
      updateData.communicationPreferences = {
        ...existingPatient.communicationPreferences,
        ...dto.communicationPreferences,
      };
    }

    if (dto.tags !== undefined) {
      updateData.tags = dto.tags;
    }

    if (dto.assignedProviderId !== undefined) {
      updateData.assignedProviderId = dto.assignedProviderId;
    }

    if (dto.referredBy !== undefined) {
      updateData.referredBy = dto.referredBy;
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    // Update patient
    const updatedPatient = await this.patientsRepository.update(id, tenantId, updateData);

    // Emit event
    const updatedFields = Object.keys(dto);
    const event = new PatientUpdatedEvent(
      id,
      tenantId,
      organizationId,
      updatedFields,
      undefined, // Could capture previous values if needed
      { userId: userId || 'system' },
    );

    this.eventEmitter.emit('patient.updated', event);

    this.logger.log(`Patient updated: ${id}`);
    return updatedPatient;
  }

  /**
   * Soft delete patient
   *
   * @param id - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @param organizationId - Organization ID
   * @param userId - User ID deleting the patient
   * @returns Deleted patient
   * @throws {NotFoundError} If patient not found
   */
  async softDelete(
    id: UUID,
    tenantId: string,
    organizationId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Soft deleting patient ${id} for tenant ${tenantId}`);

    const patient = await this.patientsRepository.softDelete(id, tenantId, userId);

    // Emit event
    const event = new PatientDeletedEvent(
      id,
      tenantId,
      organizationId,
      new Date().toISOString() as any,
      { userId: userId || 'system' },
    );

    this.eventEmitter.emit('patient.deleted', event);

    this.logger.log(`Patient soft deleted: ${id}`);
    return patient;
  }

  /**
   * Search patients with filters and pagination
   *
   * @param dto - Search criteria
   * @param tenantId - Tenant ID for isolation
   * @returns Paginated patient results
   */
  async search(dto: SearchPatientDto, tenantId: string) {
    this.logger.log(`Searching patients for tenant ${tenantId}`);

    const criteria: PatientSearchCriteria = {
      tenantId,
      clinicId: dto.clinicId,
      search: dto.search,
      status: dto.status,
      assignedProviderId: dto.assignedProviderId,
      tags: dto.tags,
      flags: dto.flags,
      gender: dto.gender,
      minAge: dto.minAge,
      maxAge: dto.maxAge,
    };

    const options: PaginationOptions = {
      page: dto.page || 1,
      limit: dto.limit || 20,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    };

    return this.patientsRepository.search(criteria, options);
  }

  /**
   * Find potential duplicate patients
   *
   * @param tenantId - Tenant ID for isolation
   * @returns Groups of potential duplicates
   */
  async findDuplicates(tenantId: string): Promise<Array<PatientDocument[]>> {
    this.logger.log(`Finding duplicate patients for tenant ${tenantId}`);
    return this.patientsRepository.findDuplicates(tenantId);
  }

  /**
   * Merge two patient records
   *
   * Combines duplicate patient into master patient and soft-deletes the duplicate.
   *
   * @param dto - Merge data
   * @param tenantId - Tenant ID for isolation
   * @param organizationId - Organization ID
   * @param userId - User ID performing the merge
   * @returns Master patient after merge
   * @throws {ValidationError} If attempting to merge same patient
   * @throws {NotFoundError} If either patient not found
   */
  async merge(
    dto: MergePatientsDto,
    tenantId: string,
    organizationId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Merging patients: ${dto.duplicateId} -> ${dto.masterId}`);

    // Validate not merging same patient
    if (dto.masterId === dto.duplicateId) {
      throw new ValidationError('Cannot merge a patient with itself');
    }

    // Fetch both patients
    const [master, duplicate] = await Promise.all([
      this.patientsRepository.findByIdOrFail(dto.masterId as UUID, tenantId),
      this.patientsRepository.findByIdOrFail(dto.duplicateId as UUID, tenantId),
    ]);

    // Merge logic: combine data from duplicate into master
    // Priority: keep master data unless it's empty

    const mergedData: Partial<Patient> = {
      updatedBy: userId,
    };

    // Merge contacts (combine phone numbers and emails without duplicates)
    const mergedPhones = [...master.contacts.phones];
    for (const phone of duplicate.contacts.phones) {
      if (!mergedPhones.some((p) => p.number === phone.number)) {
        mergedPhones.push(phone);
      }
    }

    const mergedEmails = [...master.contacts.emails];
    for (const email of duplicate.contacts.emails) {
      if (!mergedEmails.some((e) => e.address === email.address)) {
        mergedEmails.push(email);
      }
    }

    const mergedAddresses = [...master.contacts.addresses];
    for (const address of duplicate.contacts.addresses) {
      if (!mergedAddresses.some((a) => a.street === address.street && a.city === address.city)) {
        mergedAddresses.push(address);
      }
    }

    mergedData.contacts = {
      phones: mergedPhones,
      emails: mergedEmails,
      addresses: mergedAddresses,
    };

    // Merge medical information
    mergedData.medical = {
      allergies: [...new Set([...master.medical.allergies, ...duplicate.medical.allergies])],
      medications: [...new Set([...master.medical.medications, ...duplicate.medical.medications])],
      conditions: [...new Set([...master.medical.conditions, ...duplicate.medical.conditions])],
      flags: [...new Set([...master.medical.flags, ...duplicate.medical.flags])],
    };

    // Merge tags
    mergedData.tags = [...new Set([...master.tags, ...duplicate.tags])];

    // Merge notes (append duplicate notes to master)
    if (duplicate.notes && duplicate.notes.trim()) {
      mergedData.notes = master.notes
        ? `${master.notes}\n\n--- Merged from patient ${duplicate.id} ---\n${duplicate.notes}`
        : duplicate.notes;
    }

    // Update master patient
    const updatedMaster = await this.patientsRepository.update(
      dto.masterId as UUID,
      tenantId,
      mergedData,
    );

    // Soft delete duplicate
    await this.patientsRepository.softDelete(dto.duplicateId as UUID, tenantId, userId);

    // TODO: Update relationships to point to master patient
    // TODO: Update timeline events to reference master patient

    // Emit event
    const event = new PatientMergedEvent(
      dto.masterId as UUID,
      dto.duplicateId as UUID,
      tenantId,
      organizationId,
      new Date().toISOString() as any,
      { userId: userId || 'system' },
    );

    this.eventEmitter.emit('patient.merged', event);

    this.logger.log(`Patients merged: ${dto.duplicateId} -> ${dto.masterId}`);
    return updatedMaster;
  }

  /**
   * Calculate patient value score
   *
   * Stub implementation - to be enhanced with actual scoring logic.
   *
   * @param patient - Patient document
   * @returns Calculated value score (0-1000)
   */
  calculateValueScore(/* _patient: PatientDocument */): number {
    // TODO: Implement actual value scoring based on:
    // - Visit frequency
    // - Treatment acceptance rate
    // - Revenue generated
    // - Referral activity
    // - Engagement level
    // - Insurance quality
    return 0;
  }

  /**
   * Validate create patient DTO
   *
   * @param dto - Patient creation data
   * @throws {ValidationError} If validation fails
   * @private
   */
  private validateCreatePatient(dto: CreatePatientDto): void {
    // GDPR consent is required
    if (!dto.consent.gdprConsent) {
      throw new ValidationError('GDPR consent is required to create a patient');
    }

    // Date of birth cannot be in the future
    if (dto.person.dateOfBirth > new Date()) {
      throw new ValidationError('Date of birth cannot be in the future');
    }

    // Date of birth must be reasonable (not more than 150 years ago)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 150);
    if (dto.person.dateOfBirth < minDate) {
      throw new ValidationError('Date of birth is too far in the past');
    }

    // At least one contact method is recommended
    const hasEmail = dto.contacts?.emails && dto.contacts.emails.length > 0;
    const hasPhone = dto.contacts?.phones && dto.contacts.phones.length > 0;
    if (!hasEmail && !hasPhone) {
      this.logger.warn(`Patient created without email or phone contact`);
    }
  }
}
