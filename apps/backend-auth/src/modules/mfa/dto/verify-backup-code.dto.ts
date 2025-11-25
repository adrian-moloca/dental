/**
 * Verify Backup Code DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for backup code verification
 */
export const VerifyBackupCodeSchema = z.object({
  organizationId: UUIDSchema,
  code: z
    .string()
    .length(8, 'Backup code must be exactly 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Backup code must contain only uppercase letters and numbers'),
});

/**
 * Backup code verification DTO type
 */
export type VerifyBackupCodeDto = z.infer<typeof VerifyBackupCodeSchema>;

/**
 * Backup code verification DTO class for Swagger documentation
 */
export class VerifyBackupCodeDtoClass implements VerifyBackupCodeDto {
  @ApiProperty({
    description: 'Organization identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: '8-character backup code',
    example: 'ABCD1234',
    minLength: 8,
    maxLength: 8,
    pattern: '^[A-Z0-9]+$',
  })
  code!: string;
}
