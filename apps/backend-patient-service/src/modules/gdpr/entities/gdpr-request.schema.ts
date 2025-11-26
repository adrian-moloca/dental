/**
 * GDPR Request MongoDB Schema
 *
 * Tracks data subject requests for GDPR compliance:
 * - Right to Access
 * - Right to Erasure
 * - Right to Portability
 *
 * @module modules/gdpr/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { UUID } from '@dentalos/shared-types';

/**
 * GDPR Request Document
 *
 * Represents a formal data subject request under GDPR regulations.
 */
@Schema({
  timestamps: true,
  collection: 'gdpr_requests',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class GdprRequest {
  @Prop({ required: true, type: String, unique: true, index: true })
  id!: UUID;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({ required: true, type: String, index: true })
  patientId!: UUID;

  @Prop({
    required: true,
    type: String,
    enum: ['access', 'erasure', 'portability'],
    index: true,
  })
  requestType!: 'access' | 'erasure' | 'portability';

  @Prop({
    required: true,
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending',
    index: true,
  })
  status!: 'pending' | 'in_progress' | 'completed' | 'rejected';

  @Prop({ required: true, type: Date, default: Date.now })
  requestedAt!: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: String })
  requestedBy?: string; // User ID or 'patient'

  @Prop({ type: String })
  processedBy?: string; // Admin/staff user ID

  // For access/portability requests
  @Prop({ type: String })
  dataPackageUrl?: string;

  @Prop({ type: Object })
  dataPackageMetadata?: {
    fileSize?: number;
    format?: 'json' | 'pdf' | 'zip';
    expiresAt?: Date;
  };

  // For erasure requests
  @Prop({
    type: String,
    enum: ['pseudonymization', 'full_deletion'],
  })
  erasureMethod?: 'pseudonymization' | 'full_deletion';

  @Prop({ type: [String], default: [] })
  retainedData?: string[]; // Fields kept for legal reasons

  @Prop({ type: Object })
  erasureDetails?: {
    anonymizedFields?: string[];
    deletedRecords?: number;
    retentionReason?: string;
  };

  @Prop({ type: String, maxlength: 5000 })
  notes?: string;

  @Prop({ type: String, maxlength: 2000 })
  rejectionReason?: string;

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Date })
  updatedAt!: Date;
}

export type GdprRequestDocument = GdprRequest & Document;

export const GdprRequestSchema = SchemaFactory.createForClass(GdprRequest);

// Compound indexes for query optimization and tenant isolation
GdprRequestSchema.index({ tenantId: 1, patientId: 1 });
GdprRequestSchema.index({ tenantId: 1, status: 1, requestedAt: 1 });
GdprRequestSchema.index({ tenantId: 1, requestType: 1, status: 1 });
GdprRequestSchema.index({ createdAt: 1 });
