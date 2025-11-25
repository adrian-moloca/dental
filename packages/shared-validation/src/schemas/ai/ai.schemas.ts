// @ts-nocheck
/**
 * AI Engine validation schemas
 * Comprehensive Zod validation for AI job creation, inference requests, and predictions
 * @module shared-validation/schemas/ai
 */

import { z } from 'zod';
import { AITaskType } from '@dentalos/shared-domain';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
} from '../common.schemas';

// ============================================================================
// Base AI Schemas
// ============================================================================

export const AITaskTypeSchema = z.nativeEnum(AITaskType);

export const AIContextSchema = z.object({
  patient: z.any().optional(),
  clinical: z.any().optional(),
  imaging: z.any().optional(),
  billing: z.any().optional(),
  scheduling: z.any().optional(),
  marketing: z.any().optional(),
  custom: z.record(z.unknown()).optional(),
});

// ============================================================================
// AI Job Creation
// ============================================================================

export const CreateAIJobDtoSchema = z.object({
  taskType: AITaskTypeSchema,
  contextId: NonEmptyStringSchema,
  contextType: NonEmptyStringSchema,
  contextData: z.record(z.unknown()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  correlationId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateAIJobDto = z.infer<typeof CreateAIJobDtoSchema>;

// ============================================================================
// Clinical Assistant & Recommendations
// ============================================================================

export const RunClinicalAssistantDtoSchema = z.object({
  patientId: UUIDSchema,
  clinicalQuestion: NonEmptyStringSchema.max(2000),
  includeHistory: z.boolean().optional().default(true),
  includeAllergies: z.boolean().optional().default(true),
  includeMedications: z.boolean().optional().default(true),
  contextData: z.record(z.unknown()).optional(),
});

export type RunClinicalAssistantDto = z.infer<typeof RunClinicalAssistantDtoSchema>;

export const RunClinicalRecommendationDtoSchema = z.object({
  patientId: UUIDSchema,
  recentProcedures: z.array(z.string()).optional(),
  clinicalFindings: z.string().optional(),
  urgencyLevel: z.enum(['ROUTINE', 'SOON', 'URGENT', 'EMERGENCY']).optional(),
  contextData: z.record(z.unknown()).optional(),
});

export type RunClinicalRecommendationDto = z.infer<typeof RunClinicalRecommendationDtoSchema>;

// ============================================================================
// Imaging Analysis
// ============================================================================

export const RunImagingAnalysisDtoSchema = z.object({
  studyId: UUIDSchema,
  patientId: UUIDSchema,
  modality: z.string().optional(),
  region: z.string().optional(),
  clinicalIndication: z.string().optional(),
  contextData: z.record(z.unknown()).optional(),
});

export type RunImagingAnalysisDto = z.infer<typeof RunImagingAnalysisDtoSchema>;

// ============================================================================
// Billing & Fraud Detection
// ============================================================================

export const RunBillingRiskAnalysisDtoSchema = z.object({
  invoiceId: UUIDSchema.optional(),
  patientId: UUIDSchema,
  analysisType: z.enum(['RISK_SCORE', 'FRAUD_DETECTION', 'PAYMENT_PREDICTION']),
  includeHistory: z.boolean().optional().default(true),
  contextData: z.record(z.unknown()).optional(),
});

export type RunBillingRiskAnalysisDto = z.infer<typeof RunBillingRiskAnalysisDtoSchema>;

// ============================================================================
// Appointment & Scheduling Predictions
// ============================================================================

export const RunAppointmentPredictionDtoSchema = z.object({
  appointmentId: UUIDSchema,
  patientId: UUIDSchema,
  predictionType: z.enum(['NO_SHOW', 'LATE_ARRIVAL', 'CANCELLATION', 'OPTIMAL_TIME']),
  includeHistory: z.boolean().optional().default(true),
  contextData: z.record(z.unknown()).optional(),
});

export type RunAppointmentPredictionDto = z.infer<typeof RunAppointmentPredictionDtoSchema>;

// ============================================================================
// Marketing: Churn & Personalization
// ============================================================================

export const RunChurnPredictionDtoSchema = z.object({
  patientId: UUIDSchema,
  forecastHorizonDays: PositiveIntSchema.optional().default(90),
  includeEngagementHistory: z.boolean().optional().default(true),
  includeFinancialHistory: z.boolean().optional().default(true),
  contextData: z.record(z.unknown()).optional(),
});

export type RunChurnPredictionDto = z.infer<typeof RunChurnPredictionDtoSchema>;

export const RunMarketingPersonalizationDtoSchema = z.object({
  patientId: UUIDSchema,
  campaignType: z.string().optional(),
  channels: z.array(z.string()).optional(),
  includePreferences: z.boolean().optional().default(true),
  contextData: z.record(z.unknown()).optional(),
});

export type RunMarketingPersonalizationDto = z.infer<typeof RunMarketingPersonalizationDtoSchema>;

// ============================================================================
// Inventory & Revenue Forecasting
// ============================================================================

export const RunInventoryForecastDtoSchema = z.object({
  itemId: UUIDSchema.optional(),
  clinicId: UUIDSchema.optional(),
  forecastHorizonDays: PositiveIntSchema.min(7).max(365).optional().default(90),
  includeSeasonality: z.boolean().optional().default(true),
  contextData: z.record(z.unknown()).optional(),
});

export type RunInventoryForecastDto = z.infer<typeof RunInventoryForecastDtoSchema>;

export const RunRevenueForecastDtoSchema = z.object({
  clinicId: UUIDSchema.optional(),
  organizationId: UUIDSchema,
  forecastHorizonDays: PositiveIntSchema.min(7).max(365).optional().default(90),
  includeSeasonality: z.boolean().optional().default(true),
  breakdown: z.boolean().optional().default(false),
  contextData: z.record(z.unknown()).optional(),
});

export type RunRevenueForecastDto = z.infer<typeof RunRevenueForecastDtoSchema>;

// ============================================================================
// AI Result Query
// ============================================================================

export const QueryAIResultsDtoSchema = z.object({
  taskType: AITaskTypeSchema.optional(),
  contextId: z.string().optional(),
  contextType: z.string().optional(),
  fromDate: ISODateStringSchema.optional(),
  toDate: ISODateStringSchema.optional(),
  limit: PositiveIntSchema.optional().default(20),
  offset: PositiveIntSchema.optional().default(0),
});

export type QueryAIResultsDto = z.infer<typeof QueryAIResultsDtoSchema>;

// ============================================================================
// Pagination
// ============================================================================

export const AIJobPaginationSchema = z.object({
  page: PositiveIntSchema.optional().default(1),
  limit: PositiveIntSchema.min(1).max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'startedAt', 'completedAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
  taskType: AITaskTypeSchema.optional(),
});

export type AIJobPaginationDto = z.infer<typeof AIJobPaginationSchema>;
// @ts-nocheck
