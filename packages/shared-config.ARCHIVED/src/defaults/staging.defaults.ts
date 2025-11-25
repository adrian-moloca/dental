/**
 * Staging Environment Defaults
 * Default configuration values for staging environment
 */

import type { Config } from '../schemas/config-schema';

/**
 * Staging environment default configuration
 * - Remote service connections
 * - INFO level logging
 * - Most features enabled for pre-production testing
 * - Moderate security settings
 * - Production-like rate limits
 */
export const STAGING_DEFAULTS: Partial<Config> = {
  environment: 'staging',

  // Logging: INFO level, JSON format for structured logs
  logging: {
    level: 'INFO',
    format: 'json',
    enableConsole: true,
    enableFile: false, // Use external log aggregation
  },

  // Features: Most enabled, mirrors production
  features: {
    enableAIAnalytics: true,
    enableOfflineMode: true,
    enableTeleDentistry: true,
    enableInventoryManagement: true,
    enableAppointmentReminders: true,
    enablePatientPortal: true,
    enableBilling: true,
    enableInsuranceClaims: true,
    enableTreatmentPlanning: true,
    enableImaging: true,
    enableLabIntegrations: true,
    enableReporting: true,
    enableAuditLogging: true,
    enableEncryptionAtRest: false, // Test without encryption
    enableTwoFactorAuth: false, // Optional in staging
  },

  // Rate Limiting: Production-like limits
  rateLimit: {
    public: {
      windowMs: 900000, // 15 minutes
      max: 100,
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
      enabled: true, // Enabled for testing production behavior
      defaultTenantLimit: {
        windowMs: 900000, // 15 minutes
        max: 5000, // Production-like per tenant limit
      },
      tenantOverrides: undefined,
    },
  },

  // Multi-tenant: Strict isolation like production
  multiTenant: {
    isolationPolicy: 'strict',
    enableCrossOrgAccess: false,
    maxClinicsPerOrg: 100,
  },

  // JWT: Production-like settings (secret must be provided via env)
  jwt: {
    secret: '', // MUST be overridden via environment variable
    accessTokenTTL: 900, // 15 minutes
    refreshTokenTTL: 604800, // 7 days
    issuer: 'dentalos-staging',
  },
};
