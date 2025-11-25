// Test import to verify all patient types are accessible
import {
  Gender,
  PatientStatus,
  RelationshipType,
  CommunicationChannel,
  PhoneType,
  EmailType,
  type Patient,
  type PatientRelationship,
  type PatientTimelineEvent,
  type PatientSearchCriteria,
  type DuplicatePatientMatch,
  type PatientGDPRExport,
} from './src/index';

// Test enum values
const gender: Gender = Gender.MALE;
const status: PatientStatus = PatientStatus.ACTIVE;
const relationship: RelationshipType = RelationshipType.PARENT;
const channel: CommunicationChannel = CommunicationChannel.EMAIL;
const phoneType: PhoneType = PhoneType.MOBILE;
const emailType: EmailType = EmailType.PERSONAL;

console.log('All patient types imported successfully');
