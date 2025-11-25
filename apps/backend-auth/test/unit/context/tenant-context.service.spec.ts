/**
 * Unit tests for TenantContextService
 *
 * Tests AsyncLocalStorage-based tenant context management
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { TenantContextService } from '../../../src/context/tenant-context.service';
import { createTenantContext } from '@dentalos/shared-auth';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTenantContext', () => {
    it('should throw UnauthorizedException when no context is available', () => {
      expect(() => service.getTenantContext()).toThrow(UnauthorizedException);
      expect(() => service.getTenantContext()).toThrow(
        'No tenant context available. Ensure request is authenticated and tenant context is set.'
      );
    });

    it('should return tenant context when available', async () => {
      const tenantContext = createTenantContext(
        'org-123' as any,
        'clinic-456' as any
      );

      await service.runWithContext(tenantContext, async () => {
        const retrieved = service.getTenantContext();
        expect(retrieved).toEqual(tenantContext);
        expect(retrieved.organizationId).toBe('org-123');
        expect(retrieved.clinicId).toBe('clinic-456');
      });
    });

    it('should return tenant context without clinicId', async () => {
      const tenantContext = createTenantContext('org-789' as any);

      await service.runWithContext(tenantContext, async () => {
        const retrieved = service.getTenantContext();
        expect(retrieved).toEqual(tenantContext);
        expect(retrieved.organizationId).toBe('org-789');
        expect(retrieved.clinicId).toBeUndefined();
      });
    });
  });

  describe('runWithContext', () => {
    it('should execute callback with tenant context available', async () => {
      const tenantContext = createTenantContext(
        'org-abc' as any,
        'clinic-def' as any
      );

      let contextInCallback: any;

      await service.runWithContext(tenantContext, async () => {
        contextInCallback = service.getTenantContext();
      });

      expect(contextInCallback).toEqual(tenantContext);
    });

    it('should isolate contexts between concurrent executions', async () => {
      const context1 = createTenantContext('org-1' as any, 'clinic-1' as any);
      const context2 = createTenantContext('org-2' as any, 'clinic-2' as any);

      const results = await Promise.all([
        service.runWithContext(context1, async () => {
          // Simulate async work
          await new Promise((resolve) => setTimeout(resolve, 10));
          return service.getTenantContext();
        }),
        service.runWithContext(context2, async () => {
          // Simulate async work
          await new Promise((resolve) => setTimeout(resolve, 10));
          return service.getTenantContext();
        }),
      ]);

      expect(results[0].organizationId).toBe('org-1');
      expect(results[0].clinicId).toBe('clinic-1');
      expect(results[1].organizationId).toBe('org-2');
      expect(results[1].clinicId).toBe('clinic-2');
    });

    it('should throw error when context is null', async () => {
      await expect(
        service.runWithContext(null as any, async () => {
          return 'test';
        })
      ).rejects.toThrow('Tenant context is required to run with context');
    });

    it('should throw error when context is undefined', async () => {
      await expect(
        service.runWithContext(undefined as any, async () => {
          return 'test';
        })
      ).rejects.toThrow('Tenant context is required to run with context');
    });

    it('should propagate errors from callback', async () => {
      const tenantContext = createTenantContext('org-error' as any);

      await expect(
        service.runWithContext(tenantContext, async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });

    it('should return callback result', async () => {
      const tenantContext = createTenantContext('org-result' as any);

      const result = await service.runWithContext(tenantContext, async () => {
        return { data: 'test data' };
      });

      expect(result).toEqual({ data: 'test data' });
    });
  });

  describe('hasContext', () => {
    it('should return false when no context is available', () => {
      expect(service.hasContext()).toBe(false);
    });

    it('should return true when context is available', async () => {
      const tenantContext = createTenantContext('org-has-context' as any);

      await service.runWithContext(tenantContext, async () => {
        expect(service.hasContext()).toBe(true);
      });
    });

    it('should return false after context scope ends', async () => {
      const tenantContext = createTenantContext('org-scope-end' as any);

      await service.runWithContext(tenantContext, async () => {
        expect(service.hasContext()).toBe(true);
      });

      expect(service.hasContext()).toBe(false);
    });
  });

  describe('getContextOrNull', () => {
    it('should return null when no context is available', () => {
      expect(service.getContextOrNull()).toBeNull();
    });

    it('should return tenant context when available', async () => {
      const tenantContext = createTenantContext(
        'org-or-null' as any,
        'clinic-or-null' as any
      );

      await service.runWithContext(tenantContext, async () => {
        const retrieved = service.getContextOrNull();
        expect(retrieved).toEqual(tenantContext);
        expect(retrieved?.organizationId).toBe('org-or-null');
        expect(retrieved?.clinicId).toBe('clinic-or-null');
      });
    });

    it('should return null after context scope ends', async () => {
      const tenantContext = createTenantContext('org-after-scope' as any);

      await service.runWithContext(tenantContext, async () => {
        expect(service.getContextOrNull()).not.toBeNull();
      });

      expect(service.getContextOrNull()).toBeNull();
    });
  });

  describe('nested contexts', () => {
    it('should support nested runWithContext calls', async () => {
      const outerContext = createTenantContext('org-outer' as any);
      const innerContext = createTenantContext('org-inner' as any);

      await service.runWithContext(outerContext, async () => {
        expect(service.getTenantContext().organizationId).toBe('org-outer');

        await service.runWithContext(innerContext, async () => {
          expect(service.getTenantContext().organizationId).toBe('org-inner');
        });

        // After inner scope, should still be outer context
        expect(service.getTenantContext().organizationId).toBe('org-outer');
      });
    });
  });
});
