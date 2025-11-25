import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '../schemas/product.schema';

export class CreateProductDto {
  @ApiProperty({ description: 'Unique SKU (Stock Keeping Unit)' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ProductType, description: 'Product type' })
  @IsEnum(ProductType)
  type!: ProductType;

  @ApiProperty({ description: 'Product category' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ description: 'Product sub-category' })
  @IsString()
  @IsOptional()
  subCategory?: string;

  @ApiProperty({ description: 'Unit of measure (e.g., piece, box, ml)' })
  @IsString()
  @IsNotEmpty()
  unitOfMeasure!: string;

  @ApiPropertyOptional({ description: 'Cost price per unit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @ApiPropertyOptional({ description: 'Selling price per unit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellPrice?: number;

  @ApiPropertyOptional({ description: 'Reorder point (minimum quantity before alert)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderPoint?: number;

  @ApiPropertyOptional({ description: 'Quantity to order when below reorder point' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderQuantity?: number;

  @ApiPropertyOptional({ description: 'Safety stock level' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  safetyStockLevel?: number;

  @ApiPropertyOptional({ description: 'Supplier IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supplierIds?: string[];

  @ApiPropertyOptional({ description: 'Preferred supplier ID' })
  @IsString()
  @IsOptional()
  preferredSupplierId?: string;

  @ApiPropertyOptional({ description: 'Requires lot number tracking' })
  @IsBoolean()
  @IsOptional()
  requiresLot?: boolean;

  @ApiPropertyOptional({ description: 'Requires serial number tracking' })
  @IsBoolean()
  @IsOptional()
  requiresSerial?: boolean;

  @ApiPropertyOptional({ description: 'Requires sterilization' })
  @IsBoolean()
  @IsOptional()
  requiresSterilization?: boolean;

  @ApiPropertyOptional({ description: 'Has expiration date' })
  @IsBoolean()
  @IsOptional()
  hasExpiration?: boolean;

  @ApiPropertyOptional({ description: 'Days before expiration to warn' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  expirationWarningDays?: number;

  @ApiPropertyOptional({ description: 'Temperature controlled storage required' })
  @IsBoolean()
  @IsOptional()
  isTemperatureControlled?: boolean;

  @ApiPropertyOptional({ description: 'Minimum storage temperature (Celsius)' })
  @IsNumber()
  @IsOptional()
  storageTemperatureMin?: number;

  @ApiPropertyOptional({ description: 'Maximum storage temperature (Celsius)' })
  @IsNumber()
  @IsOptional()
  storageTemperatureMax?: number;

  @ApiPropertyOptional({ description: 'Manufacturer name' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Manufacturer part number' })
  @IsString()
  @IsOptional()
  manufacturerPartNumber?: string;

  @ApiPropertyOptional({ description: 'Barcode' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Image URLs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: 'Clinic IDs where product is available', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  clinicIds?: string[];
}
