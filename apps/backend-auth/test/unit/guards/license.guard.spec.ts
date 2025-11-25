/**
 * Unit tests for LicenseGuard
 *
 * Tests subscription module-based access control with comprehensive edge cases:
 * - Module requirement enforcement
 * - Backward compatibility (no subscription in JWT)
 * - Missing user in request
 * - Multiple module validation
 * - Graceful degradation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicenseGuard } from '../../../src/guards/license.guard';
import {
  MODULE_METADATA_KEY,
  ModuleMetadata,
  ModuleCode,
  SubscriptionStatus,
  CurrentUser,
} from '@dentalos/shared-auth';

describe('LicenseGuard', () => {
  let guard: LicenseGuard;
  let reflector: any;

  beforeEach(() => {
    // Create a fresh mock for each test
    reflector = {
      getAllAndOverride: vi.fn(),
    };

    // Create guard instance directly with mocked reflector
    guard = new LicenseGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate - No module requirement', () => {
    it('should allow access when no module metadata is present', () => {
      const mockContext = createMockExecutionContext({});
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        MODULE_METADATA_KEY,
        [mockContext.getHandler(), mockContext.getClass()],
      );
    });

    it('should allow access when module metadata is null', () => {
      const mockContext = createMockExecutionContext({});
      reflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });

  describe('canActivate - Missing user', () => {
    it('should throw ForbiddenException when user is not in request', () => {
      const mockContext = createMockExecutionContext(null);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('Authentication required');
    });

    it('should throw ForbiddenException when user is undefined', () => {
      const mockContext = createMockExecutionContext(undefined);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('Authentication required');
    });
  });

  describe('canActivate - Backward compatibility (no subscription in JWT)', () => {
    it('should allow access when user has no subscription context (graceful degradation)', () => {
      const userWithoutSubscription = createMockUser({
        subscription: undefined,
      });
      const mockContext = createMockExecutionContext(userWithoutSubscription);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });

  describe('canActivate - Module access granted', () => {
    it('should allow access when user has required module', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING, ModuleCode.SCHEDULING],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has core module', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING, ModuleCode.PATIENT_MANAGEMENT],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow access for trial subscription with required module', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.TRIAL,
          modules: [ModuleCode.CLINICAL_ADVANCED],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.CLINICAL_ADVANCED,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });

  describe('canActivate - Module access denied', () => {
    it('should deny access when user does not have required module', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        /This feature requires the 'imaging' module/,
      );
    });

    it('should deny access when subscription has no modules', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access for premium module when user only has core modules', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.CLINICAL_BASIC,
          ],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.ANALYTICS_ADVANCED,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        /analytics_advanced/,
      );
    });

    it('should provide helpful error message with module code', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.MARKETING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(
        "Access denied: This feature requires the 'marketing' module, which is not enabled in your subscription. Please contact your administrator to upgrade your subscription.",
      );
    });
  });

  describe('canActivate - Expired/cancelled subscriptions', () => {
    it('should deny access for expired subscription with no modules', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.EXPIRED,
          modules: [], // Expired subscriptions should have no modules in JWT
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      // Should deny access because module list is empty
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access for cancelled subscription with no modules', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.CANCELLED,
          modules: [], // Cancelled subscriptions should have no modules in JWT
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('canActivate - Metadata resolution', () => {
    it('should check method metadata before class metadata', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      guard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        MODULE_METADATA_KEY,
        [mockContext.getHandler(), mockContext.getClass()],
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle user with empty modules array', () => {
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [],
        },
      });
      const mockContext = createMockExecutionContext(user);
      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should handle concurrent requests with different users', () => {
      // User 1 has IMAGING
      const user1 = createMockUser({
        userId: 'user-1',
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING],
        },
      });
      const context1 = createMockExecutionContext(user1);

      // User 2 does not have IMAGING
      const user2 = createMockUser({
        userId: 'user-2',
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING],
        },
      });
      const context2 = createMockExecutionContext(user2);

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };
      reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

      // User 1 should succeed
      expect(guard.canActivate(context1)).toBe(true);

      // User 2 should fail
      expect(() => guard.canActivate(context2)).toThrow(ForbiddenException);
    });

    it('should handle all premium modules correctly', () => {
      const premiumModules = [
        ModuleCode.CLINICAL_ADVANCED,
        ModuleCode.IMAGING,
        ModuleCode.INVENTORY,
        ModuleCode.MARKETING,
        ModuleCode.INSURANCE,
        ModuleCode.TELEDENTISTRY,
        ModuleCode.ANALYTICS_ADVANCED,
        ModuleCode.MULTI_LOCATION,
      ];

      for (const module of premiumModules) {
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [module],
          },
        });
        const mockContext = createMockExecutionContext(user);
        const moduleMetadata: ModuleMetadata = { moduleCode: module };
        reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

        expect(guard.canActivate(mockContext)).toBe(true);
      }
    });

    it('should handle all core modules correctly', () => {
      const coreModules = [
        ModuleCode.SCHEDULING,
        ModuleCode.PATIENT_MANAGEMENT,
        ModuleCode.CLINICAL_BASIC,
        ModuleCode.BILLING_BASIC,
      ];

      for (const module of coreModules) {
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [module],
          },
        });
        const mockContext = createMockExecutionContext(user);
        const moduleMetadata: ModuleMetadata = { moduleCode: module };
        reflector.getAllAndOverride.mockReturnValue(moduleMetadata);

        expect(guard.canActivate(mockContext)).toBe(true);
      }
    });
  });
});

/**
 * Helper function to create mock CurrentUser
 */
function createMockUser(
  overrides?: Partial<CurrentUser>,
): CurrentUser {
  return {
    userId: 'user-123',
    email: 'test@example.com',
    roles: ['dentist'],
    permissions: [],
    organizationId: 'org-123',
    tenantId: 'org-123',
    tenantContext: {
      organizationId: 'org-123',
      tenantId: 'org-123',
    },
    ...overrides,
  } as CurrentUser;
}

/**
 * Helper function to create mock ExecutionContext
 */
function createMockExecutionContext(user: CurrentUser | null | undefined): ExecutionContext {
  const mockHandler = vi.fn();
  const mockClass = vi.fn();

  return {
    getHandler: () => mockHandler,
    getClass: () => mockClass,
    switchToHttp: () => ({
      getRequest: () => ({
        url: '/test',
        headers: {},
        user,
      }),
      getResponse: vi.fn(),
      getNext: vi.fn(),
    }),
    getType: () => 'http',
    getArgs: vi.fn(),
    getArgByIndex: vi.fn(),
    switchToRpc: vi.fn(),
    switchToWs: vi.fn(),
  } as any;
}
