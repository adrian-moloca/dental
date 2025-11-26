/**
 * Forgot Password DTO
 *
 * Request payload for initiating password reset flow.
 * User provides email address to receive reset link.
 *
 * Security Considerations:
 * - Always return same response regardless of email existence (prevent enumeration)
 * - Rate limiting applied at controller level to prevent abuse
 * - Email validation ensures proper format
 *
 * @module modules/password-reset/dto
 */

import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for forgot password request
 *
 * User submits email address to receive password reset instructions.
 */
export class ForgotPasswordDto {
  /**
   * Email address of the user requesting password reset
   *
   * Validation:
   * - Must be valid email format
   * - Case-insensitive matching
   * - Trimmed of whitespace
   *
   * @example "user@clinic.com"
   */
  @ApiProperty({
    description: 'Email address to send password reset link',
    example: 'user@clinic.com',
    type: String,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}

/**
 * Response DTO for forgot password request
 *
 * SECURITY: Generic message that doesn't reveal if email exists
 * This prevents user enumeration attacks
 */
export class ForgotPasswordResponseDto {
  /**
   * Generic success message
   * Same message returned whether email exists or not
   */
  @ApiProperty({
    description: 'Generic success message (same regardless of email existence)',
    example: 'If an account with that email exists, a password reset link has been sent.',
  })
  message!: string;
}
