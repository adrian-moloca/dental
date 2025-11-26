import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CurrentUser } from '@dentalos/shared-auth';

/**
 * Tenant context interface extracted from authenticated JWT user
 * Used for multi-tenant operations requiring user and organizational context
 *
 * @security
 * - All fields are derived from verified JWT token
 * - organizationId is REQUIRED for multi-tenant isolation
 * - tenantId is computed (clinicId if present, otherwise organizationId)
 */
export interface TenantContextData {
  /** ID of the user making the request */
  userId: string;
  /** ID of the organization (REQUIRED for multi-tenant isolation) */
  organizationId: string;
  /** ID of the clinic (optional, for clinic-level operations) */
  clinicId?: string;
  /** Computed tenant ID (clinicId if present, otherwise organizationId) */
  tenantId: string;
}

/**
 * TenantContext parameter decorator
 *
 * Extracts tenant context information from the authenticated user
 * populated by JwtAuthGuard. This decorator REQUIRES that JwtAuthGuard
 * has already run and populated request.user.
 *
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Post()
 * async create(
 *   @Body() dto: CreateOrganizationDto,
 *   @TenantContext() context: TenantContextData
 * ) {
 *   return this.service.create(dto, context);
 * }
 * ```
 *
 * @security
 * - MUST be used with JwtAuthGuard to ensure authenticated context
 * - Throws UnauthorizedException if no authenticated user found
 * - organizationId is REQUIRED for all operations
 * - Prevents cross-tenant data access
 *
 * @throws {UnauthorizedException} If no authenticated user on request
 * @throws {UnauthorizedException} If user lacks organizationId
 */
export const TenantContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContextData => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUser | undefined;

    // SECURITY: Fail closed if no authenticated user
    if (!user) {
      throw new UnauthorizedException(
        'No authenticated user found. Ensure JwtAuthGuard is applied before using @TenantContext()',
      );
    }

    // SECURITY: organizationId is REQUIRED for multi-tenant isolation
    if (!user.organizationId) {
      throw new UnauthorizedException(
        'User lacks organizationId. Multi-tenant isolation cannot be enforced.',
      );
    }

    return {
      userId: user.userId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      tenantId: user.tenantId,
    };
  },
);
