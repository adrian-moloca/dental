/**
 * RequireMFA Decorator - Mark routes that require MFA verification
 *
 * Responsibilities:
 * - Set metadata to indicate MFA requirement
 * - Work with RequireMfaGuard to enforce MFA
 * - Provide declarative API for route protection
 *
 * Usage:
 * ```typescript
 * @RequireMFA()
 * @Get('/sensitive-data')
 * async getSensitiveData() {
 *   // This route requires MFA verification
 * }
 * ```
 *
 * @module RequireMfaDecorator
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for MFA requirement
 */
export const REQUIRE_MFA_KEY = 'requireMfa';

/**
 * Decorator to mark routes that require MFA verification
 *
 * @returns Decorator function
 */
export const RequireMFA = () => SetMetadata(REQUIRE_MFA_KEY, true);
