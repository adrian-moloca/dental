import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { ReminderService, ReminderResult, PendingReminder, ReminderStats } from '../services';
import { ReminderConfigDto, SendReminderDto } from '../dto';

/**
 * Appointment Reminders Controller
 *
 * Manages appointment reminder configuration and sending.
 * This is a stub implementation for integration with external notification services.
 *
 * @remarks
 * In production, integrate with:
 * - SMS providers (Twilio, Netopia SMS for Romanian market)
 * - Email services (SendGrid, SES)
 * - WhatsApp Business API
 * - Firebase Cloud Messaging for push notifications
 */
@ApiTags('Reminders')
@Controller('reminders')
export class ReminderController {
  private readonly logger = new Logger(ReminderController.name);

  constructor(private readonly reminderService: ReminderService) {}

  // ==================== Configuration Endpoints ====================

  @Get('config/:clinicId')
  @ApiOperation({ summary: 'Get reminder configuration for a clinic' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Reminder configuration' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async getConfig(@Param('clinicId') clinicId: string): Promise<ReminderConfigDto | null> {
    this.logger.debug(`Getting reminder config for clinic ${clinicId}`);
    return this.reminderService.getConfig(clinicId);
  }

  @Put('config/:clinicId')
  @ApiOperation({ summary: 'Configure reminders for a clinic' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  async configureReminders(
    @Param('clinicId') clinicId: string,
    @Body() config: ReminderConfigDto,
  ): Promise<ReminderConfigDto> {
    this.logger.log(`Configuring reminders for clinic ${clinicId}`);
    return this.reminderService.configureReminders(clinicId, config);
  }

  // ==================== Reminder Operations ====================

  @Post('schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule a reminder for an appointment' })
  @ApiResponse({ status: 200, description: 'Reminder scheduled' })
  async scheduleReminder(
    @Body() body: { appointmentId: string; appointmentTime: string; clinicId: string },
  ): Promise<{ scheduled: boolean; reminderTimes: Date[] }> {
    this.logger.log(`Scheduling reminder for appointment ${body.appointmentId}`);
    return this.reminderService.scheduleReminder(
      body.appointmentId,
      new Date(body.appointmentTime),
      body.clinicId,
    );
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a reminder immediately' })
  @ApiResponse({ status: 200, description: 'Reminder sent' })
  async sendReminder(@Body() dto: SendReminderDto): Promise<ReminderResult[]> {
    this.logger.log(`Sending reminder for appointment ${dto.appointmentId}`);
    return this.reminderService.sendReminder(dto);
  }

  @Delete('cancel/:appointmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel scheduled reminders for an appointment' })
  @ApiParam({ name: 'appointmentId', description: 'Appointment ID' })
  @ApiResponse({ status: 204, description: 'Reminders cancelled' })
  async cancelReminders(@Param('appointmentId') appointmentId: string): Promise<void> {
    this.logger.log(`Cancelling reminders for appointment ${appointmentId}`);
    await this.reminderService.cancelReminders(appointmentId);
  }

  // ==================== Query Endpoints ====================

  @Get('pending')
  @ApiOperation({ summary: 'Get pending reminders' })
  @ApiQuery({
    name: 'hours',
    required: false,
    description: 'Hours to look ahead (default: 24)',
  })
  @ApiQuery({
    name: 'clinicId',
    required: false,
    description: 'Filter by clinic ID',
  })
  @ApiResponse({ status: 200, description: 'List of pending reminders' })
  async getPendingReminders(
    @Query('hours') hours?: string,
    @Query('clinicId') clinicId?: string,
  ): Promise<PendingReminder[]> {
    const hoursNum = hours ? parseInt(hours, 10) : 24;
    this.logger.debug(`Getting pending reminders for next ${hoursNum} hours`);
    return this.reminderService.getPendingReminders(hoursNum, clinicId);
  }

  @Get('statistics/:clinicId')
  @ApiOperation({ summary: 'Get reminder statistics for a clinic' })
  @ApiParam({ name: 'clinicId', description: 'Clinic ID' })
  @ApiResponse({ status: 200, description: 'Reminder statistics' })
  async getStatistics(@Param('clinicId') clinicId: string): Promise<ReminderStats> {
    this.logger.debug(`Getting reminder stats for clinic ${clinicId}`);
    return this.reminderService.getStatistics(clinicId);
  }

  // ==================== Template Endpoints ====================

  @Get('templates/default')
  @ApiOperation({ summary: 'Get default message templates' })
  @ApiResponse({ status: 200, description: 'Default message templates' })
  getDefaultTemplates(): { romanian: string; english: string } {
    return {
      romanian: this.reminderService.getDefaultRomanianTemplate(),
      english: this.reminderService.getDefaultEnglishTemplate(),
    };
  }
}
