/**
 * Patient Types
 *
 * Aligned with backend-patient-service DTOs
 */

export interface PhoneDto {
  type: 'mobile' | 'home' | 'work' | 'other';
  number: string;
  isPrimary?: boolean;
}

export interface EmailDto {
  type: 'personal' | 'work' | 'other';
  address: string;
  isPrimary?: boolean;
}

export interface AddressDto {
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isPrimary?: boolean;
}

/** Person info nested object for CreatePatientDto */
export interface CreatePersonInfoDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  ssn?: string;
  cnp?: string;
}

/** Contact info nested object for CreatePatientDto */
export interface CreateContactInfoDto {
  phones?: PhoneDto[];
  emails?: EmailDto[];
  addresses?: AddressDto[];
}

/** Consent info nested object for CreatePatientDto (gdprConsent is required) */
export interface CreateConsentInfoDto {
  gdprConsent: boolean;
  marketingConsent?: boolean;
  dataProcessingConsent?: boolean;
  treatmentConsent?: boolean;
  smsMarketing?: boolean;
  emailMarketing?: boolean;
  whatsappMarketing?: boolean;
}

/**
 * CreatePatientDto - matches backend nested structure
 * Required fields: clinicId, person, consent
 */
export interface CreatePatientDto {
  clinicId: string;
  patientNumber?: string;
  person: CreatePersonInfoDto;
  contacts?: CreateContactInfoDto;
  consent: CreateConsentInfoDto;
  tags?: string[];
  assignedProviderId?: string;
  referredBy?: string;
  notes?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {}

/** Photo URLs for patient profile */
export interface PhotoDto {
  url: string;
  thumbnail: string;
}

/** Person information nested in PatientDto */
export interface PersonDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  dateOfBirth: Date;
  gender: string;
  ssn?: string;
  cnp?: string;
  photo?: PhotoDto;
}

/** Allergy information */
export interface AllergyDto {
  allergen: string;
  severity?: string;
  reaction?: string;
}

/** Medical condition information */
export interface MedicalConditionDto {
  condition: string;
  icd10Code?: string;
  status?: string;
}

/** Medication information */
export interface MedicationDto {
  name: string;
  dosage?: string;
  frequency?: string;
}

/** Alert information for patient safety */
export interface AlertsDto {
  allergies: AllergyDto[];
  medicalConditions: MedicalConditionDto[];
  medications: MedicationDto[];
  flags?: string[];
}

/** Insurance coverage details */
export interface InsuranceCoverageDto {
  annual_max?: number;
  remaining?: number;
  deductible?: number;
}

/** Insurance information */
export interface InsuranceDto {
  provider?: string;
  policyNumber?: string;
  coverage?: InsuranceCoverageDto;
}

/** Family member information */
export interface FamilyMemberDto {
  patientId?: string;
  name?: string;
  relationship?: string;
  isPrimaryContact?: boolean;
}

/** Family structure */
export interface FamilyDto {
  isHead?: boolean;
  headId?: string;
  members: FamilyMemberDto[];
}

/** Emergency contact information */
export interface EmergencyContactDto {
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientDto {
  id: string;

  // Patient identification
  patientNumber?: string;

  // Person information (nested structure matching backend)
  person?: PersonDto;

  // Legacy flat fields (kept for backward compatibility)
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: string;

  // Contact information
  phones?: PhoneDto[];
  emails?: EmailDto[];
  address?: AddressDto;
  emergencyContact?: EmergencyContactDto;

  // Clinical alerts
  alerts?: AlertsDto;

  // Insurance information (array of insurance policies)
  insurance?: InsuranceDto[];

  // Legacy insurance field (kept for backward compatibility)
  insuranceInfo?: Record<string, any>;

  // Family relationships
  family?: FamilyDto;

  // Medical history
  medicalHistory?: Record<string, any>;

  // Additional fields
  notes?: string;
  tags?: string[];

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchPatientDto {
  /** Search term for name, email, or phone */
  search?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  page?: number;
  limit?: number;
}

export interface PatientListResponse {
  success: boolean;
  data: PatientDto[];
  total: number;
  page: number;
  limit: number;
}

/** Patient balance information */
export interface PatientBalanceDto {
  balance: number;
}
