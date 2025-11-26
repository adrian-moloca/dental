/**
 * GDPR Controller
 *
 * REST API endpoints for GDPR compliance operations.
 * Handles data subject requests: Access, Erasure, Portability.
 *
 * @module modules/gdpr
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GdprService } from './gdpr.service';
import { JwtAuthGuard, TenantIsolationGuard, PermissionsGuard, RequirePermissions } from '../../guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';
import {
  CreateAccessRequestDto,
  CreateErasureRequestDto,
  CreatePortabilityRequestDto,
  ProcessGdprRequestDto,
  QueryGdprRequestsDto,
} from './dto';

/**
 * GDPR Controller
 *
 * Provides REST endpoints for:
 * - Creating GDPR requests (access, erasure, portability)
 * - Listing patient GDPR requests
 * - Processing GDPR requests (admin)
 * - Listing all GDPR requests (admin)
 */
@ApiTags('gdpr')
@ApiBearerAuth()
@Controller('gdpr')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class GdprController {
  private readonly logger = new Logger(GdprController.name);

  constructor(private readonly gdprService: GdprService) {}

  /**
   * Create GDPR Access Request (Right to Access)
   *
   * POST /gdpr/patients/:patientId/access-request
   */
  @Post('patients/:patientId/access-request')
  @RequirePermissions('patients:read')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create GDPR access request (Right to Access)' })
  @ApiResponse({ status: 201, description: 'Access request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 409, description: 'A pending request already exists' })
  async createAccessRequest(
    @Param('patientId') patientId: string,
    @Body() dto: CreateAccessRequestDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Creating access request for patient ${patientId}`);

    const request = await this.gdprService.createAccessRequest(
      patientId as any,
      user.tenantContext.organizationId,
      dto,
      user.userId,
    );

    return {
      success: true,
      data: request,
      message: 'Access request created successfully',
    };
  }

  /**
   * Create GDPR Erasure Request (Right to be Forgotten)
   *
   * POST /gdpr/patients/:patientId/erasure-request
   */
  @Post('patients/:patientId/erasure-request')
  @RequirePermissions('patients:delete')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create GDPR erasure request (Right to be Forgotten)' })
  @ApiResponse({ status: 201, description: 'Erasure request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 409, description: 'A pending request already exists' })
  async createErasureRequest(
    @Param('patientId') patientId: string,
    @Body() dto: CreateErasureRequestDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Creating erasure request for patient ${patientId}`);

    const request = await this.gdprService.createErasureRequest(
      patientId as any,
      user.tenantContext.organizationId,
      dto,
      user.userId,
    );

    return {
      success: true,
      data: request,
      message: 'Erasure request created successfully',
    };
  }

  /**
   * Create GDPR Portability Request (Right to Data Portability)
   *
   * POST /gdpr/patients/:patientId/portability-request
   */
  @Post('patients/:patientId/portability-request')
  @RequirePermissions('patients:read')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create GDPR portability request (Right to Data Portability)' })
  @ApiResponse({ status: 201, description: 'Portability request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async createPortabilityRequest(
    @Param('patientId') patientId: string,
    @Body() dto: CreatePortabilityRequestDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Creating portability request for patient ${patientId}`);

    const request = await this.gdprService.createPortabilityRequest(
      patientId as any,
      user.tenantContext.organizationId,
      dto,
      user.userId,
    );

    return {
      success: true,
      data: request,
      message: 'Portability request created successfully',
    };
  }

  /**
   * Get GDPR requests for a specific patient
   *
   * GET /gdpr/patients/:patientId/requests
   */
  @Get('patients/:patientId/requests')
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Get all GDPR requests for a patient' })
  @ApiResponse({ status: 200, description: 'Requests retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientRequests(
    @Param('patientId') patientId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Fetching GDPR requests for patient ${patientId}`);

    const requests = await this.gdprService.getPatientRequests(
      patientId as any,
      user.tenantContext.organizationId,
    );

    return {
      success: true,
      data: requests,
      count: requests.length,
    };
  }

  /**
   * Get a specific GDPR request by ID
   *
   * GET /gdpr/requests/:requestId
   */
  @Get('requests/:requestId')
  @RequirePermissions('patients:read')
  @ApiOperation({ summary: 'Get a specific GDPR request by ID' })
  @ApiResponse({ status: 200, description: 'Request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async getRequest(@Param('requestId') requestId: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Fetching GDPR request ${requestId}`);

    const request = await this.gdprService.getRequest(
      requestId as any,
      user.tenantContext.organizationId,
    );

    return {
      success: true,
      data: request,
    };
  }

  /**
   * List all GDPR requests (admin view)
   *
   * GET /gdpr/requests
   */
  @Get('requests')
  @RequirePermissions('gdpr:admin')
  @ApiOperation({ summary: 'List all GDPR requests with filters (admin)' })
  @ApiResponse({ status: 200, description: 'Requests retrieved successfully' })
  async listRequests(@Query() query: QueryGdprRequestsDto, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Listing GDPR requests for tenant ${user.tenantContext.organizationId}`);

    const result = await this.gdprService.listRequests(
      user.tenantContext.organizationId,
      query,
    );

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
   * Process a GDPR request (approve or reject)
   *
   * POST /gdpr/requests/:requestId/process
   */
  @Post('requests/:requestId/process')
  @RequirePermissions('gdpr:admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a GDPR request (approve or reject) - admin only' })
  @ApiResponse({ status: 200, description: 'Request processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid action or request status' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async processRequest(
    @Param('requestId') requestId: string,
    @Body() dto: ProcessGdprRequestDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Processing GDPR request ${requestId}: ${dto.action}`);

    const request = await this.gdprService.processRequest(
      requestId as any,
      user.tenantContext.organizationId,
      dto,
      user.userId,
    );

    return {
      success: true,
      data: request,
      message: `Request ${dto.action === 'approve' ? 'approved and processed' : 'rejected'} successfully`,
    };
  }

  /**
   * Export patient data (legacy endpoint - backward compatibility)
   *
   * GET /gdpr/patients/:patientId/export
   *
   * @deprecated Use POST /gdpr/patients/:patientId/access-request instead
   */
  @Get('patients/:patientId/export')
  @RequirePermissions('patients:export')
  @ApiOperation({
    summary: 'Export patient data (legacy)',
    deprecated: true,
    description: 'Use POST /gdpr/patients/:patientId/access-request instead',
  })
  @ApiResponse({ status: 200, description: 'Data exported successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async exportData(@Param('patientId') patientId: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Exporting data for patient ${patientId} (legacy endpoint)`);

    const data = await this.gdprService.exportPatientData(
      patientId as any,
      user.tenantContext.organizationId,
    );

    return {
      success: true,
      data,
    };
  }

  /**
   * Anonymize patient (legacy endpoint - backward compatibility)
   *
   * DELETE /gdpr/patients/:patientId/anonymize
   *
   * @deprecated Use POST /gdpr/patients/:patientId/erasure-request instead
   */
  @Delete('patients/:patientId/anonymize')
  @RequirePermissions('patients:export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Anonymize patient (legacy)',
    deprecated: true,
    description: 'Use POST /gdpr/patients/:patientId/erasure-request instead',
  })
  @ApiResponse({ status: 200, description: 'Patient anonymized successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async anonymize(@Param('patientId') patientId: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log(`Anonymizing patient ${patientId} (legacy endpoint)`);

    await this.gdprService.anonymizePatient(
      patientId as any,
      user.tenantContext.organizationId,
      user.tenantContext.organizationId,
      user.userId,
    );

    return {
      success: true,
      message: 'Patient data anonymized',
    };
  }
}
