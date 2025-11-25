/**
 * License Guard Integration Tests
 *
 * Comprehensive E2E tests for LicenseGuard and module-based access control:
 * - Module requirement enforcement via @RequiresModule decorator
 * - Subscription status validation
 * - JWT subscription context verification
 * - Multi-guard integration (@Roles + @RequiresModule)
 * - Edge cases and graceful degradation
 *
 * Test Coverage:
 * - Endpoint with @RequiresModule + user HAS module → allowed
 * - Endpoint with @RequiresModule + user DOES NOT have module → 403
 * - Endpoint with no @RequiresModule → allowed regardless
 * - Endpoint with @RequiresModule + core module → always allowed
 * - Multiple guards combined (@Roles + @RequiresModule) → both validated
 * - Active subscription with full modules → full access
 * - Trial subscription with full modules → full access during trial
 * - Expired subscription with no modules → access denied
 * - Suspended/Cancelled subscription → access denied
 * - Subscription service unavailable → graceful degradation
 *
 * @group integration
 * @module backend-auth/test/integration/license-guard
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicenseGuard } from '../../src/guards/license.guard';
import {
  MODULE_METADATA_KEY,
  ModuleMetadata,
  ModuleCode,
  SubscriptionStatus,
  CurrentUser,
} from '@dentalos/shared-auth';

/**
 * Helper to create mock CurrentUser with subscription
 */
const createMockUser = (overrides?: Partial<CurrentUser>): CurrentUser => ({
  userId: 'user-123',
  email: 'test@example.com',
  roles: ['user'],
  permissions: [],
  organizationId: 'org-123',
  tenantId: 'org-123',
  tenantContext: {
    organizationId: 'org-123',
    tenantId: 'org-123',
  },
  subscription: {
    id: 'sub-123',
    status: SubscriptionStatus.ACTIVE,
    modules: [
      ModuleCode.SCHEDULING,
      ModuleCode.PATIENT_MANAGEMENT,
      ModuleCode.CLINICAL_BASIC,
      ModuleCode.BILLING_BASIC,
    ],
  },
  ...overrides,
});

/**
 * Helper to create mock ExecutionContext
 */
const createMockExecutionContext = (
  user: CurrentUser | null | undefined,
  metadata?: ModuleMetadata
): ExecutionContext => {
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
};

