import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { NotificationService, TenantContext } from '../services/notification.service';
import {
  SendNotificationDto,
  BulkNotificationDto,
  QuickSmsDto,
  QuickWhatsAppDto,
  QuickEmailDto,
  PreviewNotificationDto,
  NotificationResponseDto,
  BulkNotificationResponseDto,
  PreviewNotificationResponseDto,
} from '../dto/send-notification.dto';

/**
 * Mock decorators - replace with actual auth guards
 */
const JwtAuthGuard = class {};
const TenantGuard = class {};
const GetTenantContext = () => (_target: any, _propertyKey: string, _parameterIndex: number) => {};

/**
 * Notification Controller
 *
 * Provides comprehensive patient notification endpoints:
 * - Send individual notifications
 * - Bulk notifications
 * - Quick send shortcuts (SMS, WhatsApp, Email)
 * - Notification preview
 * - Notification history
 *
 * All endpoints are protected by authentication and tenant isolation.
 */
@ApiTags('Patient Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ==================== Send Notifications ====================

  /**
   * Send notification to a single patient
   *
   * POST /patients/:patientId/notifications
   */
  @Post('patients/:patientId/notifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send notification to patient',
    description: 'Send a notification to a single patient via SMS, WhatsApp, or Email',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification queued successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request or patient has no consent' })
  @ApiResponse({ status: 404, description: 'Patient or template not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded for this patient' })
  async sendNotification(
    @Param('patientId') patientId: string,
    @Body() dto: SendNotificationDto,
    @GetTenantContext() context: TenantContext,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.sendNotification(patientId, dto, context);
  }

  /**
   * Send bulk notifications
   *
   * POST /notifications/bulk
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send bulk notifications',
    description:
      'Send notifications to multiple patients using explicit IDs or patient filter criteria',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk notifications queued successfully',
    type: BulkNotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async sendBulkNotifications(
    @Body() dto: BulkNotificationDto,
    @GetTenantContext() context: TenantContext,
  ): Promise<BulkNotificationResponseDto> {
    return this.notificationService.sendBulkNotifications(dto, context);
  }

  /**
   * Preview notification before sending
   *
   * POST /notifications/preview
   */
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preview notification',
    description:
      'Preview how a notification will look with variables substituted before actually sending',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification preview generated',
    type: PreviewNotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Patient or template not found' })
  async previewNotification(
    @Body() dto: PreviewNotificationDto,
    @GetTenantContext() context: TenantContext,
  ): Promise<PreviewNotificationResponseDto> {
    return this.notificationService.previewNotification(dto, context);
  }

  // ==================== Quick Send Shortcuts ====================

  /**
   * Send quick SMS
   *
   * POST /patients/:patientId/notifications/quick-sms
   */
  @Post('patients/:patientId/notifications/quick-sms')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send quick SMS',
    description: 'Quick shortcut to send SMS without template',
  })
  @ApiResponse({
    status: 201,
    description: 'SMS sent successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request or patient opted out' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async sendQuickSms(
    @Param('patientId') patientId: string,
    @Body() dto: QuickSmsDto,
    @GetTenantContext() context: TenantContext,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.sendQuickSms(patientId, dto, context);
  }

  /**
   * Send quick WhatsApp message
   *
   * POST /patients/:patientId/notifications/quick-whatsapp
   */
  @Post('patients/:patientId/notifications/quick-whatsapp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send quick WhatsApp',
    description: 'Quick shortcut to send WhatsApp message without template',
  })
  @ApiResponse({
    status: 201,
    description: 'WhatsApp message sent successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request or patient opted out' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async sendQuickWhatsApp(
    @Param('patientId') patientId: string,
    @Body() dto: QuickWhatsAppDto,
    @GetTenantContext() context: TenantContext,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.sendQuickWhatsApp(patientId, dto, context);
  }

  /**
   * Send quick email
   *
   * POST /patients/:patientId/notifications/quick-email
   */
  @Post('patients/:patientId/notifications/quick-email')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send quick email',
    description: 'Quick shortcut to send email without template',
  })
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request or patient opted out' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async sendQuickEmail(
    @Param('patientId') patientId: string,
    @Body() dto: QuickEmailDto,
    @GetTenantContext() context: TenantContext,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.sendQuickEmail(patientId, dto, context);
  }

  // ==================== Notification History ====================

  /**
   * Get patient notification history
   *
   * GET /patients/:patientId/notifications
   */
  @Get('patients/:patientId/notifications')
  @ApiOperation({
    summary: 'Get patient notification history',
    description: 'Retrieve all notifications sent to a specific patient',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Patient notification history retrieved',
  })
  async getPatientNotifications(
    @Param('patientId') patientId: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.notificationService.getPatientNotifications(
      patientId,
      context.tenantId,
      Number(limit),
      Number(offset),
    );
  }

  /**
   * Get all notifications with filters
   *
   * GET /notifications
   */
  @Get()
  @ApiOperation({
    summary: 'Get all notifications',
    description: 'Retrieve all notifications with optional filtering',
  })
  @ApiQuery({ name: 'channel', required: false, enum: ['sms', 'whatsapp', 'email'] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['queued', 'sending', 'sent', 'delivered', 'failed', 'read'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    example: 'appointment_reminder',
  })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2025-01-31' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('patientId') patientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @GetTenantContext() context?: TenantContext,
  ) {
    const filters = {
      channel,
      status,
      type,
      patientId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.notificationService.getNotifications(
      context!.tenantId,
      filters,
      Number(limit),
      Number(offset),
    );
  }

  /**
   * Get notification details
   *
   * GET /notifications/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get notification details',
    description: 'Retrieve detailed information about a specific notification',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification details retrieved',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotificationById(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.notificationService.getNotificationById(id, context.tenantId);
  }
}
