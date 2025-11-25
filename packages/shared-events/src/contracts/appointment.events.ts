/**
 * Appointment Domain Events
 *
 * Events related to appointment lifecycle in the dental practice management system.
 * These events track appointment scheduling, modifications, and completion.
 *
 * @module shared-events/contracts
 */

import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';

/**
 * Published when a new appointment is booked
 *
 * Triggers:
 * - Patient books appointment online
 * - Front desk schedules appointment
 * - Recurring appointment creation
 *
 * Consumers:
 * - Notification service (send confirmation email/SMS)
 * - Calendar sync service
 * - Analytics service (track booking patterns)
 * - Resource management service (allocate room/equipment)
 */
export class AppointmentBooked extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly scheduledAt: ISODateString;
  public readonly duration: number;
  public readonly appointmentType: string;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    scheduledAt: ISODateString;
    duration: number;
    appointmentType: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
  }) {
    super('AppointmentBooked', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.scheduledAt = params.scheduledAt;
    this.duration = params.duration;
    this.appointmentType = params.appointmentType;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
  }
}

/**
 * Published when an appointment is rescheduled to a new time
 *
 * Triggers:
 * - Patient requests reschedule
 * - Provider reschedules appointment
 * - System reschedules due to conflict
 *
 * Consumers:
 * - Notification service (send reschedule notification)
 * - Calendar sync service
 * - Analytics service (track reschedule rates)
 * - Resource management service (reallocate resources)
 */
export class AppointmentRescheduled extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly previousScheduledAt: ISODateString;
  public readonly newScheduledAt: ISODateString;
  public readonly duration: number;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly rescheduledBy: UUID;
  public readonly reason?: string;

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    previousScheduledAt: ISODateString;
    newScheduledAt: ISODateString;
    duration: number;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    rescheduledBy: UUID;
    reason?: string;
  }) {
    super('AppointmentRescheduled', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.previousScheduledAt = params.previousScheduledAt;
    this.newScheduledAt = params.newScheduledAt;
    this.duration = params.duration;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.rescheduledBy = params.rescheduledBy;
    this.reason = params.reason;
  }
}

/**
 * Published when an appointment is cancelled
 *
 * Triggers:
 * - Patient cancels appointment
 * - Provider cancels appointment
 * - System cancels due to no-show policy
 *
 * Consumers:
 * - Notification service (send cancellation notification)
 * - Calendar sync service
 * - Analytics service (track cancellation rates)
 * - Resource management service (release resources)
 * - Waitlist service (notify waitlisted patients)
 */
export class AppointmentCancelled extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly scheduledAt: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly cancelledBy: UUID;
  public readonly reason?: string;
  public readonly cancellationType: 'patient' | 'provider' | 'system' | 'no_show';

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    scheduledAt: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    cancelledBy: UUID;
    reason?: string;
    cancellationType: 'patient' | 'provider' | 'system' | 'no_show';
  }) {
    super('AppointmentCancelled', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.scheduledAt = params.scheduledAt;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.cancelledBy = params.cancelledBy;
    this.reason = params.reason;
    this.cancellationType = params.cancellationType;
  }
}

/**
 * Published when an appointment is marked as completed
 *
 * Triggers:
 * - Provider marks appointment as complete
 * - System auto-completes after time elapsed
 * - Check-out process completion
 *
 * Consumers:
 * - Billing service (generate invoice)
 * - Analytics service (track completion rates)
 * - Patient portal (update appointment history)
 * - Review service (prompt for feedback)
 */
export class AppointmentCompleted extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly scheduledAt: ISODateString;
  public readonly completedAt: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly completedBy: UUID;
  public readonly notes?: string;

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    scheduledAt: ISODateString;
    completedAt: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    completedBy: UUID;
    notes?: string;
  }) {
    super('AppointmentCompleted', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.scheduledAt = params.scheduledAt;
    this.completedAt = params.completedAt;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.completedBy = params.completedBy;
    this.notes = params.notes;
  }
}
