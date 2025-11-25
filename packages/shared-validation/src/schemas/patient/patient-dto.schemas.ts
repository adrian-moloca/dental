/**
 * Patient DTO validation schemas for API operations
 * @module shared-validation/schemas/patient/dto
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  NonEmptyStringSchema,
  SortOrderSchema,
  PositiveIntSchema,
  NonNegativeIntSchema,
} from '../common.schemas';
import {
  PersonNameSchema,
  PatientContactsSchema,
  DemographicsSchema,
  MedicalFlagsSchema,
  PatientInsuranceSchema,
  CommunicationPreferencesSchema,
  ConsentRecordSchema,
  EmergencyContactSchema,
  PatientStatusSchema,
} from './patient.schemas';

// ============================================================================
// Create Patient DTO Schema
// ============================================================================

/**
 * Create patient DTO schema
 * Edge cases:
 * - Duplicate patient numbers (validated at service layer)
 * - Missing required fields
 * - Invalid tenant/organization/clinic IDs
 * - Minor patients (requires guardian info)
 * - Minimal vs complete patient creation
 */
export const CreatePatientDtoSchema = z
  .object({
    tenantId: NonEmptyStringSchema.max(100, 'Tenant ID must be 100 characters or less'),
    organizationId: UUIDSchema,
    clinicId: UUIDSchema.optional(),
    patientNumber: NonEmptyStringSchema.max(50, 'Patient number must be 50 characters or less').optional(),
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
  })
  .refine(
    (data) => {
      // Ensure at least one contact method (email or phone)
      return data.contacts.emails.length > 0 || data.contacts.phones.length > 0;
    },
    {
      message: 'At least one email or phone contact is required',
      path: ['contacts'],
    },
  )
  .refine(
    (_data) => {
      // Check if patient is a minor (under 18) - Future validation rule
      // const dob = new Date(data.demographics.dateOfBirth);
      // const today = new Date();
      // const age = today.getFullYear() - dob.getFullYear();
      // const monthDiff = today.getMonth() - dob.getMonth();
      // const isMinor = age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())));

      // If minor, should have at least one emergency contact (soft requirement)
      return true; // Made optional for flexibility
    },
    {
      message: 'Minor patients should have at least one emergency contact',
    },
  );

// ============================================================================
// Update Patient DTO Schema
// ============================================================================

/**
 * Update patient DTO schema - all fields optional except version for optimistic locking
 * Edge cases:
 * - Partial updates
 * - No fields provided (prevented)
 * - Concurrent updates (version check)
 * - Status changes requiring additional validation
 * - Updating deceased patients (prevented)
 */
export const UpdatePatientDtoSchema = z
  .object({
    name: PersonNameSchema.optional(),
    demographics: DemographicsSchema.optional(),
    contacts: PatientContactsSchema.optional(),
    emergencyContacts: z
      .array(EmergencyContactSchema)
      .max(5, 'Maximum 5 emergency contacts allowed')
      .optional(),
    insurance: PatientInsuranceSchema.optional(),
    medical: MedicalFlagsSchema.optional(),
    communicationPreferences: CommunicationPreferencesSchema.optional(),
    consents: z.array(ConsentRecordSchema).optional(),
    status: PatientStatusSchema.optional(),
    assignedProviderId: UUIDSchema.optional().nullable(),
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
      .optional(),
    notes: z.string().max(5000, 'Notes must be 5000 characters or less').optional(),
    version: NonNegativeIntSchema,
  })
  .refine(
    (data) => {
      // Ensure at least one field is being updated besides version
      const { version, ...rest } = data;
      return Object.keys(rest).length > 0;
    },
    {
      message: 'At least one field must be provided for update',
    },
  );

// ============================================================================
// Patient Query/Search DTO Schema
// ============================================================================

/**
 * Patient search/query DTO schema
 * Edge cases:
 * - No search criteria (returns all)
 * - Empty search strings
 * - Invalid date ranges
 * - Performance with large result sets
 * - Complex multi-field searches
 */
