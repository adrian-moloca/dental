/**
 * Patient Test Fixtures
 * STRICT NO PHI: All data is obviously fake and for testing only
 *
 * @module shared-testing/fixtures
 */

import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { Gender } from '@dentalos/shared-types';
import { createTestEntityFields } from '../factories/domain-entity.factory';
import {
  createTestEmail,
  createTestPhone,
  createTestPersonName,
  createTestAddress,
} from '../factories/value-object.factory';

/**
 * Test patient data structure with tenant isolation
 */
export interface TestPatient {
  id: UUID;
  organizationId: OrganizationId;
  clinicId: ClinicId;
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: Gender;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Pre-built test patients with tenant isolation (NO PHI - Obviously fake data)
 *
 * @remarks
 * - Patients 1-2: org-test-001, clinic-test-001 (same clinic)
 * - Patient 3: org-test-001, clinic-test-002 (different clinic, same org)
 * - Patient 4: org-test-002, clinic-test-003 (different org)
 */
export const TEST_PATIENTS: readonly TestPatient[] = Object.freeze([
  {
    id: 'patient-test-001' as UUID,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-001' as ClinicId,
    name: { firstName: 'Test', lastName: 'Patient' },
    email: 'test.patient1@example.com',
    phone: '+1-555-0101',
    dateOfBirth: new Date('1990-01-01'),
    gender: Gender.MALE,
    address: {
      street: '100 Test Street',
      city: 'Test City',
      state: 'TS',
      postalCode: '10001',
      country: 'US',
    },
  },
  {
    id: 'patient-test-002' as UUID,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-001' as ClinicId,
    name: { firstName: 'Sample', lastName: 'User' },
    email: 'sample.user@example.com',
    phone: '+1-555-0102',
    dateOfBirth: new Date('1985-06-15'),
    gender: Gender.FEMALE,
    address: {
      street: '200 Sample Avenue',
      city: 'Sample Town',
      state: 'SM',
      postalCode: '20002',
      country: 'US',
    },
  },
  {
    id: 'patient-test-003' as UUID,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-002' as ClinicId,
    name: { firstName: 'Demo', lastName: 'Person' },
    email: 'demo.person@example.com',
    phone: '+1-555-0103',
    dateOfBirth: new Date('2000-12-25'),
    gender: Gender.OTHER,
    address: {
      street: '300 Demo Boulevard',
      city: 'Demo City',
      state: 'DM',
      postalCode: '30003',
      country: 'US',
    },
  },
  {
    id: 'patient-test-004' as UUID,
    organizationId: 'org-test-002' as OrganizationId,
    clinicId: 'clinic-test-003' as ClinicId,
    name: { firstName: 'Cross', lastName: 'Tenant' },
    email: 'cross.tenant@example.com',
    phone: '+1-555-0104',
    dateOfBirth: new Date('1995-03-10'),
    gender: Gender.FEMALE,
    address: {
      street: '400 Cross Street',
      city: 'Cross City',
      state: 'CR',
      postalCode: '40004',
      country: 'US',
    },
  },
]);

/**
 * Get a test patient by index
 */
export function getTestPatient(index: number = 0): TestPatient {
  if (index < 0 || index >= TEST_PATIENTS.length) {
    throw new Error(`Test patient index ${index} out of range`);
  }
  return TEST_PATIENTS[index];
}
