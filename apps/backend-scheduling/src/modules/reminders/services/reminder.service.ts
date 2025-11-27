import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ReminderChannel, ReminderConfigDto, SendReminderDto } from '../dto';

export interface ReminderResult {
  success: boolean;
  appointmentId: string;
  channel: ReminderChannel;
  sentAt?: Date;
  error?: string;
}

export interface PendingReminder {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  appointmentTime: Date;
  appointmentType: string;
  providerName: string;
  clinicName: string;
  clinicId: string;
  reminderDueAt: Date;
  channels: ReminderChannel[];
}

export interface ReminderStats {
  totalScheduled: number;
  sentToday: number;
  failedToday: number;
  pendingNext24h: number;
}

/**
 * Appointment Reminder Service
 *
 * Handles scheduling and sending of appointment reminders through multiple channels.
 * This is a stub implementation that demonstrates the API contract and event-driven
 * architecture for integration with external notification services.
 *
 * Integration Points (to be implemented):
 * - SMS: Twilio, MessageBird, or local Romanian providers (Netopia SMS)
 * - Email: SendGrid, SES, or internal SMTP
 * - WhatsApp: WhatsApp Business API
 * - Push: Firebase Cloud Messaging for mobile apps
 *
 * Romanian Market Considerations:
 * - Support for Romanian phone number format (+40...)
 * - Romanian language message templates
 * - Compliance with GDPR consent requirements
 * - Quiet hours respecting Romanian timezone (Europe/Bucharest)
 */
