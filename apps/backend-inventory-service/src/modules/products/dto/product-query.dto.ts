import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType, ProductStatus } from '../schemas/product.schema';

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ProductType, description: 'Filter by product type' })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @ApiPropertyOptional({ enum: ProductStatus, description: 'Filter by status' })
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by supplier ID' })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Filter by clinic ID' })
  @IsString()
  @IsOptional()
  clinicId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'name' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'name';

  @ApiPropertyOptional({ description: 'Sort order (asc or desc)', default: 'asc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
