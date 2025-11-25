/**
 * TenantThrottlerGuard Unit Tests
 *
 * Tests the tenant-aware rate limiting guard functionality.
 * Verifies:
 * - Tenant context is used for rate limit key
 * - IP fallback for public/unauthenticated requests
 * - Error messages include tenant information
 * - Rate limits are enforced correctly
 *
 * @module test/unit/guards/tenant-throttler
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import { TenantThrottlerGuard } from '../../../src/guards/tenant-throttler.guard';
import { TenantContextService } from '../../../src/context/tenant-context.service';

describe('TenantThrottlerGuard', () => {
  let guard: TenantThrottlerGuard;
  let tenantContextService: TenantContextService;
  let reflector: Reflector;

  // Mock objects
  const mockOptions = {};
  const mockStorageService = {
    increment: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextService,
        Reflector,
        {
          provide: TenantThrottlerGuard,
          useFactory: (
            tenantService: TenantContextService,
            ref: Reflector
          ) => {
            return new TenantThrottlerGuard(
              mockOptions,
              mockStorageService,
              ref,
              tenantService
            );
          },
          inject: [TenantContextService, Reflector],
        },
      ],
    }).compile();

    guard = module.get<TenantThrottlerGuard>(TenantThrottlerGuard);
    tenantContextService = module.get<TenantContextService>(
      TenantContextService
    );
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getTracker', () => {
    it('should use organizationId for authenticated requests with tenant context', async () => {
      // Arrange
      const organizationId = '550e8400-e29b-41d4-a716-446655440000';
      const mockRequest = {
        ip: '192.168.1.1',
        headers: {},
      };

      // Set up tenant context
      tenantContextService.setContext({ organizationId });

      // Act
      const tracker = await (guard as any).getTracker(mockRequest);

      // Assert
      expect(tracker).toBe(`tenant:${organizationId}`);
    });

    it('should use organizationId when clinicId is also present', async () => {
      // Arrange
      const organizationId = '550e8400-e29b-41d4-a716-446655440000';
      const clinicId = '660e8400-e29b-41d4-a716-446655440001';
      const mockRequest = {
        ip: '192.168.1.1',
        headers: {},
      };

      // Set up tenant context
      tenantContextService.setContext({ organizationId, clinicId });

      // Act
      const tracker = await (guard as any).getTracker(mockRequest);

      // Assert
      expect(tracker).toBe(`tenant:${organizationId}`);
    });

    it('should fall back to IP address when no tenant context exists', async () => {
      // Arrange
      const mockRequest = {
        ip: '192.168.1.100',
        headers: {},
      };

      // Ensure no tenant context
      // (default state - no context set)

      // Act
      const tracker = await (guard as any).getTracker(mockRequest);

      // Assert
      expect(tracker).toBe('192.168.1.100');
    });

    it('should fall back to x-forwarded-for header when IP is not available', async () => {
      // Arrange
      const mockRequest = {
        ip: undefined,
        headers: {
          'x-forwarded-for': '10.0.0.1',
        },
      };

      // Act
      const tracker = await (guard as any).getTracker(mockRequest);

      // Assert
      expect(tracker).toBe('10.0.0.1');
    });

    it('should use "unknown" when neither IP nor tenant context is available', async () => {
      // Arrange
      const mockRequest = {
        ip: undefined,
        headers: {},
      };

      // Act
      const tracker = await (guard as any).getTracker(mockRequest);

      // Assert
      expect(tracker).toBe('unknown');
    });

    it('should handle errors in tenant context gracefully', async () => {
      // Arrange
      const mockRequest = {
        ip: '192.168.1.1',
        headers: {},
      };

      // Mock hasContext to throw error
      vi.spyOn(tenantContextService, 'hasContext').mockImplementation(() => {
        throw new Error('Context error');
      });

      // Act
      const tracker = await (guard as any).getTracker(mockRequest);

      // Assert - should fall back to IP
      expect(tracker).toBe('192.168.1.1');
    });
  });

  describe('throwThrottlingException', () => {
    it('should include tenant information in error message when context exists', () => {
      // Arrange
      const organizationId = '550e8400-e29b-41d4-a716-446655440000';
      tenantContextService.setContext({ organizationId });

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            ip: '192.168.1.1',
          }),
        }),
      } as ExecutionContext;

      // Act & Assert
      expect(() => {
        (guard as any).throwThrottlingException(mockContext);
      }).toThrow(ThrottlerException);

      expect(() => {
        (guard as any).throwThrottlingException(mockContext);
      }).toThrow(/organization: 550e8400-e29b-41d4-a716-446655440000/);
    });

    it('should not include tenant information when context is unavailable', () => {
      // Arrange - no tenant context set
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            ip: '192.168.1.1',
          }),
        }),
      } as ExecutionContext;

      // Act & Assert
      expect(() => {
        (guard as any).throwThrottlingException(mockContext);
      }).toThrow(ThrottlerException);

      expect(() => {
        (guard as any).throwThrottlingException(mockContext);
      }).toThrow(/Rate limit exceeded/);
    });

    it('should handle errors when retrieving tenant context gracefully', () => {
      // Arrange
      vi.spyOn(tenantContextService, 'hasContext').mockReturnValue(true);
      vi.spyOn(tenantContextService, 'getTenantContext').mockImplementation(
        () => {
          throw new Error('Context retrieval error');
        }
      );

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            ip: '192.168.1.1',
          }),
        }),
      } as ExecutionContext;

      // Act & Assert - should not throw due to context error
      expect(() => {
        (guard as any).throwThrottlingException(mockContext);
      }).toThrow(ThrottlerException);
    });
  });

  describe('Rate Limit Isolation', () => {
    it('should create different tracker keys for different tenants', async () => {
      // Arrange
      const org1 = '550e8400-e29b-41d4-a716-446655440001';
      const org2 = '550e8400-e29b-41d4-a716-446655440002';
      const mockRequest = {
        ip: '192.168.1.1',
        headers: {},
      };

      // Act - Test org1
      tenantContextService.setContext({ organizationId: org1 });
      const tracker1 = await (guard as any).getTracker(mockRequest);

      // Act - Test org2
      tenantContextService.setContext({ organizationId: org2 });
      const tracker2 = await (guard as any).getTracker(mockRequest);

      // Assert
      expect(tracker1).toBe(`tenant:${org1}`);
      expect(tracker2).toBe(`tenant:${org2}`);
      expect(tracker1).not.toBe(tracker2);
    });
  });
});
