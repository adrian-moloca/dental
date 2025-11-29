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
import {
  CreatePatientDto,
  UpdatePatientDto,
  SearchPatientDto,
  MergePatientsDto,
  CreateAllergyDto,
  UpdateAllergyDto,
  CreateMedicalConditionDto,
  UpdateMedicalConditionDto,
  CreateMedicationDto,
  UpdateMedicationDto,
  CreatePatientFlagDto,
  UpdatePatientFlagDto,
  UpdateMedicalAlertsDto,
  CreateInsurancePolicyDto,
  UpdateInsurancePolicyDto,
  VerifyInsuranceDto,
} from './dto';
import {
  Patient,
  PatientDocument,
  MedicalAlerts,
  AllergyEntry,
  MedicalConditionEntry,
  MedicationEntry,
  PatientFlagEntry,
  InsurancePolicy,
} from './entities/patient.schema';
import {
  PatientCreatedEvent,
  PatientUpdatedEvent,
  PatientDeletedEvent,
  PatientMergedEvent,
} from './events/patient.events';
import { ValidationError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';
import { CnpEncryptionService } from '../../services';

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
    private readonly cnpEncryptionService: CnpEncryptionService,
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

    // Check for CNP duplicate if provided
    if (dto.person.cnp) {
      const cnpExists = await this.checkCnpDuplicate(dto.person.cnp, tenantId);
      if (cnpExists) {
        throw new ValidationError(
          'A patient with this CNP (Cod Numeric Personal) already exists in the system',
        );
      }
    }

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
        ssn: dto.person.ssn, // Deprecated - kept for backwards compatibility
        // Handle Romanian CNP with encryption
        nationalId: dto.person.cnp
          ? this.cnpEncryptionService.toNationalIdInfo(
              this.cnpEncryptionService.processCnp(dto.person.cnp, tenantId),
            )
          : undefined,
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
        smsMarketing: dto.consent.smsMarketing ?? false,
        emailMarketing: dto.consent.emailMarketing ?? false,
        whatsappMarketing: dto.consent.whatsappMarketing ?? false,
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
   * Find patient by Romanian CNP (Cod Numeric Personal)
   *
   * @param cnp - Raw CNP string
   * @param tenantId - Tenant ID for isolation
   * @returns Patient document or null
   */
  async findByCnp(cnp: string, tenantId: string): Promise<PatientDocument | null> {
    const searchHash = this.cnpEncryptionService.createSearchHash(cnp);
    return this.patientsRepository.findByCnpHash(searchHash, tenantId);
  }

  /**
   * Decrypt and return the CNP for a patient
   *
   * @param patient - Patient document
   * @returns Decrypted CNP or null if not stored
   */
  decryptPatientCnp(patient: PatientDocument): string | null {
    const encryptedValue = patient.person?.nationalId?.encryptedValue;
    if (!encryptedValue) {
      return null;
    }
    return this.cnpEncryptionService.decryptCnp(encryptedValue);
  }

  /**
   * Get masked CNP for display purposes
   *
   * @param patient - Patient document
   * @returns Masked CNP (e.g., "***********1234") or null
   */
  getMaskedCnp(patient: PatientDocument): string | null {
    const lastFour = patient.person?.nationalId?.lastFour;
    if (!lastFour) {
      return null;
    }
    return '*'.repeat(9) + lastFour;
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

    // Validate CNP if provided
    if (dto.person.cnp) {
      const cnpValidation = this.cnpEncryptionService.validateCnp(dto.person.cnp);
      if (!cnpValidation.valid) {
        throw new ValidationError(`Invalid Romanian CNP: ${cnpValidation.error}`);
      }

      // Warn if CNP data doesn't match provided data
      if (cnpValidation.birthDate) {
        const cnpBirthDate = cnpValidation.birthDate;
        const dtoBirthDate = dto.person.dateOfBirth;

        // Compare dates (ignore time)
        const cnpDateStr = cnpBirthDate.toISOString().split('T')[0];
        const dtoDateStr = dtoBirthDate.toISOString().split('T')[0];

        if (cnpDateStr !== dtoDateStr) {
          this.logger.warn(
            `CNP birth date (${cnpDateStr}) differs from provided date (${dtoDateStr})`,
          );
        }
      }

      if (cnpValidation.gender) {
        const cnpGender = cnpValidation.gender;
        const dtoGender = dto.person.gender;

        if (dtoGender !== 'other' && dtoGender !== 'prefer_not_to_say' && cnpGender !== dtoGender) {
          this.logger.warn(`CNP gender (${cnpGender}) differs from provided gender (${dtoGender})`);
        }
      }
    }
  }

  /**
   * Check if CNP already exists for another patient
   *
   * @param cnp - CNP to check
   * @param tenantId - Tenant ID for isolation
   * @param excludePatientId - Patient ID to exclude (for updates)
   * @returns Whether CNP exists for another patient
   * @private
   */
  private async checkCnpDuplicate(
    cnp: string,
    tenantId: string,
    excludePatientId?: UUID,
  ): Promise<boolean> {
    const searchHash = this.cnpEncryptionService.createSearchHash(cnp);
    return this.patientsRepository.cnpExists(searchHash, tenantId, excludePatientId);
  }

  // ============================================================================
  // MEDICAL ALERTS METHODS
  // ============================================================================

  /**
   * Get all medical alerts for a patient
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Medical alerts object
   */
  async getMedicalAlerts(patientId: UUID, tenantId: string): Promise<MedicalAlerts> {
    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    // Return medical alerts or empty structure
    return (
      patient.medicalAlerts || {
        allergies: [],
        conditions: [],
        medications: [],
        flags: [],
      }
    );
  }

  /**
   * Update all medical alerts at once
   *
   * @param patientId - Patient ID
   * @param dto - Medical alerts data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async updateMedicalAlerts(
    patientId: UUID,
    dto: UpdateMedicalAlertsDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Updating medical alerts for patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    const medicalAlerts: MedicalAlerts = {
      allergies: dto.allergies
        ? dto.allergies.map((a) => this.mapAllergyDtoToEntry(a, userId))
        : patient.medicalAlerts?.allergies || [],
      conditions: dto.conditions
        ? dto.conditions.map((c) => this.mapConditionDtoToEntry(c, userId))
        : patient.medicalAlerts?.conditions || [],
      medications: dto.medications
        ? dto.medications.map((m) => this.mapMedicationDtoToEntry(m))
        : patient.medicalAlerts?.medications || [],
      flags: dto.flags
        ? dto.flags.map((f) => this.mapFlagDtoToEntry(f, userId))
        : patient.medicalAlerts?.flags || [],
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    const updatedPatient = await this.patientsRepository.update(patientId, tenantId, updateData);

    // Emit event for medical history update
    this.eventEmitter.emit('patient.updated', {
      patientId,
      tenantId,
      updatedFields: ['medicalAlerts'],
      userId,
    });

    return updatedPatient;
  }

  /**
   * Add a new allergy to a patient
   *
   * @param patientId - Patient ID
   * @param dto - Allergy data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID adding the allergy
   * @returns Updated patient
   */
  async addAllergy(
    patientId: UUID,
    dto: CreateAllergyDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Adding allergy to patient ${patientId}: ${dto.allergen}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    const allergy = this.mapAllergyDtoToEntry(dto, userId);
    const allergies = [...(patient.medicalAlerts?.allergies || []), allergy];

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { conditions: [], medications: [], flags: [] }),
      allergies,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    const updatedPatient = await this.patientsRepository.update(patientId, tenantId, updateData);

    // Log life-threatening allergies specifically
    if (dto.severity === 'life_threatening') {
      this.logger.warn(
        `CRITICAL: Life-threatening allergy added for patient ${patientId}: ${dto.allergen}`,
      );
    }

    this.eventEmitter.emit('patient.updated', {
      patientId,
      tenantId,
      updatedFields: ['medicalAlerts.allergies'],
      userId,
    });

    return updatedPatient;
  }

  /**
   * Update an existing allergy
   *
   * @param patientId - Patient ID
   * @param allergyIndex - Index of the allergy to update
   * @param dto - Updated allergy data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async updateAllergy(
    patientId: UUID,
    allergyIndex: number,
    dto: UpdateAllergyDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Updating allergy ${allergyIndex} for patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);
    const allergies = [...(patient.medicalAlerts?.allergies || [])];

    if (allergyIndex < 0 || allergyIndex >= allergies.length) {
      throw new ValidationError(`Allergy index ${allergyIndex} is out of range`);
    }

    // Merge existing with updates
    allergies[allergyIndex] = {
      ...allergies[allergyIndex],
      ...(dto.allergen && { allergen: dto.allergen }),
      ...(dto.severity && { severity: dto.severity }),
      ...(dto.reaction !== undefined && { reaction: dto.reaction }),
      ...(dto.onsetDate && { onsetDate: dto.onsetDate }),
      ...(dto.verifiedDate && { verifiedDate: dto.verifiedDate }),
      ...(dto.verifiedBy && { verifiedBy: dto.verifiedBy }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { conditions: [], medications: [], flags: [] }),
      allergies,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Remove an allergy (soft delete by setting isActive = false)
   *
   * @param patientId - Patient ID
   * @param allergyIndex - Index of the allergy to remove
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async removeAllergy(
    patientId: UUID,
    allergyIndex: number,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    return this.updateAllergy(patientId, allergyIndex, { isActive: false }, tenantId, userId);
  }

  /**
   * Add a new medical condition
   *
   * @param patientId - Patient ID
   * @param dto - Condition data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID adding the condition
   * @returns Updated patient
   */
  async addMedicalCondition(
    patientId: UUID,
    dto: CreateMedicalConditionDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Adding condition to patient ${patientId}: ${dto.name}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    const condition = this.mapConditionDtoToEntry(dto, userId);
    const conditions = [...(patient.medicalAlerts?.conditions || []), condition];

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { allergies: [], medications: [], flags: [] }),
      conditions,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Update an existing medical condition
   *
   * @param patientId - Patient ID
   * @param conditionIndex - Index of the condition to update
   * @param dto - Updated condition data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async updateMedicalCondition(
    patientId: UUID,
    conditionIndex: number,
    dto: UpdateMedicalConditionDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Updating condition ${conditionIndex} for patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);
    const conditions = [...(patient.medicalAlerts?.conditions || [])];

    if (conditionIndex < 0 || conditionIndex >= conditions.length) {
      throw new ValidationError(`Condition index ${conditionIndex} is out of range`);
    }

    conditions[conditionIndex] = {
      ...conditions[conditionIndex],
      ...(dto.name && { name: dto.name }),
      ...(dto.icd10Code !== undefined && { icd10Code: dto.icd10Code }),
      ...(dto.status && { status: dto.status }),
      ...(dto.severity && { severity: dto.severity }),
      ...(dto.diagnosedDate && { diagnosedDate: dto.diagnosedDate }),
      ...(dto.resolvedDate && { resolvedDate: dto.resolvedDate }),
      ...(dto.diagnosedBy && { diagnosedBy: dto.diagnosedBy }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { allergies: [], medications: [], flags: [] }),
      conditions,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Add a new medication
   *
   * @param patientId - Patient ID
   * @param dto - Medication data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID adding the medication
   * @returns Updated patient
   */
  async addMedication(
    patientId: UUID,
    dto: CreateMedicationDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Adding medication to patient ${patientId}: ${dto.name}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    const medication = this.mapMedicationDtoToEntry(dto);
    const medications = [...(patient.medicalAlerts?.medications || []), medication];

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { allergies: [], conditions: [], flags: [] }),
      medications,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Update an existing medication
   *
   * @param patientId - Patient ID
   * @param medicationIndex - Index of the medication to update
   * @param dto - Updated medication data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async updateMedication(
    patientId: UUID,
    medicationIndex: number,
    dto: UpdateMedicationDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Updating medication ${medicationIndex} for patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);
    const medications = [...(patient.medicalAlerts?.medications || [])];

    if (medicationIndex < 0 || medicationIndex >= medications.length) {
      throw new ValidationError(`Medication index ${medicationIndex} is out of range`);
    }

    medications[medicationIndex] = {
      ...medications[medicationIndex],
      ...(dto.name && { name: dto.name }),
      ...(dto.genericName && { genericName: dto.genericName }),
      ...(dto.dosage && { dosage: dto.dosage }),
      ...(dto.frequency && { frequency: dto.frequency }),
      ...(dto.route && { route: dto.route }),
      ...(dto.startDate && { startDate: dto.startDate }),
      ...(dto.endDate && { endDate: dto.endDate }),
      ...(dto.prescribedBy && { prescribedBy: dto.prescribedBy }),
      ...(dto.reason && { reason: dto.reason }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { allergies: [], conditions: [], flags: [] }),
      medications,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Add a patient flag
   *
   * @param patientId - Patient ID
   * @param dto - Flag data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID adding the flag
   * @returns Updated patient
   */
  async addPatientFlag(
    patientId: UUID,
    dto: CreatePatientFlagDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Adding flag to patient ${patientId}: ${dto.type}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    const flag = this.mapFlagDtoToEntry(dto, userId);
    const flags = [...(patient.medicalAlerts?.flags || []), flag];

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { allergies: [], conditions: [], medications: [] }),
      flags,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Update a patient flag
   *
   * @param patientId - Patient ID
   * @param flagIndex - Index of the flag to update
   * @param dto - Updated flag data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async updatePatientFlag(
    patientId: UUID,
    flagIndex: number,
    dto: UpdatePatientFlagDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Updating flag ${flagIndex} for patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);
    const flags = [...(patient.medicalAlerts?.flags || [])];

    if (flagIndex < 0 || flagIndex >= flags.length) {
      throw new ValidationError(`Flag index ${flagIndex} is out of range`);
    }

    flags[flagIndex] = {
      ...flags[flagIndex],
      ...(dto.type && { type: dto.type }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.expiresAt && { expiresAt: dto.expiresAt }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    const medicalAlerts: MedicalAlerts = {
      ...(patient.medicalAlerts || { allergies: [], conditions: [], medications: [] }),
      flags,
      lastReviewedAt: new Date(),
      lastReviewedBy: userId,
    };

    const updateData: Partial<Patient> = {
      medicalAlerts,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Remove a patient flag
   *
   * @param patientId - Patient ID
   * @param flagIndex - Index of the flag to remove
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async removePatientFlag(
    patientId: UUID,
    flagIndex: number,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    return this.updatePatientFlag(patientId, flagIndex, { isActive: false }, tenantId, userId);
  }

  // ============================================================================
  // INSURANCE POLICY METHODS
  // ============================================================================

  /**
   * Get all insurance policies for a patient
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Array of insurance policies
   */
  async getInsurancePolicies(patientId: UUID, tenantId: string): Promise<InsurancePolicy[]> {
    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);
    return patient.insurancePolicies || [];
  }

  /**
   * Add a new insurance policy
   *
   * @param patientId - Patient ID
   * @param dto - Insurance policy data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID adding the policy
   * @returns Updated patient
   */
  async addInsurancePolicy(
    patientId: UUID,
    dto: CreateInsurancePolicyDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Adding insurance policy to patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    const policy = this.mapInsurancePolicyDtoToEntry(dto);
    const insurancePolicies = [...(patient.insurancePolicies || []), policy];

    // If this is marked as primary, ensure no other policy is primary
    if (dto.isPrimary !== false) {
      insurancePolicies.forEach((p, i) => {
        if (i !== insurancePolicies.length - 1) {
          p.isPrimary = false;
        }
      });
    }

    const updateData: Partial<Patient> = {
      insurancePolicies,
      updatedBy: userId,
    };

    const updatedPatient = await this.patientsRepository.update(patientId, tenantId, updateData);

    this.eventEmitter.emit('patient.updated', {
      patientId,
      tenantId,
      updatedFields: ['insurancePolicies'],
      userId,
    });

    return updatedPatient;
  }

  /**
   * Update an existing insurance policy
   *
   * @param patientId - Patient ID
   * @param policyIndex - Index of the policy to update
   * @param dto - Updated policy data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async updateInsurancePolicy(
    patientId: UUID,
    policyIndex: number,
    dto: UpdateInsurancePolicyDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Updating insurance policy ${policyIndex} for patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);
    const insurancePolicies = [...(patient.insurancePolicies || [])];

    if (policyIndex < 0 || policyIndex >= insurancePolicies.length) {
      throw new ValidationError(`Policy index ${policyIndex} is out of range`);
    }

    // Update the policy
    const existingPolicy = insurancePolicies[policyIndex];
    insurancePolicies[policyIndex] = {
      ...existingPolicy,
      ...(dto.provider && {
        provider: { ...existingPolicy.provider, ...dto.provider },
      }),
      ...(dto.policyNumber && { policyNumber: dto.policyNumber }),
      ...(dto.groupNumber !== undefined && { groupNumber: dto.groupNumber }),
      ...(dto.groupName !== undefined && { groupName: dto.groupName }),
      ...(dto.planName !== undefined && { planName: dto.planName }),
      ...(dto.planType !== undefined && { planType: dto.planType }),
      ...(dto.subscriberName && { subscriberName: dto.subscriberName }),
      ...(dto.subscriberId !== undefined && { subscriberId: dto.subscriberId }),
      ...(dto.subscriberRelationship && { subscriberRelationship: dto.subscriberRelationship }),
      ...(dto.subscriberDateOfBirth && { subscriberDateOfBirth: dto.subscriberDateOfBirth }),
      ...(dto.effectiveDate && { effectiveDate: dto.effectiveDate }),
      ...(dto.expirationDate && { expirationDate: dto.expirationDate }),
      ...(dto.coverage && {
        coverage: { ...existingPolicy.coverage, ...dto.coverage },
      }),
      ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.isVerified !== undefined && { isVerified: dto.isVerified }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    };

    // If this is being set as primary, ensure no other policy is primary
    if (dto.isPrimary === true) {
      insurancePolicies.forEach((p, i) => {
        if (i !== policyIndex) {
          p.isPrimary = false;
        }
      });
    }

    const updateData: Partial<Patient> = {
      insurancePolicies,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Remove an insurance policy (soft delete by setting isActive = false)
   *
   * @param patientId - Patient ID
   * @param policyIndex - Index of the policy to remove
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID making the update
   * @returns Updated patient
   */
  async removeInsurancePolicy(
    patientId: UUID,
    policyIndex: number,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    return this.updateInsurancePolicy(
      patientId,
      policyIndex,
      { isActive: false },
      tenantId,
      userId,
    );
  }

  /**
   * Verify insurance eligibility
   *
   * @param patientId - Patient ID
   * @param dto - Verification data
   * @param tenantId - Tenant ID for isolation
   * @param userId - User ID performing verification
   * @returns Updated patient
   */
  async verifyInsurance(
    patientId: UUID,
    dto: VerifyInsuranceDto,
    tenantId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Verifying insurance ${dto.policyIndex} for patient ${patientId}`);

    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);
    const insurancePolicies = [...(patient.insurancePolicies || [])];

    if (dto.policyIndex < 0 || dto.policyIndex >= insurancePolicies.length) {
      throw new ValidationError(`Policy index ${dto.policyIndex} is out of range`);
    }

    // Update verification status and coverage if provided
    insurancePolicies[dto.policyIndex] = {
      ...insurancePolicies[dto.policyIndex],
      isVerified: true,
      verifiedAt: new Date(),
      ...(dto.coverage && {
        coverage: {
          ...insurancePolicies[dto.policyIndex].coverage,
          ...dto.coverage,
          lastVerifiedAt: new Date(),
          verifiedBy: dto.verifiedBy || userId,
        },
      }),
      ...(dto.notes && { notes: dto.notes }),
    };

    const updateData: Partial<Patient> = {
      insurancePolicies,
      updatedBy: userId,
    };

    return this.patientsRepository.update(patientId, tenantId, updateData);
  }

  /**
   * Get the primary insurance policy for a patient
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Primary insurance policy or null
   */
  async getPrimaryInsurance(patientId: UUID, tenantId: string): Promise<InsurancePolicy | null> {
    const policies = await this.getInsurancePolicies(patientId, tenantId);
    return policies.find((p) => p.isPrimary && p.isActive) || null;
  }

  // ============================================================================
  // PATIENT 360 VIEW
  // ============================================================================

  /**
   * Get comprehensive Patient360 view
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Complete patient view with all related data
   */
  async getPatient360(
    patientId: UUID,
    tenantId: string,
  ): Promise<{
    patient: PatientDocument;
    medicalAlerts: MedicalAlerts;
    insuranceSummary: {
      policies: InsurancePolicy[];
      primaryPolicy: InsurancePolicy | null;
      hasCoverage: boolean;
      totalAnnualMax: number | null;
      totalRemaining: number | null;
    };
    criticalAlerts: {
      hasLifeThreateningAllergies: boolean;
      lifeThreateningAllergies: AllergyEntry[];
      activeFlags: PatientFlagEntry[];
      expiredInsurance: boolean;
    };
  }> {
    const patient = await this.patientsRepository.findByIdOrFail(patientId, tenantId);

    const medicalAlerts = patient.medicalAlerts || {
      allergies: [],
      conditions: [],
      medications: [],
      flags: [],
    };

    const insurancePolicies = patient.insurancePolicies || [];
    const activePolicies = insurancePolicies.filter((p) => p.isActive);
    const primaryPolicy = activePolicies.find((p) => p.isPrimary) || null;

    // Check for expired insurance
    const today = new Date();
    const expiredInsurance = activePolicies.some(
      (p) => p.expirationDate && new Date(p.expirationDate) < today,
    );

    // Calculate totals
    const totalAnnualMax = activePolicies.reduce((sum, p) => sum + (p.coverage?.annualMax || 0), 0);
    const totalRemaining = activePolicies.reduce((sum, p) => sum + (p.coverage?.remaining || 0), 0);

    // Critical alerts
    const lifeThreateningAllergies = (medicalAlerts.allergies || []).filter(
      (a) => a.isActive && a.severity === 'life_threatening',
    );

    const activeFlags = (medicalAlerts.flags || []).filter(
      (f) => f.isActive && (!f.expiresAt || new Date(f.expiresAt) > today),
    );

    return {
      patient,
      medicalAlerts,
      insuranceSummary: {
        policies: activePolicies,
        primaryPolicy,
        hasCoverage: activePolicies.length > 0,
        totalAnnualMax: totalAnnualMax > 0 ? totalAnnualMax : null,
        totalRemaining: totalRemaining > 0 ? totalRemaining : null,
      },
      criticalAlerts: {
        hasLifeThreateningAllergies: lifeThreateningAllergies.length > 0,
        lifeThreateningAllergies,
        activeFlags,
        expiredInsurance,
      },
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Map allergy DTO to entry
   * @private
   */
  private mapAllergyDtoToEntry(dto: CreateAllergyDto, userId?: string): AllergyEntry {
    return {
      allergen: dto.allergen,
      severity: dto.severity,
      reaction: dto.reaction,
      onsetDate: dto.onsetDate,
      verifiedDate: dto.verifiedDate,
      verifiedBy: dto.verifiedBy || userId,
      notes: dto.notes,
      isActive: true,
    };
  }

  /**
   * Map condition DTO to entry
   * @private
   */
  private mapConditionDtoToEntry(
    dto: CreateMedicalConditionDto,
    userId?: string,
  ): MedicalConditionEntry {
    return {
      name: dto.name,
      icd10Code: dto.icd10Code,
      status: dto.status || 'active',
      severity: dto.severity,
      diagnosedDate: dto.diagnosedDate,
      diagnosedBy: dto.diagnosedBy || userId,
      notes: dto.notes,
      isActive: true,
    };
  }

  /**
   * Map medication DTO to entry
   * @private
   */
  private mapMedicationDtoToEntry(dto: CreateMedicationDto): MedicationEntry {
    return {
      name: dto.name,
      genericName: dto.genericName,
      dosage: dto.dosage,
      frequency: dto.frequency,
      route: dto.route,
      startDate: dto.startDate,
      endDate: dto.endDate,
      prescribedBy: dto.prescribedBy,
      reason: dto.reason,
      notes: dto.notes,
      isActive: true,
    };
  }

  /**
   * Map flag DTO to entry
   * @private
   */
  private mapFlagDtoToEntry(dto: CreatePatientFlagDto, userId?: string): PatientFlagEntry {
    return {
      type: dto.type,
      description: dto.description,
      addedDate: new Date(),
      addedBy: userId,
      expiresAt: dto.expiresAt,
      isActive: true,
    };
  }

  /**
   * Map insurance policy DTO to entry
   * @private
   */
  private mapInsurancePolicyDtoToEntry(dto: CreateInsurancePolicyDto): InsurancePolicy {
    return {
      provider: {
        name: dto.provider.name,
        phone: dto.provider.phone,
        fax: dto.provider.fax,
        email: dto.provider.email,
        website: dto.provider.website,
        claimsAddress: dto.provider.claimsAddress,
        payerId: dto.provider.payerId,
      },
      policyNumber: dto.policyNumber,
      groupNumber: dto.groupNumber,
      groupName: dto.groupName,
      planName: dto.planName,
      planType: dto.planType,
      subscriberName: dto.subscriberName,
      subscriberId: dto.subscriberId,
      subscriberRelationship: dto.subscriberRelationship,
      subscriberDateOfBirth: dto.subscriberDateOfBirth,
      effectiveDate: dto.effectiveDate,
      expirationDate: dto.expirationDate,
      coverage: dto.coverage
        ? {
            annualMax: dto.coverage.annualMax,
            remaining: dto.coverage.remaining,
            deductible: dto.coverage.deductible,
            deductibleMet: dto.coverage.deductibleMet,
            preventivePercent: dto.coverage.preventivePercent,
            basicPercent: dto.coverage.basicPercent,
            majorPercent: dto.coverage.majorPercent,
            orthoPercent: dto.coverage.orthoPercent,
            orthoLifetimeMax: dto.coverage.orthoLifetimeMax,
            basicWaitingPeriodMonths: dto.coverage.basicWaitingPeriodMonths,
            majorWaitingPeriodMonths: dto.coverage.majorWaitingPeriodMonths,
            planYearStart: dto.coverage.planYearStart,
            currency: dto.coverage.currency || 'RON',
          }
        : undefined,
      isPrimary: dto.isPrimary !== false,
      isActive: true,
      isVerified: false,
      notes: dto.notes,
    };
  }
}
