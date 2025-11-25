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
import { AppointmentsService } from '../services/appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto,
  QueryAppointmentsDto,
  AppointmentResponseDto,
  AppointmentListResponseDto,
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  CancelAppointmentSchema,
  QueryAppointmentsSchema,
} from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { TenantIsolationGuard } from '../guards/tenant-isolation.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * Book a new appointment
   */
  @Post()
  @RequirePermissions('appointments:create')
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  async bookAppointment(
    @CurrentUser() user: CurrentUserData,
    @Body(new ZodValidationPipe(CreateAppointmentSchema)) dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.bookAppointment(
      user.tenantId,
      user.organizationId,
      dto,
      user.userId,
    );
  }

  /**
   * Get appointment by ID
   */
  @Get(':id')
  @RequirePermissions('appointments:read')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.getAppointment(id, user.tenantId);
  }

  /**
   * List appointments with filters
   */
  @Get()
  @RequirePermissions('appointments:read')
  @ApiOperation({ summary: 'List appointments with filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async listAppointments(
    @CurrentUser() user: CurrentUserData,
    @Query(new ZodValidationPipe(QueryAppointmentsSchema)) query: QueryAppointmentsDto,
  ): Promise<AppointmentListResponseDto> {
    return this.appointmentsService.listAppointments(user.tenantId, query);
  }

  /**
   * Reschedule an appointment
   */
  @Put(':id')
  @RequirePermissions('appointments:update')
  @ApiOperation({ summary: 'Reschedule an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  async rescheduleAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAppointmentSchema)) dto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.rescheduleAppointment(
      id,
      user.tenantId,
      user.organizationId,
      dto,
      user.userId,
    );
  }

  /**
   * Cancel an appointment
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('appointments:delete')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancelAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CancelAppointmentSchema)) dto: CancelAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancelAppointment(
      id,
      user.tenantId,
      user.organizationId,
      dto,
      user.userId,
    );
  }

  /**
   * Record no-show for an appointment
   */
  @Post(':id/no-show')
  @RequirePermissions('appointments:update')
  @ApiOperation({ summary: 'Record appointment no-show' })
  @ApiResponse({ status: 200, description: 'No-show recorded successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async recordNoShow(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.recordNoShow(id, user.tenantId, body.reason);
  }
}
