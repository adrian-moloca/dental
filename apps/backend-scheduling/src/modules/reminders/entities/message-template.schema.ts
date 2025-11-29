import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Message channel type
 */
export type MessageChannel = 'sms' | 'whatsapp' | 'email' | 'push';

/**
 * Supported languages
 */
export type Language = 'ro' | 'en';

export type MessageTemplateDocument = HydratedDocument<MessageTemplate>;

/**
 * Message Template Schema
 *
 * Stores message templates for appointment reminders.
 * Supports variable substitution for personalization.
 */
@Schema({
  collection: 'message_templates',
  timestamps: true,
  autoIndex: true,
})
export class MessageTemplate extends Document {
  /**
   * Unique template identifier (UUID)
   */
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  /**
   * Tenant identifier for multi-tenant isolation
   */
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  /**
   * Template name (e.g., "24 Hour Reminder - Romanian SMS")
   */
  @Prop({ type: String, required: true })
  name!: string;

  /**
   * Channel this template is for
   */
  @Prop({ type: String, required: true, enum: ['sms', 'whatsapp', 'email', 'push'], index: true })
  channel!: MessageChannel;

  /**
   * Language code
   */
  @Prop({ type: String, required: true, enum: ['ro', 'en'], default: 'ro' })
  language!: Language;

  /**
   * Subject line (for email only)
   */
  @Prop({ type: String, required: false })
  subject?: string;

  /**
   * Template content with variable placeholders
   * Variables: {{patientName}}, {{clinicName}}, {{appointmentDate}},
   * {{appointmentTime}}, {{providerName}}, {{appointmentType}}, {{clinicPhone}}
   */
  @Prop({ type: String, required: true })
  content!: string;

  /**
   * Available variables for substitution
   */
  @Prop({ type: [String], required: true, default: [] })
  variables!: string[];

  /**
   * WhatsApp template ID (for pre-approved templates)
   * Required for WhatsApp Business API
   */
  @Prop({ type: String, required: false })
  whatsappTemplateId?: string;

  /**
   * Whether this template is active
   */
  @Prop({ type: Boolean, required: true, default: true })
  isActive!: boolean;

  /**
   * Whether this is a system template (cannot be deleted)
   */
  @Prop({ type: Boolean, required: true, default: false })
  isSystem!: boolean;

  /**
   * Template type/purpose
   */
  @Prop({
    type: String,
    required: false,
    enum: ['reminder', 'confirmation', 'cancellation', 'rescheduling'],
  })
  type?: string;

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageTemplateSchema = SchemaFactory.createForClass(MessageTemplate);

/**
 * Compound indexes for performance
 */
MessageTemplateSchema.index({ tenantId: 1, channel: 1, language: 1 });
MessageTemplateSchema.index({ tenantId: 1, isActive: 1 });
