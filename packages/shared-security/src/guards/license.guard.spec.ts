/**
 * LicenseGuard Unit Tests
 * @module shared-security/guards/license.guard.spec
 *
 * @security-testing
 * Tests cover:
 * - Module access validation
 * - Subscription status enforcement
 * - Grace period read-only access
 * - Unauthorized module access prevention
 * - Expired/suspended subscription handling
 * - Edge cases and boundary conditions
 */

import { ExecutionContext, ForbiddenException, PaymentRequiredException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleCode, SubscriptionStatus } from '@dentalos/shared-auth';
import type { CurrentUser } from '@dentalos/shared-auth';
import {
  LicenseGuard,
  RequiresModule,
  REQUIRED_MODULE_KEY,
  hasModuleAccess,
  isSubscriptionActive,
  isGracePeriodAllowed,
} from './license.guard';

describe('LicenseGuard', () => {
  let guard: LicenseGuard;
  let reflector: Reflector;

  // Mock CurrentUser factory
  const createMockUser = (overrides?: Partial<CurrentUser>): CurrentUser => ({
    userId: 'user-123',
    email: 'test@example.com',
    roles: ['DENTIST'],
    permissions: ['read:patients', 'write:patients'],
    cabinetId: 'cabinet-123',
    organizationId: 'org-123',
    tenantId: 'tenant-123',
    subscription: {
      status: SubscriptionStatus.ACTIVE,
      modules: [
        ModuleCode.SCHEDULING,
        ModuleCode.PATIENT_MANAGEMENT,
        ModuleCode.CLINICAL_BASIC,
      ],
    },
    tenantContext: {
      organizationId: 'org-123',
      cabinetId: 'cabinet-123',
      tenantId: 'tenant-123',
    },
    ...overrides,
  });

  // Mock ExecutionContext factory
  const createMockContext = (
    user: CurrentUser | null,
    requiredModule: ModuleCode | null,
    httpMethod: string = 'GET',
  ): ExecutionContext => {
    const mockRequest = {
      user,
      method: httpMethod,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenseGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<LicenseGuard>(LicenseGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    describe('No @RequiresModule decorator', () => {
      it('should allow access when no module is required', async () => {
        // Arrange
        const user = createMockUser();
        const context = createMockContext(user, null);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
          REQUIRED_MODULE_KEY,
          [context.getHandler(), context.getClass()],
        );
      });

      it('should allow access even when user is not authenticated if no module required', async () => {
        // Arrange
        const context = createMockContext(null, null);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('Authentication validation', () => {
      it('should throw ForbiddenException when user is not authenticated', async () => {
        // Arrange
        const context = createMockContext(null, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            'User not authenticated. License validation requires authentication.',
          ),
        );
      });

      it('should throw ForbiddenException when subscription context is missing', async () => {
        // Arrange
        const user = createMockUser();
        // @ts-expect-error - Testing missing subscription
        delete user.subscription;
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            'Subscription context missing from authentication token. Please re-authenticate.',
          ),
        );
      });
    });

    describe('Subscription status validation', () => {
      it('should allow access with ACTIVE subscription and valid module', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.IMAGING],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
      });

      it('should allow access with TRIAL subscription and valid module', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.TRIAL,
            modules: [ModuleCode.IMAGING],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
      });

      it('should throw PaymentRequiredException for EXPIRED subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.EXPIRED,
            modules: [ModuleCode.IMAGING],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(
          new PaymentRequiredException(
            'Your subscription has expired. Please renew to continue using this feature.',
          ),
        );
      });

      it('should throw ForbiddenException for SUSPENDED subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [ModuleCode.IMAGING],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            'Your subscription has been suspended. Please contact support to restore access.',
          ),
        );
      });

      it('should throw ForbiddenException for CANCELLED subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.CANCELLED,
            modules: [ModuleCode.IMAGING],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            'Your subscription has been cancelled. Please subscribe to access this feature.',
          ),
        );
      });
    });

    describe('Module access validation', () => {
      it('should allow access when module is in subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [
              ModuleCode.SCHEDULING,
              ModuleCode.IMAGING,
              ModuleCode.PATIENT_MANAGEMENT,
            ],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
      });

      it('should throw ForbiddenException when module is not in subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.SCHEDULING], // Only scheduling, no imaging
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(
          new ForbiddenException(
            `Access denied. The module "${ModuleCode.IMAGING}" is not included in your subscription plan. Please upgrade to access this feature.`,
          ),
        );
      });

      it('should deny access even with ACTIVE status if module not in subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.SCHEDULING],
          },
        });
        const context = createMockContext(user, ModuleCode.ANALYTICS_ADVANCED);
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(
          ModuleCode.ANALYTICS_ADVANCED,
        );

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      });
    });

    describe('Multiple modules validation', () => {
      it('should allow access to any subscribed module', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [
              ModuleCode.SCHEDULING,
              ModuleCode.PATIENT_MANAGEMENT,
              ModuleCode.CLINICAL_BASIC,
              ModuleCode.IMAGING,
              ModuleCode.ANALYTICS_ADVANCED,
            ],
          },
        });

        const modulesToTest = [
          ModuleCode.SCHEDULING,
          ModuleCode.IMAGING,
          ModuleCode.ANALYTICS_ADVANCED,
        ];

        // Act & Assert
        for (const module of modulesToTest) {
          const context = createMockContext(user, module);
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(module);

          const result = await guard.canActivate(context);
          expect(result).toBe(true);
        }
      });
    });

    describe('HTTP method handling', () => {
      it('should allow GET requests with valid subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.IMAGING],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING, 'GET');
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
      });

      it('should allow POST requests with valid subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.IMAGING],
          },
        });
        const context = createMockContext(user, ModuleCode.IMAGING, 'POST');
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
      });

      it('should allow PUT/PATCH/DELETE requests with valid subscription', async () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.IMAGING],
          },
        });

        const writeMethods = ['PUT', 'PATCH', 'DELETE'];

        // Act & Assert
        for (const method of writeMethods) {
          const context = createMockContext(user, ModuleCode.IMAGING, method);
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

          const result = await guard.canActivate(context);
          expect(result).toBe(true);
        }
      });
    });
  });

  describe('Helper functions', () => {
    describe('hasModuleAccess', () => {
      it('should return true when user has module access', () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.IMAGING, ModuleCode.SCHEDULING],
          },
        });

        // Act
        const result = hasModuleAccess(user, ModuleCode.IMAGING);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false when user does not have module access', () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [ModuleCode.SCHEDULING],
          },
        });

        // Act
        const result = hasModuleAccess(user, ModuleCode.IMAGING);

        // Assert
        expect(result).toBe(false);
      });

      it('should return false when subscription is null', () => {
        // Arrange
        const user = createMockUser();
        // @ts-expect-error - Testing null subscription
        user.subscription = null;

        // Act
        const result = hasModuleAccess(user, ModuleCode.IMAGING);

        // Assert
        expect(result).toBe(false);
      });

      it('should return false when modules array is null', () => {
        // Arrange
        const user = createMockUser();
        // @ts-expect-error - Testing null modules
        user.subscription.modules = null;

        // Act
        const result = hasModuleAccess(user, ModuleCode.IMAGING);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isSubscriptionActive', () => {
      it('should return true for ACTIVE subscription', () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [],
          },
        });

        // Act
        const result = isSubscriptionActive(user);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true for TRIAL subscription', () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.TRIAL,
            modules: [],
          },
        });

        // Act
        const result = isSubscriptionActive(user);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false for EXPIRED subscription', () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.EXPIRED,
            modules: [],
          },
        });

        // Act
        const result = isSubscriptionActive(user);

        // Assert
        expect(result).toBe(false);
      });

      it('should return false for SUSPENDED subscription', () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        });

        // Act
        const result = isSubscriptionActive(user);

        // Assert
        expect(result).toBe(false);
      });

      it('should return false for CANCELLED subscription', () => {
        // Arrange
        const user = createMockUser({
          subscription: {
            status: SubscriptionStatus.CANCELLED,
            modules: [],
          },
        });

        // Act
        const result = isSubscriptionActive(user);

        // Assert
        expect(result).toBe(false);
      });

      it('should return false when subscription is null', () => {
        // Arrange
        const user = createMockUser();
        // @ts-expect-error - Testing null subscription
        user.subscription = null;

        // Act
        const result = isSubscriptionActive(user);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('isGracePeriodAllowed', () => {
      it('should return true for GET requests', () => {
        expect(isGracePeriodAllowed('GET')).toBe(true);
      });

      it('should return true for HEAD requests', () => {
        expect(isGracePeriodAllowed('HEAD')).toBe(true);
      });

      it('should return true for OPTIONS requests', () => {
        expect(isGracePeriodAllowed('OPTIONS')).toBe(true);
      });

      it('should return false for POST requests', () => {
        expect(isGracePeriodAllowed('POST')).toBe(false);
      });

      it('should return false for PUT requests', () => {
        expect(isGracePeriodAllowed('PUT')).toBe(false);
      });

      it('should return false for PATCH requests', () => {
        expect(isGracePeriodAllowed('PATCH')).toBe(false);
      });

      it('should return false for DELETE requests', () => {
        expect(isGracePeriodAllowed('DELETE')).toBe(false);
      });

      it('should handle case-insensitive method names', () => {
        expect(isGracePeriodAllowed('get')).toBe(true);
        expect(isGracePeriodAllowed('Get')).toBe(true);
        expect(isGracePeriodAllowed('post')).toBe(false);
        expect(isGracePeriodAllowed('Post')).toBe(false);
      });
    });
  });

  describe('RequiresModule decorator', () => {
    it('should set metadata with correct key and value', () => {
      // This test verifies the decorator works correctly
      // In real usage, Reflector will read this metadata

      class TestController {
        @RequiresModule(ModuleCode.IMAGING)
        testMethod() {
          return 'test';
        }
      }

      const controller = new TestController();
      const metadata = Reflect.getMetadata(
        REQUIRED_MODULE_KEY,
        controller.testMethod,
      );

      expect(metadata).toBe(ModuleCode.IMAGING);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined HTTP method gracefully', async () => {
      // Arrange
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [ModuleCode.IMAGING],
        },
      });
      const mockRequest = {
        user,
        method: undefined, // No method specified
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true); // Defaults to GET behavior
    });

    it('should handle empty modules array', async () => {
      // Arrange
      const user = createMockUser({
        subscription: {
          status: SubscriptionStatus.ACTIVE,
          modules: [], // No modules
        },
      });
      const context = createMockContext(user, ModuleCode.IMAGING);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(ModuleCode.IMAGING);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });
});
