/**
 * Resend Verification Email DTO
 *
 * Data transfer object for resending email verification.
 *
 * Validation rules:
 * - email: Required, must be valid email format
 *
 * Security considerations:
 * - Rate limited to 3 requests per hour per email
 * - Returns generic success message (doesn't reveal if email exists)
 *
 * @module modules/email-verification/dto
 */

import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Resend Verification Email Request DTO
 *
 * Used for POST /auth/resend-verification endpoint
 */
export class ResendVerificationDto {
  /**
   * User email address
   *
   * Email must be valid format
   * Case-insensitive (will be normalized to lowercase)
   *
   * @example "user@example.com"
   */
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;
}

/**
 * Resend Verification Email Response DTO
 *
 * Generic response to prevent email enumeration
 */
export class ResendVerificationResponseDto {
  /**
   * Generic success message
   *
   * Same message returned whether email exists or not
   * to prevent user enumeration attacks
   *
   * @example "If an account with that email exists and is not verified, a verification email has been sent."
   */
  @ApiProperty({
    description: 'Generic success message (does not reveal if email exists)',
    example:
      'If an account with that email exists and is not verified, a verification email has been sent.',
  })
  message!: string;
}
