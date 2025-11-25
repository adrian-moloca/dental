/**
 * TOTP Enrollment DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for TOTP enrollment
 */
export const EnrollTOTPSchema = z.object({
  organizationId: UUIDSchema,
  factorName: z
    .string()
    .min(1, 'Factor name is required')
    .max(100, 'Factor name must not exceed 100 characters')
    .trim(),
});

/**
 * TOTP enrollment DTO type
 */
export type EnrollTOTPDto = z.infer<typeof EnrollTOTPSchema>;

/**
 * TOTP enrollment DTO class for Swagger documentation
 */
export class EnrollTOTPDtoClass implements EnrollTOTPDto {
  @ApiProperty({
    description: 'Organization identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'Human-readable name for this MFA factor',
    example: 'My Authenticator App',
    minLength: 1,
    maxLength: 100,
  })
  factorName!: string;
}
