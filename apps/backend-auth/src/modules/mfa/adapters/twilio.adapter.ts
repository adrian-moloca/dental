import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioAdapter {
  private readonly logger = new Logger(TwilioAdapter.name);
  private readonly client: Twilio;
  private readonly fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    const hasValidSid = !!accountSid && accountSid.startsWith('AC');
    if (hasValidSid && authToken) {
      this.client = new Twilio(accountSid, authToken);
    } else {
      this.logger.warn(
        'Twilio credentials not configured or invalid (accountSid must start with AC). SMS MFA will not work.'
      );
      this.client = null as any;
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.client) {
      this.logger.error('Twilio client not initialized. Cannot send SMS.');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to,
      });

      this.logger.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}:`, error);
      return false;
    }
  }

  async sendMfaCode(to: string, code: string): Promise<boolean> {
    const message = `Your DentalOS verification code is: ${code}. This code expires in 5 minutes.`;
    return this.sendSms(to, message);
  }
}
