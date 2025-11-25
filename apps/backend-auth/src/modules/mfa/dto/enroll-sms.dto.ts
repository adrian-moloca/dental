/**
 * SMS Enrollment DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema, PhoneNumberSchema } from '@dentalos/shared-validation';

/**
 * Zod schema for SMS enrollment
 */
export const EnrollSMSSchema = z.object({
  organizationId: UUIDSchema,
  factorName: z
    .string()
    .min(1, 'Factor name is required')
    .max(100, 'Factor name must not exceed 100 characters')
    .trim(),
  phoneNumber: PhoneNumberSchema,
});

/**
 * SMS enrollment DTO type
 */
export type EnrollSMSDto = z.infer<typeof EnrollSMSSchema>;

/**
 * SMS enrollment DTO class for Swagger documentation
 */
export class EnrollSMSDtoClass implements EnrollSMSDto {
  @ApiProperty({
    description: 'Organization identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'Human-readable name for this MFA factor',
    example: 'My Mobile Phone',
    minLength: 1,
    maxLength: 100,
  })
  factorName!: string;

  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+14155552671',
    pattern: '^\\+[1-9]\\d{1,14}$',
  })
  phoneNumber!: string;
}
