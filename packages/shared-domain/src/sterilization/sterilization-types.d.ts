export type InstrumentId = string & {
    readonly __brand: 'InstrumentId';
};
export type LabCaseId = string & {
    readonly __brand: 'LabCaseId';
};
export type ClinicalLogisticsTaskId = string & {
    readonly __brand: 'ClinicalLogisticsTaskId';
};
export declare enum SterilizationCycleStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    PASSED = "PASSED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare enum SterilizationCycleType {
    STEAM = "STEAM",
    DRY_HEAT = "DRY_HEAT",
    CHEMICAL = "CHEMICAL",
    PLASMA = "PLASMA"
}
export declare enum BiologicalIndicatorResult {
    PASS = "PASS",
    FAIL = "FAIL",
    PENDING = "PENDING"
}
export declare enum InstrumentStatus {
    ACTIVE = "ACTIVE",
    RETIRED = "RETIRED",
    DAMAGED = "DAMAGED",
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE",
    IN_STERILIZATION = "IN_STERILIZATION"
}
export declare enum InstrumentType {
    HANDPIECE = "HANDPIECE",
    SCALER = "SCALER",
    FORCEPS = "FORCEPS",
    ELEVATOR = "ELEVATOR",
    CURETTE = "CURETTE",
    MIRROR = "MIRROR",
    EXPLORER = "EXPLORER",
    SYRINGE = "SYRINGE",
    SURGICAL_BLADE = "SURGICAL_BLADE",
    RETRACTOR = "RETRACTOR",
    OTHER = "OTHER"
}
export declare enum LabCaseStatus {
    CREATED = "CREATED",
    SENT = "SENT",
    IN_PROGRESS = "IN_PROGRESS",
    RECEIVED = "RECEIVED",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum LabCaseType {
    CROWN = "CROWN",
    BRIDGE = "BRIDGE",
    DENTURE = "DENTURE",
    IMPLANT = "IMPLANT",
    ALIGNER = "ALIGNER",
    IMPRESSION = "IMPRESSION",
    NIGHTGUARD = "NIGHTGUARD",
    VENEER = "VENEER",
    OTHER = "OTHER"
}
export declare enum ClinicalLogisticsTaskType {
    ROOM_PREP = "ROOM_PREP",
    ROOM_TURNOVER = "ROOM_TURNOVER",
    CONSUMABLES_PREP = "CONSUMABLES_PREP",
    INSTRUMENT_SETUP = "INSTRUMENT_SETUP",
    WASTE_DISPOSAL = "WASTE_DISPOSAL"
}
export declare enum ClinicalLogisticsTaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