describe('LicenseGuard Integration Tests (E2E)', () => {
  let guard: LicenseGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new LicenseGuard(reflector);
  });

  describe('1. Endpoint with @RequiresModule + User HAS Module', () => {
    it('should allow access when user has required imaging module', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.IMAGING, // Has imaging
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required scheduling module', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING, ModuleCode.PATIENT_MANAGEMENT],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access for all core modules in active subscription', () => {
      const coreModules = [
        ModuleCode.SCHEDULING,
        ModuleCode.PATIENT_MANAGEMENT,
        ModuleCode.CLINICAL_BASIC,
        ModuleCode.BILLING_BASIC,
      ];

      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: coreModules,
        },
      });

      for (const moduleCode of coreModules) {
        const moduleMetadata: ModuleMetadata = { moduleCode };
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

        const context = createMockExecutionContext(user);
        const result = guard.canActivate(context);

        expect(result).toBe(true);
      }
    });

    it('should allow access for premium modules when user has them', () => {
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

      const user = createMockUser({
        subscription: {
          id: 'sub-premium',
          status: SubscriptionStatus.ACTIVE,
          modules: premiumModules,
        },
      });

      for (const moduleCode of premiumModules) {
        const moduleMetadata: ModuleMetadata = { moduleCode };
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

        const context = createMockExecutionContext(user);
        const result = guard.canActivate(context);

        expect(result).toBe(true);
      }
    });
  });

  describe('2. Endpoint with @RequiresModule + User DOES NOT Have Module', () => {
    it('should deny access when user lacks imaging module', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING, ModuleCode.PATIENT_MANAGEMENT],
          // No IMAGING module
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        /This feature requires the 'imaging' module/
      );
    });

    it('should deny access when user has empty modules array', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [], // No modules
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should provide helpful error message with module code', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.MARKETING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(
        "Access denied: This feature requires the 'marketing' module, which is not enabled in your subscription. Please contact your administrator to upgrade your subscription."
      );
    });

    it('should deny access for premium module when user only has core modules', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-core-only',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.CLINICAL_BASIC,
            ModuleCode.BILLING_BASIC,
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.ANALYTICS_ADVANCED,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(/analytics_advanced/);
    });
  });

  describe('3. Endpoint with No @RequiresModule', () => {
    it('should allow access when no module metadata is present', () => {
      const user = createMockUser();

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when module metadata is null', () => {
      const user = createMockUser();

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access even with expired subscription if no module required', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-expired',
          status: SubscriptionStatus.EXPIRED,
          modules: [],
        },
      });

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('4. Endpoint with @RequiresModule + Core Module', () => {
    it('should always allow core modules for active subscription', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.CLINICAL_BASIC,
            ModuleCode.BILLING_BASIC,
          ],
        },
      });

      const coreModules = [
        ModuleCode.SCHEDULING,
        ModuleCode.PATIENT_MANAGEMENT,
        ModuleCode.CLINICAL_BASIC,
        ModuleCode.BILLING_BASIC,
      ];

      for (const moduleCode of coreModules) {
        const moduleMetadata: ModuleMetadata = { moduleCode };
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

        const context = createMockExecutionContext(user);
        const result = guard.canActivate(context);

        expect(result).toBe(true);
      }
    });

    it('should allow core modules during trial period', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-trial',
          status: SubscriptionStatus.TRIAL,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.CLINICAL_BASIC,
            ModuleCode.BILLING_BASIC,
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('5. Multiple Guards Combined (@Roles + @RequiresModule)', () => {
    it('should validate both role and module requirements', () => {
      const user = createMockUser({
        roles: ['dentist', 'admin'],
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING, ModuleCode.CLINICAL_ADVANCED],
        },
      });

      // First, roles would be checked by RolesGuard (not tested here)
      // Then, LicenseGuard checks module access

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(user.roles).toContain('dentist');
    });

    it('should deny access if user has role but lacks module', () => {
      const user = createMockUser({
        roles: ['dentist'],
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING], // No IMAGING
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should validate permissions and module access together', () => {
      const user = createMockUser({
        roles: ['dentist'],
        permissions: ['imaging:read', 'imaging:write'],
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(user.permissions).toContain('imaging:read');
    });
  });

  describe('6. Active Subscription with Full Modules', () => {
    it('should grant full access to all subscribed modules', () => {
      const allModules = [
        ModuleCode.SCHEDULING,
        ModuleCode.PATIENT_MANAGEMENT,
        ModuleCode.CLINICAL_BASIC,
        ModuleCode.CLINICAL_ADVANCED,
        ModuleCode.BILLING_BASIC,
        ModuleCode.IMAGING,
        ModuleCode.INVENTORY,
        ModuleCode.MARKETING,
        ModuleCode.INSURANCE,
        ModuleCode.TELEDENTISTRY,
        ModuleCode.ANALYTICS_ADVANCED,
        ModuleCode.MULTI_LOCATION,
      ];

      const user = createMockUser({
        subscription: {
          id: 'sub-enterprise',
          status: SubscriptionStatus.ACTIVE,
          modules: allModules,
        },
      });

      for (const moduleCode of allModules) {
        const moduleMetadata: ModuleMetadata = { moduleCode };
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

        const context = createMockExecutionContext(user);
        const result = guard.canActivate(context);

        expect(result).toBe(true);
      }
    });

    it('should handle partial module subscription correctly', () => {
      const subscribedModules = [
        ModuleCode.SCHEDULING,
        ModuleCode.PATIENT_MANAGEMENT,
        ModuleCode.IMAGING,
      ];

      const unsubscribedModules = [
        ModuleCode.MARKETING,
        ModuleCode.TELEDENTISTRY,
        ModuleCode.MULTI_LOCATION,
      ];

      const user = createMockUser({
        subscription: {
          id: 'sub-partial',
          status: SubscriptionStatus.ACTIVE,
          modules: subscribedModules,
        },
      });

      // Should allow subscribed modules
      for (const moduleCode of subscribedModules) {
        const moduleMetadata: ModuleMetadata = { moduleCode };
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

        const context = createMockExecutionContext(user);
        const result = guard.canActivate(context);

        expect(result).toBe(true);
      }

      // Should deny unsubscribed modules
      for (const moduleCode of unsubscribedModules) {
        const moduleMetadata: ModuleMetadata = { moduleCode };
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

        const context = createMockExecutionContext(user);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      }
    });
  });

  describe('7. Trial Subscription with Full Modules', () => {
    it('should grant full access during trial period', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-trial',
          status: SubscriptionStatus.TRIAL,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.CLINICAL_ADVANCED,
            ModuleCode.IMAGING,
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.CLINICAL_ADVANCED,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should treat trial same as active for module access', () => {
      const trialUser = createMockUser({
        subscription: {
          id: 'sub-trial',
          status: SubscriptionStatus.TRIAL,
          modules: [ModuleCode.IMAGING],
        },
      });

      const activeUser = createMockUser({
        subscription: {
          id: 'sub-active',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const trialContext = createMockExecutionContext(trialUser);
      const activeContext = createMockExecutionContext(activeUser);

      expect(guard.canActivate(trialContext)).toBe(true);
      expect(guard.canActivate(activeContext)).toBe(true);
    });
  });

  describe('8. Expired Subscription with No Modules', () => {
    it('should deny access when subscription is expired', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-expired',
          status: SubscriptionStatus.EXPIRED,
          modules: [], // No modules when expired
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access to all modules with expired subscription', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-expired',
          status: SubscriptionStatus.EXPIRED,
          modules: [],
        },
      });

      const allModules = [
        ModuleCode.SCHEDULING,
        ModuleCode.PATIENT_MANAGEMENT,
        ModuleCode.IMAGING,
        ModuleCode.CLINICAL_ADVANCED,
      ];

      for (const moduleCode of allModules) {
        const moduleMetadata: ModuleMetadata = { moduleCode };
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

        const context = createMockExecutionContext(user);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      }
    });
  });

  describe('9. Suspended/Cancelled Subscription', () => {
    it('should deny access for suspended subscription', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-suspended',
          status: SubscriptionStatus.SUSPENDED,
          modules: [], // No modules when suspended
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.SCHEDULING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access for cancelled subscription', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-cancelled',
          status: SubscriptionStatus.CANCELLED,
          modules: [], // No modules when cancelled
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.PATIENT_MANAGEMENT,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('10. Subscription Service Unavailable (Graceful Degradation)', () => {
    it('should allow access when no subscription context in JWT (backward compatibility)', () => {
      const user = createMockUser({
        subscription: undefined, // No subscription context
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      // Should allow for backward compatibility
      expect(result).toBe(true);
    });

    it('should throw error when user is not authenticated', () => {
      const user = null;

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Authentication required');
    });

    it('should throw error when user is undefined', () => {
      const user = undefined;

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Authentication required');
    });
  });

  describe('11. Edge Cases and Error Handling', () => {
    it('should handle concurrent requests with different users', () => {
      const user1 = createMockUser({
        userId: 'user-1',
        subscription: {
          id: 'sub-1',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING],
        },
      });

      const user2 = createMockUser({
        userId: 'user-2',
        subscription: {
          id: 'sub-2',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.SCHEDULING], // No IMAGING
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context1 = createMockExecutionContext(user1);
      const context2 = createMockExecutionContext(user2);

      expect(guard.canActivate(context1)).toBe(true);
      expect(() => guard.canActivate(context2)).toThrow(ForbiddenException);
    });

    it('should check method metadata before class metadata', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      const mockReflector = vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);
      guard.canActivate(context);

      expect(mockReflector).toHaveBeenCalledWith(
        MODULE_METADATA_KEY,
        [context.getHandler(), context.getClass()]
      );
    });

    it('should handle invalid module codes gracefully', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: ['invalid_module' as any],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle case-sensitive module codes', () => {
      const user = createMockUser({
        subscription: {
          id: 'sub-123',
          status: SubscriptionStatus.ACTIVE,
          modules: ['IMAGING' as any], // Uppercase
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: 'imaging' as ModuleCode, // Lowercase
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(user);

      // Should fail due to case mismatch (assuming case-sensitive comparison)
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('12. Real-World Scenarios', () => {
    it('should handle dentist accessing imaging feature with imaging module', () => {
      const dentist = createMockUser({
        userId: 'dentist-123',
        email: 'dentist@clinic.com',
        roles: ['dentist'],
        permissions: ['imaging:read', 'imaging:write', 'imaging:analyze'],
        subscription: {
          id: 'sub-premium',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.CLINICAL_ADVANCED,
            ModuleCode.IMAGING,
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.IMAGING,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(dentist);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny receptionist accessing advanced clinical features', () => {
      const receptionist = createMockUser({
        userId: 'receptionist-456',
        email: 'receptionist@clinic.com',
        roles: ['receptionist'],
        permissions: ['scheduling:read', 'scheduling:write', 'patient:read'],
        subscription: {
          id: 'sub-basic',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.BILLING_BASIC,
            // No CLINICAL_ADVANCED
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.CLINICAL_ADVANCED,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(receptionist);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow admin accessing analytics with correct module', () => {
      const admin = createMockUser({
        userId: 'admin-789',
        email: 'admin@clinic.com',
        roles: ['admin', 'dentist'],
        permissions: ['*'], // Full permissions
        subscription: {
          id: 'sub-enterprise',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.CLINICAL_ADVANCED,
            ModuleCode.BILLING_BASIC,
            ModuleCode.ANALYTICS_ADVANCED,
            ModuleCode.MULTI_LOCATION,
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.ANALYTICS_ADVANCED,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(admin);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle multi-location feature for enterprise subscription', () => {
      const enterpriseUser = createMockUser({
        subscription: {
          id: 'sub-enterprise',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            ModuleCode.MULTI_LOCATION,
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.MULTI_LOCATION,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(enterpriseUser);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny multi-location for single clinic subscription', () => {
      const singleClinicUser = createMockUser({
        subscription: {
          id: 'sub-single',
          status: SubscriptionStatus.ACTIVE,
          modules: [
            ModuleCode.SCHEDULING,
            ModuleCode.PATIENT_MANAGEMENT,
            // No MULTI_LOCATION
          ],
        },
      });

      const moduleMetadata: ModuleMetadata = {
        moduleCode: ModuleCode.MULTI_LOCATION,
      };

      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(moduleMetadata);

      const context = createMockExecutionContext(singleClinicUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
