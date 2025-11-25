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

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: 'male' | 'female' | 'other';
  phones?: PhoneDto[];
  emails?: EmailDto[];
  address?: AddressDto;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory?: Record<string, any>;
  insuranceInfo?: Record<string, any>;
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
  query?: string;
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
