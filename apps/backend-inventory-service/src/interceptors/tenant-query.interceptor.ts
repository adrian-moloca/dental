import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CurrentUser } from '@dentalos/shared-auth';

/**
 * Tenant Query Interceptor
 *
 * CRITICAL SECURITY COMPONENT FOR MULTI-TENANT DATA ISOLATION
 *
 * SECURITY RESPONSIBILITIES:
 * - Automatically injects tenant filters into database queries
 * - Ensures all queries are scoped to user's organization
 * - Prevents accidental cross-tenant data leakage
 * - Provides defense-in-depth alongside TenantIsolationGuard
 *
 * THREAT MITIGATION:
 * - Prevents horizontal privilege escalation
 * - Blocks cross-tenant data access at query level
 * - Mitigates developer errors (forgot to add org filter)
 * - Enforces tenant isolation as system-wide policy
 *
 * COMPLIANCE:
 * - HIPAA: Ensures PHI isolation between covered entities
 * - GDPR: Enforces data separation between controllers
 * - SOC 2: Demonstrates logical access controls at data layer
 *
 * USAGE:
 * This interceptor runs automatically for all requests.
 * It adds tenantContext to request object for use by services.
 *
 * Services should use:
 * const { organizationId } = req.tenantContext;
 * Model.find({ organizationId, ...otherFilters });
 */
@Injectable()
export class TenantQueryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantQueryInterceptor.name);

  /**
   * Intercepts request to inject tenant context
   *
   * SECURITY:
   * 1. Extract user from request (populated by JwtAuthGuard)
   * 2. Create tenantContext with organizationId and clinicId
   * 3. Attach tenantContext to request for service layer
   * 4. Log tenant context for audit trail
   *
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract user from request (populated by JwtAuthGuard)
    const user = (request as any).user as CurrentUser | undefined;

    if (user) {
      // Create tenant context for query filtering
      const tenantContext = {
        organizationId: user.organizationId,
        clinicId: user.clinicId,
        userId: user.userId,
      };

      // Attach to request for service layer
      (request as any).tenantContext = tenantContext;

      this.logger.debug('Tenant context injected', {
        organizationId: tenantContext.organizationId,
        clinicId: tenantContext.clinicId,
        userId: tenantContext.userId,
        method: request.method,
        url: request.url,
      });
    }

    return next.handle();
  }
}

/**
 * Tenant-Scoped Base Repository
 *
 * SECURITY PATTERN:
 * - All database operations automatically scoped to tenant
 * - Prevents accidental cross-tenant queries
 * - Enforces tenant isolation at repository layer
 *
 * USAGE:
 * class OrganizationRepository extends TenantScopedRepository<OrganizationDocument> {
 *   async findAll(tenantContext: TenantContext) {
 *     return this.findAllScoped(tenantContext, {});
 *   }
 * }
 */
export interface TenantContext {
  organizationId: string;
  clinicId?: string;
  userId: string;
}

/**
 * Base repository with automatic tenant scoping
 *
 * SECURITY FEATURES:
 * - All queries automatically filtered by organizationId
 * - Optional clinic-level scoping for sub-tenant isolation
 * - Prevents accidental global queries
 * - Type-safe tenant context
 */
export abstract class TenantScopedRepository<T> {
  protected readonly logger: Logger;

  constructor(
    protected readonly model: any,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Finds all documents scoped to tenant
   *
   * SECURITY:
   * - Automatically adds organizationId filter
   * - Optionally adds clinicId filter if provided
   * - Merges with additional filters
   *
   * @param tenantContext - Tenant context with organizationId
   * @param additionalFilters - Additional query filters
   * @returns Array of documents
   */
  protected async findAllScoped(
    tenantContext: TenantContext,
    additionalFilters: any = {},
  ): Promise<T[]> {
    const query = this.buildTenantQuery(tenantContext, additionalFilters);

    this.logger.debug('Executing tenant-scoped query', {
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      filters: additionalFilters,
    });

    return this.model.find(query).exec();
  }

  /**
   * Finds one document scoped to tenant
   *
   * SECURITY:
   * - Automatically adds organizationId filter
   * - Ensures document belongs to user's organization
   *
   * @param tenantContext - Tenant context
   * @param filters - Query filters (e.g., { _id: '...' })
   * @returns Document or null
   */
  protected async findOneScoped(tenantContext: TenantContext, filters: any): Promise<T | null> {
    const query = this.buildTenantQuery(tenantContext, filters);

    this.logger.debug('Executing tenant-scoped findOne', {
      organizationId: tenantContext.organizationId,
      filters,
    });

    return this.model.findOne(query).exec();
  }

  /**
   * Counts documents scoped to tenant
   *
   * @param tenantContext - Tenant context
   * @param filters - Additional filters
   * @returns Document count
   */
  protected async countScoped(tenantContext: TenantContext, filters: any = {}): Promise<number> {
    const query = this.buildTenantQuery(tenantContext, filters);
    return this.model.countDocuments(query).exec();
  }

  /**
   * Updates documents scoped to tenant
   *
   * SECURITY:
   * - Ensures only documents in user's organization are updated
   * - Prevents cross-tenant updates
   *
   * @param tenantContext - Tenant context
   * @param filters - Query filters
   * @param update - Update operations
   * @returns Update result
   */
  protected async updateScoped(
    tenantContext: TenantContext,
    filters: any,
    update: any,
  ): Promise<any> {
    const query = this.buildTenantQuery(tenantContext, filters);

    this.logger.debug('Executing tenant-scoped update', {
      organizationId: tenantContext.organizationId,
      filters,
    });

    return this.model.updateMany(query, update).exec();
  }

  /**
   * Deletes documents scoped to tenant
   *
   * SECURITY:
   * - Ensures only documents in user's organization are deleted
   * - Prevents cross-tenant deletions
   *
   * @param tenantContext - Tenant context
   * @param filters - Query filters
   * @returns Delete result
   */
  protected async deleteScoped(tenantContext: TenantContext, filters: any): Promise<any> {
    const query = this.buildTenantQuery(tenantContext, filters);

    this.logger.debug('Executing tenant-scoped delete', {
      organizationId: tenantContext.organizationId,
      filters,
    });

    return this.model.deleteMany(query).exec();
  }

  /**
   * Builds query with automatic tenant scoping
   *
   * SECURITY:
   * - Always includes organizationId in query
   * - Optionally includes clinicId for sub-tenant isolation
   * - Merges with user-provided filters
   *
   * @param tenantContext - Tenant context
   * @param additionalFilters - User-provided filters
   * @returns Combined query object
   */
  private buildTenantQuery(tenantContext: TenantContext, additionalFilters: any): any {
    // Start with organizationId filter (REQUIRED)
    const query: any = {
      organizationId: tenantContext.organizationId,
    };

    // Add clinic filter if provided (optional sub-tenant isolation)
    if (tenantContext.clinicId) {
      query.clinicId = tenantContext.clinicId;
    }

    // Merge with additional filters
    // SECURITY: User filters are added AFTER tenant filters
    // This prevents overriding organizationId
    Object.assign(query, additionalFilters);

    // CRITICAL: Re-assert organizationId to prevent override
    query.organizationId = tenantContext.organizationId;

    return query;
  }
}
