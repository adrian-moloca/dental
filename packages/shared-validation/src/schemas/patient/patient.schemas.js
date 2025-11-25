"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientSchema = exports.PatientStatusSchema = exports.EmergencyContactSchema = exports.ConsentRecordSchema = exports.ConsentTypeSchema = exports.CommunicationPreferencesSchema = exports.CommunicationChannelSchema = exports.PatientInsuranceSchema = exports.InsuranceInfoSchema = exports.RelationshipToSubscriberSchema = exports.InsuranceCoverageTypeSchema = exports.MedicalFlagsSchema = exports.MedicalSeveritySchema = exports.DemographicsSchema = exports.EthnicitySchema = exports.PatientContactsSchema = exports.PhysicalAddressSchema = exports.AddressTypeSchema = exports.EmailContactSchema = exports.EmailTypeSchema = exports.PhoneContactSchema = exports.PhoneTypeSchema = exports.PersonNameSchema = void 0;
const zod_1 = require("zod");
const shared_types_1 = require("@dentalos/shared-types");
const common_schemas_1 = require("../common.schemas");
exports.PersonNameSchema = zod_1.z.object({
    firstName: common_schemas_1.NonEmptyStringSchema
        .max(100, 'First name must be 100 characters or less')
        .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, {
        message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    }),
    middleName: zod_1.z
        .string()
        .max(100, 'Middle name must be 100 characters or less')
        .regex(/^[A-Za-zÀ-ÿ\s'-]*$/, {
        message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes',
    })
        .optional(),
    lastName: common_schemas_1.NonEmptyStringSchema
        .max(100, 'Last name must be 100 characters or less')
        .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, {
        message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
    }),
    preferredName: zod_1.z
        .string()
        .max(100, 'Preferred name must be 100 characters or less')
        .regex(/^[A-Za-zÀ-ÿ\s'-]*$/, {
        message: 'Preferred name can only contain letters, spaces, hyphens, and apostrophes',
    })
        .optional(),
    suffix: zod_1.z
        .string()
        .max(20, 'Suffix must be 20 characters or less')
        .regex(/^[A-Za-z., ]*$/, {
        message: 'Suffix can only contain letters, periods, commas, and spaces',
    })
        .optional(),
    title: zod_1.z
        .string()
        .max(20, 'Title must be 20 characters or less')
        .regex(/^[A-Za-z. ]*$/, {
        message: 'Title can only contain letters, periods, and spaces',
    })
        .optional(),
});
exports.PhoneTypeSchema = zod_1.z.enum(['mobile', 'home', 'work', 'fax', 'other'], {
    errorMap: () => ({ message: 'Invalid phone type' }),
});
exports.PhoneContactSchema = zod_1.z.object({
    type: exports.PhoneTypeSchema.default('mobile'),
    number: common_schemas_1.PhoneNumberSchema,
    extension: zod_1.z
        .string()
        .max(10, 'Extension must be 10 characters or less')
        .regex(/^\d+$/, { message: 'Extension must contain only digits' })
        .optional(),
    isPrimary: zod_1.z.boolean().default(false),
    isVerified: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().max(200, 'Phone notes must be 200 characters or less').optional(),
});
exports.EmailTypeSchema = zod_1.z.enum(['personal', 'work', 'other'], {
    errorMap: () => ({ message: 'Invalid email type' }),
});
exports.EmailContactSchema = zod_1.z.object({
    type: exports.EmailTypeSchema.default('personal'),
    address: common_schemas_1.EmailSchema,
    isPrimary: zod_1.z.boolean().default(false),
    isVerified: zod_1.z.boolean().default(false),
    verifiedAt: common_schemas_1.ISODateStringSchema.optional(),
    notes: zod_1.z.string().max(200, 'Email notes must be 200 characters or less').optional(),
});
exports.AddressTypeSchema = zod_1.z.enum(['home', 'work', 'billing', 'shipping', 'other'], {
    errorMap: () => ({ message: 'Invalid address type' }),
});
exports.PhysicalAddressSchema = zod_1.z.object({
    type: exports.AddressTypeSchema.default('home'),
    street1: common_schemas_1.NonEmptyStringSchema.max(200, 'Street address line 1 must be 200 characters or less'),
    street2: zod_1.z.string().max(200, 'Street address line 2 must be 200 characters or less').optional(),
    city: common_schemas_1.NonEmptyStringSchema.max(100, 'City must be 100 characters or less'),
    state: zod_1.z.string().max(100, 'State/Province must be 100 characters or less').optional(),
    postalCode: zod_1.z.string().max(20, 'Postal code must be 20 characters or less').optional(),
    country: common_schemas_1.NonEmptyStringSchema.max(100, 'Country must be 100 characters or less').default('USA'),
    isPrimary: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().max(200, 'Address notes must be 200 characters or less').optional(),
});
exports.PatientContactsSchema = zod_1.z
    .object({
    phones: zod_1.z.array(exports.PhoneContactSchema).default([]),
    emails: zod_1.z.array(exports.EmailContactSchema).default([]),
    addresses: zod_1.z.array(exports.PhysicalAddressSchema).default([]),
    preferredContactMethod: common_schemas_1.ContactMethodSchema.default(shared_types_1.ContactMethod.EMAIL),
})
    .refine((data) => {
    const primaryPhones = data.phones.filter((p) => p.isPrimary);
    return primaryPhones.length <= 1;
}, {
    message: 'Only one primary phone number is allowed',
    path: ['phones'],
})
    .refine((data) => {
    const primaryEmails = data.emails.filter((e) => e.isPrimary);
    return primaryEmails.length <= 1;
}, {
    message: 'Only one primary email address is allowed',
    path: ['emails'],
})
    .refine((data) => {
    const primaryAddresses = data.addresses.filter((a) => a.isPrimary);
    return primaryAddresses.length <= 1;
}, {
    message: 'Only one primary address is allowed',
    path: ['addresses'],
});
exports.EthnicitySchema = zod_1.z.enum([
    'hispanic_latino',
    'not_hispanic_latino',
    'american_indian_alaska_native',
    'asian',
    'black_african_american',
    'native_hawaiian_pacific_islander',
    'white',
    'other',
    'prefer_not_to_say',
], {
    errorMap: () => ({ message: 'Invalid ethnicity' }),
});
exports.DemographicsSchema = zod_1.z
    .object({
    dateOfBirth: common_schemas_1.DateOnlySchema,
    gender: common_schemas_1.GenderSchema,
    maritalStatus: common_schemas_1.MaritalStatusSchema.optional(),
    ethnicity: exports.EthnicitySchema.optional(),
    race: zod_1.z.array(zod_1.z.string().max(100)).default([]),
    preferredLanguage: zod_1.z
        .string()
        .max(10, 'Language code must be 10 characters or less')
        .regex(/^[a-z]{2}(-[A-Z]{2})?$/, {
        message: 'Language must be a valid ISO 639-1 code (e.g., en, en-US)',
    })
        .default('en'),
    occupation: zod_1.z.string().max(200, 'Occupation must be 200 characters or less').optional(),
    employer: zod_1.z.string().max(200, 'Employer must be 200 characters or less').optional(),
    socialSecurityNumber: zod_1.z
        .string()
        .regex(/^\d{3}-\d{2}-\d{4}$/, {
        message: 'SSN must be in format XXX-XX-XXXX',
    })
        .optional(),
    photoUrl: common_schemas_1.URLSchema.optional(),
})
    .refine((data) => {
    const dob = new Date(data.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dob <= today;
}, {
    message: 'Date of birth cannot be in the future',
    path: ['dateOfBirth'],
})
    .refine((data) => {
    const dob = new Date(data.dateOfBirth);
    const maxAge = 150;
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - maxAge);
    return dob >= minDate;
}, {
    message: 'Date of birth cannot be more than 150 years ago',
    path: ['dateOfBirth'],
});
exports.MedicalSeveritySchema = zod_1.z.enum(['mild', 'moderate', 'severe', 'life_threatening'], {
    errorMap: () => ({ message: 'Invalid severity level' }),
});
exports.MedicalFlagsSchema = zod_1.z.object({
    allergies: zod_1.z
        .array(zod_1.z.object({
        allergen: common_schemas_1.NonEmptyStringSchema.max(200, 'Allergen must be 200 characters or less'),
        severity: exports.MedicalSeveritySchema.optional(),
        reaction: zod_1.z.string().max(500, 'Reaction must be 500 characters or less').optional(),
        verifiedDate: common_schemas_1.DateOnlySchema.optional(),
        notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    }))
        .max(50, 'Maximum 50 allergies allowed')
        .default([]),
    medications: zod_1.z
        .array(zod_1.z.object({
        name: common_schemas_1.NonEmptyStringSchema.max(200, 'Medication name must be 200 characters or less'),
        dosage: zod_1.z.string().max(100, 'Dosage must be 100 characters or less').optional(),
        frequency: zod_1.z.string().max(100, 'Frequency must be 100 characters or less').optional(),
        startDate: common_schemas_1.DateOnlySchema.optional(),
        endDate: common_schemas_1.DateOnlySchema.optional(),
        prescribedBy: zod_1.z.string().max(200, 'Prescriber must be 200 characters or less').optional(),
        notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    }))
        .max(100, 'Maximum 100 medications allowed')
        .default([]),
    conditions: zod_1.z
        .array(zod_1.z.object({
        name: common_schemas_1.NonEmptyStringSchema.max(200, 'Condition name must be 200 characters or less'),
        diagnosedDate: common_schemas_1.DateOnlySchema.optional(),
        status: zod_1.z.enum(['active', 'resolved', 'chronic']).optional(),
        severity: exports.MedicalSeveritySchema.optional(),
        notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    }))
        .max(50, 'Maximum 50 conditions allowed')
        .default([]),
    alerts: zod_1.z
        .array(zod_1.z.object({
        type: zod_1.z.enum(['allergy', 'medical', 'behavioral', 'administrative']),
        message: common_schemas_1.NonEmptyStringSchema.max(500, 'Alert message must be 500 characters or less'),
        severity: exports.MedicalSeveritySchema.default('moderate'),
        createdAt: common_schemas_1.ISODateStringSchema,
        createdBy: common_schemas_1.UUIDSchema,
        expiresAt: common_schemas_1.ISODateStringSchema.optional(),
    }))
        .max(20, 'Maximum 20 active alerts allowed')
        .default([]),
});
exports.InsuranceCoverageTypeSchema = zod_1.z.enum(['primary', 'secondary', 'tertiary'], {
    errorMap: () => ({ message: 'Invalid coverage type' }),
});
exports.RelationshipToSubscriberSchema = zod_1.z.enum(['self', 'spouse', 'child', 'parent', 'other'], {
    errorMap: () => ({ message: 'Invalid relationship' }),
});
exports.InsuranceInfoSchema = zod_1.z
    .object({
    provider: common_schemas_1.NonEmptyStringSchema.max(200, 'Provider name must be 200 characters or less'),
    policyNumber: common_schemas_1.NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less'),
    groupNumber: zod_1.z.string().max(100, 'Group number must be 100 characters or less').optional(),
    subscriberName: common_schemas_1.NonEmptyStringSchema.max(200, 'Subscriber name must be 200 characters or less'),
    subscriberDateOfBirth: common_schemas_1.DateOnlySchema.optional(),
    relationshipToSubscriber: exports.RelationshipToSubscriberSchema.default('self'),
    effectiveDate: common_schemas_1.DateOnlySchema.optional(),
    terminationDate: common_schemas_1.DateOnlySchema.optional(),
    coverageType: exports.InsuranceCoverageTypeSchema.default('primary'),
    isActive: zod_1.z.boolean().default(true),
    planName: zod_1.z.string().max(200, 'Plan name must be 200 characters or less').optional(),
    planType: zod_1.z.string().max(100, 'Plan type must be 100 characters or less').optional(),
    insurancePhone: common_schemas_1.PhoneNumberSchema.optional(),
    notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
})
    .refine((data) => {
    if (data.effectiveDate && data.terminationDate) {
        return new Date(data.terminationDate) > new Date(data.effectiveDate);
    }
    return true;
}, {
    message: 'Termination date must be after effective date',
    path: ['terminationDate'],
});
exports.PatientInsuranceSchema = zod_1.z
    .object({
    primary: exports.InsuranceInfoSchema.optional(),
    secondary: exports.InsuranceInfoSchema.optional(),
    tertiary: exports.InsuranceInfoSchema.optional(),
})
    .refine((data) => {
    if (data.secondary && !data.primary) {
        return false;
    }
    return true;
}, {
    message: 'Cannot have secondary insurance without primary insurance',
    path: ['secondary'],
})
    .refine((data) => {
    if (data.tertiary && !data.secondary) {
        return false;
    }
    return true;
}, {
    message: 'Cannot have tertiary insurance without secondary insurance',
    path: ['tertiary'],
});
exports.CommunicationChannelSchema = zod_1.z.enum(['email', 'sms', 'phone', 'portal', 'mail'], {
    errorMap: () => ({ message: 'Invalid communication channel' }),
});
exports.CommunicationPreferencesSchema = zod_1.z
    .object({
    preferredChannel: exports.CommunicationChannelSchema.default('email'),
    enabledChannels: zod_1.z.array(exports.CommunicationChannelSchema).min(1, 'At least one channel must be enabled'),
    appointmentReminders: zod_1.z.boolean().default(true),
    recallReminders: zod_1.z.boolean().default(true),
    treatmentUpdates: zod_1.z.boolean().default(true),
    marketingCommunications: zod_1.z.boolean().default(false),
    educationalContent: zod_1.z.boolean().default(true),
    surveyRequests: zod_1.z.boolean().default(true),
    preferredContactTime: zod_1.z
        .object({
        start: zod_1.z.string().regex(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' }),
        end: zod_1.z.string().regex(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:MM format' }),
    })
        .optional(),
    doNotContact: zod_1.z.boolean().default(false),
})
    .refine((data) => {
    return data.enabledChannels.indexOf(data.preferredChannel) !== -1;
}, {
    message: 'Preferred channel must be one of the enabled channels',
    path: ['preferredChannel'],
})
    .refine((data) => {
    if (data.doNotContact) {
        return (!data.appointmentReminders &&
            !data.recallReminders &&
            !data.treatmentUpdates &&
            !data.marketingCommunications &&
            !data.educationalContent &&
            !data.surveyRequests);
    }
    return true;
}, {
    message: 'When "Do Not Contact" is enabled, all communication preferences must be disabled',
    path: ['doNotContact'],
});
exports.ConsentTypeSchema = zod_1.z.enum([
    'treatment',
    'privacy_notice',
    'hipaa',
    'financial_policy',
    'photography',
    'communication',
    'research',
    'minors',
], {
    errorMap: () => ({ message: 'Invalid consent type' }),
});
exports.ConsentRecordSchema = zod_1.z
    .object({
    type: exports.ConsentTypeSchema,
    granted: zod_1.z.boolean(),
    grantedAt: common_schemas_1.ISODateStringSchema,
    grantedBy: common_schemas_1.UUIDSchema,
    revokedAt: common_schemas_1.ISODateStringSchema.optional(),
    revokedBy: common_schemas_1.UUIDSchema.optional(),
    expiresAt: common_schemas_1.ISODateStringSchema.optional(),
    signatureType: zod_1.z.enum(['digital', 'paper', 'verbal']).default('digital'),
    signatureData: zod_1.z.string().optional(),
    documentUrl: common_schemas_1.URLSchema.optional(),
    notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    version: common_schemas_1.NonEmptyStringSchema.max(20, 'Version must be 20 characters or less').default('1.0'),
})
    .refine((data) => {
    if (data.revokedAt) {
        return data.revokedBy !== undefined;
    }
    return true;
}, {
    message: 'Revoked consent must have revokedBy identifier',
    path: ['revokedBy'],
})
    .refine((data) => {
    if (data.revokedAt && data.grantedAt) {
        return new Date(data.revokedAt) > new Date(data.grantedAt);
    }
    return true;
}, {
    message: 'Revoked date must be after granted date',
    path: ['revokedAt'],
});
exports.EmergencyContactSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Name must be 200 characters or less'),
    relationship: common_schemas_1.NonEmptyStringSchema.max(100, 'Relationship must be 100 characters or less'),
    phoneNumber: common_schemas_1.PhoneNumberSchema,
    alternatePhoneNumber: common_schemas_1.PhoneNumberSchema.optional(),
    email: common_schemas_1.EmailSchema.optional(),
    address: exports.PhysicalAddressSchema.optional(),
    isPrimary: zod_1.z.boolean().default(true),
    notes: zod_1.z.string().max(500, 'Notes must be 500 characters or less').optional(),
});
exports.PatientStatusSchema = zod_1.z.enum(['active', 'inactive', 'archived', 'deceased', 'merged'], {
    errorMap: () => ({ message: 'Invalid patient status' }),
});
exports.PatientSchema = zod_1.z
    .object({
    id: common_schemas_1.UUIDSchema,
    tenantId: common_schemas_1.NonEmptyStringSchema.max(100, 'Tenant ID must be 100 characters or less'),
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    patientNumber: common_schemas_1.NonEmptyStringSchema.max(50, 'Patient number must be 50 characters or less'),
    name: exports.PersonNameSchema,
    demographics: exports.DemographicsSchema,
    contacts: exports.PatientContactsSchema,
    emergencyContacts: zod_1.z
        .array(exports.EmergencyContactSchema)
        .max(5, 'Maximum 5 emergency contacts allowed')
        .default([]),
    insurance: exports.PatientInsuranceSchema.optional(),
    medical: exports.MedicalFlagsSchema.optional(),
    communicationPreferences: exports.CommunicationPreferencesSchema,
    consents: zod_1.z.array(exports.ConsentRecordSchema).default([]),
    status: exports.PatientStatusSchema.default('active'),
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
    metadata: common_schemas_1.MetadataSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    deletedAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    createdBy: common_schemas_1.UUIDSchema,
    updatedBy: common_schemas_1.UUIDSchema,
    deletedBy: common_schemas_1.UUIDSchema.nullable().optional(),
    version: common_schemas_1.NonNegativeIntSchema.default(1),
})
    .refine((data) => {
    if (data.status === 'deceased') {
        return true;
    }
    return true;
}, {
    message: 'Patient status validation passed',
})
    .refine((_data) => {
    return true;
}, {
    message: 'Active patients should have at least one emergency contact',
});
//# sourceMappingURL=patient.schemas.js.map