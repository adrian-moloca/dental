import { z } from 'zod';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../../../common/types';
import { PaymentTerms } from '../entities/invoice.entity';

// Zod schema for validation
export const CreateInvoiceSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

// Class-validator DTO for NestJS
export class CreateInvoiceDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId!: string;

  @ApiProperty({ description: 'Provider ID' })
  @IsString()
  providerId!: string;

  @ApiProperty({ description: 'Appointment ID', required: false })
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ description: 'Invoice issue date' })
  @IsDateString()
  issueDate!: string;

  @ApiProperty({ description: 'Invoice due date' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ description: 'Currency code', default: 'RON' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Invoice notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsString()
  @IsOptional()
  terms?: string;
}

export class UpdateInvoiceDto {
  @ApiProperty({ description: 'Provider ID', required: false })
  @IsString()
  @IsOptional()
  providerId?: string;

  @ApiProperty({ description: 'Invoice issue date', required: false })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiProperty({ description: 'Invoice due date', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ description: 'Currency code', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Invoice notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsString()
  @IsOptional()
  terms?: string;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class InvoiceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceNumber!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  providerId!: string;

  @ApiProperty()
  status!: InvoiceStatus;

  @ApiProperty()
  issueDate!: Date;

  @ApiProperty()
  dueDate!: Date;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  taxAmount!: number;

  @ApiProperty()
  discountAmount!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  amountPaid!: number;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

// ============================================
// Invoice Generation DTOs
// ============================================

/**
 * DTO for procedure data when creating invoice from appointment
 */
export class ProcedureDto {
  @ApiProperty({ description: 'Procedure ID (reference to clinical procedure)' })
  @IsString()
  procedureId!: string;

  @ApiProperty({ description: 'CDT procedure code (e.g., D0120)' })
  @IsString()
  procedureCode!: string;

  @ApiProperty({ description: 'Procedure name/description' })
  @IsString()
  procedureName!: string;

  @ApiPropertyOptional({ description: 'Tooth number (FDI notation)' })
  @IsString()
  @IsOptional()
  tooth?: string;

  @ApiPropertyOptional({ description: 'Tooth surfaces (M, O, D, B, L)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  surfaces?: string[];

  @ApiPropertyOptional({ description: 'Quantity (defaults to 1)', default: 1 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Unit price in currency' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ description: 'Discount percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Provider ID who performed procedure' })
  @IsString()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Commission rate for provider' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionRate?: number;

  @ApiPropertyOptional({ description: 'Whether VAT exempt' })
  @IsBoolean()
  @IsOptional()
  taxExempt?: boolean;

  @ApiPropertyOptional({ description: 'Tax exemption reason if exempt' })
  @IsString()
  @IsOptional()
  taxExemptionReason?: string;
}

/**
 * DTO for creating invoice from an appointment
 */
export class CreateInvoiceFromAppointmentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId!: string;

  @ApiProperty({ description: 'Patient full name' })
  @IsString()
  patientName!: string;

  @ApiProperty({ description: 'Primary provider ID' })
  @IsString()
  providerId!: string;

  @ApiProperty({ description: 'Provider full name' })
  @IsString()
  providerName!: string;

  @ApiProperty({ description: 'Procedures to include in invoice', type: [ProcedureDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcedureDto)
  procedures!: ProcedureDto[];

  @ApiPropertyOptional({ description: 'Treatment plan ID if applicable' })
  @IsString()
  @IsOptional()
  treatmentPlanId?: string;

  @ApiPropertyOptional({ description: 'Customer name for invoice (defaults to patient name)' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  @IsString()
  @IsOptional()
  customerAddress?: string;

  @ApiPropertyOptional({ description: 'Customer tax ID (CUI for Romanian companies)' })
  @IsString()
  @IsOptional()
  customerTaxId?: string;

  @ApiPropertyOptional({ description: 'Customer email for sending invoice' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Invoice series (defaults to clinic code)' })
  @IsString()
  @IsOptional()
  series?: string;

  @ApiPropertyOptional({ description: 'Payment terms', enum: PaymentTerms })
  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional({ description: 'Custom due date' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Invoice notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Auto-issue invoice after creation' })
  @IsBoolean()
  @IsOptional()
  autoIssue?: boolean;

  @ApiPropertyOptional({ description: 'Currency code (defaults to RON)', default: 'RON' })
  @IsString()
  @IsOptional()
  currency?: string;
}

/**
 * DTO for sending invoice to patient
 */
export class SendInvoiceDto {
  @ApiProperty({ description: 'Email address to send invoice to' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Custom message to include in email' })
  @IsString()
  @IsOptional()
  message?: string;
}

/**
 * DTO for cancelling invoice
 */
export class CancelInvoiceDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsString()
  reason!: string;
}

/**
 * Response DTO for invoice generation result
 */
export class InvoiceGenerationResultDto {
  @ApiProperty({ type: InvoiceResponseDto })
  invoice!: InvoiceResponseDto;

  @ApiProperty({ description: 'Number of line items created' })
  itemCount!: number;

  @ApiProperty({ description: 'Any warnings during generation', type: [String] })
  warnings!: string[];
}

/**
 * Response DTO for invoice cancellation
 */
export class InvoiceCancellationResultDto {
  @ApiProperty({ description: 'Original invoice (now voided)', type: InvoiceResponseDto })
  originalInvoice!: InvoiceResponseDto;

  @ApiProperty({ description: 'Credit note created', type: InvoiceResponseDto })
  creditNote!: InvoiceResponseDto;
}
