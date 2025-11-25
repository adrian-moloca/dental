import { IsString, IsNumber, IsOptional, IsNotEmpty, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for restocking inventory
 * Used for manual restocks or adjustments
 */
export class RestockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'Location ID where stock is being added' })
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiProperty({ description: 'Quantity to add' })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({ description: 'Lot number' })
  @IsString()
  @IsNotEmpty()
  lotNumber!: string;

  @ApiPropertyOptional({ description: 'Supplier lot number' })
  @IsString()
  @IsOptional()
  supplierLotNumber?: string;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expirationDate?: Date;

  @ApiPropertyOptional({ description: 'Manufactured date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  manufacturedDate?: Date;

  @ApiPropertyOptional({ description: 'Serial number (for serialized items)' })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Cost per unit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerUnit?: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ description: 'Reason for restock' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Reference type (e.g., PURCHASE_ORDER, GOODS_RECEIPT)' })
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsString()
  @IsOptional()
  referenceId?: string;
}
