/**
 * Tenant Context Decorator
 *
 * Parameter decorator to inject tenant context from AsyncLocalStorage into route handlers.
 * Works in conjunction with TenantContextInterceptor and TenantContextService.
 *
 * @module decorators/tenant-context
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentTenant } from '@dentalos/shared-auth';
import { TenantContextService } from '../context/tenant-context.service';

/**
 * Tenant context parameter decorator
 *
 * Retrieves tenant context from AsyncLocalStorage and injects into route handler.
 *
 * @example
 * ```typescript
 * @Get('patients')
 * async getPatients(@TenantContext() tenant: CurrentTenant) {
 *   // Access tenant.organizationId and tenant.clinicId
 *   return this.service.findAll(tenant);
 * }
 * ```
 *
 * @throws {UnauthorizedException} If tenant context is not available in AsyncLocalStorage
 */
export const TenantContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentTenant => {
    // Get application context to retrieve TenantContextService
    const request = ctx.switchToHttp().getRequest();

    // Access TenantContextService from NestJS application context
    // The service is available via the request's app property
    const app = request.app;
    const service = app.get(TenantContextService);

    // Retrieve tenant context from AsyncLocalStorage
    return service.getTenantContext();
  }
);
