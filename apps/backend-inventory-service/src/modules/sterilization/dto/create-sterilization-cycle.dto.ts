import { IsString, IsEnum, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SterilizationCycleType } from '@dentalos/shared-domain';

export class CreateSterilizationCycleDto {
  @ApiProperty({
    description: 'Type of sterilization cycle',
    enum: SterilizationCycleType,
    example: SterilizationCycleType.STEAM,
  })
  @IsEnum(SterilizationCycleType)
  type!: SterilizationCycleType;

  @ApiPropertyOptional({
    description: 'ID of the autoclave machine',
    example: 'autoclave-001',
  })
  @IsOptional()
  @IsString()
  autoclaveId?: string;

  @ApiPropertyOptional({
    description: 'Array of instrument IDs to include in this cycle',
    example: ['inst-001', 'inst-002'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  instrumentIds?: string[];

  @ApiPropertyOptional({
    description: 'Target temperature in Celsius',
    example: 134,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(200)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Target pressure in bar',
    example: 2.1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  pressure?: number;

  @ApiPropertyOptional({
    description: 'Expected duration in minutes',
    example: 18,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(120)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Notes about this cycle',
    example: 'Routine weekly sterilization',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
