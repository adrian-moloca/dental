import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  CreateScheduleDto,
  CreateScheduleSchema,
  UpdateScheduleDto,
  UpdateScheduleSchema,
  CreateAbsenceDto,
  CreateAbsenceSchema,
  CreateExceptionDto,
  CreateExceptionSchema,
  UpdateExceptionDto,
  UpdateExceptionSchema,
  ApproveAbsenceSchema,
  ApproveAbsenceDto,
  RejectAbsenceSchema,
  QueryAbsencesSchema,
  QueryAbsencesDto,
  GetAvailabilitySchema,
  GetAvailabilityDto,
  GetAvailabilityRangeSchema,
  GetAvailabilityRangeDto,
  ScheduleResponseDto,
  AbsenceResponseDto,
  ExceptionResponseDto,
  AvailabilityCheckResponse,
  AvailabilityRangeResponse,
  AbsenceListResponseDto,
} from './dto';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import { JwtAuthGuard, TenantIsolationGuard } from '../../guards';
import { TenantContext, TenantContextData } from '../../decorators/tenant-context.decorator';

/**
 * Provider Schedule Controller
 *
 * Handles HTTP requests for provider schedules, absences, exceptions, and availability.
 * All endpoints enforce multi-tenant isolation and require JWT authentication.
 *
 * SECURITY:
 * - JwtAuthGuard validates JWT tokens and populates request.user
 * - TenantIsolationGuard prevents cross-tenant data access
 * - TenantContext decorator extracts tenant info from authenticated user
 *
 * API GROUPS:
 * - Schedule CRUD: Create/Read/Update/Delete schedule templates
 * - Exception Management: Date-specific schedule overrides
 * - Absence Workflow: Request, approve, reject time off
 * - Availability: Query provider availability
 */
