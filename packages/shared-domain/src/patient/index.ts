/**
 * Patient Domain exports
 * @module shared-domain/patient
 */

// Enums
export {
  Gender,
  PatientStatus,
  RelationshipType,
  CommunicationChannel,
  PhoneType,
  EmailType,
} from './patient.types';

// Value Objects and Interfaces
export type {
  PersonName,
  PhoneContact,
  EmailContact,
  PatientContacts,
  AddressValue,
  Demographics,
  MedicalFlags,
  InsuranceInfo,
  PatientInsurance,
  CommunicationPreferences,
  ConsentRecord,
} from './patient.types';

// Main Entities
export type {
  Patient,
  PatientRelationship,
  PatientTimelineEvent,
} from './patient.types';

// Search and Operations
export type {
  PatientSearchCriteria,
  DuplicatePatientMatch,
  PatientGDPRExport,
} from './patient.types';
