/**
 * Patient MongoDB Schema
 *
 * Defines the complete patient data model with all fields, validation, and indexes.
 * Supports multi-tenant isolation, GDPR compliance, and comprehensive patient information.
 *
 * @module modules/patients/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import type { UUID } from '@dentalos/shared-types';

/**
 * Phone contact sub-document
 */
export class PhoneContact {
  @Prop({ required: true, type: String, enum: ['mobile', 'home', 'work', 'other'] })
  type!: string;

  @Prop({ required: true, type: String, trim: true })
  number!: string;

  @Prop({ type: Boolean, default: false })
  isPrimary!: boolean;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

/**
 * Email contact sub-document
 */
export class EmailContact {
  @Prop({ required: true, type: String, enum: ['personal', 'work', 'other'] })
  type!: string;

  @Prop({ required: true, type: String, lowercase: true, trim: true })
  address!: string;

  @Prop({ type: Boolean, default: false })
  isPrimary!: boolean;

  @Prop({ type: Boolean, default: true })
  isVerified!: boolean;
}

/**
 * Address sub-document
 */
export class Address {
  @Prop({ required: true, type: String, trim: true })
  street!: string;

  @Prop({ type: String, trim: true })
  street2?: string;

  @Prop({ required: true, type: String, trim: true })
  city!: string;

  @Prop({ required: true, type: String, trim: true })
  state!: string;

  @Prop({ required: true, type: String, trim: true })
  postalCode!: string;

  @Prop({ required: true, type: String, trim: true, default: 'USA' })
  country!: string;

  @Prop({ type: Boolean, default: false })
  isPrimary!: boolean;
}

/**
 * Romanian national ID (CNP) information
 * Stored encrypted, with searchable hash for lookups
 */
export class NationalIdInfo {
  /**
   * CNP encrypted using AES-256-GCM
   * Format: iv:authTag:ciphertext (base64)
   */
  @Prop({ type: String })
  encryptedValue?: string;

  /**
   * Deterministic hash for searching (HMAC-SHA256)
   * Allows finding patient by CNP without decrypting all records
   */
  @Prop({ type: String, index: true })
  searchHash?: string;

  /**
   * Last 4 digits for display purposes (e.g., "***********1234")
   */
  @Prop({ type: String })
  lastFour?: string;

  /**
   * Whether CNP has been validated against Romanian algorithm
   */
  @Prop({ type: Boolean, default: false })
  isValidated?: boolean;

  /**
   * Gender extracted from CNP (for data consistency check)
   */
  @Prop({ type: String, enum: ['male', 'female'] })
  extractedGender?: string;

  /**
   * Birth date extracted from CNP (for data consistency check)
   */
  @Prop({ type: Date })
  extractedBirthDate?: Date;

  /**
   * County code from CNP (JJ component)
   */
  @Prop({ type: String })
  countyCode?: string;
}

/**
 * Person information sub-document
 */
export class PersonInfo {
  @Prop({ required: true, type: String, trim: true })
  firstName!: string;

  @Prop({ required: true, type: String, trim: true })
  lastName!: string;

  @Prop({ type: String, trim: true })
  middleName?: string;

  @Prop({ type: String, trim: true })
  preferredName?: string;

  @Prop({ required: true, type: Date })
  dateOfBirth!: Date;

