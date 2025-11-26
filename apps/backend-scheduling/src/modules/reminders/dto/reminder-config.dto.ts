import { IsString, IsBoolean, IsOptional, IsArray, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReminderChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH',
}

export enum ReminderTrigger {
  /** Hours before appointment */
  HOURS_BEFORE = 'HOURS_BEFORE',
  /** Days before appointment */
  DAYS_BEFORE = 'DAYS_BEFORE',
  /** Specific time of day before */
  DAY_BEFORE_AT_TIME = 'DAY_BEFORE_AT_TIME',
}

export class ReminderConfigDto {
  @ApiPropertyOptional({
    description: 'Whether reminders are enabled for this clinic',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Channels to use for reminders',
    enum: ReminderChannel,
    isArray: true,
    example: [ReminderChannel.SMS, ReminderChannel.EMAIL],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReminderChannel, { each: true })
  channels?: ReminderChannel[];

  @ApiPropertyOptional({
    description: 'Primary reminder - hours before appointment',
    example: 24,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168) // 1 week max
  primaryReminderHours?: number;

  @ApiPropertyOptional({
    description: 'Secondary reminder - hours before appointment (optional)',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(48)
  secondaryReminderHours?: number;

  @ApiPropertyOptional({
    description: 'Custom reminder message template',
    example: 'Reminder: Your appointment at {{clinicName}} is tomorrow at {{time}}.',
  })
  @IsOptional()
  @IsString()
  messageTemplate?: string;

  @ApiPropertyOptional({
    description: 'Whether to include cancellation link in reminder',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeCancellationLink?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to include confirmation link in reminder',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeConfirmationLink?: boolean;

  @ApiPropertyOptional({
    description: 'Quiet hours start (HH:MM format, no reminders during quiet hours)',
    example: '21:00',
  })
  @IsOptional()
  @IsString()
  quietHoursStart?: string;

  @ApiPropertyOptional({
    description: 'Quiet hours end (HH:MM format)',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  quietHoursEnd?: string;
}

export class SendReminderDto {
  @ApiProperty({
    description: 'Appointment ID to send reminder for',
  })
  @IsString()
  appointmentId!: string;

  @ApiPropertyOptional({
    description: 'Override channels for this specific reminder',
    enum: ReminderChannel,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReminderChannel, { each: true })
  channels?: ReminderChannel[];

  @ApiPropertyOptional({
    description: 'Override message for this specific reminder',
  })
  @IsOptional()
  @IsString()
  customMessage?: string;
}
