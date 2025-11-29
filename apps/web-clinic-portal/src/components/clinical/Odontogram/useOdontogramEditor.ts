/**
 * useOdontogramEditor Hook
 *
 * Custom hook for managing odontogram editor state with:
 * - Backend API integration via React Query
 * - Local state for UI interactions
 * - Undo/Redo support
 * - Optimistic updates
 * - Keyboard shortcuts
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  useOdontogram,
  useUpdateTooth,
  useAddCondition,
  useRemoveCondition,
  useBulkUpdateTeeth,
} from '../../../hooks/useClinical';
import type {
  ToothConditionType,
  ToothSurface,
  ConditionSeverity,
  RestorationMaterial,
  FurcationClass,
  ToothDataDto,
  OdontogramDto,
  OdontogramEditorState,
} from './types';
import {
  ALL_ADULT_TEETH,
  ALL_PRIMARY_TEETH,
  numberToFdi,
  getSurfacesForTooth,
  getToothType,
} from './types';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseOdontogramEditorOptions {
  patientId: string;
  readOnly?: boolean;
  showPediatric?: boolean;
  onToothSelect?: (toothNumber: number | null) => void;
}

export interface UseOdontogramEditorReturn {
  // Data
  odontogram: OdontogramDto | undefined;
  isLoading: boolean;
  isError: boolean;

  // State
  state: OdontogramEditorState;

  // Tooth data helpers
  getToothData: (toothNumber: number) => ToothDataDto | undefined;
  teeth: number[];

  // Selection handlers
  selectTooth: (toothNumber: number | null) => void;
  setSelectedCondition: (condition: ToothConditionType) => void;
  toggleSurface: (surface: ToothSurface) => void;
  setSelectedSurfaces: (surfaces: ToothSurface[]) => void;
  setSelectedSeverity: (severity: ConditionSeverity | undefined) => void;
  setSelectedMaterial: (material: RestorationMaterial | undefined) => void;
  setHoveredTooth: (toothNumber: number | null) => void;

  // Quick mode
  toggleQuickMode: () => void;
  toggleQuickModeSelection: (toothNumber: number) => void;
  clearQuickModeSelection: () => void;

  // Dentition toggle
  togglePediatricView: () => void;

  // Mutations
  addCondition: (
    toothNumber: number,
    condition: ToothConditionType,
    surfaces: ToothSurface[],
    options?: {
      severity?: ConditionSeverity;
      material?: RestorationMaterial;
      notes?: string;
    }
  ) => Promise<void>;
  removeCondition: (
    toothNumber: number,
    conditionId: string,
    reason: string
  ) => Promise<void>;
  updateTooth: (
    toothNumber: number,
    updates: {
      isPresent?: boolean;
      mobility?: number;
      furcation?: FurcationClass;
      notes?: string;
    }
  ) => Promise<void>;
  applyConditionToSelected: () => Promise<void>;

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Mutation states
  isMutating: boolean;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: OdontogramEditorState = {
  selectedTooth: null,
  selectedCondition: 'caries',
  selectedSurfaces: [],
  selectedSeverity: undefined,
  selectedMaterial: undefined,
  hoveredTooth: null,
  isQuickMode: false,
  quickModeSelection: [],
  showPediatric: false,
  undoStack: [],
  redoStack: [],
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useOdontogramEditor({
  patientId,
  readOnly = false,
  showPediatric = false,
  onToothSelect,
}: UseOdontogramEditorOptions): UseOdontogramEditorReturn {
  // API hooks
  const {
    data: odontogram,
    isLoading,
    isError,
  } = useOdontogram(patientId);

  const updateToothMutation = useUpdateTooth();
  const addConditionMutation = useAddCondition();
  const removeConditionMutation = useRemoveCondition();
  const bulkUpdateMutation = useBulkUpdateTeeth();

  // Local state
  const [state, setState] = useState<OdontogramEditorState>({
    ...initialState,
    showPediatric,
  });

  // Determine which teeth to show
  const teeth = useMemo(() => {
    return state.showPediatric ? ALL_PRIMARY_TEETH : ALL_ADULT_TEETH;
  }, [state.showPediatric]);

  // Get tooth data from odontogram
  const getToothData = useCallback((toothNumber: number): ToothDataDto | undefined => {
    if (!odontogram?.teeth) return undefined;
    const fdi = numberToFdi(toothNumber);
    return odontogram.teeth[fdi];
  }, [odontogram]);

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  const selectTooth = useCallback((toothNumber: number | null) => {
    if (readOnly && toothNumber !== null) return;

    setState(prev => {
      // If in quick mode, toggle selection instead
      if (prev.isQuickMode && toothNumber !== null) {
        const newSelection = prev.quickModeSelection.includes(toothNumber)
          ? prev.quickModeSelection.filter(n => n !== toothNumber)
          : [...prev.quickModeSelection, toothNumber];
        return {
          ...prev,
          quickModeSelection: newSelection,
        };
      }

      // Normal selection mode
      if (toothNumber !== null) {
        const toothData = getToothData(toothNumber);
        const existingCondition = toothData?.conditions?.find(c => !c.deletedAt);

        return {
          ...prev,
          selectedTooth: toothNumber,
          selectedCondition: (existingCondition?.condition as ToothConditionType) || 'caries',
          selectedSurfaces: (existingCondition?.surfaces as ToothSurface[]) || [],
          selectedSeverity: existingCondition?.severity as ConditionSeverity | undefined,
          selectedMaterial: existingCondition?.material as RestorationMaterial | undefined,
        };
      }

      return {
        ...prev,
        selectedTooth: null,
        selectedSurfaces: [],
        selectedSeverity: undefined,
        selectedMaterial: undefined,
      };
    });

    onToothSelect?.(toothNumber);
  }, [readOnly, getToothData, onToothSelect]);

  const setSelectedCondition = useCallback((condition: ToothConditionType) => {
    setState(prev => ({ ...prev, selectedCondition: condition }));
  }, []);

  const toggleSurface = useCallback((surface: ToothSurface) => {
    setState(prev => ({
      ...prev,
      selectedSurfaces: prev.selectedSurfaces.includes(surface)
        ? prev.selectedSurfaces.filter(s => s !== surface)
        : [...prev.selectedSurfaces, surface],
    }));
  }, []);

  const setSelectedSurfaces = useCallback((surfaces: ToothSurface[]) => {
    setState(prev => ({ ...prev, selectedSurfaces: surfaces }));
  }, []);

  const setSelectedSeverity = useCallback((severity: ConditionSeverity | undefined) => {
    setState(prev => ({ ...prev, selectedSeverity: severity }));
  }, []);

  const setSelectedMaterial = useCallback((material: RestorationMaterial | undefined) => {
    setState(prev => ({ ...prev, selectedMaterial: material }));
  }, []);

  const setHoveredTooth = useCallback((toothNumber: number | null) => {
    setState(prev => ({ ...prev, hoveredTooth: toothNumber }));
  }, []);

  // ============================================================================
  // QUICK MODE HANDLERS
  // ============================================================================

  const toggleQuickMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isQuickMode: !prev.isQuickMode,
      quickModeSelection: [],
      selectedTooth: null,
    }));
  }, []);

  const toggleQuickModeSelection = useCallback((toothNumber: number) => {
    setState(prev => ({
      ...prev,
      quickModeSelection: prev.quickModeSelection.includes(toothNumber)
        ? prev.quickModeSelection.filter(n => n !== toothNumber)
        : [...prev.quickModeSelection, toothNumber],
    }));
  }, []);

  const clearQuickModeSelection = useCallback(() => {
    setState(prev => ({ ...prev, quickModeSelection: [] }));
  }, []);

  // ============================================================================
  // DENTITION TOGGLE
  // ============================================================================

  const togglePediatricView = useCallback(() => {
    setState(prev => ({
      ...prev,
      showPediatric: !prev.showPediatric,
      selectedTooth: null,
      quickModeSelection: [],
    }));
  }, []);

  // ============================================================================
  // MUTATION HANDLERS
  // ============================================================================

  const addCondition = useCallback(async (
    toothNumber: number,
    condition: ToothConditionType,
    surfaces: ToothSurface[],
    options?: {
      severity?: ConditionSeverity;
      material?: RestorationMaterial;
      notes?: string;
    }
  ) => {
    if (readOnly) return;

    const fdi = numberToFdi(toothNumber);

    try {
      await addConditionMutation.mutateAsync({
        patientId,
        toothNumber: fdi,
        data: {
          condition,
          surfaces,
          severity: options?.severity,
          material: options?.material,
          notes: options?.notes,
        },
      });
      toast.success(`Conditie adaugata pentru dintele #${toothNumber}`);
    } catch {
      toast.error(`Eroare la adaugarea conditiei pentru dintele #${toothNumber}`);
    }
  }, [patientId, readOnly, addConditionMutation]);

  const removeCondition = useCallback(async (
    toothNumber: number,
    conditionId: string,
    reason: string
  ) => {
    if (readOnly) return;

    const fdi = numberToFdi(toothNumber);

    try {
      await removeConditionMutation.mutateAsync({
        patientId,
        toothNumber: fdi,
        conditionId,
        data: { reason },
      });
      toast.success(`Conditie eliminata de la dintele #${toothNumber}`);
    } catch {
      toast.error(`Eroare la eliminarea conditiei de la dintele #${toothNumber}`);
    }
  }, [patientId, readOnly, removeConditionMutation]);

  const updateTooth = useCallback(async (
    toothNumber: number,
    updates: {
      isPresent?: boolean;
      mobility?: number;
      furcation?: FurcationClass;
      notes?: string;
    }
  ) => {
    if (readOnly) return;

    const fdi = numberToFdi(toothNumber);

    try {
      await updateToothMutation.mutateAsync({
        patientId,
        toothNumber: fdi,
        data: updates,
      });
      toast.success(`Dinte #${toothNumber} actualizat`);
    } catch {
      toast.error(`Eroare la actualizarea dintelui #${toothNumber}`);
    }
  }, [patientId, readOnly, updateToothMutation]);

  const applyConditionToSelected = useCallback(async () => {
    if (readOnly) return;

    const teethToUpdate = state.isQuickMode
      ? state.quickModeSelection
      : state.selectedTooth ? [state.selectedTooth] : [];

    if (teethToUpdate.length === 0) {
      toast.error('Niciun dinte selectat');
      return;
    }

    // For single tooth, use addCondition
    if (teethToUpdate.length === 1) {
      const toothNumber = teethToUpdate[0];
      const toothType = getToothType(toothNumber);
      const surfaces = state.selectedSurfaces.length > 0
        ? state.selectedSurfaces
        : getSurfacesForTooth(toothType);

      await addCondition(
        toothNumber,
        state.selectedCondition,
        surfaces,
        {
          severity: state.selectedSeverity,
          material: state.selectedMaterial,
        }
      );
    } else {
      // For multiple teeth, use bulk update
      try {
        const updates = teethToUpdate.map(toothNumber => {
          const toothType = getToothType(toothNumber);
          const surfaces = state.selectedSurfaces.length > 0
            ? state.selectedSurfaces
            : getSurfacesForTooth(toothType);

          return {
            toothNumber: numberToFdi(toothNumber),
            conditions: [{
              condition: state.selectedCondition,
              surfaces,
              severity: state.selectedSeverity,
              material: state.selectedMaterial,
            }],
          };
        });

        await bulkUpdateMutation.mutateAsync({
          patientId,
          data: { teeth: updates },
        });

        toast.success(`Conditie aplicata la ${teethToUpdate.length} dinti`);
      } catch {
        toast.error('Eroare la aplicarea conditiei');
      }
    }

    // Clear selection after applying
    setState(prev => ({
      ...prev,
      selectedTooth: state.isQuickMode ? prev.selectedTooth : null,
      quickModeSelection: [],
      selectedSurfaces: [],
    }));
  }, [
    readOnly,
    state,
    patientId,
    addCondition,
    bulkUpdateMutation,
  ]);

  // ============================================================================
  // UNDO/REDO (Placeholder - could be enhanced with actual undo stack)
  // ============================================================================

  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;

  const undo = useCallback(() => {
    // TODO: Implement actual undo with API calls
    toast('Undo nu este inca implementat');
  }, []);

  const redo = useCallback(() => {
    // TODO: Implement actual redo with API calls
    toast('Redo nu este inca implementat');
  }, []);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        selectTooth(null);
        clearQuickModeSelection();
        return;
      }

      // Q for quick mode toggle
      if (e.key === 'q' || e.key === 'Q') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          toggleQuickMode();
          return;
        }
      }

      // Enter to apply condition
      if (e.key === 'Enter') {
        if (state.selectedTooth || state.quickModeSelection.length > 0) {
          e.preventDefault();
          applyConditionToSelected();
          return;
        }
      }

      // Number keys 1-9 for condition selection
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 9 && state.selectedTooth) {
        const conditions: ToothConditionType[] = [
          'healthy', 'caries', 'filling', 'crown', 'root_canal',
          'missing', 'implant', 'bridge', 'veneer',
        ];
        if (keyNum <= conditions.length) {
          e.preventDefault();
          setSelectedCondition(conditions[keyNum - 1]);
          return;
        }
      }

      // Surface keys M, O, D, B, L when tooth is selected
      if (state.selectedTooth) {
        const surfaceMap: Record<string, ToothSurface> = {
          m: 'M', o: 'O', d: 'D', b: 'B', l: 'L', i: 'I',
        };
        const surface = surfaceMap[e.key.toLowerCase()];
        if (surface) {
          e.preventDefault();
          toggleSurface(surface);
          return;
        }
      }

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    readOnly,
    state.selectedTooth,
    state.quickModeSelection,
    selectTooth,
    clearQuickModeSelection,
    toggleQuickMode,
    applyConditionToSelected,
    setSelectedCondition,
    toggleSurface,
    undo,
    redo,
  ]);

  // ============================================================================
  // RETURN
  // ============================================================================

  const isMutating =
    updateToothMutation.isPending ||
    addConditionMutation.isPending ||
    removeConditionMutation.isPending ||
    bulkUpdateMutation.isPending;

  return {
    // Data
    odontogram,
    isLoading,
    isError,

    // State
    state,

    // Tooth data helpers
    getToothData,
    teeth,

    // Selection handlers
    selectTooth,
    setSelectedCondition,
    toggleSurface,
    setSelectedSurfaces,
    setSelectedSeverity,
    setSelectedMaterial,
    setHoveredTooth,

    // Quick mode
    toggleQuickMode,
    toggleQuickModeSelection,
    clearQuickModeSelection,

    // Dentition toggle
    togglePediatricView,

    // Mutations
    addCondition,
    removeCondition,
    updateTooth,
    applyConditionToSelected,

    // Undo/Redo
    canUndo,
    canRedo,
    undo,
    redo,

    // Mutation states
    isMutating,
  };
}

export default useOdontogramEditor;
