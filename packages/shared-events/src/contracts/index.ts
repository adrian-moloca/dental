/**
 * Event Contracts Module
 *
 * Exports all domain event contracts for the Dental OS system.
 * These contracts define the structure of events published across microservices.
 *
 * @module shared-events/contracts
 */

// User Events
export { UserCreated, UserUpdated, UserDeleted } from './user.events';

// Tenant Events
export {
  TenantCreated,
  TenantUpdated,
  TenantDeleted,
  ClinicCreated,
  ClinicUpdated,
  ClinicDeleted,
} from './tenant.events';

// Patient Events
export { PatientCreated, PatientUpdated, PatientDeleted } from './patient.events';

// Appointment Events
export {
  AppointmentBooked,
  AppointmentRescheduled,
  AppointmentCancelled,
  AppointmentCompleted,
} from './appointment.events';
