import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
  verifyAccessToken,
  JWTError,
  JWTVerificationError,
  AccessTokenPayload,
  createCurrentUser,
  CurrentUser,
} from '@dentalos/shared-auth';
import { AppConfig } from '../config/configuration';

/**
 * JWT Authentication Guard for Enterprise Service
 *
 * SECURITY RESPONSIBILITIES:
 * - Extracts JWT from Authorization header
 * - Validates token signature and expiration
 * - Verifies token claims (sub, email, roles, organizationId)
 * - Populates request.user with CurrentUser object
 * - Blocks unauthenticated requests
 *
 * THREAT MITIGATION:
 * - Prevents unauthorized access (CWE-287: Improper Authentication)
 * - Validates token integrity (prevents token tampering)
 * - Enforces token expiration (prevents replay attacks)
 * - Supports key rotation for enhanced security
 *
 * USAGE:
 * @UseGuards(JwtAuthGuard)
 * async getResource(@Req() req: Request) {
 *   const user = req.user; // CurrentUser populated by guard
 * }
 *
 * IMPORTANT: This guard MUST be applied to all protected endpoints.
 * Public endpoints (health checks, metrics) should explicitly skip this guard.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly jwtPublicKey: string;
  private readonly jwtIssuer: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_configService: ConfigService<AppConfig>) {
    // Load JWT configuration from environment
    // SECURITY: JWT_ACCESS_PUBLIC_KEY is the RS256 public key for token verification
    // The auth service signs tokens with the private key, services verify with public key
    const rawPublicKey = this.getRequiredEnvVar('JWT_ACCESS_PUBLIC_KEY');
    // Handle base64-encoded public keys (common in Docker environments)
    this.jwtPublicKey = this.decodeKeyIfBase64(rawPublicKey);
    this.jwtIssuer = this.getEnvVar('JWT_ISSUER', 'dentalos-auth');
  }

  /**
   * Decodes base64-encoded PEM key if necessary
   * Docker environments often pass PEM keys as base64 to avoid newline issues
   */
  private decodeKeyIfBase64(key: string): string {
    // If it already looks like a PEM key, return as-is
    if (key.includes('-----BEGIN')) {
      return key;
    }
    // Try base64 decoding
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN')) {
        return decoded;
      }
    } catch {
      // Not base64, return original
    }
    return key;
  }

  /**
   * Determines if request can proceed based on JWT authentication
   *
   * SECURITY CHECKS:
   * 1. Extract Bearer token from Authorization header
   * 2. Verify token signature using RS256 public key
   * 3. Validate token expiration
   * 4. Validate required claims (sub, email, roles, organizationId)
   * 5. Validate issuer matches expected value
   * 6. Populate request.user with CurrentUser object
   *
   * @param context - Execution context containing HTTP request
   * @returns true if authenticated, throws UnauthorizedException otherwise
   * @throws UnauthorizedException for invalid, expired, or missing tokens
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn('Authentication failed: Missing token', {
        method: request.method,
        url: request.url,
        ip: request.ip,
      });
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // Verify token signature and expiration
      // SECURITY: verifyAccessToken uses RS256 algorithm (asymmetric)
      // and validates exp, iss, and required claims
      const payload: AccessTokenPayload = await verifyAccessToken(
        token,
        this.jwtPublicKey,
        this.jwtIssuer,
      );

      // Create CurrentUser object from token payload
      // SECURITY: CurrentUser contains validated identity and tenant context
      const currentUser: CurrentUser = createCurrentUser({
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles as any,
        permissions: payload.permissions || [],
        organizationId: payload.organizationId,
        clinicId: payload.clinicId,
      } as any);

      // Attach user to request for downstream handlers
      // IMPORTANT: Controllers and services can trust this user object
      (request as any).user = currentUser;

      // Log successful authentication for audit trail
      this.logger.debug('Authentication successful', {
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        clinicId: currentUser.clinicId,
        method: request.method,
        url: request.url,
      });

      return true;
    } catch (error) {
      // Handle JWT verification errors
      if (error instanceof JWTError) {
        this.logger.warn('JWT verification failed', {
          code: error.code,
          message: error.message,
          originalError: error.originalError?.message,
          method: request.method,
          url: request.url,
          ip: request.ip,
        });

        // Provide specific error messages for common failures
        switch (error.code) {
          case JWTVerificationError.TOKEN_EXPIRED:
            throw new UnauthorizedException('Token has expired. Please refresh your session.');
          case JWTVerificationError.INVALID_SIGNATURE:
            throw new UnauthorizedException('Invalid token signature');
          case JWTVerificationError.MALFORMED_TOKEN:
            throw new UnauthorizedException('Malformed authentication token');
          case JWTVerificationError.MISSING_CLAIMS:
            throw new UnauthorizedException('Token missing required claims');
          case JWTVerificationError.INVALID_ISSUER:
            throw new UnauthorizedException('Invalid token issuer');
          default:
            throw new UnauthorizedException('Token verification failed');
        }
      }

      // Handle unexpected errors
      this.logger.error('Unexpected authentication error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        method: request.method,
        url: request.url,
      });

      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Extracts JWT token from Authorization header
   *
   * SECURITY:
   * - Expects "Bearer <token>" format
   * - Validates token is non-empty after extraction
   * - Case-insensitive "Bearer" prefix check
   *
   * @param request - Express request object
   * @returns JWT token string or null if not found
   */
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Split on first space to handle "Bearer <token>"
    const parts = authHeader.split(' ');

    // Validate format: "Bearer <token>"
    if (parts.length !== 2) {
      return null;
    }

    const [scheme, token] = parts;

    // Case-insensitive "Bearer" check
    if (scheme.toLowerCase() !== 'bearer') {
      return null;
    }

    // Validate token is non-empty
    if (!token || token.trim().length === 0) {
      return null;
    }

    return token;
  }

  /**
   * Gets required environment variable or throws error
   *
   * @param key - Environment variable key
   * @returns Environment variable value
   * @throws Error if variable is not defined
   */
  private getRequiredEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not defined`);
    }
    return value;
  }

  /**
   * Gets environment variable with default value
   *
   * @param key - Environment variable key
   * @param defaultValue - Default value if not defined
   * @returns Environment variable value or default
   */
  private getEnvVar(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }
}
