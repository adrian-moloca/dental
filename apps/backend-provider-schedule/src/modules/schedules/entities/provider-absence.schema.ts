import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Absence type enumeration
 */
export enum AbsenceType {
  VACATION = 'vacation',
  SICK = 'sick',
  CONFERENCE = 'conference',
  TRAINING = 'training',
  PERSONAL = 'personal',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

/**
 * Absence status enumeration
 */
export enum AbsenceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export type ProviderAbsenceDocument = HydratedDocument<ProviderAbsence>;

/**
 * Provider Absence MongoDB Schema
 *
 * Represents periods when a provider is unavailable (time-off, vacations, etc.)
 * Used to block out time slots in the provider's schedule.
 */
@Schema({
  collection: 'provider_absences',
  timestamps: true,
  autoIndex: true,
})
export class ProviderAbsence extends Document {
  /**
   * Unique absence identifier (UUID)
   */
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  /**
   * Tenant identifier for multi-tenant isolation
   */
  @Prop({ required: true, index: true })
  tenantId!: string;

  /**
   * Organization identifier
   */
  @Prop({ required: true, index: true })
  organizationId!: string;

  /**
   * Provider identifier this absence belongs to
   */
  @Prop({ required: true, index: true })
  providerId!: string;

  /**
   * Absence start date and time
   */
  @Prop({ required: true, index: true })
  start!: Date;

  /**
   * Absence end date and time
   */
  @Prop({ required: true, index: true })
  end!: Date;

  /**
   * Type of absence
   */
  @Prop({ required: true, enum: Object.values(AbsenceType), index: true })
  type!: AbsenceType;

  /**
   * Absence status (for approval workflow)
   */
  @Prop({ required: true, enum: Object.values(AbsenceStatus), default: AbsenceStatus.PENDING })
  status!: AbsenceStatus;

  /**
   * Reason or description for the absence
   */
  @Prop({ required: false })
  reason?: string;

  /**
   * Whether this is an all-day absence
   */
  @Prop({ required: true, default: true })
  isAllDay!: boolean;

  /**
   * Whether this absence repeats (for recurring absences)
   */
  @Prop({ required: false, default: false })
  isRecurring!: boolean;

  /**
   * Recurrence pattern (if isRecurring = true)
   * Format: RRULE string (RFC 5545)
   */
  @Prop({ required: false })
  recurrenceRule?: string;

  /**
   * User who created this absence record
   */
  @Prop({ required: false })
  createdBy?: string;

  /**
   * User who approved/rejected this absence
   */
  @Prop({ required: false })
  approvedBy?: string;

  /**
   * Approval/rejection timestamp
   */
  @Prop({ required: false })
  approvedAt?: Date;

  /**
   * Notes about approval/rejection
   */
  @Prop({ required: false })
  approvalNotes?: string;

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProviderAbsenceSchema = SchemaFactory.createForClass(ProviderAbsence);

/**
 * Compound indexes for performance optimization
 * Support common query patterns:
 * 1. Find absences for a provider in a date range
 * 2. Find pending absences for approval
 * 3. Find absences by type
 */
ProviderAbsenceSchema.index({ tenantId: 1, providerId: 1, start: 1, end: 1 });
ProviderAbsenceSchema.index({ tenantId: 1, providerId: 1, status: 1 });
ProviderAbsenceSchema.index({ tenantId: 1, organizationId: 1, start: 1 });
ProviderAbsenceSchema.index({ tenantId: 1, status: 1, start: 1 });

/**
 * Validation: ensure start is before end
 */
ProviderAbsenceSchema.pre('save', function (next) {
  if (this.start >= this.end) {
    next(new Error('Absence start time must be before end time'));
  }
  next();
});