  @Prop({ required: true, type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  gender!: string;

  /**
   * @deprecated Use nationalId instead. Kept for backwards compatibility.
   * Should be encrypted at rest.
   */
  @Prop({ type: String, trim: true })
  ssn?: string;

  /**
   * Romanian national ID (CNP) - Cod Numeric Personal
   * Encrypted at rest with searchable hash
   */
  @Prop({ type: NationalIdInfo })
  nationalId?: NationalIdInfo;

  @Prop({ type: String, trim: true })
  photoUrl?: string;
}

/**
 * Contact information sub-document
 */
export class ContactInfo {
  @Prop({ type: [PhoneContact], default: [] })
  phones!: PhoneContact[];

  @Prop({ type: [EmailContact], default: [] })
  emails!: EmailContact[];

  @Prop({ type: [Address], default: [] })
  addresses!: Address[];
}

/**
 * Demographics sub-document
 */
export class Demographics {
  @Prop({ type: String, trim: true, default: 'en' })
  preferredLanguage?: string;

  @Prop({ type: String, trim: true })
  ethnicity?: string;

  @Prop({ type: String, trim: true })
  race?: string;

  @Prop({ type: String, trim: true })
  occupation?: string;

  @Prop({
    type: String,
    trim: true,
    enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'other'],
  })
  maritalStatus?: string;
}

/**
 * Allergy severity levels per clinical standards
 * CRITICAL: Life-threatening allergies must always be displayed prominently
 */
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

/**
 * Allergy entry with clinical severity tracking
 * Required for patient safety during treatment planning
 */
export class AllergyEntry {
  @Prop({ required: true, type: String, trim: true })
  allergen!: string;

  @Prop({
    required: true,
    type: String,
    enum: ['mild', 'moderate', 'severe', 'life_threatening'],
    default: 'moderate',
  })
  severity!: AllergySeverity;

  @Prop({ type: String, trim: true })
  reaction?: string;

  @Prop({ type: Date })
  onsetDate?: Date;

  @Prop({ type: Date })
  verifiedDate?: Date;

  @Prop({ type: String, trim: true })
  verifiedBy?: string;

  @Prop({ type: String, maxlength: 1000 })
  notes?: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

/**
 * Medical condition status
 */
export type ConditionStatus = 'active' | 'resolved' | 'chronic' | 'in_remission';

/**
 * Medical condition entry with ICD-10 coding
 * ICD-10 codes are required for proper clinical documentation and insurance claims
 */
export class MedicalConditionEntry {
  @Prop({ required: true, type: String, trim: true })
  name!: string;

  /**
   * ICD-10-CM code for the condition
   * Format: Letter + 2 digits, optionally followed by decimal and additional digits
   * Example: K02.51 (Dental caries on pit and fissure surface limited to enamel)
   */
  @Prop({ type: String, trim: true })
  icd10Code?: string;

  @Prop({
    type: String,
    enum: ['active', 'resolved', 'chronic', 'in_remission'],
    default: 'active',
  })
  status!: ConditionStatus;

  @Prop({
    type: String,
    enum: ['mild', 'moderate', 'severe', 'life_threatening'],
  })
  severity?: AllergySeverity;

  @Prop({ type: Date })
  diagnosedDate?: Date;

  @Prop({ type: Date })
  resolvedDate?: Date;

  @Prop({ type: String, trim: true })
  diagnosedBy?: string;

  @Prop({ type: String, maxlength: 1000 })
  notes?: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

/**
 * Medication entry with dosage and frequency
 * Required for drug interaction checking and clinical safety
 */
export class MedicationEntry {
  @Prop({ required: true, type: String, trim: true })
  name!: string;

  @Prop({ type: String, trim: true })
  genericName?: string;

  @Prop({ type: String, trim: true })
  dosage?: string;

  @Prop({ type: String, trim: true })
  frequency?: string;

  @Prop({ type: String, trim: true })
  route?: string; // oral, topical, injection, etc.

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: String, trim: true })
  prescribedBy?: string;

  @Prop({ type: String, trim: true })
  reason?: string;

  @Prop({ type: String, maxlength: 1000 })
  notes?: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

/**
 * Patient flags for clinical and administrative alerts
 * These flags affect treatment workflow and patient interaction
 */
export type PatientFlagType =
  | 'anxious'
  | 'wheelchair'
  | 'hearing_impaired'
  | 'vision_impaired'
  | 'requires_premedication'
  | 'latex_allergy'
  | 'needle_phobic'
  | 'gag_reflex'
  | 'special_needs'
  | 'vip'
  | 'staff_family'
  | 'high_risk'
  | 'language_barrier'
  | 'payment_plan'
  | 'collections'
  | 'legal_guardian_required'
  | 'do_not_contact'
  | 'other';

/**
 * Patient flag entry
 */
export class PatientFlagEntry {
  @Prop({
    required: true,
    type: String,
    enum: [
      'anxious',
      'wheelchair',
      'hearing_impaired',
      'vision_impaired',
      'requires_premedication',
      'latex_allergy',
      'needle_phobic',
      'gag_reflex',
      'special_needs',
      'vip',
      'staff_family',
      'high_risk',
      'language_barrier',
      'payment_plan',
      'collections',
      'legal_guardian_required',
      'do_not_contact',
      'other',
    ],
  })
  type!: PatientFlagType;

