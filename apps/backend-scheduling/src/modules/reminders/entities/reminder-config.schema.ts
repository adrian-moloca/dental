import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Reminder timing rule
 * Defines when to send a reminder relative to the appointment time
 */
export interface ReminderRule {
  /** Unique identifier for this rule */
  id: string;
  /** Display name (e.g., "24 Hours Before") */
  name: string;
  /** Offset in minutes (negative = before appointment, e.g., -1440 = 24 hours before) */
  offsetMinutes: number;
  /** Channels to use for this reminder */
  channels: ('sms' | 'whatsapp' | 'email' | 'push')[];
  /** Template ID to use */
  templateId: string;
  /** Whether this rule is active */
  isActive: boolean;
}

/**
 * Quiet hours configuration
 * Prevents reminders from being sent during specified hours
 */
export interface QuietHours {
  /** Whether quiet hours are enabled */
  enabled: boolean;
  /** Start time in HH:mm format (e.g., "21:00") */
  startTime: string;
  /** End time in HH:mm format (e.g., "08:00") */
  endTime: string;
  /** IANA timezone (e.g., "Europe/Bucharest") */
  timezone: string;
}

export type ReminderConfigDocument = HydratedDocument<ReminderConfig>;

/**
 * Reminder Configuration Schema
 *
 * Stores clinic-level configuration for appointment reminders.
 * Defines which channels are enabled, reminder timing rules,
 * quiet hours, and consent handling.
 */
@Schema({
  collection: 'reminder_configs',
  timestamps: true,
  autoIndex: true,
})
export class ReminderConfig extends Document {
  /**
   * Unique configuration identifier (UUID)
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
   * SMS reminders enabled
   */
  @Prop({ type: Boolean, required: true, default: false })
  smsEnabled!: boolean;

  /**
   * WhatsApp reminders enabled
   */
  @Prop({ type: Boolean, required: true, default: false })
  whatsappEnabled!: boolean;

  /**
   * Email reminders enabled
   */
  @Prop({ type: Boolean, required: true, default: true })
  emailEnabled!: boolean;

  /**
   * Push notification reminders enabled
   */
  @Prop({ type: Boolean, required: true, default: false })
  pushEnabled!: boolean;

  /**
   * Reminder timing rules
   * Array of rules defining when to send reminders
   */
  @Prop({ type: [Object], required: true, default: [] })
  reminders!: ReminderRule[];

  /**
   * Quiet hours configuration
   * Prevents sending reminders during specified hours
   */
  @Prop({ type: Object, required: true })
  quietHours!: QuietHours;

  /**
   * Respect patient opt-out preferences
   */
  @Prop({ type: Boolean, required: true, default: true })
  respectOptOut!: boolean;

  /**
   * Allow patients to confirm via reply
   */
  @Prop({ type: Boolean, required: true, default: true })
  allowConfirmationReply!: boolean;

  /**
   * Keywords that indicate confirmation
   * Case-insensitive matching (e.g., ["DA", "YES", "CONFIRM", "OK"])
   */
  @Prop({ type: [String], required: true, default: ['DA', 'YES', 'CONFIRM', 'OK'] })
  confirmationKeywords!: string[];

  /**
   * Keywords that indicate cancellation
   * Case-insensitive matching (e.g., ["NU", "NO", "CANCEL", "ANULARE"])
   */
  @Prop({ type: [String], required: true, default: ['NU', 'NO', 'CANCEL', 'ANULARE'] })
  cancellationKeywords!: string[];

  /**
   * Maximum reminders per appointment
   * Prevents excessive messaging
   */
  @Prop({ type: Number, required: true, default: 3 })
  maxRemindersPerAppointment!: number;

  /**
   * Rate limit: max reminders per patient per day
   */
  @Prop({ type: Number, required: true, default: 5 })
  maxRemindersPerPatientPerDay!: number;

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const ReminderConfigSchema = SchemaFactory.createForClass(ReminderConfig);

/**
 * Compound indexes for performance
 */
ReminderConfigSchema.index({ tenantId: 1, clinicId: 1 }, { unique: true });
