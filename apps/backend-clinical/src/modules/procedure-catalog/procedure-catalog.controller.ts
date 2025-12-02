/**
 * Procedure Catalog Controller
 *
 * REST API endpoints for procedure catalog management.
 * Provides CRUD operations for dental procedure definitions.
 *
 * Route structure:
 * - /api/v1/clinical/procedure-catalog - Catalog operations
 *
 * @module procedure-catalog/controller
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProcedureCatalogService } from './procedure-catalog.service';
import { AuditContext } from './procedure-catalog.repository';
import {
  CreateProcedureCatalogDtoClass,
  UpdateProcedureCatalogDtoClass,
  ProcedureCatalogQueryDtoClass,
  BulkImportProcedureDtoClass,
  CreateProcedureCatalogDto,
  UpdateProcedureCatalogDto,
  ProcedureCatalogQueryDto,
} from './dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';
import { ProcedureCategory } from './entities/procedure-catalog.schema';

@Controller('clinical/procedure-catalog')
@ApiTags('Clinical - Procedure Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ProcedureCatalogController {
  constructor(private readonly service: ProcedureCatalogService) {}

  // ============================================================================
  // CRUD ENDPOINTS
  // ============================================================================

  /**
   * Create a new procedure catalog entry
   */
  @Post()
  @RequirePermissions('clinical:procedure-catalog:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create procedure catalog entry',
    description:
      'Create a new dental procedure in the catalog. Requires procedure code, name, category, and pricing.',
  })
  @ApiResponse({ status: 201, description: 'Procedure created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Procedure code already exists' })
  async create(
    @Body(new ValidationPipe({ transform: true })) dto: CreateProcedureCatalogDtoClass,
    @GetCurrentUser() user: CurrentUser,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      userId: user.userId,
    };

    return this.service.create(dto as unknown as CreateProcedureCatalogDto, auditContext);
  }

  /**
   * List all procedures with search and filtering
   */
  @Get()
  @RequirePermissions('clinical:procedure-catalog:read')
  @ApiOperation({
    summary: 'List procedures',
    description:
      'Get all procedures in the catalog with optional search, filtering, and pagination.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by code, name, or description',
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 50, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'Procedures retrieved successfully' })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: ProcedureCatalogQueryDtoClass,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.find(
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId,
      },
      query as unknown as ProcedureCatalogQueryDto,
    );
  }

  /**
   * Get procedure counts by category (for dashboard)
   */
  @Get('stats/by-category')
  @RequirePermissions('clinical:procedure-catalog:read')
  @ApiOperation({
    summary: 'Get category counts',
    description: 'Get count of procedures grouped by category.',
  })
  @ApiResponse({ status: 200, description: 'Category counts retrieved successfully' })
  async getCategoryCounts(@GetCurrentUser() user: CurrentUser) {
    return this.service.getCategoryCounts({
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }

  /**
   * Get all procedures by category
   */
  @Get('category/:category')
  @RequirePermissions('clinical:procedure-catalog:read')
  @ApiOperation({
    summary: 'Get procedures by category',
    description: 'Get all active procedures in a specific category.',
  })
  @ApiParam({ name: 'category', description: 'Procedure category' })
  @ApiResponse({ status: 200, description: 'Procedures retrieved successfully' })
  async getByCategory(
    @Param('category') category: ProcedureCategory,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.getByCategory(category, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }

  /**
   * Get a procedure by code
   */
  @Get('code/:code')
  @RequirePermissions('clinical:procedure-catalog:read')
  @ApiOperation({
    summary: 'Get procedure by code',
    description: 'Get a specific procedure by its CDT code.',
  })
  @ApiParam({ name: 'code', description: 'Procedure code (e.g., D2391)' })
  @ApiResponse({ status: 200, description: 'Procedure retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Procedure not found' })
  async getByCode(@Param('code') code: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.getByCode(code, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }

  /**
   * Get a procedure by ID
   */
  @Get(':id')
  @RequirePermissions('clinical:procedure-catalog:read')
  @ApiOperation({
    summary: 'Get procedure by ID',
    description: 'Get a specific procedure by its MongoDB ID.',
  })
  @ApiParam({ name: 'id', description: 'Procedure ID' })
  @ApiResponse({ status: 200, description: 'Procedure retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Procedure not found' })
  async findOne(@Param('id') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.getById(id, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }

  /**
   * Update a procedure catalog entry
   */
  @Put(':id')
  @RequirePermissions('clinical:procedure-catalog:update')
  @ApiOperation({
    summary: 'Update procedure',
    description: 'Update a procedure catalog entry. Code cannot be changed after creation.',
  })
  @ApiParam({ name: 'id', description: 'Procedure ID' })
  @ApiResponse({ status: 200, description: 'Procedure updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Procedure not found' })
  @ApiResponse({ status: 409, description: 'Optimistic locking conflict' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateProcedureCatalogDtoClass,
    @Headers('x-expected-version') expectedVersionHeader: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    const expectedVersion = parseInt(expectedVersionHeader, 10) || 1;

    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      userId: user.userId,
    };

    return this.service.update(
      id,
      dto as unknown as UpdateProcedureCatalogDto,
      expectedVersion,
      auditContext,
    );
  }

  /**
   * Delete a procedure catalog entry (soft delete)
   */
  @Delete(':id')
  @RequirePermissions('clinical:procedure-catalog:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete procedure',
    description:
      'Soft delete a procedure catalog entry. Existing treatment plans retain the procedure data.',
  })
  @ApiParam({ name: 'id', description: 'Procedure ID' })
  @ApiResponse({ status: 200, description: 'Procedure deleted successfully' })
  @ApiResponse({ status: 404, description: 'Procedure not found' })
  async delete(@Param('id') id: string, @GetCurrentUser() user: CurrentUser) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      userId: user.userId,
    };

    return this.service.delete(id, auditContext);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk import procedures
   */
  @Post('bulk-import')
  @RequirePermissions('clinical:procedure-catalog:create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk import procedures',
    description: 'Import multiple procedures at once. Optionally update existing procedures.',
  })
  @ApiResponse({ status: 200, description: 'Import completed' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async bulkImport(
    @Body(new ValidationPipe({ transform: true })) dto: BulkImportProcedureDtoClass,
    @GetCurrentUser() user: CurrentUser,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      userId: user.userId,
    };

    return this.service.bulkImport(dto.procedures, dto.updateExisting, auditContext);
  }

  // ============================================================================
  // VALIDATION ENDPOINTS
  // ============================================================================

  /**
   * Validate procedure codes
   */
  @Post('validate-codes')
  @RequirePermissions('clinical:procedure-catalog:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate procedure codes',
    description: 'Check if all provided procedure codes exist in the catalog.',
  })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateCodes(@Body() body: { codes: string[] }, @GetCurrentUser() user: CurrentUser) {
    return this.service.validateProcedureCodes(body.codes, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }

  /**
   * Check for contraindicated procedure combinations
   */
  @Post('check-contraindications')
  @RequirePermissions('clinical:procedure-catalog:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check contraindications',
    description: 'Check if any procedure combinations are contraindicated.',
  })
  @ApiResponse({ status: 200, description: 'Contraindication check result' })
  async checkContraindications(
    @Body() body: { codes: string[] },
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.checkContraindications(body.codes, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }

  // ============================================================================
  // PRICING ENDPOINTS
  // ============================================================================

  /**
   * Calculate pricing for procedures
   */
  @Post('calculate-pricing')
  @RequirePermissions('clinical:procedure-catalog:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate pricing',
    description: 'Calculate pricing for one or more procedures including tax.',
  })
  @ApiResponse({ status: 200, description: 'Pricing calculation result' })
  async calculatePricing(
    @Body()
    body: {
      items: Array<{
        procedureCode: string;
        quantity: number;
        discountPercent?: number;
        discountCents?: number;
      }>;
    },
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.calculateMultiplePricing(body.items, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }
}
