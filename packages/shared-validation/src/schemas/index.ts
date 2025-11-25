/**
 * Schemas barrel export
 * @module shared-validation/schemas
 */

// Common schemas (explicit exports to avoid conflicts with scheduling)
export {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  URLSchema,
  DateSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  TrimmedStringSchema,
} from './common.schemas';

// Entity schemas
export * from './user.schemas';
export * from './tenant.schemas';

// Patient schemas (exported from patient directory)
export * from './patient';

// Scheduling schemas (includes AppointmentStatusSchema, DayOfWeekSchema, RecurrencePatternSchema)
export * from './scheduling';

// Clinical schemas (odontogram, perio charts, clinical notes, treatment plans, procedures, consent)
export * from './clinical';

// Imaging schemas (imaging studies, DICOM files, AI analysis, radiology reports)
export * from './imaging';

// Inventory & Procurement schemas (products, stock, purchase orders, suppliers)
export * from './inventory';

// Billing schemas (invoices, payments, insurance claims, price rules, tax rates)
export * from './billing';

// Marketing schemas (campaigns, segments, referrals, loyalty, feedback, NPS, automation, delivery)
export * from './marketing';

// Patient Portal schemas (patient-facing API validations for auth, profile, appointments, billing, engagement, GDPR)
export * from './patient-portal';

// Automation schemas (workflow automation, triggers, conditions, actions, error handling)
export * from './automation';

// AI Engine schemas (AI jobs, clinical assistant, imaging analysis, predictions, forecasting)
export * from './ai';

// HR & Workforce schemas (staff, shifts, absences, tasks)
export * from './hr';

// Sterilization & Clinical Logistics schemas (cycles, instruments, lab cases, room prep)
export * from './sterilization';

// Enterprise schemas (organizations, clinics, provider assignments)
export * from './enterprise';

// Integration schemas (SMS, Email, Payments, WhatsApp, DICOM, Lab, E-Factura, Webhooks)
export * from './integrations';

// Offline Sync schemas (device registration, change tracking, sync batches)
export * from './offline-sync';