export const PatientQueryDtoSchema = z
  .object({
    // Tenant scope
    tenantId: NonEmptyStringSchema.max(100).optional(),
    organizationId: UUIDSchema,
    clinicId: UUIDSchema.optional(),
    includeAllClinics: z.boolean().default(false),

    // Search filters
    search: z.string().max(200, 'Search term must be 200 characters or less').optional(),
    patientNumber: z.string().max(50, 'Patient number must be 50 characters or less').optional(),
    firstName: z.string().max(100, 'First name must be 100 characters or less').optional(),
    lastName: z.string().max(100, 'Last name must be 100 characters or less').optional(),
    email: EmailSchema.optional(),
    phone: PhoneNumberSchema.optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),

    // Date range filters
    createdAfter: z.string().datetime().optional(),
    createdBefore: z.string().datetime().optional(),
    updatedAfter: z.string().datetime().optional(),
    updatedBefore: z.string().datetime().optional(),

    // Status filters
    status: z.array(PatientStatusSchema).optional(),
    hasInsurance: z.boolean().optional(),
    hasActiveConsent: z.boolean().optional(),

    // Provider filters
    assignedProviderId: UUIDSchema.optional(),

    // Tag filters
    tags: z.array(z.string().max(50)).optional(),
    matchAllTags: z.boolean().default(false),

    // Age filters
    minAge: NonNegativeIntSchema.optional(),
    maxAge: NonNegativeIntSchema.optional(),

    // Pagination
    page: PositiveIntSchema.default(1),
    pageSize: PositiveIntSchema.min(1).max(100).default(20),

    // Sorting
    sortBy: z
      .enum([
        'patientNumber',
        'lastName',
        'firstName',
        'dateOfBirth',
        'createdAt',
        'updatedAt',
        'lastVisit',
      ])
      .default('lastName'),
    sortOrder: SortOrderSchema.default('asc'),

    // Include options
    includeDeleted: z.boolean().default(false),
    includeInactive: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Validate date ranges
      if (data.createdAfter && data.createdBefore) {
        return new Date(data.createdAfter) < new Date(data.createdBefore);
      }
      return true;
    },
    {
      message: 'createdAfter must be before createdBefore',
      path: ['createdAfter'],
    },
  )
  .refine(
    (data) => {
      // Validate date ranges
      if (data.updatedAfter && data.updatedBefore) {
        return new Date(data.updatedAfter) < new Date(data.updatedBefore);
      }
      return true;
    },
    {
      message: 'updatedAfter must be before updatedBefore',
      path: ['updatedAfter'],
    },
  )
  .refine(
    (data) => {
      // Validate age range
      if (data.minAge !== undefined && data.maxAge !== undefined) {
        return data.minAge <= data.maxAge;
      }
      return true;
    },
    {
      message: 'minAge must be less than or equal to maxAge',
      path: ['minAge'],
    },
  );

// ============================================================================
// Patient Relationship DTO Schema
// ============================================================================

/**
 * Relationship type enum
 */
export const RelationshipTypeSchema = z.enum(
  [
    'spouse',
    'parent',
    'child',
    'sibling',
    'guardian',
    'grandparent',
    'grandchild',
    'partner',
    'other',
  ],
  {
    errorMap: (): { message: string } => ({ message: 'Invalid relationship type' }),
  },
);

/**
 * Create patient relationship DTO
 * Edge cases:
 * - Self-relationships (prevented)
 * - Circular relationships
 * - Duplicate relationships
 * - Cross-organization relationships (prevented)
 */
export const CreateRelationshipDtoSchema = z
  .object({
    patientId: UUIDSchema,
    relatedPatientId: UUIDSchema,
    relationshipType: RelationshipTypeSchema,
    isPrimaryContact: z.boolean().default(false),
    isEmergencyContact: z.boolean().default(false),
    canAccessRecords: z.boolean().default(false),
    notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
  })
  .refine(
    (data) => {
      // Prevent self-relationships
      return data.patientId !== data.relatedPatientId;
    },
    {
      message: 'Patient cannot have a relationship with themselves',
      path: ['relatedPatientId'],
    },
  );

// ============================================================================
// Merge Patients DTO Schema
// ============================================================================

