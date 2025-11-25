/**
 * Procedure Completed Event Handler (Scheduling Service)
 *
 * Listens to procedure.completed events from Clinical Service and updates
 * appointment records to link procedures to appointments. Enables tracking:
 * - Which procedures happened during this appointment?
 * - Has the appointment been clinically completed?
 * - Appointment status transition to COMPLETED
 *
 * Business Flow:
 * 1. Receive procedure.completed event
 * 2. Find appointment by appointmentId (if present)
 * 3. Add procedureId to appointment.clinicalProcedureIds[]
 * 4. Optionally update appointment status to COMPLETED
 * 5. Enable traceability: appointment → procedures → invoices
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { AppointmentStatus } from '../entities/appointment.schema';
import { ProcedureCompletedEvent, isProcedureCompletedEvent } from '@dentalos/shared-events';

@Injectable()
export class ProcedureCompletedHandler {
  private readonly logger = new Logger(ProcedureCompletedHandler.name);

  constructor(private readonly appointmentsRepository: AppointmentsRepository) {}

  /**
   * Handle procedure.completed event
   * Links completed procedures to appointments
   */
  @OnEvent('procedure.completed', { async: true })
  async handleProcedureCompleted(event: ProcedureCompletedEvent): Promise<void> {
    // Validate event type
    if (!isProcedureCompletedEvent(event)) {
      this.logger.warn('Received invalid procedure.completed event', {
        eventType: (event as any)?.type,
      });
      return;
    }

    const { payload, tenantContext } = event;

    // Only process if procedure has associated appointment
    if (!payload.appointmentId) {
      this.logger.debug('Procedure has no appointmentId - skipping appointment update', {
        procedureId: payload.procedureId,
      });
      return;
    }

    this.logger.log('Processing procedure.completed event for appointment linkage', {
      procedureId: payload.procedureId,
      appointmentId: payload.appointmentId,
      patientId: payload.patientId,
    });

    try {
      // Find appointment
      const appointment = await this.appointmentsRepository.findByIdOrFail(
        payload.appointmentId,
        tenantContext.tenantId,
      );

      // Check if procedure already linked (idempotency)
      const existingProcedures = appointment.clinicalProcedureIds || [];
      if (existingProcedures.includes(payload.procedureId)) {
        this.logger.log('Procedure already linked to appointment - idempotent skip', {
          appointmentId: payload.appointmentId,
          procedureId: payload.procedureId,
        });
        return;
      }

      // Add procedure to appointment's procedure list
      const updatedProcedures = [...existingProcedures, payload.procedureId];

      // Determine if appointment should be marked COMPLETED
      // Logic: If appointment is IN_PROGRESS and procedure is completed, mark appointment COMPLETED
      let newStatus = appointment.status;
      if (
        appointment.status === AppointmentStatus.IN_PROGRESS ||
        appointment.status === AppointmentStatus.CONFIRMED
      ) {
        newStatus = AppointmentStatus.COMPLETED;
      }

      // Update appointment
      await this.appointmentsRepository.update(payload.appointmentId, tenantContext.tenantId, {
        clinicalProcedureIds: updatedProcedures,
        status: newStatus,
      });

      this.logger.log('Appointment updated with procedure linkage', {
        appointmentId: payload.appointmentId,
        procedureId: payload.procedureId,
        procedureCount: updatedProcedures.length,
        previousStatus: appointment.status,
        newStatus,
      });
    } catch (error) {
      this.logger.error('Failed to update appointment with procedure linkage', {
        error,
        procedureId: payload.procedureId,
        appointmentId: payload.appointmentId,
      });
      // Graceful degradation - don't throw
    }
  }
}
