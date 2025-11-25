import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentsRepository } from '../repositories/appointments.repository';
import { AvailabilityService } from '../../availability/availability.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto,
  QueryAppointmentsDto,
  AppointmentResponseDto,
  AppointmentListResponseDto,
} from '../dto';
import { AppointmentStatus, BookingMetadata } from '../entities/appointment.schema';
import { ConflictError, ValidationError } from '@dentalos/shared-errors';
import {
  AppointmentBooked,
  AppointmentRescheduled,
  AppointmentCancelled,
} from '@dentalos/shared-events';
import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';

/**
 * Appointments Service
 *
 * Implements business logic for appointment management:
 * - Booking with conflict detection
 * - Rescheduling with validation
 * - Cancellation with reason tracking
 * - No-show recording
 * - Risk scoring
 * - Event emission for downstream systems
 */
@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly repository: AppointmentsRepository,
    private readonly availabilityService: AvailabilityService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Book a new appointment
   */
  async bookAppointment(
    tenantId: string,
    organizationId: string,
    dto: CreateAppointmentDto,
    bookedBy: string,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Booking appointment', {
      tenantId,
      patientId: dto.patientId,
      providerId: dto.providerId,
      start: dto.start,
    });

    // Check for conflicts
    await this.validateNoConflicts(tenantId, dto.providerId, dto.start, dto.end);

    // Check for patient double-booking
    await this.validatePatientAvailability(tenantId, dto.patientId, dto.start, dto.end);

    // Calculate risk score
    const riskScore = await this.calculateRiskScore(tenantId, dto.patientId);

    // Prioritize emergency visits
    const status = dto.emergencyVisit ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED;

    const bookingMetadata: BookingMetadata = {
      bookedBy,
      bookedAt: new Date(),
      bookingSource: dto.bookingSource || 'online',
      notes: dto.notes,
      emergencyVisit: dto.emergencyVisit,
    };

    const appointment = await this.repository.create({
      id: uuidv4(),
      tenantId,
      organizationId,
      locationId: dto.locationId,
      patientId: dto.patientId,
      providerId: dto.providerId,
      chairId: dto.chairId,
      serviceCode: dto.serviceCode,
      start: dto.start,
      end: dto.end,
      status,
      riskScore,
      bookingMetadata,
    });

    // Invalidate availability cache
    await this.availabilityService.invalidateCache(tenantId, dto.providerId, dto.start);

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.booked',
      new AppointmentBooked({
        aggregateId: appointment.id as UUID,
        appointmentId: appointment.id as UUID,
        patientId: dto.patientId as UUID,
        providerId: dto.providerId as UUID,
        scheduledAt: dto.start.toISOString() as ISODateString,
        duration: Math.round((dto.end.getTime() - dto.start.getTime()) / 60000), // duration in minutes
        appointmentType: dto.serviceCode,
        organizationId: organizationId as OrganizationId,
        clinicId: dto.locationId as ClinicId,
      }),
    );

    this.logger.log('Appointment booked successfully', {
      appointmentId: appointment.id,
      tenantId,
    });

    return this.toResponseDto(appointment);
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(id: string, tenantId: string): Promise<AppointmentResponseDto> {
    const appointment = await this.repository.findByIdOrFail(id, tenantId);
    return this.toResponseDto(appointment);
  }

  /**
   * List appointments with filters
   */
  async listAppointments(
    tenantId: string,
    query: QueryAppointmentsDto,
  ): Promise<AppointmentListResponseDto> {
    const { data, total } = await this.repository.findMany(tenantId, query);

    const page = query.page || 1;
    const limit = query.limit || 20;
    const hasMore = total > page * limit;

    return {
      data: data.map((apt) => this.toResponseDto(apt)),
      total,
      page,
      limit,
      hasMore,
    };
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    id: string,
    tenantId: string,
    organizationId: string,
    dto: UpdateAppointmentDto,
    rescheduledBy: string,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Rescheduling appointment', { appointmentId: id, tenantId });

    const appointment = await this.repository.findByIdOrFail(id, tenantId);

    // Validate status allows rescheduling
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new ValidationError(
        `Cannot reschedule appointment with status: ${appointment.status}`,
        { field: 'status', value: appointment.status },
      );
    }

    const oldStart = appointment.start;
    const oldEnd = appointment.end;
    const oldProviderId = appointment.providerId;

    // Use new provider if specified, otherwise keep existing
    const newProviderId = dto.providerId || appointment.providerId;

    // Check for conflicts (excluding current appointment)
    await this.validateNoConflicts(tenantId, newProviderId, dto.start, dto.end, id);

    // Update appointment
    const updatedAppointment = await this.repository.update(id, tenantId, {
      start: dto.start,
      end: dto.end,
      providerId: newProviderId,
      chairId: dto.chairId,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        rescheduledFrom: `${oldStart.toISOString()} - ${oldEnd.toISOString()}`,
        notes: dto.notes,
      },
    });

    // Invalidate cache for both old and new dates/providers
    await this.availabilityService.invalidateCache(tenantId, oldProviderId, oldStart);
    if (newProviderId !== oldProviderId || dto.start.getDate() !== oldStart.getDate()) {
      await this.availabilityService.invalidateCache(tenantId, newProviderId, dto.start);
    }

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.rescheduled',
      new AppointmentRescheduled({
        aggregateId: id as UUID,
        appointmentId: id as UUID,
        patientId: appointment.patientId as UUID,
        providerId: newProviderId as UUID,
        previousScheduledAt: oldStart.toISOString() as ISODateString,
        newScheduledAt: dto.start.toISOString() as ISODateString,
        duration: Math.round((dto.end.getTime() - dto.start.getTime()) / 60000),
        organizationId: organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        rescheduledBy: rescheduledBy as UUID,
      }),
    );

    this.logger.log('Appointment rescheduled successfully', { appointmentId: id, tenantId });

    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(
    id: string,
    tenantId: string,
    organizationId: string,
    dto: CancelAppointmentDto,
    cancelledBy: string,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Cancelling appointment', { appointmentId: id, tenantId });

    const appointment = await this.repository.findByIdOrFail(id, tenantId);

    // Validate status allows cancellation
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new ValidationError('Cannot cancel a completed appointment', {
        field: 'status',
        value: appointment.status,
      });
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new ValidationError('Appointment is already cancelled', {
        field: 'status',
        value: appointment.status,
      });
    }

    const updatedAppointment = await this.repository.update(id, tenantId, {
      status: AppointmentStatus.CANCELLED,
      bookingMetadata: {
        ...appointment.bookingMetadata,
        cancellationReason: dto.reason,
        cancelledBy,
        cancelledAt: new Date(),
      },
    });

    // Invalidate availability cache
    await this.availabilityService.invalidateCache(
      tenantId,
      appointment.providerId,
      appointment.start,
    );

    // Emit domain event
    this.eventEmitter.emit(
      'appointment.cancelled',
      new AppointmentCancelled({
        aggregateId: id as UUID,
        appointmentId: id as UUID,
        patientId: appointment.patientId as UUID,
        providerId: appointment.providerId as UUID,
        scheduledAt: appointment.start.toISOString() as ISODateString,
        organizationId: organizationId as OrganizationId,
        clinicId: appointment.locationId as ClinicId,
        cancelledBy: cancelledBy as UUID,
        reason: dto.reason,
        cancellationType: 'patient',
      }),
    );

    this.logger.log('Appointment cancelled successfully', { appointmentId: id, tenantId });

    return this.toResponseDto(updatedAppointment);
  }

  /**
   * Record a no-show
   */
  async recordNoShow(
    id: string,
    tenantId: string,
    reason?: string,
  ): Promise<AppointmentResponseDto> {
    this.logger.log('Recording no-show', { appointmentId: id, tenantId });

    const appointment = await this.repository.update(id, tenantId, {
      status: AppointmentStatus.NO_SHOW,
      bookingMetadata: {
        ...(await this.repository.findByIdOrFail(id, tenantId)).bookingMetadata,
        noShowReason: reason,
      },
    });

    return this.toResponseDto(appointment);
  }

  /**
   * Validate no scheduling conflicts
   */
  private async validateNoConflicts(
    tenantId: string,
    providerId: string,
    start: Date,
    end: Date,
    excludeId?: string,
  ): Promise<void> {
    const conflicts = await this.repository.findConflicts(
      tenantId,
      providerId,
      start,
      end,
      excludeId,
    );

    if (conflicts.length > 0) {
      throw new ConflictError('Provider has conflicting appointments', {
        conflictType: 'concurrent',
        resourceType: 'appointment',
        existingId: conflicts[0].id,
      });
    }
  }

  /**
   * Validate patient doesn't have overlapping appointments
   */
  private async validatePatientAvailability(
    tenantId: string,
    patientId: string,
    start: Date,
    end: Date,
  ): Promise<void> {
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await this.repository.findByPatientAndDateRange(
      tenantId,
      patientId,
      dayStart,
      dayEnd,
    );

    const hasOverlap = existingAppointments.some((apt) => {
      return (
        (start >= apt.start && start < apt.end) ||
        (end > apt.start && end <= apt.end) ||
        (start <= apt.start && end >= apt.end)
      );
    });

    if (hasOverlap) {
      throw new ConflictError('Patient has a conflicting appointment', {
        conflictType: 'concurrent',
        resourceType: 'appointment',
      });
    }
  }

  /**
   * Calculate risk score for appointment
   * Based on patient's no-show history
   */
  private async calculateRiskScore(tenantId: string, patientId: string): Promise<number> {
    // Count no-shows in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const noShowCount = await this.repository.getPatientNoShowCount(
      tenantId,
      patientId,
      sixMonthsAgo,
    );

    // Simple risk scoring: 20 points per no-show, capped at 100
    return Math.min(noShowCount * 20, 100);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(appointment: {
    id: string;
    tenantId: string;
    organizationId: string;
    locationId: string;
    patientId: string;
    providerId: string;
    chairId?: string;
    serviceCode: string;
    start: Date;
    end: Date;
    status: AppointmentStatus;
    riskScore?: number;
    bookingMetadata?: BookingMetadata;
    createdAt?: Date;
    updatedAt?: Date;
  }): AppointmentResponseDto {
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
