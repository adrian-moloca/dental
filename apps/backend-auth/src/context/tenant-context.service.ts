/**
 * Tenant Context Service
 *
 * Manages tenant context using AsyncLocalStorage for request-scoped isolation.
 * Ensures tenant context is available throughout the request lifecycle without
 * explicit parameter passing.
 *
 * @security
 * - Uses AsyncLocalStorage for thread-safe context propagation
 * - Prevents cross-request context leakage
 * - Fails closed (throws) when context is required but unavailable
 *
 * Used by:
 * - TenantContextInterceptor for setting context from JWT
 * - @TenantContext() decorator for injecting context into handlers
 * - Repository queries for tenant isolation
 * - Audit logging for tenant tracking
 *
 * @module context/tenant-context-service
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { CurrentTenant } from '@dentalos/shared-auth';

/**
 * Tenant context service
 *
 * Provides thread-safe storage and retrieval of tenant context
 * for the duration of an HTTP request.
 *
 * @remarks
 * Uses Node.js AsyncLocalStorage to maintain context without explicit
 * parameter passing. Context is automatically isolated per request.
 */
@Injectable()
export class TenantContextService {
  /**
   * AsyncLocalStorage instance for tenant context
   * Static to ensure single storage instance across all service instances
   */
  private static readonly storage = new AsyncLocalStorage<CurrentTenant>();

  /**
   * Retrieve current tenant context from AsyncLocalStorage
   *
   * @returns Current tenant context
   * @throws {UnauthorizedException} If no context is available
   *
   * @example
   * ```typescript
   * const tenant = this.tenantContextService.getTenantContext();
   * console.log(tenant.organizationId); // Access organizationId
   * ```
   */
  getTenantContext(): CurrentTenant {
    const context = TenantContextService.storage.getStore();

    if (!context) {
      throw new UnauthorizedException(
        'No tenant context available. Ensure request is authenticated and tenant context is set.'
      );
    }

    return context;
  }

  /**
   * Run callback with tenant context in AsyncLocalStorage
   *
   * @param context - Tenant context to use for callback execution
   * @param callback - Async function to execute with context
   * @returns Promise resolving to callback result
   *
   * @remarks
   * This method ensures the context is available to all code executed
   * within the callback, including async operations and downstream services.
   *
   * @example
   * ```typescript
   * await this.tenantContextService.runWithContext(tenant, async () => {
   *   // All code here has access to tenant context
   *   await this.someService.doWork();
   * });
   * ```
   */
  async runWithContext<T>(context: CurrentTenant, callback: () => Promise<T>): Promise<T> {
    if (!context) {
      throw new Error('Tenant context is required to run with context');
    }

    return TenantContextService.storage.run(context, callback);
  }

  /**
   * Check if tenant context is available
   *
   * @returns true if context is available, false otherwise
   *
   * @remarks
   * Useful for optional tenant routes or conditional logic
   * based on context availability.
   *
   * @example
   * ```typescript
   * if (this.tenantContextService.hasContext()) {
   *   const tenant = this.tenantContextService.getTenantContext();
   *   // Use tenant context
   * }
   * ```
   */
  hasContext(): boolean {
    return TenantContextService.storage.getStore() !== undefined;
  }

  /**
   * Get tenant context if available, otherwise return null
   *
   * @returns Current tenant context or null if not available
   *
   * @remarks
   * Non-throwing alternative to getTenantContext() for optional context scenarios.
   */
  getContextOrNull(): CurrentTenant | null {
    return TenantContextService.storage.getStore() ?? null;
  }
}
