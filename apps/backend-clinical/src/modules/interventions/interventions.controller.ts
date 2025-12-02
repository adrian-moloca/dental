/**
 * Clinical Interventions Controller
 *
 * REST API endpoints for clinical intervention operations.
 * Implements quick clinical actions for rapid documentation during appointments.
 *
 * Base paths:
 * - /api/v1/clinical/patients/:patientId/interventions (patient-scoped)
 * - /api/v1/clinical/interventions (direct access by ID)
 * - /api/v1/clinical/appointments/:appointmentId/interventions (appointment-scoped)
 *
 * CLINICAL SAFETY: All endpoints require authentication and proper permissions.
 * All modifications are logged for HIPAA compliance.
 *
 * @module interventions/controller
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { InterventionsService } from './interventions.service';
import {
  CreateInterventionDto,
  QuickInterventionDto,
  UpdateInterventionDto,
  CancelInterventionDto,
  DeleteInterventionDto,
  BatchCreateInterventionsDto,
  ListInterventionsQueryDto,
  InterventionResponseDto,
  PaginatedInterventionsResponseDto,
  InterventionTypesResponseDto,
} from './dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

// ============================================================================
// PATIENT-SCOPED CONTROLLER
// ============================================================================

@ApiTags('Clinical - Interventions')
@ApiBearerAuth()
@Controller('clinical/patients/:patientId/interventions')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class PatientInterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  /**
   * Create a new clinical intervention for a patient
   */
  @Post()
  @RequirePermissions('clinical:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create intervention',
    description:
      'Creates a new clinical intervention for a patient. Used for quick procedures that do not require full SOAP notes.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: CreateInterventionDto })
  @ApiResponse({
    status: 201,
    description: 'Intervention created successfully',
    type: InterventionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createIntervention(
    @Param('patientId') patientId: string,
    @Body() createDto: CreateInterventionDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    const result = await this.interventionsService.createIntervention(
      patientId,
      createDto as any,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        userName: user.email, // Would be full name in real implementation
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );

    return {
      intervention: result.intervention,
      odontogramConditionId: result.odontogramConditionId,
    };
  }

  /**
   * Create a quick intervention with minimal data
   */
  @Post('quick')
  @RequirePermissions('clinical:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create quick intervention',
    description:
      'Creates a quick intervention with minimal data. Auto-fills provider from context, performedAt = now, and status = completed. Ideal for rapid documentation during appointments.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiBody({ type: QuickInterventionDto })
  @ApiResponse({
    status: 201,
    description: 'Quick intervention created successfully',
    type: InterventionResponseDto,
  })
  async createQuickIntervention(
    @Param('patientId') patientId: string,
    @Body() quickDto: QuickInterventionDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    const result = await this.interventionsService.createQuickIntervention(
      patientId,
      quickDto as any,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        userName: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );

    return {
      intervention: result.intervention,
      odontogramConditionId: result.odontogramConditionId,
    };
  }

  /**
   * List interventions for a patient
   */
  @Get()
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'List patient interventions',
    description: 'Lists all interventions for a patient with pagination and filtering options.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Interventions retrieved successfully',
    type: PaginatedInterventionsResponseDto,
  })
  async listPatientInterventions(
    @Param('patientId') patientId: string,
    @Query() query: ListInterventionsQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.interventionsService.listPatientInterventions(patientId, query as any, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
    });
  }
}

// ============================================================================
// DIRECT ACCESS CONTROLLER (by intervention ID)
// ============================================================================

