import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Reminder job status
 */
export type ReminderJobStatus =
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled'
  | 'skipped';

/**
 * Message channel type
 */
export type MessageChannel = 'sms' | 'whatsapp' | 'email' | 'push';

/**
 * Patient response action
 */
export type PatientResponseAction = 'confirmed' | 'cancelled' | 'other';

/**
 * Patient response data
 */
export interface PatientResponse {
  /** Response text from patient */
  responseText: string;
  /** When the response was received */
  responseAt: Date;
  /** Parsed action from response */
  action: PatientResponseAction;
}

export type ReminderJobDocument = HydratedDocument<ReminderJob>;

/**
 * Reminder Job Schema
 *
 * Represents a scheduled reminder to be sent for an appointment.
 * Tracks the full lifecycle from scheduling to delivery and patient response.
 */
@Schema({
  collection: 'reminder_jobs',
  timestamps: true,
  autoIndex: true,
})
export class ReminderJob extends Document {
  /**
   * Unique job identifier (UUID)
   */
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  /**
   * Tenant identifier for multi-tenant isolation
   */
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  /**
   * Clinic identifier
   */
  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  /**
   * Appointment identifier
   */
  @Prop({ type: String, required: true, index: true })
  appointmentId!: string;

  /**
   * Patient identifier
   */
  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  /**
   * Communication channel
   */
  @Prop({ type: String, required: true, enum: ['sms', 'whatsapp', 'email', 'push'] })
  channel!: MessageChannel;

  /**
   * Template identifier
   */
  @Prop({ type: String, required: true })
  templateId!: string;

  /**
   * Recipient phone number (for SMS/WhatsApp)
   */
  @Prop({ type: String, required: false })
  recipientPhone?: string;

  /**
   * Recipient email (for email)
   */
  @Prop({ type: String, required: false })
  recipientEmail?: string;

  /**
   * When the reminder should be sent
   */
  @Prop({ type: Date, required: true, index: true })
  scheduledAt!: Date;

  /**
   * Current status of the reminder job
   */
  @Prop({
    type: String,
    required: true,
    enum: ['scheduled', 'sending', 'sent', 'failed', 'cancelled', 'skipped'],
    default: 'scheduled',
    index: true,
  })
  status!: ReminderJobStatus;

  /**
   * Rendered message content (after variable substitution)
   */
  @Prop({ type: String, required: false })
  messageContent?: string;

  /**
   * When the reminder was actually sent
   */
  @Prop({ type: Date, required: false })
  sentAt?: Date;

  /**
   * When the message was delivered (from provider webhook)
   */
  @Prop({ type: Date, required: false })
  deliveredAt?: Date;

  /**
   * When the message was read (WhatsApp only)
   */
  @Prop({ type: Date, required: false })
  readAt?: Date;

  /**
   * External provider message ID (Twilio SID, etc.)
   */
  @Prop({ type: String, required: false })
  externalId?: string;

  /**
   * Provider name (twilio, sendgrid, etc.)
   */
  @Prop({ type: String, required: false })
  provider?: string;

  /**
   * Error code if sending failed
   */
  @Prop({ type: String, required: false })
  errorCode?: string;

  /**
   * Error message if sending failed
   */
  @Prop({ type: String, required: false })
  errorMessage?: string;

  /**
   * Number of retry attempts
   */
  @Prop({ type: Number, required: true, default: 0 })
  retryCount!: number;

  /**
   * Maximum retry attempts allowed
   */
  @Prop({ type: Number, required: true, default: 3 })
  maxRetries!: number;

  /**
   * Next retry time (if failed and retries remaining)
   */
  @Prop({ type: Date, required: false })
  nextRetryAt?: Date;

  /**
   * Patient response (if patient replied)
   */
  @Prop({ type: Object, required: false })
  patientResponse?: PatientResponse;

  /**
   * Cost of sending this message (in cents/bani)
   */
  @Prop({ type: Number, required: false })
  cost?: number;

  /**
   * Currency for cost (e.g., RON, USD)
   */
  @Prop({ type: String, required: false, default: 'RON' })
  currency?: string;

  /**
   * Additional metadata
   */
  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const ReminderJobSchema = SchemaFactory.createForClass(ReminderJob);

/**
 * Compound indexes for performance optimization
 * 1. Find jobs to process (scheduled jobs that are due)
 * 2. Find jobs by appointment (for cancellation)
 * 3. Find jobs by patient (for rate limiting)
 * 4. Analytics queries
 */
ReminderJobSchema.index({ tenantId: 1, status: 1, scheduledAt: 1 });
ReminderJobSchema.index({ tenantId: 1, appointmentId: 1 });
ReminderJobSchema.index({ tenantId: 1, patientId: 1, scheduledAt: -1 });
ReminderJobSchema.index({ tenantId: 1, clinicId: 1, status: 1, scheduledAt: -1 });
ReminderJobSchema.index({ externalId: 1 }, { sparse: true });
