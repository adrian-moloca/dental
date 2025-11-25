/**
 * JWT Configuration Schema
 * Zod schema for JWT authentication configuration
 */

import { z } from 'zod';

/**
 * JWT configuration schema
 * Validates JWT settings including secret strength and token lifetimes
 */
export const JWTConfigSchema = z.object({
  /** JWT secret key - minimum 32 characters (256 bits) for security */
  secret: z
    .string()
    .min(32, 'JWT secret must be at least 32 characters (256 bits)')
    .describe('Secret key for JWT signing and verification'),

  /** Access token time-to-live in seconds */
  accessTokenTTL: z
    .number()
    .int()
    .positive()
    .default(900)
    .describe('Access token TTL in seconds (default: 900 = 15 minutes)'),

  /** Refresh token time-to-live in seconds */
  refreshTokenTTL: z
    .number()
    .int()
    .positive()
    .default(604800)
    .describe('Refresh token TTL in seconds (default: 604800 = 7 days)'),

  /** Token issuer identifier */
  issuer: z
    .string()
    .min(1)
    .default('dentalos')
    .describe('JWT issuer claim (iss)'),

  /** Optional token audience identifier */
  audience: z
    .string()
    .min(1)
    .optional()
    .describe('JWT audience claim (aud) - optional'),
});

/**
 * Inferred TypeScript type from JWT config schema
 */
export type JWTConfig = z.infer<typeof JWTConfigSchema>;

/**
 * Load JWT configuration from environment variables
 *
 * @returns Validated JWT configuration
 * @throws ZodError if validation fails
 */
export function loadJWTConfig(): JWTConfig {
  const rawConfig = {
    secret: process.env.DENTALOS_JWT_SECRET,
    accessTokenTTL: process.env.DENTALOS_JWT_ACCESS_TOKEN_TTL
      ? parseInt(process.env.DENTALOS_JWT_ACCESS_TOKEN_TTL, 10)
      : undefined,
    refreshTokenTTL: process.env.DENTALOS_JWT_REFRESH_TOKEN_TTL
      ? parseInt(process.env.DENTALOS_JWT_REFRESH_TOKEN_TTL, 10)
      : undefined,
    issuer: process.env.DENTALOS_JWT_ISSUER,
    audience: process.env.DENTALOS_JWT_AUDIENCE,
  };

  return JWTConfigSchema.parse(rawConfig);
}
