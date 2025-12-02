/**
 * Treatment Plans Controller
 *
 * REST API endpoints for treatment plan management.
 * All endpoints are scoped under patients to enforce the correct access pattern.
 *
 * Route structure:
 * - /api/v1/clinical/patients/:patientId/treatment-plans - Patient's plans
 * - /api/v1/clinical/treatment-plans/:planId/* - Plan-specific operations
 *
 * @module treatment-plans/controller
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
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
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
import { TreatmentPlansService } from './treatment-plans.service';
import { AuditContext } from './treatment-plans.repository';
import {
  CreateTreatmentPlanDtoClass,
  UpdateTreatmentPlanDtoClass,
  PresentTreatmentPlanDtoClass,
  AcceptTreatmentPlanDtoClass,
  CompleteProcedureItemDtoClass,
  CancelTreatmentPlanDtoClass,
  TreatmentPlanQueryDtoClass,
  DeclineTreatmentPlanDtoClass,
  AddPhaseDtoClass,
  AddItemToPhaseDtoClass,
  ScheduleItemDtoClass,
  ReviseTreatmentPlanDtoClass,
  AddAlternativeDtoClass,
  UpdateTreatmentPlanItemDtoClass,
  CreateTreatmentPlanDto,
  UpdateTreatmentPlanDto,
  PresentTreatmentPlanDto,
  AcceptTreatmentPlanDto,
  CompleteProcedureItemDto,
  CancelTreatmentPlanDto,
  TreatmentPlanQueryDto,
  DeclineTreatmentPlanDto,
  AddPhaseDto,
  AddItemToPhaseDto,
  ScheduleItemDto,
  ReviseTreatmentPlanDto,
  AddAlternativeDto,
  UpdateTreatmentPlanItemDto,
} from './dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@Controller()
@ApiTags('Clinical - Treatment Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class TreatmentPlansController {
  constructor(private readonly service: TreatmentPlansService) {}

  // ============================================================================
  // PATIENT-SCOPED ENDPOINTS
  // ============================================================================

  /**
   * Create a new treatment plan for a patient
   */
  @Post('clinical/patients/:patientId/treatment-plans')
  @RequirePermissions('clinical:treatment-plans:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create treatment plan',
    description: 'Create a new treatment plan for a patient. Plan starts in draft status.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiResponse({ status: 201, description: 'Treatment plan created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body(new ValidationPipe({ transform: true })) dto: CreateTreatmentPlanDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.createTreatmentPlan(
      patientId,
      dto as unknown as CreateTreatmentPlanDto,
      auditContext,
    );
  }

  /**
   * List all treatment plans for a patient
   */
  @Get('clinical/patients/:patientId/treatment-plans')
  @RequirePermissions('clinical:treatment-plans:read')
  @ApiOperation({
    summary: 'List treatment plans',
    description: 'Get all treatment plans for a patient with optional filtering and pagination.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'Treatment plans retrieved successfully' })
  async findAll(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query(new ValidationPipe({ transform: true })) query: TreatmentPlanQueryDtoClass,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.getByPatient(
      patientId,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      query as unknown as TreatmentPlanQueryDto,
    );
  }

  /**
   * Get patient's current active treatment plan
   */
  @Get('clinical/patients/:patientId/treatment-plans/active')
  @RequirePermissions('clinical:treatment-plans:read')
  @ApiOperation({
    summary: 'Get active treatment plan',
    description: 'Get the current in-progress treatment plan for a patient.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiResponse({ status: 200, description: 'Active plan retrieved or null if none' })
  async getActivePlan(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.getActivePlan(patientId, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
    });
  }

  /**
   * Get a specific treatment plan
   */
  @Get('clinical/patients/:patientId/treatment-plans/:planId')
  @RequirePermissions('clinical:treatment-plans:read')
  @ApiOperation({
    summary: 'Get treatment plan',
    description: 'Get a specific treatment plan by ID.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async findOne(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.getById(planId, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
    });
  }

  /**
   * Update a treatment plan (draft status only)
   */
  @Put('clinical/patients/:patientId/treatment-plans/:planId')
  @RequirePermissions('clinical:treatment-plans:update')
  @ApiOperation({
    summary: 'Update treatment plan',
    description: 'Update a treatment plan. Only plans in draft status can be modified.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment plan updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Plan cannot be modified (not in draft status)' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  @ApiResponse({ status: 409, description: 'Optimistic locking conflict' })
  async update(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateTreatmentPlanDtoClass,
    @Headers('x-expected-version') expectedVersionHeader: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const expectedVersion = parseInt(expectedVersionHeader, 10) || 1;

    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.updateTreatmentPlan(
      planId,
      dto as unknown as UpdateTreatmentPlanDto,
      expectedVersion,
      auditContext,
    );
  }

  // ============================================================================
  // STATUS TRANSITION ENDPOINTS
  // ============================================================================

  /**
   * Present treatment plan to patient
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/present')
  @RequirePermissions('clinical:treatment-plans:present')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Present treatment plan',
    description:
      'Present a treatment plan to the patient. Transitions from draft to presented status.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment plan presented successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition or empty plan' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async present(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: PresentTreatmentPlanDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.presentTreatmentPlan(
      planId,
      dto as unknown as PresentTreatmentPlanDto,
      auditContext,
    );
  }

  /**
   * Patient accepts treatment plan
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/accept')
  @RequirePermissions('clinical:treatment-plans:accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept treatment plan',
    description:
      'Record patient acceptance of a treatment plan. Requires signature/consent information.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment plan accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition or plan expired' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async accept(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: AcceptTreatmentPlanDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Augment DTO with request metadata if not provided
    const acceptDto = dto as unknown as AcceptTreatmentPlanDto;
    if (!acceptDto.ipAddress) {
      acceptDto.ipAddress = ipAddress;
    }
    if (!acceptDto.userAgent) {
      acceptDto.userAgent = userAgent;
    }

    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.acceptTreatmentPlan(planId, acceptDto, auditContext);
  }

  /**
   * Start treatment (explicit transition to in_progress)
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/start')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start treatment',
    description:
      'Explicitly start treatment execution. Transitions from accepted to in_progress status.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async start(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.startTreatment(planId, auditContext);
  }

  /**
   * Complete a procedure item
   *
   * CRITICAL: This endpoint triggers billing and inventory events.
   */
  @Post(
    'clinical/patients/:patientId/treatment-plans/:planId/phases/:phaseId/items/:itemId/complete',
  )
  @RequirePermissions('clinical:procedures:complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete procedure item',
    description:
      'Mark a procedure item as completed. Triggers billing invoice creation and inventory deduction.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiParam({ name: 'phaseId', description: 'Phase ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Procedure completed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Item cannot be completed (wrong status, sequence violation)',
  })
  @ApiResponse({ status: 404, description: 'Plan, phase, or item not found' })
  @ApiResponse({ status: 409, description: 'Procedure already completed' })
  async completeItem(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Param('phaseId') phaseId: string,
    @Param('itemId') itemId: string,
    @Body(new ValidationPipe({ transform: true })) dto: CompleteProcedureItemDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.completeProcedureItem(
      planId,
      phaseId,
      itemId,
      dto as unknown as CompleteProcedureItemDto,
      auditContext,
    );
  }

  /**
   * Cancel a treatment plan
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/cancel')
  @RequirePermissions('clinical:treatment-plans:cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel treatment plan',
    description: 'Cancel a treatment plan. Requires a reason for audit purposes.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment plan cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Plan cannot be cancelled (already terminal)' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async cancel(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: CancelTreatmentPlanDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.cancelTreatmentPlan(
      planId,
      dto as unknown as CancelTreatmentPlanDto,
      auditContext,
    );
  }

  /**
   * Delete a treatment plan (soft delete)
   */
  @Delete('clinical/patients/:patientId/treatment-plans/:planId')
  @RequirePermissions('clinical:treatment-plans:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete treatment plan',
    description: 'Soft delete a treatment plan. Only draft or cancelled plans can be deleted.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment plan deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Plan cannot be deleted (active status)',
  })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async delete(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body() body: { reason: string },
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.deleteTreatmentPlan(planId, body.reason, auditContext);
  }

  // ============================================================================
  // HISTORY & ANALYTICS ENDPOINTS
  // ============================================================================

  /**
   * Get treatment plan history
   */
  @Get('clinical/patients/:patientId/treatment-plans/:planId/history')
  @RequirePermissions('clinical:treatment-plans:read')
  @ApiOperation({
    summary: 'Get treatment plan history',
    description: 'Get the audit history for a treatment plan.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of entries (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async getHistory(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @GetCurrentUser() user?: CurrentUser,
  ) {
    return this.service.getHistory(
      planId,
      {
        tenantId: user!.tenantId,
        organizationId: user!.organizationId,
        clinicId: user!.clinicId!,
      },
      {
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      },
    );
  }

  /**
   * Recalculate financials
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/recalculate')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recalculate financials',
    description: 'Recalculate treatment plan totals from items. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Financials recalculated successfully' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async recalculateFinancials(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.recalculateFinancials(planId, auditContext);
  }

  // ============================================================================
  // DECLINE / REVISE ENDPOINTS
  // ============================================================================

  /**
   * Patient declines treatment plan
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/decline')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Decline treatment plan',
    description:
      'Record patient declining a treatment plan. Optionally request an alternative plan.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 200, description: 'Treatment plan declined successfully' })
  @ApiResponse({ status: 400, description: 'Plan is not in presented status' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async decline(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: DeclineTreatmentPlanDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.declineTreatmentPlan(
      planId,
      dto as unknown as DeclineTreatmentPlanDto,
      auditContext,
    );
  }

  /**
   * Create revision of a treatment plan
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/revise')
  @RequirePermissions('clinical:treatment-plans:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Revise treatment plan',
    description:
      'Create a new treatment plan based on an existing one. Used after patient declines.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Original treatment plan UUID' })
  @ApiResponse({ status: 201, description: 'Revision created successfully' })
  @ApiResponse({ status: 400, description: 'Plan is not in presented or cancelled status' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async revise(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: ReviseTreatmentPlanDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.reviseTreatmentPlan(
      planId,
      dto as unknown as ReviseTreatmentPlanDto,
      auditContext,
    );
  }

  // ============================================================================
  // PHASE MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Add a phase to a treatment plan
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/phases')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add phase',
    description: 'Add a new phase to a treatment plan. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 201, description: 'Phase added successfully' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async addPhase(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: AddPhaseDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.addPhase(planId, dto as unknown as AddPhaseDto, auditContext);
  }

  /**
   * Remove a phase from a treatment plan
   */
  @Delete('clinical/patients/:patientId/treatment-plans/:planId/phases/:phaseId')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove phase',
    description: 'Remove a phase from a treatment plan. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiParam({ name: 'phaseId', description: 'Phase ID' })
  @ApiResponse({ status: 200, description: 'Phase removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove last phase' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Plan or phase not found' })
  async removePhase(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Param('phaseId') phaseId: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.removePhase(planId, phaseId, auditContext);
  }

  // ============================================================================
  // ITEM MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Add an item to a phase
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/phases/:phaseId/items')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to phase',
    description: 'Add a procedure item to a phase. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiParam({ name: 'phaseId', description: 'Phase ID' })
  @ApiResponse({ status: 201, description: 'Item added successfully' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Plan or phase not found' })
  async addItem(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Param('phaseId') phaseId: string,
    @Body(new ValidationPipe({ transform: true })) dto: AddItemToPhaseDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.addItemToPhase(
      planId,
      phaseId,
      dto as unknown as AddItemToPhaseDto,
      auditContext,
    );
  }

  /**
   * Update an item in a phase
   */
  @Put('clinical/patients/:patientId/treatment-plans/:planId/phases/:phaseId/items/:itemId')
  @RequirePermissions('clinical:treatment-plans:update')
  @ApiOperation({
    summary: 'Update item',
    description: 'Update a procedure item in a phase. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiParam({ name: 'phaseId', description: 'Phase ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Plan, phase, or item not found' })
  async updateItem(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Param('phaseId') phaseId: string,
    @Param('itemId') itemId: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateTreatmentPlanItemDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.updateItem(
      planId,
      phaseId,
      itemId,
      dto as unknown as UpdateTreatmentPlanItemDto,
      auditContext,
    );
  }

  /**
   * Remove an item from a phase
   */
  @Delete('clinical/patients/:patientId/treatment-plans/:planId/phases/:phaseId/items/:itemId')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item',
    description: 'Remove a procedure item from a phase. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiParam({ name: 'phaseId', description: 'Phase ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove last item from last phase' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Plan, phase, or item not found' })
  async removeItem(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Param('phaseId') phaseId: string,
    @Param('itemId') itemId: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.removeItem(planId, phaseId, itemId, auditContext);
  }

  /**
   * Schedule an item as an appointment
   */
  @Post(
    'clinical/patients/:patientId/treatment-plans/:planId/phases/:phaseId/items/:itemId/schedule',
  )
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Schedule item',
    description:
      'Schedule a procedure item as an appointment. Only for accepted/in_progress plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiParam({ name: 'phaseId', description: 'Phase ID' })
  @ApiParam({ name: 'itemId', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Item cannot be scheduled (wrong status)' })
  @ApiResponse({ status: 404, description: 'Plan, phase, or item not found' })
  async scheduleItem(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Param('phaseId') phaseId: string,
    @Param('itemId') itemId: string,
    @Body(new ValidationPipe({ transform: true })) dto: ScheduleItemDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.scheduleItem(
      planId,
      phaseId,
      itemId,
      dto as unknown as ScheduleItemDto,
      auditContext,
    );
  }

  // ============================================================================
  // ALTERNATIVES MANAGEMENT ENDPOINTS
  // ============================================================================

  /**
   * Add an alternative to a treatment plan
   */
  @Post('clinical/patients/:patientId/treatment-plans/:planId/alternatives')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add alternative',
    description: 'Add an alternative treatment option to a plan. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiResponse({ status: 201, description: 'Alternative added successfully' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Treatment plan not found' })
  async addAlternative(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Body(new ValidationPipe({ transform: true })) dto: AddAlternativeDtoClass,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.addAlternative(planId, dto as unknown as AddAlternativeDto, auditContext);
  }

  /**
   * Remove an alternative from a treatment plan
   */
  @Delete('clinical/patients/:patientId/treatment-plans/:planId/alternatives/:altId')
  @RequirePermissions('clinical:treatment-plans:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove alternative',
    description: 'Remove an alternative from a treatment plan. Only for draft plans.',
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'planId', description: 'Treatment plan UUID' })
  @ApiParam({ name: 'altId', description: 'Alternative ID' })
  @ApiResponse({ status: 200, description: 'Alternative removed successfully' })
  @ApiResponse({ status: 403, description: 'Plan is not in draft status' })
  @ApiResponse({ status: 404, description: 'Plan or alternative not found' })
  async removeAlternative(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('planId') planId: string,
    @Param('altId') altId: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const auditContext: AuditContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
      userId: user.userId,
      ipAddress,
      userAgent,
    };

    return this.service.removeAlternative(planId, altId, auditContext);
  }

  // ============================================================================
  // CLINIC-LEVEL ENDPOINTS (DASHBOARD)
  // ============================================================================

  /**
   * Get treatment plan counts by status (for dashboard)
   */
  @Get('clinical/treatment-plans/stats/by-status')
  @RequirePermissions('clinical:treatment-plans:read')
  @ApiOperation({
    summary: 'Get plan counts by status',
    description: 'Get count of treatment plans grouped by status for clinic dashboard.',
  })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStatusCounts(@GetCurrentUser() user: CurrentUser) {
    return this.service.getStatusCounts({
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
    });
  }
}
