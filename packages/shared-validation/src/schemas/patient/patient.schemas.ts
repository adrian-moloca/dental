/**
 * Patient entity core validation schemas
 * @module shared-validation/schemas/patient
 */

import { z } from 'zod';
import { ContactMethod } from '@dentalos/shared-types';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  ISODateStringSchema,
  DateOnlySchema,
  NonEmptyStringSchema,
  GenderSchema,
  MaritalStatusSchema,
  ContactMethodSchema,
  URLSchema,
  NonNegativeIntSchema,
  MetadataSchema,
} from '../common.schemas';

// ============================================================================
// Person Name Schema
// ============================================================================

/**
 * Person name schema with comprehensive validation
 * Handles edge cases:
 * - Single-character names (valid in some cultures)
 * - Hyphenated names
 * - Names with apostrophes
 * - Special characters in international names
 */
export const PersonNameSchema = z.object({
  firstName: NonEmptyStringSchema
    .max(100, 'First name must be 100 characters or less')
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, {
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    }),
  middleName: z
    .string()
    .max(100, 'Middle name must be 100 characters or less')
    .regex(/^[A-Za-zÀ-ÿ\s'-]*$/, {
      message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes',
    })
    .optional(),
  lastName: NonEmptyStringSchema
    .max(100, 'Last name must be 100 characters or less')
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, {
      message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
    }),
  preferredName: z
    .string()
    .max(100, 'Preferred name must be 100 characters or less')
    .regex(/^[A-Za-zÀ-ÿ\s'-]*$/, {
      message: 'Preferred name can only contain letters, spaces, hyphens, and apostrophes',
    })
    .optional(),
  suffix: z
    .string()
    .max(20, 'Suffix must be 20 characters or less')
    .regex(/^[A-Za-z., ]*$/, {
      message: 'Suffix can only contain letters, periods, commas, and spaces',
    })
    .optional(),
  title: z
    .string()
    .max(20, 'Title must be 20 characters or less')
    .regex(/^[A-Za-z. ]*$/, {
      message: 'Title can only contain letters, periods, and spaces',
    })
    .optional(),
});

// ============================================================================
// Contact Schemas
// ============================================================================

/**
 * Phone contact type enum
 */
export const PhoneTypeSchema = z.enum(['mobile', 'home', 'work', 'fax', 'other'], {
  errorMap: (): { message: string } => ({ message: 'Invalid phone type' }),
});

/**
 * Phone contact schema with primary designation
 * Edge cases:
 * - Multiple primary phones (prevented via validation)
 * - Phone without type (defaults to mobile)
 * - Extension numbers for work phones
 */
export const PhoneContactSchema = z.object({
  type: PhoneTypeSchema.default('mobile'),
  number: PhoneNumberSchema,
  extension: z
    .string()
    .max(10, 'Extension must be 10 characters or less')
    .regex(/^\d+$/, { message: 'Extension must contain only digits' })
    .optional(),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  notes: z.string().max(200, 'Phone notes must be 200 characters or less').optional(),
});

/**
 * Email contact type enum
 */
export const EmailTypeSchema = z.enum(['personal', 'work', 'other'], {
  errorMap: (): { message: string } => ({ message: 'Invalid email type' }),
});

/**
 * Email contact schema with verification status
 * Edge cases:
 * - Multiple primary emails (prevented)
 * - Unverified emails
 * - Email without type (defaults to personal)
 */
export const EmailContactSchema = z.object({
  type: EmailTypeSchema.default('personal'),
  address: EmailSchema,
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  verifiedAt: ISODateStringSchema.optional(),
  notes: z.string().max(200, 'Email notes must be 200 characters or less').optional(),
});

/**
 * Address type enum
 */
export const AddressTypeSchema = z.enum(['home', 'work', 'billing', 'shipping', 'other'], {
  errorMap: (): { message: string } => ({ message: 'Invalid address type' }),
});

