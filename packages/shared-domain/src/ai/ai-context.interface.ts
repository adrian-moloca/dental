export interface PatientContext {
  patientId: string;
  demographics?: Record<string, unknown>;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  recentVisits?: unknown[];
}

export interface ClinicalContext {
  visits?: unknown[];
  procedures?: unknown[];
  diagnoses?: string[];
  notes?: string[];
  vitalSigns?: Record<string, unknown>;
}

export interface ImagingContext {
  studies?: unknown[];
  recentImages?: unknown[];
  modalities?: string[];
}

export interface BillingContext {
  invoices?: unknown[];
  payments?: unknown[];
  outstandingBalance?: number;
  paymentHistory?: unknown[];
}

export interface SchedulingContext {
  appointments?: unknown[];
  noShowHistory?: unknown[];
  cancellationHistory?: unknown[];
  preferredTimes?: string[];
}

export interface MarketingContext {
  engagementHistory?: unknown[];
  campaignResponses?: unknown[];
  preferences?: Record<string, unknown>;
  communicationHistory?: unknown[];
}

export interface AIContext {
  patient?: PatientContext;
  clinical?: ClinicalContext;
  imaging?: ImagingContext;
  billing?: BillingContext;
  scheduling?: SchedulingContext;
  marketing?: MarketingContext;
  custom?: Record<string, unknown>;
}
