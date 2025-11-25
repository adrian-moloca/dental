import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridAdapter {
  private readonly logger = new Logger(SendGridAdapter.name);
  private readonly fromEmail: string;
  private initialized = false;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@dentalos.com';

    if (apiKey && apiKey.trim().length > 0) {
      try {
        sgMail.setApiKey(apiKey);
        this.initialized = true;
        this.logger.log('SendGrid adapter initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize SendGrid adapter:', error);
        this.initialized = false;
      }
    } else {
      this.logger.warn('SendGrid API key not configured. Email MFA will not work.');
      this.initialized = false;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.initialized) {
      this.logger.error('SendGrid not initialized. Cannot send email.');
      return false;
    }

    try {
      const msg = {
        to,
        from: this.fromEmail,
        subject,
        html,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendMfaCode(to: string, code: string): Promise<boolean> {
    const subject = 'Your DentalOS Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Your DentalOS verification code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}
