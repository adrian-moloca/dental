import { z } from 'zod';
import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceItemType } from '../../../common/types';

// Zod schema for validation
export const CreateInvoiceItemSchema = z.object({
  itemType: z.nativeEnum(InvoiceItemType),
  referenceId: z.string().uuid().optional(),
  code: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().positive().default(1),
  unitPrice: z.number(),
  taxRate: z.number().min(0).max(1).default(0),
  providerId: z.string().uuid().optional(),
  costOfGoodsSold: z.number().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceItemInput = z.infer<typeof CreateInvoiceItemSchema>;

// Class-validator DTO for NestJS
export class CreateInvoiceItemDto {
  @ApiProperty({ enum: InvoiceItemType })
  @IsEnum(InvoiceItemType)
  itemType!: InvoiceItemType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({ description: 'Billing code' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Item description' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Quantity', default: 1 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  unitPrice!: number;

  @ApiProperty({
    description: 'Tax rate as decimal (e.g., 0.19 for 19% Romanian VAT)',
    default: 0.19,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  providerId?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  costOfGoodsSold?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class InvoiceItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceId!: string;

  @ApiProperty({ enum: InvoiceItemType })
  itemType!: InvoiceItemType;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  totalPrice!: number;

  @ApiProperty()
  taxRate!: number;

  @ApiProperty()
  taxAmount!: number;

  @ApiProperty()
  createdAt!: Date;
}
