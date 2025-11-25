// @ts-nocheck
/**
 * ID Generator Utilities
 * Generates fake IDs for testing without external dependencies
 *
 * @module shared-testing/generators
 */

import type { UUID, OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
import { randomBytes } from 'crypto';

/**
 * Generates a fake UUID v4
 *
 * @returns UUID string
 *
 * @example
 * ```typescript
 * const id = generateFakeUUID();
 * // '550e8400-e29b-41d4-a716-446655440000'
 * ```
 */
export function generateFakeUUID(): UUID {
  const bytes = randomBytes(16);

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

  const hex = bytes.toString('hex');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}` as UUID;
}

/**
 * Generates a deterministic fake UUID from a seed
 * Useful for reproducible tests
 *
 * @param seed - Seed string or number
 * @returns Deterministic UUID
 *
 * @example
 * ```typescript
 * const id1 = generateDeterministicUUID('test');
 * const id2 = generateDeterministicUUID('test');
 * // id1 === id2
 * ```
 */
export function generateDeterministicUUID(seed: string | number): UUID {
  const seedStr = String(seed);
  let hash = 0;

  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate deterministic bytes from hash
  const bytes = Buffer.alloc(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = (hash >> (i % 4 * 8)) & 0xff;
  }

  // Set version and variant
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}` as UUID;
}

/**
 * Generates a fake organization ID
 *
 * @returns Organization ID
 *
 * @example
 * ```typescript
 * const orgId = generateFakeOrganizationId();
 * // 'org-a1b2c3d4'
 * ```
 */
export function generateFakeOrganizationId(): OrganizationId {
  const suffix = randomBytes(4).toString('hex');
  return `org-${suffix}` as OrganizationId;
}

/**
 * Generates a fake clinic ID
 *
 * @returns Clinic ID
 *
 * @example
 * ```typescript
 * const clinicId = generateFakeClinicId();
 * // 'clinic-e5f6g7h8'
 * ```
 */
export function generateFakeClinicId(): ClinicId {
  const suffix = randomBytes(4).toString('hex');
  return `clinic-${suffix}` as ClinicId;
}

/**
 * Generates a fake tenant ID
 *
 * @returns Tenant ID
 *
 * @example
 * ```typescript
 * const tenantId = generateFakeTenantId();
 * ```
 */
export function generateFakeTenantId(): TenantId {
  // Tenant ID can be either org or clinic ID
  return Math.random() > 0.5
    ? generateFakeOrganizationId() as TenantId
    : generateFakeClinicId() as TenantId;
}
// @ts-nocheck
