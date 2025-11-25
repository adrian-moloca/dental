import { z } from 'zod';
import { AITaskType } from '@dentalos/shared-domain';
export declare const AITaskTypeSchema: z.ZodNativeEnum<typeof AITaskType>;
export declare const AIContextSchema: z.ZodObject<{
    patient: z.ZodOptional<z.ZodAny>;
    clinical: z.ZodOptional<z.ZodAny>;
    imaging: z.ZodOptional<z.ZodAny>;
    billing: z.ZodOptional<z.ZodAny>;
    scheduling: z.ZodOptional<z.ZodAny>;
    marketing: z.ZodOptional<z.ZodAny>;
    custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    custom?: Record<string, unknown> | undefined;
    scheduling?: any;
    imaging?: any;
    marketing?: any;
    patient?: any;
    clinical?: any;
    billing?: any;
}, {
    custom?: Record<string, unknown> | undefined;
    scheduling?: any;
    imaging?: any;
    marketing?: any;
    patient?: any;
    clinical?: any;
    billing?: any;
}>;
export declare const CreateAIJobDtoSchema: z.ZodObject<{
    taskType: z.ZodNativeEnum<typeof AITaskType>;
    contextId: z.ZodString;
    contextType: z.ZodString;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>>;
    correlationId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    taskType: AITaskType;
    contextId: string;
    contextType: string;
    correlationId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    contextData?: Record<string, unknown> | undefined;
}, {
    taskType: AITaskType;
    contextId: string;
    contextType: string;
    correlationId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    contextData?: Record<string, unknown> | undefined;
}>;
export type CreateAIJobDto = z.infer<typeof CreateAIJobDtoSchema>;
export declare const RunClinicalAssistantDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    clinicalQuestion: z.ZodString;
    includeHistory: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeAllergies: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeMedications: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    clinicalQuestion: string;
    includeHistory: boolean;
    includeAllergies: boolean;
    includeMedications: boolean;
    contextData?: Record<string, unknown> | undefined;
}, {
    patientId: string;
    clinicalQuestion: string;
    contextData?: Record<string, unknown> | undefined;
    includeHistory?: boolean | undefined;
    includeAllergies?: boolean | undefined;
    includeMedications?: boolean | undefined;
}>;
export type RunClinicalAssistantDto = z.infer<typeof RunClinicalAssistantDtoSchema>;
export declare const RunClinicalRecommendationDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    recentProcedures: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    clinicalFindings: z.ZodOptional<z.ZodString>;
    urgencyLevel: z.ZodOptional<z.ZodEnum<["ROUTINE", "SOON", "URGENT", "EMERGENCY"]>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    contextData?: Record<string, unknown> | undefined;
    recentProcedures?: string[] | undefined;
    clinicalFindings?: string | undefined;
    urgencyLevel?: "URGENT" | "ROUTINE" | "SOON" | "EMERGENCY" | undefined;
}, {
    patientId: string;
    contextData?: Record<string, unknown> | undefined;
    recentProcedures?: string[] | undefined;
    clinicalFindings?: string | undefined;
    urgencyLevel?: "URGENT" | "ROUTINE" | "SOON" | "EMERGENCY" | undefined;
}>;
export type RunClinicalRecommendationDto = z.infer<typeof RunClinicalRecommendationDtoSchema>;
export declare const RunImagingAnalysisDtoSchema: z.ZodObject<{
    studyId: z.ZodString;
    patientId: z.ZodString;
    modality: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    clinicalIndication: z.ZodOptional<z.ZodString>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    studyId: string;
    region?: string | undefined;
    modality?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
    clinicalIndication?: string | undefined;
}, {
    patientId: string;
    studyId: string;
    region?: string | undefined;
    modality?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
    clinicalIndication?: string | undefined;
}>;
export type RunImagingAnalysisDto = z.infer<typeof RunImagingAnalysisDtoSchema>;
export declare const RunBillingRiskAnalysisDtoSchema: z.ZodObject<{
    invoiceId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodString;
    analysisType: z.ZodEnum<["RISK_SCORE", "FRAUD_DETECTION", "PAYMENT_PREDICTION"]>;
    includeHistory: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    includeHistory: boolean;
    analysisType: "RISK_SCORE" | "FRAUD_DETECTION" | "PAYMENT_PREDICTION";
    invoiceId?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
}, {
    patientId: string;
    analysisType: "RISK_SCORE" | "FRAUD_DETECTION" | "PAYMENT_PREDICTION";
    invoiceId?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
    includeHistory?: boolean | undefined;
}>;
export type RunBillingRiskAnalysisDto = z.infer<typeof RunBillingRiskAnalysisDtoSchema>;
export declare const RunAppointmentPredictionDtoSchema: z.ZodObject<{
    appointmentId: z.ZodString;
    patientId: z.ZodString;
    predictionType: z.ZodEnum<["NO_SHOW", "LATE_ARRIVAL", "CANCELLATION", "OPTIMAL_TIME"]>;
    includeHistory: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    appointmentId: string;
    includeHistory: boolean;
    predictionType: "NO_SHOW" | "LATE_ARRIVAL" | "CANCELLATION" | "OPTIMAL_TIME";
    contextData?: Record<string, unknown> | undefined;
}, {
    patientId: string;
    appointmentId: string;
    predictionType: "NO_SHOW" | "LATE_ARRIVAL" | "CANCELLATION" | "OPTIMAL_TIME";
    contextData?: Record<string, unknown> | undefined;
    includeHistory?: boolean | undefined;
}>;
export type RunAppointmentPredictionDto = z.infer<typeof RunAppointmentPredictionDtoSchema>;
export declare const RunChurnPredictionDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    forecastHorizonDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeEngagementHistory: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeFinancialHistory: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    forecastHorizonDays: number;
    includeEngagementHistory: boolean;
    includeFinancialHistory: boolean;
    contextData?: Record<string, unknown> | undefined;
}, {
    patientId: string;
    contextData?: Record<string, unknown> | undefined;
    forecastHorizonDays?: number | undefined;
    includeEngagementHistory?: boolean | undefined;
    includeFinancialHistory?: boolean | undefined;
}>;
export type RunChurnPredictionDto = z.infer<typeof RunChurnPredictionDtoSchema>;
export declare const RunMarketingPersonalizationDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    campaignType: z.ZodOptional<z.ZodString>;
    channels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includePreferences: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    includePreferences: boolean;
    contextData?: Record<string, unknown> | undefined;
    campaignType?: string | undefined;
    channels?: string[] | undefined;
}, {
    patientId: string;
    contextData?: Record<string, unknown> | undefined;
    campaignType?: string | undefined;
    channels?: string[] | undefined;
    includePreferences?: boolean | undefined;
}>;
export type RunMarketingPersonalizationDto = z.infer<typeof RunMarketingPersonalizationDtoSchema>;
export declare const RunInventoryForecastDtoSchema: z.ZodObject<{
    itemId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
    forecastHorizonDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeSeasonality: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    forecastHorizonDays: number;
    includeSeasonality: boolean;
    clinicId?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
    itemId?: string | undefined;
}, {
    clinicId?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
    forecastHorizonDays?: number | undefined;
    itemId?: string | undefined;
    includeSeasonality?: boolean | undefined;
}>;
export type RunInventoryForecastDto = z.infer<typeof RunInventoryForecastDtoSchema>;
export declare const RunRevenueForecastDtoSchema: z.ZodObject<{
    clinicId: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodString;
    forecastHorizonDays: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeSeasonality: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    breakdown: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    forecastHorizonDays: number;
    includeSeasonality: boolean;
    breakdown: boolean;
    clinicId?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
}, {
    organizationId: string;
    clinicId?: string | undefined;
    contextData?: Record<string, unknown> | undefined;
    forecastHorizonDays?: number | undefined;
    includeSeasonality?: boolean | undefined;
    breakdown?: boolean | undefined;
}>;
export type RunRevenueForecastDto = z.infer<typeof RunRevenueForecastDtoSchema>;
export declare const QueryAIResultsDtoSchema: z.ZodObject<{
    taskType: z.ZodOptional<z.ZodNativeEnum<typeof AITaskType>>;
    contextId: z.ZodOptional<z.ZodString>;
    contextType: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    taskType?: AITaskType | undefined;
    contextId?: string | undefined;
    contextType?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    taskType?: AITaskType | undefined;
    contextId?: string | undefined;
    contextType?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export type QueryAIResultsDto = z.infer<typeof QueryAIResultsDtoSchema>;
export declare const AIJobPaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["createdAt", "startedAt", "completedAt", "status"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "RUNNING", "COMPLETED", "FAILED"]>>;
    taskType: z.ZodOptional<z.ZodNativeEnum<typeof AITaskType>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "completedAt" | "startedAt";
    sortOrder: "asc" | "desc";
    status?: "PENDING" | "COMPLETED" | "RUNNING" | "FAILED" | undefined;
    taskType?: AITaskType | undefined;
}, {
    status?: "PENDING" | "COMPLETED" | "RUNNING" | "FAILED" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "completedAt" | "startedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    taskType?: AITaskType | undefined;
}>;
export type AIJobPaginationDto = z.infer<typeof AIJobPaginationSchema>;
