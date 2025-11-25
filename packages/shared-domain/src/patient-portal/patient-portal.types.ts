/**
 * Patient Portal Domain Types
 *
 * Patient-facing DTOs that represent simplified, user-friendly versions of internal domain types.
 * These types are used by the patient portal gateway to expose data to web/mobile apps.
 *
 * **Key Design Principles:**
 * 1. Simplified field names (human-readable, no internal codes)
 * 2. Readable status labels (patient-friendly enum values)
 * 3. Hide internal fields (no audit trails, version numbers, tenant context)
 * 4. Aggregate related data (include full objects, not just IDs)
 * 5. Privacy-first (no cross-patient data, no staff-only fields)
 * 6. Mobile-friendly (formatted dates/amounts, display hints, flat structure)
 *
 * **Compliance:**
 * - HIPAA: PHI protection in all types
 * - GDPR: Right to access, portability, erasure
 * - No internal audit trails exposed to patients
 *
 * @module shared-domain/patient-portal
 */

import type {
  UUID,
  ISODateString,
} from '@dentalos/shared-types';

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

/**
 * Unique identifier for portal-authenticated patient users
 */
export type PatientPortalUserId = UUID & { readonly __brand: 'PatientPortalUserId' };

/**
 * Unique identifier for patient-visible appointments
 */
export type PatientAppointmentId = UUID & { readonly __brand: 'PatientAppointmentId' };

/**
 * Unique identifier for patient-visible invoices
 */
export type PatientInvoiceId = UUID & { readonly __brand: 'PatientInvoiceId' };

/**
 * Unique identifier for patient referral codes
 */
export type PatientReferralCode = string & { readonly __brand: 'PatientReferralCode' };

/**
 * Unique identifier for patient imaging studies
 */
export type PatientImagingStudyId = UUID & { readonly __brand: 'PatientImagingStudyId' };

/**
 * Unique identifier for patient treatment plans
 */
export type PatientTreatmentPlanId = UUID & { readonly __brand: 'PatientTreatmentPlanId' };

/**
 * Unique identifier for patient payment records
 */
export type PatientPaymentId = UUID & { readonly __brand: 'PatientPaymentId' };

// ============================================================================
// 1. PATIENT-FACING AUTH TYPES
// ============================================================================

/**
 * Patient login request
 *
 * Used for email/password authentication in patient portal.
 *
 * Real-world workflow:
 * 1. Patient enters email and password
 * 2. Backend validates credentials
 * 3. Returns access token + refresh token
 * 4. May trigger MFA challenge if enabled
 *
 * Edge cases:
 * - Email should be case-insensitive
 * - Password strength enforced during registration (not login)
 * - Failed login attempts tracked (rate limiting)
 * - Account lockout after N failed attempts
 */
export interface PatientLoginRequest {
  /** Patient email address (case-insensitive) */
  email: string;
  /** Patient password (plaintext, hashed by backend) */
  password: string;
  /** Optional: Device identifier for trusted device tracking */
  deviceId?: string;
  /** Optional: Remember me flag for extended session */
  rememberMe?: boolean;
}

/**
 * Patient login response
 *
 * Returned after successful authentication.
 *
 * Edge cases:
 * - If MFA enabled, mfaRequired=true and tokens not issued yet
 * - Access token short-lived (15 min typical)
 * - Refresh token long-lived (30 days typical)
 * - Patient profile included for immediate UI rendering
 */
export interface PatientLoginResponse {
  /** JWT access token (short-lived, 15 min) */
  accessToken: string;
  /** JWT refresh token (long-lived, 30 days) */
  refreshToken: string;
  /** Patient profile data */
  patient: PatientProfileSummary;
  /** MFA required before tokens issued */
  mfaRequired?: boolean;
  /** MFA challenge details (if MFA required) */
  mfaChallenge?: PatientMfaChallenge;
  /** Token expiration timestamp */
  expiresAt: ISODateString;
}

/**
 * Patient registration request
 *
 * Used for new patient self-registration in portal.
 *
 * Real-world workflow:
 * 1. Patient fills registration form
 * 2. Backend creates patient record + auth user
 * 3. Sends email verification link
 * 4. Patient verifies email to activate account
 *
 * Edge cases:
 * - Email must be unique (reject duplicates)
 * - Date of birth required for identity verification
 * - Phone number required for appointment reminders
 * - Password strength enforced (8+ chars, mixed case, number, special)
 * - Marketing consent opt-in (GDPR/TCPA compliant)
 * - Account inactive until email verified
 */
export interface PatientRegisterRequest {
  /** Email address (must be unique) */
  email: string;
  /** Password (min 8 chars, strength enforced) */
  password: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Date of birth (required for identity verification) */
  dateOfBirth: ISODateString;
  /** Phone number (E.164 format: +1234567890) */
  phone: string;
  /** Optional: Marketing consent opt-in */
  marketingConsent?: boolean;
  /** Optional: Referral code (if referred by existing patient) */
  referralCode?: string;
}

/**
 * MFA challenge methods
 *
 * Multi-factor authentication options for patient portal.
 *
 * Edge cases:
 * - SMS: Send 6-digit code via SMS (TCPA consent required)
 * - EMAIL: Send 6-digit code via email (less secure, but accessible)
 * - TOTP: Time-based one-time password (Google Authenticator, Authy)
 */
export enum PatientMfaMethod {
  /** SMS verification code */
  SMS = 'SMS',
  /** Email verification code */
  EMAIL = 'EMAIL',
  /** Time-based one-time password (TOTP) */
  TOTP = 'TOTP',
}

/**
 * MFA challenge details
 *
 * Issued when MFA verification required.
 *
 * Edge cases:
 * - Challenge ID single-use (expires after verification or timeout)
 * - Masked contact info for security (show last 4 digits)
 * - Expiration typically 5-10 minutes
 * - Code resend limited (max 3 attempts)
 */
export interface PatientMfaChallenge {
  /** Unique challenge identifier (single-use) */
  challengeId: string;
  /** MFA method used */
  method: PatientMfaMethod;
  /** Masked contact info (e.g., "***-***-1234" for phone) */
  maskedContact: string;
  /** Challenge expiration timestamp */
  expiresAt: ISODateString;
  /** Remaining resend attempts */
  remainingResendAttempts: number;
}

/**
 * MFA verification request
 *
 * Submit MFA code for verification.
 *
 * Edge cases:
 * - Code typically 6 digits
 * - Limited verification attempts (3-5)
 * - Challenge expires after timeout or successful verification
 * - Invalid codes tracked (rate limiting)
 */
export interface PatientMfaVerification {
  /** MFA challenge identifier */
  challengeId: string;
  /** Verification code (6 digits) */
  code: string;
  /** Optional: Trust this device (skip MFA for 30 days) */
  trustDevice?: boolean;
}

/**
 * Patient profile (aggregated from auth + patient service)
 *
 * Complete patient profile combining auth and clinical data.
 *
 * Real-world usage:
 * - Displayed in portal dashboard
 * - Used for profile management
 * - Contains aggregated data from multiple services
 *
 * Edge cases:
 * - Profile aggregated from multiple microservices
 * - Some fields may be optional (not all patients provide full data)
 * - Email verified status affects portal features (booking requires verified email)
 * - Account active status gates portal access
 */
