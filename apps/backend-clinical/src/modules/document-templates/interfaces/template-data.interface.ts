/**
 * Template Data Interfaces
 *
 * Defines the data structures for placeholder substitution in document templates.
 */

/**
 * Base context for all template rendering
 */
export interface TemplateRenderContext {
  tenantId: string;
  clinicId?: string;
  userId?: string;
  locale?: string; // 'ro', 'en'
}

/**
 * Clinic data for template headers/footers
 */
export interface ClinicData {
  clinicName: string;
  clinicCUI: string; // Romanian tax ID
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicLogo?: string; // URL or base64
  clinicWebsite?: string;
}

/**
 * Patient data for templates
 */
export interface PatientData {
  patientId: string;
  patientName: string;
  patientNumber?: string;
  cnp: string; // National ID (encrypted in storage, decrypted for display)
  dateOfBirth: string; // Formatted date
  age?: number;
  gender: string;
  address: string;
  city?: string;
  county?: string;
  postalCode?: string;
  phone: string;
  email?: string;
  occupation?: string;
  workplace?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;

  // Medical alerts
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  previousSurgeries?: string;

  // Dental history
  lastDentalVisit?: string;
  lastVisitReason?: string;
  previousTreatments?: string;
  currentDentalProblems?: string;
  oralHygieneHabits?: string;

  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceValidFrom?: string;
  insuranceValidUntil?: string;

  // For minors
  legalGuardianName?: string;
  legalGuardianCNP?: string;
  legalGuardianRelation?: string;
}

/**
 * Provider (dentist) data for templates
 */
export interface ProviderData {
  providerId: string;
  providerName: string;
  providerSpecialization: string;
  providerCNASCode?: string; // Romanian health insurance code
  providerLicenseNumber?: string;
}

/**
 * Appointment data for templates
 */
export interface AppointmentData {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  estimatedDuration?: string;
}

/**
 * Procedure data for procedure-specific consent
 */
export interface ProcedureData {
  procedureId?: string;
  procedureName: string;
  procedureCode: string; // CPT/CDT code
  procedureDescription: string;
  affectedTeeth?: string; // e.g., "16, 17"
  diagnosis?: string;
  icd10Code?: string;
  estimatedDuration?: string;
  estimatedCost?: string;
  successRate?: string;
  prognosis?: string;
  specificRisks?: string;
  alternative1?: string;
  alternative2?: string;
  noTreatmentConsequences?: string;
  restPeriod?: string; // hours
  softDietDays?: string;
  additionalInstructions?: string;
}

/**
 * Treatment plan phase item
 */
export interface TreatmentPlanItem {
  itemNumber: number;
  procedureName: string;
  procedureCode: string;
  tooth?: string;
  estimatedTime?: string;
  unitPrice: number;
  quantity: number;
  discount: number; // percentage
  total: number;
}

/**
 * Treatment plan phase
 */
export interface TreatmentPhase {
  phaseName: string;
  phaseNumber: number;
  items: TreatmentPlanItem[];
  phaseSubtotal: number;
}

/**
 * Treatment plan data
 */
export interface TreatmentPlanData {
  planNumber: string;
  diagnosticSummary: string;
  phases: TreatmentPhase[];
  subtotal: number;
  discountTotal: number;
  discountPercent: number;
  taxTotal: number; // 19% VAT for Romania
  grandTotal: number;
  validityPeriod: number; // days
  warrantyTerms?: string;

  // Optional payment plan
  paymentPlan?: {
    downPayment: number;
    installmentCount: number;
    installmentAmount: number;
    remainingAmount: number;
  };

  // Optional insurance coverage
  insuranceCoverage?: {
    insuranceProvider: string;
    insuranceAmount: number;
    patientResponsibility: number;
  };
}

/**
 * Medication for prescription
 */
export interface MedicationData {
  medicationName: string;
  dosage: string;
  quantity: number;
  unit: string; // 'cutii', 'fiole', 'tb'
  administrationRoute: string; // 'oral', 'topic', 'injectabil'
  frequency: string; // '2x/zi', '3x/zi după masă'
  instructions: string;
}

/**
 * Prescription data
 */
export interface PrescriptionData {
  prescriptionNumber: string;
  diagnosis: string;
  icd10Code?: string;
  cimCode?: string; // Romanian ICD-10 equivalent
  medications: MedicationData[];
  warnings?: string;
  providerCNASCode?: string;
}

/**
 * Composite data for document generation
 * Contains all possible data sources
 */
export interface DocumentGenerationData {
  clinic: ClinicData;
  patient: PatientData;
  provider: ProviderData;
  appointment?: AppointmentData;
  procedure?: ProcedureData;
  treatmentPlan?: TreatmentPlanData;
  prescription?: PrescriptionData;

  // Metadata
  issueDate: string;
  completionDate: string;
  signatureDate: string;
  generationDate: string;
}
