/**
 * Verify Email DTO
 *
 * Data transfer object for email verification endpoint.
 *
 * Validation rules:
 * - token: Required, must be 64 hex characters (32 bytes)
 *
 * @module modules/email-verification/dto
 */

import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Verify Email Request DTO
 *
 * Used for POST /auth/verify-email endpoint
 */
export class VerifyEmailDto {
  /**
   * Email verification token
   *
   * Format: 64 hex characters (32 bytes of crypto.randomBytes)
   * Sent to user via email after registration
   *
   * @example "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
   */
  @ApiProperty({
    description: 'Email verification token (64 hex characters)',
    example: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    minLength: 64,
    maxLength: 64,
  })
  @IsNotEmpty({ message: 'Verification token is required' })
  @IsString({ message: 'Token must be a string' })
  @Length(64, 64, { message: 'Token must be exactly 64 characters' })
  @Matches(/^[a-f0-9]{64}$/, {
    message: 'Token must be 64 hexadecimal characters',
  })
  token!: string;
}

/**
 * Verify Email Response DTO
 *
 * Returned on successful email verification
 */
export class VerifyEmailResponseDto {
  /**
   * Success message
   *
   * @example "Email verified successfully. You can now log in."
   */
  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully. You can now log in.',
  })
  message!: string;

  /**
   * Whether email was verified
   *
   * @example true
   */
  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  verified!: boolean;
}
