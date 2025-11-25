import { z } from 'zod';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '../../../common/types';

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
