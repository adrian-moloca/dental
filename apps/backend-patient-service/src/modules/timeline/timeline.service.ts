/**
 * Timeline Service
 *
 * Aggregates patient timeline events from various sources.
 *
 * @module modules/timeline
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from '../patients/entities/patient.schema';
import { NotFoundError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

export interface TimelineEvent {
  id: string;
  type: string;
  timestamp: Date;
  description: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  /**
   * Get patient timeline
   *
   * Aggregates events from patient creation, updates, and future integrations.
   */
  async getTimeline(
    patientId: UUID,
    tenantId: string,
    page = 1,
    limit = 50,
  ): Promise<{ events: TimelineEvent[]; total: number }> {
    const patient = await this.patientModel.findOne({ id: patientId, tenantId }).exec();

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    const events: TimelineEvent[] = [];

    // Patient creation event
    events.push({
      id: `created-${patient.id}`,
      type: 'patient.created',
      timestamp: patient.createdAt,
      description: `Patient ${patient.person.firstName} ${patient.person.lastName} was created`,
      metadata: {
        createdBy: patient.createdBy,
      },
    });

    // Patient update events (if timestamps differ)
    if (patient.updatedAt && patient.updatedAt > patient.createdAt) {
      events.push({
        id: `updated-${patient.id}`,
        type: 'patient.updated',
        timestamp: patient.updatedAt,
        description: 'Patient information was updated',
        metadata: {
          updatedBy: patient.updatedBy,
        },
      });
    }

    // Stub: Future integrations would add:
    // - Appointment events
    // - Treatment events
    // - Communication events
    // - Billing events

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedEvents = events.slice(start, end);

    return {
      events: paginatedEvents,
      total: events.length,
    };
  }
}
