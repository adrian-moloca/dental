import { IsOptional, IsString, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StockQueryDto {
  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filter by location ID' })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Filter by lot number' })
  @IsString()
  @IsOptional()
  lotNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Show only items below reorder point' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  belowReorderPoint?: boolean;

  @ApiPropertyOptional({ description: 'Show items expiring within days' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  expiringWithinDays?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 50;
}

export class StockLevelResponseDto {
  @ApiPropertyOptional()
  productId!: string;

  @ApiPropertyOptional()
  productName!: string;

  @ApiPropertyOptional()
  productSku!: string;

  @ApiPropertyOptional()
  locationId!: string;

  @ApiPropertyOptional()
  locationName!: string;

  @ApiPropertyOptional()
  totalQuantity!: number;

  @ApiPropertyOptional()
  availableQuantity!: number;

  @ApiPropertyOptional()
  reservedQuantity!: number;

  @ApiPropertyOptional()
  reorderPoint!: number;

  @ApiPropertyOptional()
  isBelowReorderPoint!: boolean;

  @ApiPropertyOptional()
  lots!: Array<{
    lotNumber: string;
    quantity: number;
    expirationDate?: Date;
    status: string;
  }>;
}
