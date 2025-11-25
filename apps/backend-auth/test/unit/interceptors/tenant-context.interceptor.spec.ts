/**
 * Unit tests for TenantContextInterceptor
 *
 * Tests tenant context extraction from CurrentUser and AsyncLocalStorage propagation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { TenantContextInterceptor } from '../../../src/interceptors/tenant-context.interceptor';
import { TenantContextService } from '../../../src/context/tenant-context.service';
import { IS_PUBLIC_KEY } from '../../../src/decorators/public.decorator';
import { createCurrentUser } from '@dentalos/shared-auth';

describe('TenantContextInterceptor', () => {
  let interceptor: TenantContextInterceptor;
  let tenantContextService: TenantContextService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextInterceptor,
        TenantContextService,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<TenantContextInterceptor>(TenantContextInterceptor);
    tenantContextService = module.get<TenantContextService>(TenantContextService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept - public routes', () => {
    it('should skip tenant context for public routes', async () => {
      const mockContext = createMockExecutionContext(null);
      const mockNext = createMockCallHandler('test result');

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const runWithContextSpy = jest.spyOn(tenantContextService, 'runWithContext');

      const result = await interceptor.intercept(mockContext, mockNext);
      const value = await result.toPromise();

      expect(value).toBe('test result');
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(runWithContextSpy).not.toHaveBeenCalled();
    });

    it('should check @Public() decorator on handler and class', async () => {
      const mockContext = createMockExecutionContext(null);
      const mockNext = createMockCallHandler('test');

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      await interceptor.intercept(mockContext, mockNext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });

  describe('intercept - protected routes', () => {
    it('should extract tenant context from CurrentUser', async () => {
      const mockUser = createCurrentUser({
        userId: 'user-123' as any,
        email: 'test@example.com' as any,
        roles: ['dentist'] as any,
        permissions: [] as any,
        organizationId: 'org-456' as any,
        clinicId: 'clinic-789' as any,
      });

      const mockContext = createMockExecutionContext(mockUser);
      const mockNext = createMockCallHandler('success');

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const runWithContextSpy = jest.spyOn(tenantContextService, 'runWithContext');

      const result = await interceptor.intercept(mockContext, mockNext);
      const value = await result.toPromise();

      expect(value).toBe('success');
      expect(runWithContextSpy).toHaveBeenCalled();

      // Check that tenant context was created correctly
      const contextArg = runWithContextSpy.mock.calls[0][0];
      expect(contextArg.organizationId).toBe('org-456');
      expect(contextArg.clinicId).toBe('clinic-789');
    });

    it('should extract tenant context without clinicId', async () => {
      const mockUser = createCurrentUser({
        userId: 'user-abc' as any,
        email: 'test2@example.com' as any,
        roles: ['admin'] as any,
        permissions: [] as any,
        organizationId: 'org-xyz' as any,
      });

      const mockContext = createMockExecutionContext(mockUser);
      const mockNext = createMockCallHandler('result');

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const runWithContextSpy = jest.spyOn(tenantContextService, 'runWithContext');

      const result = await interceptor.intercept(mockContext, mockNext);
      await result.toPromise();

      const contextArg = runWithContextSpy.mock.calls[0][0];
      expect(contextArg.organizationId).toBe('org-xyz');
      expect(contextArg.clinicId).toBeUndefined();
    });

    it('should throw UnauthorizedException when user is missing', async () => {
      const mockContext = createMockExecutionContext(undefined);
      const mockNext = createMockCallHandler('test');

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await expect(
        interceptor.intercept(mockContext, mockNext)
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        interceptor.intercept(mockContext, mockNext)
      ).rejects.toThrow('Authentication required. User context not found.');
    });

    it('should throw UnauthorizedException when user has no tenant context', async () => {
      // Create a malformed user without tenant context
      const mockUser = {
        userId: 'user-bad' as any,
        email: 'bad@example.com' as any,
        roles: [] as any,
        permissions: [] as any,
      } as any;

      const mockContext = createMockExecutionContext(mockUser);
      const mockNext = createMockCallHandler('test');

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await expect(
        interceptor.intercept(mockContext, mockNext)
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        interceptor.intercept(mockContext, mockNext)
      ).rejects.toThrow('Invalid authentication token. Tenant context missing.');
    });

    it('should throw UnauthorizedException when organizationId is missing', async () => {
      const mockUser = {
        userId: 'user-no-org' as any,
        email: 'noorg@example.com' as any,
        roles: [] as any,
        permissions: [] as any,
        tenantContext: {
          organizationId: null,
          tenantId: null,
        },
      } as any;

      const mockContext = createMockExecutionContext(mockUser);
      const mockNext = createMockCallHandler('test');

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await expect(
        interceptor.intercept(mockContext, mockNext)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate errors from handler', async () => {
      const mockUser = createCurrentUser({
        userId: 'user-error' as any,
        email: 'error@example.com' as any,
        roles: ['dentist'] as any,
        permissions: [] as any,
        organizationId: 'org-error' as any,
      });

      const mockContext = createMockExecutionContext(mockUser);
      const mockNext: CallHandler = {
        handle: () => {
          throw new Error('Handler error');
        },
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const result = await interceptor.intercept(mockContext, mockNext);

      await expect(result.toPromise()).rejects.toThrow('Handler error');
    });
  });

  describe('intercept - non-HTTP contexts', () => {
    it('should skip processing for non-HTTP contexts', async () => {
      const mockContext = {
        getType: () => 'rpc',
        switchToHttp: jest.fn(),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const mockNext = createMockCallHandler('rpc result');

      const result = await interceptor.intercept(mockContext, mockNext);
      const value = await result.toPromise();

      expect(value).toBe('rpc result');
      expect(mockContext.switchToHttp).not.toHaveBeenCalled();
    });
  });
});

/**
 * Helper function to create mock ExecutionContext
 */
function createMockExecutionContext(user: any): ExecutionContext {
  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  return {
    getHandler: () => mockHandler,
    getClass: () => mockClass,
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        url: '/test',
        headers: {},
      }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  } as any;
}

/**
 * Helper function to create mock CallHandler
 */
function createMockCallHandler(returnValue: any): CallHandler {
  return {
    handle: () => of(returnValue),
  };
}
