/**
 * Odontogram Controller
 *
 * REST API endpoints for odontogram (tooth charting) operations.
 * Implements FDI numbering system with comprehensive validation.
 *
 * Base path: /api/v1/clinical/patients/:patientId/odontogram
 *
 * CLINICAL SAFETY: All endpoints require authentication and proper permissions.
 * All modifications are logged for HIPAA compliance.
 *
 * @module odontogram/controller
 */

import {
  Controller,
  Get,
  Put,
  Post,
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
import { OdontogramService } from './odontogram.service';
import {
  AddConditionDto,
  UpdateToothDto,
  RemoveConditionDto,
  GetToothHistoryQueryDto,
  BulkUpdateTeethDto,
  OdontogramResponseDto,
  ToothResponseDto,
  ToothHistoryResponseDto,
} from './dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';
import { ALL_TEETH } from './entities/odontogram.schema';

@ApiTags('Clinical - Odontogram')
@ApiBearerAuth()
@Controller('clinical/patients/:patientId/odontogram')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class OdontogramController {
  constructor(private readonly odontogramService: OdontogramService) {}

  /**
   * Get patient's complete odontogram (tooth chart)
   *
   * Returns the complete tooth chart for a patient, including all teeth
   * and their conditions. Creates a new odontogram if one doesn't exist.
   */
  @Get()
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'Get patient odontogram',
    description:
      'Retrieves the complete tooth chart for a patient. Creates a new odontogram with all permanent teeth if one does not exist.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Odontogram retrieved successfully',
    type: OdontogramResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getOdontogram(@Param('patientId') patientId: string, @GetCurrentUser() user: CurrentUser) {
    return this.odontogramService.getPatientOdontogram(
      patientId,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      user.userId,
    );
  }

  /**
   * Update a specific tooth's properties
   *
   * Updates tooth-level properties like mobility, furcation, presence status.
   * Does NOT update conditions - use POST/DELETE conditions endpoints for that.
   */
  @Put('teeth/:toothNumber')
  @RequirePermissions('clinical:write')
  @ApiOperation({
    summary: 'Update tooth status',
    description:
      'Updates tooth-level properties (mobility, furcation, presence, notes). Use the conditions endpoints to add/remove conditions.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiParam({
    name: 'toothNumber',
    description: 'FDI tooth number (e.g., 11, 16, 48, 55)',
    type: 'string',
    enum: ALL_TEETH as unknown as string[],
  })
  @ApiBody({ type: UpdateToothDto })
  @ApiResponse({
    status: 200,
    description: 'Tooth updated successfully',
    type: OdontogramResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid tooth number or input data' })
  @ApiResponse({ status: 404, description: 'Patient or tooth not found' })
  @ApiResponse({ status: 409, description: 'Concurrent modification conflict' })
  async updateTooth(
    @Param('patientId') patientId: string,
    @Param('toothNumber') toothNumber: string,
    @Body() updateDto: UpdateToothDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    return this.odontogramService.updateToothStatus(
      patientId,
      toothNumber,
      updateDto,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }

  /**
   * Add a condition to a specific tooth
   *
   * Adds a new condition (caries, filling, crown, etc.) to a tooth.
   * Multiple conditions can exist on the same tooth.
   */
  @Post('teeth/:toothNumber/conditions')
  @RequirePermissions('clinical:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add condition to tooth',
    description:
      'Adds a new condition to a tooth. Supports surface-specific conditions (e.g., caries on MO surfaces). Emits ToothStatusUpdated event for downstream systems.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiParam({
    name: 'toothNumber',
    description: 'FDI tooth number',
    type: 'string',
    enum: ALL_TEETH as unknown as string[],
  })
  @ApiBody({ type: AddConditionDto })
  @ApiResponse({
    status: 201,
    description: 'Condition added successfully',
    schema: {
      type: 'object',
      properties: {
        odontogram: { $ref: '#/components/schemas/OdontogramResponseDto' },
        conditionId: { type: 'string', description: 'ID of the newly created condition' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid tooth number, surface, or condition data' })
  @ApiResponse({ status: 404, description: 'Patient or tooth not found' })
  @ApiResponse({ status: 409, description: 'Concurrent modification conflict' })
  async addCondition(
    @Param('patientId') patientId: string,
    @Param('toothNumber') toothNumber: string,
    @Body() conditionDto: AddConditionDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    // Transform DTO to input type with defaults
    const conditionInput = {
      condition: conditionDto.condition,
      surfaces: conditionDto.surfaces ?? [],
      severity: conditionDto.severity,
      material: conditionDto.material,
      notes: conditionDto.notes,
      procedureId: conditionDto.procedureId,
      cdtCode: conditionDto.cdtCode,
      recordedAt: conditionDto.recordedAt,
    };

    return this.odontogramService.addToothCondition(
      patientId,
      toothNumber,
      conditionInput,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }

  /**
   * Remove (soft delete) a condition from a tooth
   *
   * Soft-deletes a condition. The condition remains in the database
   * for audit trail purposes but is marked as deleted.
   */
  @Delete('teeth/:toothNumber/conditions/:conditionId')
  @RequirePermissions('clinical:write')
  @ApiOperation({
    summary: 'Remove condition from tooth',
    description:
      'Soft-deletes a condition from a tooth. Requires a reason for audit compliance. The condition is marked as deleted but retained for HIPAA compliance.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiParam({
    name: 'toothNumber',
    description: 'FDI tooth number',
    type: 'string',
    enum: ALL_TEETH as unknown as string[],
  })
  @ApiParam({
    name: 'conditionId',
    description: 'Condition unique identifier',
    type: 'string',
  })
  @ApiBody({ type: RemoveConditionDto })
  @ApiResponse({
    status: 200,
    description: 'Condition removed successfully',
    type: OdontogramResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters or missing reason' })
  @ApiResponse({ status: 404, description: 'Patient, tooth, or condition not found' })
  @ApiResponse({ status: 409, description: 'Condition already removed or concurrent modification' })
  async removeCondition(
    @Param('patientId') patientId: string,
    @Param('toothNumber') toothNumber: string,
    @Param('conditionId') conditionId: string,
    @Body() removeDto: RemoveConditionDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    return this.odontogramService.removeToothCondition(
      patientId,
      toothNumber,
      conditionId,
      removeDto,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }

  /**
   * Get history of changes for a specific tooth
   *
   * Returns paginated audit trail of all changes to a tooth,
   * including conditions added, removed, and tooth status updates.
   */
  @Get('teeth/:toothNumber/history')
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'Get tooth change history',
    description:
      'Returns paginated audit trail of all changes to a specific tooth. Supports date range filtering for compliance queries.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiParam({
    name: 'toothNumber',
    description: 'FDI tooth number',
    type: 'string',
    enum: ALL_TEETH as unknown as string[],
  })
  @ApiResponse({
    status: 200,
    description: 'History retrieved successfully',
    type: ToothHistoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid tooth number or query parameters' })
  async getToothHistory(
    @Param('patientId') patientId: string,
    @Param('toothNumber') toothNumber: string,
    @Query() query: GetToothHistoryQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.odontogramService.getToothHistory(
      patientId,
      toothNumber,
      {
        limit: query.limit ?? 50,
        offset: query.offset ?? 0,
        startDate: query.startDate,
        endDate: query.endDate,
      },
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
    );
  }

  /**
   * Bulk update multiple teeth at once
   *
   * Allows updating multiple teeth in a single request.
   * Useful for initial charting or comprehensive exams.
   */
  @Put('bulk')
  @RequirePermissions('clinical:write')
  @ApiOperation({
    summary: 'Bulk update teeth',
    description:
      'Updates multiple teeth in a single request. Each tooth update is validated and recorded separately. Useful for initial charting or comprehensive updates.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiBody({ type: BulkUpdateTeethDto })
  @ApiResponse({
    status: 200,
    description: 'Teeth updated successfully',
    type: OdontogramResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 409, description: 'Concurrent modification conflict' })
  async bulkUpdateTeeth(
    @Param('patientId') patientId: string,
    @Body() bulkDto: BulkUpdateTeethDto,
    @GetCurrentUser() user: CurrentUser,
    @Req() req: Request,
  ) {
    // Transform DTO to input type with defaults for conditions
    const bulkInput = {
      teeth: bulkDto.teeth.map((tooth) => ({
        toothNumber: tooth.toothNumber,
        isPresent: tooth.isPresent,
        isPrimary: tooth.isPrimary,
        isSupernumerary: tooth.isSupernumerary,
        isImplant: tooth.isImplant,
        mobility: tooth.mobility,
        furcation: tooth.furcation,
        notes: tooth.notes,
        conditions: tooth.conditions?.map((c) => ({
          condition: c.condition,
          surfaces: c.surfaces ?? [],
          severity: c.severity,
          material: c.material,
          notes: c.notes,
          procedureId: c.procedureId,
          cdtCode: c.cdtCode,
          recordedAt: c.recordedAt,
        })),
      })),
    };

    return this.odontogramService.bulkUpdateTeeth(
      patientId,
      bulkInput,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      {
        userId: user.userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    );
  }

  /**
   * Get a specific tooth's details
   *
   * Returns detailed information about a single tooth including
   * all active conditions and metadata.
   */
  @Get('teeth/:toothNumber')
  @RequirePermissions('clinical:read')
  @ApiOperation({
    summary: 'Get single tooth details',
    description:
      'Returns detailed information about a specific tooth including all conditions (active and deleted).',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    type: 'string',
  })
  @ApiParam({
    name: 'toothNumber',
    description: 'FDI tooth number',
    type: 'string',
    enum: ALL_TEETH as unknown as string[],
  })
  @ApiResponse({
    status: 200,
    description: 'Tooth details retrieved successfully',
    type: ToothResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid tooth number' })
  @ApiResponse({ status: 404, description: 'Patient or tooth not found' })
  async getTooth(
    @Param('patientId') patientId: string,
    @Param('toothNumber') toothNumber: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    const odontogram = await this.odontogramService.getPatientOdontogram(
      patientId,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      user.userId,
    );

    const tooth = odontogram.teeth.get(toothNumber);
    if (!tooth) {
      return {
        toothNumber,
        isPresent: false,
        isPrimary: false,
        isSupernumerary: false,
        isImplant: false,
        conditions: [],
        message: `Tooth ${toothNumber} is not initialized in this odontogram`,
      };
    }

    return tooth;
  }
}
