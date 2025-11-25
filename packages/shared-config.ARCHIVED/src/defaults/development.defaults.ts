/**
 * Development Environment Defaults
 * Default configuration values for development environment
 */

import type { Config } from '../schemas/config-schema';

/**
 * Development environment default configuration
 * - Localhost connections
 * - Verbose logging (DEBUG level)
 * - All features enabled for testing
 * - Relaxed security settings
 * - High rate limits
 */
export const DEVELOPMENT_DEFAULTS: Partial<Config> = {
  environment: 'development',

  // Logging: Verbose for debugging
  logging: {
    level: 'DEBUG',
    format: 'text',
    enableConsole: true,
    enableFile: false,
  },

  // Features: All enabled for development
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
    enableEncryptionAtRest: false, // Not needed in dev
    enableTwoFactorAuth: false, // Optional in dev
  },

  // Rate Limiting: High limits for development
  rateLimit: {
    public: {
      windowMs: 900000, // 15 minutes
      max: 1000, // High limit
    },
    authenticated: {
      windowMs: 900000,
      max: 10000, // Very high limit
    },
    admin: {
      windowMs: 900000,
      max: 100000, // Effectively unlimited
    },
    perTenant: {
      enabled: true, // Enabled by default for testing
      defaultTenantLimit: {
        windowMs: 900000, // 15 minutes
        max: 50000, // High limit for development
      },
      tenantOverrides: undefined,
    },
  },

  // Multi-tenant: Relaxed for easier development
  multiTenant: {
    isolationPolicy: 'relaxed',
    enableCrossOrgAccess: true,
    maxClinicsPerOrg: 100,
  },

  // JWT: Development-friendly settings
  jwt: {
    secret: 'dev-secret-key-change-in-production-min-32-chars',
    accessTokenTTL: 3600, // 1 hour for convenience
    refreshTokenTTL: 604800, // 7 days
    issuer: 'dentalos-dev',
  },
};
