// SterilizationCycleId is already defined in inventory domain
export type InstrumentId = string & { readonly __brand: 'InstrumentId' };
export type LabCaseId = string & { readonly __brand: 'LabCaseId' };
export type ClinicalLogisticsTaskId = string & { readonly __brand: 'ClinicalLogisticsTaskId' };

export enum SterilizationCycleStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum SterilizationCycleType {
  STEAM = 'STEAM',
  DRY_HEAT = 'DRY_HEAT',
  CHEMICAL = 'CHEMICAL',
  PLASMA = 'PLASMA',
}

export enum BiologicalIndicatorResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  PENDING = 'PENDING',
}

export enum InstrumentStatus {
  ACTIVE = 'ACTIVE',
  RETIRED = 'RETIRED',
  DAMAGED = 'DAMAGED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  IN_STERILIZATION = 'IN_STERILIZATION',
}

export enum InstrumentType {
  HANDPIECE = 'HANDPIECE',
  SCALER = 'SCALER',
  FORCEPS = 'FORCEPS',
  ELEVATOR = 'ELEVATOR',
  CURETTE = 'CURETTE',
  MIRROR = 'MIRROR',
  EXPLORER = 'EXPLORER',
  SYRINGE = 'SYRINGE',
  SURGICAL_BLADE = 'SURGICAL_BLADE',
  RETRACTOR = 'RETRACTOR',
  OTHER = 'OTHER',
}

export enum LabCaseStatus {
  CREATED = 'CREATED',
  SENT = 'SENT',
  IN_PROGRESS = 'IN_PROGRESS',
  RECEIVED = 'RECEIVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum LabCaseType {
  CROWN = 'CROWN',
  BRIDGE = 'BRIDGE',
  DENTURE = 'DENTURE',
  IMPLANT = 'IMPLANT',
  ALIGNER = 'ALIGNER',
  IMPRESSION = 'IMPRESSION',
  NIGHTGUARD = 'NIGHTGUARD',
  VENEER = 'VENEER',
  OTHER = 'OTHER',
}

export enum ClinicalLogisticsTaskType {
  ROOM_PREP = 'ROOM_PREP',
  ROOM_TURNOVER = 'ROOM_TURNOVER',
  CONSUMABLES_PREP = 'CONSUMABLES_PREP',
  INSTRUMENT_SETUP = 'INSTRUMENT_SETUP',
  WASTE_DISPOSAL = 'WASTE_DISPOSAL',
}

export enum ClinicalLogisticsTaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