  @Prop({ type: String, maxlength: 500 })
  description?: string;

  @Prop({ type: Date })
  addedDate?: Date;

  @Prop({ type: String, trim: true })
  addedBy?: string;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

/**
 * Medical alerts sub-document
 * Contains all clinical alerts that affect patient care decisions
 * CRITICAL: These alerts must be reviewed before any clinical procedure
 */
export class MedicalAlerts {
  @Prop({ type: [AllergyEntry], default: [] })
  allergies!: AllergyEntry[];

  @Prop({ type: [MedicalConditionEntry], default: [] })
  conditions!: MedicalConditionEntry[];

  @Prop({ type: [MedicationEntry], default: [] })
  medications!: MedicationEntry[];

  @Prop({ type: [PatientFlagEntry], default: [] })
  flags!: PatientFlagEntry[];

  /**
   * Timestamp of last medical history review
   */
  @Prop({ type: Date })
  lastReviewedAt?: Date;

  /**
   * Provider who last reviewed the medical history
   */
  @Prop({ type: String, trim: true })
  lastReviewedBy?: string;
}

/**
 * Medical information sub-document
 * @deprecated Use medicalAlerts instead. Kept for backwards compatibility.
 */
export class MedicalInfo {
  @Prop({ type: [String], default: [] })
  allergies!: string[];

  @Prop({ type: [String], default: [] })
  medications!: string[];

  @Prop({ type: [String], default: [] })
  conditions!: string[];

  @Prop({ type: [String], default: [] })
  flags!: string[]; // e.g., "high_risk", "special_needs", "requires_premedication"
}

/**
 * Insurance coverage details with financial tracking
 * Essential for treatment planning and patient cost estimates
 */
export class InsuranceCoverage {
  /**
   * Annual maximum benefit amount in currency units
   */
  @Prop({ type: Number, min: 0 })
  annualMax?: number;

  /**
   * Remaining benefit for current plan year
   */
  @Prop({ type: Number, min: 0 })
  remaining?: number;

  /**
   * Deductible amount
   */
  @Prop({ type: Number, min: 0 })
  deductible?: number;

  /**
   * Deductible amount already met
   */
  @Prop({ type: Number, min: 0 })
  deductibleMet?: number;

  /**
   * Coinsurance percentage for preventive services (e.g., 100 = 100% coverage)
   */
  @Prop({ type: Number, min: 0, max: 100 })
  preventivePercent?: number;

  /**
   * Coinsurance percentage for basic services (fillings, extractions)
   */
  @Prop({ type: Number, min: 0, max: 100 })
  basicPercent?: number;

  /**
   * Coinsurance percentage for major services (crowns, bridges)
   */
  @Prop({ type: Number, min: 0, max: 100 })
  majorPercent?: number;

  /**
   * Orthodontic coverage percentage
   */
  @Prop({ type: Number, min: 0, max: 100 })
  orthoPercent?: number;

  /**
   * Orthodontic lifetime maximum
   */
  @Prop({ type: Number, min: 0 })
  orthoLifetimeMax?: number;

  /**
   * Waiting period in months for basic services
   */
  @Prop({ type: Number, min: 0 })
  basicWaitingPeriodMonths?: number;

  /**
   * Waiting period in months for major services
   */
  @Prop({ type: Number, min: 0 })
  majorWaitingPeriodMonths?: number;

