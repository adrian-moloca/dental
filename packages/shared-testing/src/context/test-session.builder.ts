/**
 * Test Session Builder
 * Creates Session instances for testing authentication state
 *
 * @module shared-testing/context
 */

import type { Session, CreateSessionParams, CurrentUser } from '@dentalos/shared-auth';
import { createSession } from '@dentalos/shared-auth';
import type { UUID } from '@dentalos/shared-types';
import { generateFakeUUID } from '../generators/id-generator';

/**
 * Default test session ID
 */
export const TEST_SESSION_ID = 'session-test-001' as UUID;

/**
 * Default session duration (24 hours)
 */
const DEFAULT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a test session for a user
 *
 * @param user - User who owns the session
 * @param overrides - Optional session overrides
 * @returns Session instance
 *
 * @example
 * ```typescript
 * const user = createTestUser();
 * const session = createTestSession(user);
 *
 * const customSession = createTestSession(user, {
 *   sessionId: 'custom-session-id',
 *   expiresAt: new Date(Date.now() + 3600000) // 1 hour
 * });
 * ```
 */
export function createTestSession(
  user: CurrentUser,
  overrides?: Partial<CreateSessionParams>
): Session {
  const now = new Date();
  const expiresAt = overrides?.expiresAt ?? new Date(now.getTime() + DEFAULT_SESSION_DURATION_MS);

  const params: CreateSessionParams = {
    sessionId: overrides?.sessionId ?? TEST_SESSION_ID,
    userId: user.userId,
    expiresAt,
    ipAddress: overrides?.ipAddress ?? '127.0.0.1',
    userAgent: overrides?.userAgent ?? 'test-user-agent',
    deviceId: overrides?.deviceId,
    metadata: overrides?.metadata,
  };

  return createSession(params);
}

/**
 * Creates an expired test session
 *
 * @param user - User who owns the session
 * @returns Expired session
 *
 * @example
 * ```typescript
 * const user = createTestUser();
 * const expiredSession = createExpiredSession(user);
 * ```
 */
export function createExpiredSession(user: CurrentUser): Session {
  const now = new Date();
  const expiredDate = new Date(now.getTime() - 1000); // 1 second ago

  return createTestSession(user, {
    sessionId: generateFakeUUID(),
    expiresAt: expiredDate,
  });
}

/**
 * Creates a session that will expire soon
 *
 * @param user - User who owns the session
 * @param minutesUntilExpiry - Minutes until expiry (default: 5)
 * @returns Session expiring soon
 *
 * @example
 * ```typescript
 * const user = createTestUser();
 * const expiringSession = createExpiringSoonSession(user, 5);
 * ```
 */
export function createExpiringSoonSession(
  user: CurrentUser,
  minutesUntilExpiry: number = 5
): Session {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + minutesUntilExpiry * 60 * 1000);

  return createTestSession(user, {
    sessionId: generateFakeUUID(),
    expiresAt,
  });
}

/**
 * Creates a random test session
 *
 * @param user - User who owns the session
 * @returns Random session
 */
export function createRandomSession(user: CurrentUser): Session {
  return createTestSession(user, {
    sessionId: generateFakeUUID(),
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    deviceId: generateFakeUUID(),
  });
}
