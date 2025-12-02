import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Notification status tracking
 */
export type NotificationStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'read';

/**
 * Message channel type
 */
export type MessageChannel = 'sms' | 'whatsapp' | 'email' | 'push';

/**
 * Notification type/category
 */
export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancellation'
  | 'appointment_rescheduled'
  | 'treatment_plan_ready'
  | 'invoice_issued'
  | 'payment_received'
  | 'payment_reminder'
  | 'birthday_greeting'
  | 'recall_reminder'
  | 'custom_message'
  | 'marketing_campaign'
  | 'feedback_request';

export type PatientNotificationDocument = HydratedDocument<PatientNotification>;

/**
 * Patient Notification Schema
 *
 * Comprehensive notification tracking system for all patient communications.
 * Extends beyond appointment reminders to support manual notifications,
 * bulk campaigns, and complete notification history.
 *
 * Features:
 * - Multi-channel support (SMS, WhatsApp, Email, Push)
 * - Complete delivery tracking
 * - Related entity linking (appointments, invoices, treatment plans)
 * - Cost tracking
 * - Read receipts (WhatsApp)
 * - GDPR compliant audit trail
 */
@Schema({
  collection: 'patient_notifications',
  timestamps: true,
  autoIndex: true,
})
export class PatientNotification extends Document {
  /**
   * Unique notification identifier (UUID)
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
  @Prop({ type: String, required: false, index: true })
  clinicId?: string;

  // ==================== Recipient Information ====================

  /**
   * Patient identifier
   */
  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  /**
   * Patient name (denormalized for quick display)
   */
  @Prop({ type: String, required: true })
  patientName!: string;

  /**
   * Recipient contact (phone or email)
   * For SMS/WhatsApp: E.164 format (e.g., +40721234567)
   * For Email: valid email address
   */
  @Prop({ type: String, required: true })
  recipientContact!: string;

  // ==================== Channel & Content ====================

  /**
   * Communication channel
   */
  @Prop({
    type: String,
    required: true,
    enum: ['sms', 'whatsapp', 'email', 'push'],
    index: true,
  })
  channel!: MessageChannel;

  /**
   * Template identifier (if notification was sent from template)
   */
  @Prop({ type: String, required: false })
  templateId?: string;

  /**
   * Email subject line (for email channel only)
   */
  @Prop({ type: String, required: false })
  subject?: string;

  /**
   * Actual message content sent (after variable substitution)
   */
  @Prop({ type: String, required: true })
  content!: string;

  // ==================== Type & Category ====================

  /**
   * Notification type/category
   */
  @Prop({
    type: String,
    required: true,
    enum: [
      'appointment_reminder',
      'appointment_confirmation',
      'appointment_cancellation',
      'appointment_rescheduled',
      'treatment_plan_ready',
      'invoice_issued',
      'payment_received',
      'payment_reminder',
      'birthday_greeting',
      'recall_reminder',
      'custom_message',
      'marketing_campaign',
      'feedback_request',
    ],
    index: true,
  })
  type!: NotificationType;

  // ==================== Related Entities ====================

  /**
   * Related appointment ID (if applicable)
   */
  @Prop({ type: String, required: false, index: true })
  appointmentId?: string;

  /**
   * Related invoice ID (if applicable)
   */
  @Prop({ type: String, required: false, index: true })
  invoiceId?: string;

  /**
   * Related treatment plan ID (if applicable)
   */
  @Prop({ type: String, required: false, index: true })
  treatmentPlanId?: string;

  /**
   * Campaign ID (for marketing campaigns)
   */
  @Prop({ type: String, required: false, index: true })
  campaignId?: string;

  // ==================== Status Tracking ====================

  /**
   * Current notification status
   */
  @Prop({
    type: String,
    required: true,
    enum: ['queued', 'sending', 'sent', 'delivered', 'failed', 'read'],
    default: 'queued',
    index: true,
  })
  status!: NotificationStatus;

  // ==================== Delivery Tracking ====================

  /**
   * When the notification was queued for sending
   */
  @Prop({ type: Date, required: true, index: true })
  queuedAt!: Date;

  /**
   * When the notification was actually sent
   */
  @Prop({ type: Date, required: false })
  sentAt?: Date;

  /**
   * When the notification was delivered (from provider webhook)
   */
  @Prop({ type: Date, required: false })
  deliveredAt?: Date;

  /**
   * When the notification was read (WhatsApp only)
   */
  @Prop({ type: Date, required: false })
  readAt?: Date;

  // ==================== Provider Response ====================

  /**
   * External provider message ID (Twilio SID, SendGrid ID, etc.)
   */
  @Prop({ type: String, required: false })
  externalId?: string;

  /**
   * Provider name (twilio, sendgrid, fcm, etc.)
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

  // ==================== Cost Tracking ====================

  /**
   * Cost of sending this notification (in minor units - cents/bani)
   */
  @Prop({ type: Number, required: false })
  cost?: number;

  /**
   * Currency for cost (e.g., RON, USD, EUR)
   */
  @Prop({ type: String, required: false, default: 'RON' })
  currency?: string;

  // ==================== Audit Trail ====================

  /**
   * User who triggered the notification
   */
  @Prop({ type: String, required: true })
  sentBy!: string;

  /**
   * User name who triggered the notification (denormalized)
   */
  @Prop({ type: String, required: true })
  sentByName!: string;

  /**
   * Additional metadata (flexible for future extensions)
   */
  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const PatientNotificationSchema = SchemaFactory.createForClass(PatientNotification);

/**
 * Compound indexes for performance optimization
 */

// Find notifications for a patient (most common query)
PatientNotificationSchema.index({ tenantId: 1, patientId: 1, queuedAt: -1 });

// Find notifications by status (for processing queue)
PatientNotificationSchema.index({ tenantId: 1, status: 1, queuedAt: 1 });

// Find notifications by type
PatientNotificationSchema.index({ tenantId: 1, type: 1, queuedAt: -1 });

// Find notifications by channel
PatientNotificationSchema.index({ tenantId: 1, channel: 1, queuedAt: -1 });

// Find notifications related to appointments
PatientNotificationSchema.index({ tenantId: 1, appointmentId: 1 });

// Find notifications related to invoices
PatientNotificationSchema.index({ tenantId: 1, invoiceId: 1 });

// Find notifications by campaign
PatientNotificationSchema.index({ tenantId: 1, campaignId: 1 });

// Find notifications by external ID (for webhook lookups)
PatientNotificationSchema.index({ externalId: 1 }, { sparse: true });

// Analytics: Notifications by clinic and date range
PatientNotificationSchema.index({
  tenantId: 1,
  clinicId: 1,
  status: 1,
  queuedAt: -1,
});

// Rate limiting: Count recent notifications per patient
PatientNotificationSchema.index({
  tenantId: 1,
  patientId: 1,
  channel: 1,
  queuedAt: -1,
});
