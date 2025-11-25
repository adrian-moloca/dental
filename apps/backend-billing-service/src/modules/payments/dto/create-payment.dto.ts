import { z } from 'zod';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../../../common/types';

// Zod schemas
export const SplitPaymentSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
  amount: z.number().positive(),
  transactionId: z.string().optional(),
});

export const CreatePaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  patientId: z.string().uuid(),
  paymentDate: z.string().datetime(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
  confirmationNumber: z.string().optional(),
  splitPayments: z.array(SplitPaymentSchema).optional(),
  notes: z.string().optional(),
});

export const CreateRefundSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type CreateRefundInput = z.infer<typeof CreateRefundSchema>;

// Class-validator DTOs
export class SplitPaymentDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  invoiceId!: string;

  @ApiProperty()
  @IsString()
  patientId!: string;

  @ApiProperty()
  @IsDateString()
  paymentDate!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ default: 'RON' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  confirmationNumber?: string;

  @ApiProperty({ type: [SplitPaymentDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitPaymentDto)
  @IsOptional()
  splitPayments?: SplitPaymentDto[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateRefundDto {
  @ApiProperty()
  @IsString()
  paymentId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty()
  @IsString()
  reason!: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceId!: string;

  @ApiProperty()
  patientId!: string;

  @ApiProperty()
  paymentDate!: Date;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty()
  refundedAmount!: number;

  @ApiProperty()
  createdAt!: Date;
}
