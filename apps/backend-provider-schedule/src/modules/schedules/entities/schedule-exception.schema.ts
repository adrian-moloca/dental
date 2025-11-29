import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Exception type enumeration
 * Describes why this day differs from the regular schedule
 */
export enum ExceptionType {
  /** Public or national holiday */
  HOLIDAY = 'holiday',
  /** Provider vacation day */
  VACATION = 'vacation',
  /** Provider sick day */
  SICK = 'sick',
  /** Training or conference attendance */
  TRAINING = 'training',
  /** Custom working hours for a specific day */
  OVERRIDE = 'override',
}

/**
 * Time slot for exception hours
 */
export interface ExceptionTimeSlot {
  /** Start time in HH:mm format (24-hour) */
  start: string;
  /** End time in HH:mm format (24-hour) */
  end: string;
}

export type ScheduleExceptionDocument = HydratedDocument<ScheduleException>;

/**
 * Schedule Exception MongoDB Schema
 *
 * Represents a date-specific override to a provider's regular weekly schedule.
 * Use cases:
 * - Holidays: Provider is off for the entire day
 * - Vacation: Provider requested time off (single day)
 * - Sick: Provider called in sick
 * - Override: Special hours for a specific day (e.g., leaving early)
 *
 * IMPORTANT TEMPORAL CONSIDERATIONS:
 * - Exceptions always apply to a specific date (not time range)
 * - When hours is null/empty, the provider is unavailable all day
 * - When hours is provided, only those hours are available
 * - Exceptions take precedence over weekly schedule template
 *
 * TIMEZONE HANDLING:
 * - The date field stores the local date without time
 * - All time comparisons should be done in the clinic's timezone
 */
@Schema({
  collection: 'schedule_exceptions',
  timestamps: true,
  autoIndex: true,
})
export class ScheduleException extends Document {
  /**
   * Unique exception identifier (UUID)
   */
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  /**
   * Tenant identifier for multi-tenant isolation
   */
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  /**
   * Organization identifier
   */
  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  /**
   * Provider identifier this exception belongs to
   */
  @Prop({ type: String, required: true, index: true })
  providerId!: string;

  /**
   * Clinic identifier this exception applies to
   * If null, applies to all clinics where provider works
   */
  @Prop({ type: String, required: false, index: true })
  clinicId?: string;

  /**
   * The specific date this exception applies to (stored as start of day UTC)
   */
  @Prop({ type: Date, required: true, index: true })
  date!: Date;

  /**
   * Type of exception
   */
  @Prop({ type: String, required: true, enum: Object.values(ExceptionType), index: true })
  type!: ExceptionType;

  /**
   * Working hours for this day (if type = override)
   * null or empty array means provider is unavailable all day
   * Array of time slots means only those hours are available
   */
  @Prop({ type: Array, required: false })
  hours?: ExceptionTimeSlot[];

  /**
   * Reason or description for the exception
   */
  @Prop({ type: String, required: false })
  reason?: string;

  /**
   * User who created this exception
   */
  @Prop({ type: String, required: false })
  createdBy?: string;

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const ScheduleExceptionSchema = SchemaFactory.createForClass(ScheduleException);

/**
 * Compound indexes for performance optimization
 * Support common query patterns:
 * 1. Find exceptions for a provider on a specific date
 * 2. Find exceptions for a provider in a date range
 * 3. Find all exceptions for a clinic on a date
 */
ScheduleExceptionSchema.index(
  { tenantId: 1, providerId: 1, date: 1, clinicId: 1 },
  { unique: true },
);
ScheduleExceptionSchema.index({ tenantId: 1, providerId: 1, date: 1 });
ScheduleExceptionSchema.index({ tenantId: 1, clinicId: 1, date: 1 });
ScheduleExceptionSchema.index({ tenantId: 1, organizationId: 1, date: 1 });
ScheduleExceptionSchema.index({ tenantId: 1, type: 1, date: 1 });

/**
 * Validation: ensure date is a valid date (no time component)
 */
ScheduleExceptionSchema.pre('save', function (next) {
  // Normalize date to start of day UTC
  if (this.date) {
    const normalized = new Date(this.date);
    normalized.setUTCHours(0, 0, 0, 0);
    this.date = normalized;
  }

  // Validate hours if provided
  if (this.hours && this.hours.length > 0) {
    for (const slot of this.hours) {
      if (slot.end <= slot.start) {
        next(new Error('Exception hour slot end time must be after start time'));
        return;
      }
    }
  }

  next();
});
