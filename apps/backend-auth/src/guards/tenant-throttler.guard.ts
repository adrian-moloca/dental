/**
 * Tenant-Aware Throttler Guard
 *
 * Custom throttler guard that uses organizationId as rate limit key.
 * Prevents one tenant from exhausting platform resources (noisy neighbor).
 *
 * Strategy:
 * - For authenticated requests: use organizationId from tenant context
 * - For public requests: use IP address (default behavior)
 *
 * This ensures:
 * - Each tenant has independent rate limit quota
 * - One tenant cannot exhaust limits for others
 * - Public endpoints still have IP-based rate limiting
 *
 * @module guards/tenant-throttler
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';
import { TenantContextService } from '../context/tenant-context.service';
import { Reflector } from '@nestjs/core';

/**
 * Tenant-aware throttler guard
 *
 * Extends the default NestJS throttler guard to support per-tenant rate limiting.
 */
@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: any,
    storageService: any,
    reflector: Reflector,
    private readonly tenantContextService: TenantContextService
  ) {
    super(options, storageService, reflector);
  }

  /**
   * Generate rate limit key based on tenant context
   *
   * Strategy:
   * - For authenticated requests: use organizationId
   * - For public requests: use IP address (default behavior)
   *
   * This ensures:
   * - Each tenant has independent rate limit quota
   * - One tenant cannot exhaust limits for others
   * - Public endpoints still have IP-based rate limiting
   *
   * @param req - HTTP request
   * @returns Rate limit key (tenant:orgId or IP address)
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    try {
      // Check if tenant context is available (authenticated request)
      if (this.tenantContextService.hasContext()) {
        const tenantContext = this.tenantContextService.getTenantContext();

        // Use organizationId as primary rate limit key
        return `tenant:${tenantContext.organizationId}`;
      }
    } catch {
      // Tenant context not available - fall back to IP-based limiting
    }

    // Public routes: use IP address
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  }

  /**
   * Custom error message with tenant context
   *
   * Provides additional context in the error message when rate limit is exceeded.
   *
   * @param context - Execution context
   * @param throttlerLimitDetail - Throttler limit details
   * @throws {ThrottlerException} Rate limit exceeded error
   */
  protected async throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<void> {
    let tenantInfo = '';

    try {
      if (this.tenantContextService.hasContext()) {
        const tenant = this.tenantContextService.getTenantContext();
        tenantInfo = ` (organization: ${tenant.organizationId})`;
      }
    } catch {
      // Ignore tenant context errors in error handling
    }

    throw new ThrottlerException(`Rate limit exceeded${tenantInfo}. Please try again later.`);
  }
}
