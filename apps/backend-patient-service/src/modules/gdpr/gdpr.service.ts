/**
 * GDPR Service
 *
 * Comprehensive GDPR compliance service handling:
 * - Right to Access (data export)
 * - Right to Erasure (anonymization/deletion)
 * - Right to Portability (machine-readable export)
 * - Request tracking and audit logging
 *
 * @module modules/gdpr
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../patients/entities/patient.schema';
import { GdprRequest, GdprRequestDocument } from './entities/gdpr-request.schema';
import { PatientAnonymizedEvent } from '../patients/events/patient.events';
import {
  GdprAccessRequestedEvent,
  GdprErasureRequestedEvent,
  GdprPortabilityRequestedEvent,
  GdprRequestCompletedEvent,
  GdprRequestRejectedEvent,
} from './events/gdpr.events';
import { NotFoundError, ValidationError, ConflictError } from '@dentalos/shared-errors';
import { AuditLogService } from '../../services/audit-log.service';
import type { UUID } from '@dentalos/shared-types';
import {
  CreateAccessRequestDto,
  CreateErasureRequestDto,
  CreatePortabilityRequestDto,
  ProcessGdprRequestDto,
  QueryGdprRequestsDto,
} from './dto';

/**
 * GDPR Service
 *
 * Implements all GDPR data subject rights with comprehensive audit logging
 * and compliance tracking per EU GDPR and Romanian regulations.
 */
