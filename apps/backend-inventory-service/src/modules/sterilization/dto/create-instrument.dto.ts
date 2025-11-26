import { IsString, IsEnum, IsOptional, IsNumber, Min, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InstrumentType } from '@dentalos/shared-domain';

export class CreateInstrumentDto {
  @ApiProperty({
    description: 'Name of the instrument',
    example: 'High-speed handpiece',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Type of instrument',
    enum: InstrumentType,
    example: InstrumentType.HANDPIECE,
  })
  @IsEnum(InstrumentType)
  type!: InstrumentType;

  @ApiPropertyOptional({
    description: 'Serial number of the instrument',
    example: 'HP-2024-001',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer name',
    example: 'KaVo',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Model number',
    example: 'EXPERT-2000',
  })
  @IsOptional()
  @IsString()
  modelNumber?: string;

  @ApiPropertyOptional({
    description: 'Barcode for tracking',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Date of purchase',
    example: '2024-01-15',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchaseDate?: Date;

  @ApiPropertyOptional({
    description: 'Purchase cost',
    example: 1500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseCost?: number;

  @ApiPropertyOptional({
    description: 'Maximum sterilization cycles before retirement',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxCycles?: number;

  @ApiPropertyOptional({
    description: 'Maintenance notes',
    example: 'Oil bearings every 3 months',
  })
  @IsOptional()
  @IsString()
  maintenanceNotes?: string;
}
