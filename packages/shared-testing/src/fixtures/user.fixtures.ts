/**
 * User Test Fixtures
 * All data is obviously fake and for testing only
 *
 * @module shared-testing/fixtures
 */

import type { UUID, Email, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { UserRole, UserStatus } from '@dentalos/shared-types';

/**
 * Test user data structure
 */
export interface TestUser {
  id: UUID;
  email: Email;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  status: UserStatus;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
}

/**
 * Pre-built test users
 */
export const TEST_USERS: readonly TestUser[] = Object.freeze([
  {
    id: 'user-test-001' as UUID,
    email: 'admin@example.com' as Email,
    firstName: 'Admin',
    lastName: 'User',
    roles: [UserRole.SUPER_ADMIN],
    status: UserStatus.ACTIVE,
    organizationId: 'org-test-001' as OrganizationId,
  },
  {
    id: 'user-test-002' as UUID,
    email: 'dentist@example.com' as Email,
    firstName: 'Test',
    lastName: 'Dentist',
    roles: [UserRole.DENTIST],
    status: UserStatus.ACTIVE,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-001' as ClinicId,
  },
  {
    id: 'user-test-003' as UUID,
    email: 'receptionist@example.com' as Email,
    firstName: 'Test',
    lastName: 'Receptionist',
    roles: [UserRole.RECEPTIONIST],
    status: UserStatus.ACTIVE,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-001' as ClinicId,
  },
]);

/**
 * Get a test user by index
 */
export function getTestUser(index: number = 0): TestUser {
  if (index < 0 || index >= TEST_USERS.length) {
    throw new Error(`Test user index ${index} out of range`);
  }
  return TEST_USERS[index];
}
