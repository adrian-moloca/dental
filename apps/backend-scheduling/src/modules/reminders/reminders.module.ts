import { Module } from '@nestjs/common';

import { ReminderService } from './services';
import { ReminderController } from './controllers';

/**
 * Reminders Module
 *
 * Handles appointment reminder scheduling and sending through multiple channels.
 *
 * @remarks
 * This is a stub implementation that demonstrates the API contract.
 * For production use, integrate with actual notification providers:
 *
 * SMS Providers (Romanian market):
 * - Netopia SMS (local Romanian provider)
 * - Twilio (international)
 * - MessageBird
 *
 * Email Providers:
 * - SendGrid
 * - AWS SES
 * - SMTP relay
 *
 * Push Notifications:
 * - Firebase Cloud Messaging (FCM)
 *
 * WhatsApp:
 * - WhatsApp Business API
 *
 * @example
 * Integration steps:
 * 1. Add @nestjs/schedule for cron-based reminder processing
 * 2. Configure notification provider credentials in environment
 * 3. Implement provider-specific adapters in services/
 * 4. Replace stub methods in ReminderService with actual calls
 * 5. Set up Bull queue for reliable background processing
 */
@Module({
  imports: [],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class RemindersModule {}
