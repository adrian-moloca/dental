/**
 * TOTP Verification DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for TOTP verification
 */
export const VerifyTOTPSchema = z.object({
  organizationId: UUIDSchema,
  factorId: UUIDSchema,
  token: z
    .string()
    .length(6, 'TOTP token must be exactly 6 digits')
    .regex(/^\d{6}$/, 'TOTP token must contain only digits'),
});

/**
 * TOTP verification DTO type
 */
export type VerifyTOTPDto = z.infer<typeof VerifyTOTPSchema>;

/**
 * TOTP verification DTO class for Swagger documentation
 */
export class VerifyTOTPDtoClass implements VerifyTOTPDto {
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
    description: '6-digit TOTP token from authenticator app',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    pattern: '\\d{6}',
  })
  token!: string;
}
