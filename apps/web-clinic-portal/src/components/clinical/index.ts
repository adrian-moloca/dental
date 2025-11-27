/**
 * Clinical Components Index
 *
 * Exports all clinical-related UI components for treatment plans,
 * clinical notes, odontograms, and note signing workflows.
 */

// Core Components
export { TreatmentPlanBuilder } from './TreatmentPlanBuilder';
export { OdontogramEditor } from './OdontogramEditor';
export { OdontogramEditorEnhanced } from './OdontogramEditorEnhanced';

// Intervention & Product Management
export { InterventionProductsEditor } from './InterventionProductsEditor';
export { ProcedureConsumptionModal } from './ProcedureConsumptionModal';

// Note Signing Workflow
export { SignNoteModal } from './SignNoteModal';
export { AmendNoteModal } from './AmendNoteModal';
export { NoteSignatureBadge } from './NoteSignatureBadge';
export { ClinicalNoteCard } from './ClinicalNoteCard';

// Enhanced Clinical Workflow Components
export { PatientContextBar } from './PatientContextBar';
export { QuickActionsToolbar } from './QuickActionsToolbar';
export { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
export { ClinicalNoteTemplates, clinicalNoteTemplates, templateCategories } from './ClinicalNoteTemplates';
export type { NoteTemplate } from './ClinicalNoteTemplates';

// Quick Actions & Contact Components
export { QuickActionsPanel } from './QuickActionsPanel';
export type { QuickActionsPanelProps } from './QuickActionsPanel';

export { PatientContactActions } from './PatientContactActions';
export type { PatientContactActionsProps } from './PatientContactActions';

export { FloatingActionButton } from './FloatingActionButton';
export type { FloatingActionButtonProps, FABAction } from './FloatingActionButton';
