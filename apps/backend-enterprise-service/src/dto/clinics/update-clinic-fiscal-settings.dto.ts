import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsString,
  IsNumber,
  IsOptional,
  IsIBAN,
  Matches,
  Min,
  Max,
  ValidateNested,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Fiscal address for E-Factura (may differ from clinic physical address)
 */
export class FiscalAddressDto {
  @ApiProperty({
    description: 'Street name and number',
    example: 'Strada Victoriei 123',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  streetName!: string;

  @ApiPropertyOptional({
    description: 'Additional address line (building, floor, apartment)',
    example: 'Bloc A, Et. 2, Ap. 10',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  additionalStreetName?: string;

  @ApiProperty({
    description: 'City/locality name',
    example: 'București',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({
    description: 'County (Județ) name',
    example: 'Sector 1',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  county?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '010101',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'RO',
    default: 'RO',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  countryCode!: string;
}

/**
 * Contact information for fiscal matters
 */
export class FiscalContactDto {
  @ApiPropertyOptional({
    description: 'Contact person name for fiscal matters',
    example: 'Ion Popescu',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Phone number for fiscal contact',
    example: '+40212345678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address for fiscal/billing communications',
    example: 'contabilitate@clinica.ro',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;
}

/**
 * DTO for updating Romanian fiscal settings required for E-Factura
 *
 * E-Factura is Romania's mandatory electronic invoicing system.
 * This DTO captures all required seller information for UBL 2.1 XML generation.
 */
export class UpdateClinicFiscalSettingsDto {
  @ApiProperty({
    description:
      'CUI (Cod Unic de Identificare) - Romanian tax ID. Can be with or without RO prefix.',
    example: 'RO12345678',
    pattern: '^(RO)?\\d{2,10}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(RO)?\d{2,10}$/, {
    message: 'CUI must be 2-10 digits, optionally prefixed with RO',
  })
  cui?: string;

  @ApiProperty({
    description: 'Legal company name as registered with ONRC (Registrul Comerțului)',
    example: 'Clinica Dentară Smile SRL',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({
    description: 'Trade/commercial name if different from legal name',
    example: 'Smile Dental',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tradeName?: string;

  @ApiPropertyOptional({
    description: 'Nr. Registrul Comerțului (Company registration number)',
    example: 'J40/1234/2020',
    pattern: '^J\\d{1,2}/\\d+/\\d{4}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^J\d{1,2}\/\d+\/\d{4}$/, {
    message: 'RegCom must be in format J##/####/YYYY (e.g., J40/1234/2020)',
  })
  regCom?: string;

  @ApiPropertyOptional({
    description: 'Whether the clinic is a VAT payer (plătitor de TVA)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isVatPayer?: boolean;

  @ApiPropertyOptional({
    description: 'Default VAT rate as decimal (0.19 = 19%, 0.09 = 9%, 0 = exempt)',
    example: 0.19,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  defaultVatRate?: number;

  @ApiPropertyOptional({
    description: 'Bank account IBAN for receiving invoice payments',
    example: 'RO49AAAA1B31007593840000',
  })
  @IsOptional()
  @IsIBAN()
  iban?: string;

  @ApiPropertyOptional({
    description: 'Bank name where IBAN is held',
    example: 'Banca Transilvania',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Invoice series prefix for this clinic',
    example: 'DENT',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  invoiceSeries?: string;

  @ApiPropertyOptional({
    description: 'Starting invoice number for the series',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  invoiceStartNumber?: number;

  @ApiPropertyOptional({
    description: 'Enable E-Factura electronic invoicing to ANAF',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  eFacturaEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Registered address for fiscal documents (if different from clinic address)',
    type: () => FiscalAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FiscalAddressDto)
  fiscalAddress?: FiscalAddressDto;

  @ApiPropertyOptional({
    description: 'Contact information for fiscal matters',
    type: () => FiscalContactDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FiscalContactDto)
  fiscalContact?: FiscalContactDto;
}

/**
 * Response DTO for fiscal settings with computed fields
 */
export class ClinicFiscalSettingsResponseDto extends UpdateClinicFiscalSettingsDto {
  @ApiProperty({
    description: 'Clinic ID',
    example: '507f1f77bcf86cd799439011',
  })
  clinicId!: string;

  @ApiProperty({
    description: 'Whether fiscal settings are complete for E-Factura',
    example: true,
  })
  isConfiguredForEFactura!: boolean;

  @ApiPropertyOptional({
    description: 'List of missing required fields for E-Factura',
    example: ['cui', 'legalName', 'fiscalAddress'],
    type: [String],
  })
  missingFields?: string[];
}
