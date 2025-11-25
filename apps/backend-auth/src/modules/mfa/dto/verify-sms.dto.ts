/**
 * SMS Verification DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for SMS verification
 */
export const VerifySMSSchema = z.object({
  organizationId: UUIDSchema,
  factorId: UUIDSchema,
  code: z
    .string()
    .length(6, 'SMS code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'SMS code must contain only digits'),
});

/**
 * SMS verification DTO type
 */
export type VerifySMSDto = z.infer<typeof VerifySMSSchema>;

/**
 * SMS verification DTO class for Swagger documentation
 */
export class VerifySMSDtoClass implements VerifySMSDto {
  @ApiProperty({
    description: 'Organization identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'MFA factor identifier',
    example: '660e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  factorId!: string;

  @ApiProperty({
    description: '6-digit SMS verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    pattern: '\\d{6}',
  })
  code!: string;
}
