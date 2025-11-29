import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';

import {
  ReminderJob,
  ReminderJobDocument,
  ReminderJobStatus,
} from '../entities/reminder-job.schema';
import {
  ReminderConfig,
  ReminderConfigDocument,
  ReminderRule,
} from '../entities/reminder-config.schema';
import { MessageTemplate, MessageTemplateDocument } from '../entities/message-template.schema';
import { Appointment, AppointmentDocument } from '../../appointments/entities/appointment.schema';

import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';
import { TemplateRendererService, TemplateVariables } from './template-renderer.service';

/**
 * Reminder Scheduler Service
 *
 * Orchestrates the reminder system:
 * - Listens to appointment events to create reminder jobs
 * - Runs cron job to process scheduled reminders
 * - Handles delivery tracking and retries
 * - Enforces quiet hours and rate limits
 */
@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    @InjectModel(ReminderJob.name)
    private readonly reminderJobModel: Model<ReminderJobDocument>,
    @InjectModel(ReminderConfig.name)
    private readonly reminderConfigModel: Model<ReminderConfigDocument>,
    @InjectModel(MessageTemplate.name)
    private readonly messageTemplateModel: Model<MessageTemplateDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    private readonly smsService: SmsService,
    private readonly whatsappService: WhatsAppService,
    private readonly templateRenderer: TemplateRendererService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process scheduled reminders
   * Runs every minute to find and send due reminders
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledReminders(): Promise<void> {
    try {
      this.logger.debug('Processing scheduled reminders...');

      const now = new Date();

      // Find reminders that are due and not yet sent
      const dueReminders = await this.reminderJobModel
        .find({
          status: 'scheduled',
          scheduledAt: { $lte: now },
        })
        .limit(100) // Process in batches
        .exec();

      if (dueReminders.length === 0) {
        this.logger.debug('No reminders due at this time');
        return;
      }

      this.logger.log(`Found ${dueReminders.length} reminders to process`);

      // Process each reminder
      for (const reminder of dueReminders) {
        try {
          await this.processReminder(reminder);
        } catch (error) {
          this.logger.error(`Failed to process reminder ${reminder.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error in reminder processing cron job:', error);
    }
  }

  /**
   * Process a single reminder job
   */
  private async processReminder(job: ReminderJobDocument): Promise<void> {
    try {
      // Check quiet hours
      const config = await this.reminderConfigModel.findOne({
        tenantId: job.tenantId,
        clinicId: job.clinicId,
      });

      if (!config) {
        this.logger.warn(`No reminder config found for clinic ${job.clinicId}`);
        await this.updateJobStatus(job.id, 'skipped', undefined, 'No clinic configuration');
        return;
      }

      if (this.isQuietHours(config)) {
        this.logger.debug(`Skipping reminder ${job.id} - quiet hours`);
        // Reschedule for after quiet hours
        const nextSchedule = this.calculateNextSendTime(config);
        await this.reminderJobModel.updateOne({ id: job.id }, { scheduledAt: nextSchedule });
        return;
      }

      // Check rate limits
      const canSend = await this.checkRateLimits(job.tenantId, job.patientId, config);
      if (!canSend) {
        this.logger.warn(`Rate limit exceeded for patient ${job.patientId}`);
        await this.updateJobStatus(job.id, 'skipped', undefined, 'Rate limit exceeded');
        return;
      }

      // Update status to sending
      await this.updateJobStatus(job.id, 'sending');

      // Render message content if not already rendered
      if (!job.messageContent) {
        const content = await this.renderMessageContent(job);
        await this.reminderJobModel.updateOne({ id: job.id }, { messageContent: content });
        job.messageContent = content;
      }

      // Send via appropriate channel
      const result = await this.sendViaChannel(job);

      if (result.success) {
        await this.updateJobStatus(
          job.id,
          'sent',
          result.messageId,
          undefined,
          result.cost,
          result.currency,
        );

        this.eventEmitter.emit('reminder.sent', {
          jobId: job.id,
          appointmentId: job.appointmentId,
          patientId: job.patientId,
          channel: job.channel,
          sentAt: new Date().toISOString(),
        });
      } else {
        // Handle failure
        await this.handleFailedReminder(job, result.error || 'Unknown error');
      }
    } catch (error) {
      this.logger.error(`Error processing reminder ${job.id}:`, error);
      await this.handleFailedReminder(
        job,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Send reminder via the appropriate channel
   */
  private async sendViaChannel(job: ReminderJobDocument): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    cost?: number;
    currency?: string;
  }> {
    const message = job.messageContent || '';

    switch (job.channel) {
      case 'sms':
        if (!job.recipientPhone) {
          return { success: false, error: 'No phone number provided' };
        }
        const smsResult = await this.smsService.sendSms(job.recipientPhone, message, {
          correlationId: job.id,
        });
        return {
          success: smsResult.success,
          messageId: smsResult.messageId,
          error: smsResult.error,
          cost: smsResult.cost,
          currency: smsResult.currency,
        };

      case 'whatsapp':
        if (!job.recipientPhone) {
          return { success: false, error: 'No phone number provided' };
        }
        const waResult = await this.whatsappService.sendMessage(job.recipientPhone, message);
        return {
          success: waResult.success,
          messageId: waResult.messageId,
          error: waResult.error,
        };

      case 'email':
        // TODO: Implement email service
        this.logger.warn(`Email channel not yet implemented for reminder ${job.id}`);
        return { success: false, error: 'Email channel not implemented' };

      case 'push':
        // TODO: Implement push notification service
        this.logger.warn(`Push channel not yet implemented for reminder ${job.id}`);
        return { success: false, error: 'Push channel not implemented' };

      default:
        return { success: false, error: `Unsupported channel: ${job.channel}` };
    }
  }

  /**
   * Render message content from template
   */
  private async renderMessageContent(job: ReminderJobDocument): Promise<string> {
    // Get template
    const template = await this.messageTemplateModel.findOne({ id: job.templateId });
    if (!template) {
      throw new Error(`Template ${job.templateId} not found`);
    }

    // Get appointment details
    const appointment = await this.appointmentModel.findOne({ id: job.appointmentId });
    if (!appointment) {
      throw new Error(`Appointment ${job.appointmentId} not found`);
    }

    // TODO: Fetch patient, clinic, provider details from their respective services
    // For now, use placeholder data
    const variables: TemplateVariables = {
      patientName: 'Patient Name', // TODO: Fetch from patient service
      clinicName: 'Dental Clinic', // TODO: Fetch from clinic config
      clinicPhone: '+40 21 123 4567', // TODO: Fetch from clinic config
      appointmentDate: this.templateRenderer.formatDate(appointment.start, 'long'),
      appointmentTime: this.templateRenderer.formatTime(appointment.start),
      providerName: 'Dr. Provider', // TODO: Fetch from provider service
      appointmentType: appointment.serviceCode,
    };

    const rendered = this.templateRenderer.render(template.content, variables);

    // Sanitize and validate
    const sanitized = this.templateRenderer.sanitize(rendered);

    // For SMS, check length
    if (job.channel === 'sms') {
      const segments = this.templateRenderer.countSmsSegments(sanitized);
      if (segments > 3) {
        this.logger.warn(
          `SMS message for reminder ${job.id} is ${segments} segments (${sanitized.length} chars)`,
        );
      }
    }

    return sanitized;
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(config: ReminderConfigDocument): boolean {
    if (!config.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    // TODO: Properly handle timezone conversion using config.quietHours.timezone
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = config.quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.quietHours.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 21:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  }

  /**
   * Calculate next send time after quiet hours
   */
  private calculateNextSendTime(config: ReminderConfigDocument): Date {
    const now = new Date();
    const [endHour, endMinute] = config.quietHours.endTime.split(':').map(Number);

    const nextSend = new Date(now);
    nextSend.setHours(endHour, endMinute, 0, 0);

    // If end time is earlier in the day, it's tomorrow
    if (nextSend <= now) {
      nextSend.setDate(nextSend.getDate() + 1);
    }

    return nextSend;
  }

  /**
   * Check rate limits for patient
   */
  private async checkRateLimits(
    tenantId: string,
    patientId: string,
    config: ReminderConfigDocument,
  ): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sentToday = await this.reminderJobModel.countDocuments({
      tenantId,
      patientId,
      status: 'sent',
      sentAt: { $gte: today },
    });

    return sentToday < config.maxRemindersPerPatientPerDay;
  }

  /**
   * Handle failed reminder with retry logic
   */
  private async handleFailedReminder(
    job: ReminderJobDocument,
    errorMessage: string,
  ): Promise<void> {
    const retryCount = job.retryCount + 1;

    if (retryCount < job.maxRetries) {
      // Schedule retry with exponential backoff
      const backoffMinutes = Math.pow(2, retryCount) * 5; // 5, 10, 20 minutes
      const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000);

      await this.reminderJobModel.updateOne(
        { id: job.id },
        {
          status: 'scheduled',
          retryCount,
          nextRetryAt: nextRetry,
          errorMessage,
          scheduledAt: nextRetry,
        },
      );

      this.logger.log(
        `Scheduled retry ${retryCount}/${job.maxRetries} for reminder ${job.id} at ${nextRetry}`,
      );
    } else {
      // Max retries exceeded
      await this.updateJobStatus(job.id, 'failed', undefined, errorMessage);

      this.eventEmitter.emit('reminder.failed', {
        jobId: job.id,
        appointmentId: job.appointmentId,
        patientId: job.patientId,
        channel: job.channel,
        error: errorMessage,
        retries: retryCount,
      });
    }
  }

  /**
   * Update reminder job status
   */
  private async updateJobStatus(
    jobId: string,
    status: ReminderJobStatus,
    externalId?: string,
    errorMessage?: string,
    cost?: number,
    currency?: string,
  ): Promise<void> {
    const update: any = { status };

    if (status === 'sent') {
      update.sentAt = new Date();
    }

    if (externalId) {
      update.externalId = externalId;
    }

    if (errorMessage) {
      update.errorMessage = errorMessage;
    }

    if (cost !== undefined) {
      update.cost = cost;
      update.currency = currency || 'RON';
    }

    await this.reminderJobModel.updateOne({ id: jobId }, update);
  }

  /**
   * Create reminder jobs when appointment is booked
   */
  @OnEvent('appointment.booked')
  async handleAppointmentBooked(event: any): Promise<void> {
    try {
      this.logger.log(`Creating reminders for appointment ${event.appointmentId}`);

      const appointment = await this.appointmentModel.findOne({ id: event.appointmentId });
      if (!appointment) {
        this.logger.warn(`Appointment ${event.appointmentId} not found`);
        return;
      }

      // Get clinic reminder config
      const config = await this.reminderConfigModel.findOne({
        tenantId: appointment.tenantId,
        clinicId: appointment.locationId,
      });

      if (!config) {
        this.logger.debug(`No reminder config for clinic ${appointment.locationId}`);
        return;
      }

      // Create job for each active reminder rule
      for (const rule of config.reminders.filter((r) => r.isActive)) {
        await this.createReminderJobs(appointment, rule, config);
      }
    } catch (error) {
      this.logger.error('Error handling appointment booked event:', error);
    }
  }

  /**
   * Create reminder jobs for a reminder rule
   */
  private async createReminderJobs(
    appointment: AppointmentDocument,
    rule: ReminderRule,
    config: ReminderConfigDocument,
  ): Promise<void> {
    const scheduledAt = new Date(appointment.start.getTime() + rule.offsetMinutes * 60 * 1000);

    // Don't schedule reminders in the past
    if (scheduledAt < new Date()) {
      this.logger.debug(
        `Skipping reminder rule ${rule.name} for appointment ${appointment.id} - scheduled time is in the past`,
      );
      return;
    }

    // Get template
    const template = await this.messageTemplateModel.findOne({ id: rule.templateId });
    if (!template) {
      this.logger.warn(`Template ${rule.templateId} not found for rule ${rule.name}`);
      return;
    }

    // Create job for each enabled channel in the rule
    for (const channel of rule.channels) {
      // Check if channel is enabled in config
      const channelEnabled = this.isChannelEnabled(channel, config);
      if (!channelEnabled) {
        this.logger.debug(`Channel ${channel} not enabled for clinic ${config.clinicId}`);
        continue;
      }

      const job = new this.reminderJobModel({
        id: uuidv4(),
        tenantId: appointment.tenantId,
        clinicId: appointment.locationId,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        channel,
        templateId: rule.templateId,
        recipientPhone: undefined, // TODO: Fetch from patient service
        recipientEmail: undefined, // TODO: Fetch from patient service
        scheduledAt,
        status: 'scheduled',
        retryCount: 0,
        maxRetries: 3,
      });

      await job.save();

      this.logger.log(
        `Created ${channel} reminder job ${job.id} for appointment ${appointment.id} scheduled at ${scheduledAt}`,
      );
    }
  }

  /**
   * Check if channel is enabled in config
   */
  private isChannelEnabled(channel: string, config: ReminderConfigDocument): boolean {
    switch (channel) {
      case 'sms':
        return config.smsEnabled;
      case 'whatsapp':
        return config.whatsappEnabled;
      case 'email':
        return config.emailEnabled;
      case 'push':
        return config.pushEnabled;
      default:
        return false;
    }
  }

  /**
   * Cancel reminder jobs when appointment is cancelled
   */
  @OnEvent('appointment.cancelled')
  async handleAppointmentCancelled(event: any): Promise<void> {
    try {
      this.logger.log(`Cancelling reminders for appointment ${event.appointmentId}`);

      await this.reminderJobModel.updateMany(
        {
          appointmentId: event.appointmentId,
          status: 'scheduled',
        },
        {
          status: 'cancelled',
        },
      );

      this.logger.log(`Cancelled reminders for appointment ${event.appointmentId}`);
    } catch (error) {
      this.logger.error('Error handling appointment cancelled event:', error);
    }
  }

  /**
   * Handle appointment rescheduled - cancel old reminders and create new ones
   */
  @OnEvent('appointment.rescheduled')
  async handleAppointmentRescheduled(event: any): Promise<void> {
    try {
      // Cancel existing reminders
      await this.handleAppointmentCancelled(event);

      // Create new reminders
      await this.handleAppointmentBooked(event);
    } catch (error) {
      this.logger.error('Error handling appointment rescheduled event:', error);
    }
  }
}
