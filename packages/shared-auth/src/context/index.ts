/**
 * Authentication context types and utilities
 * @module shared-auth/context
 */

export type { CurrentUser } from './current-user';
export { createCurrentUser } from './current-user';

export type { CurrentTenant } from './current-tenant';
export {
  extractTenantContext,
  createTenantContext,
  isOrganizationLevel,
  isClinicLevel,
} from './current-tenant';

export type {
  Session,
  CreateSessionParams,
} from './session.types';
export {
  createSession,
  isSessionExpired,
  getSessionTimeRemaining,
} from './session.types';
