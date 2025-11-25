/**
 * Patient Domain Types
 *
 * Core domain types for Patient 360 in the dental practice management system.
 * Defines patient entities, demographics, contact information, medical records,
 * insurance details, and GDPR compliance structures.
 *
 * @module shared-domain/patient
 */

import type {
  UUID,
  ISODateString,
  OrganizationId,
  ClinicId,
  Metadata,
} from '@dentalos/shared-types';

/**
 * Gender enumeration
 * Compliant with ISO 5218 (extended)
 */
export enum Gender {
  /** Male */
  MALE = 'male',
  /** Female */
  FEMALE = 'female',
  /** Other gender identity */
  OTHER = 'other',
  /** Patient prefers not to disclose */
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

/**
 * Patient status enumeration
 * Represents the lifecycle status of a patient record
 */
export enum PatientStatus {
  /** Active patient with ongoing treatment */
  ACTIVE = 'active',
  /** Inactive patient (no recent appointments) */
  INACTIVE = 'inactive',
  /** Archived patient (no longer receives care, retained for records) */
  ARCHIVED = 'archived',
}

/**
 * Relationship type between patients
 * Used for family relationships and emergency contacts
 */
export enum RelationshipType {
  /** Parent of the patient */
  PARENT = 'parent',
  /** Child of the patient */
  CHILD = 'child',
  /** Spouse or domestic partner */
  SPOUSE = 'spouse',
  /** Sibling relationship */
  SIBLING = 'sibling',
  /** Legal guardian (not parent) */
  GUARDIAN = 'guardian',
  /** Emergency contact (non-family) */
  EMERGENCY = 'emergency',
}

/**
 * Communication channel preferences
 * Defines how patients prefer to be contacted
 */
export enum CommunicationChannel {
  /** Email communication */
  EMAIL = 'email',
  /** SMS/text message */
  SMS = 'sms',
  /** Voice phone call */
  PHONE = 'phone',
  /** Patient portal notifications */
  PORTAL = 'portal',
}

/**
 * Phone number type
 * Categorizes phone numbers by usage
 */
export enum PhoneType {
  /** Mobile/cell phone */
  MOBILE = 'mobile',
  /** Home landline */
  HOME = 'home',
  /** Work/office phone */
  WORK = 'work',
}

/**
 * Email address type
 * Categorizes email addresses by usage
 */
export enum EmailType {
  /** Personal email address */
  PERSONAL = 'personal',
  /** Work/corporate email address */
  WORK = 'work',
}

/**
 * Person name value object
 * Structured representation of a person's full name
 *
 * Edge cases handled:
 * - Single name individuals (firstName only, lastName = '')
 * - Compound surnames (lastName may contain spaces)
 * - Cultural naming variations (prefix, suffix support)
 */
export interface PersonName {
  /** Given name / first name (required) */
  firstName: string;
  /** Family name / surname (required, may be empty string for single-name individuals) */
  lastName: string;
  /** Middle name or initial */
  middleName?: string;
  /** Preferred name or nickname */
  preferredName?: string;
  /** Name suffix (Jr., Sr., III, etc.) */
  suffix?: string;
  /** Title or honorific prefix (Dr., Mr., Ms., etc.) */
  prefix?: string;
}

/**
 * Phone contact information
 * Represents a single phone number with metadata
 *
 * Edge cases handled:
 * - Multiple phone numbers per patient
 * - Verification status tracking
 * - Primary phone designation (exactly one should be primary)
 */
export interface PhoneContact {
  /** Type of phone number */
  type: PhoneType;
  /** Phone number (E.164 format recommended: +1234567890) */
  number: string;
  /** Whether this is the primary contact number */
  isPrimary: boolean;
  /** Whether the number has been verified (SMS verification) */
  isVerified?: boolean;
}

/**
 * Email contact information
 * Represents a single email address with metadata
 *
 * Edge cases handled:
 * - Multiple emails per patient
 * - Verification status tracking
 * - Primary email designation (exactly one should be primary)
 */
export interface EmailContact {
  /** Type of email address */
  type: EmailType;
  /** Email address (validated format) */
  address: string;
  /** Whether this is the primary contact email */
  isPrimary: boolean;
  /** Whether the email has been verified (email confirmation) */
  isVerified?: boolean;
}

/**
 * Patient contact information aggregate
 * Combines all contact methods for a patient
 *
 * Edge cases handled:
 * - Empty arrays allowed (patient may not provide all contact types)
 * - Validation required: at least one primary phone OR email
 * - Multiple addresses supported (home, billing, mailing)
 */
export interface PatientContacts {
  /** Phone numbers (may be empty) */
  phones: PhoneContact[];
  /** Email addresses (may be empty) */
  emails: EmailContact[];
  /** Physical addresses (may be empty) */
  addresses: AddressValue[];
}

/**
 * Address value object (imported from shared-domain)
 * Re-exported here for completeness in patient context
 */
export interface AddressValue {
  /** Street address line 1 */
  street1: string;
  /** Street address line 2 (apartment, suite, etc.) */
  street2?: string;
  /** City name */
  city: string;
  /** State/province/region code */
  state: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  /** Whether this is the primary address */
  isPrimary?: boolean;
  /** Address type (home, billing, mailing) */
  type?: 'home' | 'billing' | 'mailing';
}

/**
 * Demographic information
 * Optional patient demographic data
 *
 * Edge cases handled:
 * - All fields optional (patient may decline to provide)
 * - Cultural sensitivity (ethnicity, race, marital status)
 * - GDPR compliance (can be anonymized on request)
 */
export interface Demographics {
  /** Preferred language (ISO 639-1 code: en, es, fr, etc.) */
  preferredLanguage?: string;
  /** Ethnicity (free-form or standardized codes) */
  ethnicity?: string;
  /** Race (free-form or standardized codes) */
  race?: string;
  /** Marital status (single, married, divorced, widowed, etc.) */
  maritalStatus?: string;
  /** Occupation/job title */
  occupation?: string;
  /** Employer name */
  employer?: string;
}

/**
 * Medical flags and alerts
 * Critical medical information for treatment planning
 *
 * Edge cases handled:
 * - Empty arrays allowed (patient may have no allergies/medications)
 * - Critical flags for high-risk patients
 * - Confidential notes (restricted access)
 */
export interface MedicalFlags {
  /** Known allergies (medications, latex, etc.) */
  allergies: string[];
  /** Current medications (drug names, not prescriptions) */
  medications: string[];
  /** Pre-existing medical conditions */
  conditions: string[];
  /** Treatment flags (e.g., 'high-risk', 'requires-premedication', 'anxiety') */
  flags: string[];
  /** Additional confidential medical notes */
  notes?: string;
}

/**
 * Insurance information for a single policy
 * Represents primary or secondary insurance coverage
 *
 * Edge cases handled:
 * - Missing or incomplete policy information
 * - Expired policies (check effectiveDate/expirationDate)
 * - Subscriber may be different from patient (family plans)
 */
export interface InsuranceInfo {
  /** Insurance provider/carrier name */
  provider: string;
  /** Insurance policy number */
  policyNumber: string;
  /** Group number (for employer plans) */
  groupNumber?: string;
  /** Subscriber ID (may differ from policy number) */
  subscriberId?: string;
  /** Subscriber name (if different from patient) */
  subscriberName?: string;
  /** Relationship to subscriber (self, spouse, child, etc.) */
  subscriberRelationship?: string;
  /** Policy effective date */
  effectiveDate?: ISODateString;
  /** Policy expiration date */
  expirationDate?: ISODateString;
}

/**
 * Patient insurance aggregate
 * Supports primary and secondary insurance
 *
 * Edge cases handled:
 * - No insurance (both fields undefined)
 * - Primary only (secondary undefined)
 * - Coordination of benefits (both defined)
 */
export interface PatientInsurance {
  /** Primary insurance policy */
  primary?: InsuranceInfo;
  /** Secondary insurance policy */
  secondary?: InsuranceInfo;
}

/**
 * Communication preferences
 * Patient preferences for notifications and marketing
 *
 * Edge cases handled:
 * - Opt-out defaults (all reminders off until patient opts in)
 * - Channel-specific preferences (SMS enabled, email disabled)
 * - GDPR/CCPA compliance (marketing consent separate)
 */
export interface CommunicationPreferences {
  /** Preferred communication channel */
  preferredChannel: CommunicationChannel;
  /** Receive appointment reminders */
  appointmentReminders: boolean;
  /** Receive recall reminders (6-month checkup, etc.) */
  recallReminders: boolean;
  /** Consent to marketing communications */
  marketingConsent: boolean;
  /** SMS/text messaging enabled */
  smsEnabled: boolean;
  /** Email communications enabled */
  emailEnabled: boolean;
  /** Voice phone calls enabled */
  phoneCallsEnabled: boolean;
}

/**
 * Consent records for GDPR/HIPAA compliance
 * Tracks patient consent for data processing and communications
 *
 * Edge cases handled:
 * - Withdrawn consent (consent = false, date = withdrawal date)
 * - Granular consent tracking (separate fields for each consent type)
 * - Audit trail (timestamp for each consent decision)
 */
export interface ConsentRecord {
  /** GDPR consent to data processing */
  gdprConsent: boolean;
  /** Date of GDPR consent (or withdrawal) */
  gdprConsentDate?: ISODateString;
  /** Marketing consent (separate from GDPR) */
  marketingConsent: boolean;
  /** Date of marketing consent (or withdrawal) */
  marketingConsentDate?: ISODateString;
  /** Consent to data processing for treatment */
  dataProcessingConsent: boolean;
  /** Date of data processing consent */
  dataProcessingConsentDate?: ISODateString;
  /** HIPAA Privacy Notice acknowledgment (US only) */
  hipaaAcknowledged?: boolean;
  /** Date of HIPAA acknowledgment */
  hipaaAcknowledgedDate?: ISODateString;
}

/**
 * Core Patient entity
 * Aggregate root for patient domain
 *
 * Edge cases handled:
 * - Multi-tenant isolation (tenantId, organizationId, clinicId)
 * - Soft deletion (isDeleted, deletedAt, deletedBy)
 * - GDPR anonymization (isAnonymized, anonymizedAt)
 * - Sensitive data (SSN encrypted, medical info restricted)
 * - Optional clinic scope (organization-wide or clinic-specific)
 * - Empty contact information (phones/emails may be empty arrays)
 * - Comprehensive audit trail (createdBy, updatedBy, timestamps)
 */
export interface Patient {
  /** Unique patient identifier (UUID v4) */
  id: UUID;

