import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser, validateTenantAccess, TenantIsolationError } from '@dentalos/shared-auth';

/**
 * Tenant Isolation Guard for Enterprise Service
 *
 * CRITICAL SECURITY COMPONENT FOR MULTI-TENANT ARCHITECTURE
 *
 * SECURITY RESPONSIBILITIES:
 * - Enforces strict tenant isolation at HTTP layer
 * - Validates user's organizationId matches target resource
 * - Prevents cross-tenant data access (horizontal privilege escalation)
 * - Logs all tenant isolation violations for security monitoring
 *
 * THREAT MITIGATION:
 * - Prevents Insecure Direct Object Reference (IDOR) attacks
 * - Blocks horizontal privilege escalation (CWE-639)
 * - Enforces multi-tenant data isolation (OWASP A01:2021)
 * - Prevents tenant-hopping attacks
 *
 * COMPLIANCE:
 * - HIPAA: Ensures PHI/PII isolation between organizations
 * - GDPR: Enforces data separation between data controllers
 * - SOC 2: Demonstrates logical access controls
 *
 * USAGE:
 * @UseGuards(JwtAuthGuard, TenantIsolationGuard)
 * async getOrganization(@Param('orgId') orgId: string) { ... }
 *
 * The guard extracts orgId from:
 * - Route parameters (:orgId, :organizationId)
 * - Query parameters (?organizationId=...)
 * - Request body (organizationId field)
 * - Headers (X-Organization-ID)
 *
 * IMPORTANT: This guard MUST be applied to ALL endpoints
 * that access organization-scoped resources.
 */
@Injectable()
export class TenantIsolationGuard implements CanActivate {
  private readonly logger = new Logger(TenantIsolationGuard.name);

  /**
   * Determines if request can proceed based on tenant isolation rules
   *
   * SECURITY CHECKS:
   * 1. Verify user is authenticated (request.user exists)
   * 2. Extract target organizationId from request (params, query, body, headers)
   * 3. Validate user's organizationId matches target organizationId
   * 4. Block cross-tenant access attempts with ForbiddenException
   * 5. Log all tenant isolation violations for security monitoring
   *
   * EDGE CASES:
   * - Super admins may have cross-tenant access (if configured)
   * - System-level operations may bypass tenant checks
   * - Multi-organization users require explicit tenant context
   *
   * @param context - Execution context containing HTTP request
   * @returns true if tenant access valid, throws ForbiddenException otherwise
   * @throws UnauthorizedException if user is not authenticated
   * @throws ForbiddenException if cross-tenant access attempted
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Verify user is authenticated
    // SECURITY: This guard depends on JwtAuthGuard running first
    const user = (request as any).user as CurrentUser | undefined;
    if (!user) {
      this.logger.error('TenantIsolationGuard: User not authenticated', {
        method: request.method,
        url: request.url,
      });
      throw new UnauthorizedException('Authentication required');
    }

    // Extract target organization ID from request
    const targetOrgId = this.extractTargetOrganizationId(request);

    // If no target organization specified, skip tenant isolation check
    // IMPORTANT: This allows system-level operations without organization context
    if (!targetOrgId) {
      this.logger.debug('No target organization ID found, skipping tenant isolation', {
        userId: user.userId,
        organizationId: user.organizationId,
        method: request.method,
        url: request.url,
      });
      return true;
    }

    // Validate tenant access using shared-auth helper
    try {
      validateTenantAccess(user, targetOrgId as any);

      // Log successful tenant validation for audit trail
      this.logger.debug('Tenant isolation check passed', {
        userId: user.userId,
        userOrganizationId: user.organizationId,
        targetOrganizationId: targetOrgId,
        method: request.method,
        url: request.url,
      });

      return true;
    } catch (error) {
      if (error instanceof TenantIsolationError) {
        // CRITICAL SECURITY EVENT: Cross-tenant access attempt
        this.logger.error('SECURITY VIOLATION: Cross-tenant access attempt blocked', {
          userId: user.userId,
          userEmail: user.email,
          userOrganizationId: user.organizationId,
          targetOrganizationId: targetOrgId,
          method: request.method,
          url: request.url,
          ip: request.ip,
          userAgent: request.get('user-agent'),
          timestamp: new Date().toISOString(),
        });

        // Return generic error message to avoid information disclosure
        throw new ForbiddenException('Access denied: Insufficient permissions');
      }

      // Unexpected error
      this.logger.error('Unexpected error in tenant isolation check', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: user.userId,
        method: request.method,
        url: request.url,
      });

      throw new ForbiddenException('Access validation failed');
    }
  }

  /**
   * Extracts target organization ID from request
   *
   * EXTRACTION PRIORITY (first match wins):
   * 1. Route parameters: :orgId, :organizationId
   * 2. Query parameters: ?organizationId=...
   * 3. Request body: organizationId field
   * 4. Headers: X-Organization-ID
   *
   * SECURITY:
   * - Returns first non-empty value found
   * - Validates extracted value is non-empty string
   * - Returns null if no organization ID found
   *
   * @param request - Express request object
   * @returns Organization ID or null if not found
   */
  private extractTargetOrganizationId(request: Request): string | null {
    // 1. Check route parameters (most common)
    const routeParams = (request as any).params || {};
    const orgIdFromRoute =
      routeParams.orgId || routeParams.organizationId || routeParams.organisation_id;

    if (orgIdFromRoute && typeof orgIdFromRoute === 'string') {
      return orgIdFromRoute;
    }

    // 2. Check query parameters
    const queryParams = request.query || {};
    const orgIdFromQuery = queryParams.organizationId || queryParams.orgId;

    if (orgIdFromQuery && typeof orgIdFromQuery === 'string') {
      return orgIdFromQuery;
    }

    // 3. Check request body
    const body = request.body || {};
    const orgIdFromBody = body.organizationId || body.orgId;

    if (orgIdFromBody && typeof orgIdFromBody === 'string') {
      return orgIdFromBody;
    }

    // 4. Check headers
    const orgIdFromHeader = request.get('x-organization-id') || request.get('X-Organization-ID');

    if (orgIdFromHeader && typeof orgIdFromHeader === 'string') {
      return orgIdFromHeader;
    }

    // No organization ID found
    return null;
  }
}
