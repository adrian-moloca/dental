/**
 * Relationships Service
 *
 * Business logic for managing patient relationships.
 *
 * @module modules/relationships
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientRelationship, PatientRelationshipDocument } from './entities/relationship.schema';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { NotFoundError, ConflictError, ValidationError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

@Injectable()
export class RelationshipsService {
  constructor(
    @InjectModel(PatientRelationship.name)
    private readonly relationshipModel: Model<PatientRelationshipDocument>,
  ) {}

  async create(
    patientId: UUID,
    dto: CreateRelationshipDto,
    tenantId: string,
    organizationId: string,
    userId?: string,
  ): Promise<PatientRelationshipDocument> {
    // Validate not creating relationship to self
    if (patientId === dto.relatedPatientId) {
      throw new ValidationError('Cannot create relationship to self');
    }

    // Check if relationship already exists
    const existing = await this.relationshipModel.findOne({
      tenantId,
      patientId,
      relatedPatientId: dto.relatedPatientId,
    });

    if (existing) {
      throw new ConflictError('Relationship already exists');
    }

    const relationship = new this.relationshipModel({
      id: crypto.randomUUID(),
      tenantId,
      organizationId,
      patientId,
      relatedPatientId: dto.relatedPatientId,
      relationshipType: dto.relationshipType,
      notes: dto.notes,
      isActive: true,
      isEmergencyContact: dto.isEmergencyContact || false,
      canMakeDecisions: dto.canMakeDecisions || false,
      canViewRecords: dto.canViewRecords || false,
      createdBy: userId,
    });

    return relationship.save();
  }

  async findByPatientId(patientId: UUID, tenantId: string): Promise<PatientRelationshipDocument[]> {
    return this.relationshipModel.find({ tenantId, patientId, isActive: true }).exec();
  }

  async remove(patientId: UUID, relatedPatientId: UUID, tenantId: string): Promise<void> {
    const result = await this.relationshipModel.deleteOne({
      tenantId,
      patientId,
      relatedPatientId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Relationship not found');
    }
  }
}
