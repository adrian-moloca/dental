"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIJobPaginationSchema = exports.QueryAIResultsDtoSchema = exports.RunRevenueForecastDtoSchema = exports.RunInventoryForecastDtoSchema = exports.RunMarketingPersonalizationDtoSchema = exports.RunChurnPredictionDtoSchema = exports.RunAppointmentPredictionDtoSchema = exports.RunBillingRiskAnalysisDtoSchema = exports.RunImagingAnalysisDtoSchema = exports.RunClinicalRecommendationDtoSchema = exports.RunClinicalAssistantDtoSchema = exports.CreateAIJobDtoSchema = exports.AIContextSchema = exports.AITaskTypeSchema = void 0;
const zod_1 = require("zod");
const shared_domain_1 = require("@dentalos/shared-domain");
const common_schemas_1 = require("../common.schemas");
exports.AITaskTypeSchema = zod_1.z.nativeEnum(shared_domain_1.AITaskType);
exports.AIContextSchema = zod_1.z.object({
    patient: zod_1.z.any().optional(),
    clinical: zod_1.z.any().optional(),
    imaging: zod_1.z.any().optional(),
    billing: zod_1.z.any().optional(),
    scheduling: zod_1.z.any().optional(),
    marketing: zod_1.z.any().optional(),
    custom: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.CreateAIJobDtoSchema = zod_1.z.object({
    taskType: exports.AITaskTypeSchema,
    contextId: common_schemas_1.NonEmptyStringSchema,
    contextType: common_schemas_1.NonEmptyStringSchema,
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
    correlationId: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunClinicalAssistantDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    clinicalQuestion: common_schemas_1.NonEmptyStringSchema.max(2000),
    includeHistory: zod_1.z.boolean().optional().default(true),
    includeAllergies: zod_1.z.boolean().optional().default(true),
    includeMedications: zod_1.z.boolean().optional().default(true),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunClinicalRecommendationDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    recentProcedures: zod_1.z.array(zod_1.z.string()).optional(),
    clinicalFindings: zod_1.z.string().optional(),
    urgencyLevel: zod_1.z.enum(['ROUTINE', 'SOON', 'URGENT', 'EMERGENCY']).optional(),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunImagingAnalysisDtoSchema = zod_1.z.object({
    studyId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    modality: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    clinicalIndication: zod_1.z.string().optional(),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunBillingRiskAnalysisDtoSchema = zod_1.z.object({
    invoiceId: common_schemas_1.UUIDSchema.optional(),
    patientId: common_schemas_1.UUIDSchema,
    analysisType: zod_1.z.enum(['RISK_SCORE', 'FRAUD_DETECTION', 'PAYMENT_PREDICTION']),
    includeHistory: zod_1.z.boolean().optional().default(true),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunAppointmentPredictionDtoSchema = zod_1.z.object({
    appointmentId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    predictionType: zod_1.z.enum(['NO_SHOW', 'LATE_ARRIVAL', 'CANCELLATION', 'OPTIMAL_TIME']),
    includeHistory: zod_1.z.boolean().optional().default(true),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunChurnPredictionDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    forecastHorizonDays: common_schemas_1.PositiveIntSchema.optional().default(90),
    includeEngagementHistory: zod_1.z.boolean().optional().default(true),
    includeFinancialHistory: zod_1.z.boolean().optional().default(true),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunMarketingPersonalizationDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    campaignType: zod_1.z.string().optional(),
    channels: zod_1.z.array(zod_1.z.string()).optional(),
    includePreferences: zod_1.z.boolean().optional().default(true),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunInventoryForecastDtoSchema = zod_1.z.object({
    itemId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    forecastHorizonDays: common_schemas_1.PositiveIntSchema.min(7).max(365).optional().default(90),
    includeSeasonality: zod_1.z.boolean().optional().default(true),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.RunRevenueForecastDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema.optional(),
    organizationId: common_schemas_1.UUIDSchema,
    forecastHorizonDays: common_schemas_1.PositiveIntSchema.min(7).max(365).optional().default(90),
    includeSeasonality: zod_1.z.boolean().optional().default(true),
    breakdown: zod_1.z.boolean().optional().default(false),
    contextData: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.QueryAIResultsDtoSchema = zod_1.z.object({
    taskType: exports.AITaskTypeSchema.optional(),
    contextId: zod_1.z.string().optional(),
    contextType: zod_1.z.string().optional(),
    fromDate: common_schemas_1.ISODateStringSchema.optional(),
    toDate: common_schemas_1.ISODateStringSchema.optional(),
    limit: common_schemas_1.PositiveIntSchema.optional().default(20),
    offset: common_schemas_1.PositiveIntSchema.optional().default(0),
});
exports.AIJobPaginationSchema = zod_1.z.object({
    page: common_schemas_1.PositiveIntSchema.optional().default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).optional().default(20),
    sortBy: zod_1.z.enum(['createdAt', 'startedAt', 'completedAt', 'status']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    status: zod_1.z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
    taskType: exports.AITaskTypeSchema.optional(),
});
//# sourceMappingURL=ai.schemas.js.map