/**
 * Cabinet Controller
 *
 * REST API endpoints for Cabinet management.
 * All endpoints require JWT authentication and enforce tenant isolation.
 *
 * Endpoints:
 * - POST   /cabinets           - Create new cabinet
 * - GET    /cabinets           - List all cabinets (with filters)
 * - GET    /cabinets/:id       - Get cabinet by ID
 * - GET    /cabinets/default   - Get default cabinet
 * - PATCH  /cabinets/:id       - Update cabinet
 * - DELETE /cabinets/:id       - Delete cabinet (soft delete)
 * - PATCH  /cabinets/:id/status - Update cabinet status
 * - POST   /cabinets/:id/set-default - Set cabinet as default
 *
 * Authorization:
 * - All endpoints require JWT authentication
 * - Tenant context automatically injected from JWT
 * - Permission checks can be added via @RequirePermissions decorator
 *
 * @module modules/cabinets/controllers
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { CabinetService } from '../services/cabinet.service';
import { Cabinet } from '../entities/cabinet.entity';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import {
  CreateCabinetSchema,
  UpdateCabinetSchema,
  FindCabinetsQuerySchema,
  type CreateCabinetDto,
  type UpdateCabinetDto,
  type FindCabinetsQueryDto,
} from '../dto';

/**
 * Cabinet controller
 *
 * Provides REST API for cabinet management with:
 * - JWT authentication (via @UseGuards)
 * - Tenant isolation (via @TenantContext decorator)
 * - Input validation (via Zod schemas)
 * - Structured error responses
 */
@Controller('cabinets')
// @UseGuards(JwtAuthGuard) // Uncomment when JWT guard is available
export class CabinetController {
  private readonly logger = new Logger(CabinetController.name);

  constructor(private readonly cabinetService: CabinetService) {}