export interface PatientProfile {
  /** Patient identifier */
  id: PatientPortalUserId;
  /** Email address */
  email: string;
  /** Email verified status */
  emailVerified: boolean;
  /** Phone number */
  phone: string;
  /** Phone verified status */
  phoneVerified: boolean;
  /** Account active (can login and use portal) */
  isActive: boolean;
  /** MFA enabled */
  mfaEnabled: boolean;
  /** Preferred MFA method (if enabled) */
  preferredMfaMethod?: PatientMfaMethod;
  /** Patient profile summary */
  profile: PatientProfileSummary;
  /** Contact information */
  contactInfo: PatientContactInfo;
  /** Communication preferences */
  communicationPreferences: PatientCommunicationPreferences;
  /** Notification preferences */
  notificationPreferences: PatientNotificationPreferences;
}

// ============================================================================
// 2. PATIENT-FACING PROFILE TYPES
// ============================================================================

/**
 * Patient profile summary
 *
 * Essential patient information for display in portal.
 *
 * Edge cases:
 * - Avatar URL may be null (show default avatar)
 * - Preferred name overrides first name in greetings
 * - Age calculated from date of birth client-side
 * - Gender displayed as patient prefers (respect identity)
 */
export interface PatientProfileSummary {
  /** Patient identifier */
  id: PatientPortalUserId;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Preferred name (used for greetings) */
  preferredName?: string;
  /** Full display name (computed: preferredName || firstName lastName) */
  fullName: string;
  /** Date of birth */
  dateOfBirth: ISODateString;
  /** Gender */
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Avatar image URL */
  avatarUrl?: string;
}

/**
 * Patient contact information
 *
 * Contact details for patient communications.
 *
 * Real-world usage:
 * - Editable in profile settings
 * - Address required for insurance claims
 * - Emergency contact displayed (not editable in some clinics)
 *
 * Edge cases:
 * - Multiple addresses supported (home, billing)
 * - Address validation for insurance purposes
 * - Emergency contact may be required for minors
 */
export interface PatientContactInfo {
  /** Primary email address */
  email: string;
  /** Email verified */
  emailVerified: boolean;
  /** Primary phone number */
  phone: string;
  /** Phone verified */
  phoneVerified: boolean;
  /** Home address */
  address?: PatientAddress;
  /** Emergency contact name */
  emergencyContactName?: string;
  /** Emergency contact phone */
  emergencyContactPhone?: string;
  /** Emergency contact relationship */
  emergencyContactRelationship?: string;
}

/**
 * Patient address (simplified)
 *
 * Simplified address structure for patient portal.
 *
 * Edge cases:
 * - street2 optional (apartment, suite, etc.)
 * - Postal code validation varies by country
 * - Address used for insurance, billing, shipping
 */
export interface PatientAddress {
  /** Street address line 1 */
  street1: string;
  /** Street address line 2 (optional) */
  street2?: string;
  /** City */
  city: string;
  /** State/province */
  state: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country (ISO 3166-1 alpha-2 code) */
  country: string;
}

/**
 * Patient communication preferences
 *
 * How patient prefers to be contacted.
 *
 * Real-world usage:
 * - Managed in portal preference center
 * - Affects campaign delivery (marketing consent)
 * - GDPR/TCPA compliant (explicit opt-in required)
 *
 * Edge cases:
 * - Email enabled but marketing consent false = transactional only
 * - SMS requires explicit opt-in (TCPA compliance in US)
 * - Push requires app installation + permission grant
 * - Marketing consent withdrawal honored immediately
 */
export interface PatientCommunicationPreferences {
  /** Email communications enabled (transactional + marketing) */
  emailEnabled: boolean;
  /** SMS communications enabled */
  smsEnabled: boolean;
  /** Push notifications enabled (requires mobile app) */
  pushEnabled: boolean;
  /** Marketing communications consent */
  marketingConsent: boolean;
  /** Marketing consent date (when granted) */
  marketingConsentDate?: ISODateString;
}

/**
 * Patient notification preferences
 *
 * Specific notification types patient wants to receive.
 *
 * Real-world usage:
 * - Granular control over notification types
 * - Separate from communication preferences (channel vs content)
 * - Appointment reminders typically always on (transactional)
 *
 * Edge cases:
 * - Appointment reminders cannot be fully disabled (transactional)
 * - Treatment updates include pre/post-op instructions
 * - Billing alerts include overdue notices, payment confirmations
 * - Recall reminders for preventive care (6-month cleanings)
 */
export interface PatientNotificationPreferences {
  /** Appointment reminders (24h, 1h before) */
  appointmentReminders: boolean;
  /** Treatment updates (pre-op, post-op instructions) */
  treatmentUpdates: boolean;
  /** Billing alerts (invoices, payment confirmations) */
  billingAlerts: boolean;
  /** Recall reminders (6-month cleanings) */
  recallReminders: boolean;
  /** Loyalty program updates (points earned, tier changes) */
  loyaltyUpdates: boolean;
  /** Special offers and promotions */
  promotionalOffers: boolean;
}

// ============================================================================
// 3. PATIENT-FACING APPOINTMENT TYPES
// ============================================================================

/**
 * Patient appointment status (simplified)
 *
 * Patient-friendly status labels.
 *
 * Mapping from internal status:
 * - UPCOMING: SCHEDULED, CONFIRMED
 * - COMPLETED: COMPLETED
 * - CANCELLED: CANCELLED
 * - NO_SHOW: NO_SHOW
 *
 * Edge cases:
 * - UPCOMING includes both scheduled and confirmed
 * - COMPLETED shown in history, not editable
 * - CANCELLED shows cancellation reason
 * - NO_SHOW may affect future booking privileges
 */
export enum PatientAppointmentStatus {
  /** Appointment scheduled (not yet occurred) */
  UPCOMING = 'UPCOMING',
  /** Appointment completed */
  COMPLETED = 'COMPLETED',
  /** Appointment cancelled */
  CANCELLED = 'CANCELLED',
  /** Patient did not show up */
  NO_SHOW = 'NO_SHOW',
}

/**
 * Patient appointment
 *
 * Patient-facing appointment details.
 *
 * Real-world usage:
 * - Displayed in portal appointment list
 * - Includes provider and location details (not just IDs)
 * - Formatted for mobile display (date, time, duration)
 *
 * Edge cases:
 * - Provider name shown (not internal provider ID)
 * - Location address shown (not internal clinic ID)
 * - Reason shown as service name (e.g., "Cleaning" not "CLEANING_PROPHYLAXIS")
 * - Notes may include special instructions (fasting, pre-medication)
 * - Cancellable flag indicates if patient can cancel (within policy)
 * - Reschedulable flag indicates if patient can reschedule
 */
