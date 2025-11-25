/**
 * Production Environment Defaults
 * Default configuration values for production environment
 */

import type { Config } from '../schemas/config-schema';

/**
 * Production environment default configuration
 * - Require explicit environment variables (minimal defaults)
 * - WARN level logging to reduce noise
 * - Selective feature enablement
 * - Strict security settings
 * - Conservative rate limits
 */
export const PRODUCTION_DEFAULTS: Partial<Config> = {
  environment: 'production',

  // Logging: WARN level, JSON format for production
  logging: {
    level: 'WARN',
    format: 'json',
    enableConsole: true,
    enableFile: false, // Use external log aggregation (e.g., CloudWatch, Datadog)
  },

  // Features: Selective enablement for production
  features: {
    enableAIAnalytics: false, // Opt-in
    enableOfflineMode: false, // Opt-in
    enableTeleDentistry: false, // Opt-in
    enableInventoryManagement: true,
    enableAppointmentReminders: true,
    enablePatientPortal: true,
    enableBilling: true,
    enableInsuranceClaims: true,
    enableTreatmentPlanning: true,
    enableImaging: true,
    enableLabIntegrations: false, // Opt-in
    enableReporting: true,
    enableAuditLogging: true, // Critical for compliance
    enableEncryptionAtRest: true, // Security best practice
    enableTwoFactorAuth: true, // Security best practice
  },

  // Rate Limiting: Conservative limits for production
  rateLimit: {
    public: {
      windowMs: 900000, // 15 minutes
      max: 100, // Conservative
    },
    authenticated: {
      windowMs: 900000,
      max: 1000,
    },
    admin: {
      windowMs: 900000,
      max: 10000,
    },
    perTenant: {
      enabled: true, // CRITICAL: Enabled to prevent resource exhaustion
      defaultTenantLimit: {
        windowMs: 900000, // 15 minutes
        max: 5000, // Per tenant limit to ensure fair resource allocation
      },
      tenantOverrides: undefined, // Loaded from database at runtime
    },
  },

  // Multi-tenant: Strict isolation for security
  multiTenant: {
    isolationPolicy: 'strict',
    enableCrossOrgAccess: false, // Never in production
    maxClinicsPerOrg: 100,
  },

  // JWT: Security-focused settings (secret MUST be provided)
  jwt: {
    secret: '', // MUST be overridden via environment variable
    accessTokenTTL: 900, // 15 minutes
    refreshTokenTTL: 604800, // 7 days
    issuer: 'dentalos',
  },
};
