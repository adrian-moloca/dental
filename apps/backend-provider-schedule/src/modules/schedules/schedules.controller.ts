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

/**
 * Provider Schedule Controller
 *
 * Handles HTTP requests for provider schedules and absences.
 * All endpoints enforce multi-tenant isolation and require authentication.
 */
@ApiTags('provider-schedules')
@ApiBearerAuth()
@Controller('providers')
// @UseGuards(JwtAuthGuard, TenantGuard) // Uncomment when guards are available
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
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async getSchedule(
    @Param('id') providerId: string,
    // @GetTenantContext() context: TenantContext, // Uncomment when decorator is available
  ): Promise<{ schedule: ScheduleResponseDto; absences: AbsenceResponseDto[] }> {
    this.logger.log(`GET /providers/${providerId}/schedule`);

    // TODO: Replace with actual tenant context from JWT
    const tenantId = 'mock-tenant-id';
    const organizationId = 'mock-org-id';

    return this.schedulesService.getProviderSchedule(providerId, tenantId, organizationId);
  }

  /**
   * PUT /providers/:id/schedule
   * Update provider's working hours
   */
  @Put(':id/schedule')
  @ApiOperation({ summary: 'Update provider working hours' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid schedule data' })
  async updateSchedule(
    @Param('id') providerId: string,
    @Body(new ZodValidationPipe(UpdateScheduleSchema)) dto: UpdateScheduleDto,
    // @GetTenantContext() context: TenantContext,
  ): Promise<ScheduleResponseDto> {
    this.logger.log(`PUT /providers/${providerId}/schedule`);

    // TODO: Replace with actual tenant context from JWT
    const tenantId = 'mock-tenant-id';
    const organizationId = 'mock-org-id';

    return this.schedulesService.updateProviderSchedule(providerId, tenantId, organizationId, dto);
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
  @ApiResponse({ status: 409, description: 'Absence conflicts with existing absence' })
  async createAbsence(
    @Param('id') providerId: string,
    @Body(new ZodValidationPipe(CreateAbsenceSchema)) dto: CreateAbsenceDto,
    // @GetTenantContext() context: TenantContext,
  ): Promise<AbsenceResponseDto> {
    this.logger.log(`POST /providers/${providerId}/absences`);

    // TODO: Replace with actual tenant context from JWT
    const tenantId = 'mock-tenant-id';
    const organizationId = 'mock-org-id';
    const userId = 'mock-user-id';

    return this.schedulesService.createAbsence(providerId, tenantId, organizationId, dto, userId);
  }

  /**
   * DELETE /providers/:id/absences/:absenceId
   * Delete provider absence
   */
  @Delete(':id/absences/:absenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete provider absence' })
  @ApiResponse({ status: 204, description: 'Absence deleted successfully' })
  @ApiResponse({ status: 404, description: 'Absence not found' })
  async deleteAbsence(
    @Param('id') providerId: string,
    @Param('absenceId') absenceId: string,
    // @GetTenantContext() context: TenantContext,
  ): Promise<void> {
    this.logger.log(`DELETE /providers/${providerId}/absences/${absenceId}`);

    // TODO: Replace with actual tenant context from JWT
    const tenantId = 'mock-tenant-id';
    const organizationId = 'mock-org-id';

    await this.schedulesService.deleteAbsence(absenceId, providerId, tenantId, organizationId);
  }

  /**
   * GET /providers/:id/availability/:date
   * Check provider availability for a specific date
   */
  @Get(':id/availability/:date')
  @ApiOperation({ summary: 'Check provider availability for a date' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(
    @Param('id') providerId: string,
    @Param('date') dateStr: string,
    // @GetTenantContext() context: TenantContext,
  ): Promise<AvailabilityResponseDto> {
    this.logger.log(`GET /providers/${providerId}/availability/${dateStr}`);

    // Parse date
    const date = new Date(dateStr);

    // Validate using Zod
    const dto: CheckAvailabilityDto = CheckAvailabilitySchema.parse({ date });

    // TODO: Replace with actual tenant context from JWT
    const tenantId = 'mock-tenant-id';
    const organizationId = 'mock-org-id';

    return this.schedulesService.checkAvailability(providerId, tenantId, organizationId, dto);
  }
}
