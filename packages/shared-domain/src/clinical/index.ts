/**
 * Clinical Domain Module
 *
 * Exports all clinical domain types for Electronic Health Records (EHR)
 * in dental practice management system.
 *
 * @module shared-domain/clinical
 * @packageDocumentation
 */

// ============================================================================
// Branded Types
// ============================================================================
export type {
  PatientId,
  ProviderId,
  ClinicalNoteId,
  TreatmentPlanId,
  ProcedureId,
  ConsentId,
  OdontogramId,
  PerioChartId,
  StockItemId,
  ProcedureCode,
} from './clinical.types';

// ============================================================================
// Tooth & Odontogram Types
// ============================================================================
export type { ToothNumber } from './clinical.types';

export {
  ToothSurface,
  ToothCondition,
} from './clinical.types';

export type {
  SurfaceCondition,
  ToothStatus,
  OdontogramEntry,
  Odontogram,
} from './clinical.types';

// ============================================================================
// Periodontal Types
// ============================================================================
export { FurcationClass } from './clinical.types';

export type {
  PerioSite,
  PerioTooth,
  PerioChart,
} from './clinical.types';

// ============================================================================
// Clinical Notes Types
// ============================================================================
export { ClinicalNoteType } from './clinical.types';

export type {
  SOAPNote,
  AttachedFile,
  ClinicalNote,
} from './clinical.types';

// ============================================================================
// Treatment Plan Types
// ============================================================================
export {
  TreatmentPlanStatus,
  ProcedureItemStatus,
  TreatmentPhase,
} from './clinical.types';

export type {
  ProcedureItem,
  TreatmentOption,
  TreatmentPlan,
} from './clinical.types';

// ============================================================================
// Completed Procedures Types
// ============================================================================
export { ProcedureStatus } from './clinical.types';

export type {
  ConsumedStockItem,
  AnesthesiaRecord,
  CompletedProcedure,
} from './clinical.types';

// ============================================================================
// Consent Types
// ============================================================================
export {
  ConsentType,
  ConsentStatus,
} from './clinical.types';

export type {
  DigitalSignature,
  ClinicalConsent,
} from './clinical.types';

// ============================================================================
// Diagnostic Types
// ============================================================================
export type {
  DiagnosticCode,
  PatientDiagnosis,
} from './clinical.types';
