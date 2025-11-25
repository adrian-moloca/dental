"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentQuerySchema = exports.ProcedureQuerySchema = exports.TreatmentPlanQuerySchema = exports.ClinicalNoteQuerySchema = exports.ConsentSchema = exports.CreateConsentDtoSchema = exports.DigitalSignatureSchema = exports.ConsentStatusSchema = exports.ClinicalConsentTypeSchema = exports.ProcedureSchema = exports.CompleteProcedureDtoSchema = exports.CreateProcedureDtoSchema = exports.ProcedureCodeSchema = exports.ProcedureStatusSchema = exports.AcceptOptionDtoSchema = exports.UpdateTreatmentPlanDtoSchema = exports.CreateTreatmentPlanDtoSchema = exports.TreatmentOptionSchema = exports.ProcedureItemSchema = exports.TreatmentPlanStatusSchema = exports.ClinicalNoteSchema = exports.CreateClinicalNoteDtoSchema = exports.SOAPNoteSchema = exports.ClinicalNoteTypeSchema = exports.UpdatePerioChartDtoSchema = exports.PerioToothSchema = exports.PerioSiteSchema = exports.UpdateOdontogramDtoSchema = exports.OdontogramEntrySchema = exports.ToothStatusSchema = exports.ToothConditionSchema = exports.ToothSurfaceSchema = exports.ToothNumberSchema = exports.ConsentStatus = exports.ConsentType = exports.ProcedureStatus = exports.TreatmentPlanStatus = exports.ClinicalNoteType = exports.ToothCondition = exports.ToothSurface = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
var ToothSurface;
(function (ToothSurface) {
    ToothSurface["OCCLUSAL"] = "OCCLUSAL";
    ToothSurface["MESIAL"] = "MESIAL";
    ToothSurface["DISTAL"] = "DISTAL";
    ToothSurface["BUCCAL"] = "BUCCAL";
    ToothSurface["LINGUAL"] = "LINGUAL";
    ToothSurface["FACIAL"] = "FACIAL";
    ToothSurface["INCISAL"] = "INCISAL";
})(ToothSurface || (exports.ToothSurface = ToothSurface = {}));
var ToothCondition;
(function (ToothCondition) {
    ToothCondition["HEALTHY"] = "HEALTHY";
    ToothCondition["CARIES"] = "CARIES";
    ToothCondition["FILLED"] = "FILLED";
    ToothCondition["CROWN"] = "CROWN";
    ToothCondition["BRIDGE"] = "BRIDGE";
    ToothCondition["IMPLANT"] = "IMPLANT";
    ToothCondition["ROOT_CANAL"] = "ROOT_CANAL";
    ToothCondition["EXTRACTED"] = "EXTRACTED";
    ToothCondition["MISSING"] = "MISSING";
    ToothCondition["FRACTURED"] = "FRACTURED";
    ToothCondition["ABSCESS"] = "ABSCESS";
    ToothCondition["IMPACTED"] = "IMPACTED";
    ToothCondition["PARTIALLY_ERUPTED"] = "PARTIALLY_ERUPTED";
})(ToothCondition || (exports.ToothCondition = ToothCondition = {}));
var ClinicalNoteType;
(function (ClinicalNoteType) {
    ClinicalNoteType["SOAP"] = "SOAP";
    ClinicalNoteType["PROGRESS"] = "PROGRESS";
    ClinicalNoteType["CONSULTATION"] = "CONSULTATION";
    ClinicalNoteType["EMERGENCY"] = "EMERGENCY";
    ClinicalNoteType["RECALL"] = "RECALL";
    ClinicalNoteType["REFERRAL"] = "REFERRAL";
    ClinicalNoteType["DISCHARGE"] = "DISCHARGE";
})(ClinicalNoteType || (exports.ClinicalNoteType = ClinicalNoteType = {}));
var TreatmentPlanStatus;
(function (TreatmentPlanStatus) {
    TreatmentPlanStatus["DRAFT"] = "DRAFT";
    TreatmentPlanStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    TreatmentPlanStatus["APPROVED"] = "APPROVED";
    TreatmentPlanStatus["ACTIVE"] = "ACTIVE";
    TreatmentPlanStatus["COMPLETED"] = "COMPLETED";
    TreatmentPlanStatus["CANCELLED"] = "CANCELLED";
    TreatmentPlanStatus["EXPIRED"] = "EXPIRED";
})(TreatmentPlanStatus || (exports.TreatmentPlanStatus = TreatmentPlanStatus = {}));
var ProcedureStatus;
(function (ProcedureStatus) {
    ProcedureStatus["PLANNED"] = "PLANNED";
    ProcedureStatus["SCHEDULED"] = "SCHEDULED";
    ProcedureStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProcedureStatus["COMPLETED"] = "COMPLETED";
    ProcedureStatus["CANCELLED"] = "CANCELLED";
    ProcedureStatus["FAILED"] = "FAILED";
    ProcedureStatus["INCOMPLETE"] = "INCOMPLETE";
})(ProcedureStatus || (exports.ProcedureStatus = ProcedureStatus = {}));
var ConsentType;
(function (ConsentType) {
    ConsentType["TREATMENT"] = "TREATMENT";
    ConsentType["ANESTHESIA"] = "ANESTHESIA";
    ConsentType["SURGERY"] = "SURGERY";
    ConsentType["RADIOGRAPH"] = "RADIOGRAPH";
    ConsentType["DATA_SHARING"] = "DATA_SHARING";
    ConsentType["PHOTOGRAPHY"] = "PHOTOGRAPHY";
    ConsentType["RESEARCH"] = "RESEARCH";
    ConsentType["TELEHEALTH"] = "TELEHEALTH";
})(ConsentType || (exports.ConsentType = ConsentType = {}));
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["PENDING"] = "PENDING";
    ConsentStatus["GRANTED"] = "GRANTED";
    ConsentStatus["DENIED"] = "DENIED";
    ConsentStatus["REVOKED"] = "REVOKED";
    ConsentStatus["EXPIRED"] = "EXPIRED";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
