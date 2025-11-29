import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import {
  ReminderJob,
  ReminderJobDocument,
  PatientResponseAction,
} from '../entities/reminder-job.schema';
import { ReminderConfig, ReminderConfigDocument } from '../entities/reminder-config.schema';
import {
  Appointment,
  AppointmentDocument,
  AppointmentStatus,
} from '../../appointments/entities/appointment.schema';

/**
 * Patient Response Handler Service
 *
 * Handles patient replies to appointment reminders.
 * Parses keywords to determine intent (confirm, cancel) and updates appointment accordingly.
 */
@Injectable()
export class PatientResponseHandlerService {
  private readonly logger = new Logger(PatientResponseHandlerService.name);

  constructor(
    @InjectModel(ReminderJob.name)
    private readonly reminderJobModel: Model<ReminderJobDocument>,
    @InjectModel(ReminderConfig.name)
    private readonly reminderConfigModel: Model<ReminderConfigDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Handle patient response from SMS or WhatsApp
   */
  @OnEvent('reminder.patient.response')
  async handlePatientResponse(event: {
    messageId: string;
    from: string;
    to: string;
    body: string;
    channel?: 'sms' | 'whatsapp';
    receivedAt: string;
  }): Promise<void> {
    try {
      this.logger.log(`Received patient response: ${event.body} from ${event.from}`);

      // Find the reminder job by external message ID or phone number
      const job = await this.findReminderJob(event.from, event.to);

      if (!job) {
        this.logger.warn(`No reminder job found for response from ${event.from}`);
        return;
      }

      // Get clinic config for keywords
      const config = await this.reminderConfigModel.findOne({
        tenantId: job.tenantId,
        clinicId: job.clinicId,
      });

      if (!config) {
        this.logger.warn(`No config found for clinic ${job.clinicId}`);
        return;
      }

      // Parse response
      const action = this.parseResponse(event.body, config);

      // Save response to job
      await this.reminderJobModel.updateOne(
        { id: job.id },
        {
          patientResponse: {
            responseText: event.body,
            responseAt: new Date(event.receivedAt),
            action,
          },
        },
      );

      // Handle action
      if (action === 'confirmed') {
        await this.handleConfirmation(job);
      } else if (action === 'cancelled') {
        await this.handleCancellation(job);
      } else {
        this.logger.log(`Unrecognized response action from patient ${job.patientId}`);
        // Could send auto-reply with instructions
      }
    } catch (error) {
      this.logger.error('Error handling patient response:', error);
    }
  }

  /**
   * Parse patient response to determine action
   */
  private parseResponse(
    responseText: string,
    config: ReminderConfigDocument,
  ): PatientResponseAction {
    const normalized = this.normalizeText(responseText);

    // Check confirmation keywords
    for (const keyword of config.confirmationKeywords) {
      if (normalized.includes(this.normalizeText(keyword))) {
        return 'confirmed';
      }
    }

    // Check cancellation keywords
    for (const keyword of config.cancellationKeywords) {
      if (normalized.includes(this.normalizeText(keyword))) {
        return 'cancelled';
      }
    }

    return 'other';
  }

  /**
   * Normalize text for comparison (lowercase, trim, remove diacritics)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  }

  /**
   * Find reminder job by phone number
   */
  private async findReminderJob(
    fromPhone: string,
    _toPhone: string,
  ): Promise<ReminderJobDocument | null> {
    // Remove 'whatsapp:' prefix if present
    const cleanFromPhone = fromPhone.replace(/^whatsapp:/, '');

    // Find most recent sent reminder to this patient
    const job = await this.reminderJobModel
      .findOne({
        recipientPhone: cleanFromPhone,
        status: 'sent',
      })
      .sort({ sentAt: -1 }) // Most recent first
      .exec();

    return job;
  }

  /**
   * Handle appointment confirmation
   */
  private async handleConfirmation(job: ReminderJobDocument): Promise<void> {
    try {
      this.logger.log(`Patient confirmed appointment ${job.appointmentId}`);

      // Update appointment status to confirmed
      const appointment = await this.appointmentModel.findOne({ id: job.appointmentId });

      if (!appointment) {
        this.logger.warn(`Appointment ${job.appointmentId} not found`);
        return;
      }

      if (appointment.status === AppointmentStatus.SCHEDULED) {
        await this.appointmentModel.updateOne(
          { id: job.appointmentId },
          {
            status: AppointmentStatus.CONFIRMED,
            'bookingMetadata.confirmedAt': new Date(),
            'bookingMetadata.confirmationMethod': job.channel === 'sms' ? 'sms' : 'patient_portal',
          },
        );

        // Emit event
        this.eventEmitter.emit('appointment.confirmed', {
          appointmentId: job.appointmentId,
          patientId: job.patientId,
          confirmedVia: job.channel,
          confirmedAt: new Date().toISOString(),
        });

        this.eventEmitter.emit('reminder.patient.confirmed', {
          jobId: job.id,
          appointmentId: job.appointmentId,
          patientId: job.patientId,
          channel: job.channel,
        });

        this.logger.log(`Appointment ${job.appointmentId} confirmed by patient`);
      } else {
        this.logger.warn(
          `Appointment ${job.appointmentId} is in status ${appointment.status}, cannot confirm`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling confirmation:', error);
    }
  }

  /**
   * Handle appointment cancellation
   */
  private async handleCancellation(job: ReminderJobDocument): Promise<void> {
    try {
      this.logger.log(`Patient cancelled appointment ${job.appointmentId}`);

      // Update appointment status to cancelled
      const appointment = await this.appointmentModel.findOne({ id: job.appointmentId });

      if (!appointment) {
        this.logger.warn(`Appointment ${job.appointmentId} not found`);
        return;
      }

      if (
        appointment.status === AppointmentStatus.SCHEDULED ||
        appointment.status === AppointmentStatus.CONFIRMED
      ) {
        await this.appointmentModel.updateOne(
          { id: job.appointmentId },
          {
            status: AppointmentStatus.CANCELLED,
            'bookingMetadata.cancelledAt': new Date(),
            'bookingMetadata.cancelledBy': job.patientId,
            'bookingMetadata.cancellationType': 'patient',
            'bookingMetadata.cancellationReason': 'Cancelled via reminder response',
          },
        );

        // Emit event
        this.eventEmitter.emit('appointment.cancelled', {
          appointmentId: job.appointmentId,
          patientId: job.patientId,
          cancelledBy: job.patientId,
          cancellationType: 'patient',
          reason: 'Cancelled via reminder response',
          cancelledAt: new Date().toISOString(),
        });

        this.eventEmitter.emit('reminder.patient.cancelled', {
          jobId: job.id,
          appointmentId: job.appointmentId,
          patientId: job.patientId,
          channel: job.channel,
        });

        this.logger.log(`Appointment ${job.appointmentId} cancelled by patient`);
      } else {
        this.logger.warn(
          `Appointment ${job.appointmentId} is in status ${appointment.status}, cannot cancel`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling cancellation:', error);
    }
  }

  /*
   * Send auto-reply to patient
   * @private
   * (Commented out until auto-reply feature is implemented)
   *
  private async sendAutoReply(
    recipientPhone: string,
    channel: 'sms' | 'whatsapp',
    message: string,
  ): Promise<void> {
    // TODO: Implement auto-reply logic
    this.logger.log(`Would send auto-reply to ${recipientPhone} via ${channel}: ${message}`);
  }
  */
}