  /**
   * Create new cabinet
   *
   * POST /cabinets
   *
   * Authorization: Requires JWT authentication
   * Permissions: TBD - likely requires 'cabinets:create' or 'organization:admin' role
   *
   * @param dto - Cabinet creation data (validated by Zod)
   * @param tenantContext - Tenant context from JWT (injected automatically)
   * @returns Created cabinet
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateCabinetSchema))
  // @RequirePermissions('cabinets:create') // Uncomment when RBAC is integrated
  async create(
    @Body() dto: CreateCabinetDto,
    // @TenantContext() tenantContext: CurrentTenant, // Uncomment when decorator is available
  ): Promise<Cabinet> {
    // TEMPORARY: Mock tenant context for development
    // Replace with actual tenant context from decorator
    const organizationId = 'temp-org-id' as OrganizationId;
    const userId = 'temp-user-id' as UUID;

    this.logger.log(`Creating cabinet for organization: ${organizationId}`);

    return this.cabinetService.create(dto, organizationId, userId);
  }

  /**
   * Find all cabinets with optional filters
   *
   * GET /cabinets?status=ACTIVE&ownerId=uuid
   *
   * Query parameters:
   * - status: Filter by EntityStatus (ACTIVE, INACTIVE, ARCHIVED, PENDING)
   * - ownerId: Filter by owner UUID
   * - isDefault: Filter default cabinet (true/false)
   * - search: Search by name (partial match, case-insensitive)
   *
   * Headers:
   * - X-Organization-Id: Organization UUID (required for service-to-service calls)
   *
   * @param query - Query filters (validated by Zod)
   * @param organizationIdHeader - Organization ID from header
   * @returns Array of cabinets
   */
  @Get()
  @UsePipes(new ZodValidationPipe(FindCabinetsQuerySchema))
  async findAll(
    @Query() query: FindCabinetsQueryDto,
    @Headers('x-organization-id') organizationIdHeader?: string,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<Cabinet[]> {
    // Extract organizationId from header (service-to-service) or tenant context (user auth)
    const organizationId = (organizationIdHeader || 'temp-org-id') as OrganizationId;

    if (!organizationId || organizationId === 'temp-org-id') {
      this.logger.warn('No organization ID provided in header or context');
    }

    this.logger.log(`Finding cabinets for organization: ${organizationId}`, { query });

    return this.cabinetService.findAll(organizationId, query);
  }

  /**
   * Get default cabinet for organization
   *
   * GET /cabinets/default
   *
   * NOTE: This route must be defined BEFORE /:id route to avoid conflicts
   *
   * Headers:
   * - X-Organization-Id: Organization UUID (required for service-to-service calls)
   *
   * @param organizationIdHeader - Organization ID from header
   * @returns Default cabinet
   * @throws {NotFoundError} If no default cabinet exists
   */
  @Get('default')
  async findDefault(
    @Headers('x-organization-id') organizationIdHeader?: string,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<Cabinet> {
    // Extract organizationId from header (service-to-service) or tenant context (user auth)
    const organizationId = (organizationIdHeader || 'temp-org-id') as OrganizationId;

    if (!organizationId || organizationId === 'temp-org-id') {
      this.logger.warn('No organization ID provided in header or context');
    }

    this.logger.log(`Finding default cabinet for organization: ${organizationId}`);

    return this.cabinetService.findDefault(organizationId);
  }

  /**
   * Get cabinet by ID
   *
   * GET /cabinets/:id
   *
   * Headers:
   * - X-Organization-Id: Organization UUID (required for service-to-service calls)
   *
   * @param id - Cabinet UUID
   * @param organizationIdHeader - Organization ID from header
   * @returns Cabinet
   * @throws {NotFoundError} If cabinet not found or belongs to different organization
   */
  @Get(':id')
  async findById(
    @Param('id') id: UUID,
    @Headers('x-organization-id') organizationIdHeader?: string,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<Cabinet> {
    // Extract organizationId from header (service-to-service) or tenant context (user auth)
    const organizationId = (organizationIdHeader || 'temp-org-id') as OrganizationId;

    if (!organizationId || organizationId === 'temp-org-id') {
      this.logger.warn('No organization ID provided in header or context');
    }

    this.logger.log(`Finding cabinet ${id} for organization: ${organizationId}`);

    return this.cabinetService.findById(id, organizationId);
  }

  /**
   * Update cabinet
   *
   * PATCH /cabinets/:id
   *
   * Supports partial updates - only provided fields are updated.
   *
   * @param id - Cabinet UUID
   * @param dto - Update data (validated by Zod)
   * @param tenantContext - Tenant context from JWT
   * @returns Updated cabinet
   * @throws {NotFoundError} If cabinet not found
   * @throws {ConflictError} If code conflict
   * @throws {ValidationError} If business rule violation
   */
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateCabinetSchema))
  // @RequirePermissions('cabinets:update')
  async update(
    @Param('id') id: UUID,
    @Body() dto: UpdateCabinetDto,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<Cabinet> {
    // TEMPORARY: Mock tenant context
    const organizationId = 'temp-org-id' as OrganizationId;

    this.logger.log(`Updating cabinet ${id} for organization: ${organizationId}`);

    return this.cabinetService.update(id, dto, organizationId);
  }

  /**
   * Delete cabinet (soft delete)
   *
   * DELETE /cabinets/:id
   *
   * Business rules:
   * - Cannot delete default cabinet without reassigning default first
   * - Sets deletedAt timestamp (soft delete)
   *
   * @param id - Cabinet UUID
   * @param tenantContext - Tenant context from JWT
   * @throws {NotFoundError} If cabinet not found
   * @throws {ValidationError} If trying to delete default cabinet
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @RequirePermissions('cabinets:delete')
  async delete(
    @Param('id') id: UUID,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<void> {
    // TEMPORARY: Mock tenant context
    const organizationId = 'temp-org-id' as OrganizationId;

    this.logger.log(`Deleting cabinet ${id} for organization: ${organizationId}`);

    await this.cabinetService.delete(id, organizationId);
  }

  /**
   * Update cabinet status
   *
   * PATCH /cabinets/:id/status
   *
   * Business rules:
   * - Cannot deactivate default cabinet without reassigning default
   *
   * @param id - Cabinet UUID
   * @param status - New status
   * @param tenantContext - Tenant context from JWT
   * @throws {NotFoundError} If cabinet not found
   * @throws {ValidationError} If status transition invalid
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  // @RequirePermissions('cabinets:update')
  async updateStatus(
    @Param('id') id: UUID,
    @Body('status') status: EntityStatus,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<{ message: string }> {
    // TEMPORARY: Mock tenant context
    const organizationId = 'temp-org-id' as OrganizationId;

    this.logger.log(`Updating cabinet ${id} status to ${status}`);

    await this.cabinetService.updateStatus(id, status, organizationId);

    return { message: 'Cabinet status updated successfully' };
  }

  /**
   * Set cabinet as default
   *
   * POST /cabinets/:id/set-default
   *
   * Business rule:
   * - Automatically unsets existing default cabinet
   * - Only one default cabinet per organization
   *
   * @param id - Cabinet UUID
   * @param tenantContext - Tenant context from JWT
   * @returns Updated cabinet
   * @throws {NotFoundError} If cabinet not found
   */
  @Post(':id/set-default')
  @HttpCode(HttpStatus.OK)
  // @RequirePermissions('cabinets:update')
  async setDefault(
    @Param('id') id: UUID,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<Cabinet> {
    // TEMPORARY: Mock tenant context
    const organizationId = 'temp-org-id' as OrganizationId;

    this.logger.log(`Setting cabinet ${id} as default for organization: ${organizationId}`);

    return this.cabinetService.setDefault(id, organizationId);
  }

  /**
   * Get cabinet count
   *
   * GET /cabinets/count?status=ACTIVE
   *
   * Query parameters:
   * - status: Optional status filter
   *
   * @param status - Optional status filter
   * @param tenantContext - Tenant context from JWT
   * @returns Count object
   */
  @Get('stats/count')
  async count(
    @Query('status') status?: EntityStatus,
    // @TenantContext() tenantContext: CurrentTenant,
  ): Promise<{ count: number }> {
    // TEMPORARY: Mock tenant context
    const organizationId = 'temp-org-id' as OrganizationId;

    this.logger.log(`Counting cabinets for organization: ${organizationId}`);

    const count = await this.cabinetService.count(organizationId, status);

    return { count };
  }
}
