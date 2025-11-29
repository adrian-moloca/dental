import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  PatientNotification,
  PatientNotificationDocument,
} from '../entities/patient-notification.schema';

/**
 * Notification Event Handler Service
 *
 * Handles events emitted by external services (SMS, WhatsApp, Email providers)
 * and updates notification status accordingly.
 *
 * Events handled:
 * - integrations.sms.sent
 * - integrations.sms.delivered
 * - integrations.sms.failed
 * - integrations.whatsapp.sent
 * - integrations.whatsapp.delivered
 * - integrations.whatsapp.read
 * - integrations.whatsapp.failed
 */
@Injectable()
export class NotificationEventHandlerService {
  private readonly logger = new Logger(NotificationEventHandlerService.name);

  constructor(
    @InjectModel(PatientNotification.name)
    private readonly notificationModel: Model<PatientNotificationDocument>,
  ) {}

  // ==================== SMS Events ====================

  /**
   * Handle SMS sent event
   */
  @OnEvent('integrations.sms.sent')
  async handleSmsSent(event: {
    messageId: string;
    provider: string;
    to: string;
    message: string;
    status: string;
    sentAt: string;
    cost?: number;
    currency?: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.log(`SMS sent: ${event.messageId} (correlationId: ${event.correlationId})`);

    if (!event.correlationId) {
      this.logger.warn('SMS sent event has no correlationId, cannot update notification');
      return;
    }

    try {
      const notification = await this.notificationModel.findOne({ id: event.correlationId }).exec();

      if (!notification) {
        this.logger.warn(`Notification ${event.correlationId} not found for SMS sent event`);
        return;
      }

      notification.status = 'sent';
      notification.sentAt = new Date(event.sentAt);
      notification.externalId = event.messageId;
      notification.provider = event.provider;
      notification.cost = event.cost;
      notification.currency = event.currency;

      await notification.save();
      this.logger.log(`Notification ${notification.id} marked as sent`);
    } catch (error) {
      this.logger.error('Error handling SMS sent event:', error);
    }
  }

  /**
   * Handle SMS delivered event
   */
  @OnEvent('integrations.sms.delivered')
  async handleSmsDelivered(event: {
    messageId: string;
    provider: string;
    to: string;
    deliveredAt: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.log(`SMS delivered: ${event.messageId}`);

    try {
      // Find by externalId or correlationId
      const notification = await this.notificationModel
        .findOne({
          $or: [{ externalId: event.messageId }, { id: event.correlationId }],
        })
        .exec();

      if (!notification) {
        this.logger.warn(`Notification not found for SMS delivered event: ${event.messageId}`);
        return;
      }

      notification.status = 'delivered';
      notification.deliveredAt = new Date(event.deliveredAt);

      await notification.save();
      this.logger.log(`Notification ${notification.id} marked as delivered`);
    } catch (error) {
      this.logger.error('Error handling SMS delivered event:', error);
    }
  }

  /**
   * Handle SMS failed event
   */
  @OnEvent('integrations.sms.failed')
  async handleSmsFailed(event: {
    messageId: string;
    provider: string;
    to: string;
    errorCode: string;
    errorMessage: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.error(`SMS failed: ${event.messageId} - ${event.errorMessage}`);

    try {
      const notification = await this.notificationModel
        .findOne({
          $or: [{ externalId: event.messageId }, { id: event.correlationId }],
        })
        .exec();

      if (!notification) {
        this.logger.warn(`Notification not found for SMS failed event: ${event.messageId}`);
        return;
      }

      notification.status = 'failed';
      notification.errorCode = event.errorCode;
      notification.errorMessage = event.errorMessage;

      await notification.save();
      this.logger.log(`Notification ${notification.id} marked as failed`);
    } catch (error) {
      this.logger.error('Error handling SMS failed event:', error);
    }
  }

  // ==================== WhatsApp Events ====================

  /**
   * Handle WhatsApp sent event
   */
  @OnEvent('integrations.whatsapp.sent')
  async handleWhatsAppSent(event: {
    messageId: string;
    to: string;
    messageType: string;
    templateName?: string;
    status: string;
    sentAt: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.log(`WhatsApp sent: ${event.messageId} (correlationId: ${event.correlationId})`);

    if (!event.correlationId) {
      this.logger.warn('WhatsApp sent event has no correlationId, cannot update notification');
      return;
    }

    try {
      const notification = await this.notificationModel.findOne({ id: event.correlationId }).exec();

      if (!notification) {
        this.logger.warn(`Notification ${event.correlationId} not found for WhatsApp sent event`);
        return;
      }

      notification.status = 'sent';
      notification.sentAt = new Date(event.sentAt);
      notification.externalId = event.messageId;
      notification.provider = 'twilio';

      await notification.save();
      this.logger.log(`Notification ${notification.id} marked as sent (WhatsApp)`);
    } catch (error) {
      this.logger.error('Error handling WhatsApp sent event:', error);
    }
  }

  /**
   * Handle WhatsApp delivered event
   */
  @OnEvent('integrations.whatsapp.delivered')
  async handleWhatsAppDelivered(event: {
    messageId: string;
    to: string;
    deliveredAt: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.log(`WhatsApp delivered: ${event.messageId}`);

    try {
      const notification = await this.notificationModel
        .findOne({
          $or: [{ externalId: event.messageId }, { id: event.correlationId }],
        })
        .exec();

      if (!notification) {
        this.logger.warn(`Notification not found for WhatsApp delivered event: ${event.messageId}`);
        return;
      }

      notification.status = 'delivered';
      notification.deliveredAt = new Date(event.deliveredAt);

      await notification.save();
      this.logger.log(`Notification ${notification.id} marked as delivered (WhatsApp)`);
    } catch (error) {
      this.logger.error('Error handling WhatsApp delivered event:', error);
    }
  }

  /**
   * Handle WhatsApp read event (unique to WhatsApp)
   */
  @OnEvent('integrations.whatsapp.read')
  async handleWhatsAppRead(event: {
    messageId: string;
    to: string;
    readAt: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.log(`WhatsApp read: ${event.messageId}`);

    try {
      const notification = await this.notificationModel
        .findOne({
          $or: [{ externalId: event.messageId }, { id: event.correlationId }],
        })
        .exec();

      if (!notification) {
        this.logger.warn(`Notification not found for WhatsApp read event: ${event.messageId}`);
        return;
      }

      notification.status = 'read';
      notification.readAt = new Date(event.readAt);

      await notification.save();
      this.logger.log(`Notification ${notification.id} marked as read (WhatsApp)`);
    } catch (error) {
      this.logger.error('Error handling WhatsApp read event:', error);
    }
  }

  /**
   * Handle WhatsApp failed event
   */
  @OnEvent('integrations.whatsapp.failed')
  async handleWhatsAppFailed(event: {
    messageId: string;
    to: string;
    errorCode: string;
    errorMessage: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.error(`WhatsApp failed: ${event.messageId} - ${event.errorMessage}`);

    try {
      const notification = await this.notificationModel
        .findOne({
          $or: [{ externalId: event.messageId }, { id: event.correlationId }],
        })
        .exec();

      if (!notification) {
        this.logger.warn(`Notification not found for WhatsApp failed event: ${event.messageId}`);
        return;
      }

      notification.status = 'failed';
      notification.errorCode = event.errorCode;
      notification.errorMessage = event.errorMessage;

      await notification.save();
      this.logger.log(`Notification ${notification.id} marked as failed (WhatsApp)`);
    } catch (error) {
      this.logger.error('Error handling WhatsApp failed event:', error);
    }
  }

  // ==================== Email Events (Future) ====================

  /**
   * Handle email sent event
   */
  @OnEvent('integrations.email.sent')
  async handleEmailSent(event: {
    messageId: string;
    provider: string;
    to: string;
    subject: string;
    sentAt: string;
    correlationId?: string;
  }): Promise<void> {
    this.logger.log(`Email sent: ${event.messageId}`);

    if (!event.correlationId) {
      return;
    }

    try {
      const notification = await this.notificationModel.findOne({ id: event.correlationId }).exec();

      if (!notification) {
        return;
      }

      notification.status = 'sent';
      notification.sentAt = new Date(event.sentAt);
      notification.externalId = event.messageId;
      notification.provider = event.provider;

      await notification.save();
    } catch (error) {
      this.logger.error('Error handling email sent event:', error);
    }
  }

  /**
   * Handle email delivered event
   */
  @OnEvent('integrations.email.delivered')
  async handleEmailDelivered(event: {
    messageId: string;
    to: string;
    deliveredAt: string;
  }): Promise<void> {
    this.logger.log(`Email delivered: ${event.messageId}`);

    try {
      const notification = await this.notificationModel
        .findOne({ externalId: event.messageId })
        .exec();

      if (!notification) {
        return;
      }

      notification.status = 'delivered';
      notification.deliveredAt = new Date(event.deliveredAt);

      await notification.save();
    } catch (error) {
      this.logger.error('Error handling email delivered event:', error);
    }
  }

  /**
   * Handle email failed event
   */
  @OnEvent('integrations.email.failed')
  async handleEmailFailed(event: {
    messageId: string;
    to: string;
    errorCode: string;
    errorMessage: string;
  }): Promise<void> {
    this.logger.error(`Email failed: ${event.messageId} - ${event.errorMessage}`);

    try {
      const notification = await this.notificationModel
        .findOne({ externalId: event.messageId })
        .exec();

      if (!notification) {
        return;
      }

      notification.status = 'failed';
      notification.errorCode = event.errorCode;
      notification.errorMessage = event.errorMessage;

      await notification.save();
    } catch (error) {
      this.logger.error('Error handling email failed event:', error);
    }
  }
}
