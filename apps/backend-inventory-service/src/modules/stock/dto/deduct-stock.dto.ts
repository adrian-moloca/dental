import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Material item for procedure-based stock deduction
 * Represents items used in a clinical procedure
 */
export class MaterialItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'Quantity to deduct' })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Unit of measure' })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for deducting stock using FEFO logic
 * Supports both single-item and multi-item (procedure) deductions
 */
export class DeductStockDto {
  @ApiProperty({ description: 'Location ID where stock is being deducted from' })
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiProperty({ description: 'Materials to deduct', type: [MaterialItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialItemDto)
  materials!: MaterialItemDto[];

  @ApiPropertyOptional({ description: 'Reference type (e.g., PROCEDURE, ADJUSTMENT)' })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID (e.g., procedure ID)' })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({ description: 'Reason for deduction' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Correlation ID for grouping related movements' })
  @IsString()
  @IsOptional()
  correlationId?: string;
}

/**
 * Response DTO for stock deduction operations
 */
export class DeductStockResponseDto {
  @ApiProperty({ description: 'Success status' })
  success!: boolean;

  @ApiProperty({ description: 'Movement IDs created', type: [String] })
  movementIds!: string[];

  @ApiProperty({ description: 'Details of lots used' })
  lotsUsed!: Array<{
    productId: string;
    lotNumber: string;
    quantityDeducted: number;
    expirationDate?: Date;
  }>;

  @ApiPropertyOptional({ description: 'Warnings (e.g., low stock alerts)' })
  warnings?: string[];

  @ApiProperty({ description: 'Timestamp of deduction' })
  timestamp!: Date;
}
