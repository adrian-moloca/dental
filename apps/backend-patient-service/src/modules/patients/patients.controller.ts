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
import {
  CreatePatientDto,
  UpdatePatientDto,
  SearchPatientDto,
  MergePatientsDto,
  CreateAllergyDto,
  UpdateAllergyDto,
  CreateMedicalConditionDto,
  UpdateMedicalConditionDto,
  CreateMedicationDto,
  UpdateMedicationDto,
  CreatePatientFlagDto,
  UpdatePatientFlagDto,
  UpdateMedicalAlertsDto,
  CreateInsurancePolicyDto,
  UpdateInsurancePolicyDto,
  VerifyInsuranceDto,
} from './dto';
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

  // ============================================================================
  // PATIENT 360 VIEW
  // ============================================================================

  /**
   * Get complete Patient360 view
   *
   * GET /patients/:id/360
   */
  @Get(':id/360')
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Get comprehensive Patient360 view with all related data' })
  @ApiResponse({ status: 200, description: 'Patient360 view returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatient360(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Fetching Patient360 for ${id}`);

    const patient360 = await this.patientsService.getPatient360(id as any, user.organizationId);

    return {
      success: true,
      data: patient360,
    };
  }

  // ============================================================================
  // MEDICAL ALERTS ENDPOINTS
  // ============================================================================

  /**
   * Get medical alerts for a patient
   *
   * GET /patients/:id/medical-alerts
   */
  @Get(':id/medical-alerts')
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Get patient medical alerts' })
  @ApiResponse({ status: 200, description: 'Medical alerts returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getMedicalAlerts(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Fetching medical alerts for patient ${id}`);

    const medicalAlerts = await this.patientsService.getMedicalAlerts(
      id as any,
      user.organizationId,
    );

    return {
      success: true,
      data: medicalAlerts,
    };
  }

  /**
   * Update all medical alerts at once
   *
   * PUT /patients/:id/medical-alerts
   */
  @Patch(':id/medical-alerts')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Update patient medical alerts' })
  @ApiResponse({ status: 200, description: 'Medical alerts updated' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updateMedicalAlerts(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalAlertsDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating medical alerts for patient ${id}`);

    const patient = await this.patientsService.updateMedicalAlerts(
      id as any,
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts,
      message: 'Medical alerts updated successfully',
    };
  }

  // ============================================================================
  // ALLERGY ENDPOINTS
  // ============================================================================

  /**
   * Add a new allergy
   *
   * POST /patients/:id/allergies
   */
  @Post(':id/allergies')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new allergy to patient record' })
  @ApiResponse({ status: 201, description: 'Allergy added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async addAllergy(
    @Param('id') id: string,
    @Body() dto: CreateAllergyDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Adding allergy to patient ${id}: ${dto.allergen}`);

    const patient = await this.patientsService.addAllergy(
      id as any,
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.allergies,
      message: 'Allergy added successfully',
    };
  }

  /**
   * Update an allergy
   *
   * PATCH /patients/:id/allergies/:index
   */
  @Patch(':id/allergies/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Update an existing allergy' })
  @ApiResponse({ status: 200, description: 'Allergy updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updateAllergy(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() dto: UpdateAllergyDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating allergy ${index} for patient ${id}`);

    const patient = await this.patientsService.updateAllergy(
      id as any,
      parseInt(index, 10),
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.allergies,
      message: 'Allergy updated successfully',
    };
  }

  /**
   * Remove an allergy (soft delete)
   *
   * DELETE /patients/:id/allergies/:index
   */
  @Delete(':id/allergies/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Remove an allergy (soft delete)' })
  @ApiResponse({ status: 200, description: 'Allergy removed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async removeAllergy(
    @Param('id') id: string,
    @Param('index') index: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Removing allergy ${index} for patient ${id}`);

    await this.patientsService.removeAllergy(
      id as any,
      parseInt(index, 10),
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      message: 'Allergy removed successfully',
    };
  }

  // ============================================================================
  // MEDICAL CONDITION ENDPOINTS
  // ============================================================================

  /**
   * Add a new medical condition
   *
   * POST /patients/:id/conditions
   */
  @Post(':id/conditions')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new medical condition with ICD-10 code' })
  @ApiResponse({ status: 201, description: 'Condition added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async addCondition(
    @Param('id') id: string,
    @Body() dto: CreateMedicalConditionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Adding condition to patient ${id}: ${dto.name}`);

    const patient = await this.patientsService.addMedicalCondition(
      id as any,
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.conditions,
      message: 'Condition added successfully',
    };
  }

  /**
   * Update a medical condition
   *
   * PATCH /patients/:id/conditions/:index
   */
  @Patch(':id/conditions/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Update an existing medical condition' })
  @ApiResponse({ status: 200, description: 'Condition updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updateCondition(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() dto: UpdateMedicalConditionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating condition ${index} for patient ${id}`);

    const patient = await this.patientsService.updateMedicalCondition(
      id as any,
      parseInt(index, 10),
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.conditions,
      message: 'Condition updated successfully',
    };
  }

  // ============================================================================
  // MEDICATION ENDPOINTS
  // ============================================================================

  /**
   * Add a new medication
   *
   * POST /patients/:id/medications
   */
  @Post(':id/medications')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new medication to patient record' })
  @ApiResponse({ status: 201, description: 'Medication added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async addMedication(
    @Param('id') id: string,
    @Body() dto: CreateMedicationDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Adding medication to patient ${id}: ${dto.name}`);

    const patient = await this.patientsService.addMedication(
      id as any,
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.medications,
      message: 'Medication added successfully',
    };
  }

  /**
   * Update a medication
   *
   * PATCH /patients/:id/medications/:index
   */
  @Patch(':id/medications/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Update an existing medication' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updateMedication(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() dto: UpdateMedicationDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating medication ${index} for patient ${id}`);

    const patient = await this.patientsService.updateMedication(
      id as any,
      parseInt(index, 10),
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.medications,
      message: 'Medication updated successfully',
    };
  }

  // ============================================================================
  // PATIENT FLAG ENDPOINTS
  // ============================================================================

  /**
   * Add a new patient flag
   *
   * POST /patients/:id/flags
   */
  @Post(':id/flags')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new flag to patient record' })
  @ApiResponse({ status: 201, description: 'Flag added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async addFlag(
    @Param('id') id: string,
    @Body() dto: CreatePatientFlagDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Adding flag to patient ${id}: ${dto.type}`);

    const patient = await this.patientsService.addPatientFlag(
      id as any,
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.flags,
      message: 'Flag added successfully',
    };
  }

  /**
   * Update a patient flag
   *
   * PATCH /patients/:id/flags/:index
   */
  @Patch(':id/flags/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Update an existing patient flag' })
  @ApiResponse({ status: 200, description: 'Flag updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updateFlag(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() dto: UpdatePatientFlagDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating flag ${index} for patient ${id}`);

    const patient = await this.patientsService.updatePatientFlag(
      id as any,
      parseInt(index, 10),
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.medicalAlerts?.flags,
      message: 'Flag updated successfully',
    };
  }

  /**
   * Remove a patient flag (soft delete)
   *
   * DELETE /patients/:id/flags/:index
   */
  @Delete(':id/flags/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Remove a patient flag (soft delete)' })
  @ApiResponse({ status: 200, description: 'Flag removed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async removeFlag(
    @Param('id') id: string,
    @Param('index') index: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Removing flag ${index} for patient ${id}`);

    await this.patientsService.removePatientFlag(
      id as any,
      parseInt(index, 10),
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      message: 'Flag removed successfully',
    };
  }

  // ============================================================================
  // INSURANCE POLICY ENDPOINTS
  // ============================================================================

  /**
   * Get all insurance policies
   *
   * GET /patients/:id/insurance
   */
  @Get(':id/insurance')
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Get patient insurance policies' })
  @ApiResponse({ status: 200, description: 'Insurance policies returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getInsurance(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Fetching insurance for patient ${id}`);

    const policies = await this.patientsService.getInsurancePolicies(
      id as any,
      user.organizationId,
    );

    const primaryPolicy = policies.find((p) => p.isPrimary && p.isActive) || null;

    return {
      success: true,
      data: {
        policies,
        primaryPolicy,
        hasCoverage: policies.some((p) => p.isActive),
      },
    };
  }

  /**
   * Add a new insurance policy
   *
   * POST /patients/:id/insurance
   */
  @Post(':id/insurance')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new insurance policy' })
  @ApiResponse({ status: 201, description: 'Insurance policy added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async addInsurance(
    @Param('id') id: string,
    @Body() dto: CreateInsurancePolicyDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Adding insurance policy to patient ${id}`);

    const patient = await this.patientsService.addInsurancePolicy(
      id as any,
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.insurancePolicies,
      message: 'Insurance policy added successfully',
    };
  }

  /**
   * Update an insurance policy
   *
   * PATCH /patients/:id/insurance/:index
   */
  @Patch(':id/insurance/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Update an existing insurance policy' })
  @ApiResponse({ status: 200, description: 'Insurance policy updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updateInsurance(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() dto: UpdateInsurancePolicyDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating insurance policy ${index} for patient ${id}`);

    const patient = await this.patientsService.updateInsurancePolicy(
      id as any,
      parseInt(index, 10),
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.insurancePolicies,
      message: 'Insurance policy updated successfully',
    };
  }

  /**
   * Remove an insurance policy (soft delete)
   *
   * DELETE /patients/:id/insurance/:index
   */
  @Delete(':id/insurance/:index')
  @RequirePermissions('patients:write')
  @ApiOperation({ summary: 'Remove an insurance policy (soft delete)' })
  @ApiResponse({ status: 200, description: 'Insurance policy removed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async removeInsurance(
    @Param('id') id: string,
    @Param('index') index: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Removing insurance policy ${index} for patient ${id}`);

    await this.patientsService.removeInsurancePolicy(
      id as any,
      parseInt(index, 10),
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      message: 'Insurance policy removed successfully',
    };
  }

  /**
   * Verify insurance eligibility
   *
   * POST /patients/:id/insurance/verify
   */
  @Post(':id/insurance/verify')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify insurance eligibility and update coverage details' })
  @ApiResponse({ status: 200, description: 'Insurance verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async verifyInsurance(
    @Param('id') id: string,
    @Body() dto: VerifyInsuranceDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Verifying insurance ${dto.policyIndex} for patient ${id}`);

    const patient = await this.patientsService.verifyInsurance(
      id as any,
      dto,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: patient.insurancePolicies,
      message: 'Insurance verified successfully',
    };
  }
}
