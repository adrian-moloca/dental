import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Working hours for a specific day
 */
export class DayWorkingHoursDto {
  @ApiProperty({
    description: 'Start time in HH:mm format (24-hour)',
    example: '08:00',
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
  })
  start!: string;

  @ApiProperty({
    description: 'End time in HH:mm format (24-hour)',
    example: '16:00',
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
  })
  end!: string;
}

/**
 * Weekly working hours override for provider at specific clinic
 */
export class WorkingHoursOverrideDto {
  @ApiProperty({
    description: 'Monday working hours',
    type: () => DayWorkingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayWorkingHoursDto)
  monday?: DayWorkingHoursDto;

  @ApiProperty({
    description: 'Tuesday working hours',
    type: () => DayWorkingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayWorkingHoursDto)
  tuesday?: DayWorkingHoursDto;

  @ApiProperty({
    description: 'Wednesday working hours',
    type: () => DayWorkingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayWorkingHoursDto)
  wednesday?: DayWorkingHoursDto;

  @ApiProperty({
    description: 'Thursday working hours',
    type: () => DayWorkingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayWorkingHoursDto)
  thursday?: DayWorkingHoursDto;

  @ApiProperty({
    description: 'Friday working hours',
    type: () => DayWorkingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayWorkingHoursDto)
  friday?: DayWorkingHoursDto;

  @ApiProperty({
    description: 'Saturday working hours',
    type: () => DayWorkingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayWorkingHoursDto)
  saturday?: DayWorkingHoursDto;

  @ApiProperty({
    description: 'Sunday working hours',
    type: () => DayWorkingHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayWorkingHoursDto)
  sunday?: DayWorkingHoursDto;
}

/**
 * DTO for assigning a provider (dentist, hygienist, etc.) to a clinic
 */
export class AssignProviderDto {
  @ApiProperty({
    description: 'UUID of the clinic to assign the provider to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  clinicId!: string;

  @ApiProperty({
    description: 'Array of role codes the provider will have at this clinic',
    example: ['DENTIST', 'CLINIC_MANAGER'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  roles!: string[];

  @ApiProperty({
    description: 'Whether this is the providers primary/home clinic',
    example: true,
    default: false,
  })
  @IsBoolean()
  isPrimaryClinic!: boolean;

  @ApiProperty({
    description:
      'Custom working hours for this provider at this clinic (overrides clinic defaults)',
    type: () => WorkingHoursOverrideDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursOverrideDto)
  workingHoursOverride?: WorkingHoursOverrideDto;
}
