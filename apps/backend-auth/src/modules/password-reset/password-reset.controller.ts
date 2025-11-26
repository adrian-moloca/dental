/**
 * Password Reset Controller
 *
 * REST API endpoints for password reset functionality.
 *
 * Security:
 * - All routes are public (no JWT required)
 * - Rate limiting applied to prevent abuse
 * - Generic responses prevent user enumeration
 *
 * Endpoints:
 * - POST /auth/forgot-password: Request password reset (rate-limited: 3/5min per IP)
 * - POST /auth/reset-password: Complete password reset with token
 *
 * @module modules/password-reset
 */

import { Controller, Post, Body, Req, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { PasswordResetService } from './password-reset.service';
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto';
import { Public } from '../../decorators/public.decorator';

/**
 * Password Reset Controller
 *
 * Handles password reset flow:
 * 1. User requests reset via email (forgot-password)
 * 2. User completes reset with token and new password (reset-password)
 */
@ApiTags('Password Reset')
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  /**
   * Request password reset
   *
   * Public endpoint (no JWT required).
   * Rate limited to 3 requests per 5 minutes per IP to prevent abuse.
   *
   * Security:
   * - Same response whether email exists or not (prevents enumeration)
   * - Token sent only if email exists and user is active
   * - Multiple requests invalidate previous tokens (only latest valid)
   *
   * Steps:
   * 1. Validate email format (DTO validation)
   * 2. Find user by email
   * 3. Generate secure token if user exists and is active
   * 4. Send email with reset link
   * 5. Return generic success message
   *
   * @param dto - Forgot password request with email
   * @param ip - Request IP address (for logging and security)
   * @param req - Express request (for user agent)
   * @returns Generic success message
   */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Request a password reset link to be sent via email. Returns generic success message to prevent email enumeration.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Generic success response (same whether email exists or not)',
    type: ForgotPasswordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid email format',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid email format'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded (3 requests per 5 minutes per IP)',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many requests',
        error: 'Too Many Requests',
      },
    },
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Ip() ip: string,
    @Req() req: Request
  ): Promise<ForgotPasswordResponseDto> {
    const userAgent = req.headers['user-agent'];
    return this.passwordResetService.forgotPassword(dto, ip, userAgent);
  }

  /**
   * Reset password with token
   *
   * Public endpoint (no JWT required).
   * Rate limited to 10 requests per minute per IP.
   *
   * Security:
   * - Token must be valid, not expired, and not used
   * - Password strength validated (12+ chars, uppercase, lowercase, digit, special)
   * - All user sessions invalidated after successful reset
   * - Token deleted after use (one-time use)
   *
   * Steps:
   * 1. Validate token format and password strength (DTO validation)
   * 2. Find token in database (hashed lookup)
   * 3. Validate token not expired or used
   * 4. Hash new password
   * 5. Update user password
   * 6. Invalidate all user sessions
   * 7. Delete used token
   * 8. Return success
   *
   * @param dto - Reset password request with token and new password
   * @returns Success message
   * @throws UnauthorizedException if token invalid, expired, or used
   */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Complete password reset by providing reset token and new password. Token is validated and used once only.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successful',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid token format or weak password',
    schema: {
      examples: {
        invalidToken: {
          summary: 'Invalid token format',
          value: {
            statusCode: 400,
            message: ['Invalid token format', 'Token must be 64 hex characters'],
            error: 'Bad Request',
          },
        },
        weakPassword: {
          summary: 'Weak password',
          value: {
            statusCode: 400,
            message: [
              'Password must be at least 12 characters',
              'Password must contain at least one uppercase letter',
              'Password must contain at least one lowercase letter',
              'Password must contain at least one digit',
              'Password must contain at least one special character',
            ],
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid, expired, or already-used token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired reset token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded (10 requests per minute)',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many requests',
        error: 'Too Many Requests',
      },
    },
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.passwordResetService.resetPassword(dto);
  }
}