  /**
   * Plan year start date for benefit calculations
   */
  @Prop({ type: Date })
  planYearStart?: Date;

  /**
   * Currency code (e.g., USD, RON, EUR)
   */
  @Prop({ type: String, default: 'RON', trim: true })
  currency?: string;

  /**
   * Last time coverage was verified with insurance company
   */
  @Prop({ type: Date })
  lastVerifiedAt?: Date;

  /**
   * Who verified the coverage
   */
  @Prop({ type: String, trim: true })
  verifiedBy?: string;
}

/**
 * Insurance provider contact information
 */
export class InsuranceProviderInfo {
  @Prop({ required: true, type: String, trim: true })
  name!: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({ type: String, trim: true })
  fax?: string;

  @Prop({ type: String, trim: true })
  email?: string;

  @Prop({ type: String, trim: true })
  website?: string;

  @Prop({ type: String, trim: true })
  claimsAddress?: string;

  @Prop({ type: String, trim: true })
  payerId?: string; // Electronic payer ID for claims submission
}

/**
 * Insurance policy information sub-document
 * Contains all insurance-related data for billing and verification
 */
export class InsurancePolicy {
  /**
   * Insurance provider details
   */
  @Prop({ required: true, type: InsuranceProviderInfo })
  provider!: InsuranceProviderInfo;

  @Prop({ required: true, type: String, trim: true })
  policyNumber!: string;

  @Prop({ type: String, trim: true })
  groupNumber?: string;

  @Prop({ type: String, trim: true })
  groupName?: string;

  @Prop({ type: String, trim: true })
  planName?: string;

  @Prop({ type: String, trim: true })
  planType?: string; // PPO, HMO, DHMO, Indemnity, etc.

  @Prop({ required: true, type: String, trim: true })
  subscriberName!: string;

  @Prop({ type: String, trim: true })
  subscriberId?: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    enum: ['self', 'spouse', 'child', 'parent', 'other'],
    default: 'self',
  })
  subscriberRelationship!: string;

  @Prop({ type: Date })
  subscriberDateOfBirth?: Date;

  @Prop({ type: Date })
  effectiveDate?: Date;

  @Prop({ type: Date })
  expirationDate?: Date;

  /**
   * Coverage details with financial tracking
   */
  @Prop({ type: InsuranceCoverage })
  coverage?: InsuranceCoverage;

  /**
   * Whether this is the primary insurance
   */
  @Prop({ type: Boolean, default: true })
  isPrimary!: boolean;

  /**
   * Whether this policy is currently active
   */
  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  /**
   * Whether eligibility has been verified
   */
  @Prop({ type: Boolean, default: false })
  isVerified!: boolean;

  /**
   * Date eligibility was last verified
   */
  @Prop({ type: Date })
  verifiedAt?: Date;

  /**
   * Notes about the insurance policy
   */
  @Prop({ type: String, maxlength: 1000 })
  notes?: string;
}

/**
 * Insurance information sub-document
 * @deprecated Use insurancePolicies array instead. Kept for backwards compatibility.
 */
export class InsuranceInfo {
  @Prop({ required: true, type: String, trim: true })
  provider!: string;

  @Prop({ required: true, type: String, trim: true })
  policyNumber!: string;

  @Prop({ type: String, trim: true })
  groupNumber?: string;

  @Prop({ required: true, type: String, trim: true })
  subscriberName!: string;

  @Prop({ required: true, type: String, trim: true })
  subscriberRelationship!: string;

  @Prop({ type: Date })
  subscriberDateOfBirth?: Date;

  @Prop({ type: Date })
  effectiveDate?: Date;

  @Prop({ type: Date })
  expirationDate?: Date;

  @Prop({ type: Boolean, default: true })
  isPrimary!: boolean;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

/**
 * Communication preferences sub-document
 */
export class CommunicationPreferences {
  @Prop({ type: String, enum: ['email', 'sms', 'phone', 'portal'], default: 'email' })
  preferredChannel!: string;

  @Prop({ type: Boolean, default: true })
  appointmentReminders!: boolean;

