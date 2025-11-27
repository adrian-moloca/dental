/**
 * Authentication Controller
 *
 * REST API endpoints for core authentication operations.
 * Handles user registration, login flows, token refresh, and user profile.
 *
 * Security considerations:
 * - Public routes marked with @Public() decorator
 * - Rate limiting applied via @AuthThrottle() decorator
 * - JWT authentication enforced on protected routes
 * - All errors handled by GlobalExceptionFilter
 *
 * Endpoints:
 * - POST /auth/register: Register new user (public, rate-limited)
 * - POST /auth/login: Login existing user (public, rate-limited)
 * - POST /auth/login-smart: Smart login without organizationId (public, rate-limited)
 * - POST /auth/login-select-org: Complete login by selecting organization (public, rate-limited)
 * - GET /auth/me: Get current user (protected, requires JWT)
 * - POST /auth/refresh: Refresh access and refresh tokens (public, rate-limited)
 * - POST /auth/logout: Logout current session (protected)
 *
 * Edge cases handled:
 * - Validation errors → 400 Bad Request (handled by ValidationPipe)
 * - Authentication errors → 401 Unauthorized
 * - Conflict errors → 409 Conflict
 * - Rate limit exceeded → 429 Too Many Requests
 * - Generic error messages prevent user enumeration
 *
 * @module modules/auth/controllers
 */

import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import {
  RegisterDto,
  LoginDto,
  LoginSmartDto,
  LoginSmartResponseDto,
  SelectOrgDto,
  AuthResponseDto,
  UserDto,
  RefreshTokenDto,
  LogoutDto,
} from '../dto';
import { Public } from '../../../decorators/public.decorator';
import { AuthThrottle } from '../../../decorators/auth-throttle.decorator';
import { CsrfService } from '../../csrf/csrf.service';
import type { CurrentUser as CurrentUserType } from '@dentalos/shared-auth';
import { CurrentUser } from '../../../decorators/current-user.decorator';