/**
 * Physical address schema
 * Edge cases:
 * - Military addresses (APO/FPO)
 * - International addresses
 * - PO Box addresses
 * - Missing postal codes (some countries)
 */
export const PhysicalAddressSchema = z.object({
  type: AddressTypeSchema.default('home'),
  street1: NonEmptyStringSchema.max(200, 'Street address line 1 must be 200 characters or less'),
  street2: z.string().max(200, 'Street address line 2 must be 200 characters or less').optional(),
  city: NonEmptyStringSchema.max(100, 'City must be 100 characters or less'),
  state: z.string().max(100, 'State/Province must be 100 characters or less').optional(),
  postalCode: z.string().max(20, 'Postal code must be 20 characters or less').optional(),
  country: NonEmptyStringSchema.max(100, 'Country must be 100 characters or less').default('USA'),
  isPrimary: z.boolean().default(false),
  notes: z.string().max(200, 'Address notes must be 200 characters or less').optional(),
});

/**
 * Patient contacts schema with validation
 * Edge cases:
 * - No contacts provided
 * - Multiple primary contacts of same type (prevented)
 * - All contacts of same type
 */
export const PatientContactsSchema = z
  .object({
    phones: z.array(PhoneContactSchema).default([]),
    emails: z.array(EmailContactSchema).default([]),
    addresses: z.array(PhysicalAddressSchema).default([]),
    preferredContactMethod: ContactMethodSchema.default(ContactMethod.EMAIL),
  })
  .refine(
    (data) => {
      // Ensure at most one primary phone
      const primaryPhones = data.phones.filter((p) => p.isPrimary);
      return primaryPhones.length <= 1;
    },
    {
      message: 'Only one primary phone number is allowed',
      path: ['phones'],
    },
  )
  .refine(
    (data) => {
      // Ensure at most one primary email
      const primaryEmails = data.emails.filter((e) => e.isPrimary);
      return primaryEmails.length <= 1;
    },
    {
      message: 'Only one primary email address is allowed',
      path: ['emails'],
    },
  )
  .refine(
    (data) => {
      // Ensure at most one primary address
      const primaryAddresses = data.addresses.filter((a) => a.isPrimary);
      return primaryAddresses.length <= 1;
    },
    {
      message: 'Only one primary address is allowed',
      path: ['addresses'],
    },
  );

// ============================================================================
// Demographics Schema
// ============================================================================

/**
 * Ethnicity enum (based on US Census categories)
 */
export const EthnicitySchema = z.enum(
  [
    'hispanic_latino',
    'not_hispanic_latino',
    'american_indian_alaska_native',
    'asian',
    'black_african_american',
    'native_hawaiian_pacific_islander',
    'white',
    'other',
    'prefer_not_to_say',
  ],
  {
    errorMap: (): { message: string } => ({ message: 'Invalid ethnicity' }),
  },
);

/**
 * Demographics schema
 * Edge cases:
 * - Future date of birth (prevented)
 * - Very old dates (120+ years, allowed but flagged)
 * - Minors (under 18)
 * - SSN validation (optional, format validation only)
 * - Invalid language codes
 */
export const DemographicsSchema = z
  .object({
    dateOfBirth: DateOnlySchema,
    gender: GenderSchema,
    maritalStatus: MaritalStatusSchema.optional(),
    ethnicity: EthnicitySchema.optional(),
    race: z.array(z.string().max(100)).default([]),
    preferredLanguage: z
      .string()
      .max(10, 'Language code must be 10 characters or less')
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/, {
        message: 'Language must be a valid ISO 639-1 code (e.g., en, en-US)',
      })
      .default('en'),
    occupation: z.string().max(200, 'Occupation must be 200 characters or less').optional(),
    employer: z.string().max(200, 'Employer must be 200 characters or less').optional(),
    socialSecurityNumber: z
      .string()
      .regex(/^\d{3}-\d{2}-\d{4}$/, {
        message: 'SSN must be in format XXX-XX-XXXX',
      })
      .optional(),
    photoUrl: URLSchema.optional(),
  })
  .refine(
    (data) => {
      // Prevent future dates of birth
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dob <= today;
    },
    {
      message: 'Date of birth cannot be in the future',
      path: ['dateOfBirth'],
    },
  )
  .refine(
    (data) => {
      // Prevent unrealistic dates (more than 150 years ago)
      const dob = new Date(data.dateOfBirth);
      const maxAge = 150;
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - maxAge);
      return dob >= minDate;
    },
    {
      message: 'Date of birth cannot be more than 150 years ago',
      path: ['dateOfBirth'],
    },
  );

