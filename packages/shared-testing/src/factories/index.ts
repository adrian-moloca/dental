/**
 * Test factories
 * @module shared-testing/factories
 */

// Value object factories
export {
  createTestEmail,
  createTestPhone,
  createTestPersonName,
  createTestMoney,
  createZeroMoney,
  createTestAddress,
  createTestDateRange,
  createTestTimeSlot,
  createRandomDateRange,
  createRandomTimeSlot,
} from './value-object.factory';

// Entity factories
export {
  createTestEntityFields,
  createDeletedEntityFields,
  createArchivedEntityFields,
} from './domain-entity.factory';
export type { TestEntityFields } from './domain-entity.factory';

// Event factories
export {
  fakeEventEnvelope,
  createDomainEvent,
  createCorrelatedEvent,
  createEventChain,
} from './event.factory';
