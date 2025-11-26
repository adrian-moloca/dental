import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// Zod Schemas for ANAF Response Validation
// ============================================

/**
 * ANAF upload response schema
 * Returned when submitting an invoice to ANAF
 */
export const AnafUploadResponseSchema = z.object({
  /** Upload index assigned by ANAF (success case) */
  id_incarcare: z.string().optional(),
  /** Error message (failure case) */
  eroare: z.string().optional(),
  /** Response title */
  titlu: z.string().optional(),
  /** Execution ID */
  executie: z.string().optional(),
});

export type AnafUploadResponseInput = z.infer<typeof AnafUploadResponseSchema>;

/**
 * ANAF validation error schema
 */
export const AnafValidationErrorSchema = z.object({
  /** Error code */
  cod: z.string(),
  /** Error message in Romanian */
  mesaj: z.string(),
  /** Field/XPath related to error */
  camp: z.string().optional(),
});

export type AnafValidationErrorInput = z.infer<typeof AnafValidationErrorSchema>;

/**
 * ANAF validation warning schema
 */
export const AnafValidationWarningSchema = z.object({
  /** Warning code */
  cod: z.string(),
  /** Warning message */
  mesaj: z.string(),
});

export type AnafValidationWarningInput = z.infer<typeof AnafValidationWarningSchema>;

/**
 * ANAF status check response schema
 */
export const AnafStatusResponseSchema = z.object({
  /** Current processing state */
  stare: z.enum(['in curs de procesare', 'ok', 'nok']),
  /** Download ID (available when state is 'ok') */
  id_descarcare: z.string().optional(),
  /** Error list (available when state is 'nok') */
  erori: z.array(AnafValidationErrorSchema).optional(),
  /** Warning list */
  avertismente: z.array(AnafValidationWarningSchema).optional(),
});

export type AnafStatusResponseInput = z.infer<typeof AnafStatusResponseSchema>;

/**
 * ANAF message list item schema
 */
export const AnafMessageItemSchema = z.object({
  /** Message ID */
  id: z.string(),
  /** Invoice number */
  numar_factura: z.string().optional(),
  /** Supplier CIF */
  cif_furnizor: z.string(),
  /** Client CIF */
  cif_client: z.string().optional(),
  /** Upload date */
  data_incarcare: z.string(),
  /** Message type */
  tip: z.string(),
  /** Status */
  stare: z.string(),
});

export type AnafMessageItemInput = z.infer<typeof AnafMessageItemSchema>;

/**
 * ANAF message list response schema
 */
export const AnafMessageListResponseSchema = z.object({
  /** List of messages */
  mesaje: z.array(AnafMessageItemSchema),
  /** Response title */
  titlu: z.string().optional(),
  /** Error message */
  eroare: z.string().optional(),
});

export type AnafMessageListResponseInput = z.infer<typeof AnafMessageListResponseSchema>;

/**
 * ANAF OAuth token response schema
 */
export const AnafOAuthTokenResponseSchema = z.object({
  /** Access token */
  access_token: z.string(),
  /** Token type (usually 'Bearer') */
  token_type: z.string(),
  /** Expiration time in seconds */
  expires_in: z.number(),
  /** Refresh token */
  refresh_token: z.string().optional(),
  /** Scope */
  scope: z.string().optional(),
});

export type AnafOAuthTokenResponseInput = z.infer<typeof AnafOAuthTokenResponseSchema>;

// ============================================
// Class DTOs for API Documentation
// ============================================

/**
 * ANAF upload response DTO
 */
export class AnafUploadResponseDto {
  @ApiPropertyOptional({
    description: 'Upload index assigned by ANAF',
    example: '12345678',
  })
  id_incarcare?: string;

  @ApiPropertyOptional({
    description: 'Error message if upload failed',
    example: 'Invalid XML format',
  })
  eroare?: string;

  @ApiPropertyOptional({
    description: 'Response title',
  })
  titlu?: string;

  @ApiPropertyOptional({
    description: 'Execution ID',
  })
  executie?: string;
}

/**
 * ANAF validation error DTO
 */
export class AnafValidationErrorDto {
  @ApiProperty({
    description: 'ANAF error code',
    example: 'XML_INVALID',
  })
  cod!: string;

  @ApiProperty({
    description: 'Error message in Romanian',
    example: 'Campul CUI este obligatoriu',
  })
  mesaj!: string;

  @ApiPropertyOptional({
    description: 'Field or XPath that caused the error',
    example: '/Invoice/AccountingSupplierParty/Party/PartyLegalEntity/CompanyID',
  })
  camp?: string;
}

/**
 * ANAF validation warning DTO
 */