/**
 * Authentication controller
 *
 * Handles user registration, login, token refresh, and profile retrieval.
 * All routes are under /auth prefix (configured in AuthModule).
 *
 * Security:
 * - CSRF token is set as a cookie on all successful authentication responses
 * - Cookie uses SameSite=Strict to prevent cross-site requests
 * - Frontend must send CSRF token in X-CSRF-Token header for state-changing requests
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService
  ) {}

  /**
   * Set CSRF token cookie on response
   *
   * Sets the CSRF token as a cookie for the double-submit cookie pattern.
   * Cookie is NOT HttpOnly so JavaScript can read it to send in header.
   *
   * @param response - Express response object
   * @param csrfToken - CSRF token to set
   */
  private setCsrfCookie(response: Response, csrfToken: string): void {
    const cookieOptions = this.csrfService.getCookieOptions();
    const cookieName = this.csrfService.getCookieName();
    response.cookie(cookieName, csrfToken, cookieOptions);
  }

  /**
   * Register a new user
   *
   * Public endpoint (no JWT required).
   * Rate limited to 10 requests/minute per IP to prevent abuse.
   *
   * Steps:
   * 1. Validate request body (DTO validation)
   * 2. Check email uniqueness within organization
   * 3. Hash password and create user
   * 4. Generate JWT tokens
   * 5. Return tokens and user data
   *
   * Edge cases:
   * - Invalid email format → 400 Bad Request
   * - Weak password → 400 Bad Request
   * - Email already exists → 409 Conflict
   * - Invalid UUID format → 400 Bad Request
   * - Rate limit exceeded → 429 Too Many Requests
   *
   * @param dto - Registration data
   * @returns AuthResponseDto with tokens and user info
   */
  @Public()
  @AuthThrottle()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account with email and password. Returns JWT tokens for immediate authentication.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid email, weak password, or invalid UUID format',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Invalid email format',
          'Password must be at least 12 characters',
          'Password must contain uppercase, lowercase, digit, and special character',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists in organization',
    schema: {
      example: {
        statusCode: 409,
        message: 'A user with this email already exists in this organization',
        error: 'Conflict',
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
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.register(dto, request);
    // Set CSRF token cookie for double-submit pattern
    this.setCsrfCookie(response, authResponse.csrfToken);
    return authResponse;
  }

  /**
   * Login existing user
   *
   * Public endpoint (no JWT required).
   * Rate limited to 10 requests/minute per IP to prevent brute force attacks.
   *
   * Steps:
   * 1. Validate request body (DTO validation)
   * 2. Find user by email + organization
   * 3. Verify password
   * 4. Check user status (must be ACTIVE)
   * 5. Update last login timestamp
   * 6. Create session in Redis
   * 7. Generate JWT tokens
   * 8. Return tokens and user data
   *
   * Edge cases:
   * - User not found → 401 Unauthorized (generic message)
   * - Invalid password → 401 Unauthorized (generic message)
   * - User not active → 401 Unauthorized (specific message)
   * - Invalid email format → 400 Bad Request
   * - Invalid UUID format → 400 Bad Request
   * - Rate limit exceeded → 429 Too Many Requests
   *
   * SECURITY: Generic error messages prevent user enumeration
   *
   * @param dto - Login credentials
   * @returns AuthResponseDto with tokens and user info
   */
  @Public()
  @AuthThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticate user with email and password. Returns JWT tokens for authenticated access.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid email or UUID format',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid email format', 'Invalid organization ID format'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or user account not active',
    schema: {
      examples: {
        invalidCredentials: {
          summary: 'Invalid email or password',
          value: {
            statusCode: 401,
            message: 'Invalid email or password',
            error: 'Unauthorized',
          },
        },
        userInactive: {
          summary: 'User account not active',
          value: {
            statusCode: 401,
            message: 'User account is not active',
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
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.login(dto, request);
    // Set CSRF token cookie for double-submit pattern
    this.setCsrfCookie(response, authResponse.csrfToken);
    return authResponse;
  }

  /**
   * Smart login without organization ID
   *
   * Public endpoint (no JWT required).
   * Rate limited to 10 requests/minute per IP to prevent brute force attacks.
   *
   * This endpoint automatically discovers which organizations a user belongs to:
   * - If user belongs to single org: auto-login with tokens
   * - If user belongs to multiple orgs: return org list for selection
   * - If user not found or invalid password: return generic 401 error
   *
   * Steps:
   * 1. Find all users with this email across all organizations
   * 2. Verify password (timing-safe comparison)
   * 3. If single org: generate tokens and return complete auth response
   * 4. If multiple orgs: return organization list for user to select
   *
   * Edge cases:
   * - User not found → 401 Unauthorized (generic message)
   * - Invalid password → 401 Unauthorized (generic message)
   * - User inactive → 401 Unauthorized (generic message)
   * - Email case-insensitive matching
   * - Rate limit exceeded → 429 Too Many Requests
   *
   * SECURITY: Generic error messages prevent user enumeration
   *
   * @param dto - Login credentials (email + password, no organizationId)
   * @param request - HTTP request for session tracking
   * @returns LoginSmartResponseDto with tokens (single org) or org list (multiple orgs)
   */
  @Public()
  @AuthThrottle()
  @Post('login-smart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Smart login without organization ID',
    description:
      'Login with email and password only. Automatically discovers user organizations. Returns tokens if single org, or organization list if multiple orgs for selection.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Login successful (single org with tokens) or requires organization selection (multiple orgs)',
    type: LoginSmartResponseDto,
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
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials - email not found, wrong password, or inactive user',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
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
  async loginSmart(
    @Body() dto: LoginSmartDto,
    @Req() request: Request,
    @Res() res: Response
  ): Promise<void> {
    const result = await this.authService.loginSmart(dto, request);
    // Set CSRF cookie only when single org login succeeds (tokens are issued)
    if (!result.needsOrgSelection && result.csrfToken) {
      this.setCsrfCookie(res, result.csrfToken);
    }
    res.status(HttpStatus.OK).json(result);
  }

  /**
   * Complete login by selecting organization
   *
   * Public endpoint (no JWT required).
   * Rate limited to 10 requests/minute per IP to prevent brute force attacks.
   *
   * This endpoint is used after smart login returns multiple organizations.
   * User selects one organization from the list and submits credentials again
   * with the selected organizationId.
   *
   * Steps:
   * 1. Find user by email in selected organization
   * 2. Verify password (timing-safe comparison)
   * 3. Verify user is ACTIVE
   * 4. Validate user actually belongs to selected organization
   * 5. Update last login timestamp
   * 6. Create session with device metadata
   * 7. Generate JWT tokens
   * 8. Return complete auth response
   *
   * Edge cases:
   * - User not found in selected org → 401 Unauthorized
   * - Invalid password → 401 Unauthorized
   * - User not active → 401 Unauthorized
   * - User doesn't belong to selected org → 401 Unauthorized (security)
   * - Invalid email/UUID format → 400 Bad Request
   * - Rate limit exceeded → 429 Too Many Requests
   *
   * SECURITY:
   * - Prevents org enumeration by requiring valid password
   * - Generic error messages prevent user enumeration
   * - Validates org membership before returning tokens
   *
   * @param dto - Login credentials with selected organization ID
   * @param request - HTTP request for session tracking
   * @returns AuthResponseDto with tokens and user info
   */
  @Public()
  @AuthThrottle()
  @Post('login-select-org')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete login by selecting organization',
    description:
      'After smart login returns multiple organizations, use this endpoint to complete authentication by selecting one. Requires email, password, and selected organizationId.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful with selected organization',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid email or organization ID format',
    schema: {
      example: {
        statusCode: 400,
        message: ['Invalid email format', 'Invalid organization ID format'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'Invalid credentials, user not in selected organization, or user account not active',
    schema: {
      examples: {
        invalidCredentials: {
          summary: 'Invalid email or password',
          value: {
            statusCode: 401,
            message: 'Invalid email or password',
            error: 'Unauthorized',
          },
        },
        userInactive: {
          summary: 'User account not active',
          value: {
            statusCode: 401,
            message: 'User account is not active',
            error: 'Unauthorized',
          },
        },
        notInOrg: {
          summary: 'User not in selected organization',
          value: {
            statusCode: 401,
            message: 'Invalid email or password',
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
  async loginSelectOrg(
    @Body() dto: SelectOrgDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.loginSelectOrg(dto, request);
    // Set CSRF token cookie for double-submit pattern
    this.setCsrfCookie(response, authResponse.csrfToken);
    return authResponse;
  }

  /**
   * Get current authenticated user
   *
   * Protected endpoint (requires valid JWT).
   * No rate limiting (covered by global throttler).
   *
   * Steps:
   * 1. Extract user from JWT (handled by JwtAuthGuard)
   * 2. Fetch user from database
   * 3. Return user data
   *
   * Edge cases:
   * - Missing JWT → 401 Unauthorized (handled by JwtAuthGuard)
   * - Invalid JWT → 401 Unauthorized (handled by JwtAuthGuard)
   * - Expired JWT → 401 Unauthorized (handled by JwtAuthGuard)
   * - User deleted after token issued → 401 Unauthorized
   * - User belongs to different organization → 401 Unauthorized (tenant scoping)
   *
   * @param user - Current user from JWT (injected by decorator)
   * @returns UserDto with user information
   */
  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user information',
    description:
      'Retrieve authenticated user information using JWT token from Authorization header.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user information',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated - missing, invalid, or expired JWT token',
    schema: {
      examples: {
        missingToken: {
          summary: 'Missing JWT token',
          value: {
            statusCode: 401,
            message: 'Unauthorized',
            error: 'Unauthorized',
          },
        },
        invalidToken: {
          summary: 'Invalid or expired JWT token',
          value: {
            statusCode: 401,
            message: 'Invalid token',
            error: 'Unauthorized',
          },
        },
        userNotFound: {
          summary: 'User not found (deleted after token issued)',
          value: {
            statusCode: 401,
            message: 'User not found',
            error: 'Unauthorized',
          },
        },
      },
    },
  })
  async getCurrentUser(@CurrentUser() user: CurrentUserType): Promise<UserDto> {
    return this.authService.getCurrentUser(user.userId, user.tenantContext.organizationId);
  }

  /**
   * Refresh access and refresh tokens
   *
   * Public endpoint (no JWT required).
   * Rate limited to 20 requests/minute to prevent abuse.
   *
   * Steps:
   * 1. Validate refresh token
   * 2. Verify session is active
   * 3. Rotate session (create new, revoke old)
   * 4. Generate new access and refresh tokens
   * 5. Return new tokens
   *
   * Edge cases:
   * - Invalid refresh token → 401 Unauthorized
   * - Expired session → 401 Unauthorized
   * - Revoked session → 401 Unauthorized
   * - User not found → 401 Unauthorized
   * - User inactive → 401 Unauthorized
   * - Rate limit exceeded → 429 Too Many Requests
   *
   * @param dto - Refresh token data
   * @param request - HTTP request for device metadata
   * @returns AuthResponseDto with new tokens
   */
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access and refresh tokens',
    description:
      'Exchange a valid refresh token for new access and refresh tokens. Implements token rotation for security.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid refresh token format or UUID',
    schema: {
      example: {
        statusCode: 400,
        message: ['Refresh token is required', 'Invalid organization ID format'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
    schema: {
      examples: {
        invalidToken: {
          summary: 'Invalid refresh token',
          value: {
            statusCode: 401,
            message: 'Invalid refresh token',
            error: 'Unauthorized',
          },
        },
        expiredSession: {
          summary: 'Session expired',
          value: {
            statusCode: 401,
            message: 'Session expired',
            error: 'Unauthorized',
          },
        },
        revokedSession: {
          summary: 'Session revoked',
          value: {
            statusCode: 401,
            message: 'Session revoked: user_logout',
            error: 'Unauthorized',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded (20 requests per minute)',
    schema: {
      example: {
        statusCode: 429,
        message: 'Too many requests',
        error: 'Too Many Requests',
      },
    },
  })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.refresh(
      dto.refreshToken,
      dto.organizationId,
      request
    );
    // Set new CSRF token cookie on token refresh (prevents token fixation)
    this.setCsrfCookie(response, authResponse.csrfToken);
    return authResponse;
  }

  /**
   * Logout current session
   *
   * Protected endpoint (requires valid JWT).
   * Invalidates the specified session.
   *
   * Steps:
   * 1. Validate session belongs to current user
   * 2. Invalidate session in Redis
   * 3. Return success (204 No Content)
   *
   * Edge cases:
   * - Session not found → success (idempotent)
   * - Session belongs to different user → success (security)
   * - Session already revoked → success (idempotent)
   * - Missing JWT → 401 Unauthorized
   *
   * @param dto - Logout data with sessionId
   * @param user - Current user from JWT
   */
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout and invalidate current session',
    description: 'Invalidate the specified session for the current user.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Logout successful (session invalidated)',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error - invalid session ID format',
    schema: {
      example: {
        statusCode: 400,
        message: ['Session ID must be a valid UUID v4'],
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
  async logout(@Body() dto: LogoutDto, @CurrentUser() user: CurrentUserType): Promise<void> {
    await this.authService.logout(dto.sessionId, user.userId, user.tenantContext.organizationId);
  }
}