export interface PatientAppointment {
  /** Appointment identifier */
  id: PatientAppointmentId;
  /** Appointment date (ISO date string: YYYY-MM-DD) */
  date: string;
  /** Appointment time (ISO time string: HH:mm) */
  time: string;
  /** Duration in minutes */
  durationMinutes: number;
  /** Formatted duration (e.g., "1 hour 30 minutes") */
  durationFormatted: string;
  /** Provider name */
  providerName: string;
  /** Provider title (e.g., "DDS", "DMD") */
  providerTitle?: string;
  /** Provider avatar URL */
  providerAvatarUrl?: string;
  /** Location name */
  locationName: string;
  /** Location address */
  locationAddress: string;
  /** Location phone */
  locationPhone: string;
  /** Appointment status */
  status: PatientAppointmentStatus;
  /** Service/reason for visit (e.g., "Cleaning", "Crown Prep") */
  reason: string;
  /** Service description */
  reasonDescription?: string;
  /** Appointment notes (special instructions) */
  notes?: string;
  /** Can patient cancel this appointment */
  canCancel: boolean;
  /** Can patient reschedule this appointment */
  canReschedule: boolean;
  /** Cancellation deadline (if cancellable) */
  cancellationDeadline?: ISODateString;
  /** Confirmation required */
  confirmationRequired: boolean;
  /** Confirmed by patient */
  isConfirmed: boolean;
}

/**
 * Patient appointment booking request
 *
 * Request to book new appointment via patient portal.
 *
 * Real-world workflow:
 * 1. Patient selects provider (or any available)
 * 2. Patient selects service type
 * 3. Portal shows available time slots
 * 4. Patient selects date/time
 * 5. Patient adds optional notes
 * 6. Booking submitted for approval
 *
 * Edge cases:
 * - Provider ID optional (allows "any available provider")
 * - Service code from catalog (validated against clinic services)
 * - Date/time must be available slot (checked server-side)
 * - Notes may include special requests (anxiety, accessibility)
 * - New patient flag triggers additional registration steps
 * - Insurance info may be required for certain services
 */
export interface PatientAppointmentBooking {
  /** Preferred provider ID (optional, "any available" if omitted) */
  providerId?: string;
  /** Service code (from service catalog) */
  serviceCode: string;
  /** Preferred date (ISO date string: YYYY-MM-DD) */
  preferredDate: string;
  /** Preferred time (ISO time string: HH:mm) */
  preferredTime: string;
  /** Optional: Patient notes or special requests */
  notes?: string;
  /** New patient (first visit) */
  isNewPatient?: boolean;
  /** Reason for visit (free text, in addition to service code) */
  reasonForVisit?: string;
}

/**
 * Patient appointment reschedule request
 *
 * Request to reschedule existing appointment.
 *
 * Real-world workflow:
 * 1. Patient selects appointment to reschedule
 * 2. Portal shows available alternative time slots
 * 3. Patient selects new date/time
 * 4. Patient provides reason for reschedule
 * 5. Reschedule submitted (may require approval)
 *
 * Edge cases:
 * - Must reschedule before cancellation deadline
 * - Reason optional but encouraged (analytics)
 * - New slot must be available (validated server-side)
 * - Multiple reschedules may incur fees (policy-dependent)
 * - Emergency reschedules may bypass deadline
 */
export interface PatientAppointmentReschedule {
  /** New preferred date (ISO date string: YYYY-MM-DD) */
  newDate: string;
  /** New preferred time (ISO time string: HH:mm) */
  newTime: string;
  /** Reason for rescheduling */
  reason?: string;
}

/**
 * Patient appointment cancellation request
 *
 * Request to cancel appointment.
 *
 * Edge cases:
 * - Cancellation reason required for analytics
 * - Late cancellations may incur fees (policy-dependent)
 * - Excessive cancellations may restrict future bookings
 */
export interface PatientAppointmentCancellation {
  /** Reason for cancellation */
  reason: string;
}

// ============================================================================
// 4. PATIENT-FACING CLINICAL TYPES
// ============================================================================

/**
 * Patient clinical summary
 *
 * High-level overview of patient's clinical status.
 *
 * Real-world usage:
 * - Displayed in portal dashboard
 * - Shows critical medical information
 * - Last visit date for recall tracking
 *
 * Edge cases:
 * - Conditions shown as active only (resolved not displayed)
 * - Allergies prominently displayed (safety critical)
 * - Alerts may include pre-medication requirements
 * - Last visit null for new patients
 */
export interface PatientClinicalSummary {
  /** Active conditions (e.g., "Gingivitis", "Bruxism") */
  conditions: string[];
  /** Known allergies (e.g., "Penicillin", "Latex") */
  allergies: PatientAllergy[];
  /** Clinical alerts (e.g., "Requires pre-medication", "High anxiety") */
  alerts: string[];
  /** Last visit date */
  lastVisit?: ISODateString;
  /** Last visit provider name */
  lastVisitProvider?: string;
  /** Next recommended visit date */
  nextRecommendedVisit?: ISODateString;
  /** Recall overdue (6+ months since last visit) */
  recallOverdue: boolean;
}

/**
 * Patient visit record
 *
 * Summary of completed appointment.
 *
 * Real-world usage:
 * - Shown in visit history
 * - Includes procedures performed
 * - Shows provider notes (patient-facing only)
 * - Next steps for follow-up care
 *
 * Edge cases:
 * - Notes sanitized (clinical jargon simplified)
 * - Procedures shown with patient-friendly names
 * - Next steps may include post-op instructions
 * - Attachments may include X-rays, photos
 */
export interface PatientVisit {
  /** Visit identifier */
  id: string;
  /** Visit date */
  date: ISODateString;
  /** Provider name */
  providerName: string;
  /** Procedures performed */
  procedures: PatientProcedure[];
  /** Provider notes (patient-facing) */
  notes?: string;
  /** Next steps / follow-up instructions */
  nextSteps?: string;
  /** Attachments (X-rays, photos) */
  attachments?: PatientVisitAttachment[];
}

/**
 * Patient visit attachment
 *
 * Images or documents from visit.
 *
 * Edge cases:
 * - Thumbnail for quick preview
 * - Full URL requires authentication
 * - File type indicates rendering (image, PDF, etc.)
 */
export interface PatientVisitAttachment {
  /** Attachment identifier */
  id: string;
  /** File name */
  fileName: string;
  /** File type (image/jpeg, application/pdf, etc.) */
  fileType: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Full file URL (authenticated) */
  fileUrl: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Upload date */
  uploadedAt: ISODateString;
}

/**
 * Patient treatment plan status
 *
 * Status of treatment plan from patient perspective.
 *
 * Edge cases:
 * - DRAFT: Created by provider, not yet presented to patient
 * - PROPOSED: Presented to patient, awaiting decision
 * - ACCEPTED: Patient accepted, awaiting scheduling
 * - IN_PROGRESS: Appointments scheduled, treatment started
 * - COMPLETED: All procedures completed
 * - DECLINED: Patient declined treatment
 */
export enum PatientTreatmentPlanStatus {
  /** Treatment plan proposed, awaiting patient decision */
  PROPOSED = 'PROPOSED',
  /** Patient accepted treatment plan */
  ACCEPTED = 'ACCEPTED',
  /** Treatment in progress */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Treatment completed */
  COMPLETED = 'COMPLETED',
  /** Patient declined treatment */
  DECLINED = 'DECLINED',
}

