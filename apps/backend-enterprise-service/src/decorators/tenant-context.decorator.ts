import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Tenant context interface extracted from request headers
 * Used for multi-tenant operations requiring user and organizational context
 */
export interface TenantContextData {
  /** ID of the user making the request */
  userId: string;
  /** ID of the organization (optional, required for org-level operations) */
  organizationId?: string;
  /** ID of the clinic (optional, required for clinic-level operations) */
  clinicId?: string;
}

/**
 * TenantContext parameter decorator
 *
 * Extracts tenant context information from the request headers.
 * Currently uses headers as a temporary solution until JWT-based authentication
 * and authorization guards are fully implemented.
 *
 * Usage:
 * ```typescript
 * @Post()
 * async create(
 *   @Body() dto: CreateOrganizationDto,
 *   @TenantContext() context: TenantContextData
 * ) {
 *   return this.service.create(dto, context);
 * }
 * ```
 *
 * Headers:
 * - x-user-id: User identifier (defaults to 'system-admin' if not provided)
 * - x-organization-id: Organization identifier (optional)
 * - x-clinic-id: Clinic identifier (optional)
 *
 * @remarks
 * This is a temporary implementation. Future versions will:
 * - Extract context from JWT tokens via authentication guards
 * - Validate permissions using RBAC/ABAC guards
 * - Enforce multi-tenant isolation automatically
 * - Provide stronger type safety and validation
 *
 * Edge Cases Handled:
 * - Missing headers: Defaults userId to 'system-admin'
 * - Undefined headers: Returns undefined for optional fields
 * - Non-HTTP contexts: Will fail gracefully (ctx.switchToHttp() throws)
 */
export const TenantContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContextData => {
    const request = ctx.switchToHttp().getRequest();

    // Extract from headers (temporary implementation)
    // TODO: Extract from JWT/authentication guards when implemented
    const userId = (request.headers['x-user-id'] as string) || 'system-admin';
    const organizationId = request.headers['x-organization-id'] as string | undefined;
    const clinicId = request.headers['x-clinic-id'] as string | undefined;

    return {
      userId,
      organizationId,
      clinicId,
    };
  },
);
