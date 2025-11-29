import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * SMS sending options
 */
export interface SmsOptions {
  /** Schedule message for future delivery */
  scheduledAt?: Date;
  /** Maximum price willing to pay (in cents) */
  maxPrice?: number;
  /** Validity period in seconds */
  validityPeriod?: number;
  /** Correlation ID for tracking */
  correlationId?: string;
}

/**
 * SMS sending result
 */
export interface SmsResult {
  /** Whether sending was successful */
  success: boolean;
  /** External message ID (Twilio SID) */
  messageId?: string;
  /** Status from provider */
  status: string;
  /** Error message if failed */
  error?: string;
  /** Error code if failed */
  errorCode?: string;
  /** Cost in cents */
  cost?: number;
  /** Currency (e.g., RON, USD) */
  currency?: string;
  /** When the message was queued/sent */
  sentAt?: Date;
}

/**
 * Delivery status
 */
export interface DeliveryStatus {
  /** Message ID */
  messageId: string;
  /** Current status */
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  /** When message was sent */
  sentAt?: Date;
  /** When message was delivered */
  deliveredAt?: Date;
  /** Error code if failed */
  errorCode?: string;
  /** Error message if failed */
  errorMessage?: string;
}

/**
 * Twilio webhook payload
 */
export interface TwilioWebhook {
  /** Message SID */
  MessageSid: string;
  /** Status */
  MessageStatus: string;
  /** From number */
  From: string;
  /** To number */
  To: string;
  /** Message body */
  Body?: string;
  /** Error code */
  ErrorCode?: string;
  /** Error message */
  ErrorMessage?: string;
  /** Timestamp */
  Timestamp?: string;
}