@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);

  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    @InjectModel(GdprRequest.name)
    private readonly gdprRequestModel: Model<GdprRequestDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a GDPR Access Request (Right to Access)
   *
   * Initiates a data subject access request. Patient can request all their data.
   *
   * @param patientId - Patient UUID
   * @param tenantId - Tenant ID for isolation
   * @param dto - Access request details
   * @param requestedBy - User ID or 'patient'
   * @returns Created GDPR request
   */
  async createAccessRequest(
    patientId: UUID,
    tenantId: string,
    dto: CreateAccessRequestDto,
    requestedBy: string = 'patient',
  ): Promise<GdprRequestDocument> {
    this.logger.log(`Creating GDPR access request for patient ${patientId}`);

    // Verify patient exists
    const patient = await this.patientModel.findOne({
      id: patientId,
      tenantId,
      isDeleted: false,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Check for existing pending/in_progress requests
    const existingRequest = await this.gdprRequestModel.findOne({
      patientId,
      tenantId,
      requestType: 'access',
      status: { $in: ['pending', 'in_progress'] },
    });

    if (existingRequest) {
      throw new ConflictError('A pending access request already exists for this patient');
    }

    // Create request
    const requestId = crypto.randomUUID() as UUID;
    const request = new this.gdprRequestModel({
      id: requestId,
      tenantId,
      patientId,
      requestType: 'access',
      status: 'pending',
      requestedBy,
      requestedAt: new Date(),
      notes: dto.notes,
      dataPackageMetadata: {
        format: dto.format || 'json',
      },
    });

    await request.save();

    // Emit event
    const event = new GdprAccessRequestedEvent(
      requestId,
      patientId,
      tenantId,
      requestedBy,
      dto.format || 'json',
      { userId: requestedBy },
    );
    this.eventEmitter.emit('gdpr.access_requested', event);

    // Audit log
    await this.auditLogService.log({
      eventType: 'gdpr.access_requested' as any,
      resourceType: 'gdpr_request',
      resourceId: requestId,
      organizationId: tenantId,
      userId: requestedBy,
      result: 'success',
      metadata: {
        patientId,
        requestType: 'access',
      },
    });

    this.logger.log(`GDPR access request created: ${requestId}`);
    return request;
  }

  /**
   * Create a GDPR Erasure Request (Right to be Forgotten)
   *
   * Initiates a data erasure request. Per Romanian law, clinical data must be
   * retained for 10 years, so pseudonymization is the default method.
   *
   * @param patientId - Patient UUID
   * @param tenantId - Tenant ID for isolation
   * @param dto - Erasure request details
   * @param requestedBy - User ID or 'patient'
   * @returns Created GDPR request
   */
  async createErasureRequest(
    patientId: UUID,
    tenantId: string,
    dto: CreateErasureRequestDto,
    requestedBy: string = 'patient',
  ): Promise<GdprRequestDocument> {
    this.logger.log(`Creating GDPR erasure request for patient ${patientId}`);

    // Verify patient exists
    const patient = await this.patientModel.findOne({
      id: patientId,
      tenantId,
      isDeleted: false,
      isAnonymized: false,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found or already anonymized');
    }

    // Check for existing pending/in_progress requests
    const existingRequest = await this.gdprRequestModel.findOne({
      patientId,
      tenantId,
      requestType: 'erasure',
      status: { $in: ['pending', 'in_progress'] },
    });

    if (existingRequest) {
      throw new ConflictError('A pending erasure request already exists for this patient');
    }

    // Warn if full deletion requested (Romanian law requires retention)
    if (dto.erasureMethod === 'full_deletion') {
      this.logger.warn(
        `Full deletion requested for patient ${patientId}, but clinical data must be retained for 10 years per Romanian law`,
      );
    }

    // Create request
    const requestId = crypto.randomUUID() as UUID;
    const request = new this.gdprRequestModel({
      id: requestId,
      tenantId,
      patientId,
      requestType: 'erasure',
      status: 'pending',
      requestedBy,
      requestedAt: new Date(),
      erasureMethod: dto.erasureMethod,
      notes: dto.notes,
    });

    await request.save();

    // Update patient GDPR status
    patient.gdpr = {
      ...patient.gdpr,
      rightToErasure: {
        status: 'requested',
        requestedAt: new Date(),
      },
      retentionPolicy: patient.gdpr?.retentionPolicy || {
        clinicalData: 10, // Romanian law: 10 years retention
      },
    };
    await patient.save();

    // Emit event
    const event = new GdprErasureRequestedEvent(
      requestId,
      patientId,
      tenantId,
      requestedBy,
      dto.erasureMethod,
      { userId: requestedBy },
    );
    this.eventEmitter.emit('gdpr.erasure_requested', event);

    // Audit log
    await this.auditLogService.log({
      eventType: 'gdpr.erasure_requested' as any,
      resourceType: 'gdpr_request',
      resourceId: requestId,
      organizationId: tenantId,
      userId: requestedBy,
      result: 'success',
      metadata: {
        patientId,
        requestType: 'erasure',
        erasureMethod: dto.erasureMethod,
      },
    });

    this.logger.log(`GDPR erasure request created: ${requestId}`);
    return request;
  }

  /**
   * Create a GDPR Portability Request (Right to Data Portability)
   *
   * Initiates a data portability request. Returns machine-readable export.
   *
   * @param patientId - Patient UUID
   * @param tenantId - Tenant ID for isolation
   * @param dto - Portability request details
   * @param requestedBy - User ID or 'patient'
   * @returns Created GDPR request
   */
  async createPortabilityRequest(
    patientId: UUID,
    tenantId: string,
    dto: CreatePortabilityRequestDto,
    requestedBy: string = 'patient',
  ): Promise<GdprRequestDocument> {
    this.logger.log(`Creating GDPR portability request for patient ${patientId}`);

    // Verify patient exists
    const patient = await this.patientModel.findOne({
      id: patientId,
      tenantId,
      isDeleted: false,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Create request
    const requestId = crypto.randomUUID() as UUID;
    const request = new this.gdprRequestModel({
      id: requestId,
      tenantId,
      patientId,
      requestType: 'portability',
      status: 'pending',
      requestedBy,
      requestedAt: new Date(),
      notes: dto.notes,
      dataPackageMetadata: {
        format: dto.format || 'json',
      },
    });

    await request.save();

    // Emit event
    const event = new GdprPortabilityRequestedEvent(
      requestId,
      patientId,
      tenantId,
      requestedBy,
      dto.format || 'json',
      { userId: requestedBy },
    );
    this.eventEmitter.emit('gdpr.portability_requested', event);

    // Audit log
    await this.auditLogService.log({
      eventType: 'gdpr.portability_requested' as any,
      resourceType: 'gdpr_request',
      resourceId: requestId,
      organizationId: tenantId,
      userId: requestedBy,
      result: 'success',
      metadata: {
        patientId,
        requestType: 'portability',
      },
    });

    this.logger.log(`GDPR portability request created: ${requestId}`);
    return request;
  }

  /**
   * Generate data package for patient (Access/Portability)
   *
   * Creates a comprehensive export of all patient data.
   * In production, this would generate a file and upload to S3.
   *
   * @param patientId - Patient UUID
   * @param tenantId - Tenant ID for isolation
   * @returns Data package object
   */
  async generateDataPackage(patientId: UUID, tenantId: string): Promise<any> {
    this.logger.log(`Generating data package for patient ${patientId}`);

    const patient = await this.patientModel
      .findOne({ id: patientId, tenantId, isDeleted: false })
      .exec();

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Comprehensive data export
    const dataPackage = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportReason: 'GDPR Data Export Request',
        dataSubjectId: patientId,
        tenantId,
      },
      personalInformation: {
        patientNumber: patient.patientNumber,
        firstName: patient.person.firstName,
        lastName: patient.person.lastName,
        middleName: patient.person.middleName,
        preferredName: patient.person.preferredName,
        dateOfBirth: patient.person.dateOfBirth,
        gender: patient.person.gender,
        nationalId: patient.person.ssn ? '[REDACTED]' : undefined, // Encrypted field
      },
      contactInformation: {
        phones: patient.contacts.phones,
        emails: patient.contacts.emails,
        addresses: patient.contacts.addresses,
      },
      demographics: patient.demographics,
      medicalInformation: {
        allergies: patient.medical.allergies,
        medications: patient.medical.medications,
        conditions: patient.medical.conditions,
        flags: patient.medical.flags,
      },
      insurance: patient.insurance,
      communicationPreferences: patient.communicationPreferences,
      consents: patient.consent,
      gdprInformation: patient.gdpr,
      lifecycle: patient.lifecycle,
      tags: patient.tags,
      metadata: {
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        status: patient.status,
      },
      // TODO: In production, include:
      // - Appointment history
      // - Clinical notes (redacted)
      // - Treatment history
      // - Billing/invoice history
      // - Communication logs
    };

    // TODO: In production:
    // 1. Generate file (JSON/PDF/ZIP)
    // 2. Upload to S3
    // 3. Generate presigned URL with expiration
    // 4. Return URL

    return dataPackage;
  }

  /**
   * Process erasure request (anonymize patient)
   *
   * Pseudonymizes patient data while retaining clinical records for legal compliance.
   * Per Romanian law, clinical data must be retained for 10 years.
   *
   * @param patientId - Patient UUID
   * @param tenantId - Tenant ID for isolation
   * @param organizationId - Organization ID
   * @param processedBy - User ID processing the request
   * @returns Anonymized patient
   */
  async processErasure(
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    processedBy: string,
  ): Promise<PatientDocument> {
    this.logger.log(`Processing erasure for patient ${patientId}`);

    const patient = await this.patientModel.findOne({
      id: patientId,
      tenantId,
      isDeleted: false,
      isAnonymized: false,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found or already anonymized');
    }

    // Pseudonymize PII fields
    const anonymizedFields: string[] = [];

    // Person info
    patient.person.firstName = 'ANONYMIZED';
    patient.person.lastName = 'ANONYMIZED';
    patient.person.middleName = undefined;
    patient.person.preferredName = undefined;
    patient.person.ssn = undefined;
    patient.person.photoUrl = undefined;
    anonymizedFields.push('person.firstName', 'person.lastName', 'person.ssn');

    // Contact info
    patient.contacts.phones = [];
    patient.contacts.emails = [];
    patient.contacts.addresses = [];
    anonymizedFields.push('contacts');

    // Demographics (optional PII)
    patient.demographics = undefined;
    anonymizedFields.push('demographics');

    // Clear notes
    patient.notes = 'Patient data anonymized per GDPR request';

    // Marketing consents
    patient.consent.marketingConsent = false;
    patient.consent.smsMarketing = false;
    patient.consent.emailMarketing = false;
    patient.consent.whatsappMarketing = false;

    // Update GDPR status
    patient.gdpr = {
      ...patient.gdpr,
      rightToErasure: {
        status: 'completed',
        requestedAt: patient.gdpr?.rightToErasure?.requestedAt,
        completedAt: new Date(),
      },
      retentionPolicy: {
        clinicalData: 10, // Romanian law: 10 years retention
      },
    };

    // Mark as anonymized
    patient.isAnonymized = true;
    patient.anonymizedAt = new Date();
    patient.isDeleted = true;
    patient.deletedAt = new Date();
    patient.deletedBy = processedBy;
    patient.status = 'archived';

    await patient.save();

    // Fields retained for legal compliance
    const retainedData = [
      'dateOfBirth',
      'gender',
      'medical.allergies',
      'medical.medications',
      'medical.conditions',
      'patientNumber',
      'clinicalNotes', // Referenced but kept in clinical service
      'appointments', // Referenced but kept in scheduling service
      'treatments', // Referenced but kept in clinical service
      'invoices', // Referenced but kept in billing service
    ];

    // Emit event
    const event = new PatientAnonymizedEvent(
      patientId,
      tenantId,
      organizationId,
      new Date().toISOString() as any,
      'GDPR Right to Erasure - Pseudonymization',
      { userId: processedBy },
    );
    this.eventEmitter.emit('patient.anonymized', event);

    // Audit log
    await this.auditLogService.log({
      eventType: 'gdpr.patient_anonymized' as any,
      resourceType: 'patient',
      resourceId: patientId,
      organizationId: tenantId,
      userId: processedBy,
      result: 'success',
      metadata: {
        anonymizedFields,
        retainedData,
        erasureMethod: 'pseudonymization',
      },
    });

    this.logger.log(`Patient anonymized: ${patientId}`);
    return patient;
  }

  /**
   * Process a GDPR request (approve or reject)
   *
   * Admin/staff can approve or reject pending GDPR requests.
   *
   * @param requestId - Request UUID
   * @param tenantId - Tenant ID for isolation
   * @param dto - Process request details
   * @param processedBy - User ID processing the request
   * @returns Updated GDPR request
   */
  async processRequest(
    requestId: UUID,
    tenantId: string,
    dto: ProcessGdprRequestDto,
    processedBy: string,
  ): Promise<GdprRequestDocument> {
    this.logger.log(`Processing GDPR request ${requestId}: ${dto.action}`);

    const request = await this.gdprRequestModel.findOne({
      id: requestId,
      tenantId,
    });

    if (!request) {
      throw new NotFoundError('GDPR request not found');
    }

    if (request.status !== 'pending') {
      throw new ValidationError('Request is not in pending status');
    }

    if (dto.action === 'reject') {
      if (!dto.rejectionReason) {
        throw new ValidationError('Rejection reason is required');
      }

      request.status = 'rejected';
      request.rejectionReason = dto.rejectionReason;
      request.processedBy = processedBy;
      request.completedAt = new Date();

      await request.save();

      // Emit event
      const event = new GdprRequestRejectedEvent(
        requestId,
        request.patientId as UUID,
        tenantId,
        request.requestType,
        processedBy,
        dto.rejectionReason,
        { userId: processedBy },
      );
      this.eventEmitter.emit('gdpr.request_rejected', event);

      // Audit log
      await this.auditLogService.log({
        eventType: 'gdpr.request_rejected' as any,
        resourceType: 'gdpr_request',
        resourceId: requestId,
        organizationId: tenantId,
        userId: processedBy,
        result: 'failure',
        metadata: {
          patientId: request.patientId,
          requestType: request.requestType,
          rejectionReason: dto.rejectionReason,
        },
      });

      return request;
    }

    // Approve and process
    request.status = 'in_progress';
    request.processedBy = processedBy;
    if (dto.notes) {
      request.notes = dto.notes;
    }
    await request.save();

    // Execute based on request type
    if (request.requestType === 'access' || request.requestType === 'portability') {
      // Generate data package
      const dataPackage = await this.generateDataPackage(
        request.patientId as UUID,
        tenantId,
      );

      // TODO: In production, upload to S3 and get URL
      request.dataPackageUrl = 'https://example.com/gdpr-exports/placeholder.json';
      request.dataPackageMetadata = {
        ...request.dataPackageMetadata,
        fileSize: JSON.stringify(dataPackage).length,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };
      request.status = 'completed';
      request.completedAt = new Date();
      await request.save();
    } else if (request.requestType === 'erasure') {
      // Process anonymization
      await this.processErasure(
        request.patientId as UUID,
        tenantId,
        tenantId,
        processedBy,
      );

      // Fields retained for legal compliance
      const retainedDataFields = [
        'dateOfBirth',
        'gender',
        'medical.allergies',
        'medical.medications',
        'medical.conditions',
        'patientNumber',
        'clinicalNotes',
        'appointments',
        'treatments',
        'invoices',
      ];

      request.status = 'completed';
      request.completedAt = new Date();
      request.erasureDetails = {
        anonymizedFields: [
          'person.firstName',
          'person.lastName',
          'contacts',
          'demographics',
        ],
        retentionReason: 'Romanian law requires 10 year clinical data retention',
      };
      request.retainedData = retainedDataFields; // Array of field names retained for legal compliance
      await request.save();
    }

    // Emit completion event
    const event = new GdprRequestCompletedEvent(
      requestId,
      request.patientId as UUID,
      tenantId,
      request.requestType,
      processedBy,
      new Date().toISOString() as any,
      { userId: processedBy },
    );
    this.eventEmitter.emit('gdpr.request_completed', event);

    // Audit log
    await this.auditLogService.log({
      eventType: 'gdpr.request_completed' as any,
      resourceType: 'gdpr_request',
      resourceId: requestId,
      organizationId: tenantId,
      userId: processedBy,
      result: 'success',
      metadata: {
        patientId: request.patientId,
        requestType: request.requestType,
      },
    });

    this.logger.log(`GDPR request completed: ${requestId}`);
    return request;
  }

  /**
   * Get GDPR requests for a patient
   *
   * @param patientId - Patient UUID
   * @param tenantId - Tenant ID for isolation
   * @returns List of GDPR requests
   */
  async getPatientRequests(
    patientId: UUID,
    tenantId: string,
  ): Promise<GdprRequestDocument[]> {
    return this.gdprRequestModel
      .find({ patientId, tenantId })
      .sort({ requestedAt: -1 })
      .exec();
  }

  /**
   * List all GDPR requests (admin view)
   *
   * @param tenantId - Tenant ID for isolation
   * @param query - Query filters
   * @returns Paginated GDPR requests
   */
  async listRequests(tenantId: string, query: QueryGdprRequestsDto) {
    const { requestType, status, patientId, page = 1, limit = 20 } = query;

    const filter: any = { tenantId };

    if (requestType) {
      filter.requestType = requestType;
    }

    if (status) {
      filter.status = status;
    }

    if (patientId) {
      filter.patientId = patientId;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.gdprRequestModel.find(filter).sort({ requestedAt: -1 }).skip(skip).limit(limit).exec(),
      this.gdprRequestModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Get a single GDPR request by ID
   *
   * @param requestId - Request UUID
   * @param tenantId - Tenant ID for isolation
   * @returns GDPR request
   */
  async getRequest(requestId: UUID, tenantId: string): Promise<GdprRequestDocument> {
    const request = await this.gdprRequestModel.findOne({
      id: requestId,
      tenantId,
    });

    if (!request) {
      throw new NotFoundError('GDPR request not found');
    }

    return request;
  }

  /**
   * Export patient data (legacy method for backward compatibility)
   *
   * @deprecated Use createAccessRequest + processRequest instead
   */
  async exportPatientData(patientId: UUID, tenantId: string): Promise<any> {
    return this.generateDataPackage(patientId, tenantId);
  }

  /**
   * Anonymize patient (legacy method for backward compatibility)
   *
   * @deprecated Use createErasureRequest + processRequest instead
   */
  async anonymizePatient(
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    return this.processErasure(patientId, tenantId, organizationId, userId || 'system');
  }
}