@ApiTags('provider-schedules')
@ApiBearerAuth()
@Controller('providers')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class SchedulesController {
  private readonly logger = new Logger(SchedulesController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  // ============================================================================
  // SCHEDULE TEMPLATE CRUD
  // ============================================================================

  /**
   * POST /providers/:id/schedule
   * Create a new schedule for a provider at a specific clinic
   */
  @Post(':id/schedule')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create provider schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid schedule data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Schedule already exists for this provider/clinic' })
  async createSchedule(
    @Param('id') providerId: string,
    @Body(new ZodValidationPipe(CreateScheduleSchema)) dto: CreateScheduleDto,
    @TenantContext() context: TenantContextData,
  ): Promise<ScheduleResponseDto> {
    this.logger.log(
      `POST /providers/${providerId}/schedule [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.createSchedule(
      providerId,
      context.tenantId,
      context.organizationId,
      dto,
    );
  }

  /**
   * GET /providers/:id/schedule
   * Get provider's schedule template with absences
   */
  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get provider schedule with absences' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiQuery({ name: 'clinicId', required: false, description: 'Filter by clinic' })
  async getSchedule(
    @Param('id') providerId: string,
    @Query('clinicId') clinicId: string | undefined,
    @TenantContext() context: TenantContextData,
  ): Promise<{ schedule: ScheduleResponseDto; absences: AbsenceResponseDto[] }> {
    this.logger.log(
      `GET /providers/${providerId}/schedule [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.getProviderSchedule(
      providerId,
      context.tenantId,
      context.organizationId,
      clinicId,
    );
  }

  /**
   * GET /providers/:id/schedules
   * Get all schedules for a provider across all clinics
   */
  @Get(':id/schedules')
  @ApiOperation({ summary: 'Get all schedules for a provider' })
  @ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSchedules(
    @Param('id') providerId: string,
    @TenantContext() context: TenantContextData,
  ): Promise<ScheduleResponseDto[]> {
    this.logger.log(
      `GET /providers/${providerId}/schedules [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.getProviderSchedules(
      providerId,
      context.tenantId,
      context.organizationId,
    );
  }

  /**
   * PUT /providers/:id/schedule/:clinicId
   * Update provider's schedule at a specific clinic
   */
  @Put(':id/schedule/:clinicId')
  @ApiOperation({ summary: 'Update provider schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid schedule data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async updateSchedule(
    @Param('id') providerId: string,
    @Param('clinicId') clinicId: string,
    @Body(new ZodValidationPipe(UpdateScheduleSchema)) dto: UpdateScheduleDto,
    @TenantContext() context: TenantContextData,
  ): Promise<ScheduleResponseDto> {
    this.logger.log(
      `PUT /providers/${providerId}/schedule/${clinicId} [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.updateProviderSchedule(
      providerId,
      context.tenantId,
      context.organizationId,
      clinicId,
      dto,
    );
  }

  /**
   * DELETE /providers/:id/schedule/:clinicId
   * Delete provider's schedule at a specific clinic
   */
  @Delete(':id/schedule/:clinicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete provider schedule' })
  @ApiResponse({ status: 204, description: 'Schedule deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async deleteSchedule(
    @Param('id') providerId: string,
    @Param('clinicId') clinicId: string,
    @TenantContext() context: TenantContextData,
  ): Promise<void> {
    this.logger.log(
      `DELETE /providers/${providerId}/schedule/${clinicId} [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    await this.schedulesService.deleteSchedule(
      providerId,
      context.tenantId,
      context.organizationId,
      clinicId,
    );
  }

  // ============================================================================
  // EXCEPTION MANAGEMENT
  // ============================================================================

  /**
   * POST /providers/:id/exceptions
   * Add a schedule exception (holiday, day off, custom hours)
   */
  @Post(':id/exceptions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create schedule exception' })
  @ApiResponse({ status: 201, description: 'Exception created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid exception data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Exception already exists for this date' })
  async createException(
    @Param('id') providerId: string,
    @Body(new ZodValidationPipe(CreateExceptionSchema)) dto: CreateExceptionDto,
    @TenantContext() context: TenantContextData,
  ): Promise<ExceptionResponseDto> {
    this.logger.log(
      `POST /providers/${providerId}/exceptions [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.createException(
      providerId,
      context.tenantId,
      context.organizationId,
      dto,
      context.userId,
    );
  }

  /**
   * GET /providers/:id/exceptions
   * Get schedule exceptions for a provider
   */
  @Get(':id/exceptions')
  @ApiOperation({ summary: 'Get schedule exceptions' })
  @ApiResponse({ status: 200, description: 'Exceptions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  @ApiQuery({ name: 'clinicId', required: false, description: 'Clinic filter' })
  async getExceptions(
    @Param('id') providerId: string,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Query('clinicId') clinicId: string | undefined,
    @TenantContext() context: TenantContextData,
  ): Promise<ExceptionResponseDto[]> {
    this.logger.log(
      `GET /providers/${providerId}/exceptions [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.getExceptions(
      providerId,
      context.tenantId,
      context.organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      clinicId,
    );
  }

  /**
   * PUT /providers/:id/exceptions/:exceptionId
   * Update a schedule exception
   */
  @Put(':id/exceptions/:exceptionId')
  @ApiOperation({ summary: 'Update schedule exception' })
  @ApiResponse({ status: 200, description: 'Exception updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid exception data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exception not found' })
  async updateException(
    @Param('id') providerId: string,
    @Param('exceptionId') exceptionId: string,
    @Body(new ZodValidationPipe(UpdateExceptionSchema)) dto: UpdateExceptionDto,
    @TenantContext() context: TenantContextData,
  ): Promise<ExceptionResponseDto> {
    this.logger.log(
      `PUT /providers/${providerId}/exceptions/${exceptionId} [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.updateException(exceptionId, providerId, context.tenantId, dto);
  }

  /**
   * DELETE /providers/:id/exceptions/:exceptionId
   * Delete a schedule exception
   */
  @Delete(':id/exceptions/:exceptionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete schedule exception' })
  @ApiResponse({ status: 204, description: 'Exception deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exception not found' })
  async deleteException(
    @Param('id') providerId: string,
    @Param('exceptionId') exceptionId: string,
    @TenantContext() context: TenantContextData,
  ): Promise<void> {
    this.logger.log(
      `DELETE /providers/${providerId}/exceptions/${exceptionId} [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    await this.schedulesService.deleteException(exceptionId, providerId, context.tenantId);
  }

  // ============================================================================
  // ABSENCE MANAGEMENT
  // ============================================================================

  /**
   * POST /providers/:id/absences
   * Request time off (vacation, sick, training, etc.)
   */
  @Post(':id/absences')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create absence request' })
  @ApiResponse({ status: 201, description: 'Absence request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid absence data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Absence overlaps with existing absence' })
  async createAbsence(
    @Param('id') providerId: string,
    @Body(new ZodValidationPipe(CreateAbsenceSchema)) dto: CreateAbsenceDto,
    @TenantContext() context: TenantContextData,
  ): Promise<AbsenceResponseDto> {
    this.logger.log(
      `POST /providers/${providerId}/absences [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.createAbsence(
      providerId,
      context.tenantId,
      context.organizationId,
      dto,
      context.userId,
    );
  }

  /**
   * DELETE /providers/:id/absences/:absenceId
   * Delete an absence request
   */
  @Delete(':id/absences/:absenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete absence' })
  @ApiResponse({ status: 204, description: 'Absence deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Absence not found' })
  async deleteAbsence(
    @Param('id') providerId: string,
    @Param('absenceId') absenceId: string,
    @TenantContext() context: TenantContextData,
  ): Promise<void> {
    this.logger.log(
      `DELETE /providers/${providerId}/absences/${absenceId} [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    await this.schedulesService.deleteAbsence(
      absenceId,
      providerId,
      context.tenantId,
      context.organizationId,
    );
  }

  // ============================================================================
  // AVAILABILITY ENDPOINTS
  // ============================================================================

  /**
   * GET /providers/:id/availability
   * Get provider availability for a specific date
   */
  @Get(':id/availability')
  @ApiOperation({ summary: 'Get provider availability for a date' })
  @ApiResponse({ status: 200, description: 'Availability retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'date', required: true, description: 'Date to check (ISO 8601)' })
  @ApiQuery({ name: 'duration', required: false, description: 'Minimum slot duration in minutes' })
  @ApiQuery({ name: 'clinicId', required: false, description: 'Clinic filter' })
  @ApiQuery({ name: 'timezone', required: false, description: 'Timezone (IANA format)' })
  async getAvailability(
    @Param('id') providerId: string,
    @Query(new ZodValidationPipe(GetAvailabilitySchema)) query: GetAvailabilityDto,
    @TenantContext() context: TenantContextData,
  ): Promise<AvailabilityCheckResponse> {
    this.logger.log(
      `GET /providers/${providerId}/availability [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.getAvailability(
      providerId,
      context.tenantId,
      context.organizationId,
      query,
    );
  }

  /**
   * GET /providers/:id/availability-range
   * Get provider availability for a date range
   */
  @Get(':id/availability-range')
  @ApiOperation({ summary: 'Get provider availability for a date range' })
  @ApiResponse({ status: 200, description: 'Availability retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date range' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'start', required: true, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'end', required: true, description: 'End date (ISO 8601)' })
  @ApiQuery({ name: 'duration', required: false, description: 'Minimum slot duration in minutes' })
  @ApiQuery({ name: 'clinicId', required: false, description: 'Clinic filter' })
  @ApiQuery({ name: 'timezone', required: false, description: 'Timezone (IANA format)' })
  async getAvailabilityRange(
    @Param('id') providerId: string,
    @Query(new ZodValidationPipe(GetAvailabilityRangeSchema)) query: GetAvailabilityRangeDto,
    @TenantContext() context: TenantContextData,
  ): Promise<AvailabilityRangeResponse> {
    this.logger.log(
      `GET /providers/${providerId}/availability-range [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.getAvailabilityRange(
      providerId,
      context.tenantId,
      context.organizationId,
      query,
    );
  }
}

/**
 * Absence Workflow Controller
 *
 * Separate controller for absence approval workflow.
 * Typically used by managers/admins to approve/reject time off requests.
 */
@ApiTags('absences')
@ApiBearerAuth()
@Controller('absences')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class AbsencesController {
  private readonly logger = new Logger(AbsencesController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * GET /absences
   * Query absences with filters (for managers to view team absences)
   */
  @Get()
  @ApiOperation({ summary: 'Query absences' })
  @ApiResponse({ status: 200, description: 'Absences retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type' })
  @ApiQuery({ name: 'providerId', required: false, description: 'Filter by provider' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  @ApiQuery({ name: 'includePast', required: false, description: 'Include past absences' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async queryAbsences(
    @Query(new ZodValidationPipe(QueryAbsencesSchema)) query: QueryAbsencesDto,
    @TenantContext() context: TenantContextData,
  ): Promise<AbsenceListResponseDto> {
    this.logger.log(`GET /absences [tenant: ${context.tenantId}, user: ${context.userId}]`);

    return this.schedulesService.queryAbsences(context.tenantId, context.organizationId, query);
  }

  /**
   * PATCH /absences/:id/approve
   * Approve an absence request (manager action)
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve absence request' })
  @ApiResponse({ status: 200, description: 'Absence approved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pending absence not found' })
  async approveAbsence(
    @Param('id') absenceId: string,
    @Body(new ZodValidationPipe(ApproveAbsenceSchema)) dto: ApproveAbsenceDto,
    @TenantContext() context: TenantContextData,
  ): Promise<AbsenceResponseDto> {
    this.logger.log(
      `POST /absences/${absenceId}/approve [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.approveAbsence(absenceId, context.tenantId, context.userId, dto);
  }

  /**
   * PATCH /absences/:id/reject
   * Reject an absence request (manager action)
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject absence request' })
  @ApiResponse({ status: 200, description: 'Absence rejected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pending absence not found' })
  async rejectAbsence(
    @Param('id') absenceId: string,
    @Body(new ZodValidationPipe(RejectAbsenceSchema)) dto: { rejectionReason?: string },
    @TenantContext() context: TenantContextData,
  ): Promise<AbsenceResponseDto> {
    this.logger.log(
      `POST /absences/${absenceId}/reject [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.rejectAbsence(absenceId, context.tenantId, context.userId, dto);
  }

  /**
   * POST /absences/:id/cancel
   * Cancel an absence (by provider or manager)
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel absence' })
  @ApiResponse({ status: 200, description: 'Absence cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Active absence not found' })
  async cancelAbsence(
    @Param('id') absenceId: string,
    @Body() dto: { cancellationReason?: string },
    @TenantContext() context: TenantContextData,
  ): Promise<AbsenceResponseDto> {
    this.logger.log(
      `POST /absences/${absenceId}/cancel [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.cancelAbsence(absenceId, context.tenantId, context.userId, dto);
  }
}
