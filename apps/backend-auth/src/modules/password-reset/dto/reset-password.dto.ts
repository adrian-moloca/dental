/**
 * Reset Password DTO
 *
 * Request payload for completing password reset with new password.
 * User provides reset token (from email link) and new password.
 *
 * Security Considerations:
 * - Token validation (existence, expiration, one-time use)
 * - Strong password requirements enforced
 * - All user sessions invalidated after successful reset
 *
 * @module modules/password-reset/dto
 */

import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for reset password request
 *
 * User submits reset token and new password to complete password reset.
 */
export class ResetPasswordDto {
  /**
   * Password reset token from email link
   *
   * Format: 64 hex characters (32 bytes from crypto.randomBytes)
   *
   * @example "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
   */
  @ApiProperty({
    description: 'Password reset token from email link',
    example: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    minLength: 64,
    maxLength: 64,
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  @MinLength(64, { message: 'Invalid token format' })
  @MaxLength(64, { message: 'Invalid token format' })
  @Matches(/^[a-f0-9]{64}$/, { message: 'Invalid token format' })
  token!: string;

  /**
   * New password
   *
   * Requirements (NIST SP 800-63B compliant):
   * - Minimum 12 characters
   * - Maximum 128 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one digit
   * - At least one special character
   *
   * @example "MyNewSecurePassword123!"
   */
  @ApiProperty({
    description:
      'New password (min 12 chars, must include uppercase, lowercase, digit, special char)',
    example: 'MyNewSecurePassword123!',
    minLength: 12,
    maxLength: 128,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one digit' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  newPassword!: string;
}

/**
 * Response DTO for successful password reset
 */
export class ResetPasswordResponseDto {
  /**
   * Success message
   */
  @ApiProperty({
    description: 'Success message confirming password reset',
    example: 'Password has been reset successfully. You can now log in with your new password.',
  })
  message!: string;
}
