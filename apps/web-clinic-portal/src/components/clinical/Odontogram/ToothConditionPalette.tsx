/**
 * ToothConditionPalette Component
 *
 * A palette for selecting dental conditions with:
 * - Color-coded condition buttons
 * - Keyboard shortcuts (1-9)
 * - Romanian labels
 * - Optional descriptions
 * - Surface selection
 * - Material selection for restorations
 */

import { memo, useCallback, useEffect } from 'react';
import type {
  ToothConditionPaletteProps,
  ToothConditionType,
  ToothSurface,
  RestorationMaterial,
  ConditionSeverity,
} from './types';
import {
  CONDITION_CONFIG,
  SURFACE_CONFIG,
  MATERIAL_CONFIG,
  SEVERITY_CONFIG,
  ALL_SURFACES,
} from './types';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ConditionButtonProps {
  condition: typeof CONDITION_CONFIG[number];
  selected: boolean;
  onClick: () => void;
  shortcutKey?: number;
  disabled?: boolean;
  showDescription?: boolean;
}

const ConditionButton = memo(function ConditionButton({
  condition,
  selected,
  onClick,
  shortcutKey,
  disabled,
  showDescription,
}: ConditionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`condition-palette-btn ${selected ? 'condition-palette-btn-selected' : ''}`}
      style={{
        '--condition-color': condition.color,
      } as React.CSSProperties}
      aria-pressed={selected}
      title={`${condition.label}${shortcutKey ? ` (${shortcutKey})` : ''}`}
    >
      <span
        className="condition-palette-dot"
        style={{ backgroundColor: condition.color }}
        aria-hidden="true"
      />
      <span className="condition-palette-label">
        {shortcutKey && <kbd className="condition-palette-kbd">{shortcutKey}</kbd>}
        {condition.label}
      </span>
      {showDescription && condition.description && (
        <span className="condition-palette-desc">{condition.description}</span>
      )}
    </button>
  );
});

// ============================================================================
// SURFACE SELECTOR
// ============================================================================

interface SurfaceSelectorProps {
  selectedSurfaces: ToothSurface[];
  onSurfaceToggle: (surface: ToothSurface) => void;
  disabled?: boolean;
  availableSurfaces?: ToothSurface[];
}