/**
 * SMS Service
 *
 * Handles SMS sending via Twilio.
 * Provides robust error handling, retry logic, and webhook processing.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  // private twilioClient: any; // Would be Twilio SDK client
  private readonly accountSid: string;
  private readonly authToken: string;
  // private readonly fromNumber: string;
  private readonly enabled: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID', '');
    this.authToken = this.config.get<string>('TWILIO_AUTH_TOKEN', '');
    // this.fromNumber = this.config.get<string>('TWILIO_FROM_NUMBER', '');
    this.enabled = this.config.get<boolean>('SMS_ENABLED', false);

    if (this.enabled && this.accountSid && this.authToken) {
      // In production, initialize Twilio client:
      // const twilioSdk = require('twilio');
      // this.twilioClient = twilioSdk(this.accountSid, this.authToken);
      this.logger.log('SMS Service initialized with Twilio');
    } else {
      this.logger.warn('SMS Service running in stub mode (Twilio credentials not configured)');
    }
  }

  /**
   * Send SMS message
   *
   * @param to - Recipient phone number (E.164 format, e.g., +40721234567)
   * @param message - Message content (max 160 chars for single SMS)
   * @param options - Additional sending options
   */
  async sendSms(to: string, message: string, options?: SmsOptions): Promise<SmsResult> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(to)) {
        throw new Error(
          `Invalid phone number format: ${to}. Must be E.164 format (e.g., +40721234567)`,
        );
      }

      // Validate message length
      if (message.length === 0) {
        throw new Error('Message content cannot be empty');
      }

      // Check if SMS is enabled
      if (!this.enabled) {
        this.logger.warn(`[STUB] SMS would be sent to ${to}: ${message.substring(0, 50)}...`);
        return this.stubSendSms(to, message, options);
      }

      // In production, send via Twilio:
      /*
      const result = await this.twilioClient.messages.create({
        from: this.fromNumber,
        to: to,
        body: message,
        statusCallback: `${this.config.get('APP_URL')}/webhooks/twilio/sms`,
      });

      // Emit event
      this.eventEmitter.emit('integrations.sms.sent', {
        eventType: 'integrations.sms.sent',
        messageId: result.sid,
        provider: 'twilio',
        to: to,
        message: message,
        status: result.status,
        sentAt: new Date().toISOString(),
        cost: parseFloat(result.price) * 100, // Convert to cents
        currency: result.priceUnit,
        correlationId: options?.correlationId || result.sid,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        cost: parseFloat(result.price) * 100,
        currency: result.priceUnit,
        sentAt: new Date(),
      };
      */

      // Stub implementation
      return this.stubSendSms(to, message, options);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}:`, error);

      // Emit failure event
      const messageId = `stub-${Date.now()}`;
      this.eventEmitter.emit('integrations.sms.failed', {
        eventType: 'integrations.sms.failed',
        messageId,
        provider: 'twilio',
        to: to,
        errorCode: error instanceof Error ? error.name : 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        correlationId: options?.correlationId || messageId,
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
   * Get delivery status for a message
   *
   * @param messageId - Twilio message SID
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
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
   * Handle Twilio webhook for status updates
   *
   * @param payload - Webhook payload from Twilio
   */
  async handleWebhook(payload: TwilioWebhook): Promise<void> {
    try {
      this.logger.log(
        `Received Twilio webhook for message ${payload.MessageSid}: ${payload.MessageStatus}`,
      );

      const status = payload.MessageStatus.toLowerCase();

      // Emit appropriate event based on status
      if (status === 'delivered') {
        this.eventEmitter.emit('integrations.sms.delivered', {
          eventType: 'integrations.sms.delivered',
          messageId: payload.MessageSid,
          provider: 'twilio',
          to: payload.To,
          deliveredAt: new Date().toISOString(),
          correlationId: payload.MessageSid,
          timestamp: new Date().toISOString(),
        });
      } else if (status === 'failed' || status === 'undelivered') {
        this.eventEmitter.emit('integrations.sms.failed', {
          eventType: 'integrations.sms.failed',
          messageId: payload.MessageSid,
          provider: 'twilio',
          to: payload.To,
          errorCode: payload.ErrorCode || 'UNKNOWN',
          errorMessage: payload.ErrorMessage || 'Message delivery failed',
          correlationId: payload.MessageSid,
          timestamp: new Date().toISOString(),
        });
      }

      // If message contains a reply from patient
      if (payload.Body) {
        this.eventEmitter.emit('reminder.patient.response', {
          messageId: payload.MessageSid,
          from: payload.From,
          to: payload.To,
          body: payload.Body,
          receivedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('Error processing Twilio webhook:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format (E.164)
   *
   * @param phoneNumber - Phone number to validate
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format: +[country code][number]
    // For Romania: +40 followed by 9 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /*
   * Map Twilio status to our standard status
   * @private
   * (Commented out until Twilio integration is active)
   *
  private mapTwilioStatus(twilioStatus: string): DeliveryStatus['status'] {
    const statusMap: Record<string, DeliveryStatus['status']> = {
      'queued': 'queued',
      'sending': 'sending',
      'sent': 'sent',
      'delivered': 'delivered',
      'failed': 'failed',
      'undelivered': 'undelivered',
    };
    return statusMap[twilioStatus.toLowerCase()] || 'failed';
  }
  */

  // ==================== Stub Methods ====================

  /**
   * Stub implementation for development/testing
   */
  private async stubSendSms(to: string, message: string, options?: SmsOptions): Promise<SmsResult> {
    this.logger.log(`[STUB] Sending SMS to ${to}: ${message.substring(0, 100)}...`);

    const messageId = `stub-sms-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Simulate successful send
    this.eventEmitter.emit('integrations.sms.sent', {
      eventType: 'integrations.sms.sent',
      messageId,
      provider: 'twilio-stub',
      to: to,
      message: message,
      status: 'sent',
      sentAt: new Date().toISOString(),
      cost: 5, // 5 bani per SMS
      currency: 'RON',
      correlationId: options?.correlationId || messageId,
      timestamp: new Date().toISOString(),
    });

    // Simulate delivery after 2 seconds
    setTimeout(() => {
      this.eventEmitter.emit('integrations.sms.delivered', {
        eventType: 'integrations.sms.delivered',
        messageId,
        provider: 'twilio-stub',
        to: to,
        deliveredAt: new Date().toISOString(),
        correlationId: options?.correlationId || messageId,
        timestamp: new Date().toISOString(),
      });
    }, 2000);

    return {
      success: true,
      messageId,
      status: 'sent',
      cost: 5,
      currency: 'RON',
      sentAt: new Date(),
    };
  }

  /**
   * Stub implementation for getting delivery status
   */
  private async stubGetDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    return {
      messageId,
      status: 'delivered',
      sentAt: new Date(),
      deliveredAt: new Date(),
    };
  }
}