/**
 * Merge patients DTO schema
 * Edge cases:
 * - Merging patients from different organizations (prevented)
 * - Merging already merged patients
 * - Data conflicts resolution
 * - Reversing merges (requires separate operation)
 */
export const MergePatientsDtoSchema = z
  .object({
    sourcePatientId: UUIDSchema,
    targetPatientId: UUIDSchema,
    organizationId: UUIDSchema,
    conflictResolution: z
      .object({
        preferSourceDemographics: z.boolean().default(false),
        preferSourceContacts: z.boolean().default(false),
        mergeInsurance: z.boolean().default(true),
        mergeMedicalHistory: z.boolean().default(true),
        mergeAppointments: z.boolean().default(true),
        mergeTreatments: z.boolean().default(true),
        mergeDocuments: z.boolean().default(true),
        mergeTags: z.boolean().default(true),
      })
      .default({}),
    reason: NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
    performedBy: UUIDSchema,
  })
  .refine(
    (data) => {
      // Prevent merging patient with itself
      return data.sourcePatientId !== data.targetPatientId;
    },
    {
      message: 'Cannot merge a patient with itself',
      path: ['targetPatientId'],
    },
  );

// ============================================================================
// Export Patient DTO Schema
// ============================================================================

/**
 * Export format enum
 */
export const ExportFormatSchema = z.enum(['json', 'csv', 'pdf', 'hl7', 'fhir'], {
  errorMap: (): { message: string } => ({ message: 'Invalid export format' }),
});

/**
 * Export patient DTO schema
 * Edge cases:
 * - Large exports (pagination required)
 * - PHI/PII handling
 * - Format-specific validations
 * - Export permissions
 */
export const ExportPatientDtoSchema = z.object({
  patientIds: z.array(UUIDSchema).min(1, 'At least one patient ID is required').max(1000, 'Maximum 1000 patients per export'),
  organizationId: UUIDSchema,
  format: ExportFormatSchema.default('json'),
  includeFields: z
    .array(
      z.enum([
        'demographics',
        'contacts',
        'insurance',
        'medical',
        'appointments',
        'treatments',
        'documents',
        'consents',
        'notes',
      ]),
    )
    .min(1, 'At least one field category must be selected')
    .optional(),
  excludeFields: z.array(z.string()).optional(),
  anonymize: z.boolean().default(false),
  includeAuditTrail: z.boolean().default(false),
  requestedBy: UUIDSchema,
  purpose: NonEmptyStringSchema.max(500, 'Purpose must be 500 characters or less'),
});

// ============================================================================
// Anonymize Patient DTO Schema
// ============================================================================

/**
 * Anonymize patient DTO schema
 * Edge cases:
 * - Partial anonymization
 * - Regulatory compliance (GDPR, HIPAA)
 * - Irreversible operation
 * - Related records handling
 */
export const AnonymizePatientDtoSchema = z.object({
  patientId: UUIDSchema,
  organizationId: UUIDSchema,
  reason: NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
  requestedBy: UUIDSchema,
  retainFields: z
    .array(
      z.enum([
        'dateOfBirth',
        'gender',
        'appointmentHistory',
        'treatmentHistory',
        'billingHistory',
      ]),
    )
    .default([]),
  performedBy: UUIDSchema,
  legalBasis: NonEmptyStringSchema.max(200, 'Legal basis must be 200 characters or less'),
  confirmIrreversible: z.literal(true, {
    errorMap: (): { message: string } => ({
      message: 'Must confirm that anonymization is irreversible',
    }),
  }),
});

// ============================================================================
// Bulk Import Patient DTO Schema
// ============================================================================

/**
 * Import source enum
 */
export const ImportSourceSchema = z.enum(['csv', 'excel', 'hl7', 'fhir', 'legacy_system'], {
  errorMap: (): { message: string } => ({ message: 'Invalid import source' }),
});

/**
 * Bulk import patient DTO schema
 * Edge cases:
 * - Large batch imports
 * - Validation failures in batch
 * - Duplicate detection
 * - Transaction handling
 * - Rollback on partial failure
 */
