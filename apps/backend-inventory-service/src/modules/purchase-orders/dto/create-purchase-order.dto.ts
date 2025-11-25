import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseOrderLineDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'Ordered quantity' })
  @IsNumber()
  @Min(0.001)
  orderedQuantity!: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax percentage' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expectedDeliveryDate?: Date;

  @ApiPropertyOptional({ description: 'Line notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @ApiProperty({ description: 'Order lines', type: [PurchaseOrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  lines!: PurchaseOrderLineDto[];

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expectedDeliveryDate?: Date;

  @ApiPropertyOptional({ description: 'Delivery location ID' })
  @IsString()
  @IsOptional()
  deliveryLocationId?: string;

  @ApiPropertyOptional({ description: 'Shipping cost' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsString()
  @IsOptional()
  internalNotes?: string;
}
