import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { AvailabilityService } from '../../availability/availability.service';
import {
  AppointmentStatus,
  StatusTransitionEntry,
  AppointmentDocument,
} from '../entities/appointment.schema';
import {
  AppointmentStatusStateMachine,
  TransitionAction,
} from '../state-machine/appointment-status.state-machine';
import {
  ConfirmAppointmentDto,
  CheckInAppointmentDto,
  StartAppointmentDto,
  CompleteAppointmentDto,
  CancelAppointmentWithTypeDto,
  NoShowAppointmentDto,
  RescheduleAppointmentDto,
  AppointmentResponseDto,
} from '../dto';
import { ValidationError } from '@dentalos/shared-errors';
import {
  AppointmentConfirmed,
  AppointmentCheckedIn,
  AppointmentStarted,
  AppointmentCompleted,
  AppointmentCancelled,
  AppointmentNoShow,
  AppointmentRescheduled,
} from '@dentalos/shared-events';
import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';

/**
 * Context for a status transition operation
 */
export interface TransitionContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId: string;
  correlationId?: string;
}

/**
 * Status Transition Service
 *
 * Handles all appointment status transitions with:
 * - State machine validation
 * - Event publishing
 * - Audit trail logging
 * - Conflict detection
 */
@Injectable()
export class StatusTransitionService {
  private readonly logger = new Logger(StatusTransitionService.name);

  constructor(
    private readonly repository: AppointmentsRepository,
    private readonly availabilityService: AvailabilityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Confirm an appointment
   */
  async confirm(
    appointmentId: string,
    dto: ConfirmAppointmentDto,
    context: TransitionContext,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Confirming appointment', { appointmentId, ...context });

    const appointment = await this.repository.findByIdOrFail(appointmentId, context.tenantId);
    this.validateTransition(appointment, 'confirm');

    const now = new Date();
    const transitionEntry = this.createTransitionEntry(
      appointment.status,
      AppointmentStatus.CONFIRMED,
      'confirm',
      context.userId,
      undefined,
      { confirmationMethod: dto.confirmationMethod },
    );

    const updatedAppointment = await this.repository.update(appointmentId, context.tenantId, {
      status: AppointmentStatus.CONFIRMED,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        confirmedBy: context.userId,
        confirmedAt: now,
        confirmationMethod: dto.confirmationMethod,
      },
      statusHistory: [...(appointment.statusHistory || []), transitionEntry],
    });

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.confirmed',
      new AppointmentConfirmed({
        aggregateId: appointmentId as UUID,
        appointmentId: appointmentId as UUID,
        patientId: appointment.patientId as UUID,
        providerId: appointment.providerId as UUID,
        scheduledAt: appointment.start.toISOString() as ISODateString,
        organizationId: context.organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        confirmedBy: context.userId as UUID,
        confirmationMethod: dto.confirmationMethod,
      }),
    );

