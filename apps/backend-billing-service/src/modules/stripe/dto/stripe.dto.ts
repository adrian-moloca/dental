import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEmail, Min, IsEnum } from 'class-validator';
import { z } from 'zod';

// Zod Schemas for validation
export const CreatePaymentIntentDtoSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  patientId: z.string().min(1),
  patientEmail: z.string().email().optional(),
  patientName: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  idempotencyKey: z.string().optional(),
});

export const ConfirmPaymentDtoSchema = z.object({
  paymentIntentId: z.string().min(1),
  paymentMethodId: z.string().optional(),
});

export const CreateRefundDtoSchema = z.object({
  paymentIntentId: z.string().min(1),
  amount: z.number().positive().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  internalReason: z.string().optional(),
});

export const CreateCustomerDtoSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  patientId: z.string().min(1),
});

export const CreateSetupIntentDtoSchema = z.object({
  customerId: z.string().min(1),
});

// Class-validator DTOs for Swagger
export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Invoice ID to pay', example: '507f1f77bcf86cd799439011' })
  @IsString()
  invoiceId!: string;

  @ApiProperty({
    description: 'Amount in smallest currency unit (e.g., bani for RON)',
    example: 50000,
  })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ description: 'Currency code (ISO 4217)', example: 'RON', default: 'RON' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Patient ID making the payment', example: 'patient-123' })
  @IsString()
  patientId!: string;

  @ApiPropertyOptional({ description: 'Patient email for receipt', example: 'patient@example.com' })
  @IsEmail()
  @IsOptional()
  patientEmail?: string;

  @ApiPropertyOptional({ description: 'Patient name for receipt', example: 'Ion Popescu' })
  @IsString()
  @IsOptional()
  patientName?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Idempotency key to prevent duplicate charges' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Stripe Payment Intent ID', example: 'pi_1234567890' })
  @IsString()
  paymentIntentId!: string;

  @ApiPropertyOptional({ description: 'Stripe Payment Method ID', example: 'pm_1234567890' })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}

export class CreateRefundDto {
  @ApiProperty({ description: 'Stripe Payment Intent ID to refund', example: 'pi_1234567890' })
  @IsString()
  paymentIntentId!: string;

  @ApiPropertyOptional({
    description: 'Amount to refund (full refund if not specified)',
    example: 25000,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Refund reason for Stripe',
    enum: ['duplicate', 'fraudulent', 'requested_by_customer'],
  })
  @IsEnum(['duplicate', 'fraudulent', 'requested_by_customer'])
  @IsOptional()
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';

  @ApiPropertyOptional({ description: 'Internal refund reason/notes' })
  @IsString()
  @IsOptional()
  internalReason?: string;
}

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer email', example: 'patient@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Customer name', example: 'Ion Popescu' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Customer phone', example: '+40721234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Patient ID in our system', example: 'patient-123' })
  @IsString()
  patientId!: string;
}

export class CreateSetupIntentDto {
  @ApiProperty({ description: 'Stripe Customer ID', example: 'cus_1234567890' })
  @IsString()
  customerId!: string;
}

// Response DTOs
export class PaymentIntentResponseDto {
  @ApiProperty({ description: 'Stripe Payment Intent ID' })
  paymentIntentId!: string;

  @ApiProperty({ description: 'Client secret for Stripe.js' })
  clientSecret!: string;

  @ApiProperty({ description: 'Payment Intent status' })
  status!: string;

  @ApiProperty({ description: 'Amount in smallest currency unit' })
  amount!: number;

  @ApiProperty({ description: 'Currency code' })
  currency!: string;
}

export class RefundResponseDto {
  @ApiProperty({ description: 'Stripe Refund ID' })
  refundId!: string;

  @ApiProperty({ description: 'Refund status' })
  status!: string;

  @ApiProperty({ description: 'Refund amount' })
  amount!: number;

  @ApiProperty({ description: 'Currency code' })
  currency!: string;
}

export class CustomerResponseDto {
  @ApiProperty({ description: 'Stripe Customer ID' })
  customerId!: string;

  @ApiProperty({ description: 'Customer email' })
  email!: string;
}

export class SetupIntentResponseDto {
  @ApiProperty({ description: 'Stripe Setup Intent ID' })
  setupIntentId!: string;

  @ApiProperty({ description: 'Client secret for Stripe.js' })
  clientSecret!: string;

  @ApiProperty({ description: 'Setup Intent status' })
  status!: string;
}

export class PaymentMethodResponseDto {
  @ApiProperty({ description: 'Stripe Payment Method ID' })
  paymentMethodId!: string;

  @ApiProperty({ description: 'Payment method type' })
  type!: string;

  @ApiPropertyOptional({ description: 'Card details' })
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}
