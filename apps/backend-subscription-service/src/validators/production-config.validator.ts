/**
 * Production Configuration Validator
 *
 * Validates that production environment configurations meet security requirements.
 * Prevents deployment of insecure configurations that violate HIPAA/GDPR requirements.
 *
 * Security Checks:
 * - PostgreSQL SSL must be enabled with certificate validation
 * - JWT secrets must be strong (minimum 32 characters)
 * - Database auto-synchronization must be disabled
 * - No development/test secrets in production
 * - Stripe API keys must be production keys
 *
 * @module ProductionConfigValidator
 */

import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const logger = new Logger('ProductionConfigValidator');

/**
 * Validate production environment configuration
 * Throws error if insecure configuration detected in production
 *
 * This validator enforces the principle of "secure by default" and prevents
 * common misconfigurations that could lead to security breaches or compliance violations.
 *
 * Edge cases handled:
 * - Only validates in production environment (skips dev/test)
 * - Validates SSL as both boolean and object types
 * - Checks for common weak secrets (dev, test, example, change-me)
 * - Ensures database migrations are used instead of auto-sync
 * - Validates Stripe API keys are production keys (start with sk_live_)
 *
 * @param config - NestJS ConfigService instance
 * @throws Error if any security requirement is not met
 */
export function validateProductionConfig(config: ConfigService<any, boolean>): void {
  const nodeEnv = config.get<string>('nodeEnv');

  // Only validate in production
  if (nodeEnv !== 'production') {
    logger.log('Skipping production config validation (not production environment)');
    return;
  }

  logger.log('Validating production configuration...');

  // CRITICAL: PostgreSQL SSL must be enabled in production
  const dbSsl = config.get<boolean | object>('database.ssl');
  if (!dbSsl) {
    throw new Error(
      'CRITICAL SECURITY ERROR: PostgreSQL SSL is disabled in production. ' +
        'Set DATABASE_SSL=true and provide SSL certificates. ' +
        'This is required for HIPAA compliance and protection of PHI in transit.',
    );
  }

  // CRITICAL: If SSL is an object, rejectUnauthorized must be true
  if (typeof dbSsl === 'object' && 'rejectUnauthorized' in dbSsl) {
    if (dbSsl.rejectUnauthorized === false) {
      throw new Error(
        'CRITICAL SECURITY ERROR: PostgreSQL SSL certificate validation is disabled. ' +
          'Set DATABASE_SSL_REJECT_UNAUTHORIZED=true or remove the variable. ' +
          'Self-signed certificates without validation are insecure and violate HIPAA requirements.',
      );
    }
  }

  // CRITICAL: JWT access secret must be strong
  const jwtAccessSecret = config.get<string>('jwt.accessSecret');
  if (!jwtAccessSecret || jwtAccessSecret.length < 32) {
    throw new Error(
      'CRITICAL SECURITY ERROR: JWT access secret is too weak. ' +
        'Must be at least 32 characters in production. ' +
        'Use a cryptographically random string (e.g., openssl rand -base64 32).',
    );
  }

  // Check for common weak secrets in JWT access secret
  const weakPatterns = ['dev', 'test', 'example', 'change-me', 'change_me', 'changeme', 'default'];
  const accessSecretLower = jwtAccessSecret.toLowerCase();
  for (const pattern of weakPatterns) {
    if (accessSecretLower.includes(pattern)) {
      throw new Error(
        `CRITICAL SECURITY ERROR: JWT access secret contains '${pattern}' and appears to be a development/test value. ` +
          'Use a strong, unique secret in production. ' +
          'Generate with: openssl rand -base64 32',
      );
    }
  }

  // CRITICAL: Database synchronize must be disabled
  const dbSync = config.get<boolean>('database.synchronize');
  if (dbSync === true) {
    throw new Error(
      'CRITICAL SECURITY ERROR: Database auto-synchronization is enabled in production. ' +
        'Set DATABASE_SYNCHRONIZE=false and use migrations instead. ' +
        'Auto-sync can cause data loss and is not suitable for production databases.',
    );
  }

  // CRITICAL: CORS origins must be explicitly configured
  const corsOrigins = config.get<string[]>('cors.origins');
  if (!corsOrigins || corsOrigins.length === 0) {
    throw new Error(
      'CRITICAL SECURITY ERROR: CORS origins are not configured. ' +
        'Set CORS_ORIGINS to a comma-separated list of allowed origins. ' +
        'Never use * in production as it allows any origin to access your API.',
    );
  }

  // Check for wildcard CORS origin (security risk)
  if (corsOrigins.includes('*')) {
    throw new Error(
      'CRITICAL SECURITY ERROR: CORS is configured with wildcard (*) origin. ' +
        'This allows any website to make requests to your API. ' +
        'Specify explicit origins in CORS_ORIGINS (e.g., https://app.example.com).',
    );
  }

  // Check for localhost/127.0.0.1 in CORS origins (development remnant)
  const hasLocalhost = corsOrigins.some(
    (origin) =>
      origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0'),
  );

  if (hasLocalhost) {
    throw new Error(
      'CRITICAL SECURITY ERROR: CORS origins include localhost/127.0.0.1. ' +
        'Remove development origins from production configuration. ' +
        'Only production domains should be allowed.',
    );
  }

  // CRITICAL: Stripe API key must be production key
  const stripeApiKey = config.get<string>('stripe.apiKey');
  if (!stripeApiKey) {
    throw new Error(
      'CRITICAL CONFIGURATION ERROR: Stripe API key is not configured. ' +
        'Set STRIPE_API_KEY to your production Stripe API key.',
    );
  }

  // Check that Stripe key is production key (starts with sk_live_)
  if (!stripeApiKey.startsWith('sk_live_')) {
    throw new Error(
      'CRITICAL SECURITY ERROR: Stripe API key is not a production key. ' +
        'Production deployments must use keys starting with sk_live_. ' +
        'Current key starts with: ' +
        stripeApiKey.substring(0, 8),
    );
  }

  // CRITICAL: Stripe webhook secret must be configured
  const stripeWebhookSecret = config.get<string>('stripe.webhookSecret');
  if (!stripeWebhookSecret) {
    throw new Error(
      'CRITICAL SECURITY ERROR: Stripe webhook secret is not configured. ' +
        'Set STRIPE_WEBHOOK_SECRET to verify webhook signatures. ' +
        'Without this, webhook events cannot be validated and could be spoofed.',
    );
  }

  logger.log('✓ Production configuration validated successfully');
}
