import { z } from 'zod';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EFacturaSubmissionStatus } from '../entities/e-factura-submission.schema';

// ============================================
// Zod Schemas
// ============================================

/**
 * Validation error schema
 */
export const ValidationErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  field: z.string().optional(),
});

export type ValidationErrorInput = z.infer<typeof ValidationErrorSchema>;

/**
 * Submit invoice to E-Factura request schema
 */
export const SubmitInvoiceRequestSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  idempotencyKey: z.string().optional(),
  correlationId: z.string().optional(),
});

export type SubmitInvoiceRequestInput = z.infer<typeof SubmitInvoiceRequestSchema>;

/**
 * Retry submission request schema
 */
export const RetrySubmissionRequestSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  force: z.boolean().optional().default(false),
});

export type RetrySubmissionRequestInput = z.infer<typeof RetrySubmissionRequestSchema>;

/**
 * Cancel submission request schema
 */
export const CancelSubmissionRequestSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
});

export type CancelSubmissionRequestInput = z.infer<typeof CancelSubmissionRequestSchema>;

/**
 * List submissions query schema
 */
export const ListSubmissionsQuerySchema = z.object({
  status: z.nativeEnum(EFacturaSubmissionStatus).optional(),
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  sellerCui: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ListSubmissionsQueryInput = z.infer<typeof ListSubmissionsQuerySchema>;

/**
 * Bulk submit request schema
 */
export const BulkSubmitRequestSchema = z.object({
  invoiceIds: z.array(z.string()).min(1).max(50),
});

export type BulkSubmitRequestInput = z.infer<typeof BulkSubmitRequestSchema>;

// ============================================
// Class-Validator DTOs for NestJS
// ============================================

/**
 * Validation error DTO
 */
export class ValidationErrorDto {
  @ApiProperty({ description: 'Error code from ANAF' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Error message' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ description: 'Field that caused the error' })
  @IsString()
  @IsOptional()
  field?: string;
}

/**
 * Request DTO for submitting an invoice to E-Factura
 */
export class SubmitInvoiceRequestDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the invoice to submit',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  invoiceId!: string;

  @ApiPropertyOptional({
    description: 'Idempotency key to prevent duplicate submissions',
    example: 'tenant123:inv123:v1',
  })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    description: 'Correlation ID for distributed tracing',
  })
  @IsString()
  @IsOptional()
  correlationId?: string;
}

/**
 * Request DTO for retrying a failed submission
 */
export class RetrySubmissionRequestDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the submission to retry',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  submissionId!: string;

  @ApiPropertyOptional({
    description: 'Force retry even if max retries exceeded',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

/**
 * Request DTO for cancelling a submission
 */
export class CancelSubmissionRequestDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the submission to cancel',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  submissionId!: string;

  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Invoice was voided due to customer request',
    maxLength: 500,
  })
  @IsString()
  reason!: string;
}

/**
 * Query DTO for listing submissions
 */
export class ListSubmissionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by submission status',
    enum: EFacturaSubmissionStatus,
  })
  @IsEnum(EFacturaSubmissionStatus)
  @IsOptional()
  status?: EFacturaSubmissionStatus;

  @ApiPropertyOptional({ description: 'Filter by invoice ID' })
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiPropertyOptional({ description: 'Filter by invoice number' })
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by seller CUI' })
  @IsString()
  @IsOptional()
  sellerCui?: string;

  @ApiPropertyOptional({ description: 'Filter submissions from this date' })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter submissions until this date' })
  @IsString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

/**
 * Request DTO for bulk submission
 */
export class BulkSubmitRequestDto {
  @ApiProperty({
    description: 'Array of invoice IDs to submit',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    maxItems: 50,
  })
  @IsArray()
  @IsString({ each: true })
  invoiceIds!: string[];
}

// ============================================
// Response DTOs
// ============================================

/**
 * E-Factura submission response DTO
 */
export class EFacturaSubmissionResponseDto {
  @ApiProperty({ description: 'Submission ID' })
  id!: string;

  @ApiProperty({ description: 'Invoice ID' })
  invoiceId!: string;

  @ApiProperty({ description: 'Invoice number' })
  invoiceNumber!: string;

  @ApiPropertyOptional({ description: 'ANAF upload index' })
  uploadIndex?: string;

  @ApiPropertyOptional({ description: 'ANAF download ID' })
  downloadId?: string;