/**
 * Patient treatment plan
 *
 * Proposed or active treatment plan.
 *
 * Real-world usage:
 * - Shown in portal for review and acceptance
 * - Includes cost estimate with insurance breakdown
 * - Procedures listed with descriptions
 * - Payment plan options shown
 *
 * Edge cases:
 * - Estimated cost may change (insurance verification)
 * - Patient responsibility after insurance estimate
 * - Acceptance required before scheduling
 * - Multiple payment plan options may be offered
 * - Treatment plan may span multiple visits
 */
export interface PatientTreatmentPlan {
  /** Treatment plan identifier */
  id: PatientTreatmentPlanId;
  /** Treatment plan name */
  name: string;
  /** Description */
  description: string;
  /** Provider who created plan */
  providerName: string;
  /** Procedures in this plan */
  procedures: PatientTreatmentPlanProcedure[];
  /** Total estimated cost */
  estimatedCost: number;
  /** Currency (USD, EUR, etc.) */
  currency: string;
  /** Formatted cost (e.g., "$1,234.56") */
  estimatedCostFormatted: string;
  /** Estimated insurance coverage */
  insuranceCoverage?: number;
  /** Patient responsibility (estimated) */
  patientResponsibility?: number;
  /** Patient responsibility formatted */
  patientResponsibilityFormatted?: string;
  /** Treatment plan status */
  status: PatientTreatmentPlanStatus;
  /** Date plan created */
  createdDate: ISODateString;
  /** Date patient accepted plan */
  acceptedDate?: ISODateString;
  /** Estimated completion date */
  estimatedCompletionDate?: ISODateString;
  /** Payment plan available */
  paymentPlanAvailable: boolean;
  /** Payment plan options */
  paymentPlanOptions?: PatientPaymentPlanOption[];
}

/**
 * Treatment plan procedure
 *
 * Individual procedure within treatment plan.
 *
 * Edge cases:
 * - Tooth number may be null for full-mouth procedures
 * - Surface may be specified for fillings (M, O, D, etc.)
 * - Priority indicates order of treatment
 * - Urgent procedures highlighted
 */
export interface PatientTreatmentPlanProcedure {
  /** Procedure identifier */
  id: string;
  /** Procedure name (patient-friendly) */
  name: string;
  /** Description */
  description: string;
  /** Tooth number(s) */
  toothNumbers?: number[];
  /** Surface (for fillings: M, O, D, B, L) */
  surface?: string;
  /** Estimated cost */
  estimatedCost: number;
  /** Estimated cost formatted */
  estimatedCostFormatted: string;
  /** Priority (1=highest) */
  priority: number;
  /** Urgent procedure */
  isUrgent: boolean;
  /** Procedure status */
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  /** Scheduled appointment (if scheduled) */
  scheduledAppointment?: PatientAppointment;
}

/**
 * Payment plan option
 *
 * Available payment plan for treatment.
 *
 * Real-world usage:
 * - Multiple options shown (e.g., 3-month, 6-month, 12-month)
 * - Monthly payment calculated
 * - Interest rate shown (if applicable)
 *
 * Edge cases:
 * - Interest-free periods common (3-6 months)
 * - Down payment may be required
 * - Approval may be required for high amounts
 */
export interface PatientPaymentPlanOption {
  /** Plan identifier */
  id: string;
  /** Plan name (e.g., "3-Month Plan") */
  name: string;
  /** Number of months */
  months: number;
  /** Monthly payment amount */
  monthlyPayment: number;
  /** Monthly payment formatted */
  monthlyPaymentFormatted: string;
  /** Interest rate (annual percentage) */
  interestRate: number;
  /** Interest-free period */
  interestFree: boolean;
  /** Down payment required */
  downPayment?: number;
  /** Down payment formatted */
  downPaymentFormatted?: string;
  /** Total amount with interest */
  totalAmount: number;
  /** Total amount formatted */
  totalAmountFormatted: string;
}

/**
 * Patient procedure
 *
 * Simplified procedure information for patient view.
 *
 * Edge cases:
 * - Name patient-friendly (not clinical codes)
 * - Description simplified (no jargon)
 * - Tooth number null for full-mouth procedures
 * - Date shown, provider name shown
 */
export interface PatientProcedure {
  /** Procedure name (patient-friendly) */
  name: string;
  /** Description */
  description: string;
  /** Tooth number */
  toothNumber?: number;
  /** Date performed */
  date: ISODateString;
  /** Provider who performed procedure */
  providerName: string;
  /** Cost (if billed separately) */
  cost?: number;
  /** Cost formatted */
  costFormatted?: string;
}

/**
 * Patient condition status
 *
 * Status of diagnosed condition.
 *
 * Edge cases:
 * - ACTIVE: Currently being treated or monitored
 * - RESOLVED: No longer active, treatment successful
 */
export enum PatientConditionStatus {
  /** Active condition */
  ACTIVE = 'ACTIVE',
  /** Resolved condition */
  RESOLVED = 'RESOLVED',
}

/**
 * Patient condition
 *
 * Diagnosed medical/dental condition.
 *
 * Edge cases:
 * - Name patient-friendly (not ICD codes)
 * - Notes may include management instructions
 * - Resolved conditions hidden from main view
 */
export interface PatientCondition {
  /** Condition name */
  name: string;
  /** Date diagnosed */
  diagnosedDate: ISODateString;
  /** Condition status */
  status: PatientConditionStatus;
  /** Management notes (patient-facing) */
  notes?: string;
}

/**
 * Allergy severity
 *
 * Severity level of allergic reaction.
 *
 * Edge cases:
 * - MILD: Minor reaction (rash, itching)
 * - MODERATE: Significant reaction (swelling, difficulty breathing)
 * - SEVERE: Life-threatening (anaphylaxis)
 */
export enum PatientAllergySeverity {
  /** Mild reaction */
  MILD = 'MILD',
  /** Moderate reaction */
  MODERATE = 'MODERATE',
  /** Severe reaction */
  SEVERE = 'SEVERE',
}

/**
 * Patient allergy
 *
 * Known allergen and reaction.
 *
 * Real-world usage:
 * - Prominently displayed in clinical summary
 * - Severity shown with color coding (red=severe)
 * - Reaction description shown for provider reference
 *
 * Edge cases:
 * - Substance may be medication, material (latex), food
 * - Reaction describes symptoms (hives, swelling, etc.)
 * - Severe allergies highlighted in all clinical views
 */
export interface PatientAllergy {
  /** Allergen substance */
  substance: string;
  /** Severity level */
  severity: PatientAllergySeverity;
  /** Reaction description */
  reaction: string;
  /** Date diagnosed/reported */
  diagnosedDate: ISODateString;
}

// ============================================================================
// 5. PATIENT-FACING IMAGING TYPES
// ============================================================================

/**
 * Patient imaging type
 *
 * Type of imaging study.
 *
 * Edge cases:
 * - XRAY: Periapical, bitewing, panoramic
 * - CBCT: Cone beam CT for implants, orthodontics
 * - INTRAORAL_SCAN: Digital impression
 * - PHOTO: Clinical photographs
 */
