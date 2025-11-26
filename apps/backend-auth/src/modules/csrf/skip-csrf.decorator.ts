/**
 * Skip CSRF Decorator
 *
 * Marks routes or controllers to skip CSRF token validation.
 * Used by CsrfGuard to bypass CSRF checks for specific endpoints.
 *
 * USE WITH EXTREME CAUTION:
 * Only use this decorator for endpoints that:
 * 1. Cannot include CSRF tokens (e.g., webhooks from external services)
 * 2. Have alternative CSRF protections (e.g., signed request bodies)
 * 3. Are truly read-only despite using POST (rare, reconsider the design)
 *
 * NEVER use this decorator for:
 * - Standard form submissions
 * - AJAX requests that can include headers
 * - Any endpoint that modifies user data
 * - Any endpoint that triggers actions on behalf of users
 *
 * Security Review Required:
 * Every use of @SkipCsrf() should be reviewed and documented with a
 * justification for why CSRF protection cannot be applied.
 *
 * @example
 * ```typescript
 * // Webhook from payment provider - uses signature verification instead
 * @SkipCsrf()
 * @Post('webhooks/stripe')
 * handleStripeWebhook(@Body() payload: StripeWebhookPayload) {
 *   // Verify Stripe signature before processing
 * }
 * ```
 *
 * @see CsrfGuard
 * @module modules/csrf
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for skip CSRF routes
 */
export const SKIP_CSRF_KEY = 'skipCsrf';

/**
 * Skip CSRF validation decorator
 *
 * Marks a route or controller to bypass CSRF token validation.
 * Should be used sparingly and with proper justification.
 *
 * @example
 * ```typescript
 * // Skip CSRF for external webhook
 * @SkipCsrf()
 * @Post('webhooks/external')
 * handleExternalWebhook() {
 *   // This endpoint uses signature verification instead of CSRF
 * }
 * ```
 *
 * @returns Decorator function
 */
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
