/**
 * Patient Relationship MongoDB Schema
 *
 * Defines relationships between patients (e.g., family members, emergency contacts).
 * Supports bidirectional relationships with proper tenant isolation.
 *
 * @module modules/relationships/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { UUID } from '@dentalos/shared-types';

/**
 * Patient Relationship Document
 *
 * Represents a relationship between two patients within the same tenant.
 * Examples: parent-child, spouse-spouse, guardian-dependent, emergency contact.
 */
@Schema({
  timestamps: true,
  collection: 'patient_relationships',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret._id;
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret.__v;
      return ret;
    },
  },
})
export class PatientRelationship {
  @Prop({ required: true, type: String, unique: true, index: true })
  id!: UUID;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({ required: true, type: String, index: true })
  organizationId!: string;

  @Prop({ required: true, type: String, index: true })
  patientId!: UUID;

  @Prop({ required: true, type: String, index: true })
  relatedPatientId!: UUID;

  @Prop({
    required: true,
    type: String,
    enum: ['parent', 'child', 'spouse', 'sibling', 'guardian', 'emergency', 'other'],
    index: true,
  })
  relationshipType!: string;

  @Prop({ type: String, maxlength: 500 })
  notes?: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: false })
  isEmergencyContact!: boolean;

  @Prop({ type: Boolean, default: false })
  canMakeDecisions!: boolean;

  @Prop({ type: Boolean, default: false })
  canViewRecords!: boolean;

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Date })
  updatedAt!: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;
}

export type PatientRelationshipDocument = PatientRelationship & Document;

export const PatientRelationshipSchema = SchemaFactory.createForClass(PatientRelationship);

// Compound indexes for query optimization and tenant isolation
PatientRelationshipSchema.index({ tenantId: 1, patientId: 1, isActive: 1 });
PatientRelationshipSchema.index({ tenantId: 1, relatedPatientId: 1, isActive: 1 });
PatientRelationshipSchema.index(
  { tenantId: 1, patientId: 1, relatedPatientId: 1 },
  { unique: true },
);
PatientRelationshipSchema.index({ tenantId: 1, relationshipType: 1 });
PatientRelationshipSchema.index({ tenantId: 1, isEmergencyContact: 1 });
PatientRelationshipSchema.index({ organizationId: 1, patientId: 1 });
PatientRelationshipSchema.index({ createdAt: 1 });
