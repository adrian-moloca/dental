/**
 * License validation constants
 * @module shared-auth/license/constants
 */

import { ModuleCode } from '../jwt/jwt-payload.types';

/**
 * Grace period duration in days
 * Duration of read-only access after payment failure
 */
export const GRACE_PERIOD_DAYS = 7;

/**
 * HTTP methods that are considered read operations
 * These operations are allowed during grace period
 */
export const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'] as const;

/**
 * HTTP methods that are considered write operations
 * These operations are blocked during grace period
 */
export const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;

/**
 * Core modules included in all subscriptions
 * These are always available regardless of pricing tier
 */
export const CORE_MODULES: readonly ModuleCode[] = Object.freeze([
  ModuleCode.SCHEDULING,
  ModuleCode.PATIENT_MANAGEMENT,
  ModuleCode.CLINICAL_BASIC,
  ModuleCode.BILLING_BASIC,
] as const);

/**
 * Premium modules available as add-ons
 * These require explicit subscription and additional payment
 */
export const PREMIUM_MODULES: readonly ModuleCode[] = Object.freeze([
  ModuleCode.CLINICAL_ADVANCED,
  ModuleCode.IMAGING,
  ModuleCode.INVENTORY,
  ModuleCode.MARKETING,
  ModuleCode.INSURANCE,
  ModuleCode.TELEDENTISTRY,
  ModuleCode.ANALYTICS_ADVANCED,
  ModuleCode.MULTI_LOCATION,
] as const);

/**
 * All available modules in the system
 */
export const ALL_MODULES: readonly ModuleCode[] = Object.freeze([
  ...CORE_MODULES,
  ...PREMIUM_MODULES,
] as const);

/**
 * Type for HTTP methods
 */
export type HttpMethod = typeof READ_METHODS[number] | typeof WRITE_METHODS[number];

/**
 * Type for read-only HTTP methods
 */
export type ReadMethod = typeof READ_METHODS[number];

/**
 * Type for write HTTP methods
 */
export type WriteMethod = typeof WRITE_METHODS[number];
