import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Appointment status enumeration
 * Flow: SCHEDULED -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> COMPLETED
 *       or any state -> CANCELLED or NO_SHOW
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/**
 * Booking metadata interface
 * Tracks the full lifecycle of an appointment
 */
export interface BookingMetadata {
  // Booking
  bookedBy?: string;
  bookedAt?: Date;
  bookingSource?: 'online' | 'phone' | 'walk_in' | 'referral';
  notes?: string;
  emergencyVisit?: boolean;

  // Confirmation
  confirmedBy?: string;
  confirmedAt?: Date;
  confirmationMethod?: 'sms' | 'email' | 'phone' | 'patient_portal';
  confirmationSentAt?: Date;
  reminderSentAt?: Date;

  // Check-in
  checkedInBy?: string;
  checkedInAt?: Date;

  // In Progress
  startedBy?: string;
  startedAt?: Date;

  // Completion
  completedBy?: string;
  completedAt?: Date;
  completionNotes?: string;

  // Rescheduling
  rescheduledFrom?: string;
  rescheduledTo?: string;

  // Cancellation
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;

  // No-show
  noShowReason?: string;
}

export type AppointmentDocument = HydratedDocument<Appointment>;

/**
 * Appointment MongoDB Schema
 *
 * Represents a scheduled appointment in the dental practice.
 * Enforces multi-tenant isolation and includes comprehensive metadata
 * for booking, tracking, and analytics.
 */
@Schema({
  collection: 'appointments',
  timestamps: true,
  autoIndex: true,
})
export class Appointment extends Document {
  /**
   * Unique appointment identifier (UUID)
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
   * Location/clinic identifier where appointment takes place
   */
  @Prop({ type: String, required: true, index: true })
  locationId!: string;

  /**
   * Patient identifier
   */
  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  /**
   * Provider (dentist/hygienist) identifier
   */
  @Prop({ type: String, required: true, index: true })
  providerId!: string;

  /**
   * Optional chair/room identifier
   */
  @Prop({ type: String, required: false, index: true })
  chairId?: string;

  /**
   * Service/procedure code
   */
  @Prop({ type: String, required: true })
  serviceCode!: string;

  /**
   * Appointment start time
   */
  @Prop({ type: Date, required: true, index: true })
  start!: Date;

  /**
   * Appointment end time
   */
  @Prop({ type: Date, required: true })
  end!: Date;

  /**
   * Appointment status
   */
  @Prop({ type: String, required: true, enum: Object.values(AppointmentStatus), index: true })
  status!: AppointmentStatus;

  /**
   * Risk score for appointment (0-100)
   * Higher scores indicate higher no-show risk
   */
  @Prop({ type: Number, required: false, default: 0 })
  riskScore?: number;

  /**
   * Booking metadata and audit trail
   */
  @Prop({ type: Object, required: false })
  bookingMetadata?: BookingMetadata;

  /**
   * Linked clinical procedure IDs
   * Tracks which procedures were completed during this appointment
   */
  @Prop({ type: [String], default: [] })
  clinicalProcedureIds?: string[];

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

/**
 * Compound indexes for performance optimization
 * These indexes support the most common query patterns:
 * 1. Provider schedule queries
 * 2. Patient appointment history
 * 3. Availability searches
 * 4. Status-based filtering
 */
AppointmentSchema.index({ tenantId: 1, providerId: 1, start: 1 });
AppointmentSchema.index({ tenantId: 1, patientId: 1, start: -1 });
AppointmentSchema.index({ tenantId: 1, locationId: 1, start: 1 });
AppointmentSchema.index({ tenantId: 1, status: 1, start: 1 });
AppointmentSchema.index({ tenantId: 1, organizationId: 1, start: 1 });

/**
 * Ensure start is before end
 */
AppointmentSchema.pre('save', function (next) {
  if (this.start >= this.end) {
    next(new Error('Appointment start time must be before end time'));
  }
  next();
});
