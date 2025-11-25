/**
 * Test data generators
 * @module shared-testing/generators
 */

// ID generators
export {
  generateFakeUUID,
  generateDeterministicUUID,
  generateFakeOrganizationId,
  generateFakeClinicId,
  generateFakeTenantId,
} from './id-generator';

// Fake data generators
export {
  generateFakeEmail,
  generateDeterministicEmail,
  generateFakePhone,
  generateFakeName,
  generateFakeFirstName,
  generateFakeLastName,
  generateFakeAddress,
  generateFakeStreet,
  generateFakeCity,
  generateFakeStateCode,
  generateFakePostalCode,
  generateFakeDescription,
  generateRandomDate,
  generateFutureDate,
  generatePastDate,
} from './fake-data-generator';
