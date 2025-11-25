/**
 * Unit tests for JwtAuthGuard
 *
 * Tests JWT authentication guard behavior with @Public() decorator support
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../../src/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../../src/decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const mockContext = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should call super.canActivate for protected routes', () => {
      const mockContext = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Mock the parent class method
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      guard.canActivate(mockContext);

      expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
      superCanActivateSpy.mockRestore();
    });

    it('should check both handler and class for @Public() decorator', () => {
      const mockContext = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Mock the parent class method to avoid actual JWT validation
      jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      guard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });

  describe('handleRequest', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = createMockExecutionContext();
    });

    it('should return user on successful authentication', () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['dentist'],
        permissions: [],
        tenantContext: {
          organizationId: 'org-123',
          tenantId: 'org-123',
        },
      };

      const result = guard.handleRequest(null, mockUser, null, mockContext);

      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException for TokenExpiredError', () => {
      const info = { name: 'TokenExpiredError', expiredAt: new Date() };

      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        'Token expired. Please login again.'
      );
    });

    it('should throw UnauthorizedException for JsonWebTokenError', () => {
      const info = { name: 'JsonWebTokenError', message: 'invalid signature' };

      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        'Invalid token. Authentication failed.'
      );
    });

    it('should throw UnauthorizedException for NotBeforeError', () => {
      const info = { name: 'NotBeforeError', date: new Date() };

      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        'Token not yet valid.'
      );
    });

    it('should throw UnauthorizedException for missing token', () => {
      const info = { message: 'No auth token' };

      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, info, mockContext)).toThrow(
        'Authentication required. No token provided.'
      );
    });

    it('should throw generic UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null, null, mockContext)).toThrow(
        UnauthorizedException
      );
      expect(() => guard.handleRequest(null, null, null, mockContext)).toThrow(
        'Authentication required.'
      );
    });

    it('should throw error from strategy if present', () => {
      const error = new Error('Strategy error');

      expect(() => guard.handleRequest(error, null, null, mockContext)).toThrow(
        error
      );
    });

    it('should handle undefined user', () => {
      expect(() =>
        guard.handleRequest(null, undefined, null, mockContext)
      ).toThrow(UnauthorizedException);
    });

    it('should handle false user value', () => {
      expect(() => guard.handleRequest(null, false, null, mockContext)).toThrow(
        UnauthorizedException
      );
    });
  });
});

/**
 * Helper function to create mock ExecutionContext
 */
function createMockExecutionContext(): ExecutionContext {
  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  return {
    getHandler: () => mockHandler,
    getClass: () => mockClass,
    switchToHttp: () => ({
      getRequest: () => ({
        url: '/test',
        headers: {},
      }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getType: () => 'http',
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  } as any;
}
