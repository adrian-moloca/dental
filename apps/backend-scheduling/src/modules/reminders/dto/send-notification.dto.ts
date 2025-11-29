import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsObject,
  IsDateString,
  ValidateNested,
  IsEmail,
  IsPhoneNumber,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Message channel options
 */
export enum NotificationChannel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

/**
 * DTO for sending a single notification to a patient
 */
export class SendNotificationDto {
  @ApiProperty({
    description: 'Communication channel',
    enum: NotificationChannel,
    example: 'sms',
  })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel!: NotificationChannel;

  @ApiPropertyOptional({
    description: 'Template ID to use (mutually exclusive with customMessage)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Custom message text (mutually exclusive with templateId)',
    example: 'Buna ziua! Va reamintim programarea de maine.',
    maxLength: 1600,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1600, { message: 'Message must not exceed 1600 characters' })
  customMessage?: string;

  @ApiPropertyOptional({
    description: 'Variables for template substitution',
    example: {
      patientName: 'Ion Popescu',
      appointmentDate: '25 Ianuarie 2025',
      appointmentTime: '10:00',
      clinicName: 'Dental Clinic Excellence',
      providerName: 'Dr. Maria Ionescu',
    },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Email subject (required for email channel)',
    example: 'Programare la Dental Clinic',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiPropertyOptional({
    description: 'Scheduled send time (null for immediate sending)',
    example: '2025-01-25T09:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  sendAt?: string;

  @ApiPropertyOptional({
    description: 'Related appointment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Related invoice ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  invoiceId?: string;

  @ApiPropertyOptional({
    description: 'Related treatment plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  treatmentPlanId?: string;
}

/**
 * Patient filter criteria for bulk notifications
 */
export class PatientFilterDto {
  @ApiPropertyOptional({
    description: 'Patient status filter',
    example: ['active', 'at_risk'],
  })
  @IsOptional()
  @IsString({ each: true })
  status?: string[];

  @ApiPropertyOptional({
    description: 'Patient tags filter (any match)',
    example: ['vip', 'birthday_this_month'],
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Last visit before this date (ISO 8601)',
    example: '2024-06-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  lastVisitBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter patients with upcoming appointments',
    example: false,
  })
  @IsOptional()
  hasUpcomingAppointment?: boolean;
}

/**
 * DTO for sending bulk notifications
 */
export class BulkNotificationDto {
  @ApiPropertyOptional({
    description: 'Explicit list of patient IDs (mutually exclusive with patientFilter)',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  patientIds?: string[];

  @ApiPropertyOptional({
    description: 'Patient filter criteria (mutually exclusive with patientIds)',
    type: PatientFilterDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PatientFilterDto)
  patientFilter?: PatientFilterDto;

  @ApiProperty({
    description: 'Communication channel',
    enum: NotificationChannel,
    example: 'sms',
  })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel!: NotificationChannel;

  @ApiProperty({
    description: 'Template ID to use for all patients',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  templateId!: string;

  @ApiPropertyOptional({
    description: 'Common variables for all patients (patient-specific vars auto-populated)',
    example: {
      clinicName: 'Dental Clinic Excellence',
      discountPercent: '20',
    },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Scheduled send time (null for immediate sending)',
    example: '2025-01-25T09:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  sendAt?: string;

  @ApiPropertyOptional({
    description: 'Campaign ID to track this bulk send',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4')
  campaignId?: string;
}

/**
 * DTO for quick SMS sending
 */
export class QuickSmsDto {
  @ApiProperty({
    description: 'Message text',
    example: 'Buna ziua! Va reamintim programarea de maine la ora 10:00.',
    maxLength: 1600,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1600)
  message!: string;

  @ApiPropertyOptional({
    description: 'Phone number override (if different from patient primary phone)',
    example: '+40721234567',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;
}

/**
 * DTO for quick WhatsApp sending
 */
export class QuickWhatsAppDto {
  @ApiProperty({
    description: 'Message text',
    example: 'Buna ziua! Va reamintim programarea de maine la ora 10:00.',
    maxLength: 1600,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1600)
  message!: string;

  @ApiPropertyOptional({
    description: 'Phone number override (if different from patient primary phone)',
    example: '+40721234567',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;
}

/**
 * DTO for quick email sending
 */
export class QuickEmailDto {
  @ApiProperty({
    description: 'Email subject',
    example: 'Programare la Dental Clinic',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @ApiProperty({
    description: 'Email body (plain text or HTML)',
    example: 'Buna ziua! Va reamintim programarea de maine la ora 10:00.',
  })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({
    description: 'Email address override (if different from patient primary email)',
    example: 'patient@example.com',
  })
  @IsOptional()
  @IsEmail()
  emailAddress?: string;
}

/**
 * DTO for previewing a notification before sending
 */
export class PreviewNotificationDto {
  @ApiProperty({
    description: 'Patient ID for variable substitution',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({
    description: 'Template ID to preview',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  templateId!: string;

  @ApiPropertyOptional({
    description: 'Additional variables to override defaults',
    example: {
      appointmentDate: '25 Ianuarie 2025',
      appointmentTime: '10:00',
    },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

/**
 * Response DTO for notification creation
 */
export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Current status',
    example: 'queued',
  })
  status!: string;

  @ApiProperty({
    description: 'Channel used',
    example: 'sms',
  })
  channel!: string;

  @ApiProperty({
    description: 'When notification was queued',
    example: '2025-01-24T15:30:00Z',
  })
  queuedAt!: string;

  @ApiPropertyOptional({
    description: 'Estimated cost in minor units (bani/cents)',
    example: 5,
  })
  estimatedCost?: number;
}

/**
 * Response DTO for bulk notification creation
 */
export class BulkNotificationResponseDto {
  @ApiProperty({
    description: 'Number of notifications created',
    example: 150,
  })
  notificationsCreated!: number;

  @ApiProperty({
    description: 'List of created notification IDs',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  notificationIds!: string[];

  @ApiProperty({
    description: 'Number of patients that failed validation',
    example: 5,
  })
  failedCount!: number;

  @ApiPropertyOptional({
    description: 'List of failed patient IDs with reasons',
    example: [
      { patientId: 'uuid-x', reason: 'No phone number' },
      { patientId: 'uuid-y', reason: 'Opted out of SMS' },
    ],
  })
  failures?: Array<{ patientId: string; reason: string }>;

  @ApiProperty({
    description: 'Total estimated cost in minor units',
    example: 750,
  })
  totalEstimatedCost!: number;
}

/**
 * Response DTO for notification preview
 */
export class PreviewNotificationResponseDto {
  @ApiProperty({
    description: 'Rendered message content',
    example:
      'Buna ziua Ion Popescu! Va reamintim programarea la Dental Clinic pe 25 Ianuarie ora 10:00.',
  })
  content!: string;

  @ApiPropertyOptional({
    description: 'Email subject (if email channel)',
    example: 'Programare la Dental Clinic',
  })
  subject?: string;

  @ApiProperty({
    description: 'Channel',
    example: 'sms',
  })
  channel!: string;

  @ApiProperty({
    description: 'Estimated character count',
    example: 156,
  })
  characterCount!: number;

  @ApiProperty({
    description: 'Estimated SMS segments (if SMS)',
    example: 1,
  })
  smsSegments?: number;

  @ApiProperty({
    description: 'Estimated cost in minor units',
    example: 5,
  })
  estimatedCost!: number;

  @ApiProperty({
    description: 'Variables used in template',
    example: {
      patientName: 'Ion Popescu',
      clinicName: 'Dental Clinic Excellence',
      appointmentDate: '25 Ianuarie 2025',
      appointmentTime: '10:00',
    },
  })
  variables!: Record<string, string>;
}