@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  // In-memory configuration cache (should be fetched from enterprise-service in production)
  private clinicConfigs: Map<string, ReminderConfigDto> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.logger.log('ReminderService initialized (stub implementation)');
  }

  /**
   * Configure reminders for a clinic
   *
   * @param clinicId - Clinic ID
   * @param config - Reminder configuration
   */
  async configureReminders(
    clinicId: string,
    config: ReminderConfigDto,
  ): Promise<ReminderConfigDto> {
    this.logger.log(`Configuring reminders for clinic ${clinicId}`);

    // Store configuration (in production, persist to database)
    this.clinicConfigs.set(clinicId, {
      enabled: config.enabled ?? true,
      channels: config.channels ?? [ReminderChannel.SMS, ReminderChannel.EMAIL],
      primaryReminderHours: config.primaryReminderHours ?? 24,
      secondaryReminderHours: config.secondaryReminderHours ?? 2,
      includeCancellationLink: config.includeCancellationLink ?? true,
      includeConfirmationLink: config.includeConfirmationLink ?? true,
      quietHoursStart: config.quietHoursStart ?? '21:00',
      quietHoursEnd: config.quietHoursEnd ?? '08:00',
      messageTemplate: config.messageTemplate,
    });

    this.eventEmitter.emit('reminder.config.updated', {
      clinicId,
      config: this.clinicConfigs.get(clinicId),
    });

    return this.clinicConfigs.get(clinicId)!;
  }

  /**
   * Get reminder configuration for a clinic
   *
   * @param clinicId - Clinic ID
   */
  async getConfig(clinicId: string): Promise<ReminderConfigDto | null> {
    return this.clinicConfigs.get(clinicId) ?? null;
  }

  /**
   * Schedule a reminder for an appointment
   *
   * @param appointmentId - Appointment ID
   * @param appointmentTime - Scheduled appointment time
   * @param clinicId - Clinic ID
   */
  async scheduleReminder(
    appointmentId: string,
    appointmentTime: Date,
    clinicId: string,
  ): Promise<{ scheduled: boolean; reminderTimes: Date[] }> {
    const config = this.clinicConfigs.get(clinicId);

    if (!config?.enabled) {
      this.logger.debug(`Reminders disabled for clinic ${clinicId}`);
      return { scheduled: false, reminderTimes: [] };
    }

    const reminderTimes: Date[] = [];

    // Calculate primary reminder time
    if (config.primaryReminderHours) {
      const primaryTime = new Date(appointmentTime);
      primaryTime.setHours(primaryTime.getHours() - config.primaryReminderHours);
      reminderTimes.push(primaryTime);
    }

    // Calculate secondary reminder time
    if (config.secondaryReminderHours) {
      const secondaryTime = new Date(appointmentTime);
      secondaryTime.setHours(secondaryTime.getHours() - config.secondaryReminderHours);
      reminderTimes.push(secondaryTime);
    }

    this.logger.log(`Scheduled ${reminderTimes.length} reminders for appointment ${appointmentId}`);

    // In production, persist to a scheduled jobs table or use Bull queue
    this.eventEmitter.emit('reminder.scheduled', {
      appointmentId,
      clinicId,
      reminderTimes,
    });

    return { scheduled: true, reminderTimes };
  }

  /**
   * Send a reminder immediately
   *
   * @param dto - Send reminder parameters
   */
  async sendReminder(dto: SendReminderDto): Promise<ReminderResult[]> {
    this.logger.log(`Sending reminder for appointment ${dto.appointmentId}`);

    const channels = dto.channels ?? [ReminderChannel.SMS, ReminderChannel.EMAIL];
    const results: ReminderResult[] = [];

    for (const channel of channels) {
      try {
        // Stub: In production, call the appropriate notification service
        const result = await this.sendViaChannel(dto.appointmentId, channel, dto.customMessage);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          appointmentId: dto.appointmentId,
          channel,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Emit event for audit/analytics
    this.eventEmitter.emit('reminder.sent', {
      appointmentId: dto.appointmentId,
      results,
      sentAt: new Date(),
    });

    return results;
  }

  /**
   * Cancel scheduled reminders for an appointment
   *
   * @param appointmentId - Appointment ID
   */
  async cancelReminders(appointmentId: string): Promise<void> {
    this.logger.log(`Cancelling reminders for appointment ${appointmentId}`);

    // In production, remove from scheduled jobs queue
    this.eventEmitter.emit('reminder.cancelled', {
      appointmentId,
      cancelledAt: new Date(),
    });
  }

  /**
   * Get pending reminders for the next N hours
   *
   * @param hours - Number of hours to look ahead
   * @param clinicId - Optional clinic filter
   */
  async getPendingReminders(hours: number = 24, _clinicId?: string): Promise<PendingReminder[]> {
    this.logger.debug(`Getting pending reminders for next ${hours} hours`);

    // Stub: In production, query the scheduled jobs table
    return [];
  }

  /**
   * Get reminder statistics
   *
   * @param clinicId - Clinic ID
   */
  async getStatistics(clinicId: string): Promise<ReminderStats> {
    this.logger.debug(`Getting reminder stats for clinic ${clinicId}`);

    // Stub: In production, aggregate from reminder logs
    return {
      totalScheduled: 0,
      sentToday: 0,
      failedToday: 0,
      pendingNext24h: 0,
    };
  }

  /**
   * Process scheduled reminders
   *
   * @remarks
   * In production, this should be called by a cron job (e.g., @nestjs/schedule)
   * every 5 minutes to send reminders that are due.
   *
   * Integration: Use @Cron(CronExpression.EVERY_5_MINUTES) with @nestjs/schedule
   */
  async processScheduledReminders(): Promise<void> {
    this.logger.debug('Processing scheduled reminders...');

    // Stub: In production, query for reminders due now and send them
    // This would:
    // 1. Query scheduled reminders where reminderDueAt <= now
    // 2. Check quiet hours for each clinic
    // 3. Send via configured channels
    // 4. Update reminder status
    // 5. Emit events for audit

    const pendingReminders = await this.getPendingReminders(0.1); // Due in next 6 minutes

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminder({
          appointmentId: reminder.appointmentId,
          channels: reminder.channels,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send reminder for appointment ${reminder.appointmentId}`,
          error,
        );
      }
    }
  }

  /**
   * Send reminder via specific channel
   *
   * @param appointmentId - Appointment ID
   * @param channel - Notification channel
   * @param customMessage - Optional custom message
   */
  private async sendViaChannel(
    appointmentId: string,
    channel: ReminderChannel,
    customMessage?: string,
  ): Promise<ReminderResult> {
    // Stub implementation - would integrate with actual notification services

    this.logger.log(`[STUB] Sending ${channel} reminder for appointment ${appointmentId}`);

    switch (channel) {
      case ReminderChannel.SMS:
        // Integration: Twilio, MessageBird, Netopia SMS
        return this.stubSendSms(appointmentId, customMessage);

      case ReminderChannel.EMAIL:
        // Integration: SendGrid, SES, SMTP
        return this.stubSendEmail(appointmentId, customMessage);

      case ReminderChannel.WHATSAPP:
        // Integration: WhatsApp Business API
        return this.stubSendWhatsApp(appointmentId, customMessage);

      case ReminderChannel.PUSH:
        // Integration: Firebase Cloud Messaging
        return this.stubSendPush(appointmentId, customMessage);

      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  // ==================== Stub Methods (Replace with actual integrations) ====================

  private async stubSendSms(appointmentId: string, _message?: string): Promise<ReminderResult> {
    // TODO: Integrate with SMS provider
    // For Romanian market: Netopia SMS, Twilio, MessageBird
    this.logger.debug(`[STUB] SMS would be sent for ${appointmentId}`);

    return {
      success: true,
      appointmentId,
      channel: ReminderChannel.SMS,
      sentAt: new Date(),
    };
  }

  private async stubSendEmail(appointmentId: string, _message?: string): Promise<ReminderResult> {
    // TODO: Integrate with email provider
    // Options: SendGrid, AWS SES, SMTP
    this.logger.debug(`[STUB] Email would be sent for ${appointmentId}`);

    return {
      success: true,
      appointmentId,
      channel: ReminderChannel.EMAIL,
      sentAt: new Date(),
    };
  }

  private async stubSendWhatsApp(
    appointmentId: string,
    _message?: string,
  ): Promise<ReminderResult> {
    // TODO: Integrate with WhatsApp Business API
    this.logger.debug(`[STUB] WhatsApp would be sent for ${appointmentId}`);

    return {
      success: true,
      appointmentId,
      channel: ReminderChannel.WHATSAPP,
      sentAt: new Date(),
    };
  }

  private async stubSendPush(appointmentId: string, _message?: string): Promise<ReminderResult> {
    // TODO: Integrate with FCM for mobile push notifications
    this.logger.debug(`[STUB] Push notification would be sent for ${appointmentId}`);

    return {
      success: true,
      appointmentId,
      channel: ReminderChannel.PUSH,
      sentAt: new Date(),
    };
  }

  // ==================== Message Templates ====================

  /**
   * Get default Romanian message template
   */
  getDefaultRomanianTemplate(): string {
    return (
      `Bună ziua! Vă reamintim că aveți programare la {{clinicName}} pe data de {{date}} la ora {{time}}. ` +
      `Pentru confirmare sau reprogramare, vă rugăm să ne contactați la {{phone}} sau accesați {{link}}.`
    );
  }

  /**
   * Get default English message template
   */
  getDefaultEnglishTemplate(): string {
    return (
      `Hello! This is a reminder for your appointment at {{clinicName}} on {{date}} at {{time}}. ` +
      `To confirm or reschedule, please contact us at {{phone}} or visit {{link}}.`
    );
  }
}
