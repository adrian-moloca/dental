/**
 * Clinic Test Fixtures
 * All data is obviously fake and for testing only
 *
 * @module shared-testing/fixtures
 */

import type { ClinicId, OrganizationId } from '@dentalos/shared-types';

/**
 * Test clinic data structure
 */
export interface TestClinic {
  id: ClinicId;
  organizationId: OrganizationId;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Pre-built test clinics
 */
export const TEST_CLINICS: readonly TestClinic[] = Object.freeze([
  {
    id: 'clinic-test-001' as ClinicId,
    organizationId: 'org-test-001' as OrganizationId,
    name: 'Test Dental Clinic',
    email: 'contact@testclinic.example.com',
    phone: '+1-555-0201',
    address: {
      street: '1000 Clinic Street',
      city: 'Test City',
      state: 'TS',
      postalCode: '50001',
      country: 'US',
    },
  },
  {
    id: 'clinic-test-002' as ClinicId,
    organizationId: 'org-test-001' as OrganizationId,
    name: 'Sample Dental Center',
    email: 'info@samplecenter.example.com',
    phone: '+1-555-0202',
    address: {
      street: '2000 Sample Road',
      city: 'Sample Town',
      state: 'SM',
      postalCode: '60002',
      country: 'US',
    },
  },
]);

/**
 * Get a test clinic by index
 */
export function getTestClinic(index: number = 0): TestClinic {
  if (index < 0 || index >= TEST_CLINICS.length) {
    throw new Error(`Test clinic index ${index} out of range`);
  }
  return TEST_CLINICS[index];
}