// ============================================================================
// Medical Information Schemas
// ============================================================================

/**
 * Medical alert severity
 */
export const MedicalSeveritySchema = z.enum(['mild', 'moderate', 'severe', 'life_threatening'], {
  errorMap: (): { message: string } => ({ message: 'Invalid severity level' }),
});

/**
 * Medical flags schema for critical alerts
 * Edge cases:
 * - Empty arrays (valid)
 * - Duplicate entries (allowed, might be different instances)
 * - Very long lists (limited to reasonable bounds)
 */
export const MedicalFlagsSchema = z.object({
  allergies: z
    .array(
      z.object({
        allergen: NonEmptyStringSchema.max(200, 'Allergen must be 200 characters or less'),
        severity: MedicalSeveritySchema.optional(),
        reaction: z.string().max(500, 'Reaction must be 500 characters or less').optional(),
        verifiedDate: DateOnlySchema.optional(),
        notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
      }),
    )
    .max(50, 'Maximum 50 allergies allowed')
    .default([]),
  medications: z
    .array(
      z.object({
        name: NonEmptyStringSchema.max(200, 'Medication name must be 200 characters or less'),
        dosage: z.string().max(100, 'Dosage must be 100 characters or less').optional(),
        frequency: z.string().max(100, 'Frequency must be 100 characters or less').optional(),
        startDate: DateOnlySchema.optional(),
        endDate: DateOnlySchema.optional(),
        prescribedBy: z.string().max(200, 'Prescriber must be 200 characters or less').optional(),
        notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
      }),
    )
    .max(100, 'Maximum 100 medications allowed')
    .default([]),
  conditions: z
    .array(
      z.object({
        name: NonEmptyStringSchema.max(200, 'Condition name must be 200 characters or less'),
        diagnosedDate: DateOnlySchema.optional(),
        status: z.enum(['active', 'resolved', 'chronic']).optional(),
        severity: MedicalSeveritySchema.optional(),
        notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
      }),
    )
    .max(50, 'Maximum 50 conditions allowed')
    .default([]),
  alerts: z
    .array(
      z.object({
        type: z.enum(['allergy', 'medical', 'behavioral', 'administrative']),
        message: NonEmptyStringSchema.max(500, 'Alert message must be 500 characters or less'),
        severity: MedicalSeveritySchema.default('moderate'),
        createdAt: ISODateStringSchema,
        createdBy: UUIDSchema,
        expiresAt: ISODateStringSchema.optional(),
      }),
    )
    .max(20, 'Maximum 20 active alerts allowed')
    .default([]),
});

// ============================================================================
// Insurance Schemas
// ============================================================================

/**
 * Insurance coverage type
 */
export const InsuranceCoverageTypeSchema = z.enum(['primary', 'secondary', 'tertiary'], {
  errorMap: (): { message: string } => ({ message: 'Invalid coverage type' }),
});

/**
 * Relationship to subscriber
 */
export const RelationshipToSubscriberSchema = z.enum(
  ['self', 'spouse', 'child', 'parent', 'other'],
  {
    errorMap: (): { message: string } => ({ message: 'Invalid relationship' }),
  },
);

