import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AppConfig } from '../config/configuration';

/**
 * Internal API Guard for Service-to-Service Communication
 *
 * SECURITY RESPONSIBILITIES:
 * - Validates X-Internal-API-Key header for internal service calls
 * - Prevents unauthorized service-to-service communication
 * - Uses constant-time comparison to prevent timing attacks
 * - Logs all authentication attempts for security monitoring
 *
 * THREAT MITIGATION:
 * - Prevents unauthorized internal API access (CWE-306)
 * - Protects against timing attacks (CWE-208)
 * - Enforces service mesh authentication
 *
 * USAGE:
 * @UseGuards(InternalApiGuard)
 * @Controller('internal')
 * export class InternalController {
 *   @Post('validate-availability')
 *   async validateAvailability(...) { ... }
 * }
 *
 * CONFIGURATION:
 * - INTERNAL_API_KEY environment variable (min 32 characters)
 * - Should be rotated periodically
 * - Different keys for different environments
 *
 * IMPORTANT:
 * - This guard is for internal service communication ONLY
 * - External clients should use JwtAuthGuard instead
 * - In production, combine with network-level security (VPC, service mesh)
 */
@Injectable()
export class InternalApiGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiGuard.name);
  private readonly internalApiKey: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.internalApiKey = this.configService.get('internalApi.key', { infer: true })!;

    // SECURITY: Validate API key is configured
    if (!this.internalApiKey || this.internalApiKey.length < 32) {
      this.logger.error(
        'SECURITY WARNING: INTERNAL_API_KEY is not configured or too short. ' +
          'Internal API endpoints are vulnerable.',
      );
    }
  }

  /**
   * Determines if request can proceed based on internal API key validation
   *
   * SECURITY CHECKS:
   * 1. Extract X-Internal-API-Key header
   * 2. Validate header is present and non-empty
   * 3. Use constant-time comparison to prevent timing attacks
   * 4. Block unauthorized requests with UnauthorizedException
   * 5. Log all authentication attempts
   *
   * @param context - Execution context containing HTTP request
   * @returns true if authenticated, throws UnauthorizedException otherwise
   * @throws UnauthorizedException for missing or invalid API keys
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = this.extractApiKey(request);

    // SECURITY: Log request metadata (but never the API key)
    const requestMetadata = {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      hasApiKey: !!providedKey,
    };

    // Validate API key is provided
    if (!providedKey) {
      this.logger.warn('Internal API authentication failed: Missing API key', requestMetadata);
      throw new UnauthorizedException('Missing internal API key');
    }

    // SECURITY: Use constant-time comparison to prevent timing attacks
    const isValid = this.constantTimeCompare(providedKey, this.internalApiKey);

    if (!isValid) {
      // CRITICAL SECURITY EVENT: Invalid API key attempt
      this.logger.error('SECURITY: Invalid internal API key attempt', requestMetadata);
      throw new UnauthorizedException('Invalid internal API key');
    }

    // Log successful authentication for audit trail
    this.logger.debug('Internal API authentication successful', requestMetadata);

    return true;
  }

  /**
   * Extracts API key from request headers
   *
   * Supports multiple header formats:
   * - X-Internal-API-Key (preferred)
   * - x-internal-api-key (lowercase)
   *
   * @param request - Express request object
   * @returns API key string or null if not found
   */
  private extractApiKey(request: Request): string | null {
    const apiKey =
      request.get('X-Internal-API-Key') ||
      request.get('x-internal-api-key') ||
      request.headers['x-internal-api-key'];

    if (typeof apiKey === 'string' && apiKey.trim().length > 0) {
      return apiKey.trim();
    }

    return null;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   *
   * SECURITY:
   * - Uses XOR comparison to ensure constant execution time
   * - Prevents attackers from deducing API key via timing analysis
   * - Always compares full length to maintain constant time
   *
   * @param a - First string to compare
   * @param b - Second string to compare
   * @returns true if strings are equal, false otherwise
   */
  private constantTimeCompare(a: string, b: string): boolean {
    // If lengths differ, still do comparison but return false
    // This maintains constant time even for different lengths
    const aBytes = Buffer.from(a, 'utf8');
    const bBytes = Buffer.from(b, 'utf8');

    // Compare against the longer buffer to maintain constant time
    const maxLength = Math.max(aBytes.length, bBytes.length);

    let diff = aBytes.length !== bBytes.length ? 1 : 0;

    for (let i = 0; i < maxLength; i++) {
      const aByte = i < aBytes.length ? aBytes[i] : 0;
      const bByte = i < bBytes.length ? bBytes[i] : 0;
      diff |= aByte ^ bByte;
    }

    return diff === 0;
  }
}
