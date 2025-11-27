/**
 * JWT Authentication Strategy for Scheduling Service
 *
 * @security CRITICAL: Algorithm Confusion Attack Prevention
 * - ONLY RS256 algorithm is permitted
 * - Uses public key for verification (asymmetric)
 * - Validates JWT signature using RSA public key from auth service
 *
 * The auth service signs tokens with the private key (RS256).
 * This service verifies tokens using the corresponding public key.
 *
 * @see CVE-2015-9235 - Algorithm confusion vulnerability
 * @see CVE-2016-10555 - jsonwebtoken algorithm confusion
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUserData } from '../decorators/current-user.decorator';

/**
 * Decode a PEM key from base64 if it appears to be base64-encoded
 */
function decodeKeyIfBase64(key: string | undefined): string | undefined {
  if (!key) return undefined;
  if (key.includes('-----BEGIN')) return key;
  try {
    const decoded = Buffer.from(key, 'base64').toString('utf-8');
    if (decoded.includes('-----BEGIN')) return decoded;
  } catch {
    // Not valid base64
  }
  return key;
}

/**
 * Allowed JWT algorithms
 * SECURITY: Only RS256 is permitted to prevent algorithm confusion attacks
 */
const ALLOWED_JWT_ALGORITHMS: 'RS256'[] = ['RS256'];

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
}

/**
 * JWT Strategy
 *
 * Validates JWT tokens and extracts user information.
 *
 * @security
 * - Uses RS256 (asymmetric) algorithm only
 * - Verifies tokens using public key from auth service
 * - Never accepts HS256/HS384/HS512 to prevent algorithm confusion
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // Get the RSA public key for token verification (supports base64-encoded keys)
    const jwtPublicKey = decodeKeyIfBase64(configService.get<string>('JWT_ACCESS_PUBLIC_KEY'));

    if (!jwtPublicKey) {
      throw new Error(
        'JWT_ACCESS_PUBLIC_KEY environment variable is required for RS256 token verification. ' +
          'This is the public key from the auth service used to verify JWT signatures.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // SECURITY: Use public key for RS256 verification
      secretOrKey: jwtPublicKey,
      // SECURITY CRITICAL: Only allow RS256 algorithm
      // This prevents algorithm confusion attacks where an attacker
      // could craft a token with alg:HS256 and sign it using the public key
      algorithms: ALLOWED_JWT_ALGORITHMS,
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserData> {
    // Validate required claims for tenant isolation
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing user ID (sub claim)');
    }

    if (!payload.organizationId && !payload.tenantId) {
      throw new UnauthorizedException(
        'Invalid token: missing organizationId/tenantId claim (required for tenant isolation)',
      );
    }

    return {
      userId: payload.sub,
      tenantId: payload.tenantId || payload.organizationId,
      organizationId: payload.organizationId || payload.tenantId,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
