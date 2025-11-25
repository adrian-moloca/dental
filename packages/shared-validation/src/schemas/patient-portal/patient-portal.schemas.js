"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInsuranceDtoSchema = exports.AddInsuranceDtoSchema = exports.UpdateNotificationSettingsDtoSchema = exports.QueryDocumentsDtoSchema = exports.PatientDocumentTypeSchema = exports.QueryPaymentHistoryDtoSchema = exports.QueryAvailabilityDtoSchema = exports.PatientVerifyEmailDtoSchema = exports.PatientResetPasswordDtoSchema = exports.PatientRequestPasswordResetDtoSchema = exports.PatientChangePasswordDtoSchema = exports.PatientSortSchema = exports.PatientDateRangeSchema = exports.PatientPaginationSchema = exports.RequestDeletionDtoSchema = exports.RequestDataExportDtoSchema = exports.DataExportFormatSchema = exports.PatientSubmitNpsDtoSchema = exports.PatientSubmitFeedbackDtoSchema = exports.NpsSourceSchema = exports.PatientFeedbackCategorySchema = exports.PatientQueryInvoicesDtoSchema = exports.PatientPaymentDtoSchema = exports.PatientInvoiceStatusSchema = exports.PatientPaymentMethodSchema = exports.QueryAppointmentsDtoSchema = exports.PatientCancelAppointmentDtoSchema = exports.PatientRescheduleAppointmentDtoSchema = exports.BookAppointmentDtoSchema = exports.PatientAppointmentStatusSchema = exports.UpdatePatientPreferencesDtoSchema = exports.UpdatePatientProfileDtoSchema = exports.PatientMfaVerifyRequestSchema = exports.PatientMfaChallengeRequestSchema = exports.PatientLoginDtoSchema = exports.PatientRegisterDtoSchema = exports.MfaMethodSchema = exports.PatientEmergencyContactSchema = exports.PatientAddressSchema = exports.SanitizedTextSchema = exports.NameSchema = exports.TimeSchema = exports.FutureDateSchema = exports.PatientDateOfBirthSchema = exports.PatientPasswordSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
const billing_schemas_1 = require("../billing/billing.schemas");
exports.PatientPasswordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less')
    .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
})
    .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
})
    .refine((val) => /\d/.test(val), {
    message: 'Password must contain at least one digit',
})
    .refine((val) => /[!@#$%^&*]/.test(val), {
    message: 'Password must contain at least one special character (!@#$%^&*)',
});
exports.PatientDateOfBirthSchema = common_schemas_1.ISODateStringSchema.refine((val) => {
    const birthDate = new Date(val);
    const today = new Date();
    const age = (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 13;
}, {
    message: 'Patient must be at least 13 years old',
}).refine((val) => {
    const birthDate = new Date(val);
    const today = new Date();
    return birthDate <= today;
}, {
    message: 'Date of birth cannot be in the future',
});
exports.FutureDateSchema = common_schemas_1.ISODateStringSchema.refine((val) => {
    const targetDate = new Date(val);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return targetDate > oneHourFromNow;
}, {
    message: 'Date must be at least 1 hour in the future',
});
exports.TimeSchema = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM format (e.g., 09:30, 14:00)',
})
    .refine((val) => {
    const [hours] = val.split(':').map(Number);
    return hours >= 8 && hours <= 20;
}, {
    message: 'Time must be within business hours (08:00 to 20:00)',
});
exports.NameSchema = zod_1.z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
});
const SanitizedTextSchema = (maxLength, fieldName) => zod_1.z
    .string()
    .max(maxLength, `${fieldName} must be ${maxLength} characters or less`)
    .trim()
    .transform((val) => val.replace(/<[^>]*>/g, ''))
    .refine((val) => val.length > 0, {
    message: `${fieldName} cannot be empty after sanitization`,
});
exports.SanitizedTextSchema = SanitizedTextSchema;
exports.PatientAddressSchema = zod_1.z.object({
    street: zod_1.z
        .string()
        .min(5, 'Street address must be at least 5 characters')
        .max(200, 'Street address must be 200 characters or less')
        .trim(),
    city: zod_1.z
        .string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City must be 100 characters or less')
        .trim(),
    state: zod_1.z
        .string()
        .min(2, 'State/Province must be at least 2 characters')
        .max(100, 'State/Province must be 100 characters or less')
        .trim(),
    postalCode: zod_1.z
        .string()
        .min(3, 'Postal code must be at least 3 characters')
        .max(20, 'Postal code must be 20 characters or less')
        .trim(),
    country: zod_1.z
        .string()
        .length(2, 'Country must be a 2-letter ISO code (e.g., US, RO)')
        .toUpperCase(),
});
exports.PatientEmergencyContactSchema = zod_1.z.object({
    name: exports.NameSchema,
    relationship: zod_1.z
        .string()
        .min(2, 'Relationship must be at least 2 characters')
        .max(50, 'Relationship must be 50 characters or less')
        .trim(),
    phone: common_schemas_1.PhoneNumberSchema,
    alternatePhone: common_schemas_1.PhoneNumberSchema.optional(),
});
exports.MfaMethodSchema = zod_1.z.enum(['SMS', 'EMAIL', 'TOTP'], {
    errorMap: () => ({ message: 'Invalid MFA method. Must be SMS, EMAIL, or TOTP' }),
});
exports.PatientRegisterDtoSchema = zod_1.z
    .object({
    email: common_schemas_1.EmailSchema,
    password: exports.PatientPasswordSchema,
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
    firstName: exports.NameSchema,
    lastName: exports.NameSchema,
    dateOfBirth: exports.PatientDateOfBirthSchema,
    phone: common_schemas_1.PhoneNumberSchema,
    acceptedTerms: zod_1.z.literal(true, {
        errorMap: () => ({
            message: 'You must accept the terms and conditions to register',
        }),
    }),
    marketingConsent: zod_1.z.boolean().optional().default(false),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.PatientLoginDtoSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
    password: common_schemas_1.NonEmptyStringSchema,
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.PatientMfaChallengeRequestSchema = zod_1.z.object({
    method: exports.MfaMethodSchema,
});
exports.PatientMfaVerifyRequestSchema = zod_1.z.object({
    challengeId: common_schemas_1.UUIDSchema,
    code: zod_1.z
        .string()
        .length(6, 'MFA code must be exactly 6 digits')
        .regex(/^\d{6}$/, {
        message: 'MFA code must contain only numbers',
    }),
});
exports.UpdatePatientProfileDtoSchema = zod_1.z
    .object({
    firstName: exports.NameSchema.optional(),
    lastName: exports.NameSchema.optional(),
    phone: common_schemas_1.PhoneNumberSchema.optional(),
    address: exports.PatientAddressSchema.optional(),
    emergencyContact: exports.PatientEmergencyContactSchema.optional(),
})
    .refine((data) => {
    return Object.values(data).some((value) => value !== undefined);
}, {
    message: 'At least one field must be provided for update',
});
exports.UpdatePatientPreferencesDtoSchema = zod_1.z.object({
    emailEnabled: zod_1.z.boolean().optional(),
    smsEnabled: zod_1.z.boolean().optional(),
    pushEnabled: zod_1.z.boolean().optional(),
    marketingConsent: zod_1.z.boolean().optional(),
    appointmentReminders: zod_1.z.boolean().optional(),
    treatmentUpdates: zod_1.z.boolean().optional(),
    billingAlerts: zod_1.z.boolean().optional(),
});
exports.PatientAppointmentStatusSchema = zod_1.z.enum(['UPCOMING', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid appointment status' }),
});
exports.BookAppointmentDtoSchema = zod_1.z
    .object({
    providerId: common_schemas_1.UUIDSchema,
    serviceCode: common_schemas_1.NonEmptyStringSchema.max(50, 'Service code must be 50 characters or less'),
    appointmentDate: exports.FutureDateSchema,
    appointmentTime: exports.TimeSchema,
    notes: (0, exports.SanitizedTextSchema)(500, 'Notes').optional(),
    isEmergency: zod_1.z.boolean().optional().default(false),
})
    .refine((data) => {
    if (!data.isEmergency) {
        const appointmentDateTime = new Date(data.appointmentDate);
        const [hours, minutes] = data.appointmentTime.split(':').map(Number);
        appointmentDateTime.setHours(hours, minutes, 0, 0);
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        return appointmentDateTime > oneHourFromNow;
    }
    return true;
}, {
    message: 'Non-emergency appointments must be booked at least 1 hour in advance',
    path: ['appointmentDate'],
});
exports.PatientRescheduleAppointmentDtoSchema = zod_1.z.object({
    newDate: exports.FutureDateSchema,
    newTime: exports.TimeSchema,
    reason: (0, exports.SanitizedTextSchema)(500, 'Reason').optional(),
});
exports.PatientCancelAppointmentDtoSchema = zod_1.z.object({
    reason: (0, exports.SanitizedTextSchema)(500, 'Cancellation reason').optional(),
});
exports.QueryAppointmentsDtoSchema = zod_1.z
    .object({
    status: exports.PatientAppointmentStatusSchema.optional(),
    dateFrom: common_schemas_1.ISODateStringSchema.optional(),
    dateTo: common_schemas_1.ISODateStringSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: zod_1.z
        .number()
        .int('Page size must be an integer')
        .min(1, 'Page size must be at least 1')
        .max(100, 'Page size cannot exceed 100')
        .default(20),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: 'dateFrom must be before or equal to dateTo',
    path: ['dateFrom'],
});
exports.PatientPaymentMethodSchema = zod_1.z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
});
exports.PatientInvoiceStatusSchema = zod_1.z.enum(['OUTSTANDING', 'OVERDUE', 'PAID'], {
    errorMap: () => ({ message: 'Invalid invoice status' }),
});
exports.PatientPaymentDtoSchema = zod_1.z
    .object({
    invoiceId: common_schemas_1.UUIDSchema,
    amount: billing_schemas_1.PositiveMoneyAmountSchema,
    paymentMethod: exports.PatientPaymentMethodSchema,
    cardToken: zod_1.z.string().max(500, 'Card token must be 500 characters or less').optional(),
    saveCard: zod_1.z.boolean().optional().default(false),
    idempotencyKey: common_schemas_1.UUIDSchema.optional(),
})
    .refine((data) => {
    if ((data.paymentMethod === 'CREDIT_CARD' || data.paymentMethod === 'DEBIT_CARD') &&
        !data.cardToken) {
        return false;
    }
    return true;
}, {
    message: 'Card token is required for card payments',
    path: ['cardToken'],
})
    .refine((data) => {
    return data.amount <= 100000;
}, {
    message: 'Payment amount cannot exceed $100,000',
    path: ['amount'],
})
    .refine((data) => {
    return data.amount <= 1000;
}, {
    message: 'Payments over $1,000 require additional verification. Please contact support.',
    path: ['amount'],
});
exports.PatientQueryInvoicesDtoSchema = zod_1.z
    .object({
    status: exports.PatientInvoiceStatusSchema.optional(),
    dateFrom: common_schemas_1.ISODateStringSchema.optional(),
    dateTo: common_schemas_1.ISODateStringSchema.optional(),
    minAmount: billing_schemas_1.NonNegativeMoneyAmountSchema.optional(),
    maxAmount: billing_schemas_1.NonNegativeMoneyAmountSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: zod_1.z
        .number()
        .int('Page size must be an integer')
        .min(1, 'Page size must be at least 1')
        .max(100, 'Page size cannot exceed 100')
        .default(20),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: 'dateFrom must be before or equal to dateTo',
    path: ['dateFrom'],
})
    .refine((data) => {
    if (data.minAmount !== undefined && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount;
    }
    return true;
}, {
    message: 'minAmount must be less than or equal to maxAmount',
    path: ['minAmount'],
});
exports.PatientFeedbackCategorySchema = zod_1.z.enum(['SERVICE', 'TREATMENT', 'FACILITY', 'STAFF', 'OVERALL'], {
    errorMap: () => ({ message: 'Invalid feedback category' }),
});
exports.NpsSourceSchema = zod_1.z.enum(['EMAIL', 'SMS', 'PORTAL', 'MOBILE_APP'], {
    errorMap: () => ({ message: 'Invalid NPS source' }),
});
exports.PatientSubmitFeedbackDtoSchema = zod_1.z.object({
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    rating: zod_1.z
        .number()
        .int('Rating must be an integer')
        .min(1, 'Rating must be between 1 and 5')
        .max(5, 'Rating must be between 1 and 5'),
    category: exports.PatientFeedbackCategorySchema,
    comment: (0, exports.SanitizedTextSchema)(2000, 'Comment').optional(),
    isAnonymous: zod_1.z.boolean().optional().default(false),
});
exports.PatientSubmitNpsDtoSchema = zod_1.z.object({
    score: zod_1.z
        .number()
        .int('NPS score must be an integer')
        .min(0, 'NPS score must be between 0 and 10')
        .max(10, 'NPS score must be between 0 and 10'),
    comment: (0, exports.SanitizedTextSchema)(2000, 'Comment').optional(),
    source: exports.NpsSourceSchema.optional(),
});
exports.DataExportFormatSchema = zod_1.z.enum(['JSON', 'PDF', 'CSV'], {
    errorMap: () => ({ message: 'Invalid export format' }),
});
exports.RequestDataExportDtoSchema = zod_1.z.object({
    format: exports.DataExportFormatSchema.optional().default('JSON'),
    includeAppointments: zod_1.z.boolean().optional().default(true),
    includeMedicalRecords: zod_1.z.boolean().optional().default(true),
    includeBillingRecords: zod_1.z.boolean().optional().default(true),
    includeDocuments: zod_1.z.boolean().optional().default(true),
});
exports.RequestDeletionDtoSchema = zod_1.z
    .object({
    reason: (0, exports.SanitizedTextSchema)(500, 'Deletion reason').optional(),
    confirmationText: zod_1.z
        .string()
        .min(1, 'Confirmation text is required')
        .trim(),
    acknowledgeDataLoss: zod_1.z.literal(true, {
        errorMap: () => ({
            message: 'You must acknowledge that this action is irreversible',
        }),
    }),
})
    .refine((data) => {
    return data.confirmationText === 'DELETE MY ACCOUNT';
}, {
    message: 'Confirmation text must exactly match "DELETE MY ACCOUNT"',
    path: ['confirmationText'],
});
exports.PatientPaginationSchema = zod_1.z.object({
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: zod_1.z
        .number()
        .int('Page size must be an integer')
        .min(1, 'Page size must be at least 1')
        .max(100, 'Page size cannot exceed 100')
        .default(20),
});
exports.PatientDateRangeSchema = zod_1.z
    .object({
    from: common_schemas_1.ISODateStringSchema,
    to: common_schemas_1.ISODateStringSchema,
})
    .refine((data) => {
    return new Date(data.from) <= new Date(data.to);
}, {
    message: 'from date must be before or equal to to date',
    path: ['from'],
});
exports.PatientSortSchema = zod_1.z.object({
    sortBy: zod_1.z.enum(['date', 'amount', 'status', 'name', 'createdAt'], {
        errorMap: () => ({ message: 'Invalid sort field' }),
    }),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'], {
        errorMap: () => ({ message: 'Sort order must be ASC or DESC' }),
    }),
});
exports.PatientChangePasswordDtoSchema = zod_1.z
    .object({
    currentPassword: common_schemas_1.NonEmptyStringSchema,
    newPassword: exports.PatientPasswordSchema,
    confirmNewPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
})
    .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
});
exports.PatientRequestPasswordResetDtoSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
});
exports.PatientResetPasswordDtoSchema = zod_1.z
    .object({
    token: common_schemas_1.NonEmptyStringSchema.max(500, 'Token must be 500 characters or less'),
    newPassword: exports.PatientPasswordSchema,
    confirmNewPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
})
    .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
});
exports.PatientVerifyEmailDtoSchema = zod_1.z.object({
    token: common_schemas_1.NonEmptyStringSchema.max(500, 'Token must be 500 characters or less'),
});
exports.QueryAvailabilityDtoSchema = zod_1.z
    .object({
    providerId: common_schemas_1.UUIDSchema,
    date: common_schemas_1.ISODateStringSchema,
    serviceCode: common_schemas_1.NonEmptyStringSchema.max(50, 'Service code must be 50 characters or less').optional(),
})
    .refine((data) => {
    const queryDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return queryDate >= today;
}, {
    message: 'Date must be today or in the future',
    path: ['date'],
});
exports.QueryPaymentHistoryDtoSchema = zod_1.z
    .object({
    dateFrom: common_schemas_1.ISODateStringSchema.optional(),
    dateTo: common_schemas_1.ISODateStringSchema.optional(),
    minAmount: billing_schemas_1.NonNegativeMoneyAmountSchema.optional(),
    maxAmount: billing_schemas_1.NonNegativeMoneyAmountSchema.optional(),
    paymentMethod: exports.PatientPaymentMethodSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: zod_1.z
        .number()
        .int('Page size must be an integer')
        .min(1, 'Page size must be at least 1')
        .max(100, 'Page size cannot exceed 100')
        .default(20),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: 'dateFrom must be before or equal to dateTo',
    path: ['dateFrom'],
})
    .refine((data) => {
    if (data.minAmount !== undefined && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount;
    }
    return true;
}, {
    message: 'minAmount must be less than or equal to maxAmount',
    path: ['minAmount'],
});
exports.PatientDocumentTypeSchema = zod_1.z.enum(['MEDICAL_RECORD', 'XRAY', 'PRESCRIPTION', 'LAB_RESULT', 'CONSENT_FORM', 'INVOICE', 'RECEIPT', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid document type' }),
});
exports.QueryDocumentsDtoSchema = zod_1.z
    .object({
    type: exports.PatientDocumentTypeSchema.optional(),
    dateFrom: common_schemas_1.ISODateStringSchema.optional(),
    dateTo: common_schemas_1.ISODateStringSchema.optional(),
    searchTerm: zod_1.z.string().max(100, 'Search term must be 100 characters or less').optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: zod_1.z
        .number()
        .int('Page size must be an integer')
        .min(1, 'Page size must be at least 1')
        .max(100, 'Page size cannot exceed 100')
        .default(20),
})
    .refine((data) => {
    if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: 'dateFrom must be before or equal to dateTo',
    path: ['dateFrom'],
});
exports.UpdateNotificationSettingsDtoSchema = zod_1.z.object({
    emailNotifications: zod_1.z.boolean().optional(),
    smsNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    appointmentReminders: zod_1.z.boolean().optional(),
    appointmentConfirmations: zod_1.z.boolean().optional(),
    appointmentChanges: zod_1.z.boolean().optional(),
    treatmentUpdates: zod_1.z.boolean().optional(),
    billingAlerts: zod_1.z.boolean().optional(),
    paymentConfirmations: zod_1.z.boolean().optional(),
    marketingMessages: zod_1.z.boolean().optional(),
    promotionalOffers: zod_1.z.boolean().optional(),
    surveyRequests: zod_1.z.boolean().optional(),
    reminderLeadTimeHours: zod_1.z
        .number()
        .int('Lead time must be an integer')
        .min(1, 'Lead time must be at least 1 hour')
        .max(168, 'Lead time cannot exceed 168 hours (7 days)')
        .optional(),
});
exports.AddInsuranceDtoSchema = zod_1.z.object({
    insuranceProviderId: common_schemas_1.UUIDSchema,
    policyNumber: common_schemas_1.NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less'),
    groupNumber: zod_1.z.string().max(100, 'Group number must be 100 characters or less').optional(),
    policyHolderName: exports.NameSchema,
    policyHolderDateOfBirth: exports.PatientDateOfBirthSchema,
    relationshipToPolicyHolder: zod_1.z
        .enum(['SELF', 'SPOUSE', 'CHILD', 'OTHER'], {
        errorMap: () => ({ message: 'Invalid relationship' }),
    })
        .default('SELF'),
    effectiveDate: common_schemas_1.ISODateStringSchema,
    expirationDate: common_schemas_1.ISODateStringSchema.optional(),
    isPrimary: zod_1.z.boolean().default(true),
}).refine((data) => {
    if (data.expirationDate) {
        return new Date(data.expirationDate) > new Date(data.effectiveDate);
    }
    return true;
}, {
    message: 'Expiration date must be after effective date',
    path: ['expirationDate'],
});
exports.UpdateInsuranceDtoSchema = zod_1.z.object({
    policyNumber: common_schemas_1.NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less').optional(),
    groupNumber: zod_1.z.string().max(100, 'Group number must be 100 characters or less').optional(),
    expirationDate: common_schemas_1.ISODateStringSchema.optional(),
    isPrimary: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=patient-portal.schemas.js.map