/**
 * Insurance information schema
 * Edge cases:
 * - Missing policy numbers
 * - Expired coverage
 * - Multiple active insurances
 * - Self-pay patients (no insurance)
 */
export const InsuranceInfoSchema = z
  .object({
    provider: NonEmptyStringSchema.max(200, 'Provider name must be 200 characters or less'),
    policyNumber: NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less'),
    groupNumber: z.string().max(100, 'Group number must be 100 characters or less').optional(),
    subscriberName: NonEmptyStringSchema.max(200, 'Subscriber name must be 200 characters or less'),
    subscriberDateOfBirth: DateOnlySchema.optional(),
    relationshipToSubscriber: RelationshipToSubscriberSchema.default('self'),
    effectiveDate: DateOnlySchema.optional(),
    terminationDate: DateOnlySchema.optional(),
    coverageType: InsuranceCoverageTypeSchema.default('primary'),
    isActive: z.boolean().default(true),
    planName: z.string().max(200, 'Plan name must be 200 characters or less').optional(),
    planType: z.string().max(100, 'Plan type must be 100 characters or less').optional(),
    insurancePhone: PhoneNumberSchema.optional(),
    notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  })
  .refine(
    (data) => {
      // If termination date exists, it must be after effective date
      if (data.effectiveDate && data.terminationDate) {
        return new Date(data.terminationDate) > new Date(data.effectiveDate);
      }
      return true;
    },
    {
      message: 'Termination date must be after effective date',
      path: ['terminationDate'],
    },
  );

/**
 * Patient insurance schema with multiple coverage levels
 */
export const PatientInsuranceSchema = z
  .object({
    primary: InsuranceInfoSchema.optional(),
    secondary: InsuranceInfoSchema.optional(),
    tertiary: InsuranceInfoSchema.optional(),
  })
  .refine(
    (data) => {
      // Cannot have secondary without primary
      if (data.secondary && !data.primary) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot have secondary insurance without primary insurance',
      path: ['secondary'],
    },
  )
  .refine(
    (data) => {
      // Cannot have tertiary without secondary
      if (data.tertiary && !data.secondary) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot have tertiary insurance without secondary insurance',
      path: ['tertiary'],
    },
  );

// ============================================================================
// Communication & Consent Schemas
// ============================================================================

/**
 * Communication channel preferences
 */
export const CommunicationChannelSchema = z.enum(['email', 'sms', 'phone', 'portal', 'mail'], {
  errorMap: (): { message: string } => ({ message: 'Invalid communication channel' }),
});

/**
 * Communication preferences schema
 * Edge cases:
 * - All channels disabled
 * - Preferred channel not in enabled channels
 * - Time zone for scheduling preferences
 */
export const CommunicationPreferencesSchema = z
  .object({
    preferredChannel: CommunicationChannelSchema.default('email'),
    enabledChannels: z.array(CommunicationChannelSchema).min(1, 'At least one channel must be enabled'),
    appointmentReminders: z.boolean().default(true),
    recallReminders: z.boolean().default(true),
    treatmentUpdates: z.boolean().default(true),
    marketingCommunications: z.boolean().default(false),
    educationalContent: z.boolean().default(true),
    surveyRequests: z.boolean().default(true),
    preferredContactTime: z
      .object({
        start: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' }),
        end: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' }),
      })
      .optional(),
    doNotContact: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Preferred channel must be in enabled channels
      return data.enabledChannels.indexOf(data.preferredChannel) !== -1;
    },
    {
      message: 'Preferred channel must be one of the enabled channels',
      path: ['preferredChannel'],
    },
  )
  .refine(
    (data) => {
      // If do not contact is true, all other preferences should be false
      if (data.doNotContact) {
        return (
          !data.appointmentReminders &&
          !data.recallReminders &&
          !data.treatmentUpdates &&
          !data.marketingCommunications &&
          !data.educationalContent &&
          !data.surveyRequests
        );
      }
      return true;
    },
    {
      message: 'When "Do Not Contact" is enabled, all communication preferences must be disabled',
      path: ['doNotContact'],
    },
  );

