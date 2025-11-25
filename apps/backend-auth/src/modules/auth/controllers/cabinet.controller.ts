/**
 * Cabinet Controller
 *
 * REST API endpoints for cabinet management and selection.
 * Handles cabinet listing, selection during login, and switching between cabinets.
 *
 * Security considerations:
 * - Cabinet access validated against user-cabinet relationships
 * - Subscription context included in JWT tokens
 * - Rate limiting applied to public endpoints
 * - Tenant isolation enforced through organizationId
 *
 * Endpoints:
 * - GET /auth/cabinets: List user's accessible cabinets (protected)
 * - POST /auth/login-select-cabinet: Select cabinet during login (public, rate-limited)
 * - POST /auth/switch-cabinet: Switch to different cabinet (protected)
 *
 * Edge cases handled:
 * - User has no cabinets → returns empty array
 * - Cabinet not found → 404 Not Found
 * - Unauthorized cabinet access → 403 Forbidden
 * - Inactive cabinets → 403 Forbidden
 * - Expired subscriptions → allowed but flagged in response
 * - Rate limit exceeded → 429 Too Many Requests
 *
 * @module modules/auth/controllers
 */

import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import {
  SelectOrgDto,
  SelectCabinetDto,
  CabinetListResponseDto,
  CabinetSelectionResponseDto,
} from '../dto';
import { Public } from '../../../decorators/public.decorator';
import { AuthThrottle } from '../../../decorators/auth-throttle.decorator';
import type { CurrentUser as CurrentUserType } from '@dentalos/shared-auth';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { AuthenticationError } from '@dentalos/shared-errors';

/**
 * Cabinet controller
 *
 * Manages cabinet selection and switching with subscription context.
 * All routes are under /auth prefix (configured in AuthModule).
 */
