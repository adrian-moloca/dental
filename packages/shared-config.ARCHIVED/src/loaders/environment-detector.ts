/**
 * Environment Detector
 * Detects and validates the current runtime environment
 */

import type { Environment, EnvironmentInfo } from '../types/environment.types';

/**
 * Valid environment values
 */
const VALID_ENVIRONMENTS: ReadonlyArray<Environment> = [
  'development',
  'staging',
  'production',
  'test',
];

/**
 * Detect the current runtime environment
 * Priority: DENTALOS_ENV > NODE_ENV > 'development' (default)
 *
 * @returns Detected environment
 * @throws Error if environment value is invalid
 */
export function detectEnvironment(): Environment {
  const dentalOsEnv = process.env.DENTALOS_ENV;
  const nodeEnv = process.env.NODE_ENV;

  const rawEnv = dentalOsEnv || nodeEnv || 'development';

  // Validate environment value
  if (!isValidEnvironment(rawEnv)) {
    throw new Error(
      `Invalid environment value: "${rawEnv}". Must be one of: ${VALID_ENVIRONMENTS.join(', ')}`,
    );
  }

  return rawEnv as Environment;
}

/**
 * Get comprehensive environment information
 *
 * @returns Environment info with metadata
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  const environment = detectEnvironment();

  return {
    environment,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
    isStaging: environment === 'staging',
    isTest: environment === 'test',
    nodeEnv: process.env.NODE_ENV,
    dentalOsEnv: process.env.DENTALOS_ENV,
  };
}

/**
 * Check if currently running in production
 */
export function isProduction(): boolean {
  return detectEnvironment() === 'production';
}

/**
 * Check if currently running in development
 */
export function isDevelopment(): boolean {
  return detectEnvironment() === 'development';
}

/**
 * Check if currently running in staging
 */
export function isStaging(): boolean {
  return detectEnvironment() === 'staging';
}

/**
 * Check if currently running in test mode
 */
export function isTest(): boolean {
  return detectEnvironment() === 'test';
}

/**
 * Validate if a string is a valid environment value
 *
 * @param value - Value to validate
 * @returns True if valid environment
 */
function isValidEnvironment(value: string): value is Environment {
  return VALID_ENVIRONMENTS.includes(value as Environment);
}

/**
 * Require production environment or throw
 * Useful for sensitive operations that should only run in production
 *
 * @throws Error if not in production
 */
export function requireProduction(): void {
  if (!isProduction()) {
    throw new Error(
      `This operation requires production environment. Current: ${detectEnvironment()}`,
    );
  }
}

/**
 * Require non-production environment or throw
 * Useful for development/testing operations
 *
 * @throws Error if in production
 */
export function requireNonProduction(): void {
  if (isProduction()) {
    throw new Error('This operation cannot run in production environment');
  }
}
