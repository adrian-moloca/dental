/**
 * Email Verification DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for email verification
 */
export const VerifyEmailSchema = z.object({
  organizationId: UUIDSchema,
  factorId: UUIDSchema,
  code: z
    .string()
    .length(6, 'Email code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Email code must contain only digits'),
});

/**
 * Email verification DTO type
 */
export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;

/**
 * Email verification DTO class for Swagger documentation
 */
export class VerifyEmailDtoClass implements VerifyEmailDto {
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
    description: '6-digit email verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    pattern: '\\d{6}',
  })
  code!: string;
}