exports.ToothNumberSchema = zod_1.z
    .number()
    .int({ message: 'Tooth number must be an integer' })
    .min(1, 'Tooth number must be between 1 and 32')
    .max(32, 'Tooth number must be between 1 and 32');
exports.ToothSurfaceSchema = zod_1.z.nativeEnum(ToothSurface, {
    errorMap: () => ({ message: 'Invalid tooth surface' }),
});
exports.ToothConditionSchema = zod_1.z.nativeEnum(ToothCondition, {
    errorMap: () => ({ message: 'Invalid tooth condition' }),
});
exports.ToothStatusSchema = zod_1.z.object({
    condition: exports.ToothConditionSchema,
    surfaces: zod_1.z.array(exports.ToothSurfaceSchema).optional(),
    notes: zod_1.z.string().max(500, 'Tooth notes must be 500 characters or less').optional(),
});
exports.OdontogramEntrySchema = zod_1.z.object({
    toothNumber: exports.ToothNumberSchema,
    status: exports.ToothStatusSchema,
    lastUpdated: common_schemas_1.ISODateStringSchema,
});
exports.UpdateOdontogramDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    entries: zod_1.z
        .array(exports.OdontogramEntrySchema)
        .min(1, 'At least one tooth entry is required')
        .max(32, 'Cannot update more than 32 teeth')
        .refine((entries) => {
        const toothNumbers = entries.map((e) => e.toothNumber);
        return new Set(toothNumbers).size === toothNumbers.length;
    }, {
        message: 'Duplicate tooth numbers are not allowed',
    }),
    notes: zod_1.z.string().max(2000, 'Odontogram notes must be 2000 characters or less').optional(),
});
exports.PerioSiteSchema = zod_1.z.object({
    probingDepth: zod_1.z
        .number()
        .int({ message: 'Probing depth must be an integer' })
        .min(0, 'Probing depth cannot be negative')
        .max(15, 'Probing depth cannot exceed 15mm'),
    recession: zod_1.z
        .number()
        .int({ message: 'Recession must be an integer' })
        .min(0, 'Recession cannot be negative')
        .max(15, 'Recession cannot exceed 15mm')
        .optional(),
    bleeding: zod_1.z.boolean(),
    mobility: zod_1.z
        .number()
        .int({ message: 'Mobility must be an integer' })
        .min(0, 'Mobility must be between 0 and 3')
        .max(3, 'Mobility must be between 0 and 3')
        .optional(),
});
exports.PerioToothSchema = zod_1.z.object({
    toothNumber: exports.ToothNumberSchema,
    sites: zod_1.z
        .array(exports.PerioSiteSchema)
        .length(6, 'Exactly 6 sites required per tooth (mesial-buccal, buccal, distal-buccal, mesial-lingual, lingual, distal-lingual)'),
});
exports.UpdatePerioChartDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    teeth: zod_1.z
        .array(exports.PerioToothSchema)
        .min(1, 'At least one tooth measurement is required')
        .max(32, 'Cannot update more than 32 teeth')
        .refine((teeth) => {
        const toothNumbers = teeth.map((t) => t.toothNumber);
        return new Set(toothNumbers).size === toothNumbers.length;
    }, {
        message: 'Duplicate tooth numbers are not allowed',
    }),
    examDate: common_schemas_1.ISODateStringSchema,
    examinerId: common_schemas_1.UUIDSchema,
    notes: zod_1.z.string().max(2000, 'Perio chart notes must be 2000 characters or less').optional(),
});
exports.ClinicalNoteTypeSchema = zod_1.z.nativeEnum(ClinicalNoteType, {
    errorMap: () => ({ message: 'Invalid clinical note type' }),
});
exports.SOAPNoteSchema = zod_1.z.object({
    subjective: zod_1.z.string().max(2000, 'Subjective section must be 2000 characters or less'),
    objective: zod_1.z.string().max(2000, 'Objective section must be 2000 characters or less'),
    assessment: zod_1.z.string().max(2000, 'Assessment section must be 2000 characters or less'),
    plan: zod_1.z.string().max(2000, 'Plan section must be 2000 characters or less'),
});
exports.CreateClinicalNoteDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    type: exports.ClinicalNoteTypeSchema,
    content: zod_1.z
        .union([
        exports.SOAPNoteSchema,
        zod_1.z.object({
            text: zod_1.z
                .string()
                .min(1, 'Note content is required')
                .max(5000, 'Note content must be 5000 characters or less'),
        }),
    ])
        .describe('SOAP note structure or free-text content'),
    chiefComplaint: zod_1.z.string().max(500, 'Chief complaint must be 500 characters or less').optional(),
    diagnosis: zod_1.z.array(zod_1.z.string().max(200)).max(10, 'Maximum 10 diagnoses allowed').optional(),
    attachments: zod_1.z.array(common_schemas_1.UUIDSchema).max(20, 'Maximum 20 attachments allowed').optional(),
    isConfidential: zod_1.z.boolean().optional().default(false),
});
exports.ClinicalNoteSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    tenantId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    authorId: common_schemas_1.UUIDSchema,
    type: exports.ClinicalNoteTypeSchema,
    content: zod_1.z.union([exports.SOAPNoteSchema, zod_1.z.object({ text: zod_1.z.string() })]),
    chiefComplaint: zod_1.z.string().optional(),
    diagnosis: zod_1.z.array(zod_1.z.string()).optional(),
    attachments: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    isConfidential: zod_1.z.boolean().default(false),
    signedAt: common_schemas_1.ISODateStringSchema.optional(),
    signedBy: common_schemas_1.UUIDSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
});
exports.TreatmentPlanStatusSchema = zod_1.z.nativeEnum(TreatmentPlanStatus, {
    errorMap: () => ({ message: 'Invalid treatment plan status' }),
});
exports.ProcedureItemSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .regex(/^D\d{4}$/, { message: 'Procedure code must follow ADA CDT format (e.g., D0120)' }),
    description: common_schemas_1.NonEmptyStringSchema.max(200, 'Procedure description must be 200 characters or less'),
    toothNumber: exports.ToothNumberSchema.optional(),
    surfaces: zod_1.z.array(exports.ToothSurfaceSchema).max(5, 'Maximum 5 surfaces per procedure').optional(),
    fee: zod_1.z
        .number()
        .nonnegative('Fee cannot be negative')
        .max(100000, 'Fee cannot exceed $100,000')
        .multipleOf(0.01, 'Fee must be in cents precision'),
    insuranceCoverage: zod_1.z
        .number()
        .min(0, 'Insurance coverage percentage must be between 0 and 100')
        .max(100, 'Insurance coverage percentage must be between 0 and 100')
        .optional(),
    priority: zod_1.z.enum(['IMMEDIATE', 'SOON', 'FUTURE'], {
        errorMap: () => ({ message: 'Invalid procedure priority' }),
    }),
    notes: zod_1.z.string().max(500, 'Procedure notes must be 500 characters or less').optional(),
});
exports.TreatmentOptionSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(100, 'Option name must be 100 characters or less'),
    description: zod_1.z.string().max(1000, 'Option description must be 1000 characters or less'),
    procedures: zod_1.z
        .array(exports.ProcedureItemSchema)
        .min(1, 'At least one procedure is required per treatment option')
        .max(50, 'Maximum 50 procedures per treatment option'),
    totalFee: zod_1.z
        .number()
        .nonnegative('Total fee cannot be negative')
        .max(1000000, 'Total fee cannot exceed $1,000,000')
        .multipleOf(0.01, 'Total fee must be in cents precision'),
    estimatedDuration: zod_1.z
        .number()
        .int({ message: 'Estimated duration must be an integer' })
        .positive('Estimated duration must be positive')
        .max(365, 'Estimated duration cannot exceed 365 days')
        .describe('Estimated treatment duration in days'),
    isRecommended: zod_1.z.boolean().default(false),
});
exports.CreateTreatmentPlanDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    title: common_schemas_1.NonEmptyStringSchema.max(200, 'Treatment plan title must be 200 characters or less'),
    description: zod_1.z.string().max(2000, 'Treatment plan description must be 2000 characters or less').optional(),
    options: zod_1.z
        .array(exports.TreatmentOptionSchema)
        .min(1, 'At least one treatment option is required')
        .max(5, 'Maximum 5 treatment options per plan')
        .refine((options) => {
        const recommendedCount = options.filter((o) => o.isRecommended).length;
        return recommendedCount <= 1;
    }, {
        message: 'Only one treatment option can be marked as recommended',
    }),
    validUntil: common_schemas_1.ISODateStringSchema.optional(),
    requiresInsuranceApproval: zod_1.z.boolean().default(false),
});
exports.UpdateTreatmentPlanDtoSchema = zod_1.z.object({
    title: common_schemas_1.NonEmptyStringSchema.max(200, 'Treatment plan title must be 200 characters or less').optional(),
    description: zod_1.z.string().max(2000, 'Treatment plan description must be 2000 characters or less').optional(),
    status: exports.TreatmentPlanStatusSchema.optional(),
    validUntil: common_schemas_1.ISODateStringSchema.optional(),
    requiresInsuranceApproval: zod_1.z.boolean().optional(),
});
exports.AcceptOptionDtoSchema = zod_1.z.object({
    treatmentPlanId: common_schemas_1.UUIDSchema,
    optionId: common_schemas_1.UUIDSchema,
    patientSignature: zod_1.z.string().min(1, 'Patient signature is required'),
    signedAt: common_schemas_1.ISODateStringSchema,
    depositAmount: zod_1.z
        .number()
        .nonnegative('Deposit amount cannot be negative')
        .max(100000, 'Deposit amount cannot exceed $100,000')
        .multipleOf(0.01, 'Deposit amount must be in cents precision')
        .optional(),
});
exports.ProcedureStatusSchema = zod_1.z.nativeEnum(ProcedureStatus, {
    errorMap: () => ({ message: 'Invalid procedure status' }),
});
exports.ProcedureCodeSchema = zod_1.z
    .string()
    .regex(/^D\d{4}$/, { message: 'Procedure code must follow ADA CDT format (e.g., D0120, D1110)' });
