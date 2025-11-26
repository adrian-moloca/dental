import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProcedureTemplateService } from '../services/procedure-template.service';
import {
  CreateProcedureTemplateDto,
  UpdateProcedureTemplateDto,
  QueryProcedureTemplatesDto,
  ProcedureTemplateResponseDto,
  ProcedureMaterialsResponseDto,
} from '../dto/procedure-template.dto';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { TenantIsolationGuard } from '../../../guards/tenant-isolation.guard';
import { TenantContext, TenantContextData } from '../../../decorators/tenant-context.decorator';

/**
 * ProcedureTemplateController
 *
 * Manages procedure-to-material mappings for automatic stock deduction.
 * These templates define which inventory items are consumed when
 * a dental procedure is completed.
 */
@ApiTags('Procedure Templates')
@ApiBearerAuth()
@Controller('procedure-templates')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ProcedureTemplateController {
  constructor(private readonly procedureTemplateService: ProcedureTemplateService) {}

  /**
   * Create a new procedure template
   */
  @Post()
  @ApiOperation({ summary: 'Create a procedure template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Template already exists' })
  async create(
    @TenantContext() ctx: TenantContextData,
    @Body() dto: CreateProcedureTemplateDto,
  ): Promise<ProcedureTemplateResponseDto> {
    return this.procedureTemplateService.create(dto, ctx.tenantId, ctx.organizationId, ctx.userId);
  }

  /**
   * Get a procedure template by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get procedure template by ID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findById(
    @TenantContext() ctx: TenantContextData,
    @Param('id') id: string,
  ): Promise<ProcedureTemplateResponseDto> {
    return this.procedureTemplateService.findById(id, ctx.tenantId);
  }

  /**
   * List procedure templates with filters
   */
  @Get()
  @ApiOperation({ summary: 'List procedure templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(
    @TenantContext() ctx: TenantContextData,
    @Query() query: QueryProcedureTemplatesDto,
  ): Promise<{ data: ProcedureTemplateResponseDto[]; total: number }> {
    return this.procedureTemplateService.findAll(ctx.tenantId, query);
  }

  /**
   * Get materials for a specific procedure code
   * Resolves clinic-specific templates when clinicId is provided
   */
  @Get('lookup/:procedureCode')
  @ApiOperation({ summary: 'Get materials for a procedure code' })
  @ApiResponse({ status: 200, description: 'Materials found' })
  @ApiResponse({ status: 404, description: 'No template found for procedure' })
  async getMaterialsForProcedure(
    @TenantContext() ctx: TenantContextData,
    @Param('procedureCode') procedureCode: string,
    @Query('clinicId') clinicId?: string,
    @Query('quantity') quantity?: number,
  ): Promise<ProcedureMaterialsResponseDto | null> {
    return this.procedureTemplateService.getMaterialsForProcedure(
      procedureCode,
      ctx.tenantId,
      clinicId || ctx.clinicId,
      quantity || 1,
    );
  }

  /**
   * Update a procedure template
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a procedure template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @TenantContext() ctx: TenantContextData,
    @Param('id') id: string,
    @Body() dto: UpdateProcedureTemplateDto,
  ): Promise<ProcedureTemplateResponseDto> {
    return this.procedureTemplateService.update(id, dto, ctx.tenantId, ctx.userId);
  }

  /**
   * Delete a procedure template (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a procedure template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async delete(@TenantContext() ctx: TenantContextData, @Param('id') id: string): Promise<void> {
    await this.procedureTemplateService.delete(id, ctx.tenantId, ctx.userId);
  }

  /**
   * Bulk create/update procedure templates
   * Useful for seeding common dental procedures
   */
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create/update procedure templates' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed' })
  async bulkUpsert(
    @TenantContext() ctx: TenantContextData,
    @Body() templates: CreateProcedureTemplateDto[],
  ): Promise<{ created: number; updated: number }> {
    return this.procedureTemplateService.bulkUpsert(
      templates,
      ctx.tenantId,
      ctx.organizationId,
      ctx.userId,
    );
  }
}
