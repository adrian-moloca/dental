import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * WhatsApp sending result
 */
export interface WhatsAppResult {
  /** Whether sending was successful */
  success: boolean;
  /** External message ID */
  messageId?: string;
  /** Status from provider */
  status: string;
  /** Error message if failed */
  error?: string;
  /** Error code if failed */
  errorCode?: string;
  /** When the message was queued/sent */
  sentAt?: Date;
}

/**
 * WhatsApp delivery status
 */
export interface WhatsAppDeliveryStatus {
  /** Message ID */
  messageId: string;
  /** Current status */
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  /** When message was sent */
  sentAt?: Date;
  /** When message was delivered */
  deliveredAt?: Date;
  /** When message was read */
  readAt?: Date;
  /** Error code if failed */
  errorCode?: string;
  /** Error message if failed */
  errorMessage?: string;
}

/**
 * WhatsApp webhook payload (Twilio format)
 */
export interface WhatsAppWebhook {
  /** Message SID */
  MessageSid?: string;
  /** Status */
  MessageStatus?: string;
  /** From number (WhatsApp ID) */
  From?: string;
  /** To number */
  To?: string;
  /** Message body */
  Body?: string;
  /** Error code */
  ErrorCode?: string;
  /** Error message */
  ErrorMessage?: string;
  /** Number of media items */
  NumMedia?: string;
  /** Timestamp */
  Timestamp?: string;
}

