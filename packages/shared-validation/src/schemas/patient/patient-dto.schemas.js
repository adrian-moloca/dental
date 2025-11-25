"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendPatientCommunicationDtoSchema = exports.RestorePatientDtoSchema = exports.ArchivePatientDtoSchema = exports.BulkImportPatientDtoSchema = exports.ImportSourceSchema = exports.AnonymizePatientDtoSchema = exports.ExportPatientDtoSchema = exports.ExportFormatSchema = exports.MergePatientsDtoSchema = exports.CreateRelationshipDtoSchema = exports.RelationshipTypeSchema = exports.PatientQueryDtoSchema = exports.UpdatePatientDtoSchema = exports.CreatePatientDtoSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
const patient_schemas_1 = require("./patient.schemas");
exports.CreatePatientDtoSchema = zod_1.z
    .object({
    tenantId: common_schemas_1.NonEmptyStringSchema.max(100, 'Tenant ID must be 100 characters or less'),
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    patientNumber: common_schemas_1.NonEmptyStringSchema.max(50, 'Patient number must be 50 characters or less').optional(),
    name: patient_schemas_1.PersonNameSchema,
    demographics: patient_schemas_1.DemographicsSchema,
    contacts: patient_schemas_1.PatientContactsSchema,
    emergencyContacts: zod_1.z
        .array(patient_schemas_1.EmergencyContactSchema)
        .max(5, 'Maximum 5 emergency contacts allowed')
        .default([]),
    insurance: patient_schemas_1.PatientInsuranceSchema.optional(),
    medical: patient_schemas_1.MedicalFlagsSchema.optional(),
    communicationPreferences: patient_schemas_1.CommunicationPreferencesSchema,
    consents: zod_1.z.array(patient_schemas_1.ConsentRecordSchema).default([]),
    assignedProviderId: common_schemas_1.UUIDSchema.optional(),
    referralSource: zod_1.z.string().max(200, 'Referral source must be 200 characters or less').optional(),
    tags: zod_1.z
        .array(zod_1.z
        .string()
        .max(50, 'Tag must be 50 characters or less')
        .regex(/^[a-z0-9-_]+$/, {
        message: 'Tags must contain only lowercase letters, numbers, hyphens, and underscores',
    }))
        .max(20, 'Maximum 20 tags allowed')
        .default([]),
    notes: zod_1.z.string().max(5000, 'Notes must be 5000 characters or less').optional(),
})
    .refine((data) => {
    return data.contacts.emails.length > 0 || data.contacts.phones.length > 0;
}, {
    message: 'At least one email or phone contact is required',
    path: ['contacts'],
})
    .refine((_data) => {
    return true;
}, {
    message: 'Minor patients should have at least one emergency contact',
});
exports.UpdatePatientDtoSchema = zod_1.z
    .object({
    name: patient_schemas_1.PersonNameSchema.optional(),
    demographics: patient_schemas_1.DemographicsSchema.optional(),
    contacts: patient_schemas_1.PatientContactsSchema.optional(),
    emergencyContacts: zod_1.z
        .array(patient_schemas_1.EmergencyContactSchema)
        .max(5, 'Maximum 5 emergency contacts allowed')
        .optional(),
    insurance: patient_schemas_1.PatientInsuranceSchema.optional(),
    medical: patient_schemas_1.MedicalFlagsSchema.optional(),
    communicationPreferences: patient_schemas_1.CommunicationPreferencesSchema.optional(),
    consents: zod_1.z.array(patient_schemas_1.ConsentRecordSchema).optional(),
    status: patient_schemas_1.PatientStatusSchema.optional(),
    assignedProviderId: common_schemas_1.UUIDSchema.optional().nullable(),
    referralSource: zod_1.z.string().max(200, 'Referral source must be 200 characters or less').optional(),
    tags: zod_1.z
        .array(zod_1.z
        .string()
        .max(50, 'Tag must be 50 characters or less')
        .regex(/^[a-z0-9-_]+$/, {
        message: 'Tags must contain only lowercase letters, numbers, hyphens, and underscores',
    }))
        .max(20, 'Maximum 20 tags allowed')
        .optional(),
    notes: zod_1.z.string().max(5000, 'Notes must be 5000 characters or less').optional(),
    version: common_schemas_1.NonNegativeIntSchema,
})
    .refine((data) => {
    const { version, ...rest } = data;
    return Object.keys(rest).length > 0;
}, {
    message: 'At least one field must be provided for update',
});
exports.PatientQueryDtoSchema = zod_1.z
    .object({
    tenantId: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    includeAllClinics: zod_1.z.boolean().default(false),
    search: zod_1.z.string().max(200, 'Search term must be 200 characters or less').optional(),
    patientNumber: zod_1.z.string().max(50, 'Patient number must be 50 characters or less').optional(),
    firstName: zod_1.z.string().max(100, 'First name must be 100 characters or less').optional(),
    lastName: zod_1.z.string().max(100, 'Last name must be 100 characters or less').optional(),
    email: common_schemas_1.EmailSchema.optional(),
    phone: common_schemas_1.PhoneNumberSchema.optional(),
    dateOfBirth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    createdAfter: zod_1.z.string().datetime().optional(),
    createdBefore: zod_1.z.string().datetime().optional(),
    updatedAfter: zod_1.z.string().datetime().optional(),
    updatedBefore: zod_1.z.string().datetime().optional(),
    status: zod_1.z.array(patient_schemas_1.PatientStatusSchema).optional(),
    hasInsurance: zod_1.z.boolean().optional(),
    hasActiveConsent: zod_1.z.boolean().optional(),
    assignedProviderId: common_schemas_1.UUIDSchema.optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).optional(),
    matchAllTags: zod_1.z.boolean().default(false),
    minAge: common_schemas_1.NonNegativeIntSchema.optional(),
    maxAge: common_schemas_1.NonNegativeIntSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z
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
    sortOrder: common_schemas_1.SortOrderSchema.default('asc'),
    includeDeleted: zod_1.z.boolean().default(false),
    includeInactive: zod_1.z.boolean().default(false),
})
    .refine((data) => {
    if (data.createdAfter && data.createdBefore) {
        return new Date(data.createdAfter) < new Date(data.createdBefore);
    }
    return true;
}, {
    message: 'createdAfter must be before createdBefore',
    path: ['createdAfter'],
})
    .refine((data) => {
    if (data.updatedAfter && data.updatedBefore) {
        return new Date(data.updatedAfter) < new Date(data.updatedBefore);
    }
    return true;
}, {
    message: 'updatedAfter must be before updatedBefore',
    path: ['updatedAfter'],
})
    .refine((data) => {
    if (data.minAge !== undefined && data.maxAge !== undefined) {
        return data.minAge <= data.maxAge;
    }
    return true;
}, {
    message: 'minAge must be less than or equal to maxAge',
    path: ['minAge'],
});
exports.RelationshipTypeSchema = zod_1.z.enum([
    'spouse',
    'parent',
    'child',
    'sibling',
    'guardian',
    'grandparent',
    'grandchild',
    'partner',
    'other',
], {
    errorMap: () => ({ message: 'Invalid relationship type' }),
});
exports.CreateRelationshipDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema,
    relatedPatientId: common_schemas_1.UUIDSchema,
    relationshipType: exports.RelationshipTypeSchema,
    isPrimaryContact: zod_1.z.boolean().default(false),
    isEmergencyContact: zod_1.z.boolean().default(false),
    canAccessRecords: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().max(500, 'Notes must be 500 characters or less').optional(),
})
    .refine((data) => {
    return data.patientId !== data.relatedPatientId;
}, {
    message: 'Patient cannot have a relationship with themselves',
    path: ['relatedPatientId'],
});
exports.MergePatientsDtoSchema = zod_1.z
    .object({
    sourcePatientId: common_schemas_1.UUIDSchema,
    targetPatientId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    conflictResolution: zod_1.z
        .object({
        preferSourceDemographics: zod_1.z.boolean().default(false),
        preferSourceContacts: zod_1.z.boolean().default(false),
        mergeInsurance: zod_1.z.boolean().default(true),
        mergeMedicalHistory: zod_1.z.boolean().default(true),
        mergeAppointments: zod_1.z.boolean().default(true),
        mergeTreatments: zod_1.z.boolean().default(true),
        mergeDocuments: zod_1.z.boolean().default(true),
        mergeTags: zod_1.z.boolean().default(true),
    })
        .default({}),
    reason: common_schemas_1.NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
    performedBy: common_schemas_1.UUIDSchema,
})
    .refine((data) => {
    return data.sourcePatientId !== data.targetPatientId;
}, {
    message: 'Cannot merge a patient with itself',
    path: ['targetPatientId'],
});
exports.ExportFormatSchema = zod_1.z.enum(['json', 'csv', 'pdf', 'hl7', 'fhir'], {
    errorMap: () => ({ message: 'Invalid export format' }),
});
exports.ExportPatientDtoSchema = zod_1.z.object({
    patientIds: zod_1.z.array(common_schemas_1.UUIDSchema).min(1, 'At least one patient ID is required').max(1000, 'Maximum 1000 patients per export'),
    organizationId: common_schemas_1.UUIDSchema,
    format: exports.ExportFormatSchema.default('json'),
    includeFields: zod_1.z
        .array(zod_1.z.enum([
        'demographics',
        'contacts',
        'insurance',
        'medical',
        'appointments',
        'treatments',
        'documents',
        'consents',
        'notes',
    ]))
        .min(1, 'At least one field category must be selected')
        .optional(),
    excludeFields: zod_1.z.array(zod_1.z.string()).optional(),
    anonymize: zod_1.z.boolean().default(false),
    includeAuditTrail: zod_1.z.boolean().default(false),
    requestedBy: common_schemas_1.UUIDSchema,
    purpose: common_schemas_1.NonEmptyStringSchema.max(500, 'Purpose must be 500 characters or less'),
});
exports.AnonymizePatientDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
    requestedBy: common_schemas_1.UUIDSchema,
    retainFields: zod_1.z
        .array(zod_1.z.enum([
        'dateOfBirth',
        'gender',
        'appointmentHistory',
        'treatmentHistory',
        'billingHistory',
    ]))
        .default([]),
    performedBy: common_schemas_1.UUIDSchema,
    legalBasis: common_schemas_1.NonEmptyStringSchema.max(200, 'Legal basis must be 200 characters or less'),
    confirmIrreversible: zod_1.z.literal(true, {
        errorMap: () => ({
            message: 'Must confirm that anonymization is irreversible',
        }),
    }),
});
exports.ImportSourceSchema = zod_1.z.enum(['csv', 'excel', 'hl7', 'fhir', 'legacy_system'], {
    errorMap: () => ({ message: 'Invalid import source' }),
});
exports.BulkImportPatientDtoSchema = zod_1.z.object({
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    source: exports.ImportSourceSchema,
    patients: zod_1.z
        .array(exports.CreatePatientDtoSchema)
        .min(1, 'At least one patient is required')
        .max(1000, 'Maximum 1000 patients per import'),
    importedBy: common_schemas_1.UUIDSchema,
    validateOnly: zod_1.z.boolean().default(false),
    skipDuplicates: zod_1.z.boolean().default(true),
    updateExisting: zod_1.z.boolean().default(false),
    dryRun: zod_1.z.boolean().default(false),
});
exports.ArchivePatientDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
    performedBy: common_schemas_1.UUIDSchema,
});
exports.RestorePatientDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
    performedBy: common_schemas_1.UUIDSchema,
});
exports.SendPatientCommunicationDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    channel: zod_1.z.enum(['email', 'sms', 'phone', 'portal', 'mail']),
    subject: common_schemas_1.NonEmptyStringSchema.max(200, 'Subject must be 200 characters or less').optional(),
    message: common_schemas_1.NonEmptyStringSchema.max(5000, 'Message must be 5000 characters or less'),
    templateId: common_schemas_1.UUIDSchema.optional(),
    sendAt: zod_1.z.string().datetime().optional(),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    requiresConsent: zod_1.z.boolean().default(true),
    sentBy: common_schemas_1.UUIDSchema,
})
    .refine((data) => {
    if (data.channel === 'email' && !data.subject && !data.templateId) {
        return false;
    }
    return true;
}, {
    message: 'Email communications require a subject or template',
    path: ['subject'],
});
//# sourceMappingURL=patient-dto.schemas.js.map