export const SurfaceSelector = memo(function SurfaceSelector({
  selectedSurfaces,
  onSurfaceToggle,
  disabled,
  availableSurfaces = ALL_SURFACES,
}: SurfaceSelectorProps) {
  return (
    <div className="surface-selector">
      <label className="surface-selector-label">
        Suprafete Afectate
        <span className="surface-selector-hint">(M, O, D, B, L)</span>
      </label>
      <div className="surface-selector-grid">
        {SURFACE_CONFIG.filter(s => availableSurfaces.includes(s.value)).map((surface) => (
          <button
            key={surface.value}
            type="button"
            onClick={() => onSurfaceToggle(surface.value)}
            disabled={disabled}
            className={`surface-btn ${selectedSurfaces.includes(surface.value) ? 'surface-btn-selected' : ''}`}
            aria-pressed={selectedSurfaces.includes(surface.value)}
            title={surface.labelFull}
          >
            {surface.label}
          </button>
        ))}
      </div>
      <div className="surface-selector-legend">
        {SURFACE_CONFIG.filter(s => availableSurfaces.includes(s.value)).map((s, i) => (
          <span key={s.value}>
            {s.label}: {s.labelFull}
            {i < availableSurfaces.length - 1 ? ' | ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// MATERIAL SELECTOR
// ============================================================================

interface MaterialSelectorProps {
  selectedMaterial?: RestorationMaterial;
  onMaterialSelect: (material: RestorationMaterial) => void;
  disabled?: boolean;
}

export const MaterialSelector = memo(function MaterialSelector({
  selectedMaterial,
  onMaterialSelect,
  disabled,
}: MaterialSelectorProps) {
  return (
    <div className="material-selector">
      <label className="material-selector-label">Material Restaurare</label>
      <select
        value={selectedMaterial || ''}
        onChange={(e) => onMaterialSelect(e.target.value as RestorationMaterial)}
        disabled={disabled}
        className="form-select form-select-sm"
      >
        <option value="">-- Selecteaza Material --</option>
        {MATERIAL_CONFIG.map((material) => (
          <option key={material.value} value={material.value}>
            {material.label}
          </option>
        ))}
      </select>
    </div>
  );
});

// ============================================================================
// SEVERITY SELECTOR
// ============================================================================

interface SeveritySelectorProps {
  selectedSeverity?: ConditionSeverity;
  onSeveritySelect: (severity: ConditionSeverity) => void;
  disabled?: boolean;
}

export const SeveritySelector = memo(function SeveritySelector({
  selectedSeverity,
  onSeveritySelect,
  disabled,
}: SeveritySelectorProps) {
  return (
    <div className="severity-selector">
      <label className="severity-selector-label">Severitate</label>
      <div className="severity-selector-btns">
        {SEVERITY_CONFIG.map((severity) => (
          <button
            key={severity.value}
            type="button"
            onClick={() => onSeveritySelect(severity.value)}
            disabled={disabled}
            className={`severity-btn ${selectedSeverity === severity.value ? 'severity-btn-selected' : ''}`}
            style={{
              '--severity-color': severity.color,
            } as React.CSSProperties}
            aria-pressed={selectedSeverity === severity.value}
          >
            {severity.label}
          </button>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// MAIN PALETTE COMPONENT
// ============================================================================

/**
 * ToothConditionPalette - Condition selection palette
 */
export const ToothConditionPalette = memo(function ToothConditionPalette({
  selectedCondition,
  onConditionSelect,
  disabled = false,
  showDescriptions = false,
  columns = 4,
}: ToothConditionPaletteProps) {
  // Keyboard shortcuts (1-9) for conditions
  useEffect(() => {
    if (disabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= CONDITION_CONFIG.length) {
        e.preventDefault();
        onConditionSelect(CONDITION_CONFIG[keyNum - 1].value);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled, onConditionSelect]);

  return (
    <div className="condition-palette">
      <label className="condition-palette-label">
        Conditie Dentara
        <span className="condition-palette-hint">(Tasteaza 1-{Math.min(9, CONDITION_CONFIG.length)})</span>
      </label>
      <div
        className="condition-palette-grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
        role="radiogroup"
        aria-label="Selecteaza conditia dentara"
      >
        {CONDITION_CONFIG.map((condition, index) => (
          <ConditionButton
            key={condition.value}
            condition={condition}
            selected={selectedCondition === condition.value}
            onClick={() => onConditionSelect(condition.value)}
            shortcutKey={index < 9 ? index + 1 : undefined}
            disabled={disabled}
            showDescription={showDescriptions}
          />
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// COMBINED CONDITION EDITOR
// ============================================================================

interface ConditionEditorProps {
  selectedCondition: ToothConditionType;
  selectedSurfaces: ToothSurface[];
  selectedMaterial?: RestorationMaterial;
  selectedSeverity?: ConditionSeverity;
  onConditionSelect: (condition: ToothConditionType) => void;
  onSurfaceToggle: (surface: ToothSurface) => void;
  onMaterialSelect: (material: RestorationMaterial) => void;
  onSeveritySelect: (severity: ConditionSeverity) => void;
  onApply: () => void;
  onCancel: () => void;
  disabled?: boolean;
  showMaterial?: boolean;
  showSeverity?: boolean;
  availableSurfaces?: ToothSurface[];
}

/**
 * ConditionEditor - Combined editor for condition, surfaces, material, and severity
 */
export const ConditionEditor = memo(function ConditionEditor({
  selectedCondition,
  selectedSurfaces,
  selectedMaterial,
  selectedSeverity,
  onConditionSelect,
  onSurfaceToggle,
  onMaterialSelect,
  onSeveritySelect,
  onApply,
  onCancel,
  disabled = false,
  showMaterial = true,
  showSeverity = true,
  availableSurfaces = ALL_SURFACES,
}: ConditionEditorProps) {
  // Determine if material selector should show based on condition
  const conditionsWithMaterial: ToothConditionType[] = [
    'filling', 'crown', 'veneer', 'onlay_inlay', 'bridge',
  ];
  const shouldShowMaterial = showMaterial && conditionsWithMaterial.includes(selectedCondition);

  // Determine if severity selector should show based on condition
  const conditionsWithSeverity: ToothConditionType[] = ['caries'];
  const shouldShowSeverity = showSeverity && conditionsWithSeverity.includes(selectedCondition);

  // Handle keyboard apply (Enter)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      onApply();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }, [disabled, onApply, onCancel]);

  return (
    <div className="condition-editor" onKeyDown={handleKeyDown}>
      {/* Condition Selection */}
      <ToothConditionPalette
        selectedCondition={selectedCondition}
        onConditionSelect={onConditionSelect}
        disabled={disabled}
        columns={4}
      />

      {/* Surface Selection */}
      <SurfaceSelector
        selectedSurfaces={selectedSurfaces}
        onSurfaceToggle={onSurfaceToggle}
        disabled={disabled}
        availableSurfaces={availableSurfaces}
      />

      {/* Material Selection (conditional) */}
      {shouldShowMaterial && (
        <MaterialSelector
          selectedMaterial={selectedMaterial}
          onMaterialSelect={onMaterialSelect}
          disabled={disabled}
        />
      )}

      {/* Severity Selection (conditional) */}
      {shouldShowSeverity && (
        <SeveritySelector
          selectedSeverity={selectedSeverity}
          onSeveritySelect={onSeveritySelect}
          disabled={disabled}
        />
      )}

      {/* Action Buttons */}
      <div className="condition-editor-actions">
        <button
          type="button"
          onClick={onApply}
          disabled={disabled}
          className="btn btn-primary"
        >
          <i className="ti ti-check me-1" aria-hidden="true" />
          Aplica
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline-secondary"
        >
          <i className="ti ti-x me-1" aria-hidden="true" />
          Renunta
        </button>
      </div>
    </div>
  );
});

export default ToothConditionPalette;