@ApiTags('Clinical - Interventions')
@ApiBearerAuth()
@Controller('clinical/interventions')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  /**
   * Get intervention types metadata
   */
  @Get('types')
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'Get intervention types',
    description:
      'Returns all available intervention types with their labels and default CDT codes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Intervention types retrieved successfully',
    type: InterventionTypesResponseDto,
  })
  getInterventionTypes() {
    return {
      types: this.interventionsService.getInterventionTypes(),
    };
  }

  /**
   * Get an intervention by ID
   */
  @Get(':id')
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'Get intervention by ID',
    description: 'Retrieves a specific intervention by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Intervention unique identifier',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Intervention retrieved successfully',
    type: InterventionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Intervention not found' })
  async getIntervention(@Param('id') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.interventionsService.getIntervention(id, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
    });
  }

  /**
   * Update an intervention
   */
  @Patch(':id')
  @RequirePermissions('clinical:write')
  @ApiOperation({
    summary: 'Update intervention',
    description: 'Updates an existing intervention. Requires version for optimistic locking.',
  })
  @ApiParam({
    name: 'id',
    description: 'Intervention unique identifier',
    type: 'string',
  })
  @ApiBody({ type: UpdateInterventionDto })
  @ApiResponse({
    status: 200,
    description: 'Intervention updated successfully',
    type: InterventionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or no changes' })
  @ApiResponse({ status: 404, description: 'Intervention not found' })
  @ApiResponse({ status: 409, description: 'Concurrent modification conflict' })
  async updateIntervention(
    @Param('id') id: string,
    @Body() updateDto: UpdateInterventionDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    return this.interventionsService.updateIntervention(
      id,
      updateDto as any,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        userName: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }

  /**
   * Cancel an intervention
   */
  @Post(':id/cancel')
  @RequirePermissions('clinical:write')
  @ApiOperation({
    summary: 'Cancel intervention',
    description:
      'Cancels an intervention. Requires a reason for audit trail. If intervention was billed, billing reversal may be needed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Intervention unique identifier',
    type: 'string',
  })
  @ApiBody({ type: CancelInterventionDto })
  @ApiResponse({
    status: 200,
    description: 'Intervention cancelled successfully',
    type: InterventionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Missing cancellation reason' })
  @ApiResponse({ status: 404, description: 'Intervention not found' })
  @ApiResponse({ status: 409, description: 'Already cancelled or concurrent modification' })
  async cancelIntervention(
    @Param('id') id: string,
    @Body() cancelDto: CancelInterventionDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    return this.interventionsService.cancelIntervention(
      id,
      cancelDto as any,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        userName: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }

  /**
   * Delete (soft) an intervention
   */
  @Delete(':id')
  @RequirePermissions('clinical:write')
  @ApiOperation({
    summary: 'Delete intervention',
    description:
      'Soft-deletes an intervention. The record is preserved for audit compliance but marked as deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Intervention unique identifier',
    type: 'string',
  })
  @ApiBody({ type: DeleteInterventionDto })
  @ApiResponse({
    status: 200,
    description: 'Intervention deleted successfully',
    type: InterventionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Missing deletion reason' })
  @ApiResponse({ status: 404, description: 'Intervention not found' })
  @ApiResponse({ status: 409, description: 'Already deleted or concurrent modification' })
  async deleteIntervention(
    @Param('id') id: string,
    @Body() deleteDto: DeleteInterventionDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    return this.interventionsService.deleteIntervention(
      id,
      deleteDto as any,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        userName: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }
}

// ============================================================================
// APPOINTMENT-SCOPED CONTROLLER
// ============================================================================

@ApiTags('Clinical - Interventions')
@ApiBearerAuth()
@Controller('clinical/appointments/:appointmentId/interventions')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class AppointmentInterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  /**
   * Get all interventions for an appointment
   */
  @Get()
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'Get appointment interventions',
    description: 'Lists all interventions performed during a specific appointment.',
  })
  @ApiParam({
    name: 'appointmentId',
    description: 'Appointment unique identifier',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Interventions retrieved successfully',
    type: [InterventionResponseDto],
  })
  async getAppointmentInterventions(
    @Param('appointmentId') appointmentId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.interventionsService.getAppointmentInterventions(appointmentId, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
    });
  }

  /**
   * Create multiple interventions for an appointment (batch)
   */
  @Post('batch')
  @RequirePermissions('clinical:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Batch create interventions',
    description:
      'Creates multiple interventions for an appointment in a single request. Useful for recording multiple quick procedures.',
  })
  @ApiParam({
    name: 'appointmentId',
    description: 'Appointment unique identifier',
    type: 'string',
  })
  @ApiBody({ type: BatchCreateInterventionsDto })
  @ApiResponse({
    status: 201,
    description: 'Interventions created successfully',
    type: [InterventionResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createBatchInterventions(
    @Param('appointmentId') appointmentId: string,
    @Body() batchDto: BatchCreateInterventionsDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    return this.interventionsService.createBatchInterventions(
      appointmentId,
      batchDto as any,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        userName: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }
}

// ============================================================================
// TOOTH-SPECIFIC CONTROLLER
// ============================================================================

@ApiTags('Clinical - Interventions')
@ApiBearerAuth()
@Controller('clinical/patients/:patientId/teeth/:toothNumber/interventions')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ToothInterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  /**
   * Get interventions for a specific tooth
   */
  @Get()
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'Get tooth interventions',
    description:
      'Lists all interventions that involved a specific tooth. Useful for tooth history and treatment planning.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiParam({
    name: 'toothNumber',
    description: 'FDI tooth number (e.g., 11, 16, 48)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Interventions retrieved successfully',
    type: PaginatedInterventionsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid tooth number' })
  async getToothInterventions(
    @Param('patientId') patientId: string,
    @Param('toothNumber') toothNumber: string,
    @Query() query: ListInterventionsQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.interventionsService.getToothInterventions(patientId, toothNumber, query as any, {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId!,
    });
  }
}
