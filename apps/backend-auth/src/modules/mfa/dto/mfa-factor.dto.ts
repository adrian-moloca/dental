/**
 * MFA Factor Response DTO
 * @module mfa/dto
 */

import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { UUIDSchema, ISODateStringSchema } from '@dentalos/shared-validation';

/**
 * MFA Factor Type enum
 */
export enum MfaFactorTypeDto {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  WEBAUTHN = 'webauthn',
  BACKUP_CODE = 'backup_code',
}

/**
 * Zod schema for MFA factor response
 */
export const MfaFactorResponseSchema = z.object({
  id: UUIDSchema,
  factorType: z.nativeEnum(MfaFactorTypeDto),
  factorName: z.string().optional(),
  isEnabled: z.boolean(),
  isPrimary: z.boolean(),
  lastUsedAt: ISODateStringSchema.optional(),
  createdAt: ISODateStringSchema,
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
});

/**
 * MFA factor response DTO type
 */
export type MfaFactorResponseDto = z.infer<typeof MfaFactorResponseSchema>;

/**
 * MFA factor response DTO class for Swagger documentation
 */
export class MfaFactorResponseDtoClass implements MfaFactorResponseDto {
  @ApiProperty({
    description: 'MFA factor identifier',
    example: '660e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Type of MFA factor',
    enum: MfaFactorTypeDto,
    example: MfaFactorTypeDto.TOTP,
  })
  factorType!: MfaFactorTypeDto;

  @ApiProperty({
    description: 'Human-readable factor name',
    example: 'My Authenticator App',
    required: false,
  })
  factorName?: string;

  @ApiProperty({
    description: 'Whether this factor is currently enabled',
    example: true,
  })
  isEnabled!: boolean;

  @ApiProperty({
    description: 'Whether this is the primary MFA factor',
    example: true,
  })
  isPrimary!: boolean;

  @ApiProperty({
    description: 'Last time this factor was used for authentication',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
    required: false,
  })
  lastUsedAt?: string;

  @ApiProperty({
    description: 'Factor creation timestamp',
    example: '2024-01-01T00:00:00Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Phone number (for SMS factors only)',
    example: '+14155552671',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Email address (for email factors only)',
    example: 'user@example.com',
    required: false,
  })
  email?: string;
}