  // Multi-tenant context
  /** Tenant ID (effective scope: clinicId if present, else organizationId) */
  tenantId: string;
  /** Organization this patient belongs to */
  organizationId: OrganizationId;
  /** Clinic this patient is registered at (optional, org-wide if undefined) */
  clinicId?: ClinicId;

  // Personal information
  /** Patient name and demographics */
  person: PersonName & {
    /** Date of birth (required for age calculation and validation) */
    dateOfBirth: ISODateString;
    /** Gender identity */
    gender: Gender;
    /** Social Security Number (MUST be encrypted at rest, PII) */
    ssn?: string;
  };

  // Contact information
  /** All contact methods (phones, emails, addresses) */
  contacts: PatientContacts;

  // Optional demographic data
  /** Extended demographic information (all optional) */
  demographics?: Demographics;

  // Medical information
  /** Medical alerts, allergies, medications, conditions */
  medical?: MedicalFlags;

  // Insurance
  /** Primary and secondary insurance information */
  insurance?: PatientInsurance;

  // Organization and categorization
  /** Tags for categorization (VIP, high-value, referral, etc.) */
  tags: string[];

  // Preferences and consent
  /** Communication channel preferences and opt-in/opt-out settings */
  communicationPreferences: CommunicationPreferences;
  /** GDPR, HIPAA, and marketing consent records */
  consent: ConsentRecord;