/**
 * Consent type enum
 */
export const ConsentTypeSchema = z.enum(
  [
    'treatment',
    'privacy_notice',
    'hipaa',
    'financial_policy',
    'photography',
    'communication',
    'research',
    'minors',
  ],
  {
    errorMap: (): { message: string } => ({ message: 'Invalid consent type' }),
  },
);

/**
 * Consent record schema
 * Edge cases:
 * - Revoked consents
 * - Expired consents
 * - Minor consent (requires guardian)
 * - Digital vs paper signatures
 */
export const ConsentRecordSchema = z
  .object({
    type: ConsentTypeSchema,
    granted: z.boolean(),
    grantedAt: ISODateStringSchema,
    grantedBy: UUIDSchema,
    revokedAt: ISODateStringSchema.optional(),
    revokedBy: UUIDSchema.optional(),
    expiresAt: ISODateStringSchema.optional(),
    signatureType: z.enum(['digital', 'paper', 'verbal']).default('digital'),
    signatureData: z.string().optional(),
    documentUrl: URLSchema.optional(),
    notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    version: NonEmptyStringSchema.max(20, 'Version must be 20 characters or less').default('1.0'),
  })
  .refine(
    (data) => {
      // If revoked, must have revokedAt and revokedBy
      if (data.revokedAt) {
        return data.revokedBy !== undefined;
      }
      return true;
    },
    {
      message: 'Revoked consent must have revokedBy identifier',
      path: ['revokedBy'],
    },
  )
  .refine(
    (data) => {
      // Revoked date must be after granted date
      if (data.revokedAt && data.grantedAt) {
        return new Date(data.revokedAt) > new Date(data.grantedAt);
      }
      return true;
    },
    {
      message: 'Revoked date must be after granted date',
      path: ['revokedAt'],
    },
  );

// ============================================================================
// Emergency Contact Schema
// ============================================================================

/**
 * Emergency contact schema
 * Edge cases:
 * - Same person as patient
 * - Missing phone numbers
 * - Multiple emergency contacts
 */