  @ApiProperty({
    description: 'Current status',
    enum: EFacturaSubmissionStatus,
  })
  status!: EFacturaSubmissionStatus;

  @ApiPropertyOptional({ description: 'Submission timestamp' })
  submittedAt?: Date;

  @ApiPropertyOptional({ description: 'Validation timestamp' })
  validatedAt?: Date;

  @ApiPropertyOptional({ description: 'Signing timestamp' })
  signedAt?: Date;

  @ApiPropertyOptional({
    description: 'Validation errors',
    type: [ValidationErrorDto],
  })
  @ValidateNested({ each: true })
  @Type(() => ValidationErrorDto)
  validationErrors?: ValidationErrorDto[];

  @ApiPropertyOptional({ description: 'Last error message' })
  lastErrorMessage?: string;

  @ApiProperty({ description: 'Number of retry attempts' })
  retryCount!: number;

  @ApiPropertyOptional({ description: 'Next retry timestamp' })
  nextRetryAt?: Date;

  @ApiProperty({ description: 'Seller CUI' })
  sellerCui!: string;

  @ApiPropertyOptional({ description: 'Buyer CUI' })
  buyerCui?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}

/**
 * E-Factura status check response DTO
 */
export class EFacturaStatusResponseDto {
  @ApiProperty({ description: 'Submission ID' })
  submissionId!: string;

  @ApiProperty({
    description: 'Current status',
    enum: EFacturaSubmissionStatus,
  })
  status!: EFacturaSubmissionStatus;

  @ApiPropertyOptional({ description: 'ANAF upload index' })
  uploadIndex?: string;

  @ApiPropertyOptional({ description: 'ANAF download ID (available when signed)' })
  downloadId?: string;

  @ApiPropertyOptional({
    description: 'Validation errors if rejected',
    type: [ValidationErrorDto],
  })
  validationErrors?: ValidationErrorDto[];

  @ApiPropertyOptional({ description: 'Status message' })
  message?: string;

  @ApiProperty({ description: 'Whether submission is in a terminal state' })
  isTerminal!: boolean;

  @ApiProperty({ description: 'Whether signed invoice can be downloaded' })
  canDownload!: boolean;
}

/**
 * Paginated submissions response DTO
 */
export class PaginatedSubmissionsResponseDto {
  @ApiProperty({
    description: 'Submissions list',
    type: [EFacturaSubmissionResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => EFacturaSubmissionResponseDto)
  data!: EFacturaSubmissionResponseDto[];

  @ApiProperty({ description: 'Total number of items' })
  total!: number;

  @ApiProperty({ description: 'Current page' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages!: number;
}

/**
 * Bulk submission result DTO
 */
export class BulkSubmissionResultDto {
  @ApiProperty({ description: 'Invoice ID' })
  invoiceId!: string;

  @ApiProperty({ description: 'Whether submission was successful' })
  success!: boolean;

  @ApiPropertyOptional({ description: 'Submission ID if successful' })
  submissionId?: string;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  error?: string;
}

/**
 * Bulk submission response DTO
 */
export class BulkSubmissionResponseDto {
  @ApiProperty({
    description: 'Results for each invoice',
    type: [BulkSubmissionResultDto],
  })
  @ValidateNested({ each: true })
  @Type(() => BulkSubmissionResultDto)
  results!: BulkSubmissionResultDto[];

  @ApiProperty({ description: 'Number of successful submissions' })
  successCount!: number;

  @ApiProperty({ description: 'Number of failed submissions' })
  failureCount!: number;
}

/**
 * Statistics response DTO
 */
export class EFacturaStatisticsDto {
  @ApiProperty({ description: 'Total submissions' })
  total!: number;

  @ApiProperty({ description: 'Pending submissions' })
  pending!: number;

  @ApiProperty({ description: 'Submitted (processing)' })
  submitted!: number;

  @ApiProperty({ description: 'Successfully signed' })
  signed!: number;

  @ApiProperty({ description: 'Rejected by ANAF' })
  rejected!: number;

  @ApiProperty({ description: 'Errors' })
  errors!: number;

  @ApiProperty({ description: 'Cancelled' })
  cancelled!: number;

  @ApiProperty({ description: 'Average processing time in ms' })
  avgProcessingTimeMs!: number;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate!: number;
}