    this.logger.log('Appointment confirmed', { appointmentId, ...context });
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Check in patient for appointment
   */
  async checkIn(
    appointmentId: string,
    dto: CheckInAppointmentDto,
    context: TransitionContext,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Checking in patient', { appointmentId, ...context });

    const appointment = await this.repository.findByIdOrFail(appointmentId, context.tenantId);
    this.validateTransition(appointment, 'check_in');

    const now = new Date();
    const scheduledTime = new Date(appointment.start);
    const waitTimeMinutes = Math.max(
      0,
      Math.round((scheduledTime.getTime() - now.getTime()) / 60000),
    );

    const transitionEntry = this.createTransitionEntry(
      appointment.status,
      AppointmentStatus.CHECKED_IN,
      'check_in',
      context.userId,
      dto.notes,
      { waitTimeMinutes },
    );

    const updatedAppointment = await this.repository.update(appointmentId, context.tenantId, {
      status: AppointmentStatus.CHECKED_IN,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        checkedInBy: context.userId,
        checkedInAt: now,
        notes: dto.notes || appointment.bookingMetadata?.notes,
      },
      statusHistory: [...(appointment.statusHistory || []), transitionEntry],
    });

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.checked_in',
      new AppointmentCheckedIn({
        aggregateId: appointmentId as UUID,
        appointmentId: appointmentId as UUID,
        patientId: appointment.patientId as UUID,
        providerId: appointment.providerId as UUID,
        scheduledAt: appointment.start.toISOString() as ISODateString,
        checkedInAt: now.toISOString() as ISODateString,
        organizationId: context.organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        checkedInBy: context.userId as UUID,
        waitTimeMinutes: Math.abs(waitTimeMinutes),
      }),
    );

    this.logger.log('Patient checked in', { appointmentId, waitTimeMinutes, ...context });
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Start an appointment (patient called to treatment room)
   */
  async start(
    appointmentId: string,
    dto: StartAppointmentDto,
    context: TransitionContext,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Starting appointment', { appointmentId, ...context });

    const appointment = await this.repository.findByIdOrFail(appointmentId, context.tenantId);
    this.validateTransition(appointment, 'start');

    const now = new Date();
    const checkedInAt = appointment.bookingMetadata?.checkedInAt;
    const actualWaitMinutes = checkedInAt
      ? Math.round((now.getTime() - new Date(checkedInAt).getTime()) / 60000)
      : 0;

    const transitionEntry = this.createTransitionEntry(
      appointment.status,
      AppointmentStatus.IN_PROGRESS,
      'start',
      context.userId,
      dto.notes,
      { actualWaitMinutes, chairId: dto.chairId },
    );

    const updatedAppointment = await this.repository.update(appointmentId, context.tenantId, {
      status: AppointmentStatus.IN_PROGRESS,
      chairId: dto.chairId || appointment.chairId,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        startedBy: context.userId,
        startedAt: now,
      },
      statusHistory: [...(appointment.statusHistory || []), transitionEntry],
    });

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.started',
      new AppointmentStarted({
        aggregateId: appointmentId as UUID,
        appointmentId: appointmentId as UUID,
        patientId: appointment.patientId as UUID,
        providerId: appointment.providerId as UUID,
        scheduledAt: appointment.start.toISOString() as ISODateString,
        startedAt: now.toISOString() as ISODateString,
        organizationId: context.organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        startedBy: context.userId as UUID,
        chairId: dto.chairId || appointment.chairId,
        actualWaitMinutes,
      }),
    );

    this.logger.log('Appointment started', { appointmentId, actualWaitMinutes, ...context });
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Complete an appointment
   */
  async complete(
    appointmentId: string,
    dto: CompleteAppointmentDto,
    context: TransitionContext,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Completing appointment', { appointmentId, ...context });

    const appointment = await this.repository.findByIdOrFail(appointmentId, context.tenantId);
    this.validateTransition(appointment, 'complete');

    const now = new Date();
    const startedAt = appointment.bookingMetadata?.startedAt;
    const actualDurationMinutes = startedAt
      ? Math.round((now.getTime() - new Date(startedAt).getTime()) / 60000)
      : Math.round((appointment.end.getTime() - appointment.start.getTime()) / 60000);

    const transitionEntry = this.createTransitionEntry(
      appointment.status,
      AppointmentStatus.COMPLETED,
      'complete',
      context.userId,
      dto.notes,
      { actualDurationMinutes, proceduresConducted: dto.proceduresConducted },
    );

    const updatedAppointment = await this.repository.update(appointmentId, context.tenantId, {
      status: AppointmentStatus.COMPLETED,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        completedBy: context.userId,
        completedAt: now,
        completionNotes: dto.notes,
        proceduresConducted: dto.proceduresConducted,
      },
      statusHistory: [...(appointment.statusHistory || []), transitionEntry],
    });

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.completed',
      new AppointmentCompleted({
        aggregateId: appointmentId as UUID,
        appointmentId: appointmentId as UUID,
        patientId: appointment.patientId as UUID,
        providerId: appointment.providerId as UUID,
        scheduledAt: appointment.start.toISOString() as ISODateString,
        completedAt: now.toISOString() as ISODateString,
        organizationId: context.organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        completedBy: context.userId as UUID,
        serviceCode: appointment.serviceCode,
        actualDurationMinutes,
        notes: dto.notes,
      }),
    );

    this.logger.log('Appointment completed', { appointmentId, actualDurationMinutes, ...context });
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Cancel an appointment
   */
  async cancel(
    appointmentId: string,
    dto: CancelAppointmentWithTypeDto,
    context: TransitionContext,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Cancelling appointment', {
      appointmentId,
      cancellationType: dto.cancellationType,
      ...context,
    });

    const appointment = await this.repository.findByIdOrFail(appointmentId, context.tenantId);
    this.validateTransition(appointment, 'cancel');

    const now = new Date();

    // Check if this is a late cancellation (within 24 hours by default)
    const hoursUntilAppointment = (appointment.start.getTime() - now.getTime()) / (1000 * 60 * 60);
    const lateCancellation = dto.lateCancellation ?? hoursUntilAppointment < 24;

    const transitionEntry = this.createTransitionEntry(
      appointment.status,
      AppointmentStatus.CANCELLED,
      'cancel',
      context.userId,
      dto.reason,
      { cancellationType: dto.cancellationType, lateCancellation },
    );

    const updatedAppointment = await this.repository.update(appointmentId, context.tenantId, {
      status: AppointmentStatus.CANCELLED,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        cancellationReason: dto.reason,
        cancelledBy: context.userId,
        cancelledAt: now,
        cancellationType: dto.cancellationType,
        lateCancellation,
      },
      statusHistory: [...(appointment.statusHistory || []), transitionEntry],
    });

    // Invalidate availability cache
    await this.availabilityService.invalidateCache(
      context.tenantId,
      appointment.providerId,
      appointment.start,
    );

    // Map cancellation type for event
    const eventCancellationType =
      dto.cancellationType === 'clinic' ? 'system' : dto.cancellationType;

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.cancelled',
      new AppointmentCancelled({
        aggregateId: appointmentId as UUID,
        appointmentId: appointmentId as UUID,
        patientId: appointment.patientId as UUID,
        providerId: appointment.providerId as UUID,
        scheduledAt: appointment.start.toISOString() as ISODateString,
        organizationId: context.organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        cancelledBy: context.userId as UUID,
        reason: dto.reason,
        cancellationType: eventCancellationType as 'patient' | 'provider' | 'system' | 'no_show',
      }),
    );

    this.logger.log('Appointment cancelled', {
      appointmentId,
      cancellationType: dto.cancellationType,
      lateCancellation,
      ...context,
    });
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(
    appointmentId: string,
    dto: NoShowAppointmentDto,
    context: TransitionContext,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Marking no-show', { appointmentId, ...context });

    const appointment = await this.repository.findByIdOrFail(appointmentId, context.tenantId);
    this.validateTransition(appointment, 'no_show');

    const now = new Date();

    // Get patient's no-show count for the event
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const noShowCount = await this.repository.getPatientNoShowCount(
      context.tenantId,
      appointment.patientId,
      sixMonthsAgo,
    );

    const transitionEntry = this.createTransitionEntry(
      appointment.status,
      AppointmentStatus.NO_SHOW,
      'no_show',
      context.userId,
      dto.reason,
      { attemptedContact: dto.attemptedContact, contactAttempts: dto.contactAttempts },
    );

    const updatedAppointment = await this.repository.update(appointmentId, context.tenantId, {
      status: AppointmentStatus.NO_SHOW,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        noShowReason: dto.reason,
        noShowMarkedBy: context.userId,
        noShowMarkedAt: now,
        contactAttempts: dto.contactAttempts,
      },
      statusHistory: [...(appointment.statusHistory || []), transitionEntry],
    });

    // Invalidate availability cache
    await this.availabilityService.invalidateCache(
      context.tenantId,
      appointment.providerId,
      appointment.start,
    );

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.no_show',
      new AppointmentNoShow({
        aggregateId: appointmentId as UUID,
        appointmentId: appointmentId as UUID,
        patientId: appointment.patientId as UUID,
        providerId: appointment.providerId as UUID,
        scheduledAt: appointment.start.toISOString() as ISODateString,
        markedAt: now.toISOString() as ISODateString,
        organizationId: context.organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        markedBy: context.userId as UUID,
        reason: dto.reason,
        patientNoShowCount: noShowCount + 1,
      }),
    );

    this.logger.log('Appointment marked as no-show', {
      appointmentId,
      noShowCount: noShowCount + 1,
      ...context,
    });
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Reschedule an appointment to a new time
   */
  async reschedule(
    appointmentId: string,
    dto: RescheduleAppointmentDto,
    context: TransitionContext,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Rescheduling appointment', { appointmentId, ...context });

    const appointment = await this.repository.findByIdOrFail(appointmentId, context.tenantId);
    this.validateTransition(appointment, 'reschedule');

    const now = new Date();
    const oldStart = appointment.start;
    const oldEnd = appointment.end;
    const oldProviderId = appointment.providerId;
    const newProviderId = dto.providerId || appointment.providerId;

    // Check for conflicts at new time (excluding this appointment)
    const conflicts = await this.repository.findConflicts(
      context.tenantId,
      newProviderId,
      dto.start,
      dto.end,
      appointmentId,
    );

    if (conflicts.length > 0 && !appointment.allowOverbooking) {
      throw new ValidationError('Provider has conflicting appointments at the requested time', {
        field: 'start',
        value: dto.start.toISOString(),
        errors: [
          {
            field: 'start',
            message: 'Time slot conflicts with existing appointment',
            value: conflicts[0].id,
          },
        ],
      });
    }

    // Check for chair conflicts if specified
    if (dto.chairId) {
      const chairConflicts = await this.repository.findChairConflicts(
        context.tenantId,
        dto.chairId,
        dto.start,
        dto.end,
        appointmentId,
      );

      if (chairConflicts.length > 0) {
        throw new ValidationError('Chair is already booked at the requested time', {
          field: 'chairId',
          value: dto.chairId,
        });
      }
    }

    const rescheduleCount = (appointment.bookingMetadata?.rescheduleCount || 0) + 1;
    const duration = Math.round((dto.end.getTime() - dto.start.getTime()) / 60000);

    const transitionEntry = this.createTransitionEntry(
      appointment.status,
      AppointmentStatus.SCHEDULED,
      'reschedule',
      context.userId,
      dto.reason,
      {
        previousStart: oldStart.toISOString(),
        previousEnd: oldEnd.toISOString(),
        newStart: dto.start.toISOString(),
        newEnd: dto.end.toISOString(),
        rescheduleCount,
      },
    );

    const updatedAppointment = await this.repository.update(appointmentId, context.tenantId, {
      start: dto.start,
      end: dto.end,
      providerId: newProviderId,
      chairId: dto.chairId || appointment.chairId,
      status: AppointmentStatus.SCHEDULED, // Reset to scheduled on reschedule
      bookingMetadata: {
        ...appointment.bookingMetadata,
        rescheduledFrom: `${oldStart.toISOString()} - ${oldEnd.toISOString()}`,
        rescheduledTo: `${dto.start.toISOString()} - ${dto.end.toISOString()}`,
        rescheduledBy: context.userId,
        rescheduledAt: now,
        rescheduleReason: dto.reason,
        rescheduleCount,
        // Clear confirmation and check-in status on reschedule
        confirmedBy: undefined,
        confirmedAt: undefined,
        confirmationMethod: undefined,
        checkedInBy: undefined,
        checkedInAt: undefined,
      },
      statusHistory: [...(appointment.statusHistory || []), transitionEntry],
    });

    // Invalidate cache for old and new times/providers
    await this.availabilityService.invalidateCache(context.tenantId, oldProviderId, oldStart);
    if (newProviderId !== oldProviderId || dto.start.getDate() !== oldStart.getDate()) {
      await this.availabilityService.invalidateCache(context.tenantId, newProviderId, dto.start);
    }

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.rescheduled',
      new AppointmentRescheduled({
        aggregateId: appointmentId as UUID,
        appointmentId: appointmentId as UUID,
        patientId: appointment.patientId as UUID,
        providerId: newProviderId as UUID,
        previousScheduledAt: oldStart.toISOString() as ISODateString,
        newScheduledAt: dto.start.toISOString() as ISODateString,
        duration,
        organizationId: context.organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        rescheduledBy: context.userId as UUID,
        reason: dto.reason,
      }),
    );

    this.logger.log('Appointment rescheduled', {
      appointmentId,
      rescheduleCount,
      previousTime: oldStart.toISOString(),
      newTime: dto.start.toISOString(),
      ...context,
    });
    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Get the status transition history for an appointment
   */
  async getStatusHistory(
    appointmentId: string,
    tenantId: string,
  ): Promise<StatusTransitionEntry[]> {
    const appointment = await this.repository.findByIdOrFail(appointmentId, tenantId);
    return appointment.statusHistory || [];
  }

  /**
   * Validate that a transition is allowed
   */
  private validateTransition(appointment: AppointmentDocument, action: TransitionAction): void {
    const result = AppointmentStatusStateMachine.validateTransition(appointment.status, action);

    if (!result.isValid) {
      const allowedActions = AppointmentStatusStateMachine.getAllowedActions(appointment.status);
      throw new ValidationError(result.errorMessage || 'Invalid status transition', {
        field: 'status',
        value: appointment.status,
        errors: [
          {
            field: 'action',
            message: `Cannot perform '${action}' from status '${appointment.status}'`,
            value: { allowedActions },
          },
        ],
      });
    }
  }

  /**
   * Create a status transition history entry
   */
  private createTransitionEntry(
    fromStatus: AppointmentStatus,
    toStatus: AppointmentStatus,
    action: string,
    userId: string,
    reason?: string,
    metadata?: Record<string, unknown>,
  ): StatusTransitionEntry {
    return {
      fromStatus,
      toStatus,
      action,
      timestamp: new Date().toISOString(),
      userId,
      reason,
      metadata,
    };
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(appointment: AppointmentDocument): AppointmentResponseDto {
    return {
      id: appointment.id,
      tenantId: appointment.tenantId,
      organizationId: appointment.organizationId,
      locationId: appointment.locationId,
      patientId: appointment.patientId,
      providerId: appointment.providerId,
      chairId: appointment.chairId,
      serviceCode: appointment.serviceCode,
      start: appointment.start,
      end: appointment.end,
      status: appointment.status,
      riskScore: appointment.riskScore,
      bookingMetadata: appointment.bookingMetadata,
      createdAt: appointment.createdAt || new Date(),
      updatedAt: appointment.updatedAt || new Date(),
    };
  }
}