  @Prop({ type: Boolean, default: false })
  marketingConsent!: boolean;

  @Prop({ type: Boolean, default: true })
  recallReminders!: boolean;

  @Prop({ type: Boolean, default: false })
  smsNotifications!: boolean;

  @Prop({ type: Boolean, default: true })
  emailNotifications!: boolean;
}

/**
 * Consent information sub-document (GDPR compliant)
 */
export class ConsentInfo {
  @Prop({ type: Boolean, default: false })
  gdprConsent!: boolean;

  @Prop({ type: Date })
  gdprConsentDate?: Date;

  @Prop({ type: String })
  gdprConsentVersion?: string;

  @Prop({ type: Boolean, default: false })
  marketingConsent!: boolean;

  @Prop({ type: Date })
  marketingConsentDate?: Date;

  @Prop({ type: Boolean, default: false })
  dataProcessingConsent!: boolean;

  @Prop({ type: Date })
  dataProcessingConsentDate?: Date;

  @Prop({ type: Boolean, default: false })
  treatmentConsent!: boolean;

  @Prop({ type: Date })
  treatmentConsentDate?: Date;

  @Prop({ type: Boolean, default: false })
  smsMarketing!: boolean;

  @Prop({ type: Boolean, default: false })
  emailMarketing!: boolean;

  @Prop({ type: Boolean, default: false })
  whatsappMarketing!: boolean;
}

/**
 * GDPR compliance sub-document
 */
export class GdprInfo {
  @Prop({ type: ConsentInfo })
  consents?: ConsentInfo;

  @Prop({
    type: Object,
    default: null,
  })
  rightToErasure?: {
    status: 'none' | 'requested' | 'processing' | 'completed';
    requestedAt?: Date;
    completedAt?: Date;
  };

  @Prop({
    type: Object,
    default: { clinicalData: 10 },
  })
  retentionPolicy!: {
    clinicalData: number; // years (Romanian law: 10 years)
  };
}

/**
 * Patient lifecycle sub-document
 */
export class LifecycleInfo {
  @Prop({
    type: String,
    enum: ['lead', 'new', 'active', 'at_risk', 'churned'],
    default: 'new',
  })
  stage!: string;

  @Prop({ type: Date })
  firstVisitDate?: Date;

  @Prop({ type: Date })
  lastVisitDate?: Date;

  @Prop({ type: Number, default: 0 })
  visitCount!: number;

  @Prop({ type: Number, default: 0 })
  totalSpent!: number;
}

/**
 * Patient MongoDB Document
 *
 * Core patient entity with full demographic, contact, medical, and consent information.
 * Includes comprehensive indexing for performance and tenant isolation.
 */
@Schema({
  timestamps: true,
  collection: 'patients',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret._id;
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret.__v;
      return ret;
    },
  },
})
export class Patient {
  @Prop({ required: true, type: String, unique: true, index: true })
  id!: UUID;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({ required: true, type: String, index: true })
  organizationId!: string;

  @Prop({ required: true, type: String, index: true })
  clinicId!: string;

  @Prop({ type: String, trim: true })
  patientNumber?: string;

  @Prop({ required: true, type: PersonInfo })
  person!: PersonInfo;

  @Prop({ required: true, type: ContactInfo })
  contacts!: ContactInfo;

  @Prop({ type: Demographics })
  demographics?: Demographics;

  /**
   * @deprecated Use medicalAlerts instead. Kept for backwards compatibility.
   */
  @Prop({ required: true, type: MedicalInfo })
  medical!: MedicalInfo;

  /**
   * Enhanced medical alerts with structured data for allergies, conditions, medications, and flags
   * CRITICAL: These alerts must be reviewed before any clinical procedure
   */
  @Prop({ type: MedicalAlerts })
  medicalAlerts?: MedicalAlerts;

  /**
   * @deprecated Use insurancePolicies instead. Kept for backwards compatibility.
   */
  @Prop({ type: Object })
  insurance?: {
    primary?: InsuranceInfo;
    secondary?: InsuranceInfo;
  };

