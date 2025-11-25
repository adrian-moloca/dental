/**
 * Tenant isolation errors
 * @module tenant
 *
 * NOTE: TenantIsolationError is defined in @dentalos/shared-auth
 * We re-export it here to provide a centralized error package
 * This avoids duplication and prevents circular dependencies
 *
 * The TenantIsolationError is part of the auth package because:
 * 1. Tenant isolation is fundamentally an authorization concern
 * 2. The auth package owns tenant context and validation
 * 3. This package depends on shared-auth, not vice versa
 */

export { TenantIsolationError } from '@dentalos/shared-auth';
