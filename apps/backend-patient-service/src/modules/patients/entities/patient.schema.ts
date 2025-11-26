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
 * Medical information sub-document
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
 * Insurance information sub-document
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

  @Prop({ required: true, type: MedicalInfo })
  medical!: MedicalInfo;

  @Prop({ type: Object })
  insurance?: {
    primary?: InsuranceInfo;
    secondary?: InsuranceInfo;
  };

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
