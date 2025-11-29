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
 * Published when an appointment is confirmed by patient or staff
 *
 * Triggers:
 * - Patient confirms via SMS/email link
 * - Front desk confirms over phone
 * - Patient confirms via patient portal
 *
 * Consumers:
 * - Calendar sync service
 * - Analytics service (track confirmation rates)
 * - Resource management service (confirm allocation)
 */
export class AppointmentConfirmed extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly scheduledAt: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly confirmedBy: UUID;
  public readonly confirmationMethod: 'sms' | 'email' | 'phone' | 'patient_portal';

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    scheduledAt: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    confirmedBy: UUID;
    confirmationMethod: 'sms' | 'email' | 'phone' | 'patient_portal';
  }) {
    super('AppointmentConfirmed', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.scheduledAt = params.scheduledAt;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.confirmedBy = params.confirmedBy;
    this.confirmationMethod = params.confirmationMethod;
  }
}

/**
 * Published when a patient checks in for their appointment
 *
 * Triggers:
 * - Front desk checks in patient
 * - Self-service kiosk check-in
 * - Patient portal check-in
 *
 * Consumers:
 * - Reception dashboard (update queue)
 * - Provider notification (patient arrived)
 * - Analytics service (track check-in times)
 * - Clinical preparation service
 */
export class AppointmentCheckedIn extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly scheduledAt: ISODateString;
  public readonly checkedInAt: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly checkedInBy: UUID;
  public readonly waitTimeMinutes: number;

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    scheduledAt: ISODateString;
    checkedInAt: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    checkedInBy: UUID;
    waitTimeMinutes: number;
  }) {
    super('AppointmentCheckedIn', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.scheduledAt = params.scheduledAt;
    this.checkedInAt = params.checkedInAt;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.checkedInBy = params.checkedInBy;
    this.waitTimeMinutes = params.waitTimeMinutes;
  }
}

/**
 * Published when an appointment is started (patient called to treatment room)
 *
 * Triggers:
 * - Provider calls patient to treatment room
 * - Clinical staff starts appointment
 *
 * Consumers:
 * - Reception dashboard (patient no longer waiting)
 * - Clinical charting service (prepare for notes)
 * - Analytics service (track wait times)
 * - Resource utilization tracking
 */
export class AppointmentStarted extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly scheduledAt: ISODateString;
  public readonly startedAt: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly startedBy: UUID;
  public readonly chairId?: string;
  public readonly actualWaitMinutes: number;

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    scheduledAt: ISODateString;
    startedAt: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    startedBy: UUID;
    chairId?: string;
    actualWaitMinutes: number;
  }) {
    super('AppointmentStarted', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.scheduledAt = params.scheduledAt;
    this.startedAt = params.startedAt;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.startedBy = params.startedBy;
    this.chairId = params.chairId;
    this.actualWaitMinutes = params.actualWaitMinutes;
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
 * - Inventory service (deduct materials)
 * - Analytics service (track completion rates)
 * - Patient portal (update appointment history)
 * - Review service (prompt for feedback)
 * - Recall scheduling service
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
  public readonly serviceCode: string;
  public readonly actualDurationMinutes: number;
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
    serviceCode: string;
    actualDurationMinutes: number;
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
    this.serviceCode = params.serviceCode;
    this.actualDurationMinutes = params.actualDurationMinutes;
    this.notes = params.notes;
  }
}

/**
 * Published when an appointment is marked as a no-show
 *
 * Triggers:
 * - Patient fails to arrive within grace period
 * - Staff manually marks as no-show
 *
 * Consumers:
 * - Patient profile service (update no-show count)
 * - Analytics service (track no-show rates)
 * - Waitlist service (open slot for waitlisted patients)
 * - Notification service (send no-show notice)
 * - Loyalty program (deduct points)
 */
export class AppointmentNoShow extends DomainEvent {
  public readonly appointmentId: UUID;
  public readonly patientId: UUID;
  public readonly providerId: UUID;
  public readonly scheduledAt: ISODateString;
  public readonly markedAt: ISODateString;
  public readonly organizationId: OrganizationId;
  public readonly clinicId: ClinicId;
  public readonly markedBy: UUID;
  public readonly reason?: string;
  public readonly patientNoShowCount: number;

  constructor(params: {
    aggregateId: UUID;
    appointmentId: UUID;
    patientId: UUID;
    providerId: UUID;
    scheduledAt: ISODateString;
    markedAt: ISODateString;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    markedBy: UUID;
    reason?: string;
    patientNoShowCount: number;
  }) {
    super('AppointmentNoShow', params.aggregateId, 1);
    this.appointmentId = params.appointmentId;
    this.patientId = params.patientId;
    this.providerId = params.providerId;
    this.scheduledAt = params.scheduledAt;
    this.markedAt = params.markedAt;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.markedBy = params.markedBy;
    this.reason = params.reason;
    this.patientNoShowCount = params.patientNoShowCount;
  }
}