export enum PatientImagingType {
  /** X-ray imaging */
  XRAY = 'XRAY',
  /** Cone beam CT */
  CBCT = 'CBCT',
  /** Intraoral scan (digital impression) */
  INTRAORAL_SCAN = 'INTRAORAL_SCAN',
  /** Clinical photograph */
  PHOTO = 'PHOTO',
}

/**
 * Patient imaging study
 *
 * Imaging study viewable by patient.
 *
 * Real-world usage:
 * - Shown in portal imaging gallery
 * - Viewer URL opens web-based DICOM viewer
 * - Thumbnail for quick preview
 * - Region description shown (e.g., "Upper right quadrant")
 *
 * Edge cases:
 * - Viewer URL authenticated (patient-specific token)
 * - Thumbnail may be null for 3D scans (use placeholder)
 * - Teeth involved shown for targeted imaging
 * - Provider interpretation shown (patient-friendly summary)
 */
export interface PatientImagingStudy {
  /** Study identifier */
  id: PatientImagingStudyId;
  /** Study date */
  date: ISODateString;
  /** Imaging type */
  type: PatientImagingType;
  /** Type display name (e.g., "Panoramic X-ray") */
  typeDisplayName: string;
  /** Region description */
  region: string;
  /** Teeth involved */
  teethInvolved?: number[];
  /** Viewer URL (web-based viewer) */
  viewerUrl: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Provider who ordered study */
  orderedBy: string;
  /** Provider interpretation (patient-facing summary) */
  interpretation?: string;
  /** Number of images in study */
  imageCount: number;
}

// ============================================================================
// 6. PATIENT-FACING BILLING TYPES
// ============================================================================

/**
 * Patient invoice status (simplified)
 *
 * Patient-friendly invoice status.
 *
 * Mapping from internal status:
 * - DRAFT: Not shown to patient
 * - OUTSTANDING: SENT, PARTIALLY_PAID
 * - OVERDUE: OVERDUE
 * - PAID: PAID
 * - CANCELLED: VOID, CANCELLED
 *
 * Edge cases:
 * - OUTSTANDING includes partially paid invoices
 * - OVERDUE highlighted in red (urgent attention)
 * - PAID shown in history
 * - CANCELLED shown with reason
 */
