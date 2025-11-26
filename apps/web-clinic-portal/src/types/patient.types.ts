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

export interface PatientDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: string;
  phones?: PhoneDto[];
  emails?: EmailDto[];
  address?: AddressDto;
  emergencyContact?: any;
  medicalHistory?: Record<string, any>;
  insuranceInfo?: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchPatientDto {
  /** Search term for name, email, or phone (backend field name is 'search') */
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
