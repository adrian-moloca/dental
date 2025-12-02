/**
 * OdontogramEditor Component
 *
 * Complete interactive dental chart editor with:
 * - Full backend API integration
 * - FDI numbering system
 * - Surface-level condition marking
 * - Quick exam mode for rapid charting
 * - Tooth history and details panel
 * - Keyboard navigation and shortcuts
 * - Accessibility support (ARIA, keyboard nav)
 * - Print-friendly view
 */

import { memo, useCallback, useRef } from 'react';
import { ToothSVG } from './ToothSVG';
import { ToothConditionPalette, SurfaceSelector } from './ToothConditionPalette';
import { ToothDetailsPanel } from './ToothDetailsPanel';
import { useOdontogramEditor } from './useOdontogramEditor';
import { Badge } from '../../ui-new/Badge';
import type {
  OdontogramEditorProps,
  ToothConditionType,
  ToothSurface,
  ConditionSeverity,
  RestorationMaterial,
} from './types';
import {
  ADULT_TEETH_UPPER,
  ADULT_TEETH_LOWER,
  PRIMARY_TEETH_UPPER,
  PRIMARY_TEETH_LOWER,
  CONDITION_CONFIG,
  getToothType,
  getSurfacesForTooth,
} from './types';
import '../odontogram.css';

// ============================================================================
// LEGEND COMPONENT
// ============================================================================

const OdontogramLegend = memo(function OdontogramLegend() {
  return (
    <div className="odontogram-legend" role="list" aria-label="Legenda conditii dentare">
      {CONDITION_CONFIG.slice(0, 8).map((cond) => (
        <div key={cond.value} className="legend-item" role="listitem">
          <span
            className="legend-dot"
            style={{ backgroundColor: cond.color }}
            aria-hidden="true"
          />
          <span className="legend-label">{cond.label}</span>
        </div>
      ))}
    </div>
  );
});

// ============================================================================
// TOOLBAR COMPONENT
// ============================================================================

interface OdontogramToolbarProps {
  isQuickMode: boolean;
  quickModeCount: number;
  showPediatric: boolean;
  onToggleQuickMode: () => void;
  onTogglePediatric: () => void;
  onPrint: () => void;
  readOnly?: boolean;
}

