/**
 * Custom Vitest Matchers
 * Domain-specific matchers for testing
 *
 * @module shared-testing/matchers
 */

import { expect } from 'vitest';
import type { CurrentUser } from '@dentalos/shared-auth';
import type { Permission, TenantContext } from '@dentalos/shared-types';

/**
 * Matcher result interface
 */
interface MatcherResult {
  pass: boolean;
  message: () => string;
}

/**
 * Check if a string is a valid UUID v4
 */
function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Check if a string is a valid email
 */
function isValidEmail(value: string): boolean {
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  return emailRegex.test(value);
}

/**
 * Check if a string is a valid E.164 phone number
 */
function isValidPhone(value: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(value);
}

/**
 * Custom Vitest matchers
 */
export const customMatchers = {
  /**
   * Check if value is a valid UUID
   */
  toBeValidUUID(received: string): MatcherResult {
    const pass = typeof received === 'string' && isValidUUID(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid UUID`
          : `Expected ${received} to be a valid UUID v4`,
    };
  },

  /**
   * Check if value is a valid email address
   */
  toBeValidEmail(received: string): MatcherResult {
    const pass = typeof received === 'string' && isValidEmail(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email address`,
    };
  },

  /**
   * Check if value is a valid phone number
   */
  toBeValidPhone(received: string): MatcherResult {
    const pass = typeof received === 'string' && isValidPhone(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid phone number`
          : `Expected ${received} to be a valid E.164 phone number`,
    };
  },

  /**
   * Check if tenant context matches expected values
   */
  toMatchTenantContext(received: any, expected: TenantContext): MatcherResult {
    if (!received || typeof received !== 'object') {
      return {
        pass: false,
        message: () => `Expected tenant context but received ${typeof received}`,
      };
    }

    const organizationMatches = received.organizationId === expected.organizationId;
    const clinicMatches = expected.clinicId
      ? received.clinicId === expected.clinicId
      : true;

    const pass = organizationMatches && clinicMatches;

    return {
      pass,
      message: () =>
        pass
          ? `Expected tenant context not to match ${JSON.stringify(expected)}`
          : `Expected tenant context ${JSON.stringify(received)} to match ${JSON.stringify(expected)}`,
    };
  },

  /**
   * Check if user has a specific permission
   */
  toHavePermission(received: CurrentUser, permission: Permission): MatcherResult {
    if (!received || !received.permissions) {
      return {
        pass: false,
        message: () => `Expected CurrentUser but received ${typeof received}`,
      };
    }

    const hasPermission = received.permissions.some(
      (p) => p.action === permission.action && p.resource === permission.resource
    );

    return {
      pass: hasPermission,
      message: () =>
        hasPermission
          ? `Expected user not to have permission ${permission.action}:${permission.resource}`
          : `Expected user to have permission ${permission.action}:${permission.resource}`,
    };
  },

  /**
   * Check if user has a specific role
   */
  toHaveRole(received: CurrentUser, role: string): MatcherResult {
    if (!received || !received.roles) {
      return {
        pass: false,
        message: () => `Expected CurrentUser but received ${typeof received}`,
      };
    }

    const hasRole = received.roles.includes(role as any);

    return {
      pass: hasRole,
      message: () =>
        hasRole
          ? `Expected user not to have role ${role}`
          : `Expected user to have role ${role}`,
    };
  },

  /**
   * Assert that async function throws tenant isolation error
   *
   * @remarks
   * Checks that a function throws TenantIsolationError (from @dentalos/shared-auth).
   * This matcher ensures tests properly validate tenant isolation boundaries.
   *
   * @example
   * ```typescript
   * // Test that cross-tenant access is blocked
   * await expect(async () => {
   *   await service.getPatient('patient-1', wrongTenantContext);
   * }).toThrowTenantIsolationError();
   *
   * // Test that same-tenant access works
   * await expect(async () => {
   *   await service.getPatient('patient-1', correctTenantContext);
   * }).not.toThrowTenantIsolationError();
   * ```
   */
  async toThrowTenantIsolationError(
    receivedFn: () => Promise<any>,
  ): Promise<MatcherResult> {
    if (typeof receivedFn !== 'function') {
      return {
        pass: false,
        message: () =>
          `Expected a function but received ${typeof receivedFn}. ` +
          'Use: await expect(async () => { ... }).toThrowTenantIsolationError()',
      };
    }

    try {
      await receivedFn();
      return {
        pass: false,
        message: () =>
          'Expected function to throw TenantIsolationError but it did not throw',
      };
    } catch (error: any) {
      const isTenantError =
        error?.name === 'TenantIsolationError' ||
        error?.constructor?.name === 'TenantIsolationError';

      return {
        pass: isTenantError,
        message: () =>
          isTenantError
            ? `Expected function not to throw TenantIsolationError but it threw: ${error.message}`
            : `Expected TenantIsolationError but got ${error?.name || error?.constructor?.name || typeof error}: ${error?.message || String(error)}`,
      };
    }
  },
};

/**
 * Register custom matchers with Vitest
 *
 * @example
 * ```typescript
 * // In your test setup file (e.g., vitest.setup.ts)
 * import { registerCustomMatchers } from '@dentalos/shared-testing';
 *
 * registerCustomMatchers();
 * ```
 */
export function registerCustomMatchers(): void {
  expect.extend(customMatchers);
}

// Type augmentation for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidUUID(): T;
    toBeValidEmail(): T;
    toBeValidPhone(): T;
    toMatchTenantContext(expected: TenantContext): T;
    toHavePermission(permission: Permission): T;
    toHaveRole(role: string): T;
    toThrowTenantIsolationError(): Promise<T>;
  }

  interface AsymmetricMatchersContaining {
    toBeValidUUID(): any;
    toBeValidEmail(): any;
    toBeValidPhone(): any;
    toMatchTenantContext(expected: TenantContext): any;
    toHavePermission(permission: Permission): any;
    toHaveRole(role: string): any;
    toThrowTenantIsolationError(): Promise<any>;
  }
}