@ApiTags('Cabinets')
@Controller('auth')
export class CabinetController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get list of cabinets user has access to
   *
   * Protected endpoint (requires valid JWT).
   * Returns list of cabinets with subscription information.
   *
   * Steps:
   * 1. Extract user from JWT
   * 2. Fetch user's cabinet assignments
   * 3. Enrich with subscription data
   * 4. Return cabinet list
   *
   * Edge cases:
   * - User has no cabinets → returns empty array
   * - Cabinet or subscription not found → skipped (logged)
   * - Subscription service unavailable → graceful degradation
   * - Missing JWT → 401 Unauthorized
   *
   * @param user - Current user from JWT
   * @returns CabinetListResponseDto with cabinet list
   */
  @Get('cabinets')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of cabinets user has access to',
    description:
      'Retrieve all cabinets the authenticated user has access to, including subscription information.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cabinet list retrieved successfully',
    type: CabinetListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated - missing or invalid JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async getCabinets(@CurrentUser() user: CurrentUserType): Promise<CabinetListResponseDto> {
    return this.authService.getUserCabinets(user.userId, user.tenantContext.organizationId);
  }

  /**
   * Select cabinet and get JWT with subscription context
   *
   * Public endpoint (no JWT required) - used after organization selection.
   * Rate limited to 10 requests/minute per IP.
   *
   * This endpoint is called after user selects an organization and needs
   * to select a cabinet. It validates user access to the cabinet and
   * returns JWT tokens with full subscription context.
   *
   * Steps:
   * 1. Validate user has access to selected cabinet
   * 2. Fetch cabinet and subscription details
   * 3. Create session with device metadata
   * 4. Generate JWT with cabinet and subscription context
   * 5. Return tokens with cabinet info
   *
   * Edge cases:
   * - User doesn't have access to cabinet → 403 Forbidden
   * - Cabinet not found → 404 Not Found
   * - Cabinet inactive → 403 Forbidden
   * - Subscription expired → still allows login but includes status
   * - Rate limit exceeded → 429 Too Many Requests
   *
   * SECURITY:
   * - Requires email and password re-verification
   * - Validates user-cabinet relationship
   * - Enforces tenant isolation
   *
   * @param body - Email, password, organizationId, and cabinetId
   * @param request - HTTP request for device metadata
   * @returns CabinetSelectionResponseDto with tokens and cabinet info
   */
  @Public()
  @AuthThrottle()
  @Post('login-select-cabinet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Select cabinet and complete login with subscription context',
    description:
      'After organization selection, use this endpoint to select a cabinet and receive JWT tokens with full subscription context. Requires email, password, organizationId, and cabinetId.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cabinet selected successfully, tokens issued',
    type: CabinetSelectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid format',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid cabinet ID format'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to cabinet',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have access to this cabinet',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cabinet not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cabinet not found',
        error: 'Not Found',
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
  async loginSelectCabinet(
    @Body() body: SelectOrgDto & SelectCabinetDto,
    @Req() request: Request
  ): Promise<CabinetSelectionResponseDto> {
    // First, authenticate user with org selection
    const loginDto: SelectOrgDto = {
      email: body.email,
      password: body.password,
      organizationId: body.organizationId,
    };

    // Authenticate and get user
    const user = await this.validateUserCredentials(loginDto);

    // Then select cabinet
    const cabinetDto: SelectCabinetDto = {
      cabinetId: body.cabinetId,
    };

    return this.authService.selectCabinet(cabinetDto, request, user);
  }

  /**
   * Switch to a different cabinet
   *
   * Protected endpoint (requires valid JWT).
   * Invalidates current session and creates new one with new cabinet context.
   *
   * Steps:
   * 1. Validate user has access to new cabinet
   * 2. Fetch cabinet and subscription details
   * 3. Invalidate current session
   * 4. Create new session with new cabinet context
   * 5. Generate new JWT with cabinet and subscription context
   * 6. Return new tokens
   *
   * Edge cases:
   * - User doesn't have access to cabinet → 403 Forbidden
   * - Cabinet not found → 404 Not Found
   * - Cabinet inactive → 403 Forbidden
   * - Current session already invalid → proceed anyway (idempotent)
   * - Subscription expired → still allows switch but includes status
   * - Missing JWT → 401 Unauthorized
   *
   * SECURITY:
   * - Validates user-cabinet relationship
   * - Invalidates old session to prevent token reuse
   * - Creates new session with device metadata
   * - Enforces tenant isolation
   *
   * @param dto - Cabinet selection data
   * @param user - Current user from JWT
   * @param request - HTTP request for device metadata
   * @returns CabinetSelectionResponseDto with new tokens
   */
  @Post('switch-cabinet')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Switch to a different cabinet',
    description:
      'Switch the current user to a different cabinet. Invalidates current session and issues new tokens with updated cabinet context.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cabinet switched successfully, new tokens issued',
    type: CabinetSelectionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid cabinet ID format',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid cabinet ID format'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated - missing or invalid JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have access to cabinet',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have access to this cabinet',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cabinet not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cabinet not found',
        error: 'Not Found',
      },
    },
  })
  async switchCabinet(
    @Body() dto: SelectCabinetDto,
    @CurrentUser() user: CurrentUserType,
    @Req() request: Request
  ): Promise<CabinetSelectionResponseDto> {
    return this.authService.switchCabinet(
      {
        userId: user.userId,
        organizationId: user.tenantContext.organizationId,
      },
      dto,
      request,
      (user as any).sessionId // sessionId exists on CurrentUser at runtime but not in type
    );
  }

  /**
   * Helper method to validate user credentials
   * Used by loginSelectCabinet to authenticate user before cabinet selection
   *
   * @param dto - Login credentials with organization
   * @returns Authenticated User entity
   * @private
   */
  private async validateUserCredentials(dto: SelectOrgDto): Promise<any> {
    const { userRepository, passwordService } = this.authService as any;

    // Find user by email + organization
    const user = await userRepository.findByEmail(dto.email, dto.organizationId);

    if (!user) {
      throw new AuthenticationError('Invalid email or password', {
        reason: 'invalid_credentials',
      });
    }

    // Verify password
    const isPasswordValid = await passwordService.verifyPassword(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password', {
        reason: 'invalid_credentials',
      });
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('User account is not active', {
        reason: 'invalid_credentials',
      });
    }

    return user;
  }
}