export enum PatientInvoiceStatus {
  /** Invoice outstanding (unpaid or partially paid) */
  OUTSTANDING = 'OUTSTANDING',
  /** Invoice overdue (past due date) */
  OVERDUE = 'OVERDUE',
  /** Invoice paid in full */
  PAID = 'PAID',
  /** Invoice cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Patient invoice
 *
 * Invoice viewable and payable by patient.
 *
 * Real-world usage:
 * - Shown in portal billing section
 * - Includes itemized charges
 * - Pay now button for outstanding invoices
 * - Downloadable PDF receipt
 *
 * Edge cases:
 * - Invoice number shown for reference
 * - Date and due date prominently displayed
 * - Total, amount due, amount paid shown separately
 * - Insurance coverage shown (if applicable)
 * - Payment methods accepted shown
 * - Late fees calculated and shown
 */
export interface PatientInvoice {
  /** Invoice identifier */
  id: PatientInvoiceId;
  /** Invoice number (for reference) */
  invoiceNumber: string;
  /** Invoice date */
  date: ISODateString;
  /** Due date */
  dueDate: ISODateString;
  /** Days overdue (if overdue) */
  daysOverdue?: number;
  /** Invoice status */
  status: PatientInvoiceStatus;
  /** Line items */
  items: PatientInvoiceItem[];
  /** Subtotal (before tax) */
  subtotal: number;
  /** Subtotal formatted */
  subtotalFormatted: string;
  /** Tax amount */
  tax: number;
  /** Tax formatted */
  taxFormatted: string;
  /** Total amount */
  total: number;
  /** Total formatted */
  totalFormatted: string;
  /** Amount paid so far */
  amountPaid: number;
  /** Amount paid formatted */
  amountPaidFormatted: string;
  /** Amount still due */
  amountDue: number;
  /** Amount due formatted */
  amountDueFormatted: string;
  /** Insurance coverage amount */
  insuranceCoverage?: number;
  /** Insurance coverage formatted */
  insuranceCoverageFormatted?: string;
  /** Patient responsibility (after insurance) */
  patientResponsibility?: number;
  /** Patient responsibility formatted */
  patientResponsibilityFormatted?: string;
  /** Currency (USD, EUR, etc.) */
  currency: string;
  /** Invoice PDF URL (downloadable) */
  pdfUrl?: string;
  /** Can pay online */
  canPayOnline: boolean;
  /** Payment methods accepted */
  paymentMethodsAccepted: string[];
}

/**
 * Patient invoice item
 *
 * Individual line item on invoice.
 *
 * Edge cases:
 * - Description patient-friendly (not clinical codes)
 * - Tooth number shown for dental procedures
 * - Quantity shown (e.g., 2 crowns)
 * - Unit price and total shown
 */
export interface PatientInvoiceItem {
  /** Item description */
  description: string;
  /** Tooth number (if applicable) */
  toothNumber?: number;
  /** Quantity */
  quantity: number;
  /** Unit price */
  unitPrice: number;
  /** Unit price formatted */
  unitPriceFormatted: string;
  /** Total (quantity * unitPrice) */
  total: number;
  /** Total formatted */
  totalFormatted: string;
  /** Service date (when procedure performed) */
  serviceDate?: ISODateString;
  /** Provider name */
  providerName?: string;
}

/**
 * Patient payment
 *
 * Payment record for patient view.
 *
 * Real-world usage:
 * - Shown in payment history
 * - Includes payment method (last 4 of card)
 * - Receipt downloadable
 * - Applied to specific invoices
 *
 * Edge cases:
 * - Payment method masked (show last 4 digits only)
 * - Receipt URL authenticated
 * - Multiple invoices may be paid in one payment
 * - Status shown (completed, pending, failed)
 */
export interface PatientPayment {
  /** Payment identifier */
  id: PatientPaymentId;
  /** Payment date */
  date: ISODateString;
  /** Payment amount */
  amount: number;
  /** Amount formatted */
  amountFormatted: string;
  /** Payment method (e.g., "Visa •••• 1234") */
  paymentMethod: string;
  /** Invoice number paid */
  invoiceNumber: string;
  /** Payment status */
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  /** Receipt URL (downloadable) */
  receiptUrl?: string;
  /** Currency */
  currency: string;
  /** Confirmation number */
  confirmationNumber?: string;
}

/**
 * Patient balance summary
 *
 * Overall financial status for patient.
 *
 * Real-world usage:
 * - Shown in portal dashboard
 * - Highlights outstanding balance
 * - Shows next payment due date
 * - Credit balance shown (overpayment)
 *
 * Edge cases:
 * - Total balance may be zero (all paid)
 * - Overdue amount highlighted (urgent)
 * - Credit balance may be applied to future invoices
 * - Payment plan shown if active
 */
export interface PatientBalance {
  /** Total outstanding balance */
  total: number;
  /** Total formatted */
  totalFormatted: string;
  /** Overdue amount (past due date) */
  overdue: number;
  /** Overdue formatted */
  overdueFormatted: string;
  /** Next payment due date */
  nextDueDate?: ISODateString;
  /** Next payment amount due */
  nextDueAmount?: number;
  /** Next payment amount formatted */
  nextDueAmountFormatted?: string;
  /** Credit balance (overpayment) */
  creditBalance?: number;
  /** Credit balance formatted */
  creditBalanceFormatted?: string;
  /** Active payment plan */
  hasPaymentPlan: boolean;
  /** Payment plan details (if active) */
  paymentPlan?: PatientActivePaymentPlan;
  /** Currency */
  currency: string;
}

/**
 * Active payment plan summary
 *
 * Current payment plan details.
 *
 * Edge cases:
 * - Next payment date shown prominently
 * - Remaining balance shown
 * - Payment history accessible
 */
export interface PatientActivePaymentPlan {
  /** Plan identifier */
  id: string;
  /** Plan name */
  name: string;
  /** Monthly payment amount */
  monthlyPayment: number;
  /** Monthly payment formatted */
  monthlyPaymentFormatted: string;
  /** Next payment date */
  nextPaymentDate: ISODateString;
  /** Remaining balance */
  remainingBalance: number;
  /** Remaining balance formatted */
  remainingBalanceFormatted: string;
  /** Remaining payments */
  remainingPayments: number;
}

/**
 * Patient payment request
 *
 * Request to make payment on invoice.
 *
 * Real-world workflow:
 * 1. Patient selects invoice to pay
 * 2. Patient enters payment amount (full or partial)
 * 3. Patient selects payment method
 * 4. Patient enters payment details (card, bank)
 * 5. Optional: Save card for future payments
 * 6. Payment processed via PSP (Stripe, etc.)
 *
 * Edge cases:
 * - Amount must be > 0 and <= amount due
 * - Partial payments allowed (unless policy restricts)
 * - Payment method tokenized (not raw card data)
 * - Save card requires explicit consent
 * - Payment processing may take time (async)
 */
export interface PatientPaymentRequest {
  /** Invoice ID to pay */
  invoiceId: PatientInvoiceId;
  /** Payment amount */
  amount: number;
  /** Payment method (card, bank, etc.) */
  paymentMethod: 'card' | 'bank' | 'paypal' | 'other';
  /** Payment method token (from PSP) */
  paymentMethodToken: string;
  /** Save payment method for future use */
  savePaymentMethod?: boolean;
  /** Billing address (required for card payments) */
  billingAddress?: PatientAddress;
}

// ============================================================================
// 7. PATIENT-FACING ENGAGEMENT TYPES
// ============================================================================

/**
 * Patient loyalty tier
 *
 * Loyalty program membership level.
 *
 * Edge cases:
 * - Tiers based on points accumulated
 * - Benefits increase with tier
 * - Tier thresholds shown
 */
export enum PatientLoyaltyTier {
  /** Bronze tier (entry level) */
  BRONZE = 'BRONZE',
  /** Silver tier */
  SILVER = 'SILVER',
  /** Gold tier */
  GOLD = 'GOLD',
  /** Platinum tier (VIP) */
  PLATINUM = 'PLATINUM',
}

/**
 * Patient loyalty account
 *
 * Loyalty program membership details.
 *
 * Real-world usage:
 * - Shown in portal rewards section
 * - Current points balance prominently displayed
 * - Progress to next tier shown
 * - Points expiration shown
 *
 * Edge cases:
 * - Current tier shown with benefits
 * - Points to next tier calculated
 * - Lifetime points tracked (not just current)
 * - Points expiration warnings shown
 */
export interface PatientLoyaltyAccount {
  /** Current points balance */
  currentPoints: number;
  /** Current loyalty tier */
  tier: PatientLoyaltyTier;
  /** Tier display name */
  tierDisplayName: string;
  /** Tier benefits */
  tierBenefits: string[];
  /** Points to next tier */
  pointsToNextTier: number;
  /** Next tier name */
  nextTierName?: string;
  /** Lifetime points earned */
  lifetimePoints: number;
  /** Points expiring soon */
  pointsExpiringSoon?: number;
  /** Expiration date for expiring points */
  expirationDate?: ISODateString;
  /** Account active */
  isActive: boolean;
}

/**
 * Patient loyalty transaction
 *
 * Individual loyalty points transaction.
 *
 * Real-world usage:
 * - Shown in points history
 * - Transaction type indicated (earned, redeemed, expired)
 * - Description shown (e.g., "Earned from $100 cleaning")
 *
 * Edge cases:
 * - Amount positive for earned, negative for redeemed/expired
 * - Description patient-friendly
 * - Balance after transaction shown
 */
export interface PatientLoyaltyTransaction {
  /** Transaction date */
  date: ISODateString;
  /** Points amount (positive=earned, negative=redeemed/expired) */
  amount: number;
  /** Transaction description */
  description: string;
  /** Balance after transaction */
  balanceAfter: number;
  /** Transaction type */
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
}

/**
 * Patient referral status
 *
 * Status of referral from patient perspective.
 *
 * Edge cases:
 * - PENDING: Invited friend not yet visited
 * - COMPLETED: Friend completed first visit, reward earned
 * - REDEEMED: Reward claimed by patient
 * - EXPIRED: Referral expired before completion
 */
export enum PatientReferralStatus {
  /** Referral pending (friend not yet visited) */
  PENDING = 'PENDING',
  /** Referral completed (friend visited, reward earned) */
  COMPLETED = 'COMPLETED',
  /** Reward redeemed */
  REDEEMED = 'REDEEMED',
  /** Referral expired */
  EXPIRED = 'EXPIRED',
}

/**
 * Patient referral program
 *
 * Referral program details for patient.
 *
 * Real-world usage:
 * - Shown in portal referrals section
 * - Unique referral code displayed
 * - Referral status tracked (pending, completed)
 * - Rewards earned shown
 *
 * Edge cases:
 * - Referral code unique per patient
 * - Multiple referrals tracked
 * - Rewards may be points, discounts, cash
 * - Referral status shown (pending vs completed)
 */
export interface PatientReferral {
  /** Unique referral code */
  code: PatientReferralCode;
  /** Referral status */
  status: PatientReferralStatus;
  /** Number of referrals sent */
  referralsSent: number;
  /** Number of completed referrals (friend visited) */
  referralsCompleted: number;
  /** Total rewards earned */
  rewardsEarned: number;
  /** Rewards earned formatted */
  rewardsEarnedFormatted: string;
  /** Reward type (points, discount, cash) */
  rewardType: string;
  /** Pending referrals (friends invited but not yet visited) */
  pendingReferrals: PatientPendingReferral[];
  /** Completed referrals */
  completedReferrals: PatientCompletedReferral[];
}

/**
 * Pending referral
 *
 * Referral sent but not yet completed.
 *
 * Edge cases:
 * - Friend name shown (if provided)
 * - Invite date shown
 * - Expiration shown (if applicable)
 */
export interface PatientPendingReferral {
  /** Invited friend name (if provided) */
  friendName?: string;
  /** Invite date */
  inviteDate: ISODateString;
  /** Expiration date */
  expirationDate?: ISODateString;
  /** Days until expiration */
  daysUntilExpiration?: number;
}

/**
 * Completed referral
 *
 * Referral completed (friend visited).
 *
 * Edge cases:
 * - Friend name shown
 * - Completion date shown
 * - Reward amount shown
 */
export interface PatientCompletedReferral {
  /** Friend name */
  friendName: string;
  /** Completion date (friend's first visit) */
  completionDate: ISODateString;
  /** Reward earned */
  rewardEarned: number;
  /** Reward earned formatted */
  rewardEarnedFormatted: string;
}

/**
 * Patient offer
 *
 * Special offer or promotion available to patient.
 *
 * Real-world usage:
 * - Shown in portal offers section
 * - Title and description shown
 * - Expiration prominently displayed
 * - Redemption code provided
 *
 * Edge cases:
 * - Offer may be personalized (based on history)
 * - Expiration creates urgency
 * - Code required to redeem at checkout
 * - Terms and conditions linked
 */
export interface PatientOffer {
  /** Offer identifier */
  id: string;
  /** Offer title */
  title: string;
  /** Offer description */
  description: string;
  /** Discount details (e.g., "20% off teeth whitening") */
  discount: string;
  /** Expiration date */
  expiryDate: ISODateString;
  /** Days until expiration */
  daysUntilExpiry: number;
  /** Redemption code */
  code: string;
  /** Terms and conditions */
  terms?: string;
  /** Already redeemed */
  isRedeemed: boolean;
}

/**
 * Patient feedback request
 *
 * Request to submit feedback after visit.
 *
 * Real-world workflow:
 * 1. Patient receives feedback request (email/SMS/portal notification)
 * 2. Patient clicks link, opens portal
 * 3. Patient rates visit (1-5 stars)
 * 4. Patient selects category (service, treatment, facility, staff)
 * 5. Patient provides optional comment
 * 6. Feedback submitted
 *
 * Edge cases:
 * - Rating required (1-5)
 * - Category helps route feedback
 * - Comment optional but valuable
 */
export interface PatientFeedbackRequest {
  /** Rating (1-5 stars) */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Feedback category */
  category: 'service' | 'treatment' | 'facility' | 'staff' | 'overall';
  /** Optional comment */
  comment?: string;
  /** Appointment this feedback is about (optional) */
  appointmentId?: PatientAppointmentId;
}

/**
 * Patient NPS request
 *
 * Request to submit Net Promoter Score.
 *
 * Real-world workflow:
 * 1. Patient receives NPS survey (email/SMS/portal notification)
 * 2. Patient answers: "How likely are you to recommend us? (0-10)"
 * 3. Patient provides optional comment
 * 4. NPS submitted and categorized (detractor/passive/promoter)
 *
 * Edge cases:
 * - Score required (0-10)
 * - Comment optional but valuable
 * - High scores (9-10) may trigger review invitation
 * - Low scores (0-6) may trigger follow-up
 */
export interface PatientNpsRequest {
  /** NPS score (0-10) */
  score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /** Optional comment explaining score */
  comment?: string;
}

// ============================================================================
// 8. PATIENT-FACING GDPR TYPES
// ============================================================================

/**
 * Data export status
 *
 * Status of patient data export request.
 *
 * Edge cases:
 * - REQUESTED: Export initiated, processing
 * - READY: Export ready for download
 * - EXPIRED: Download link expired
 * - FAILED: Export failed (error occurred)
 */
export enum PatientDataExportStatus {
  /** Export requested, processing */
  REQUESTED = 'REQUESTED',
  /** Export ready for download */
  READY = 'READY',
  /** Download link expired */
  EXPIRED = 'EXPIRED',
  /** Export failed */
  FAILED = 'FAILED',
}

/**
 * Patient data export
 *
 * GDPR data portability request.
 *
 * Real-world workflow:
 * 1. Patient requests data export (GDPR right to portability)
 * 2. System generates comprehensive export (all patient data)
 * 3. Export packaged as JSON/CSV archive
 * 4. Download link provided (expires after 7 days)
 * 5. Patient downloads archive
 *
 * Edge cases:
 * - Export includes all patient data (appointments, invoices, clinical, etc.)
 * - Download URL authenticated and time-limited
 * - Export expires after 7 days (security)
 * - Multiple exports allowed (patient can request again)
 * - Export format machine-readable (JSON, CSV)
 */
export interface PatientDataExport {
  /** Request date */
  requestDate: ISODateString;
  /** Export status */
  status: PatientDataExportStatus;
  /** Download URL (if ready) */
  downloadUrl?: string;
  /** Expiration date for download link */
  expiryDate?: ISODateString;
  /** Days until expiration */
  daysUntilExpiry?: number;
  /** File size in bytes (if ready) */
  fileSizeBytes?: number;
  /** File size formatted (if ready) */
  fileSizeFormatted?: string;
  /** Error message (if failed) */
  errorMessage?: string;
}

/**
 * Deletion request status
 *
 * Status of patient account deletion request.
 *
 * Edge cases:
 * - REQUESTED: Deletion requested, pending approval
 * - IN_PROGRESS: Deletion in progress
 * - COMPLETED: Account deleted
 * - DENIED: Deletion denied (e.g., outstanding balance)
 */
export enum PatientDeletionStatus {
  /** Deletion requested */
  REQUESTED = 'REQUESTED',
  /** Deletion in progress */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Deletion completed */
  COMPLETED = 'COMPLETED',
  /** Deletion denied */
  DENIED = 'DENIED',
}

/**
 * Patient deletion request
 *
 * GDPR right to erasure (right to be forgotten).
 *
 * Real-world workflow:
 * 1. Patient requests account deletion (GDPR right to erasure)
 * 2. System checks for blockers (outstanding balance, active treatment)
 * 3. If clear, deletion scheduled (30-day grace period)
 * 4. Patient notified before deletion
 * 5. Account anonymized (PII removed, clinical data retained per regulations)
 *
 * Edge cases:
 * - Deletion may be denied if outstanding balance
 * - Deletion may be delayed if active treatment plan
 * - Clinical records retained per legal requirements (anonymized)
 * - Grace period allows patient to cancel deletion
 * - After deletion, account cannot be recovered
 */
export interface PatientDeletionRequest {
  /** Request date */
  requestDate: ISODateString;
  /** Deletion status */
  status: PatientDeletionStatus;
  /** Scheduled completion date */
  scheduledCompletionDate?: ISODateString;
  /** Actual completion date */
  completionDate?: ISODateString;
  /** Reason for deletion (optional) */
  reason?: string;
  /** Denial reason (if denied) */
  denialReason?: string;
  /** Can cancel deletion (during grace period) */
  canCancel: boolean;
  /** Grace period end date */
  gracePeriodEnd?: ISODateString;
}

/**
 * Consent type
 *
 * Types of consent patient can grant or revoke.
 *
 * Edge cases:
 * - MARKETING: Marketing communications (required for campaigns)
 * - DATA_SHARING: Share data with third parties
 * - RESEARCH: Use anonymized data for research
 * - COMMUNICATIONS: General communications (transactional always allowed)
 */
export enum PatientConsentType {
  /** Marketing communications */
  MARKETING = 'MARKETING',
  /** Data sharing with third parties */
  DATA_SHARING = 'DATA_SHARING',
  /** Research participation (anonymized data) */
  RESEARCH = 'RESEARCH',
  /** General communications */
  COMMUNICATIONS = 'COMMUNICATIONS',
}

/**
 * Patient consent record
 *
 * Individual consent grant/revoke record.
 *
 * Real-world usage:
 * - Shown in portal privacy settings
 * - Each consent type independently managed
 * - Consent grant/revoke dates tracked (audit)
 * - Revocation honored immediately
 *
 * Edge cases:
 * - Consent type shown with description
 * - Granted status shown (yes/no)
 * - Grant date shown (when patient opted in)
 * - Revoke date shown (when patient opted out)
 * - Consent history tracked (not shown to patient)
 */
export interface PatientConsent {
  /** Consent type */
  type: PatientConsentType;
  /** Type display name */
  typeDisplayName: string;
  /** Type description */
  typeDescription: string;
  /** Consent granted */
  granted: boolean;
  /** Date consent granted */
  grantedDate?: ISODateString;
  /** Date consent revoked */
  revokedDate?: ISODateString;
}

// ============================================================================
// 9. PATIENT-FACING ERROR TYPES
// ============================================================================

/**
 * Patient error codes
 *
 * Standardized error codes for patient portal.
 *
 * Real-world usage:
 * - Returned in API error responses
 * - Mapped to user-friendly messages
 * - Used for error tracking and analytics
 *
 * Edge cases:
 * - INVALID_CREDENTIALS: Wrong email/password
 * - UNAUTHORIZED: Token expired or invalid
 * - APPOINTMENT_CONFLICT: Time slot no longer available
 * - PAYMENT_FAILED: Payment processing failed
 * - SERVICE_UNAVAILABLE: Backend service down
 */
export enum PatientErrorCode {
  /** Invalid email or password */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  /** Unauthorized access (token expired/invalid) */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Account locked (too many failed login attempts) */
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  /** Email not verified */
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  /** Appointment conflict (time slot unavailable) */
  APPOINTMENT_CONFLICT = 'APPOINTMENT_CONFLICT',
  /** Appointment not cancellable (past deadline) */
  APPOINTMENT_NOT_CANCELLABLE = 'APPOINTMENT_NOT_CANCELLABLE',
  /** Payment failed */
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  /** Insufficient balance (overpayment not allowed) */
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  /** Service temporarily unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Invalid request (validation failed) */
  INVALID_REQUEST = 'INVALID_REQUEST',
  /** Resource not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Patient error response
 *
 * Standardized error response for patient portal.
 *
 * Real-world usage:
 * - Returned for all API errors
 * - Includes error code, message, details
 * - Message shown to patient (user-friendly)
 * - Details may include field validation errors
 *
 * Edge cases:
 * - Code standardized (from PatientErrorCode enum)
 * - Message user-friendly (not technical)
 * - Details provide additional context (optional)
 * - Details may include field-level errors (validation)
 */
export interface PatientErrorResponse {
  /** Error code (from PatientErrorCode enum) */
  code: PatientErrorCode;
  /** User-friendly error message */
  message: string;
  /** Additional error details (optional) */
  details?: string | Record<string, string>;
}

// ============================================================================
// 10. PATIENT-FACING PAGINATION/FILTER TYPES
// ============================================================================

/**
 * Patient paginated response
 *
 * Generic paginated response for patient portal lists.
 *
 * Real-world usage:
 * - Used for appointment lists, invoice lists, etc.
 * - Items array contains current page data
 * - Total items count for pagination UI
 * - Page and pageSize for navigation
 *
 * Edge cases:
 * - Empty items array if no data (total=0)
 * - Page 1-indexed (first page = 1)
 * - PageSize default typically 10-20
 * - Total may exceed items.length (pagination needed)
 */
export interface PatientPaginatedResponse<T> {
  /** Items on current page */
  items: T[];
  /** Total items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total pages */
  totalPages: number;
  /** Has next page */
  hasNext: boolean;
  /** Has previous page */
  hasPrevious: boolean;
}

/**
 * Patient date range
 *
 * Date range filter for patient portal.
 *
 * Real-world usage:
 * - Filter appointments by date range
 * - Filter invoices by date range
 * - Filter visits by date range
 *
 * Edge cases:
 * - Both from and to required
 * - From must be <= to
 * - Dates inclusive (includes from and to)
 */
export interface PatientDateRange {
  /** Start date (inclusive) */
  from: string;
  /** End date (inclusive) */
  to: string;
}

/**
 * Patient appointment filter
 *
 * Filter criteria for appointment list.
 *
 * Real-world usage:
 * - Filter appointments by status (upcoming, completed, etc.)
 * - Filter appointments by date range
 * - Filter appointments by provider
 *
 * Edge cases:
 * - All fields optional (no filter = all appointments)
 * - Multiple filters combined with AND logic
 * - Status filter may include multiple values
 */
export interface PatientAppointmentFilter {
  /** Filter by status (optional) */
  status?: PatientAppointmentStatus | PatientAppointmentStatus[];
  /** Filter by date range (optional) */
  dateRange?: PatientDateRange;
  /** Filter by provider ID (optional) */
  providerId?: string;
}

/**
 * Patient invoice filter
 *
 * Filter criteria for invoice list.
 *
 * Real-world usage:
 * - Filter invoices by status (outstanding, paid, etc.)
 * - Filter invoices by date range
 * - Filter invoices by amount range
 *
 * Edge cases:
 * - All fields optional (no filter = all invoices)
 * - Amount range filters by invoice total
 * - Status filter may include multiple values
 */
export interface PatientInvoiceFilter {
  /** Filter by status (optional) */
  status?: PatientInvoiceStatus | PatientInvoiceStatus[];
  /** Filter by date range (optional) */
  dateRange?: PatientDateRange;
  /** Filter by minimum amount (optional) */
  minAmount?: number;
  /** Filter by maximum amount (optional) */
  maxAmount?: number;
}

/**
 * Patient sort order
 *
 * Sort order for patient portal lists.
 *
 * Edge cases:
 * - ASC: Ascending order (oldest first, A-Z, lowest first)
 * - DESC: Descending order (newest first, Z-A, highest first)
 */
export enum PatientSortOrder {
  /** Ascending order */
  ASC = 'ASC',
  /** Descending order */
  DESC = 'DESC',
}

/**
 * Patient sort criteria
 *
 * Sort criteria for patient portal lists.
 *
 * Real-world usage:
 * - Sort appointments by date (default: date DESC)
 * - Sort invoices by date or amount
 * - Sort visits by date
 *
 * Edge cases:
 * - Field name varies by resource type (date, amount, etc.)
 * - Order defaults to DESC for most lists (newest first)
 */
export interface PatientSortCriteria {
  /** Field to sort by */
  field: string;
  /** Sort order */
  order: PatientSortOrder;
}
