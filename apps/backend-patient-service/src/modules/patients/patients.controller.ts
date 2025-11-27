/**
 * Patients Controller
 *
 * REST API endpoints for patient management.
 * All endpoints enforce JWT authentication and tenant isolation.
 *
 * @module modules/patients
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
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, SearchPatientDto, MergePatientsDto } from './dto';
import {
  JwtAuthGuard,
  TenantIsolationGuard,
  PermissionsGuard,
  RequirePermissions,
} from '../../guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';

/**
 * Patients Controller
 *
 * Provides REST endpoints for:
 * - Creating patients
 * - Reading patient information
 * - Updating patients
 * - Searching and filtering
 * - Soft deleting patients
 * - Merging duplicates
 */
@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(private readonly patientsService: PatientsService) {}

  /**
   * Create a new patient
   *
   * POST /patients
   */
  @Post()
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - patient already exists' })
  async create(@Body() createPatientDto: CreatePatientDto, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Creating patient for user ${user.userId}`);

    const patient = await this.patientsService.create(
      createPatientDto,
      user.organizationId,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient,
      message: 'Patient created successfully',
    };
  }

  /**
   * Get patient by ID
   *
   * GET /patients/:id
   */
  @Get(':id')
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Fetching patient ${id} for user ${user.userId}`);

    const patient = await this.patientsService.findById(id as any, user.organizationId);

    return {
      success: true,
      data: patient,
    };
  }

  /**
   * Update patient
   *
   * PATCH /patients/:id
   */
  @Patch(':id')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Update patient information' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating patient ${id} for user ${user.userId}`);

    const patient = await this.patientsService.update(
      id as any,
      updatePatientDto,
      user.organizationId,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient,
      message: 'Patient updated successfully',
    };
  }

  /**
   * Search patients
   *
   * GET /patients
   */
  @Get()
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Search and filter patients' })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async search(@Query() searchDto: SearchPatientDto, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Searching patients for user ${user.userId}`);

    const result = await this.patientsService.search(searchDto, user.organizationId);

    return {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
    };
  }

  /**
   * Soft delete patient
   *
   * DELETE /patients/:id
   */
  @Delete(':id')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a patient' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async softDelete(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Soft deleting patient ${id} for user ${user.userId}`);

    await this.patientsService.softDelete(
      id as any,
      user.organizationId,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      message: 'Patient deleted successfully',
    };
  }

  /**
   * Find duplicate patients
   *
   * GET /patients/duplicates
   */
  @Get('duplicates/search')
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Find potential duplicate patient records' })
  @ApiResponse({ status: 200, description: 'Duplicate groups returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findDuplicates(@CurrentUser() user: ICurrentUser) {
    this.logger.log(`Finding duplicates for user ${user.userId}`);

    const duplicates = await this.patientsService.findDuplicates(user.organizationId);

    return {
      success: true,
      data: duplicates,
      count: duplicates.length,
    };
  }

  /**
   * Merge two patient records
   *
   * POST /patients/merge
   */
  @Post('merge')
  @RequirePermissions('patients:merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge duplicate patient records' })
  @ApiResponse({ status: 200, description: 'Patients merged successfully' })
  @ApiResponse({ status: 400, description: 'Invalid merge request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'One or both patients not found' })
  async merge(@Body() mergeDto: MergePatientsDto, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Merging patients ${mergeDto.duplicateId} -> ${mergeDto.masterId}`);

    const patient = await this.patientsService.merge(
      mergeDto,
      user.organizationId,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient,
      message: 'Patients merged successfully',
    };
  }
}
