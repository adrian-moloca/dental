/**
 * JWT Authentication Strategy for Billing Service
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
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Allowed JWT algorithms
 * SECURITY: Only RS256 is permitted to prevent algorithm confusion attacks
 */
const ALLOWED_JWT_ALGORITHMS: 'RS256'[] = ['RS256'];

/**
 * Decode a PEM key from base64 if it appears to be base64-encoded
 */
function decodeKeyIfBase64(key: string | undefined): string | undefined {
  if (!key) return undefined;

  // If it already looks like a PEM key, return as-is
  if (key.includes('-----BEGIN')) {
    return key;
  }

  // Try to decode as base64
  try {
    const decoded = Buffer.from(key, 'base64').toString('utf-8');
    if (decoded.includes('-----BEGIN')) {
      return decoded;
    }
  } catch {
    // Not valid base64, return original
  }

  return key;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // Get the RSA public key for token verification (supports base64 encoding)
    const rawKey = configService.get<string>('JWT_ACCESS_PUBLIC_KEY');
    const jwtPublicKey = decodeKeyIfBase64(rawKey);

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

  async validate(payload: any) {
    // Validate required claims
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing user ID (sub claim)');
    }

    if (!payload.organizationId) {
      throw new UnauthorizedException(
        'Invalid token: missing organizationId claim (required for tenant isolation)',
      );
    }

    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      tenantId: payload.tenantId,
      organizationId: payload.organizationId,
      clinicId: payload.clinicId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}
