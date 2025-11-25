/**
 * Generate Backup Codes DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for backup code generation
 */
export const GenerateBackupCodesSchema = z.object({
  organizationId: UUIDSchema,
});

/**
 * Backup code generation DTO type
 */
export type GenerateBackupCodesDto = z.infer<typeof GenerateBackupCodesSchema>;

/**
 * Backup code generation DTO class for Swagger documentation
 */
export class GenerateBackupCodesDtoClass implements GenerateBackupCodesDto {
  @ApiProperty({
    description: 'Organization identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: string;
}
