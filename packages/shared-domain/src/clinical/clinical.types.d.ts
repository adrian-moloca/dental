import type { UUID, ISODateString, OrganizationId, ClinicId, Metadata, Nullable } from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';
export type PatientId = UUID & {
    readonly __brand: 'PatientId';
};
export type ProviderId = UUID & {
    readonly __brand: 'ProviderId';
};
export type ClinicalNoteId = UUID & {
    readonly __brand: 'ClinicalNoteId';
};
export type TreatmentPlanId = UUID & {
    readonly __brand: 'TreatmentPlanId';
};
export type ProcedureId = UUID & {
    readonly __brand: 'ProcedureId';
};
export type ConsentId = UUID & {
    readonly __brand: 'ConsentId';
};
export type OdontogramId = UUID & {
    readonly __brand: 'OdontogramId';
};
export type PerioChartId = UUID & {
    readonly __brand: 'PerioChartId';
};
export type StockItemId = UUID & {
    readonly __brand: 'StockItemId';
};
export type ProcedureCode = string & {
    readonly __brand: 'ProcedureCode';
};
export type ToothNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
export declare enum ToothSurface {
    BUCCAL = "buccal",
    FACIAL = "facial",
    LINGUAL = "lingual",
    PALATAL = "palatal",
    MESIAL = "mesial",
    DISTAL = "distal",
    OCCLUSAL = "occlusal",
    INCISAL = "incisal"
}
export declare enum ToothCondition {
    HEALTHY = "healthy",
    CARIES = "caries",
    RESTORED = "restored",
    MISSING = "missing",
    IMPACTED = "impacted",
    UNERUPTED = "unerupted",
    ECTOPIC = "ectopic",
    CROWN = "crown",
    BRIDGE = "bridge",
    IMPLANT = "implant",
    ROOT_CANAL = "root_canal",
    FRACTURED = "fractured",
    WORN = "worn",
    WATCH = "watch",
    EXTRACTION_NEEDED = "extraction_needed",
    EXTRACTED = "extracted",
    POST_AND_CORE = "post_and_core",
    VENEER = "veneer",
    ONLAY_INLAY = "onlay_inlay",
    SEALANT = "sealant",
    TEMPORARY = "temporary",
    ROOT_REMNANTS = "root_remnants",
    ABSCESS = "abscess",
    MOBILE = "mobile",
    DRIFTED = "drifted",
    ROTATED = "rotated"
}
export interface SurfaceCondition {
    condition: ToothCondition;
    surfaces: ToothSurface[];
    material?: string;
    recordedAt: ISODateString;
    recordedBy: ProviderId;
    notes?: string;
}
export interface ToothStatus {
    toothNumber: ToothNumber;
    conditions: SurfaceCondition[];
    mobility?: 0 | 1 | 2 | 3;
    isPrimary: boolean;
    isSupernumerary: boolean;
    notes?: string;
    updatedAt: ISODateString;
    updatedBy: ProviderId;
}
export interface OdontogramEntry {
    id: UUID;
    chartedAt: ISODateString;
    chartedBy: ProviderId;
    teeth: ToothStatus[];
    generalFindings?: string;
    appointmentId?: UUID;
    clinicalNoteId?: ClinicalNoteId;
}
export interface Odontogram {
    id: OdontogramId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    entries: OdontogramEntry[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    deletedAt?: Nullable<ISODateString>;
}
export interface PerioSite {
    probingDepth: number;
    recession: number;
    attachmentLoss: number;
    bleeding: boolean;
    suppuration: boolean;
    plaque: boolean;
    gingivalMargin?: number;
}
export declare enum FurcationClass {
    NONE = "none",
    CLASS_I = "class_1",
    CLASS_II = "class_2",
    CLASS_III = "class_3",
    CLASS_IV = "class_4"
}
export interface PerioTooth {
    toothNumber: ToothNumber;
    buccalMesial: PerioSite | null;
    buccalMid: PerioSite | null;
    buccalDistal: PerioSite | null;
    lingualMesial: PerioSite | null;
    lingualMid: PerioSite | null;
    lingualDistal: PerioSite | null;
    mobility: 0 | 1 | 2 | 3;
    furcation?: FurcationClass;
    isImplant: boolean;
    notes?: string;
}
export interface PerioChart {
    id: PerioChartId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    chartedAt: ISODateString;
    chartedBy: ProviderId;
    teeth: PerioTooth[];
    classification?: 'healthy' | 'gingivitis' | 'mild_periodontitis' | 'moderate_periodontitis' | 'severe_periodontitis';
    generalFindings?: string;
    bleedingPercentage?: number;
    plaquePercentage?: number;
    appointmentId?: UUID;
    clinicalNoteId?: ClinicalNoteId;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    deletedAt?: Nullable<ISODateString>;
}
export declare enum ClinicalNoteType {
    SOAP = "soap",
    PROGRESS = "progress",
    CONSULT = "consult",
    EMERGENCY = "emergency",
    OPERATIVE = "operative",
    PHONE = "phone",
    FOLLOWUP = "followup",
    INITIAL_EVAL = "initial_eval",
    REFERRAL = "referral"
}
export interface SOAPNote {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
}
export interface AttachedFile {
    fileId: UUID;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    category: 'image' | 'document' | 'xray' | 'photo' | 'other';
    description?: string;
    uploadedAt: ISODateString;
    uploadedBy: UUID;
}
export interface ClinicalNote {
    id: ClinicalNoteId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    type: ClinicalNoteType;
    title: string;
    encounterDate: ISODateString;
    soap?: SOAPNote;
    content?: string;
    providerId: ProviderId;
    coSigners?: ProviderId[];
    appointmentId?: UUID;
    procedureIds?: ProcedureId[];
    attachments: AttachedFile[];
    tags?: string[];
    isFinalized: boolean;
    finalizedAt?: ISODateString;
    isSigned: boolean;
    signedAt?: ISODateString;
    signatureMethod?: string;
    amendments?: Array<{
        amendmentId: UUID;
        amendedAt: ISODateString;
        amendedBy: ProviderId;
        reason: string;
        content: string;
    }>;
    templateId?: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum TreatmentPlanStatus {
    DRAFT = "draft",
    PENDING = "pending",
    APPROVED = "approved",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    ON_HOLD = "on_hold"
}
export declare enum ProcedureItemStatus {
    PLANNED = "planned",
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    ON_HOLD = "on_hold"
}
export declare enum TreatmentPhase {
    EMERGENCY = "emergency",
    STABILIZATION = "stabilization",
    RESTORATIVE = "restorative",
    PERIODONTAL = "periodontal",
    ENDODONTIC = "endodontic",
    SURGICAL = "surgical",
    ORTHODONTIC = "orthodontic",
    PROSTHETIC = "prosthetic",
    COSMETIC = "cosmetic",
    MAINTENANCE = "maintenance"
}
export interface ProcedureItem {
    id: UUID;
    code: ProcedureCode;
    description: string;
    category: string;
    teeth: ToothNumber[];
    surfaces?: ToothSurface[];
    fee: MoneyValue;
    insuranceCoverage?: MoneyValue;
    patientCost?: MoneyValue;
    phase?: TreatmentPhase;
    sequence?: number;
    status: ProcedureItemStatus;
    assignedProviderId?: ProviderId;
    appointmentId?: UUID;
    completedProcedureId?: ProcedureId;
    prerequisites?: UUID[];
    estimatedDuration?: number;
    notes?: string;
    priority?: 'urgent' | 'high' | 'normal' | 'low';
    alternatives?: Array<{
        code: ProcedureCode;
        description: string;
        fee: MoneyValue;
        notes?: string;
    }>;
}
export interface TreatmentOption {
    optionId: UUID;
    name: string;
    description: string;
    procedures: ProcedureItem[];
    totalFee: MoneyValue;
    totalInsuranceCoverage?: MoneyValue;
    totalPatientCost?: MoneyValue;
    estimatedDuration?: number;
    estimatedAppointments?: number;
    advantages?: string[];
    disadvantages?: string[];
    recommendationLevel?: 'recommended' | 'acceptable' | 'not_recommended';
}
export interface TreatmentPlan {
    id: TreatmentPlanId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    version: number;
    previousPlanId?: TreatmentPlanId;
    title: string;
    description?: string;
    providerId: ProviderId;
    status: TreatmentPlanStatus;
    options: TreatmentOption[];
    selectedOptionId?: UUID;
    planDate: ISODateString;
    presentedAt?: ISODateString;
    approvedAt?: ISODateString;
    startedAt?: ISODateString;
    completedAt?: ISODateString;
    expiresAt?: ISODateString;
    clinicalNoteId?: ClinicalNoteId;
    consentIds?: ConsentId[];
    preAuthStatus?: 'pending' | 'approved' | 'denied' | 'not_required';
    preAuthNumber?: string;
    financialNotes?: string;
    patientQuestions?: string[];
    providerNotes?: string;
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum ProcedureStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    PARTIALLY_COMPLETED = "partially_completed",
    CANCELLED = "cancelled",
    FAILED = "failed"
}
export interface ConsumedStockItem {
    stockItemId: StockItemId;
    itemName: string;
    quantity: number;
    unit: string;
    unitCost?: MoneyValue;
    totalCost?: MoneyValue;
    batchNumber?: string;
    expirationDate?: ISODateString;
}
export interface AnesthesiaRecord {
    type: string;
    dosage: string;
    route: string;
    administeredAt: ISODateString;
    administeredBy: ProviderId;
    adverseReactions?: string;
}
export interface CompletedProcedure {
    id: ProcedureId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    code: ProcedureCode;
    description: string;
    category: string;
    procedureDate: ISODateString;
    startTime: ISODateString;
    endTime: ISODateString;
    durationMinutes: number;
    providerId: ProviderId;
    assistingProviders?: ProviderId[];
    teeth: ToothNumber[];
    surfaces?: ToothSurface[];
    status: ProcedureStatus;
    appointmentId?: UUID;
    treatmentPlanId?: TreatmentPlanId;
    clinicalNoteId?: ClinicalNoteId;
    anesthesia?: AnesthesiaRecord[];
    materialsUsed?: Array<{
        name: string;
        brand?: string;
        lotNumber?: string;
        expirationDate?: ISODateString;
    }>;
    stockItemsConsumed?: ConsumedStockItem[];
    findings?: string;
    complications?: string;
    postOpInstructions?: string;
    followUp?: {
        required: boolean;
        scheduledDate?: ISODateString;
        instructions?: string;
    };
    fee: MoneyValue;
    insuranceCoverage?: MoneyValue;
    patientPayment?: MoneyValue;
    billingStatus?: 'unbilled' | 'billed' | 'paid' | 'pending';
    qaReview?: string;
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum ConsentType {
    TREATMENT = "treatment",
    ANESTHESIA = "anesthesia",
    SEDATION = "sedation",
    SURGICAL = "surgical",
    FINANCIAL = "financial",
    HIPAA = "hipaa",
    PHOTOGRAPHY = "photography",
    RESEARCH = "research",
    MINOR = "minor",
    RECORDS_RELEASE = "records_release",
    REFERRAL = "referral",
    TELEDENTISTRY = "teledentistry",
    GDPR = "gdpr"
}
export declare enum ConsentStatus {
    PENDING = "pending",
    SIGNED = "signed",
    DECLINED = "declined",
    EXPIRED = "expired",
    REVOKED = "revoked",
    VOIDED = "voided"
}
export interface DigitalSignature {
    signatureId: UUID;
    signedBy: UUID;
    signerName: string;
    relationship: string;
    signedAt: ISODateString;
    ipAddress?: string;
    userAgent?: string;
    signatureMethod: 'electronic_pad' | 'click_through' | 'docusign' | 'adobe_sign' | 'wet_signature' | 'other';
    signatureImageId?: UUID;
    location?: string;
    witnessSignature?: {
        witnessId: UUID;
        witnessName: string;
        witnessRole: string;
        signedAt: ISODateString;
    };
}
export interface ClinicalConsent {
    id: ConsentId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    type: ConsentType;
    title: string;
    content: string;
    templateId?: UUID;
    templateVersion?: string;
    status: ConsentStatus;
    treatmentPlanId?: TreatmentPlanId;
    procedureIds?: ProcedureId[];
    obtainedBy: ProviderId;
    presentedAt: ISODateString;
    signature?: DigitalSignature;
    signedAt?: ISODateString;
    declineReason?: string;
    declinedAt?: ISODateString;
    expiresAt?: ISODateString;
    revokedAt?: ISODateString;
    revocationReason?: string;
    risksExplained?: string[];
    alternativesDiscussed?: string[];
    patientQuestions?: string[];
    witnessPresent?: boolean;
    interpreterUsed?: boolean;
    interpreterName?: string;
    language?: string;
    specialCircumstances?: string;
    attachments?: AttachedFile[];
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export interface DiagnosticCode {
    code: string;
    description: string;
    category: string;
    version?: string;
    isBillable: boolean;
}
export interface PatientDiagnosis {
    id: UUID;
    patientId: PatientId;
    diagnosticCode: DiagnosticCode;
    diagnosisDate: ISODateString;
    diagnosedBy: ProviderId;
    notes?: string;
    status: 'active' | 'resolved' | 'chronic' | 'ruled_out';
    resolvedAt?: ISODateString;
    relatedProcedures?: ProcedureId[];
    relatedTreatmentPlans?: TreatmentPlanId[];
}