const OdontogramToolbar = memo(function OdontogramToolbar({
  isQuickMode,
  quickModeCount,
  showPediatric,
  onToggleQuickMode,
  onTogglePediatric,
  onPrint,
  readOnly,
}: OdontogramToolbarProps) {
  return (
    <div className="odontogram-toolbar">
      <div className="odontogram-toolbar-left">
        {/* Dentition Toggle */}
        <div className="btn-group" role="group" aria-label="Tip dentitie">
          <button
            type="button"
            className={`btn btn-sm ${!showPediatric ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => showPediatric && onTogglePediatric()}
            aria-pressed={!showPediatric}
          >
            <i className="ti ti-user me-1" aria-hidden="true" />
            Adult (32)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${showPediatric ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => !showPediatric && onTogglePediatric()}
            aria-pressed={showPediatric}
          >
            <i className="ti ti-baby-carriage me-1" aria-hidden="true" />
            Copil (20)
          </button>
        </div>

        {/* Quick Exam Mode */}
        {!readOnly && (
          <button
            type="button"
            className={`btn btn-sm ${isQuickMode ? 'btn-success' : 'btn-outline-success'}`}
            onClick={onToggleQuickMode}
            title="Mod Examen Rapid (Q) - Selecteaza mai multi dinti simultan"
            aria-pressed={isQuickMode}
          >
            <i className={`ti ${isQuickMode ? 'ti-checks' : 'ti-hand-click'} me-1`} aria-hidden="true" />
            {isQuickMode ? 'Examen Rapid: ON' : 'Examen Rapid'}
            {isQuickMode && quickModeCount > 0 && (
              <Badge variant="light" className="ms-2">{quickModeCount}</Badge>
            )}
          </button>
        )}
      </div>

      <div className="odontogram-toolbar-right">
        {/* Keyboard Shortcuts Help */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          title="Comenzi rapide de tastatura"
          aria-label="Comenzi rapide de tastatura"
          onClick={() => {
            // Could open a modal with keyboard shortcuts
          }}
        >
          <i className="ti ti-keyboard" aria-hidden="true" />
        </button>

        {/* Print */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onPrint}
          title="Printeaza odontograma"
          aria-label="Printeaza odontograma"
        >
          <i className="ti ti-printer" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// TEETH ROW COMPONENT
// ============================================================================

interface TeethRowProps {
  teeth: number[];
  selectedTooth: number | null;
  hoveredTooth: number | null;
  quickModeSelection: number[];
  isQuickMode: boolean;
  getToothData: (toothNumber: number) => any;
  onToothClick: (toothNumber: number) => void;
  onToothHover: (toothNumber: number | null) => void;
  readOnly?: boolean;
  isUpper?: boolean;
}

const TeethRow = memo(function TeethRow({
  teeth,
  selectedTooth,
  hoveredTooth,
  quickModeSelection,
  isQuickMode,
  getToothData,
  onToothClick,
  onToothHover,
  readOnly,
  isUpper,
}: TeethRowProps) {
  return (
    <div
      className="teeth-row"
      role="group"
      aria-label={isUpper ? 'Arcada superioara' : 'Arcada inferioara'}
    >
      {teeth.map((toothNumber) => {
        const isSelected = isQuickMode
          ? quickModeSelection.includes(toothNumber)
          : selectedTooth === toothNumber;

        return (
          <div key={toothNumber} className="tooth-container">
            {/* Tooth number for upper teeth */}
            {isUpper && (
              <div className="tooth-number tooth-number-upper">{toothNumber}</div>
            )}

            <ToothSVG
              toothNumber={toothNumber}
              toothData={getToothData(toothNumber)}
              selected={isSelected}
              hovered={hoveredTooth === toothNumber}
              onClick={() => onToothClick(toothNumber)}
              onMouseEnter={() => onToothHover(toothNumber)}
              onMouseLeave={() => onToothHover(null)}
              readOnly={readOnly}
              size="md"
            />

            {/* Tooth number for lower teeth */}
            {!isUpper && (
              <div className="tooth-number tooth-number-lower">{toothNumber}</div>
            )}

            {/* Quick mode selection indicator */}
            {isQuickMode && isSelected && (
              <div className="tooth-quick-select-indicator">
                <i className="ti ti-check text-success" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

// ============================================================================
// QUICK CONDITION EDITOR
// ============================================================================

interface QuickConditionEditorProps {
  selectedCondition: ToothConditionType;
  selectedSurfaces: ToothSurface[];
  selectedTooth: number | null;
  quickModeSelection: number[];
  isQuickMode: boolean;
  onConditionSelect: (condition: ToothConditionType) => void;
  onSurfaceToggle: (surface: ToothSurface) => void;
  onApply: () => void;
  onCancel: () => void;
  isMutating: boolean;
}

const QuickConditionEditor = memo(function QuickConditionEditor({
  selectedCondition,
  selectedSurfaces,
  selectedTooth,
  quickModeSelection,
  isQuickMode,
  onConditionSelect,
  onSurfaceToggle,
  onApply,
  onCancel,
  isMutating,
}: QuickConditionEditorProps) {
  const toothCount = isQuickMode ? quickModeSelection.length : 1;
  const toothType = selectedTooth ? getToothType(selectedTooth) : 'molar';
  const availableSurfaces = getSurfacesForTooth(toothType);

  return (
    <div className="condition-editor">
      <div className="editor-header">
        <h5 className="editor-title">
          <i className="ti ti-dental me-2" />
          {isQuickMode
            ? `Editare ${toothCount} Dinti Selectati`
            : `Editare Dinte #${selectedTooth}`}
        </h5>
      </div>

      {/* Condition Selection */}
      <div className="editor-section">
        <ToothConditionPalette
          selectedCondition={selectedCondition}
          onConditionSelect={onConditionSelect}
          disabled={isMutating}
          columns={4}
        />
      </div>

      {/* Surface Selection */}
      <div className="editor-section">
        <SurfaceSelector
          selectedSurfaces={selectedSurfaces}
          onSurfaceToggle={onSurfaceToggle}
          disabled={isMutating}
          availableSurfaces={availableSurfaces}
        />
      </div>

      {/* Actions */}
      <div className="editor-actions">
        <button
          type="button"
          onClick={onApply}
          disabled={isMutating}
          className="btn btn-primary"
        >
          {isMutating ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" />
              Se salveaza...
            </>
          ) : (
            <>
              <i className="ti ti-check me-1" />
              Aplica
              {isQuickMode && toothCount > 0 && (
                <Badge variant="light" className="ms-2">{toothCount} dinti</Badge>
              )}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline-secondary"
          disabled={isMutating}
        >
          <i className="ti ti-x me-1" />
          Renunta
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// MAIN ODONTOGRAM EDITOR COMPONENT
// ============================================================================

export const OdontogramEditorConnected = memo(function OdontogramEditorConnected({
  patientId,
  readOnly = false,
  showPediatric = false,
  onToothSelect,
  className,
}: OdontogramEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the odontogram editor hook for all state and API management
  const {
    isLoading,
    isError,
    state,
    getToothData,
    selectTooth,
    setSelectedCondition,
    toggleSurface,
    setHoveredTooth,
    toggleQuickMode,
    clearQuickModeSelection,
    togglePediatricView,
    addCondition,
    removeCondition,
    updateTooth,
    applyConditionToSelected,
    isMutating,
  } = useOdontogramEditor({
    patientId,
    readOnly,
    showPediatric,
    onToothSelect,
  });

  // Get teeth arrays based on dentition type
  const upperTeeth = state.showPediatric ? PRIMARY_TEETH_UPPER : ADULT_TEETH_UPPER;
  const lowerTeeth = state.showPediatric ? PRIMARY_TEETH_LOWER : ADULT_TEETH_LOWER;

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle tooth click
  const handleToothClick = useCallback((toothNumber: number) => {
    selectTooth(toothNumber);
  }, [selectTooth]);

  // Handle cancel selection
  const handleCancelSelection = useCallback(() => {
    selectTooth(null);
    clearQuickModeSelection();
  }, [selectTooth, clearQuickModeSelection]);

  // Handle add condition from details panel
  const handleAddConditionFromPanel = useCallback(async (
    condition: ToothConditionType,
    surfaces: ToothSurface[],
    options?: {
      severity?: ConditionSeverity;
      material?: RestorationMaterial;
      notes?: string;
    }
  ) => {
    if (state.selectedTooth) {
      await addCondition(state.selectedTooth, condition, surfaces, options);
    }
  }, [state.selectedTooth, addCondition]);

  // Handle remove condition from details panel
  const handleRemoveConditionFromPanel = useCallback(async (
    conditionId: string,
    reason: string
  ) => {
    if (state.selectedTooth) {
      await removeCondition(state.selectedTooth, conditionId, reason);
    }
  }, [state.selectedTooth, removeCondition]);

  // Handle update tooth from details panel
  const handleUpdateToothFromPanel = useCallback(async (updates: {
    isPresent?: boolean;
    mobility?: number;
    furcation?: any;
    notes?: string;
  }) => {
    if (state.selectedTooth) {
      await updateTooth(state.selectedTooth, updates);
    }
  }, [state.selectedTooth, updateTooth]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`odontogram-editor odontogram-loading ${className || ''}`}>
        <div className="odontogram-loading-content">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se incarca odontograma...</span>
          </div>
          <p className="mt-3 text-muted">Se incarca odontograma...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={`odontogram-editor odontogram-error ${className || ''}`}>
        <div className="odontogram-error-content">
          <i className="ti ti-alert-triangle text-danger" style={{ fontSize: '3rem' }} />
          <p className="mt-3 text-danger">Eroare la incarcarea odontogramei</p>
          <button
            type="button"
            className="btn btn-outline-primary mt-2"
            onClick={() => window.location.reload()}
          >
            Reincearca
          </button>
        </div>
      </div>
    );
  }

  const showEditor = !readOnly && (state.selectedTooth !== null || state.quickModeSelection.length > 0);
  const showDetailsPanel = !readOnly && state.selectedTooth !== null && !state.isQuickMode;

  return (
    <div
      ref={containerRef}
      className={`odontogram-editor ${className || ''}`}
      role="application"
      aria-label="Editor odontograma interactiv"
    >
      {/* Toolbar */}
      <OdontogramToolbar
        isQuickMode={state.isQuickMode}
        quickModeCount={state.quickModeSelection.length}
        showPediatric={state.showPediatric}
        onToggleQuickMode={toggleQuickMode}
        onTogglePediatric={togglePediatricView}
        onPrint={handlePrint}
        readOnly={readOnly}
      />

      {/* Main Chart */}
      <div className="odontogram-chart">
        {/* Upper Arch */}
        <div className="odontogram-arch odontogram-arch-upper">
          <div className="arch-label">Arcada Superioara</div>
          <TeethRow
            teeth={upperTeeth}
            selectedTooth={state.selectedTooth}
            hoveredTooth={state.hoveredTooth}
            quickModeSelection={state.quickModeSelection}
            isQuickMode={state.isQuickMode}
            getToothData={getToothData}
            onToothClick={handleToothClick}
            onToothHover={setHoveredTooth}
            readOnly={readOnly}
            isUpper
          />
        </div>

        {/* Midline Separator */}
        <div className="arch-separator" aria-hidden="true">
          <div className="separator-line" />
          <div className="separator-labels">
            <span>Dreapta</span>
            <span className="separator-icon">
              <i className="ti ti-arrows-left-right" />
            </span>
            <span>Stanga</span>
          </div>
          <div className="separator-line" />
        </div>

        {/* Lower Arch */}
        <div className="odontogram-arch odontogram-arch-lower">
          <TeethRow
            teeth={lowerTeeth}
            selectedTooth={state.selectedTooth}
            hoveredTooth={state.hoveredTooth}
            quickModeSelection={state.quickModeSelection}
            isQuickMode={state.isQuickMode}
            getToothData={getToothData}
            onToothClick={handleToothClick}
            onToothHover={setHoveredTooth}
            readOnly={readOnly}
            isUpper={false}
          />
          <div className="arch-label">Arcada Inferioara</div>
        </div>
      </div>

      {/* Legend */}
      <OdontogramLegend />

      {/* Quick Condition Editor (for quick mode or simple editing) */}
      {showEditor && state.isQuickMode && (
        <QuickConditionEditor
          selectedCondition={state.selectedCondition}
          selectedSurfaces={state.selectedSurfaces}
          selectedTooth={state.selectedTooth}
          quickModeSelection={state.quickModeSelection}
          isQuickMode={state.isQuickMode}
          onConditionSelect={setSelectedCondition}
          onSurfaceToggle={toggleSurface}
          onApply={applyConditionToSelected}
          onCancel={handleCancelSelection}
          isMutating={isMutating}
        />
      )}

      {/* Detailed Tooth Panel (for single tooth editing with history) */}
      {showDetailsPanel && (
        <ToothDetailsPanel
          patientId={patientId}
          toothNumber={state.selectedTooth!}
          toothData={getToothData(state.selectedTooth!)}
          onClose={() => selectTooth(null)}
          onAddCondition={handleAddConditionFromPanel}
          onRemoveCondition={handleRemoveConditionFromPanel}
          onUpdateTooth={handleUpdateToothFromPanel}
          readOnly={readOnly}
        />
      )}
    </div>
  );
});

export default OdontogramEditorConnected;