export class AnafValidationWarningDto {
  @ApiProperty({
    description: 'Warning code',
    example: 'W001',
  })
  cod!: string;

  @ApiProperty({
    description: 'Warning message',
    example: 'Recomandam completarea campului Email',
  })
  mesaj!: string;
}

/**
 * ANAF status response DTO
 */
export class AnafStatusResponseDto {
  @ApiProperty({
    description: 'Current processing state',
    enum: ['in curs de procesare', 'ok', 'nok'],
    example: 'ok',
  })
  stare!: 'in curs de procesare' | 'ok' | 'nok';

  @ApiPropertyOptional({
    description: 'Download ID for signed invoice',
    example: '87654321',
  })
  id_descarcare?: string;

  @ApiPropertyOptional({
    description: 'Validation errors',
    type: [AnafValidationErrorDto],
  })
  erori?: AnafValidationErrorDto[];

  @ApiPropertyOptional({
    description: 'Validation warnings',
    type: [AnafValidationWarningDto],
  })
  avertismente?: AnafValidationWarningDto[];
}

/**
 * ANAF message item DTO (for listing invoices)
 */
export class AnafMessageItemDto {
  @ApiProperty({ description: 'Message ID' })
  id!: string;

  @ApiPropertyOptional({ description: 'Invoice number' })
  numar_factura?: string;

  @ApiProperty({ description: 'Supplier CIF (CUI)' })
  cif_furnizor!: string;

  @ApiPropertyOptional({ description: 'Client CIF (CUI)' })
  cif_client?: string;

  @ApiProperty({ description: 'Upload date' })
  data_incarcare!: string;

  @ApiProperty({ description: 'Message type' })
  tip!: string;

  @ApiProperty({ description: 'Status' })
  stare!: string;
}

/**
 * ANAF message list response DTO
 */
export class AnafMessageListResponseDto {
  @ApiProperty({
    description: 'List of messages',
    type: [AnafMessageItemDto],
  })
  mesaje!: AnafMessageItemDto[];

  @ApiPropertyOptional({ description: 'Response title' })
  titlu?: string;

  @ApiPropertyOptional({ description: 'Error message' })
  eroare?: string;
}

// ============================================
// Internal Response Mapping Types
// ============================================

/**
 * Normalized ANAF response for internal use
 */
export interface NormalizedAnafResponse {
  success: boolean;
  uploadIndex?: string;
  downloadId?: string;
  status: 'processing' | 'ok' | 'error';
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  warnings: Array<{
    code: string;
    message: string;
  }>;
  rawResponse?: unknown;
}

/**
 * Parse and normalize ANAF upload response
 */
export function normalizeUploadResponse(response: AnafUploadResponseInput): NormalizedAnafResponse {
  if (response.id_incarcare) {
    return {
      success: true,
      uploadIndex: response.id_incarcare,
      status: 'processing',
      errors: [],
      warnings: [],
      rawResponse: response,
    };
  }

  return {
    success: false,
    status: 'error',
    errors: response.eroare
      ? [{ code: 'UPLOAD_ERROR', message: response.eroare }]
      : [{ code: 'UNKNOWN_ERROR', message: 'Unknown upload error' }],
    warnings: [],
    rawResponse: response,
  };
}

/**
 * Parse and normalize ANAF status response
 */
export function normalizeStatusResponse(response: AnafStatusResponseInput): NormalizedAnafResponse {
  const statusMapping: Record<string, 'processing' | 'ok' | 'error'> = {
    'in curs de procesare': 'processing',
    ok: 'ok',
    nok: 'error',
  };

  return {
    success: response.stare === 'ok',
    downloadId: response.id_descarcare,
    status: statusMapping[response.stare] || 'error',
    errors: (response.erori || []).map((e) => ({
      code: e.cod,
      message: e.mesaj,
      field: e.camp,
    })),
    warnings: (response.avertismente || []).map((w) => ({
      code: w.cod,
      message: w.mesaj,
    })),
    rawResponse: response,
  };
}

/**
 * ANAF response state constants
 */
export const ANAF_STATES = {
  PROCESSING: 'in curs de procesare',
  OK: 'ok',
  NOK: 'nok',
} as const;

/**
 * Type guard for checking if ANAF response indicates success
 */
export function isAnafSuccess(response: AnafStatusResponseInput): boolean {
  return response.stare === ANAF_STATES.OK;
}

/**
 * Type guard for checking if ANAF response indicates processing
 */
export function isAnafProcessing(response: AnafStatusResponseInput): boolean {
  return response.stare === ANAF_STATES.PROCESSING;
}

/**
 * Type guard for checking if ANAF response indicates error
 */
export function isAnafError(response: AnafStatusResponseInput): boolean {
  return response.stare === ANAF_STATES.NOK;
}
