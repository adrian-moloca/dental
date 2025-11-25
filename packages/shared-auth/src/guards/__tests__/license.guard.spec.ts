/**
 * LicenseGuard Unit Tests
 * @module shared-auth/guards/license-guard.spec
 */

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicenseGuard } from '../license.guard';
import { ModuleCode } from '../../jwt/jwt-payload.types';
import { MODULE_METADATA_KEY } from '../requires-module.decorator';

describe('LicenseGuard', () => {
  let guard: LicenseGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    // Create mock reflector
    reflector = new Reflector();

    // Create guard instance
    guard = new LicenseGuard(reflector);

    // Create mock request
    mockRequest = {
      url: '/test/endpoint',
      method: 'GET',
      user: null,
    };

    // Create mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  describe('canActivate', () => {
    describe('No module requirement', () => {
      it('should allow access when no module required (decorator not set)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow access even if user has no subscription', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        mockRequest.user = {
          email: 'test@example.com',
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('Module requirement validation', () => {
      beforeEach(() => {
        // Set required module to IMAGING
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.IMAGING);
      });

      it('should throw ForbiddenException if user not authenticated', () => {
        mockRequest.user = null;

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          'Authentication required',
        );
      });

      it('should throw ForbiddenException if subscription missing', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          "Module 'imaging' is required but no subscription information found",
        );
      });

      it('should throw ForbiddenException if modules array missing', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should throw ForbiddenException if modules is not an array', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: 'not-an-array',
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          'Invalid subscription data',
        );
      });

      it('should throw ForbiddenException if required module not in subscription', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.SCHEDULING, ModuleCode.PATIENT_MANAGEMENT],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          "Module 'imaging' is required but not enabled in your subscription",
        );
      });

      it('should allow access if required module in subscription', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [
              ModuleCode.SCHEDULING,
              ModuleCode.IMAGING,
              ModuleCode.PATIENT_MANAGEMENT,
            ],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow access if user has only the required module', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.IMAGING],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('Different module requirements', () => {
      it('should validate CLINICAL_ADVANCED module', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.CLINICAL_ADVANCED);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.CLINICAL_ADVANCED],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should validate ANALYTICS_ADVANCED module', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.ANALYTICS_ADVANCED);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.ANALYTICS_ADVANCED, ModuleCode.BILLING_BASIC],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should deny access to MULTI_LOCATION if not in subscription', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.MULTI_LOCATION);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.SCHEDULING],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });
    });

    describe('Core modules', () => {
      it('should validate SCHEDULING core module', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.SCHEDULING);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [
              ModuleCode.SCHEDULING,
              ModuleCode.PATIENT_MANAGEMENT,
              ModuleCode.CLINICAL_BASIC,
              ModuleCode.BILLING_BASIC,
            ],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should validate PATIENT_MANAGEMENT core module', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.PATIENT_MANAGEMENT);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.PATIENT_MANAGEMENT],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('Premium modules', () => {
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

      premiumModules.forEach((module) => {
        it(`should allow access to ${module} when in subscription`, () => {
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(module);

          mockRequest.user = {
            email: 'test@example.com',
            userId: 'user-123',
            subscription: {
              status: 'ACTIVE',
              modules: [module],
            },
          };

          const result = guard.canActivate(mockExecutionContext);

          expect(result).toBe(true);
        });

        it(`should deny access to ${module} when not in subscription`, () => {
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(module);

          mockRequest.user = {
            email: 'test@example.com',
            userId: 'user-123',
            subscription: {
              status: 'ACTIVE',
              modules: [ModuleCode.SCHEDULING], // Different module
            },
          };

          expect(() => guard.canActivate(mockExecutionContext)).toThrow(
            ForbiddenException,
          );
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle empty modules array', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.IMAGING);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should handle user with sub instead of userId', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.IMAGING);

        mockRequest.user = {
          email: 'test@example.com',
          sub: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.IMAGING],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should handle user with tenantContext', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.IMAGING);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          tenantContext: {
            organizationId: 'org-123',
            clinicId: 'clinic-456',
          },
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.IMAGING],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('Reflector metadata retrieval', () => {
      it('should check both handler and class metadata', () => {
        const getAllAndOverrideSpy = jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(ModuleCode.IMAGING);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'ACTIVE',
            modules: [ModuleCode.IMAGING],
          },
        };

        guard.canActivate(mockExecutionContext);

        expect(getAllAndOverrideSpy).toHaveBeenCalledWith(
          MODULE_METADATA_KEY,
          expect.any(Array),
        );
      });
    });
  });
});
