import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  UpdateScheduleDto,
  UpdateScheduleSchema,
  CreateAbsenceDto,
  CreateAbsenceSchema,
  CheckAvailabilityDto,
  CheckAvailabilitySchema,
  ScheduleResponseDto,
  AbsenceResponseDto,
  AvailabilityResponseDto,
} from './dto';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import { JwtAuthGuard, TenantIsolationGuard } from '../../guards';
import { TenantContext, TenantContextData } from '../../decorators/tenant-context.decorator';

/**
 * Provider Schedule Controller
 *
 * Handles HTTP requests for provider schedules and absences.
 * All endpoints enforce multi-tenant isolation and require JWT authentication.
 *
 * SECURITY:
 * - JwtAuthGuard validates JWT tokens and populates request.user
 * - TenantIsolationGuard prevents cross-tenant data access
 * - TenantContext decorator extracts tenant info from authenticated user
 */
@ApiTags('provider-schedules')
@ApiBearerAuth()
@Controller('providers')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class SchedulesController {
  private readonly logger = new Logger(SchedulesController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * GET /providers/:id/schedule
   * Get provider's weekly schedule and absences
   */
  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get provider schedule with absences' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cross-tenant access denied' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async getSchedule(
    @Param('id') providerId: string,
    @TenantContext() context: TenantContextData,
  ): Promise<{ schedule: ScheduleResponseDto; absences: AbsenceResponseDto[] }> {
    this.logger.log(
      `GET /providers/${providerId}/schedule [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.getProviderSchedule(
      providerId,
      context.tenantId,
      context.organizationId,
    );
  }

  /**
   * PUT /providers/:id/schedule
   * Update provider's working hours
   */
  @Put(':id/schedule')
  @ApiOperation({ summary: 'Update provider working hours' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid schedule data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cross-tenant access denied' })
  async updateSchedule(
    @Param('id') providerId: string,
    @Body(new ZodValidationPipe(UpdateScheduleSchema)) dto: UpdateScheduleDto,
    @TenantContext() context: TenantContextData,
  ): Promise<ScheduleResponseDto> {
    this.logger.log(
      `PUT /providers/${providerId}/schedule [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    return this.schedulesService.updateProviderSchedule(
      providerId,
      context.tenantId,
      context.organizationId,
      dto,
    );
  }

  /**
   * POST /providers/:id/absences
   * Add time-off or exception for provider
   */
  @Post(':id/absences')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create provider absence' })
  @ApiResponse({ status: 201, description: 'Absence created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid absence data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cross-tenant access denied' })
  @ApiResponse({ status: 409, description: 'Absence conflicts with existing absence' })
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
   * Delete provider absence
   */
  @Delete(':id/absences/:absenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete provider absence' })
  @ApiResponse({ status: 204, description: 'Absence deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cross-tenant access denied' })
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

  /**
   * GET /providers/:id/availability/:date
   * Check provider availability for a specific date
   */
  @Get(':id/availability/:date')
  @ApiOperation({ summary: 'Check provider availability for a date' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cross-tenant access denied' })
  async checkAvailability(
    @Param('id') providerId: string,
    @Param('date') dateStr: string,
    @TenantContext() context: TenantContextData,
  ): Promise<AvailabilityResponseDto> {
    this.logger.log(
      `GET /providers/${providerId}/availability/${dateStr} [tenant: ${context.tenantId}, user: ${context.userId}]`,
    );

    // Parse date
    const date = new Date(dateStr);

    // Validate using Zod
    const dto: CheckAvailabilityDto = CheckAvailabilitySchema.parse({ date });

    return this.schedulesService.checkAvailability(
      providerId,
      context.tenantId,
      context.organizationId,
      dto,
    );
  }
}
