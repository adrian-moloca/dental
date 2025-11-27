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
