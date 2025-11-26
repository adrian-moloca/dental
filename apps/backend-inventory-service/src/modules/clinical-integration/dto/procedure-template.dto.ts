import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Material requirement DTO for procedure templates
 */
export class MaterialRequirementDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'Quantity required per procedure unit', minimum: 0.001 })
  @IsNumber()
  @Min(0.001)
  quantityPerUnit!: number;

  @ApiPropertyOptional({ description: 'Unit of measure' })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiPropertyOptional({ description: 'Whether this material is optional' })
  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;

  @ApiPropertyOptional({ description: 'Substitute product IDs' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  substitutes?: string[];

  @ApiPropertyOptional({ description: 'Notes about this material' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export enum ProcedureCategory {
  DIAGNOSTIC = 'diagnostic',
  PREVENTIVE = 'preventive',
  RESTORATIVE = 'restorative',
  ENDODONTIC = 'endodontic',
  PERIODONTIC = 'periodontic',
  PROSTHODONTIC = 'prosthodontic',
  ORAL_SURGERY = 'oral_surgery',
  ORTHODONTIC = 'orthodontic',
  IMPLANT = 'implant',
  OTHER = 'other',
}

/**
 * DTO for creating a procedure template
 */
export class CreateProcedureTemplateDto {
  @ApiProperty({ description: 'Procedure code (CDT/CPT)', example: 'D0120' })
  @IsString()
  @IsNotEmpty()
  procedureCode!: string;

  @ApiProperty({ description: 'Procedure name', example: 'Periodic oral evaluation' })
  @IsString()
  @IsNotEmpty()
  procedureName!: string;

  @ApiPropertyOptional({ description: 'Procedure category', enum: ProcedureCategory })
  @IsEnum(ProcedureCategory)
  @IsOptional()
  category?: ProcedureCategory;

  @ApiProperty({ description: 'Material requirements', type: [MaterialRequirementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequirementDto)
  materials!: MaterialRequirementDto[];

  @ApiPropertyOptional({ description: 'Auto-deduct stock on procedure completion' })
  @IsBoolean()
  @IsOptional()
  autoDeductOnComplete?: boolean;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsNumber()
  @IsOptional()
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Template notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Clinic-specific template (optional)' })
  @IsString()
  @IsOptional()
  clinicId?: string;
}

/**
 * DTO for updating a procedure template
 */
export class UpdateProcedureTemplateDto {
  @ApiPropertyOptional({ description: 'Procedure name' })
  @IsString()
  @IsOptional()
  procedureName?: string;

  @ApiPropertyOptional({ description: 'Procedure category', enum: ProcedureCategory })
  @IsEnum(ProcedureCategory)
  @IsOptional()
  category?: ProcedureCategory;

  @ApiPropertyOptional({ description: 'Material requirements', type: [MaterialRequirementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequirementDto)
  @IsOptional()
  materials?: MaterialRequirementDto[];

  @ApiPropertyOptional({ description: 'Auto-deduct stock on procedure completion' })
  @IsBoolean()
  @IsOptional()
  autoDeductOnComplete?: boolean;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsNumber()
  @IsOptional()
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Template active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Template notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Response DTO for procedure template
 */
export class ProcedureTemplateResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  procedureCode!: string;

  @ApiProperty()
  procedureName!: string;

  @ApiProperty({ enum: ProcedureCategory })
  category!: ProcedureCategory;

  @ApiProperty({ type: [MaterialRequirementDto] })
  materials!: MaterialRequirementDto[];

  @ApiProperty()
  autoDeductOnComplete!: boolean;

  @ApiPropertyOptional()
  estimatedDurationMinutes?: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  clinicId?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

/**
 * Query DTO for listing procedure templates
 */
export class QueryProcedureTemplatesDto {
  @ApiPropertyOptional({ description: 'Filter by procedure code' })
  @IsString()
  @IsOptional()
  procedureCode?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: ProcedureCategory })
  @IsEnum(ProcedureCategory)
  @IsOptional()
  category?: ProcedureCategory;

  @ApiPropertyOptional({ description: 'Filter by clinic ID' })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiPropertyOptional({ description: 'Include inactive templates' })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

/**
 * DTO for getting materials for a procedure
 */
export class GetProcedureMaterialsDto {
  @ApiProperty({ description: 'Procedure code' })
  @IsString()
  @IsNotEmpty()
  procedureCode!: string;

  @ApiPropertyOptional({ description: 'Clinic ID for clinic-specific templates' })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiPropertyOptional({ description: 'Quantity multiplier (for multiple units)', default: 1 })
  @IsNumber()
  @IsOptional()
  quantity?: number;
}

/**
 * Response for materials lookup
 */
export class ProcedureMaterialsResponseDto {
  @ApiProperty()
  procedureCode!: string;

  @ApiProperty()
  procedureName!: string;

  @ApiProperty()
  materials!: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitOfMeasure?: string;
    isOptional: boolean;
  }>;

  @ApiProperty()
  autoDeductOnComplete!: boolean;
}