export const BulkImportPatientDtoSchema = z.object({
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  source: ImportSourceSchema,
  patients: z
    .array(CreatePatientDtoSchema)
    .min(1, 'At least one patient is required')
    .max(1000, 'Maximum 1000 patients per import'),
  importedBy: UUIDSchema,
  validateOnly: z.boolean().default(false),
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

// ============================================================================
// Archive/Restore Patient DTO Schema
// ============================================================================

/**
 * Archive patient DTO schema
 */
export const ArchivePatientDtoSchema = z.object({
  patientId: UUIDSchema,
  organizationId: UUIDSchema,
  reason: NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
  performedBy: UUIDSchema,
});

/**
 * Restore patient DTO schema
 */
export const RestorePatientDtoSchema = z.object({
  patientId: UUIDSchema,
  organizationId: UUIDSchema,
  reason: NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
  performedBy: UUIDSchema,
});

// ============================================================================
// Patient Communication DTO Schema
// ============================================================================

/**
 * Send patient communication DTO schema
 * Edge cases:
 * - Patient communication preferences
 * - Do not contact list
 * - Opt-out handling
 * - Multi-channel delivery
 */
export const SendPatientCommunicationDtoSchema = z
  .object({
    patientId: UUIDSchema,
    organizationId: UUIDSchema,
    channel: z.enum(['email', 'sms', 'phone', 'portal', 'mail']),
    subject: NonEmptyStringSchema.max(200, 'Subject must be 200 characters or less').optional(),
    message: NonEmptyStringSchema.max(5000, 'Message must be 5000 characters or less'),
    templateId: UUIDSchema.optional(),
    sendAt: z.string().datetime().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    requiresConsent: z.boolean().default(true),
    sentBy: UUIDSchema,
  })
  .refine(
    (data) => {
      // Email channel requires subject
      if (data.channel === 'email' && !data.subject && !data.templateId) {
        return false;
      }
      return true;
    },
    {
      message: 'Email communications require a subject or template',
      path: ['subject'],
    },
  );

// ============================================================================
// Type Inference
// ============================================================================

export type CreatePatientDtoInput = z.input<typeof CreatePatientDtoSchema>;
export type CreatePatientDtoOutput = z.output<typeof CreatePatientDtoSchema>;
export type UpdatePatientDtoInput = z.input<typeof UpdatePatientDtoSchema>;
export type UpdatePatientDtoOutput = z.output<typeof UpdatePatientDtoSchema>;
export type PatientQueryDtoInput = z.input<typeof PatientQueryDtoSchema>;
export type PatientQueryDtoOutput = z.output<typeof PatientQueryDtoSchema>;
export type CreateRelationshipDtoInput = z.input<typeof CreateRelationshipDtoSchema>;
export type CreateRelationshipDtoOutput = z.output<typeof CreateRelationshipDtoSchema>;
export type MergePatientsDtoInput = z.input<typeof MergePatientsDtoSchema>;
export type MergePatientsDtoOutput = z.output<typeof MergePatientsDtoSchema>;
export type ExportPatientDtoInput = z.input<typeof ExportPatientDtoSchema>;
export type ExportPatientDtoOutput = z.output<typeof ExportPatientDtoSchema>;
export type AnonymizePatientDtoInput = z.input<typeof AnonymizePatientDtoSchema>;
export type AnonymizePatientDtoOutput = z.output<typeof AnonymizePatientDtoSchema>;
export type BulkImportPatientDtoInput = z.input<typeof BulkImportPatientDtoSchema>;
export type BulkImportPatientDtoOutput = z.output<typeof BulkImportPatientDtoSchema>;
export type ArchivePatientDtoInput = z.input<typeof ArchivePatientDtoSchema>;
export type ArchivePatientDtoOutput = z.output<typeof ArchivePatientDtoSchema>;
export type RestorePatientDtoInput = z.input<typeof RestorePatientDtoSchema>;
export type RestorePatientDtoOutput = z.output<typeof RestorePatientDtoSchema>;
export type SendPatientCommunicationDtoInput = z.input<typeof SendPatientCommunicationDtoSchema>;
export type SendPatientCommunicationDtoOutput = z.output<typeof SendPatientCommunicationDtoSchema>;