exports.CreateProcedureDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    code: exports.ProcedureCodeSchema,
    description: common_schemas_1.NonEmptyStringSchema.max(200, 'Procedure description must be 200 characters or less'),
    toothNumber: exports.ToothNumberSchema.optional(),
    surfaces: zod_1.z.array(exports.ToothSurfaceSchema).max(5, 'Maximum 5 surfaces per procedure').optional(),
    providerId: common_schemas_1.UUIDSchema,
    assistantId: common_schemas_1.UUIDSchema.optional(),
    scheduledDate: common_schemas_1.ISODateStringSchema.optional(),
    estimatedDuration: common_schemas_1.PositiveIntSchema.max(480, 'Estimated duration cannot exceed 480 minutes (8 hours)').describe('Duration in minutes'),
    fee: zod_1.z
        .number()
        .nonnegative('Fee cannot be negative')
        .max(100000, 'Fee cannot exceed $100,000')
        .multipleOf(0.01, 'Fee must be in cents precision'),
    notes: zod_1.z.string().max(2000, 'Procedure notes must be 2000 characters or less').optional(),
});
exports.CompleteProcedureDtoSchema = zod_1.z.object({
    procedureId: common_schemas_1.UUIDSchema,
    completedAt: common_schemas_1.ISODateStringSchema,
    actualDuration: common_schemas_1.PositiveIntSchema.max(480, 'Actual duration cannot exceed 480 minutes (8 hours)').describe('Duration in minutes'),
    stockItemsUsed: zod_1.z
        .array(zod_1.z.object({
        itemId: common_schemas_1.UUIDSchema,
        quantity: common_schemas_1.PositiveIntSchema.max(1000, 'Quantity cannot exceed 1000 units'),
    }))
        .max(100, 'Maximum 100 stock items per procedure')
        .optional(),
    complications: zod_1.z.string().max(1000, 'Complications notes must be 1000 characters or less').optional(),
    outcomeNotes: zod_1.z.string().max(2000, 'Outcome notes must be 2000 characters or less').optional(),
    requiresFollowUp: zod_1.z.boolean().default(false),
    followUpInDays: common_schemas_1.PositiveIntSchema.max(365, 'Follow-up period cannot exceed 365 days').optional(),
});
exports.ProcedureSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    tenantId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    code: exports.ProcedureCodeSchema,
    description: zod_1.z.string(),
    toothNumber: exports.ToothNumberSchema.optional(),
    surfaces: zod_1.z.array(exports.ToothSurfaceSchema).optional(),
    providerId: common_schemas_1.UUIDSchema,
    assistantId: common_schemas_1.UUIDSchema.optional(),
    status: exports.ProcedureStatusSchema,
    scheduledDate: common_schemas_1.ISODateStringSchema.optional(),
    completedAt: common_schemas_1.ISODateStringSchema.optional(),
    estimatedDuration: zod_1.z.number().int().positive(),
    actualDuration: zod_1.z.number().int().positive().optional(),
    fee: zod_1.z.number().nonnegative(),
    stockItemsUsed: zod_1.z
        .array(zod_1.z.object({
        itemId: common_schemas_1.UUIDSchema,
        quantity: zod_1.z.number().int().positive(),
    }))
        .optional(),
    complications: zod_1.z.string().optional(),
    outcomeNotes: zod_1.z.string().optional(),
    requiresFollowUp: zod_1.z.boolean().default(false),
    followUpInDays: zod_1.z.number().int().positive().optional(),
    notes: zod_1.z.string().optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
});
exports.ClinicalConsentTypeSchema = zod_1.z.nativeEnum(ConsentType, {
    errorMap: () => ({ message: 'Invalid consent type' }),
});
exports.ConsentStatusSchema = zod_1.z.nativeEnum(ConsentStatus, {
    errorMap: () => ({ message: 'Invalid consent status' }),
});
exports.DigitalSignatureSchema = zod_1.z.object({
    signatureData: common_schemas_1.NonEmptyStringSchema.describe('Base64 encoded signature image or hash'),
    ipAddress: zod_1.z
        .string()
        .ip({ message: 'Invalid IP address' })
        .optional(),
    userAgent: zod_1.z.string().max(500, 'User agent must be 500 characters or less').optional(),
    signedAt: common_schemas_1.ISODateStringSchema,
});
exports.CreateConsentDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    type: exports.ClinicalConsentTypeSchema,
    procedureId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    title: common_schemas_1.NonEmptyStringSchema.max(200, 'Consent title must be 200 characters or less'),
    content: common_schemas_1.NonEmptyStringSchema.max(10000, 'Consent content must be 10000 characters or less').describe('Full consent form text or terms'),
    patientSignature: exports.DigitalSignatureSchema.optional(),
    guardianSignature: exports.DigitalSignatureSchema.optional(),
    witnessSignature: exports.DigitalSignatureSchema.optional(),
    expiresAt: common_schemas_1.ISODateStringSchema.optional(),
    requiresGuardianConsent: zod_1.z.boolean().default(false),
});
exports.ConsentSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    tenantId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    type: exports.ClinicalConsentTypeSchema,
    status: exports.ConsentStatusSchema,
    procedureId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    patientSignature: exports.DigitalSignatureSchema.optional(),
    guardianSignature: exports.DigitalSignatureSchema.optional(),
    witnessSignature: exports.DigitalSignatureSchema.optional(),
    grantedAt: common_schemas_1.ISODateStringSchema.optional(),
    revokedAt: common_schemas_1.ISODateStringSchema.optional(),
    expiresAt: common_schemas_1.ISODateStringSchema.optional(),
    requiresGuardianConsent: zod_1.z.boolean().default(false),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
});
exports.ClinicalNoteQuerySchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    authorId: common_schemas_1.UUIDSchema.optional(),
    type: exports.ClinicalNoteTypeSchema.optional(),
    startDate: common_schemas_1.ISODateStringSchema.optional(),
    endDate: common_schemas_1.ISODateStringSchema.optional(),
    isConfidential: zod_1.z.boolean().optional(),
    searchText: zod_1.z.string().max(100, 'Search text must be 100 characters or less').optional(),
});
exports.TreatmentPlanQuerySchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    status: exports.TreatmentPlanStatusSchema.optional(),
    createdAfter: common_schemas_1.ISODateStringSchema.optional(),
    createdBefore: common_schemas_1.ISODateStringSchema.optional(),
    requiresInsuranceApproval: zod_1.z.boolean().optional(),
});
exports.ProcedureQuerySchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    providerId: common_schemas_1.UUIDSchema.optional(),
    status: exports.ProcedureStatusSchema.optional(),
    code: exports.ProcedureCodeSchema.optional(),
    toothNumber: exports.ToothNumberSchema.optional(),
    scheduledAfter: common_schemas_1.ISODateStringSchema.optional(),
    scheduledBefore: common_schemas_1.ISODateStringSchema.optional(),
    requiresFollowUp: zod_1.z.boolean().optional(),
});
exports.ConsentQuerySchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    type: exports.ClinicalConsentTypeSchema.optional(),
    status: exports.ConsentStatusSchema.optional(),
    procedureId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    expiringBefore: common_schemas_1.ISODateStringSchema.optional(),
    requiresGuardianConsent: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=clinical.schemas.js.map