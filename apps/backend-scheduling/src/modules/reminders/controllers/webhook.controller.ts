import { Controller, Post, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { SmsService, TwilioWebhook } from '../services/sms.service';
import { WhatsAppService, WhatsAppWebhook } from '../services/whatsapp.service';
import { ReminderJob, ReminderJobDocument } from '../entities/reminder-job.schema';

/**
 * Webhook Controller
 *
 * Handles webhooks from Twilio for SMS and WhatsApp delivery status updates.
 * These webhooks provide real-time delivery status, read receipts, and patient replies.
 */
@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    @InjectModel(ReminderJob.name)
    private readonly reminderJobModel: Model<ReminderJobDocument>,
    private readonly smsService: SmsService,
    private readonly whatsappService: WhatsAppService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Twilio SMS Status Webhook
   *
   * Receives delivery status updates for SMS messages.
   * Called by Twilio when message status changes (sent, delivered, failed, etc.)
   */
  @Post('twilio/sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Twilio SMS status webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleTwilioSmsWebhook(@Body() payload: TwilioWebhook): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Twilio SMS webhook: ${payload.MessageSid} - ${payload.MessageStatus}`);

      // Process webhook through SMS service
      await this.smsService.handleWebhook(payload);

      // Update reminder job status
      await this.updateReminderJobFromWebhook(
        payload.MessageSid,
        payload.MessageStatus,
        payload.ErrorCode,
        payload.ErrorMessage,
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error processing Twilio SMS webhook:', error);
      // Still return 200 to prevent Twilio from retrying
      return { success: false };
    }
  }

  /**
   * Twilio WhatsApp Status Webhook
   *
   * Receives delivery status updates for WhatsApp messages.
   * Also receives read receipts unique to WhatsApp.
   */
  @Post('twilio/whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Twilio WhatsApp status webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleTwilioWhatsAppWebhook(
    @Body() payload: WhatsAppWebhook,
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Twilio WhatsApp webhook: ${payload.MessageSid} - ${payload.MessageStatus}`);

      // Process webhook through WhatsApp service
      await this.whatsappService.handleWebhook(payload);

      // Update reminder job status
      if (payload.MessageSid && payload.MessageStatus) {
        await this.updateReminderJobFromWebhook(
          payload.MessageSid,
          payload.MessageStatus,
          payload.ErrorCode,
          payload.ErrorMessage,
        );

        // Handle read status (WhatsApp-specific)
        if (payload.MessageStatus?.toLowerCase() === 'read') {
          await this.handleWhatsAppRead(payload.MessageSid);
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error processing Twilio WhatsApp webhook:', error);
      return { success: false };
    }
  }

  /**
   * Update reminder job based on webhook status
   */
  private async updateReminderJobFromWebhook(
    externalId: string,
    status: string,
    errorCode?: string,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const job = await this.reminderJobModel.findOne({ externalId });

      if (!job) {
        this.logger.warn(`No reminder job found for external ID ${externalId}`);
        return;
      }

      const statusLower = status.toLowerCase();
      const update: any = {};

      // Map Twilio status to our status
      if (statusLower === 'delivered') {
        update.deliveredAt = new Date();
        this.logger.log(`Reminder ${job.id} delivered`);

        this.eventEmitter.emit('reminder.delivered', {
          jobId: job.id,
          appointmentId: job.appointmentId,
          patientId: job.patientId,
          channel: job.channel,
          deliveredAt: new Date().toISOString(),
        });
      } else if (statusLower === 'failed' || statusLower === 'undelivered') {
        update.status = 'failed';
        update.errorCode = errorCode;
        update.errorMessage = errorMessage;
        this.logger.warn(`Reminder ${job.id} failed: ${errorMessage}`);

        this.eventEmitter.emit('reminder.failed', {
          jobId: job.id,
          appointmentId: job.appointmentId,
          patientId: job.patientId,
          channel: job.channel,
          errorCode,
          errorMessage,
        });
      }

      if (Object.keys(update).length > 0) {
        await this.reminderJobModel.updateOne({ id: job.id }, update);
      }
    } catch (error) {
      this.logger.error('Error updating reminder job from webhook:', error);
    }
  }

  /**
   * Handle WhatsApp read receipt
   */
  private async handleWhatsAppRead(externalId: string): Promise<void> {
    try {
      const job = await this.reminderJobModel.findOne({ externalId });

      if (!job) {
        return;
      }

      await this.reminderJobModel.updateOne({ id: job.id }, { readAt: new Date() });

      this.logger.log(`WhatsApp reminder ${job.id} read by patient`);

      this.eventEmitter.emit('reminder.read', {
        jobId: job.id,
        appointmentId: job.appointmentId,
        patientId: job.patientId,
        channel: 'whatsapp',
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error handling WhatsApp read receipt:', error);
    }
  }

  /**
   * Health check endpoint for webhook testing
   */
  @Post('twilio/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test webhook endpoint' })
  async testWebhook(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
