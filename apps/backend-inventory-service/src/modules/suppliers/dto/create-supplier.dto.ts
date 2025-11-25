import { IsString, IsEnum, IsOptional, IsNumber, IsNotEmpty, Min, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierType } from '../schemas/supplier.schema';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Unique supplier code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Supplier name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: SupplierType, description: 'Supplier type' })
  @IsEnum(SupplierType)
  type!: SupplierType;

  @ApiPropertyOptional({ description: 'Contact person name' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Address line 1' })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Tax ID' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Payment terms (e.g., Net 30)' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Credit limit' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Lead time in days' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'Minimum order value' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumOrderValue?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
