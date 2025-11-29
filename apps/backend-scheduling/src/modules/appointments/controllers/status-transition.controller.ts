import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { StatusTransitionService, TransitionContext } from '../services/status-transition.service';
import {
  ConfirmAppointmentDto,
  CheckInAppointmentDto,
  StartAppointmentDto,
  CompleteAppointmentDto,
  CancelAppointmentWithTypeDto,
  NoShowAppointmentDto,
  RescheduleAppointmentDto,
  AppointmentResponseDto,
  ConfirmAppointmentSchema,
  CheckInAppointmentSchema,
  StartAppointmentSchema,
  CompleteAppointmentSchema,
  CancelAppointmentWithTypeSchema,
  NoShowAppointmentSchema,
  RescheduleAppointmentSchema,
} from '../dto';
import { StatusTransitionEntry } from '../entities/appointment.schema';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { TenantIsolationGuard } from '../guards/tenant-isolation.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@ApiTags('Appointment Status Transitions')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class StatusTransitionController {
  constructor(private readonly statusTransitionService: StatusTransitionService) {}

  /**
   * Confirm an appointment
   */
  @Patch(':id/confirm')
  @RequirePermissions('appointments:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm an appointment',
    description:
      'Transitions appointment from SCHEDULED to CONFIRMED. Can only be performed on scheduled appointments.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transition - appointment not in valid state' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async confirmAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ConfirmAppointmentSchema)) dto: ConfirmAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const context = this.buildContext(user);
    return this.statusTransitionService.confirm(id, dto, context);
  }

  /**
   * Check in patient for appointment
   */
  @Patch(':id/check-in')
  @RequirePermissions('appointments:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check in patient for appointment',
    description:
      'Transitions appointment from SCHEDULED or CONFIRMED to CHECKED_IN. Patient has arrived at the clinic.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Patient checked in successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transition - appointment not in valid state' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async checkInAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CheckInAppointmentSchema)) dto: CheckInAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const context = this.buildContext(user);
    return this.statusTransitionService.checkIn(id, dto, context);
  }

  /**
   * Start an appointment
   */
  @Patch(':id/start')
  @RequirePermissions('appointments:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start an appointment',
    description:
      'Transitions appointment from CHECKED_IN to IN_PROGRESS. Patient has been called to treatment room.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Appointment started successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid transition - patient must be checked in first',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async startAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(StartAppointmentSchema)) dto: StartAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const context = this.buildContext(user);
    return this.statusTransitionService.start(id, dto, context);
  }

  /**
   * Complete an appointment
   */
  @Patch(':id/complete')
  @RequirePermissions('appointments:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete an appointment',
    description:
      'Transitions appointment from IN_PROGRESS to COMPLETED. Triggers billing and clinical workflows.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Appointment completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transition - appointment must be in progress' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async completeAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CompleteAppointmentSchema)) dto: CompleteAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const context = this.buildContext(user);
    return this.statusTransitionService.complete(id, dto, context);
  }

  /**
   * Cancel an appointment
   */
  @Patch(':id/cancel')
  @RequirePermissions('appointments:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel an appointment',
    description:
      'Cancels the appointment. Can be performed from SCHEDULED, CONFIRMED, CHECKED_IN, or IN_PROGRESS states.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid transition - appointment cannot be cancelled in current state',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancelAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CancelAppointmentWithTypeSchema)) dto: CancelAppointmentWithTypeDto,
  ): Promise<AppointmentResponseDto> {
    const context = this.buildContext(user);
    return this.statusTransitionService.cancel(id, dto, context);
  }

  /**
   * Mark appointment as no-show
   */
  @Patch(':id/no-show')
  @RequirePermissions('appointments:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark appointment as no-show',
    description:
      'Marks appointment as no-show. Can only be performed on CHECKED_IN appointments where patient left before being seen.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Appointment marked as no-show' })
  @ApiResponse({
    status: 400,
    description: 'Invalid transition - can only mark checked-in appointments as no-show',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async markNoShow(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(NoShowAppointmentSchema)) dto: NoShowAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const context = this.buildContext(user);
    return this.statusTransitionService.markNoShow(id, dto, context);
  }

  /**
   * Reschedule an appointment
   */
  @Patch(':id/reschedule')
  @RequirePermissions('appointments:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reschedule an appointment',
    description:
      'Reschedules appointment to a new time. Resets status to SCHEDULED. Cannot reschedule completed or cancelled appointments.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Appointment rescheduled successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid transition, invalid date range, or scheduling in the past',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict at requested time' })
  async rescheduleAppointment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RescheduleAppointmentSchema)) dto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const context = this.buildContext(user);
    return this.statusTransitionService.reschedule(id, dto, context);
  }

  /**
   * Get status transition history
   */
  @Get(':id/status-history')
  @RequirePermissions('appointments:read')
  @ApiOperation({
    summary: 'Get appointment status transition history',
    description: 'Returns the complete audit trail of all status transitions for an appointment.',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Status history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getStatusHistory(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ): Promise<StatusTransitionEntry[]> {
    return this.statusTransitionService.getStatusHistory(id, user.tenantId);
  }

  /**
   * Build transition context from user data
   */
  private buildContext(user: CurrentUserData): TransitionContext {
    return {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.organizationId, // Default to organization if clinic not specified
      userId: user.userId,
    };
  }
}
