/**
 * DTOs for Odontogram operations
 */

import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SurfaceDataDto {
  @ApiProperty({ type: [String], description: 'Surface conditions', example: ['caries'] })
  @IsArray()
  @IsString({ each: true })
  conditions!: string[];

  @ApiProperty({
    type: [String],
    description: 'Procedures performed',
    example: ['composite_restoration'],
  })
  @IsArray()
  @IsString({ each: true })
  procedures!: string[];
}

export class UpdateToothDto {
  @ApiProperty({ description: 'Tooth number (1-32 Universal)', example: 14 })
  @IsNumber()
  @Min(1)
  @Max(32)
  toothNumber!: number;

  @ApiProperty({ enum: ['present', 'missing', 'implant', 'bridge', 'crown', 'filling'] })
  @IsEnum(['present', 'missing', 'implant', 'bridge', 'crown', 'filling'])
  status!: string;

  @ApiPropertyOptional({ type: SurfaceDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SurfaceDataDto)
  buccal?: SurfaceDataDto;

  @ApiPropertyOptional({ type: SurfaceDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SurfaceDataDto)
  lingual?: SurfaceDataDto;

  @ApiPropertyOptional({ type: SurfaceDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SurfaceDataDto)
  mesial?: SurfaceDataDto;

  @ApiPropertyOptional({ type: SurfaceDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SurfaceDataDto)
  distal?: SurfaceDataDto;

  @ApiPropertyOptional({ type: SurfaceDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SurfaceDataDto)
  occlusal?: SurfaceDataDto;

  @ApiPropertyOptional({ description: 'Clinical notes for tooth' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOdontogramDto {
  @ApiProperty({ type: [UpdateToothDto], description: 'Teeth to update' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateToothDto)
  teeth!: UpdateToothDto[];
}
