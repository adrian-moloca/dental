import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsDate,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoodsReceiptLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  receivedQuantity!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitCost!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lotNumber!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  supplierLotNumber?: string;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expirationDate?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  manufacturedDate?: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  qualityAccepted?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateGoodsReceiptDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  purchaseOrderId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @ApiProperty({ type: [GoodsReceiptLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptLineDto)
  lines!: GoodsReceiptLineDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deliveryNote?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
