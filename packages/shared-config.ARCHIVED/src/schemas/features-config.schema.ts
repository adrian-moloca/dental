/**
 * Features Configuration Schema
 * Zod schema for feature flag configuration
 */

import { z } from 'zod';

/**
 * Features configuration schema
 * Defines all available feature flags for the platform
 */
export const FeaturesConfigSchema = z.object({
  /** Enable AI-powered analytics and insights */
  enableAIAnalytics: z
    .boolean()
    .default(false)
    .describe('Enable AI-powered analytics and insights'),

  /** Enable offline mode for PWA functionality */
  enableOfflineMode: z
    .boolean()
    .default(false)
    .describe('Enable offline mode and local data sync'),

  /** Enable tele-dentistry video consultations */
  enableTeleDentistry: z
    .boolean()
    .default(false)
    .describe('Enable tele-dentistry video consultations'),

  /** Enable inventory and supply management */
  enableInventoryManagement: z
    .boolean()
    .default(true)
    .describe('Enable inventory and supply management'),

  /** Enable automated appointment reminders */
  enableAppointmentReminders: z
    .boolean()
    .default(true)
    .describe('Enable automated appointment reminders'),

  /** Enable patient portal access */
  enablePatientPortal: z
    .boolean()
    .default(true)
    .describe('Enable patient self-service portal'),

  /** Enable billing and invoicing features */
  enableBilling: z
    .boolean()
    .default(true)
    .describe('Enable billing and invoicing features'),

  /** Enable insurance claims management */
  enableInsuranceClaims: z
    .boolean()
    .default(true)
    .describe('Enable insurance claims processing'),

  /** Enable treatment planning tools */
  enableTreatmentPlanning: z
    .boolean()
    .default(true)
    .describe('Enable comprehensive treatment planning'),

  /** Enable imaging and radiology features */
  enableImaging: z
    .boolean()
    .default(true)
    .describe('Enable imaging and radiology management'),

  /** Enable dental lab integrations */
  enableLabIntegrations: z
    .boolean()
    .default(false)
    .describe('Enable third-party dental lab integrations'),

  /** Enable reporting and analytics dashboard */
  enableReporting: z
    .boolean()
    .default(true)
    .describe('Enable reporting and analytics'),

  /** Enable comprehensive audit logging */
  enableAuditLogging: z
    .boolean()
    .default(true)
    .describe('Enable audit logging for compliance'),

  /** Enable data encryption at rest */
  enableEncryptionAtRest: z
    .boolean()
    .default(false)
    .describe('Enable data encryption at rest (production only)'),

  /** Enable two-factor authentication */
  enableTwoFactorAuth: z
    .boolean()
    .default(false)
    .describe('Enable two-factor authentication for users'),
});

/**
 * Inferred TypeScript type from features config schema
 */
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;

/**
 * Load features configuration from environment variables
 * Feature flags can be enabled by setting DENTALOS_FEATURE_<NAME>=true
 *
 * @returns Validated features configuration
 * @throws ZodError if validation fails
 */
export function loadFeaturesConfig(): FeaturesConfig {
  const rawConfig = {
    enableAIAnalytics: process.env.DENTALOS_FEATURE_AI_ANALYTICS === 'true',
    enableOfflineMode: process.env.DENTALOS_FEATURE_OFFLINE_MODE === 'true',
    enableTeleDentistry: process.env.DENTALOS_FEATURE_TELEDENTISTRY === 'true',
    enableInventoryManagement:
      process.env.DENTALOS_FEATURE_INVENTORY_MANAGEMENT !== 'false',
    enableAppointmentReminders:
      process.env.DENTALOS_FEATURE_APPOINTMENT_REMINDERS !== 'false',
    enablePatientPortal:
      process.env.DENTALOS_FEATURE_PATIENT_PORTAL !== 'false',
    enableBilling: process.env.DENTALOS_FEATURE_BILLING !== 'false',
    enableInsuranceClaims:
      process.env.DENTALOS_FEATURE_INSURANCE_CLAIMS !== 'false',
    enableTreatmentPlanning:
      process.env.DENTALOS_FEATURE_TREATMENT_PLANNING !== 'false',
    enableImaging: process.env.DENTALOS_FEATURE_IMAGING !== 'false',
    enableLabIntegrations:
      process.env.DENTALOS_FEATURE_LAB_INTEGRATIONS === 'true',
    enableReporting: process.env.DENTALOS_FEATURE_REPORTING !== 'false',
    enableAuditLogging: process.env.DENTALOS_FEATURE_AUDIT_LOGGING !== 'false',
    enableEncryptionAtRest:
      process.env.DENTALOS_FEATURE_ENCRYPTION_AT_REST === 'true',
    enableTwoFactorAuth:
      process.env.DENTALOS_FEATURE_TWO_FACTOR_AUTH === 'true',
  };

  return FeaturesConfigSchema.parse(rawConfig);
}