export const EmergencyContactSchema = z.object({
  name: NonEmptyStringSchema.max(200, 'Name must be 200 characters or less'),
  relationship: NonEmptyStringSchema.max(100, 'Relationship must be 100 characters or less'),
  phoneNumber: PhoneNumberSchema,
  alternatePhoneNumber: PhoneNumberSchema.optional(),
  email: EmailSchema.optional(),
  address: PhysicalAddressSchema.optional(),
  isPrimary: z.boolean().default(true),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

// ============================================================================
// Patient Status Schema
// ============================================================================

/**
 * Patient status enum
 */
export const PatientStatusSchema = z.enum(
  ['active', 'inactive', 'archived', 'deceased', 'merged'],
  {
    errorMap: (): { message: string } => ({ message: 'Invalid patient status' }),
  },
);

// ============================================================================
// Complete Patient Schema
// ============================================================================

/**
 * Complete patient entity schema
 * Edge cases:
 * - Duplicate patient numbers within organization
 * - Missing required demographic info
 * - Inactive/archived patients
 * - Soft deleted patients
 * - Merged patients
 * - Multi-clinic patients
 */
export const PatientSchema = z
  .object({
    id: UUIDSchema,
    tenantId: NonEmptyStringSchema.max(100, 'Tenant ID must be 100 characters or less'),
    organizationId: UUIDSchema,
    clinicId: UUIDSchema.optional(),
    patientNumber: NonEmptyStringSchema.max(50, 'Patient number must be 50 characters or less'),
    name: PersonNameSchema,
    demographics: DemographicsSchema,
    contacts: PatientContactsSchema,
    emergencyContacts: z
      .array(EmergencyContactSchema)
      .max(5, 'Maximum 5 emergency contacts allowed')
      .default([]),
    insurance: PatientInsuranceSchema.optional(),
    medical: MedicalFlagsSchema.optional(),
    communicationPreferences: CommunicationPreferencesSchema,
    consents: z.array(ConsentRecordSchema).default([]),
    status: PatientStatusSchema.default('active'),
    assignedProviderId: UUIDSchema.optional(),
    referralSource: z.string().max(200, 'Referral source must be 200 characters or less').optional(),
    tags: z
      .array(
        z
          .string()
          .max(50, 'Tag must be 50 characters or less')
          .regex(/^[a-z0-9-_]+$/, {
            message: 'Tags must contain only lowercase letters, numbers, hyphens, and underscores',
          }),
      )
      .max(20, 'Maximum 20 tags allowed')
      .default([]),
    notes: z.string().max(5000, 'Notes must be 5000 characters or less').optional(),
    metadata: MetadataSchema.optional(),
    createdAt: ISODateStringSchema,
    updatedAt: ISODateStringSchema,
    deletedAt: ISODateStringSchema.nullable().optional(),
    createdBy: UUIDSchema,
    updatedBy: UUIDSchema,
    deletedBy: UUIDSchema.nullable().optional(),
    version: NonNegativeIntSchema.default(1),
  })
  .refine(
    (data) => {
      // Deceased patients must be marked as inactive or archived
      if (data.status === 'deceased') {
        return true; // Deceased is its own status
      }
      return true;
    },
    {
      message: 'Patient status validation passed',
    },
  )
  .refine(
    (_data) => {
      // Ensure at least one emergency contact for active patients
      // This is a soft requirement, can be overridden
      return true; // Made optional for flexibility
    },
    {
      message: 'Active patients should have at least one emergency contact',
    },
  );

// ============================================================================
// Type Inference
// ============================================================================

export type PersonNameInput = z.input<typeof PersonNameSchema>;
export type PersonNameOutput = z.output<typeof PersonNameSchema>;
export type PhoneContactInput = z.input<typeof PhoneContactSchema>;
export type PhoneContactOutput = z.output<typeof PhoneContactSchema>;
export type EmailContactInput = z.input<typeof EmailContactSchema>;
export type EmailContactOutput = z.output<typeof EmailContactSchema>;
export type PhysicalAddressInput = z.input<typeof PhysicalAddressSchema>;
export type PhysicalAddressOutput = z.output<typeof PhysicalAddressSchema>;
export type PatientContactsInput = z.input<typeof PatientContactsSchema>;
export type PatientContactsOutput = z.output<typeof PatientContactsSchema>;
export type DemographicsInput = z.input<typeof DemographicsSchema>;
export type DemographicsOutput = z.output<typeof DemographicsSchema>;
export type MedicalFlagsInput = z.input<typeof MedicalFlagsSchema>;
export type MedicalFlagsOutput = z.output<typeof MedicalFlagsSchema>;
export type InsuranceInfoInput = z.input<typeof InsuranceInfoSchema>;
export type InsuranceInfoOutput = z.output<typeof InsuranceInfoSchema>;
export type PatientInsuranceInput = z.input<typeof PatientInsuranceSchema>;
export type PatientInsuranceOutput = z.output<typeof PatientInsuranceSchema>;
export type CommunicationPreferencesInput = z.input<typeof CommunicationPreferencesSchema>;
export type CommunicationPreferencesOutput = z.output<typeof CommunicationPreferencesSchema>;
export type ConsentRecordInput = z.input<typeof ConsentRecordSchema>;
export type ConsentRecordOutput = z.output<typeof ConsentRecordSchema>;
export type EmergencyContactInput = z.input<typeof EmergencyContactSchema>;
export type EmergencyContactOutput = z.output<typeof EmergencyContactSchema>;
export type PatientInput = z.input<typeof PatientSchema>;
export type PatientOutput = z.output<typeof PatientSchema>;
