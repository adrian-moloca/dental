/**
 * Email Enrollment DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema, EmailSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for email enrollment
 */
export const EnrollEmailSchema = z.object({
  organizationId: UUIDSchema,
  factorName: z
    .string()
    .min(1, 'Factor name is required')
    .max(100, 'Factor name must not exceed 100 characters')
    .trim(),
  email: EmailSchema,
});

/**
 * Email enrollment DTO type
 */
export type EnrollEmailDto = z.infer<typeof EnrollEmailSchema>;

/**
 * Email enrollment DTO class for Swagger documentation
 */
export class EnrollEmailDtoClass implements EnrollEmailDto {
  @ApiProperty({
    description: 'Organization identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'Human-readable name for this MFA factor',
    example: 'Work Email',
    minLength: 1,
    maxLength: 100,
  })
  factorName!: string;

  @ApiProperty({
    description: 'Email address for verification codes',
    example: 'user@example.com',
    format: 'email',
  })
  email!: string;
}
