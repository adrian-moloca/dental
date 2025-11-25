/**
 * Configuration Types
 * Core type definitions for the configuration system
 */

import type { Environment } from './environment.types';
import type { TenantId } from '@dentalos/shared-types';

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  /** Feature name/key */
  name: string;
  /** Whether feature is enabled globally */
  enabled: boolean;
  /** Optional description */
  description?: string;
  /** Whether feature can be overridden per tenant */
  allowTenantOverride: boolean;
}

/**
 * Feature flag with tenant-specific overrides
 */
export interface TenantFeatureFlag extends FeatureFlag {
  /** Tenant-specific overrides */
  tenantOverrides: Map<TenantId, boolean>;
}

/**
 * Rate limit tier configuration
 */
export interface RateLimitTier {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests in window */
  max: number;
}

/**
 * Logging configuration
 */
export interface LogConfig {
  /** Log level */
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  /** Output format */
  format: 'json' | 'text';
  /** Enable console logging */
  enableConsole: boolean;
  /** Enable file logging */
  enableFile: boolean;
  /** File path (required if enableFile is true) */
  filePath?: string;
}

/**
 * JWT configuration
 */
export interface JWTConfig {
  /** Secret key for signing (minimum 32 characters) */
  secret: string;
  /** Access token TTL in seconds */
  accessTokenTTL: number;
  /** Refresh token TTL in seconds */
  refreshTokenTTL: number;
  /** Token issuer */
  issuer: string;
  /** Token audience (optional) */
  audience?: string;
}

/**
 * Multi-tenant configuration
 */
export interface MultiTenantConfig {
  /** Tenant isolation policy */
  isolationPolicy: 'strict' | 'relaxed';
  /** Enable cross-organization access */
  enableCrossOrgAccess: boolean;
  /** Maximum clinics per organization */
  maxClinicsPerOrg: number;
}

/**
 * Features configuration (all feature flags)
 */
export interface FeaturesConfig {
  /** Enable AI-powered analytics */
  enableAIAnalytics: boolean;
  /** Enable offline mode */
  enableOfflineMode: boolean;
  /** Enable tele-dentistry features */
  enableTeleDentistry: boolean;
  /** Enable inventory management */
  enableInventoryManagement: boolean;
  /** Enable appointment reminders */
  enableAppointmentReminders: boolean;
  /** Enable patient portal */
  enablePatientPortal: boolean;
  /** Enable billing and invoicing */
  enableBilling: boolean;
  /** Enable insurance claims */
  enableInsuranceClaims: boolean;
  /** Enable treatment planning */
  enableTreatmentPlanning: boolean;
  /** Enable imaging and radiology */
  enableImaging: boolean;
  /** Enable lab integrations */
  enableLabIntegrations: boolean;
  /** Enable reporting and analytics */
  enableReporting: boolean;
  /** Enable audit logging */
  enableAuditLogging: boolean;
  /** Enable data encryption at rest */
  enableEncryptionAtRest: boolean;
  /** Enable two-factor authentication */
  enableTwoFactorAuth: boolean;
}

/**
 * Per-tenant rate limiting configuration
 */
export interface PerTenantRateLimit {
  /** Enable per-tenant rate limiting */
  enabled: boolean;
  /** Default rate limit applied to all tenants */
  defaultTenantLimit: RateLimitTier;
  /** Tenant-specific rate limit overrides (tenantId -> limits) */
  tenantOverrides?: Record<string, RateLimitTier>;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Rate limit for public (unauthenticated) requests */
  public: RateLimitTier;
  /** Rate limit for authenticated requests */
  authenticated: RateLimitTier;
  /** Rate limit for admin requests */
  admin: RateLimitTier;
  /** Per-tenant rate limiting to prevent resource exhaustion */
  perTenant: PerTenantRateLimit;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  /** Whether configuration is valid */
  valid: boolean;
  /** Validation errors (if any) */
  errors: ConfigValidationError[];
  /** Warnings (non-blocking issues) */
  warnings: ConfigValidationWarning[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  /** Field path (e.g., 'database.host') */
  path: string;
  /** Error message */
  message: string;
  /** Expected value or format */
  expected?: string;
  /** Actual value received */
  received?: unknown;
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  /** Field path */
  path: string;
  /** Warning message */
  message: string;
  /** Recommended action */
  recommendation?: string;
}

/**
 * Configuration metadata
 */
export interface ConfigMetadata {
  /** Environment this config is for */
  environment: Environment;
  /** Timestamp when config was loaded */
  loadedAt: Date;
  /** Config version/hash for change detection */
  version: string;
  /** Whether config has been validated */
  validated: boolean;
}
