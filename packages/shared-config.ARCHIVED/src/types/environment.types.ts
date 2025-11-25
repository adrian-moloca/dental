/**
 * Environment Types
 * Defines environment-related types for configuration management
 */

/**
 * Supported runtime environments
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Environment detection result with metadata
 */
export interface EnvironmentInfo {
  /** Current environment */
  environment: Environment;
  /** Whether running in production */
  isProduction: boolean;
  /** Whether running in development */
  isDevelopment: boolean;
  /** Whether running in staging */
  isStaging: boolean;
  /** Whether running in test mode */
  isTest: boolean;
  /** Node environment variable value */
  nodeEnv: string | undefined;
  /** DentalOS-specific environment variable value */
  dentalOsEnv: string | undefined;
}

/**
 * Environment-specific configuration overrides
 */
export interface EnvironmentOverrides {
  /** Optional database connection string override */
  databaseUrl?: string;
  /** Optional cache endpoint override */
  cacheUrl?: string;
  /** Optional messaging endpoint override */
  messagingUrl?: string;
  /** Optional search endpoint override */
  searchUrl?: string;
  /** Optional API base URL override */
  apiBaseUrl?: string;
  /** Optional feature flags override */
  features?: Record<string, boolean>;
}
