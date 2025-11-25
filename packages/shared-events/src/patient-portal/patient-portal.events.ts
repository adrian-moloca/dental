/**
 * Patient Portal Events
 *
 * Domain events for patient portal interactions including authentication, profile management,
 * appointments, clinical records, imaging, billing, engagement, GDPR compliance, and session tracking.
 *
 * These events are consumed by:
 * - Feature 9 (Automation Engine) - Trigger workflows based on patient behavior
 * - Feature 10 (AI Engine) - Behavior analysis, engagement scoring, churn prediction
 * - Analytics Platform - Patient engagement metrics, portal usage analytics
 * - Marketing Service - Campaign optimization, patient journey tracking
 *
 * Safety & Compliance:
 * - All events include session context for security audit trails
 * - Device and platform tracking for fraud detection
 * - IP address logging for security monitoring
 * - GDPR-compliant data export and deletion tracking
 * - Consent status tracking for all marketing interactions
 *
 * @module shared-events/patient-portal
 */

import type { UUID, OrganizationId, ClinicId, TenantId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type {
  PatientId,
  ProviderId,
  TreatmentPlanId,
} from '@dentalos/shared-domain';

// ============================================================================
// BRANDED TYPES FOR PATIENT PORTAL DOMAIN
// ============================================================================

/**
 * Unique identifier for a portal session
 */
export type SessionId = UUID & { readonly __brand: 'SessionId' };

/**
 * Unique identifier for an appointment
 */
export type AppointmentId = UUID & { readonly __brand: 'AppointmentId' };

/**
 * Unique identifier for a visit/encounter
 */
export type VisitId = UUID & { readonly __brand: 'VisitId' };

/**
 * Unique identifier for an imaging study
 */
export type ImagingStudyId = UUID & { readonly __brand: 'ImagingStudyId' };

/**
 * Unique identifier for an invoice
 */
export type InvoiceId = UUID & { readonly __brand: 'InvoiceId' };

/**
 * Unique identifier for a payment transaction
 */
export type TransactionId = UUID & { readonly __brand: 'TransactionId' };

/**
 * Unique identifier for a loyalty account
 */
export type LoyaltyAccountId = UUID & { readonly __brand: 'LoyaltyAccountId' };

/**
 * Unique identifier for an offer/promotion
 */
export type OfferId = UUID & { readonly __brand: 'OfferId' };

/**
 * Unique identifier for a feedback entry
 */
export type FeedbackId = UUID & { readonly __brand: 'FeedbackId' };

/**
 * Unique identifier for an NPS score record
 */
export type NpsScoreId = UUID & { readonly __brand: 'NpsScoreId' };

/**
 * Unique identifier for a service code
 */
export type ServiceCode = string & { readonly __brand: 'ServiceCode' };

// ============================================================================
// ENUMERATIONS
// ============================================================================

/**
 * Source platform for patient portal access
 */
export type PortalSource = 'WEB' | 'MOBILE';

/**
 * Platform for mobile applications
 */
export type MobilePlatform = 'WEB' | 'IOS' | 'ANDROID';

/**
 * Multi-factor authentication method
 */
export type MfaMethod = 'SMS' | 'EMAIL' | 'TOTP' | 'BIOMETRIC';

/**
 * Payment method type
 */
export type PaymentMethod = 'CARD' | 'ACH' | 'WALLET' | 'CRYPTO' | 'OTHER';

/**
 * Loyalty tier levels
 */
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

/**
 * Referral sharing channel
 */
export type ReferralChannel = 'EMAIL' | 'SMS' | 'SOCIAL' | 'LINK' | 'OTHER';

/**
 * Feedback category
 */
export type FeedbackCategory =
  | 'SERVICE_QUALITY'
  | 'STAFF_INTERACTION'
  | 'FACILITY_CLEANLINESS'
  | 'WAIT_TIME'
  | 'TREATMENT_OUTCOME'
  | 'VALUE_FOR_MONEY'
  | 'OVERALL_EXPERIENCE'
  | 'TECHNICAL_ISSUE'
  | 'OTHER';

/**
 * NPS category based on score
 */
export type NpsCategory = 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';

/**
 * GDPR consent type
 */
export type ConsentType =
  | 'MARKETING'
  | 'SMS'
  | 'EMAIL'
  | 'PHONE'
  | 'DATA_PROCESSING'
  | 'DATA_SHARING'
  | 'ANALYTICS'
  | 'THIRD_PARTY';

/**
 * Device type for portal access
 */
export type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';

/**
 * Preference type for patient settings
 */
export type PreferenceType =
  | 'NOTIFICATION'
  | 'COMMUNICATION'
  | 'PRIVACY'
  | 'LANGUAGE'
  | 'TIMEZONE'
  | 'THEME'
  | 'ACCESSIBILITY';

/**
 * Appointment cancellation reason
 */
export type CancellationReason =
  | 'SCHEDULE_CONFLICT'
  | 'ILLNESS'
  | 'FINANCIAL'
  | 'NO_LONGER_NEEDED'
  | 'PROVIDER_CHANGE'
  | 'OTHER';

/**
 * Appointment reschedule reason
 */
export type RescheduleReason =
  | 'SCHEDULE_CONFLICT'
  | 'PROVIDER_REQUEST'
  | 'EMERGENCY'
  | 'PREFERENCE'
  | 'OTHER';

/**
 * Payment error code
 */
export type PaymentErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_DECLINED'
  | 'INVALID_CARD'
  | 'EXPIRED_CARD'
  | 'NETWORK_ERROR'
  | 'FRAUD_DETECTED'
  | 'PROCESSING_ERROR'
  | 'UNKNOWN';

/**
 * GDPR deletion reason
 */
export type DeletionReason =
  | 'PATIENT_REQUEST'
  | 'GDPR_RIGHT_TO_ERASURE'
  | 'ACCOUNT_CLOSURE'
  | 'DUPLICATE_ACCOUNT'
  | 'DATA_MINIMIZATION'
  | 'OTHER';

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT AUTH EVENTS
// ============================================================================

/**
 * Patient registered event type constant
 * Published when a new patient creates a portal account
 */
export const PATIENT_REGISTERED = 'dental.patient.portal.registered' as const;

/**
 * Patient logged in event type constant
 * Published when a patient successfully authenticates
 */
export const PATIENT_LOGGED_IN = 'dental.patient.portal.logged.in' as const;

/**
 * Patient logged out event type constant
 * Published when a patient explicitly logs out or session expires
 */
export const PATIENT_LOGGED_OUT = 'dental.patient.portal.logged.out' as const;

/**
 * Patient MFA enabled event type constant
 * Published when a patient enables multi-factor authentication
 */
export const PATIENT_MFA_ENABLED = 'dental.patient.portal.mfa.enabled' as const;

/**
 * Patient password changed event type constant
 * Published when a patient changes their password
 */
export const PATIENT_PASSWORD_CHANGED = 'dental.patient.portal.password.changed' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT PROFILE EVENTS
// ============================================================================

/**
 * Patient profile viewed event type constant
 * Published when a patient views their profile
 */
export const PATIENT_PROFILE_VIEWED = 'dental.patient.portal.profile.viewed' as const;

/**
 * Patient profile updated event type constant
 * Published when a patient updates their profile information
 */
export const PATIENT_PROFILE_UPDATED = 'dental.patient.portal.profile.updated' as const;

/**
 * Patient preferences updated event type constant
 * Published when a patient updates their preferences
 */
export const PATIENT_PREFERENCES_UPDATED = 'dental.patient.portal.preferences.updated' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT APPOINTMENT EVENTS
// ============================================================================

/**
 * Patient appointment viewed event type constant
 * Published when a patient views appointment details
 */
export const PATIENT_APPOINTMENT_VIEWED = 'dental.patient.portal.appointment.viewed' as const;

/**
 * Patient appointment booked event type constant
 * Published when a patient books a new appointment
 */
export const PATIENT_APPOINTMENT_BOOKED = 'dental.patient.portal.appointment.booked' as const;

/**
 * Patient appointment rescheduled event type constant
 * Published when a patient reschedules an existing appointment
 */
export const PATIENT_APPOINTMENT_RESCHEDULED = 'dental.patient.portal.appointment.rescheduled' as const;

/**
 * Patient appointment cancelled event type constant
 * Published when a patient cancels an appointment
 */
export const PATIENT_APPOINTMENT_CANCELLED = 'dental.patient.portal.appointment.cancelled' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT CLINICAL EVENTS
// ============================================================================

/**
 * Patient clinical summary viewed event type constant
 * Published when a patient views their clinical summary
 */
export const PATIENT_CLINICAL_SUMMARY_VIEWED = 'dental.patient.portal.clinical.summary.viewed' as const;

/**
 * Patient visit details viewed event type constant
 * Published when a patient views details of a specific visit
 */
export const PATIENT_VISIT_DETAILS_VIEWED = 'dental.patient.portal.visit.viewed' as const;

/**
 * Patient treatment plan viewed event type constant
 * Published when a patient views their treatment plan
 */
export const PATIENT_TREATMENT_PLAN_VIEWED = 'dental.patient.portal.treatment.plan.viewed' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT IMAGING EVENTS
// ============================================================================

/**
 * Patient imaging list viewed event type constant
 * Published when a patient views their imaging studies list
 */
export const PATIENT_IMAGING_LIST_VIEWED = 'dental.patient.portal.imaging.list.viewed' as const;

/**
 * Patient imaging study viewed event type constant
 * Published when a patient views a specific imaging study
 */
export const PATIENT_IMAGING_STUDY_VIEWED = 'dental.patient.portal.imaging.study.viewed' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT BILLING EVENTS
// ============================================================================

/**
 * Patient invoices viewed event type constant
 * Published when a patient views their invoices list
 */
export const PATIENT_INVOICES_VIEWED = 'dental.patient.portal.invoices.viewed' as const;

/**
 * Patient invoice viewed event type constant
 * Published when a patient views a specific invoice
 */
export const PATIENT_INVOICE_VIEWED = 'dental.patient.portal.invoice.viewed' as const;

/**
 * Patient payment initiated event type constant
 * Published when a patient initiates a payment
 */
export const PATIENT_PAYMENT_INITIATED = 'dental.patient.portal.payment.initiated' as const;

/**
 * Patient payment completed event type constant
 * Published when a payment is successfully completed
 */
export const PATIENT_PAYMENT_COMPLETED = 'dental.patient.portal.payment.completed' as const;

/**
 * Patient payment failed event type constant
 * Published when a payment attempt fails
 */
export const PATIENT_PAYMENT_FAILED = 'dental.patient.portal.payment.failed' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT ENGAGEMENT EVENTS
// ============================================================================

/**
 * Patient loyalty viewed event type constant
 * Published when a patient views their loyalty account
 */
export const PATIENT_LOYALTY_VIEWED = 'dental.patient.portal.loyalty.viewed' as const;

/**
 * Patient referral shared event type constant
 * Published when a patient shares their referral code
 */
export const PATIENT_REFERRAL_SHARED = 'dental.patient.portal.referral.shared' as const;

/**
 * Patient offer viewed event type constant
 * Published when a patient views an offer or promotion
 */
export const PATIENT_OFFER_VIEWED = 'dental.patient.portal.offer.viewed' as const;

/**
 * Patient offer redeemed event type constant
 * Published when a patient redeems an offer
 */
export const PATIENT_OFFER_REDEEMED = 'dental.patient.portal.offer.redeemed' as const;

/**
 * Patient feedback submitted event type constant
 * Published when a patient submits feedback
 */
export const PATIENT_FEEDBACK_SUBMITTED = 'dental.patient.portal.feedback.submitted' as const;

/**
 * Patient NPS submitted event type constant
 * Published when a patient submits an NPS score
 */
export const PATIENT_NPS_SUBMITTED = 'dental.patient.portal.nps.submitted' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT GDPR EVENTS
// ============================================================================

/**
 * Patient data export requested event type constant
 * Published when a patient requests their data export
 */
export const PATIENT_DATA_EXPORT_REQUESTED = 'dental.patient.portal.gdpr.export.requested' as const;

/**
 * Patient data export downloaded event type constant
 * Published when a patient downloads their data export
 */
export const PATIENT_DATA_EXPORT_DOWNLOADED = 'dental.patient.portal.gdpr.export.downloaded' as const;

/**
 * Patient deletion requested event type constant
 * Published when a patient requests account deletion
 */
export const PATIENT_DELETION_REQUESTED = 'dental.patient.portal.gdpr.deletion.requested' as const;

/**
 * Patient consent updated event type constant
 * Published when a patient updates their consent preferences
 */
export const PATIENT_CONSENT_UPDATED = 'dental.patient.portal.gdpr.consent.updated' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT SESSION EVENTS
// ============================================================================

/**
 * Patient session started event type constant
 * Published when a patient starts a new portal session
 */
export const PATIENT_SESSION_STARTED = 'dental.patient.portal.session.started' as const;

/**
 * Patient session ended event type constant
 * Published when a patient session ends
 */
export const PATIENT_SESSION_ENDED = 'dental.patient.portal.session.ended' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - PATIENT ERROR EVENTS
// ============================================================================

/**
 * Patient error occurred event type constant
 * Published when an error occurs in the patient portal
 */
export const PATIENT_ERROR_OCCURRED = 'dental.patient.portal.error' as const;

// ============================================================================
// EVENT VERSION CONSTANTS
// ============================================================================

export const PATIENT_REGISTERED_VERSION = 1;
export const PATIENT_LOGGED_IN_VERSION = 1;
export const PATIENT_LOGGED_OUT_VERSION = 1;
export const PATIENT_MFA_ENABLED_VERSION = 1;
export const PATIENT_PASSWORD_CHANGED_VERSION = 1;
export const PATIENT_PROFILE_VIEWED_VERSION = 1;
export const PATIENT_PROFILE_UPDATED_VERSION = 1;
export const PATIENT_PREFERENCES_UPDATED_VERSION = 1;
export const PATIENT_APPOINTMENT_VIEWED_VERSION = 1;
export const PATIENT_APPOINTMENT_BOOKED_VERSION = 1;
export const PATIENT_APPOINTMENT_RESCHEDULED_VERSION = 1;
export const PATIENT_APPOINTMENT_CANCELLED_VERSION = 1;
export const PATIENT_CLINICAL_SUMMARY_VIEWED_VERSION = 1;
export const PATIENT_VISIT_DETAILS_VIEWED_VERSION = 1;
export const PATIENT_TREATMENT_PLAN_VIEWED_VERSION = 1;
export const PATIENT_IMAGING_LIST_VIEWED_VERSION = 1;
export const PATIENT_IMAGING_STUDY_VIEWED_VERSION = 1;
export const PATIENT_INVOICES_VIEWED_VERSION = 1;
export const PATIENT_INVOICE_VIEWED_VERSION = 1;
export const PATIENT_PAYMENT_INITIATED_VERSION = 1;
export const PATIENT_PAYMENT_COMPLETED_VERSION = 1;
export const PATIENT_PAYMENT_FAILED_VERSION = 1;
export const PATIENT_LOYALTY_VIEWED_VERSION = 1;
export const PATIENT_REFERRAL_SHARED_VERSION = 1;
export const PATIENT_OFFER_VIEWED_VERSION = 1;
export const PATIENT_OFFER_REDEEMED_VERSION = 1;
export const PATIENT_FEEDBACK_SUBMITTED_VERSION = 1;
export const PATIENT_NPS_SUBMITTED_VERSION = 1;
export const PATIENT_DATA_EXPORT_REQUESTED_VERSION = 1;
export const PATIENT_DATA_EXPORT_DOWNLOADED_VERSION = 1;
export const PATIENT_DELETION_REQUESTED_VERSION = 1;
export const PATIENT_CONSENT_UPDATED_VERSION = 1;
export const PATIENT_SESSION_STARTED_VERSION = 1;
export const PATIENT_SESSION_ENDED_VERSION = 1;
export const PATIENT_ERROR_OCCURRED_VERSION = 1;

// ============================================================================
// SHARED CONTEXT INTERFACES
// ============================================================================

/**
 * Session context for portal events
 * Provides security and analytics context for all portal interactions
 */
export interface SessionContext {
  /** Session identifier */
  sessionId?: SessionId;

  /** Device identifier or fingerprint */
  device?: string;

  /** Platform used to access portal */
  platform?: MobilePlatform;

  /** IP address of the request */
  ipAddress?: string;

  /** User agent string */
  userAgent?: string;

  /** Device type */
  deviceType?: DeviceType;

  /** Browser name and version */
  browser?: string;

  /** Operating system */
  operatingSystem?: string;

  /** Geographic location (city, region, country) */
  location?: string;
}

// ============================================================================
// 1. PATIENT AUTH EVENTS
// ============================================================================

/**
 * Patient registered event payload
 *
 * Published when a new patient creates a portal account.
 * Consumed by onboarding workflows, welcome campaigns, and analytics.
 *
 * @example
 * ```typescript
 * const payload: PatientRegisteredPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   email: 'john.doe@example.com',
 *   registrationDate: '2025-11-21T10:00:00Z',
 *   source: 'WEB',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface PatientRegisteredPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Patient email address */
  email: string;

  /** Registration timestamp */
  registrationDate: ISODateString;

  /** Registration source */
  source: PortalSource;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Referral source if available */
  referralSource?: string;

  /** Marketing consent granted at registration */
  marketingConsent?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient registered event envelope
 */
export type PatientRegisteredEvent = EventEnvelope<PatientRegisteredPayload>;

/**
 * Patient logged in event payload
 *
 * Published when a patient successfully authenticates.
 * Used for security monitoring, session management, and engagement tracking.
 *
 * @example
 * ```typescript
 * const payload: PatientLoggedInPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   loginDate: '2025-11-21T10:00:00Z',
 *   device: 'iPhone 15 Pro',
 *   ipAddress: '192.168.1.100',
 *   mfaUsed: true,
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface PatientLoggedInPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Login timestamp */
  loginDate: ISODateString;

  /** Device information */
  device?: string;

  /** IP address */
  ipAddress?: string;

  /** Whether MFA was used */
  mfaUsed: boolean;

  /** MFA method if used */
  mfaMethod?: MfaMethod;

  /** Session context */
  sessionId?: SessionId;
  platform?: MobilePlatform;
  userAgent?: string;
  deviceType?: DeviceType;
  browser?: string;
  operatingSystem?: string;
  location?: string;

  /** Login attempt count (for security monitoring) */
  attemptCount?: number;

  /** Whether this is the first login */
  isFirstLogin?: boolean;

  /** Time since last login (in seconds) */
  timeSinceLastLogin?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient logged in event envelope
 */
export type PatientLoggedInEvent = EventEnvelope<PatientLoggedInPayload>;

/**
 * Patient logged out event payload
 *
 * Published when a patient logs out or session expires.
 * Used for session analytics and engagement metrics.
 *
 * @example
 * ```typescript
 * const payload: PatientLoggedOutPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   logoutDate: '2025-11-21T11:00:00Z',
 *   sessionDuration: 3600,
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T11:00:00Z',
 * };
 * ```
 */
export interface PatientLoggedOutPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Logout timestamp */
  logoutDate: ISODateString;

  /** Session duration in seconds */
  sessionDuration?: number;

  /** Session context */
  sessionId?: SessionId;

  /** Whether logout was explicit or timeout */
  logoutType?: 'EXPLICIT' | 'TIMEOUT' | 'FORCED';

  /** Reason for forced logout if applicable */
  logoutReason?: string;

  /** Pages viewed during session */
  pagesViewed?: number;

  /** Actions performed during session */
  actionsPerformed?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient logged out event envelope
 */
export type PatientLoggedOutEvent = EventEnvelope<PatientLoggedOutPayload>;

/**
 * Patient MFA enabled event payload
 *
 * Published when a patient enables multi-factor authentication.
 * Used for security metrics and onboarding optimization.
 *
 * @example
 * ```typescript
 * const payload: PatientMfaEnabledPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   method: 'TOTP',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T10:30:00Z',
 * };
 * ```
 */
export interface PatientMfaEnabledPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** MFA method enabled */
  method: MfaMethod;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Whether this was prompted by security policy */
  policyEnforced?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient MFA enabled event envelope
 */
export type PatientMfaEnabledEvent = EventEnvelope<PatientMfaEnabledPayload>;

/**
 * Patient password changed event payload
 *
 * Published when a patient changes their password.
 * Used for security monitoring and account protection.
 *
 * @example
 * ```typescript
 * const payload: PatientPasswordChangedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   changedDate: '2025-11-21T10:45:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T10:45:00Z',
 * };
 * ```
 */
export interface PatientPasswordChangedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Password change timestamp */
  changedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Whether change was forced (e.g., password reset) */
  wasForced?: boolean;

  /** Reason for forced change */
  forceReason?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient password changed event envelope
 */
export type PatientPasswordChangedEvent = EventEnvelope<PatientPasswordChangedPayload>;

// ============================================================================
// 2. PATIENT PROFILE EVENTS
// ============================================================================

/**
 * Patient profile viewed event payload
 *
 * Published when a patient views their profile.
 * Used for engagement tracking and feature usage analytics.
 *
 * @example
 * ```typescript
 * const payload: PatientProfileViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   viewedDate: '2025-11-21T11:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T11:00:00Z',
 * };
 * ```
 */
export interface PatientProfileViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Section viewed (if applicable) */
  section?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient profile viewed event envelope
 */
export type PatientProfileViewedEvent = EventEnvelope<PatientProfileViewedPayload>;

/**
 * Patient profile updated event payload
 *
 * Published when a patient updates their profile information.
 * Used for data quality tracking and engagement metrics.
 *
 * @example
 * ```typescript
 * const payload: PatientProfileUpdatedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   updatedFields: ['email', 'phone'],
 *   updatedDate: '2025-11-21T11:15:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T11:15:00Z',
 * };
 * ```
 */
export interface PatientProfileUpdatedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Fields that were updated */
  updatedFields: string[];

  /** Update timestamp */
  updatedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Number of fields updated */
  fieldCount?: number;

  /** Whether update was complete (all required fields) */
  profileComplete?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient profile updated event envelope
 */
export type PatientProfileUpdatedEvent = EventEnvelope<PatientProfileUpdatedPayload>;

/**
 * Patient preferences updated event payload
 *
 * Published when a patient updates their preferences.
 * Used for personalization and marketing optimization.
 *
 * @example
 * ```typescript
 * const payload: PatientPreferencesUpdatedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   preferenceType: 'NOTIFICATION',
 *   newValue: { email: true, sms: false, push: true },
 *   updatedDate: '2025-11-21T11:30:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T11:30:00Z',
 * };
 * ```
 */
export interface PatientPreferencesUpdatedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Type of preference updated */
  preferenceType: PreferenceType;

  /** New preference value */
  newValue: unknown;

  /** Previous preference value */
  previousValue?: unknown;

  /** Update timestamp */
  updatedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient preferences updated event envelope
 */
export type PatientPreferencesUpdatedEvent = EventEnvelope<PatientPreferencesUpdatedPayload>;

// ============================================================================
// 3. PATIENT APPOINTMENT EVENTS
// ============================================================================

/**
 * Patient appointment viewed event payload
 *
 * Published when a patient views appointment details.
 * Used for engagement tracking and appointment optimization.
 *
 * @example
 * ```typescript
 * const payload: PatientAppointmentViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   appointmentId: 'appt-456' as AppointmentId,
 *   viewedDate: '2025-11-21T12:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T12:00:00Z',
 * };
 * ```
 */
export interface PatientAppointmentViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Appointment identifier */
  appointmentId: AppointmentId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Days until appointment */
  daysUntilAppointment?: number;

  /** Whether this is upcoming or past appointment */
  appointmentStatus?: 'UPCOMING' | 'PAST' | 'TODAY';

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient appointment viewed event envelope
 */
export type PatientAppointmentViewedEvent = EventEnvelope<PatientAppointmentViewedPayload>;

/**
 * Patient appointment booked event payload
 *
 * Published when a patient books a new appointment through the portal.
 * CRITICAL: Triggers confirmation workflows and calendar updates.
 *
 * @example
 * ```typescript
 * const payload: PatientAppointmentBookedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   appointmentId: 'appt-456' as AppointmentId,
 *   providerId: 'prov-789' as ProviderId,
 *   serviceCode: 'D0120' as ServiceCode,
 *   appointmentDate: '2025-12-01T14:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T12:15:00Z',
 * };
 * ```
 */
export interface PatientAppointmentBookedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Appointment identifier */
  appointmentId: AppointmentId;

  /** Provider identifier */
  providerId: ProviderId;

  /** Service code for the appointment */
  serviceCode: ServiceCode;

  /** Scheduled appointment date/time */
  appointmentDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Appointment type */
  appointmentType?: string;

  /** Duration in minutes */
  durationMinutes?: number;

  /** Reason for appointment */
  reason?: string;

  /** Notes from patient */
  notes?: string;

  /** Days from now until appointment */
  daysUntilAppointment?: number;

  /** Whether this is a recurring appointment */
  isRecurring?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient appointment booked event envelope
 */
export type PatientAppointmentBookedEvent = EventEnvelope<PatientAppointmentBookedPayload>;

/**
 * Patient appointment rescheduled event payload
 *
 * Published when a patient reschedules an appointment.
 * Used for workflow updates and analytics.
 *
 * @example
 * ```typescript
 * const payload: PatientAppointmentRescheduledPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   appointmentId: 'appt-456' as AppointmentId,
 *   oldDate: '2025-11-25T14:00:00Z',
 *   newDate: '2025-12-01T14:00:00Z',
 *   reason: 'SCHEDULE_CONFLICT',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T12:30:00Z',
 * };
 * ```
 */
export interface PatientAppointmentRescheduledPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Appointment identifier */
  appointmentId: AppointmentId;

  /** Previous appointment date/time */
  oldDate: ISODateString;

  /** New appointment date/time */
  newDate: ISODateString;

  /** Reason for rescheduling */
  reason?: RescheduleReason;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Provider ID if changed */
  newProviderId?: ProviderId;

  /** Days difference between old and new date */
  daysDifference?: number;

  /** How many times this appointment has been rescheduled */
  rescheduleCount?: number;

  /** Additional notes */
  notes?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient appointment rescheduled event envelope
 */
export type PatientAppointmentRescheduledEvent = EventEnvelope<PatientAppointmentRescheduledPayload>;

/**
 * Patient appointment cancelled event payload
 *
 * Published when a patient cancels an appointment.
 * CRITICAL: May trigger retention workflows and waitlist notifications.
 *
 * @example
 * ```typescript
 * const payload: PatientAppointmentCancelledPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   appointmentId: 'appt-456' as AppointmentId,
 *   cancelledDate: '2025-11-21T12:45:00Z',
 *   reason: 'SCHEDULE_CONFLICT',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T12:45:00Z',
 * };
 * ```
 */
export interface PatientAppointmentCancelledPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Appointment identifier */
  appointmentId: AppointmentId;

  /** Cancellation timestamp */
  cancelledDate: ISODateString;

  /** Cancellation reason */
  reason?: CancellationReason;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Original appointment date */
  appointmentDate?: ISODateString;

  /** Days before appointment when cancelled */
  daysBeforeAppointment?: number;

  /** Whether cancellation was within cancellation policy */
  withinPolicy?: boolean;

  /** Cancellation fee if applicable */
  cancellationFee?: number;

  /** Additional notes */
  notes?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient appointment cancelled event envelope
 */
export type PatientAppointmentCancelledEvent = EventEnvelope<PatientAppointmentCancelledPayload>;

// ============================================================================
// 4. PATIENT CLINICAL EVENTS
// ============================================================================

/**
 * Patient clinical summary viewed event payload
 *
 * Published when a patient views their clinical summary.
 * Used for engagement tracking and patient education metrics.
 *
 * @example
 * ```typescript
 * const payload: PatientClinicalSummaryViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   viewedDate: '2025-11-21T13:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T13:00:00Z',
 * };
 * ```
 */
export interface PatientClinicalSummaryViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Number of records available */
  recordCount?: number;

  /** Whether any new records since last view */
  hasNewRecords?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient clinical summary viewed event envelope
 */
export type PatientClinicalSummaryViewedEvent = EventEnvelope<PatientClinicalSummaryViewedPayload>;

/**
 * Patient visit details viewed event payload
 *
 * Published when a patient views details of a specific visit.
 * Used for patient engagement and record access analytics.
 *
 * @example
 * ```typescript
 * const payload: PatientVisitDetailsViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   visitId: 'visit-456' as VisitId,
 *   viewedDate: '2025-11-21T13:15:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T13:15:00Z',
 * };
 * ```
 */
export interface PatientVisitDetailsViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Visit identifier */
  visitId: VisitId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Visit date */
  visitDate?: ISODateString;

  /** Provider who conducted visit */
  providerId?: ProviderId;

  /** Days since visit */
  daysSinceVisit?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient visit details viewed event envelope
 */
export type PatientVisitDetailsViewedEvent = EventEnvelope<PatientVisitDetailsViewedPayload>;

/**
 * Patient treatment plan viewed event payload
 *
 * Published when a patient views their treatment plan.
 * Used for treatment acceptance tracking and patient education.
 *
 * @example
 * ```typescript
 * const payload: PatientTreatmentPlanViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   treatmentPlanId: 'tp-456' as TreatmentPlanId,
 *   viewedDate: '2025-11-21T13:30:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T13:30:00Z',
 * };
 * ```
 */
export interface PatientTreatmentPlanViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Treatment plan identifier */
  treatmentPlanId: TreatmentPlanId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Treatment plan status */
  planStatus?: string;

  /** Total cost of treatment plan */
  totalCost?: number;

  /** Number of procedures in plan */
  procedureCount?: number;

  /** Whether plan has been accepted */
  isAccepted?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient treatment plan viewed event envelope
 */
export type PatientTreatmentPlanViewedEvent = EventEnvelope<PatientTreatmentPlanViewedPayload>;

// ============================================================================
// 5. PATIENT IMAGING EVENTS
// ============================================================================

/**
 * Patient imaging list viewed event payload
 *
 * Published when a patient views their imaging studies list.
 * Used for engagement tracking and diagnostic follow-up.
 *
 * @example
 * ```typescript
 * const payload: PatientImagingListViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   viewedDate: '2025-11-21T14:00:00Z',
 *   studyCount: 5,
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T14:00:00Z',
 * };
 * ```
 */
export interface PatientImagingListViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Number of imaging studies available */
  studyCount: number;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Whether any new studies since last view */
  hasNewStudies?: boolean;

  /** Number of new studies */
  newStudyCount?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient imaging list viewed event envelope
 */
export type PatientImagingListViewedEvent = EventEnvelope<PatientImagingListViewedPayload>;

/**
 * Patient imaging study viewed event payload
 *
 * Published when a patient views a specific imaging study.
 * Used for patient engagement and diagnostic education tracking.
 *
 * @example
 * ```typescript
 * const payload: PatientImagingStudyViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   studyId: 'study-456' as ImagingStudyId,
 *   viewedDate: '2025-11-21T14:15:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T14:15:00Z',
 * };
 * ```
 */
export interface PatientImagingStudyViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Imaging study identifier */
  studyId: ImagingStudyId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Study type */
  studyType?: string;

  /** Study date */
  studyDate?: ISODateString;

  /** Days since study */
  daysSinceStudy?: number;

  /** Whether study has a report */
  hasReport?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient imaging study viewed event envelope
 */
export type PatientImagingStudyViewedEvent = EventEnvelope<PatientImagingStudyViewedPayload>;

// ============================================================================
// 6. PATIENT BILLING EVENTS
// ============================================================================

/**
 * Patient invoices viewed event payload
 *
 * Published when a patient views their invoices list.
 * Used for engagement tracking and payment workflow optimization.
 *
 * @example
 * ```typescript
 * const payload: PatientInvoicesViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   viewedDate: '2025-11-21T15:00:00Z',
 *   invoiceCount: 3,
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T15:00:00Z',
 * };
 * ```
 */
export interface PatientInvoicesViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Number of invoices available */
  invoiceCount: number;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Number of outstanding invoices */
  outstandingCount?: number;

  /** Total outstanding balance */
  outstandingBalance?: number;

  /** Whether any overdue invoices */
  hasOverdue?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient invoices viewed event envelope
 */
export type PatientInvoicesViewedEvent = EventEnvelope<PatientInvoicesViewedPayload>;

/**
 * Patient invoice viewed event payload
 *
 * Published when a patient views a specific invoice.
 * Used for payment prediction and collection optimization.
 *
 * @example
 * ```typescript
 * const payload: PatientInvoiceViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   invoiceId: 'inv-456' as InvoiceId,
 *   viewedDate: '2025-11-21T15:15:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T15:15:00Z',
 * };
 * ```
 */
export interface PatientInvoiceViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Invoice identifier */
  invoiceId: InvoiceId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Invoice amount */
  amount?: number;

  /** Invoice status */
  invoiceStatus?: string;

  /** Invoice due date */
  dueDate?: ISODateString;

  /** Days until due or overdue */
  daysUntilDue?: number;

  /** Whether invoice is overdue */
  isOverdue?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient invoice viewed event envelope
 */
export type PatientInvoiceViewedEvent = EventEnvelope<PatientInvoiceViewedPayload>;

/**
 * Patient payment initiated event payload
 *
 * Published when a patient initiates a payment.
 * Used for payment analytics and fraud detection.
 *
 * @example
 * ```typescript
 * const payload: PatientPaymentInitiatedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   invoiceId: 'inv-456' as InvoiceId,
 *   amount: 150.00,
 *   paymentMethod: 'CARD',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T15:30:00Z',
 * };
 * ```
 */
export interface PatientPaymentInitiatedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Invoice identifier */
  invoiceId: InvoiceId;

  /** Payment amount */
  amount: number;

  /** Payment method */
  paymentMethod: PaymentMethod;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Currency code */
  currency?: string;

  /** Payment processor */
  processor?: string;

  /** Whether saving payment method */
  savePaymentMethod?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient payment initiated event envelope
 */
export type PatientPaymentInitiatedEvent = EventEnvelope<PatientPaymentInitiatedPayload>;

/**
 * Patient payment completed event payload
 *
 * Published when a payment is successfully completed.
 * CRITICAL: Triggers receipt generation and account balance updates.
 *
 * @example
 * ```typescript
 * const payload: PatientPaymentCompletedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   invoiceId: 'inv-456' as InvoiceId,
 *   amount: 150.00,
 *   paymentMethod: 'CARD',
 *   transactionId: 'txn-789' as TransactionId,
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T15:32:00Z',
 * };
 * ```
 */
export interface PatientPaymentCompletedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Invoice identifier */
  invoiceId: InvoiceId;

  /** Payment amount */
  amount: number;

  /** Payment method */
  paymentMethod: PaymentMethod;

  /** Transaction identifier */
  transactionId: TransactionId;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Currency code */
  currency?: string;

  /** Payment processor */
  processor?: string;

  /** Processor transaction ID */
  processorTransactionId?: string;

  /** Processing fee */
  processingFee?: number;

  /** Net amount received */
  netAmount?: number;

  /** Payment confirmation number */
  confirmationNumber?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient payment completed event envelope
 */
export type PatientPaymentCompletedEvent = EventEnvelope<PatientPaymentCompletedPayload>;

/**
 * Patient payment failed event payload
 *
 * Published when a payment attempt fails.
 * CRITICAL: Triggers retry workflows and customer support notifications.
 *
 * @example
 * ```typescript
 * const payload: PatientPaymentFailedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   invoiceId: 'inv-456' as InvoiceId,
 *   amount: 150.00,
 *   errorCode: 'INSUFFICIENT_FUNDS',
 *   errorMessage: 'Payment declined due to insufficient funds',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T15:32:00Z',
 * };
 * ```
 */
export interface PatientPaymentFailedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Invoice identifier */
  invoiceId: InvoiceId;

  /** Payment amount attempted */
  amount: number;

  /** Error code */
  errorCode: PaymentErrorCode;

  /** Error message */
  errorMessage: string;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Payment method attempted */
  paymentMethod?: PaymentMethod;

  /** Payment processor */
  processor?: string;

  /** Processor error code */
  processorErrorCode?: string;

  /** Attempt number */
  attemptNumber?: number;

  /** Whether retry is allowed */
  retryAllowed?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient payment failed event envelope
 */
export type PatientPaymentFailedEvent = EventEnvelope<PatientPaymentFailedPayload>;

// ============================================================================
// 7. PATIENT ENGAGEMENT EVENTS
// ============================================================================

/**
 * Patient loyalty viewed event payload
 *
 * Published when a patient views their loyalty account.
 * Used for program engagement and optimization.
 *
 * @example
 * ```typescript
 * const payload: PatientLoyaltyViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   viewedDate: '2025-11-21T16:00:00Z',
 *   currentPoints: 500,
 *   tier: 'GOLD',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T16:00:00Z',
 * };
 * ```
 */
export interface PatientLoyaltyViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Current loyalty points balance */
  currentPoints: number;

  /** Current loyalty tier */
  tier: LoyaltyTier;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Loyalty account ID */
  loyaltyAccountId?: LoyaltyAccountId;

  /** Points until next tier */
  pointsUntilNextTier?: number;

  /** Available rewards count */
  availableRewardsCount?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient loyalty viewed event envelope
 */
export type PatientLoyaltyViewedEvent = EventEnvelope<PatientLoyaltyViewedPayload>;

/**
 * Patient referral shared event payload
 *
 * Published when a patient shares their referral code.
 * Used for referral program tracking and viral growth metrics.
 *
 * @example
 * ```typescript
 * const payload: PatientReferralSharedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   referralCode: 'JOHN2025',
 *   channel: 'EMAIL',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T16:15:00Z',
 * };
 * ```
 */
export interface PatientReferralSharedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Referral code shared */
  referralCode: string;

  /** Sharing channel */
  channel: ReferralChannel;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Number of recipients */
  recipientCount?: number;

  /** Reward type for referral */
  rewardType?: string;

  /** Reward amount */
  rewardAmount?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient referral shared event envelope
 */
export type PatientReferralSharedEvent = EventEnvelope<PatientReferralSharedPayload>;

/**
 * Patient offer viewed event payload
 *
 * Published when a patient views an offer or promotion.
 * Used for campaign effectiveness and conversion tracking.
 *
 * @example
 * ```typescript
 * const payload: PatientOfferViewedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   offerId: 'offer-456' as OfferId,
 *   viewedDate: '2025-11-21T16:30:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T16:30:00Z',
 * };
 * ```
 */
export interface PatientOfferViewedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Offer identifier */
  offerId: OfferId;

  /** View timestamp */
  viewedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** Offer type */
  offerType?: string;

  /** Offer value */
  offerValue?: number;

  /** Offer expiration date */
  expirationDate?: ISODateString;

  /** Days until expiration */
  daysUntilExpiration?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient offer viewed event envelope
 */
export type PatientOfferViewedEvent = EventEnvelope<PatientOfferViewedPayload>;

/**
 * Patient offer redeemed event payload
 *
 * Published when a patient redeems an offer.
 * Used for campaign ROI and conversion tracking.
 *
 * @example
 * ```typescript
 * const payload: PatientOfferRedeemedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   offerId: 'offer-456' as OfferId,
 *   redeemedDate: '2025-11-21T16:45:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T16:45:00Z',
 * };
 * ```
 */
export interface PatientOfferRedeemedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Offer identifier */
  offerId: OfferId;

  /** Redemption timestamp */
  redeemedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Offer type */
  offerType?: string;

  /** Offer value redeemed */
  offerValue?: number;

  /** Associated transaction or appointment */
  associatedId?: UUID;

  /** Days from view to redemption */
  daysToRedemption?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient offer redeemed event envelope
 */
export type PatientOfferRedeemedEvent = EventEnvelope<PatientOfferRedeemedPayload>;

/**
 * Patient feedback submitted event payload
 *
 * Published when a patient submits feedback.
 * CRITICAL: May trigger service recovery workflows for negative feedback.
 *
 * @example
 * ```typescript
 * const payload: PatientFeedbackSubmittedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   appointmentId: 'appt-456' as AppointmentId,
 *   rating: 5,
 *   category: 'OVERALL_EXPERIENCE',
 *   submittedDate: '2025-11-21T17:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T17:00:00Z',
 * };
 * ```
 */
export interface PatientFeedbackSubmittedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Appointment the feedback is about */
  appointmentId?: AppointmentId;

  /** Rating (1-5 scale) */
  rating: 1 | 2 | 3 | 4 | 5;

  /** Feedback category */
  category: FeedbackCategory;

  /** Submission timestamp */
  submittedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Feedback ID */
  feedbackId?: FeedbackId;

  /** Provider the feedback is about */
  providerId?: ProviderId;

  /** Feedback comment */
  comment?: string;

  /** Whether feedback is public */
  isPublic?: boolean;

  /** Whether patient consents to marketing use */
  marketingConsent?: boolean;

  /** Days after appointment */
  daysAfterAppointment?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient feedback submitted event envelope
 */
export type PatientFeedbackSubmittedEvent = EventEnvelope<PatientFeedbackSubmittedPayload>;

/**
 * Patient NPS submitted event payload
 *
 * Published when a patient submits an NPS score.
 * Used for customer satisfaction tracking and retention prediction.
 *
 * @example
 * ```typescript
 * const payload: PatientNpsSubmittedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   score: 9,
 *   category: 'PROMOTER',
 *   submittedDate: '2025-11-21T17:15:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T17:15:00Z',
 * };
 * ```
 */
export interface PatientNpsSubmittedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** NPS score (0-10) */
  score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  /** NPS category */
  category: NpsCategory;

  /** Submission timestamp */
  submittedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** NPS score ID */
  npsScoreId?: NpsScoreId;

  /** Optional comment */
  comment?: string;

  /** Survey campaign ID */
  campaignId?: UUID;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient NPS submitted event envelope
 */
export type PatientNpsSubmittedEvent = EventEnvelope<PatientNpsSubmittedPayload>;

// ============================================================================
// 8. PATIENT GDPR EVENTS
// ============================================================================

/**
 * Patient data export requested event payload
 *
 * Published when a patient requests their data export (GDPR Right to Access).
 * CRITICAL: Must complete within regulatory timeframes (typically 30 days).
 *
 * @example
 * ```typescript
 * const payload: PatientDataExportRequestedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   requestedDate: '2025-11-21T18:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T18:00:00Z',
 * };
 * ```
 */
export interface PatientDataExportRequestedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Request timestamp */
  requestedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Export format requested */
  format?: 'PDF' | 'JSON' | 'CSV' | 'XML';

  /** Specific data categories requested */
  dataCategories?: string[];

  /** Request ID for tracking */
  requestId?: UUID;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient data export requested event envelope
 */
export type PatientDataExportRequestedEvent = EventEnvelope<PatientDataExportRequestedPayload>;

/**
 * Patient data export downloaded event payload
 *
 * Published when a patient downloads their data export.
 * Used for compliance tracking and request fulfillment metrics.
 *
 * @example
 * ```typescript
 * const payload: PatientDataExportDownloadedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   downloadedDate: '2025-11-23T10:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-23T10:00:00Z',
 * };
 * ```
 */
export interface PatientDataExportDownloadedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Download timestamp */
  downloadedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Export request ID */
  requestId?: UUID;

  /** File size in bytes */
  fileSizeBytes?: number;

  /** Export format */
  format?: string;

  /** Days from request to download */
  daysToDownload?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient data export downloaded event envelope
 */
export type PatientDataExportDownloadedEvent = EventEnvelope<PatientDataExportDownloadedPayload>;

/**
 * Patient deletion requested event payload
 *
 * Published when a patient requests account deletion (GDPR Right to Erasure).
 * CRITICAL: Triggers data anonymization and deletion workflows with legal retention checks.
 *
 * @example
 * ```typescript
 * const payload: PatientDeletionRequestedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   requestedDate: '2025-11-21T18:30:00Z',
 *   reason: 'PATIENT_REQUEST',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T18:30:00Z',
 * };
 * ```
 */
export interface PatientDeletionRequestedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Request timestamp */
  requestedDate: ISODateString;

  /** Deletion reason */
  reason: DeletionReason;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Request ID for tracking */
  requestId?: UUID;

  /** Additional reason details */
  reasonDetails?: string;

  /** Whether patient confirmed understanding */
  confirmed?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient deletion requested event envelope
 */
export type PatientDeletionRequestedEvent = EventEnvelope<PatientDeletionRequestedPayload>;

/**
 * Patient consent updated event payload
 *
 * Published when a patient updates their consent preferences.
 * CRITICAL: Must immediately update consent status to prevent unauthorized communications.
 *
 * @example
 * ```typescript
 * const payload: PatientConsentUpdatedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   consentType: 'MARKETING',
 *   granted: false,
 *   updatedDate: '2025-11-21T18:45:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T18:45:00Z',
 * };
 * ```
 */
export interface PatientConsentUpdatedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Type of consent updated */
  consentType: ConsentType;

  /** Whether consent was granted */
  granted: boolean;

  /** Update timestamp */
  updatedDate: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;

  /** Previous consent status */
  previousGranted?: boolean;

  /** Consent version or policy version */
  consentVersion?: string;

  /** Specific consent details */
  consentDetails?: Record<string, boolean>;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient consent updated event envelope
 */
export type PatientConsentUpdatedEvent = EventEnvelope<PatientConsentUpdatedPayload>;

// ============================================================================
// 9. PATIENT SESSION EVENTS
// ============================================================================

/**
 * Patient session started event payload
 *
 * Published when a patient starts a new portal session.
 * Used for session analytics and engagement tracking.
 *
 * @example
 * ```typescript
 * const payload: PatientSessionStartedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   sessionId: 'sess-456' as SessionId,
 *   startDate: '2025-11-21T10:00:00Z',
 *   device: 'iPhone 15 Pro',
 *   platform: 'IOS',
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface PatientSessionStartedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Session identifier */
  sessionId: SessionId;

  /** Session start timestamp */
  startDate: ISODateString;

  /** Device information */
  device?: string;

  /** Platform */
  platform: MobilePlatform;

  /** IP address */
  ipAddress?: string;

  /** User agent */
  userAgent?: string;

  /** Device type */
  deviceType?: DeviceType;

  /** Browser */
  browser?: string;

  /** Operating system */
  operatingSystem?: string;

  /** Geographic location */
  location?: string;

  /** Referrer URL */
  referrer?: string;

  /** Landing page */
  landingPage?: string;

  /** Whether this is a new device */
  isNewDevice?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient session started event envelope
 */
export type PatientSessionStartedEvent = EventEnvelope<PatientSessionStartedPayload>;

/**
 * Patient session ended event payload
 *
 * Published when a patient session ends.
 * Used for engagement analytics and user experience optimization.
 *
 * @example
 * ```typescript
 * const payload: PatientSessionEndedPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   sessionId: 'sess-456' as SessionId,
 *   endDate: '2025-11-21T11:00:00Z',
 *   duration: 3600,
 *   pagesViewed: 12,
 *   tenantId: 'tenant-abc' as TenantId,
 *   timestamp: '2025-11-21T11:00:00Z',
 * };
 * ```
 */
export interface PatientSessionEndedPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Session identifier */
  sessionId: SessionId;

  /** Session end timestamp */
  endDate: ISODateString;

  /** Session duration in seconds */
  duration: number;

  /** Number of pages viewed */
  pagesViewed: number;

  /** Device information */
  device?: string;

  /** Platform */
  platform?: MobilePlatform;

  /** How session ended */
  endType?: 'LOGOUT' | 'TIMEOUT' | 'CLOSED' | 'EXPIRED';

  /** Actions performed during session */
  actionsPerformed?: number;

  /** Appointments booked */
  appointmentsBooked?: number;

  /** Payments made */
  paymentsMade?: number;

  /** Last page visited */
  lastPage?: string;

  /** Exit page */
  exitPage?: string;

  /** Bounce (single page session) */
  isBounce?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient session ended event envelope
 */
export type PatientSessionEndedEvent = EventEnvelope<PatientSessionEndedPayload>;

// ============================================================================
// 10. PATIENT ERROR EVENTS
// ============================================================================

/**
 * Patient error occurred event payload
 *
 * Published when an error occurs in the patient portal.
 * Used for error monitoring, debugging, and user experience improvement.
 *
 * @example
 * ```typescript
 * const payload: PatientErrorOccurredPayload = {
 *   patientId: 'pat-123' as PatientId,
 *   errorCode: 'PAYMENT_PROCESSING_ERROR',
 *   errorMessage: 'Unable to process payment',
 *   endpoint: '/api/v1/payments',
 *   timestamp: '2025-11-21T15:35:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 * };
 * ```
 */
export interface PatientErrorOccurredPayload {
  /** Patient identifier */
  patientId: PatientId;

  /** Error code */
  errorCode: string;

  /** Error message */
  errorMessage: string;

  /** API endpoint where error occurred */
  endpoint?: string;

  /** Timestamp when error occurred */
  timestamp: ISODateString;

  /** Session context */
  sessionId?: SessionId;
  device?: string;
  platform?: MobilePlatform;
  ipAddress?: string;
  userAgent?: string;

  /** HTTP status code */
  statusCode?: number;

  /** Stack trace (sanitized) */
  stackTrace?: string;

  /** Request ID for debugging */
  requestId?: UUID;

  /** User action that triggered error */
  userAction?: string;

  /** Page where error occurred */
  page?: string;

  /** Component where error occurred */
  component?: string;

  /** Error severity */
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  /** Whether error was recoverable */
  recoverable?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient error occurred event envelope
 */
export type PatientErrorOccurredEvent = EventEnvelope<PatientErrorOccurredPayload>;