  // Business metrics
  /** Patient value score (calculated field: revenue, loyalty, referrals) */
  valueScore: number;
  /** Current patient status */
  status: PatientStatus;

  // Soft deletion
  /** Soft delete flag (true if deleted, false otherwise) */
  isDeleted: boolean;
  /** Timestamp of soft deletion */
  deletedAt?: ISODateString;
  /** User who deleted the patient record */
  deletedBy?: UUID;

  // GDPR anonymization
  /** Anonymization flag (true if PII has been anonymized) */
  isAnonymized?: boolean;
  /** Timestamp of anonymization */
  anonymizedAt?: ISODateString;

  // Audit trail
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created the patient record */
  createdBy?: UUID;
  /** User who last updated the patient record */
  updatedBy?: UUID;

  // Extensibility
  /** Custom metadata for extensibility */
  metadata?: Metadata;
}

/**
 * Patient relationship entity
 * Links two patient records with a defined relationship
 *
 * Edge cases handled:
 * - Bidirectional relationships (parent-child implies child-parent)
 * - Relationship activation/deactivation (isActive flag)
 * - Notes for complex family situations (custody, guardianship)
 */
export interface PatientRelationship {
  /** Unique relationship identifier */
  id: UUID;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Primary patient ID */
  patientId: UUID;
  /** Related patient ID */
  relatedPatientId: UUID;
  /** Type of relationship */
  relationshipType: RelationshipType;
  /** Whether the relationship is currently active */
  isActive: boolean;
  /** Additional notes (custody arrangements, guardianship details) */
  notes?: string;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
}

/**
 * Patient timeline event
 * Represents a single event in the patient's history
 *
 * Edge cases handled:
 * - Cross-service events (appointments, communications, payments)
 * - Event source tracking for debugging and audit
 * - Flexible metadata for service-specific data
 */
export interface PatientTimelineEvent {
  /** Unique event identifier */
  id: UUID;
  /** Patient this event belongs to */
  patientId: UUID;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Event type (appointment, communication, visit, payment, update) */
  eventType: string;
  /** Timestamp of the event */
  timestamp: ISODateString;
  /** Human-readable event title */
  title: string;
  /** Optional detailed description */
  description?: string;
  /** Service-specific metadata (flexible structure) */
  metadata?: Record<string, unknown>;
  /** Source service that generated the event */
  source: string;
}

/**
 * Patient search criteria
 * Flexible search parameters for finding patients
 *
 * Edge cases handled:
 * - Multi-field search (name, DOB, contact info)
 * - Fuzzy matching (full-text search field)
 * - Pagination (limit, offset)
 * - Multi-tenant filtering (tenantId required)
 * - Status filtering (include/exclude inactive/archived)
 * - Tag-based filtering (array of tags)
 */
export interface PatientSearchCriteria {
  /** Tenant ID (required for multi-tenant isolation) */
  tenantId: string;
  /** Full-text search across name, contact info */
  search?: string;
  /** Filter by first name (exact or partial match) */
  firstName?: string;
  /** Filter by last name (exact or partial match) */
  lastName?: string;
  /** Filter by date of birth (exact match) */
  dateOfBirth?: ISODateString;
  /** Filter by phone number (exact or partial match) */
  phone?: string;
  /** Filter by email address (exact or partial match) */
  email?: string;
  /** Filter by tags (patient must have ALL specified tags) */
  tags?: string[];
  /** Filter by patient status */
  status?: PatientStatus;
  /** Filter by clinic ID (optional, searches across organization if undefined) */
  clinicId?: ClinicId;
  /** Maximum number of results to return (default: 20) */
  limit?: number;
  /** Offset for pagination (default: 0) */
  offset?: number;
}

/**
 * Duplicate patient match result
 * Represents a potential duplicate patient record
 *
 * Edge cases handled:
 * - Partial match (score < 1.0)
 * - Multiple match criteria (name, DOB, contact)
 * - Match reason explanations for manual review
 */
export interface DuplicatePatientMatch {
  /** Original patient ID */
  patientId: UUID;
  /** Potential duplicate patient ID */
  duplicateId: UUID;
  /** Match confidence score (0.0 - 1.0, where 1.0 is exact match) */
  matchScore: number;
  /** Reasons for the match (e.g., 'same name and DOB', 'same phone number') */
  matchReasons: string[];
  /** Partial patient data for comparison */
  patient: Partial<Patient>;
  /** Partial duplicate data for comparison */
  duplicate: Partial<Patient>;
}

/**
 * GDPR data export structure
 * Complete patient data export for GDPR compliance
 *
 * Edge cases handled:
 * - Comprehensive data collection across services
 * - Future-proof structure (optional fields for future services)
 * - Export metadata (timestamp, requestor)
 */
export interface PatientGDPRExport {
  /** Complete patient record */
  patient: Patient;
  /** All patient relationships */
  relationships: PatientRelationship[];
  /** Complete patient timeline */
  timeline: PatientTimelineEvent[];
  /** Future: appointments from scheduling service */
  appointments?: unknown[];
  /** Future: communications from communications service */
  communications?: unknown[];
  /** Future: payments from billing service */
  payments?: unknown[];
  /** Export timestamp */
  exportedAt: ISODateString;
  /** User who requested the export */
  exportedBy: UUID;
}
