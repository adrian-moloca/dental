import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';

import {
  PatientNotification,
  PatientNotificationDocument,
} from '../entities/patient-notification.schema';
import { MessageTemplate, MessageTemplateDocument } from '../entities/message-template.schema';
import {
  SendNotificationDto,
  BulkNotificationDto,
  QuickSmsDto,
  QuickWhatsAppDto,
  QuickEmailDto,
  PreviewNotificationDto,
  NotificationResponseDto,
  BulkNotificationResponseDto,
  PreviewNotificationResponseDto,
  NotificationChannel,
} from '../dto/send-notification.dto';

import { SmsService } from './sms.service';
import { WhatsAppService } from './whatsapp.service';
import { TemplateRendererService } from './template-renderer.service';

/**
 * Tenant context from authenticated request
 */
export interface TenantContext {
  tenantId: string;
  clinicId?: string;
  userId: string;
  userName: string;
}

/**
 * Patient information for notifications
 */
export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  primaryPhone?: string;
  primaryEmail?: string;
  canSms?: boolean;
  canWhatsApp?: boolean;
  canEmail?: boolean;
  marketingConsent?: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
}

/**
 * Notification Service
 *
 * Comprehensive patient notification system supporting:
 * - Manual single notifications
 * - Bulk notifications with patient filtering
 * - Quick send shortcuts
 * - Template-based messaging
 * - Multi-channel delivery (SMS, WhatsApp, Email)
 * - Consent checking (GDPR compliant)
 * - Rate limiting
 * - Quiet hours enforcement
 * - Complete notification history
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Rate limits per patient per channel
  private readonly RATE_LIMITS = {
    sms: { daily: 5, weekly: 10, monthly: 30 },
    whatsapp: { daily: 5, weekly: 10, monthly: 30 },
    email: { daily: 3, weekly: 7, monthly: 20 },
  };

  // Quiet hours (in clinic's timezone)
  private readonly QUIET_HOURS = {
    start: 21, // 9 PM
    end: 9, // 9 AM
  };

  constructor(
    @InjectModel(PatientNotification.name)
    private readonly notificationModel: Model<PatientNotificationDocument>,
    @InjectModel(MessageTemplate.name)
    private readonly templateModel: Model<MessageTemplateDocument>,
    private readonly smsService: SmsService,
    private readonly whatsAppService: WhatsAppService,
    private readonly templateRenderer: TemplateRendererService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Send notification to a single patient
   */
  async sendNotification(
    patientId: string,
    dto: SendNotificationDto,
    context: TenantContext,
  ): Promise<NotificationResponseDto> {
    // Validate DTO
    if (!dto.templateId && !dto.customMessage) {
      throw new BadRequestException('Either templateId or customMessage must be provided');
    }

    if (dto.templateId && dto.customMessage) {
      throw new BadRequestException('Cannot provide both templateId and customMessage');
    }

    if (dto.channel === NotificationChannel.EMAIL && !dto.subject) {
      throw new BadRequestException('Subject is required for email notifications');
    }

    // Get patient information (mock - replace with actual patient service call)
    const patient = await this.getPatientInfo(patientId, context.tenantId);

    // Check consent
    const notificationType = this.inferNotificationType(dto);
    await this.checkConsent(patient, dto.channel, notificationType);

    // Get recipient contact
    const recipientContact = this.getRecipientContact(patient, dto.channel);

    // Prepare message content
    let content: string;
    let subject: string | undefined;
    let templateId: string | undefined;

    if (dto.templateId) {
      // Render template
      const template = await this.getTemplate(dto.templateId, context.tenantId);
      const variables = await this.prepareVariables(patient, dto.variables || {}, context);

      content = this.templateRenderer.render(template.content, variables);
      subject = template.subject
        ? this.templateRenderer.render(template.subject, variables)
        : dto.subject;
      templateId = dto.templateId;
    } else {
      // Use custom message
      content = dto.customMessage!;
      subject = dto.subject;
    }

    // Check rate limits
    await this.checkRateLimits(patientId, dto.channel, context.tenantId);

    // Check quiet hours (if immediate send)
    if (!dto.sendAt) {
      this.checkQuietHours();
    }

    // Create notification record
    const notification = await this.createNotificationRecord({
      tenantId: context.tenantId,
      clinicId: context.clinicId,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      recipientContact,
      channel: dto.channel,
      templateId,
      subject,
      content,
      type: this.inferNotificationType(dto),
      appointmentId: dto.appointmentId,
      invoiceId: dto.invoiceId,
      treatmentPlanId: dto.treatmentPlanId,
      sentBy: context.userId,
      sentByName: context.userName,
      queuedAt: dto.sendAt ? new Date(dto.sendAt) : new Date(),
    });

    // Send immediately if no schedule
    if (!dto.sendAt) {
      await this.sendNotificationNow(notification);
    }

    // Emit event
    this.eventEmitter.emit('notification.queued', {
      notificationId: notification.id,
      patientId: patient.id,
      channel: dto.channel,
      type: notification.type,
      tenantId: context.tenantId,
      timestamp: new Date().toISOString(),
    });

    return {
      id: notification.id,
      status: notification.status,
      channel: notification.channel,
      queuedAt: notification.queuedAt.toISOString(),
      estimatedCost: this.estimateCost(content, dto.channel),
    };
  }

  /**
   * Send bulk notifications to multiple patients
   */
  async sendBulkNotifications(
    dto: BulkNotificationDto,
    context: TenantContext,
  ): Promise<BulkNotificationResponseDto> {
    // Validate DTO
    if (!dto.patientIds && !dto.patientFilter) {
      throw new BadRequestException('Either patientIds or patientFilter must be provided');
    }

    if (dto.patientIds && dto.patientFilter) {
      throw new BadRequestException('Cannot provide both patientIds and patientFilter');
    }

    // Get patient list
    const patients = dto.patientIds
      ? await this.getPatientsByIds(dto.patientIds, context.tenantId)
      : await this.getPatientsByFilter(dto.patientFilter!, context.tenantId);

    this.logger.log(`Sending bulk notifications to ${patients.length} patients`);

    // Get template
    const template = await this.getTemplate(dto.templateId, context.tenantId);

    const results: string[] = [];
    const failures: Array<{ patientId: string; reason: string }> = [];
    let totalCost = 0;

    // Process each patient
    for (const patient of patients) {
      try {
        // Check consent
        await this.checkConsent(patient, dto.channel, template.type || 'marketing_campaign');

        // Get recipient contact
        const recipientContact = this.getRecipientContact(patient, dto.channel);

        // Prepare variables
        const variables = await this.prepareVariables(patient, dto.variables || {}, context);

        // Render content
        const content = this.templateRenderer.render(template.content, variables);
        const subject = template.subject
          ? this.templateRenderer.render(template.subject, variables)
          : undefined;

        // Check rate limits
        await this.checkRateLimits(patient.id, dto.channel, context.tenantId);

        // Create notification record
        const notification = await this.createNotificationRecord({
          tenantId: context.tenantId,
          clinicId: context.clinicId,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          recipientContact,
          channel: dto.channel,
          templateId: dto.templateId,
          subject,
          content,
          type: template.type || 'marketing_campaign',
          campaignId: dto.campaignId,
          sentBy: context.userId,
          sentByName: context.userName,
          queuedAt: dto.sendAt ? new Date(dto.sendAt) : new Date(),
        });

        results.push(notification.id);
        totalCost += this.estimateCost(content, dto.channel);

        // Send immediately if no schedule
        if (!dto.sendAt) {
          await this.sendNotificationNow(notification);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to create notification for patient ${patient.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        failures.push({
          patientId: patient.id,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Emit event
    this.eventEmitter.emit('notification.bulk.queued', {
      campaignId: dto.campaignId,
      notificationCount: results.length,
      failureCount: failures.length,
      channel: dto.channel,
      tenantId: context.tenantId,
      timestamp: new Date().toISOString(),
    });

    return {
      notificationsCreated: results.length,
      notificationIds: results,
      failedCount: failures.length,
      failures: failures.length > 0 ? failures : undefined,
      totalEstimatedCost: totalCost,
    };
  }

  /**
   * Send quick SMS
   */
  async sendQuickSms(
    patientId: string,
    dto: QuickSmsDto,
    context: TenantContext,
  ): Promise<NotificationResponseDto> {
    const patient = await this.getPatientInfo(patientId, context.tenantId);

    await this.checkConsent(patient, NotificationChannel.SMS, 'custom_message');

    const recipientPhone = dto.phoneNumber || patient.primaryPhone;
    if (!recipientPhone) {
      throw new BadRequestException('Patient has no phone number');
    }

    await this.checkRateLimits(patientId, NotificationChannel.SMS, context.tenantId);
    this.checkQuietHours();

    const notification = await this.createNotificationRecord({
      tenantId: context.tenantId,
      clinicId: context.clinicId,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      recipientContact: recipientPhone,
      channel: NotificationChannel.SMS,
      content: dto.message,
      type: 'custom_message',
      sentBy: context.userId,
      sentByName: context.userName,
      queuedAt: new Date(),
    });

    await this.sendNotificationNow(notification);

    return {
      id: notification.id,
      status: notification.status,
      channel: notification.channel,
      queuedAt: notification.queuedAt.toISOString(),
      estimatedCost: this.estimateCost(dto.message, NotificationChannel.SMS),
    };
  }

  /**
   * Send quick WhatsApp message
   */
  async sendQuickWhatsApp(
    patientId: string,
    dto: QuickWhatsAppDto,
    context: TenantContext,
  ): Promise<NotificationResponseDto> {
    const patient = await this.getPatientInfo(patientId, context.tenantId);

    await this.checkConsent(patient, NotificationChannel.WHATSAPP, 'custom_message');

    const recipientPhone = dto.phoneNumber || patient.primaryPhone;
    if (!recipientPhone) {
      throw new BadRequestException('Patient has no phone number');
    }

    if (!patient.canWhatsApp) {
      throw new BadRequestException('Patient phone does not support WhatsApp');
    }

    await this.checkRateLimits(patientId, NotificationChannel.WHATSAPP, context.tenantId);
    this.checkQuietHours();

    const notification = await this.createNotificationRecord({
      tenantId: context.tenantId,
      clinicId: context.clinicId,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      recipientContact: recipientPhone,
      channel: NotificationChannel.WHATSAPP,
      content: dto.message,
      type: 'custom_message',
      sentBy: context.userId,
      sentByName: context.userName,
      queuedAt: new Date(),
    });

    await this.sendNotificationNow(notification);

    return {
      id: notification.id,
      status: notification.status,
      channel: notification.channel,
      queuedAt: notification.queuedAt.toISOString(),
      estimatedCost: this.estimateCost(dto.message, NotificationChannel.WHATSAPP),
    };
  }

  /**
   * Send quick email
   */
  async sendQuickEmail(
    patientId: string,
    dto: QuickEmailDto,
    context: TenantContext,
  ): Promise<NotificationResponseDto> {
    const patient = await this.getPatientInfo(patientId, context.tenantId);

    await this.checkConsent(patient, NotificationChannel.EMAIL, 'custom_message');

    const recipientEmail = dto.emailAddress || patient.primaryEmail;
    if (!recipientEmail) {
      throw new BadRequestException('Patient has no email address');
    }

    await this.checkRateLimits(patientId, NotificationChannel.EMAIL, context.tenantId);

    const notification = await this.createNotificationRecord({
      tenantId: context.tenantId,
      clinicId: context.clinicId,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      recipientContact: recipientEmail,
      channel: NotificationChannel.EMAIL,
      subject: dto.subject,
      content: dto.body,
      type: 'custom_message',
      sentBy: context.userId,
      sentByName: context.userName,
      queuedAt: new Date(),
    });

    await this.sendNotificationNow(notification);

    return {
      id: notification.id,
      status: notification.status,
      channel: notification.channel,
      queuedAt: notification.queuedAt.toISOString(),
      estimatedCost: 0, // Email typically free
    };
  }

  /**
   * Preview notification before sending
   */
  async previewNotification(
    dto: PreviewNotificationDto,
    context: TenantContext,
  ): Promise<PreviewNotificationResponseDto> {
    const patient = await this.getPatientInfo(dto.patientId, context.tenantId);
    const template = await this.getTemplate(dto.templateId, context.tenantId);

    const variables = await this.prepareVariables(patient, dto.variables || {}, context);

    const content = this.templateRenderer.render(template.content, variables);
    const subject = template.subject
      ? this.templateRenderer.render(template.subject, variables)
      : undefined;

    const characterCount = content.length;
    const smsSegments = template.channel === 'sms' ? Math.ceil(characterCount / 160) : undefined;
    const estimatedCost = this.estimateCost(content, template.channel);

    return {
      content,
      subject,
      channel: template.channel,
      characterCount,
      smsSegments,
      estimatedCost,
      variables,
    };
  }

  /**
   * Get notification history for a patient
   */
  async getPatientNotifications(
    patientId: string,
    tenantId: string,
    limit = 50,
    offset = 0,
  ): Promise<PatientNotification[]> {
    return this.notificationModel
      .find({ tenantId, patientId })
      .sort({ queuedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(
    notificationId: string,
    tenantId: string,
  ): Promise<PatientNotification> {
    const notification = await this.notificationModel
      .findOne({ id: notificationId, tenantId })
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  /**
   * Get all notifications with filters
   */
  async getNotifications(
    tenantId: string,
    filters: {
      channel?: string;
      status?: string;
      type?: string;
      patientId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 50,
    offset = 0,
  ): Promise<{ notifications: PatientNotification[]; total: number }> {
    const query: any = { tenantId };

    if (filters.channel) query.channel = filters.channel;
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.patientId) query.patientId = filters.patientId;

    if (filters.startDate || filters.endDate) {
      query.queuedAt = {};
      if (filters.startDate) query.queuedAt.$gte = filters.startDate;
      if (filters.endDate) query.queuedAt.$lte = filters.endDate;
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel.find(query).sort({ queuedAt: -1 }).skip(offset).limit(limit).exec(),
      this.notificationModel.countDocuments(query).exec(),
    ]);

    return { notifications, total };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Create notification record in database
   */
  private async createNotificationRecord(data: {
    tenantId: string;
    clinicId?: string;
    patientId: string;
    patientName: string;
    recipientContact: string;
    channel: string;
    templateId?: string;
    subject?: string;
    content: string;
    type: string;
    appointmentId?: string;
    invoiceId?: string;
    treatmentPlanId?: string;
    campaignId?: string;
    sentBy: string;
    sentByName: string;
    queuedAt: Date;
  }): Promise<PatientNotification> {
    const notification = new this.notificationModel({
      id: uuidv4(),
      ...data,
      status: 'queued',
    });

    return notification.save();
  }

  /**
   * Send notification immediately
   */
  private async sendNotificationNow(notification: PatientNotification): Promise<void> {
    try {
      notification.status = 'sending';
      await notification.save();

      let result: any;

      switch (notification.channel) {
        case 'sms':
          result = await this.smsService.sendSms(
            notification.recipientContact,
            notification.content,
            { correlationId: notification.id },
          );
          break;

        case 'whatsapp':
          result = await this.whatsAppService.sendMessage(
            notification.recipientContact,
            notification.content,
          );
          break;

        case 'email':
          // TODO: Implement email service
          this.logger.warn('Email sending not yet implemented');
          result = { success: false, error: 'Not implemented' };
          break;

        default:
          throw new Error(`Unsupported channel: ${notification.channel}`);
      }

      if (result.success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        notification.externalId = result.messageId;
        notification.provider = 'twilio';
        notification.cost = result.cost;
        notification.currency = result.currency;

        this.eventEmitter.emit('notification.sent', {
          notificationId: notification.id,
          patientId: notification.patientId,
          channel: notification.channel,
          externalId: result.messageId,
          tenantId: notification.tenantId,
          timestamp: new Date().toISOString(),
        });
      } else {
        notification.status = 'failed';
        notification.errorCode = result.errorCode;
        notification.errorMessage = result.error;

        this.eventEmitter.emit('notification.failed', {
          notificationId: notification.id,
          patientId: notification.patientId,
          channel: notification.channel,
          errorCode: result.errorCode,
          errorMessage: result.error,
          tenantId: notification.tenantId,
          timestamp: new Date().toISOString(),
        });
      }

      await notification.save();
    } catch (error) {
      this.logger.error(`Failed to send notification ${notification.id}:`, error);
      notification.status = 'failed';
      notification.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await notification.save();
    }
  }

  /**
   * Check GDPR consent before sending
   */
  private async checkConsent(
    patient: PatientInfo,
    channel: NotificationChannel,
    type: string,
  ): Promise<void> {
    // Check channel-specific permissions
    if (channel === NotificationChannel.SMS && patient.canSms === false) {
      throw new BadRequestException('Patient has opted out of SMS notifications');
    }

    if (channel === NotificationChannel.WHATSAPP && patient.canWhatsApp === false) {
      throw new BadRequestException('Patient has opted out of WhatsApp notifications');
    }

    if (channel === NotificationChannel.EMAIL && patient.canEmail === false) {
      throw new BadRequestException('Patient has opted out of email notifications');
    }

    // Check marketing consent for marketing messages
    const marketingTypes = ['marketing_campaign', 'birthday_greeting', 'feedback_request'];
    if (marketingTypes.includes(type) && patient.marketingConsent) {
      const hasMarketingConsent =
        (channel === NotificationChannel.SMS && patient.marketingConsent.sms) ||
        (channel === NotificationChannel.WHATSAPP && patient.marketingConsent.whatsapp) ||
        (channel === NotificationChannel.EMAIL && patient.marketingConsent.email);

      if (!hasMarketingConsent) {
        throw new BadRequestException(
          `Patient has not consented to marketing messages via ${channel}`,
        );
      }
    }
  }

  /**
   * Check rate limits
   */
  private async checkRateLimits(
    patientId: string,
    channel: NotificationChannel,
    tenantId: string,
  ): Promise<void> {
    const limits = this.RATE_LIMITS[channel];
    const now = new Date();

    // Check daily limit
    const dailyCount = await this.notificationModel.countDocuments({
      tenantId,
      patientId,
      channel,
      queuedAt: {
        $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
    });

    if (dailyCount >= limits.daily) {
      throw new BadRequestException(
        `Daily ${channel} limit exceeded for this patient (${limits.daily} messages/day)`,
      );
    }

    // Check weekly limit
    const weeklyCount = await this.notificationModel.countDocuments({
      tenantId,
      patientId,
      channel,
      queuedAt: {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    if (weeklyCount >= limits.weekly) {
      throw new BadRequestException(
        `Weekly ${channel} limit exceeded for this patient (${limits.weekly} messages/week)`,
      );
    }
  }

  /**
   * Check quiet hours
   */
  private checkQuietHours(): void {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= this.QUIET_HOURS.start || hour < this.QUIET_HOURS.end) {
      this.logger.warn(
        `Sending notification during quiet hours (${hour}:00). Consider scheduling for later.`,
      );
      // Note: We log a warning but don't block. Some urgent messages may need to go through.
      // In production, you might want to throw an exception or auto-schedule for next available time.
    }
  }

  /**
   * Get patient information (mock - replace with actual patient service)
   */
  private async getPatientInfo(patientId: string, _tenantId: string): Promise<PatientInfo> {
    // TODO: Replace with actual patient service call
    // For now, return mock data
    this.logger.warn(`Using mock patient data for ${patientId}`);

    return {
      id: patientId,
      firstName: 'Ion',
      lastName: 'Popescu',
      primaryPhone: '+40721234567',
      primaryEmail: 'ion.popescu@example.com',
      canSms: true,
      canWhatsApp: true,
      canEmail: true,
      marketingConsent: {
        sms: true,
        whatsapp: true,
        email: true,
      },
    };
  }

  /**
   * Get template by ID
   */
  private async getTemplate(templateId: string, tenantId: string): Promise<MessageTemplate> {
    const template = await this.templateModel
      .findOne({ id: templateId, tenantId, isActive: true })
      .exec();

    if (!template) {
      throw new NotFoundException('Template not found or inactive');
    }

    return template;
  }

  /**
   * Get recipient contact based on channel
   */
  private getRecipientContact(patient: PatientInfo, channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannel.SMS:
      case NotificationChannel.WHATSAPP:
        if (!patient.primaryPhone) {
          throw new BadRequestException('Patient has no phone number');
        }
        return patient.primaryPhone;

      case NotificationChannel.EMAIL:
        if (!patient.primaryEmail) {
          throw new BadRequestException('Patient has no email address');
        }
        return patient.primaryEmail;

      default:
        throw new BadRequestException(`Unsupported channel: ${channel}`);
    }
  }

  /**
   * Prepare template variables
   */
  private async prepareVariables(
    patient: PatientInfo,
    customVars: Record<string, string>,
    _context: TenantContext,
  ): Promise<Record<string, string>> {
    // Start with custom variables
    const variables = { ...customVars };

    // Add patient variables if not already provided
    if (!variables.patientName) {
      variables.patientName = `${patient.firstName} ${patient.lastName}`;
    }
    if (!variables.firstName) variables.firstName = patient.firstName;
    if (!variables.lastName) variables.lastName = patient.lastName;

    // Add clinic variables (TODO: fetch from clinic service)
    if (!variables.clinicName) variables.clinicName = 'Dental Clinic Excellence';
    if (!variables.clinicPhone) variables.clinicPhone = '+40211234567';
    if (!variables.clinicEmail) variables.clinicEmail = 'contact@dentalclinic.ro';
    if (!variables.clinicAddress) variables.clinicAddress = 'Str. Exemplu Nr. 1, Bucuresti';

    return variables;
  }

  /**
   * Infer notification type from DTO
   */
  private inferNotificationType(dto: SendNotificationDto): string {
    if (dto.appointmentId) return 'appointment_reminder';
    if (dto.invoiceId) return 'invoice_issued';
    if (dto.treatmentPlanId) return 'treatment_plan_ready';
    return 'custom_message';
  }

  /**
   * Estimate cost based on content and channel
   */
  private estimateCost(content: string, channel: string): number {
    switch (channel) {
      case 'sms':
        // 5 bani per SMS segment (160 chars)
        const segments = Math.ceil(content.length / 160);
        return segments * 5;

      case 'whatsapp':
        // 6 bani per WhatsApp message
        return 6;

      case 'email':
        // Email is typically free
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Get patients by IDs (mock - replace with actual patient service)
   */
  private async getPatientsByIds(patientIds: string[], _tenantId: string): Promise<PatientInfo[]> {
    // TODO: Replace with actual patient service call
    this.logger.warn(`Using mock patient data for ${patientIds.length} patients`);

    return patientIds.map((id) => ({
      id,
      firstName: 'Patient',
      lastName: id.substring(0, 8),
      primaryPhone: '+40721234567',
      primaryEmail: `patient-${id}@example.com`,
      canSms: true,
      canWhatsApp: true,
      canEmail: true,
      marketingConsent: {
        sms: true,
        whatsapp: true,
        email: true,
      },
    }));
  }

  /**
   * Get patients by filter (mock - replace with actual patient service)
   */
  private async getPatientsByFilter(_filter: any, _tenantId: string): Promise<PatientInfo[]> {
    // TODO: Replace with actual patient service call
    this.logger.warn(`Using mock patient filter results`);

    // Return mock patients
    return [
      {
        id: 'patient-1',
        firstName: 'Ion',
        lastName: 'Popescu',
        primaryPhone: '+40721111111',
        primaryEmail: 'ion@example.com',
        canSms: true,
        canWhatsApp: true,
        canEmail: true,
        marketingConsent: { sms: true, whatsapp: true, email: true },
      },
      {
        id: 'patient-2',
        firstName: 'Maria',
        lastName: 'Ionescu',
        primaryPhone: '+40722222222',
        primaryEmail: 'maria@example.com',
        canSms: true,
        canWhatsApp: true,
        canEmail: true,
        marketingConsent: { sms: true, whatsapp: true, email: true },
      },
    ];
  }
}
