/**
 * Email Verification Controller
 *
 * REST API endpoints for email verification functionality.
 *
 * Security:
 * - All routes are public (no JWT required)
 * - Rate limiting applied to prevent abuse
 * - Generic responses prevent user enumeration on resend
 *
 * Endpoints:
 * - POST /auth/verify-email: Verify email with token
 * - POST /auth/resend-verification: Resend verification email (rate-limited: 3/hour per IP)
 *
 * @module modules/email-verification
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { EmailVerificationService } from './email-verification.service';
import {
  VerifyEmailDto,
  VerifyEmailResponseDto,
  ResendVerificationDto,
  ResendVerificationResponseDto,
} from './dto';
import { Public } from '../../decorators/public.decorator';

/**
 * Email Verification Controller
 *
 * Handles email verification flow:
 * 1. User verifies email with token (verify-email)
 * 2. User requests new verification email (resend-verification)
 */
@ApiTags('Email Verification')
@Controller('auth')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  /**
   * Verify email with token
   *
   * Public endpoint (no JWT required).
   * Rate limited to 10 requests per minute per IP to prevent brute force.
   *
   * Security:
   * - Token must be valid, not expired, and not already used
   * - Email marked as verified after successful verification
   * - Token cleared after use (single-use)
   *
   * Steps:
   * 1. Validate token format (DTO validation)
   * 2. Find user by token hash
   * 3. Validate token not expired and email not already verified
   * 4. Mark email as verified
   * 5. Clear token fields
   * 6. Return success
   *
   * @param dto - Verify email request with token
   * @returns Success message
   * @throws UnauthorizedException if token invalid or expired
   * @throws BadRequestException if email already verified
   */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with token',
    description:
      'Verify user email address using the verification token sent via email. Token is single-use and expires after 24 hours.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid token format or email already verified',
    schema: {
      examples: {
        invalidToken: {
          summary: 'Invalid token format',
          value: {
            statusCode: 400,
            message: ['Token must be exactly 64 characters', 'Token must be 64 hexadecimal characters'],
            error: 'Bad Request',
          },
        },
        alreadyVerified: {
          summary: 'Email already verified',
          value: {
            statusCode: 400,
            message: 'Email is already verified',
            error: 'Bad Request',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired verification token',
    schema: {
      examples: {
        invalidToken: {
          summary: 'Invalid or expired token',
          value: {
            statusCode: 401,
            message: 'Invalid or expired verification token',
            error: 'Unauthorized',
          },
        },
        expiredToken: {
          summary: 'Expired token',
          value: {
            statusCode: 401,
            message: 'Verification token has expired. Please request a new one.',
            error: 'Unauthorized',
          },
        },
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
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    return this.emailVerificationService.verifyEmail(dto);
  }

  /**
   * Resend verification email
   *
   * Public endpoint (no JWT required).
   * Rate limited to 3 requests per hour per IP to prevent abuse.
   *
   * Security:
   * - Same response whether email exists or not (prevents enumeration)
   * - Token sent only if email exists, not verified, and user is active
   * - Multiple requests invalidate previous tokens (only latest valid)
   *
   * Steps:
   * 1. Validate email format (DTO validation)
   * 2. Find user by email
   * 3. If user exists, not verified, and active: generate new token
   * 4. Emit event for email service
   * 5. Return generic success message
   *
   * @param dto - Resend verification request with email
   * @returns Generic success message
   */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
    description:
      'Request a new verification email to be sent. Returns generic success message to prevent email enumeration.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Generic success response (same whether email exists or not)',
    type: ResendVerificationResponseDto,
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
    description: 'Rate limit exceeded (3 requests per hour per IP)',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many requests',
        error: 'Too Many Requests',
      },
    },
  })
  async resendVerification(
    @Body() dto: ResendVerificationDto
  ): Promise<ResendVerificationResponseDto> {
    return this.emailVerificationService.resendVerification(dto);
  }
}
