/**
 * GDPR Service
 *
 * Handles GDPR compliance operations: data export and anonymization.
 *
 * @module modules/gdpr
 */

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../patients/entities/patient.schema';
import { PatientAnonymizedEvent } from '../patients/events/patient.events';
import { NotFoundError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

@Injectable()
export class GdprService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Export complete patient data for GDPR compliance
   */
  async exportPatientData(patientId: UUID, tenantId: string): Promise<any> {
    const patient = await this.patientModel
      .findOne({ id: patientId, tenantId, isDeleted: false })
      .exec();

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Return complete patient data
    return {
      patient: patient.toJSON(),
      exportedAt: new Date().toISOString(),
      exportReason: 'GDPR Data Export Request',
    };
  }

  /**
   * Anonymize patient data for GDPR "right to be forgotten"
   */
  async anonymizePatient(
    patientId: UUID,
    tenantId: string,
    organizationId: string,
    userId?: string,
  ): Promise<PatientDocument> {
    const patient = await this.patientModel.findOne({
      id: patientId,
      tenantId,
      isDeleted: false,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Anonymize PII fields
    patient.person.firstName = 'ANONYMIZED';
    patient.person.lastName = 'ANONYMIZED';
    patient.person.middleName = undefined;
    patient.person.preferredName = undefined;
    patient.person.ssn = undefined;
    patient.person.photoUrl = undefined;

    patient.contacts.phones = [];
    patient.contacts.emails = [];
    patient.contacts.addresses = [];

    patient.demographics = undefined;
    patient.notes = 'Patient data anonymized per GDPR request';

    patient.isAnonymized = true;
    patient.anonymizedAt = new Date();
    patient.isDeleted = true;
    patient.deletedAt = new Date();
    patient.deletedBy = userId;

    await patient.save();

    // Emit event
    const event = new PatientAnonymizedEvent(
      patientId,
      tenantId,
      organizationId,
      new Date().toISOString() as any,
      'GDPR Right to be Forgotten',
      { userId: userId || 'system' },
    );

    this.eventEmitter.emit('patient.anonymized', event);

    return patient;
  }
}
