/**
 * Odontogram Components Index
 *
 * Export all odontogram-related components, hooks, and types
 * for use throughout the application.
 */

// Main Editor Component
export { OdontogramEditorConnected, OdontogramEditorConnected as default } from './OdontogramEditor';

// Sub-components
export { ToothSVG } from './ToothSVG';
export {
  ToothConditionPalette,
  SurfaceSelector,
  MaterialSelector,
  SeveritySelector,
  ConditionEditor,
} from './ToothConditionPalette';
export { ToothDetailsPanel } from './ToothDetailsPanel';

// Hook
export { useOdontogramEditor } from './useOdontogramEditor';
export type { UseOdontogramEditorOptions, UseOdontogramEditorReturn } from './useOdontogramEditor';

// Types
export * from './types';
