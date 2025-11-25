/**
 * SubscriptionStatusGuard Unit Tests
 * @module shared-auth/guards/subscription-status-guard.spec
 */

import {
  ExecutionContext,
  ForbiddenException,
  PaymentRequiredException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  SubscriptionStatusGuard,
  ALLOW_GRACE_PERIOD_KEY,
} from '../subscription-status.guard';
import { SubscriptionStatus } from '../../jwt/jwt-payload.types';

describe('SubscriptionStatusGuard', () => {
  let guard: SubscriptionStatusGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    // Create mock reflector
    reflector = new Reflector();

    // Create guard instance
    guard = new SubscriptionStatusGuard(reflector);

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
    describe('User authentication validation', () => {
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
          'No active subscription',
        );
      });
    });

    describe('ACTIVE subscription status', () => {
      it('should allow access with ACTIVE status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow GET requests with ACTIVE status', () => {
        mockRequest.method = 'GET';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow POST requests with ACTIVE status', () => {
        mockRequest.method = 'POST';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('TRIAL subscription status', () => {
      it('should allow access with TRIAL status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.TRIAL,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow all HTTP methods with TRIAL status', () => {
        const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

        methods.forEach((method) => {
          mockRequest.method = method;
          mockRequest.user = {
            email: 'test@example.com',
            userId: 'user-123',
            subscription: {
              status: SubscriptionStatus.TRIAL,
              modules: [],
            },
          };

          const result = guard.canActivate(mockExecutionContext);

          expect(result).toBe(true);
        });
      });
    });

    describe('EXPIRED subscription status', () => {
      it('should throw PaymentRequiredException (402) for EXPIRED status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.EXPIRED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          PaymentRequiredException,
        );
      });

      it('should include clear message about renewal for EXPIRED status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.EXPIRED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          'Your subscription has expired. Please renew your subscription',
        );
      });

      it('should reject all HTTP methods for EXPIRED status', () => {
        const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

        methods.forEach((method) => {
          mockRequest.method = method;
          mockRequest.user = {
            email: 'test@example.com',
            userId: 'user-123',
            subscription: {
              status: SubscriptionStatus.EXPIRED,
              modules: [],
            },
          };

          expect(() => guard.canActivate(mockExecutionContext)).toThrow(
            PaymentRequiredException,
          );
        });
      });
    });

    describe('SUSPENDED subscription status', () => {
      beforeEach(() => {
        // Default: no grace period allowed
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      });

      it('should throw ForbiddenException for SUSPENDED status (no grace period)', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should include payment failure message for SUSPENDED status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          'Your subscription payment has failed. Please update your payment method',
        );
      });

      it('should reject write operations (POST) even with grace period enabled', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'POST';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should reject write operations (PUT) even with grace period enabled', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'PUT';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should reject write operations (DELETE) even with grace period enabled', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'DELETE';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should allow read operations (GET) with grace period enabled', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'GET';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow read operations (HEAD) with grace period enabled', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'HEAD';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should allow read operations (OPTIONS) with grace period enabled', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'OPTIONS';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should reject GET requests when grace period not enabled', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false); // Grace period disabled

        mockRequest.method = 'GET';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });
    });

    describe('CANCELLED subscription status', () => {
      it('should throw ForbiddenException for CANCELLED status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.CANCELLED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should include reactivation message for CANCELLED status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.CANCELLED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          'Your subscription has been cancelled. Please reactivate your subscription',
        );
      });

      it('should reject all HTTP methods for CANCELLED status', () => {
        const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

        methods.forEach((method) => {
          mockRequest.method = method;
          mockRequest.user = {
            email: 'test@example.com',
            userId: 'user-123',
            subscription: {
              status: SubscriptionStatus.CANCELLED,
              modules: [],
            },
          };

          expect(() => guard.canActivate(mockExecutionContext)).toThrow(
            ForbiddenException,
          );
        });
      });

      it('should not allow grace period for CANCELLED status', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'GET';
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.CANCELLED,
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });
    });

    describe('Unknown subscription status', () => {
      it('should throw ForbiddenException for unknown status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'UNKNOWN_STATUS',
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          ForbiddenException,
        );
      });

      it('should include support message for unknown status', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: 'INVALID',
            modules: [],
          },
        };

        expect(() => guard.canActivate(mockExecutionContext)).toThrow(
          'Invalid subscription status. Please contact support',
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle user with sub instead of userId', () => {
        mockRequest.user = {
          email: 'test@example.com',
          sub: 'user-123',
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should handle user with tenantContext', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          tenantContext: {
            organizationId: 'org-123',
            clinicId: 'clinic-456',
          },
          subscription: {
            status: SubscriptionStatus.ACTIVE,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should handle lowercase HTTP method', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'get'; // lowercase
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });

      it('should handle mixed case HTTP method', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Grace period enabled

        mockRequest.method = 'GeT'; // mixed case
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
      });
    });

    describe('Reflector metadata retrieval', () => {
      it('should check both handler and class metadata for grace period', () => {
        const getAllAndOverrideSpy = jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(false);

        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        try {
          guard.canActivate(mockExecutionContext);
        } catch (e) {
          // Expected to throw
        }

        expect(getAllAndOverrideSpy).toHaveBeenCalledWith(
          ALLOW_GRACE_PERIOD_KEY,
          expect.any(Array),
        );
      });
    });

    describe('HTTP Status Codes', () => {
      it('should return 402 for EXPIRED subscriptions', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.EXPIRED,
            modules: [],
          },
        };

        try {
          guard.canActivate(mockExecutionContext);
          fail('Should have thrown PaymentRequiredException');
        } catch (error) {
          expect(error).toBeInstanceOf(PaymentRequiredException);
        }
      });

      it('should return 403 for SUSPENDED subscriptions', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.SUSPENDED,
            modules: [],
          },
        };

        try {
          guard.canActivate(mockExecutionContext);
          fail('Should have thrown ForbiddenException');
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });

      it('should return 403 for CANCELLED subscriptions', () => {
        mockRequest.user = {
          email: 'test@example.com',
          userId: 'user-123',
          subscription: {
            status: SubscriptionStatus.CANCELLED,
            modules: [],
          },
        };

        try {
          guard.canActivate(mockExecutionContext);
          fail('Should have thrown ForbiddenException');
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
        }
      });
    });
  });
});