  /**
   * Multiple insurance policies with detailed coverage information
   * Supports primary, secondary, and tertiary insurance
   */
  @Prop({ type: [InsurancePolicy], default: [] })
  insurancePolicies!: InsurancePolicy[];

  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ required: true, type: CommunicationPreferences })
  communicationPreferences!: CommunicationPreferences;

  @Prop({ required: true, type: ConsentInfo })
  consent!: ConsentInfo;

  @Prop({ type: GdprInfo })
  gdpr?: GdprInfo;

  @Prop({ type: LifecycleInfo })
  lifecycle?: LifecycleInfo;

  @Prop({ type: Number, default: 0, min: 0, max: 1000 })
  valueScore!: number;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'archived', 'deceased'],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ type: String, trim: true })
  assignedProviderId?: string;

  @Prop({ type: String, trim: true })
  referredBy?: string;

  @Prop({ type: String, maxlength: 5000 })
  notes?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: String })
  deletedBy?: string;

  @Prop({ type: Boolean, default: false })
  isAnonymized!: boolean;

  @Prop({ type: Date })
  anonymizedAt?: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Date })
  updatedAt!: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Number, default: 1 })
  version!: number;
}

export type PatientDocument = Patient & Document;

export const PatientSchema = SchemaFactory.createForClass(Patient);

// Compound indexes for query optimization and tenant isolation
PatientSchema.index({ tenantId: 1, 'person.lastName': 1, 'person.firstName': 1 });
PatientSchema.index({ tenantId: 1, 'person.dateOfBirth': 1 });
PatientSchema.index({ tenantId: 1, 'contacts.phones.number': 1 });
PatientSchema.index({ tenantId: 1, 'contacts.emails.address': 1 });
PatientSchema.index({ tenantId: 1, status: 1, isDeleted: 1 });
PatientSchema.index({ tenantId: 1, tags: 1 });
PatientSchema.index({ tenantId: 1, clinicId: 1, status: 1 });
PatientSchema.index({ tenantId: 1, assignedProviderId: 1 });
PatientSchema.index({ tenantId: 1, 'medical.flags': 1 });
PatientSchema.index({ tenantId: 1, patientNumber: 1 }, { unique: true, sparse: true });
PatientSchema.index({ organizationId: 1, clinicId: 1, isDeleted: 1 });
PatientSchema.index({ createdAt: 1 });
PatientSchema.index({ updatedAt: 1 });

// Romanian CNP (national ID) search hash index for lookups
PatientSchema.index({ tenantId: 1, 'person.nationalId.searchHash': 1 }, { sparse: true });

// Text index for full-text search
PatientSchema.index(
  {
    'person.firstName': 'text',
    'person.lastName': 'text',
    'person.preferredName': 'text',
    'contacts.emails.address': 'text',
    notes: 'text',
  },
  {
    weights: {
      'person.firstName': 10,
      'person.lastName': 10,
      'person.preferredName': 5,
      'contacts.emails.address': 8,
      notes: 1,
    },
    name: 'patient_text_search',
  },
);

// Medical alerts indexes for clinical safety queries
PatientSchema.index({ tenantId: 1, 'medicalAlerts.allergies.severity': 1 }, { sparse: true });
PatientSchema.index({ tenantId: 1, 'medicalAlerts.allergies.allergen': 1 }, { sparse: true });
PatientSchema.index({ tenantId: 1, 'medicalAlerts.conditions.icd10Code': 1 }, { sparse: true });
PatientSchema.index({ tenantId: 1, 'medicalAlerts.flags.type': 1 }, { sparse: true });

// Insurance policy indexes
PatientSchema.index({ tenantId: 1, 'insurancePolicies.provider.payerId': 1 }, { sparse: true });
PatientSchema.index({ tenantId: 1, 'insurancePolicies.policyNumber': 1 }, { sparse: true });
PatientSchema.index({ tenantId: 1, 'insurancePolicies.expirationDate': 1 }, { sparse: true });