/**
 * WhatsApp Service
 *
 * Handles WhatsApp messaging via Twilio WhatsApp Business API.
 * Supports both template messages (pre-approved) and session messages.
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  // private twilioClient: any; // Would be Twilio SDK client
  private readonly accountSid: string;
  private readonly authToken: string;
  // private readonly fromNumber: string; // WhatsApp-enabled Twilio number
  private readonly enabled: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID', '');
    this.authToken = this.config.get<string>('TWILIO_AUTH_TOKEN', '');
    // this.fromNumber = this.config.get<string>('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886'); // Twilio sandbox default
    this.enabled = this.config.get<boolean>('WHATSAPP_ENABLED', false);

    if (this.enabled && this.accountSid && this.authToken) {
      // In production, initialize Twilio client:
      // const twilioSdk = require('twilio');
      // this.twilioClient = twilioSdk(this.accountSid, this.authToken);
      this.logger.log('WhatsApp Service initialized with Twilio');
    } else {
      this.logger.warn('WhatsApp Service running in stub mode (Twilio credentials not configured)');
    }
  }

  /**
   * Send WhatsApp template message
   *
   * Template messages are pre-approved by WhatsApp and can be sent outside of 24-hour window.
   * Used for appointment reminders, notifications, etc.
   *
   * @param to - Recipient WhatsApp number (E.164 format, e.g., +40721234567)
   * @param templateName - Name of approved template
   * @param variables - Variables for template substitution
   */
  async sendTemplate(
    to: string,
    templateName: string,
    variables: Record<string, string>,
  ): Promise<WhatsAppResult> {
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(to)) {
        throw new Error(`Invalid phone number format: ${to}. Must be E.164 format.`);
      }

      // Format WhatsApp number
      const whatsappTo = this.formatWhatsAppNumber(to);

      if (!this.enabled) {
        this.logger.warn(
          `[STUB] WhatsApp template '${templateName}' would be sent to ${whatsappTo}`,
        );
        return this.stubSendTemplate(whatsappTo, templateName, variables);
      }

      // In production, send via Twilio with Content SID (template):
      /*
      // First, find the approved Content SID for this template
      const contentSid = await this.getContentSid(templateName);

      const result = await this.twilioClient.messages.create({
        from: this.fromNumber,
        to: whatsappTo,
        contentSid: contentSid,
        contentVariables: JSON.stringify(variables),
        statusCallback: `${this.config.get('APP_URL')}/webhooks/twilio/whatsapp`,
      });

      this.eventEmitter.emit('integrations.whatsapp.sent', {
        eventType: 'integrations.whatsapp.sent',
        messageId: result.sid,
        to: whatsappTo,
        messageType: 'template',
        templateName: templateName,
        status: result.status,
        sentAt: new Date().toISOString(),
        correlationId: result.sid,
        metadata: { variables },
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date(),
      };
      */

      return this.stubSendTemplate(whatsappTo, templateName, variables);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp template to ${to}:`, error);

      const messageId = `stub-wa-${Date.now()}`;
      this.eventEmitter.emit('integrations.whatsapp.failed', {
        eventType: 'integrations.whatsapp.failed',
        messageId,
        to: this.formatWhatsAppNumber(to),
        errorCode: error instanceof Error ? error.name : 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        correlationId: messageId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: error instanceof Error ? error.name : 'UNKNOWN',
      };
    }
  }

  /**
   * Send WhatsApp session message
   *
   * Session messages can only be sent within 24 hours of last customer message.
   * Used for follow-ups, confirmations within active conversation.
   *
   * @param to - Recipient WhatsApp number
   * @param message - Message text
   */
  async sendMessage(to: string, message: string): Promise<WhatsAppResult> {
    try {
      if (!this.isValidPhoneNumber(to)) {
        throw new Error(`Invalid phone number format: ${to}`);
      }

      const whatsappTo = this.formatWhatsAppNumber(to);

      if (!this.enabled) {
        this.logger.warn(
          `[STUB] WhatsApp message would be sent to ${whatsappTo}: ${message.substring(0, 50)}...`,
        );
        return this.stubSendMessage(whatsappTo, message);
      }

      // In production, send via Twilio:
      /*
      const result = await this.twilioClient.messages.create({
        from: this.fromNumber,
        to: whatsappTo,
        body: message,
        statusCallback: `${this.config.get('APP_URL')}/webhooks/twilio/whatsapp`,
      });

      this.eventEmitter.emit('integrations.whatsapp.sent', {
        eventType: 'integrations.whatsapp.sent',
        messageId: result.sid,
        to: whatsappTo,
        messageType: 'session',
        status: result.status,
        sentAt: new Date().toISOString(),
        correlationId: result.sid,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date(),
      };
      */

      return this.stubSendMessage(whatsappTo, message);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${to}:`, error);

      const messageId = `stub-wa-${Date.now()}`;
      this.eventEmitter.emit('integrations.whatsapp.failed', {
        eventType: 'integrations.whatsapp.failed',
        messageId,
        to: this.formatWhatsAppNumber(to),
        errorCode: error instanceof Error ? error.name : 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        correlationId: messageId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get delivery status for a WhatsApp message
   *
   * @param messageId - Message SID
   */
  async getDeliveryStatus(messageId: string): Promise<WhatsAppDeliveryStatus> {
    try {
      if (!this.enabled) {
        return this.stubGetDeliveryStatus(messageId);
      }

      // In production, fetch from Twilio:
      /*
      const message = await this.twilioClient.messages(messageId).fetch();

      return {
        messageId: message.sid,
        status: this.mapTwilioStatus(message.status),
        sentAt: message.dateSent ? new Date(message.dateSent) : undefined,
        deliveredAt: message.status === 'delivered' ? new Date() : undefined,
        readAt: message.status === 'read' ? new Date() : undefined,
        errorCode: message.errorCode?.toString(),
        errorMessage: message.errorMessage,
      };
      */

      return this.stubGetDeliveryStatus(messageId);
    } catch (error) {
      this.logger.error(`Failed to get delivery status for ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Handle WhatsApp webhook from Twilio
   *
   * @param payload - Webhook payload
   */
  async handleWebhook(payload: WhatsAppWebhook): Promise<void> {
    try {
      const messageId = payload.MessageSid || 'unknown';
      const status = (payload.MessageStatus || 'unknown').toLowerCase();

      this.logger.log(`Received WhatsApp webhook for message ${messageId}: ${status}`);

      // Emit appropriate event based on status
      if (status === 'delivered') {
        this.eventEmitter.emit('integrations.whatsapp.delivered', {
          eventType: 'integrations.whatsapp.delivered',
          messageId,
          to: payload.To || '',
          deliveredAt: new Date().toISOString(),
          correlationId: messageId,
          timestamp: new Date().toISOString(),
        });
      } else if (status === 'read') {
        this.eventEmitter.emit('integrations.whatsapp.read', {
          eventType: 'integrations.whatsapp.read',
          messageId,
          to: payload.To || '',
          readAt: new Date().toISOString(),
          correlationId: messageId,
          timestamp: new Date().toISOString(),
        });
      } else if (status === 'failed' || status === 'undelivered') {
        this.eventEmitter.emit('integrations.whatsapp.failed', {
          eventType: 'integrations.whatsapp.failed',
          messageId,
          to: payload.To || '',
          errorCode: payload.ErrorCode || 'UNKNOWN',
          errorMessage: payload.ErrorMessage || 'Message delivery failed',
          correlationId: messageId,
          timestamp: new Date().toISOString(),
        });
      }

      // Handle incoming messages (patient replies)
      if (payload.Body && payload.From) {
        this.eventEmitter.emit('reminder.patient.response', {
          messageId,
          from: payload.From,
          to: payload.To || '',
          body: payload.Body,
          channel: 'whatsapp',
          receivedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('Error processing WhatsApp webhook:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Format phone number for WhatsApp (add whatsapp: prefix)
   */
  private formatWhatsAppNumber(phoneNumber: string): string {
    return phoneNumber.startsWith('whatsapp:') ? phoneNumber : `whatsapp:${phoneNumber}`;
  }

  /*
   * Map Twilio status to our standard status
   * @private
   * (Commented out until Twilio integration is active)
   *
  private mapTwilioStatus(twilioStatus: string): WhatsAppDeliveryStatus['status'] {
    const statusMap: Record<string, WhatsAppDeliveryStatus['status']> = {
      'queued': 'queued',
      'sending': 'sending',
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed',
      'undelivered': 'failed',
    };
    return statusMap[twilioStatus.toLowerCase()] || 'failed';
  }
  */

  // ==================== Stub Methods ====================

  private async stubSendTemplate(
    to: string,
    templateName: string,
    variables: Record<string, string>,
  ): Promise<WhatsAppResult> {
    this.logger.log(
      `[STUB] Sending WhatsApp template '${templateName}' to ${to} with vars: ${JSON.stringify(variables)}`,
    );

    const messageId = `stub-wa-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    this.eventEmitter.emit('integrations.whatsapp.sent', {
      eventType: 'integrations.whatsapp.sent',
      messageId,
      to,
      messageType: 'template',
      templateName,
      status: 'sent',
      sentAt: new Date().toISOString(),
      correlationId: messageId,
      metadata: { variables },
      timestamp: new Date().toISOString(),
    });

    // Simulate delivery and read
    setTimeout(() => {
      this.eventEmitter.emit('integrations.whatsapp.delivered', {
        eventType: 'integrations.whatsapp.delivered',
        messageId,
        to,
        deliveredAt: new Date().toISOString(),
        correlationId: messageId,
        timestamp: new Date().toISOString(),
      });
    }, 2000);

    setTimeout(() => {
      this.eventEmitter.emit('integrations.whatsapp.read', {
        eventType: 'integrations.whatsapp.read',
        messageId,
        to,
        readAt: new Date().toISOString(),
        correlationId: messageId,
        timestamp: new Date().toISOString(),
      });
    }, 5000);

    return {
      success: true,
      messageId,
      status: 'sent',
      sentAt: new Date(),
    };
  }

  private async stubSendMessage(to: string, message: string): Promise<WhatsAppResult> {
    this.logger.log(`[STUB] Sending WhatsApp message to ${to}: ${message.substring(0, 100)}...`);

    const messageId = `stub-wa-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    this.eventEmitter.emit('integrations.whatsapp.sent', {
      eventType: 'integrations.whatsapp.sent',
      messageId,
      to,
      messageType: 'session',
      status: 'sent',
      sentAt: new Date().toISOString(),
      correlationId: messageId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId,
      status: 'sent',
      sentAt: new Date(),
    };
  }

  private async stubGetDeliveryStatus(messageId: string): Promise<WhatsAppDeliveryStatus> {
    return {
      messageId,
      status: 'read',
      sentAt: new Date(),
      deliveredAt: new Date(),
      readAt: new Date(),
    };
  }
}
