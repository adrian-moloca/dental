import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ReminderService } from './services';
import {
  ReminderController,
  ReminderConfigController,
  WebhookController,
  NotificationController,
} from './controllers';

// Import services
import {
  SmsService,
  WhatsAppService,
  TemplateRendererService,
  ReminderSchedulerService,
  PatientResponseHandlerService,
  NotificationService,
  NotificationEventHandlerService,
} from './services';

// Import schemas
import { ReminderConfig, ReminderConfigSchema } from './entities/reminder-config.schema';
import { MessageTemplate, MessageTemplateSchema } from './entities/message-template.schema';
import { ReminderJob, ReminderJobSchema } from './entities/reminder-job.schema';
import {
  PatientNotification,
  PatientNotificationSchema,
} from './entities/patient-notification.schema';
import { Appointment, AppointmentSchema } from '../appointments/entities/appointment.schema';

/**
 * Reminders & Notifications Module
 *
 * Comprehensive communication system with appointment reminders and patient notifications.
 *
 * Features:
 * - Multi-channel notifications (SMS, WhatsApp, Email, Push)
 * - Automated appointment reminders
 * - Manual patient notifications (single & bulk)
 * - Template management with variable substitution
 * - Scheduled job processing with cron
 * - Patient response handling (confirm/cancel via SMS/WhatsApp)
 * - Quiet hours enforcement
 * - Rate limiting per patient
 * - GDPR consent checking
 * - Delivery tracking and read receipts (WhatsApp)
 * - Romanian and English templates
 * - Complete notification history
 * - Webhook handlers for delivery status
 *
 * External Integrations:
 * - Twilio (SMS & WhatsApp Business API)
 * - SendGrid (Email - to be implemented)
 * - Firebase Cloud Messaging (Push - to be implemented)
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReminderConfig.name, schema: ReminderConfigSchema },
      { name: MessageTemplate.name, schema: MessageTemplateSchema },
      { name: ReminderJob.name, schema: ReminderJobSchema },
      { name: PatientNotification.name, schema: PatientNotificationSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    ScheduleModule.forRoot(),
    ConfigModule,
    EventEmitterModule,
  ],
  controllers: [
    ReminderController,
    ReminderConfigController,
    WebhookController,
    NotificationController,
  ],
  providers: [
    ReminderService,
    SmsService,
    WhatsAppService,
    TemplateRendererService,
    ReminderSchedulerService,
    PatientResponseHandlerService,
    NotificationService,
    NotificationEventHandlerService,
  ],
  exports: [
    ReminderService,
    SmsService,
    WhatsAppService,
    TemplateRendererService,
    ReminderSchedulerService,
    NotificationService,
    NotificationEventHandlerService,
  ],
})
export class RemindersModule {}
