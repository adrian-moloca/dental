/**
 * ToothDetailsPanel Component
 *
 * A detailed panel showing:
 * - Tooth information and current status
 * - Active conditions with surfaces
 * - History timeline from backend
 * - Actions for adding/removing conditions
 * - Tooth properties (mobility, furcation)
 */

import { memo, useState, useCallback } from 'react';
import { useToothHistory } from '../../../hooks/useClinical';
import type {
  ToothDetailsPanelProps,
  ToothConditionType,
  ToothSurface,
  ConditionSeverity,
  RestorationMaterial,
  FurcationClass,
  ToothConditionRecord,
  ToothHistoryEntry,
} from './types';
import {
  getToothType,
  getToothTypeName,
  isUpperTooth,
  getConditionConfig,
  getConditionLabel,
  getConditionColor,
  getSurfacesForTooth,
  MATERIAL_CONFIG,
  SEVERITY_CONFIG,
} from './types';
import { ConditionEditor } from './ToothConditionPalette';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMaterialLabel(material?: string): string {
  if (!material) return '';
  const config = MATERIAL_CONFIG.find(m => m.value === material);
  return config?.label || material;
}

function getSeverityLabel(severity?: string): string {
  if (!severity) return '';
  const config = SEVERITY_CONFIG.find(s => s.value === severity);
  return config?.label || severity;
}

// ============================================================================
// CONDITION CARD COMPONENT
// ============================================================================

interface ConditionCardProps {
  condition: ToothConditionRecord;
  onRemove: (conditionId: string) => void;
  readOnly?: boolean;
}

const ConditionCard = memo(function ConditionCard({
  condition,
  onRemove,
  readOnly,
}: ConditionCardProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removeReason, setRemoveReason] = useState('');

  const config = getConditionConfig(condition.condition);

  const handleRemove = useCallback(() => {
    if (removeReason.trim()) {
      onRemove(condition.id);
      setShowRemoveConfirm(false);
      setRemoveReason('');
    }
  }, [condition.id, onRemove, removeReason]);

  return (
    <div className="condition-card" style={{ borderLeftColor: config.color }}>
      <div className="condition-card-header">
        <div className="condition-card-title">
          <span
            className="condition-card-dot"
            style={{ backgroundColor: config.color }}
          />
          <span className="condition-card-name">{config.label}</span>
          {condition.severity && (
            <span className={`condition-card-severity severity-${condition.severity}`}>
              {getSeverityLabel(condition.severity)}
            </span>
          )}
        </div>
        {!readOnly && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setShowRemoveConfirm(true)}
            title="Sterge conditia"
          >
            <i className="ti ti-trash" />
          </button>
        )}
      </div>

      <div className="condition-card-body">
        {/* Surfaces */}
        {condition.surfaces && condition.surfaces.length > 0 && (
          <div className="condition-card-surfaces">
            <span className="condition-card-label">Suprafete:</span>
            <div className="condition-card-surface-badges">
              {condition.surfaces.map(surface => (
                <span key={surface} className="surface-badge">{surface}</span>
              ))}
            </div>
          </div>
        )}

        {/* Material */}
        {condition.material && (
          <div className="condition-card-material">
            <span className="condition-card-label">Material:</span>
            <span>{getMaterialLabel(condition.material)}</span>
          </div>
        )}

        {/* Date */}
        <div className="condition-card-date">
          <i className="ti ti-calendar me-1" />
          {formatDate(condition.recordedAt)}
        </div>

        {/* Notes */}
        {condition.notes && (
          <div className="condition-card-notes">
            <i className="ti ti-note me-1" />
            {condition.notes}
          </div>
        )}
      </div>

      {/* Remove Confirmation */}
      {showRemoveConfirm && (
        <div className="condition-card-remove-confirm">
          <label className="form-label">Motiv stergere:</label>
          <textarea
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
            className="form-control form-control-sm"
            rows={2}
            placeholder="Introdu motivul stergerii..."
          />
          <div className="condition-card-remove-actions">
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={handleRemove}
              disabled={!removeReason.trim()}
            >
              Confirma Stergerea
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setShowRemoveConfirm(false);
                setRemoveReason('');
              }}
            >
              Anuleaza
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// HISTORY TIMELINE COMPONENT
// ============================================================================

interface HistoryTimelineProps {
  patientId: string;
  toothNumber: number;
}

const HistoryTimeline = memo(function HistoryTimeline({
  patientId,
  toothNumber,
}: HistoryTimelineProps) {
  const { data: historyData, isLoading } = useToothHistory(
    patientId,
    toothNumber.toString(),
    { limit: 20 }
  );

  if (isLoading) {
    return (
      <div className="history-timeline-loading">
        <div className="spinner-border spinner-border-sm text-primary" />
        <span className="ms-2">Se incarca istoricul...</span>
      </div>
    );
  }

  const history = historyData?.data || [];

  if (history.length === 0) {
    return (
      <div className="history-timeline-empty">
        <i className="ti ti-info-circle me-2" />
        Nicio modificare inregistrata pentru acest dinte.
      </div>
    );
  }

  return (
    <div className="history-timeline">
      {history.map((entry, index) => (
        <HistoryEntry
          key={entry.id}
          entry={entry}
          isLatest={index === 0}
          isLast={index === history.length - 1}
        />
      ))}
    </div>
  );
});

interface HistoryEntryProps {
  entry: ToothHistoryEntry;
  isLatest: boolean;
  isLast: boolean;
}

const HistoryEntry = memo(function HistoryEntry({
  entry,
  isLatest,
  isLast,
}: HistoryEntryProps) {
  const getChangeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      condition_added: 'Conditie adaugata',
      condition_removed: 'Conditie eliminata',
      condition_updated: 'Conditie actualizata',
      tooth_updated: 'Dinte actualizat',
    };
    return labels[type] || type;
  };

  const getChangeTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      condition_added: 'ti-plus',
      condition_removed: 'ti-minus',
      condition_updated: 'ti-edit',
      tooth_updated: 'ti-settings',
    };
    return icons[type] || 'ti-point';
  };

  // Extract condition info from newState if available
  const newCondition = entry.newState?.condition as string | undefined;
  const newColor = newCondition ? getConditionColor(newCondition) : '#6C7688';

  return (
    <div className={`history-entry ${isLatest ? 'history-entry-latest' : ''}`}>
      <div className="history-connector">
        <span
          className="history-dot"
          style={{ backgroundColor: newColor }}
        >
          <i className={`ti ${getChangeTypeIcon(entry.changeType)}`} />
        </span>
        {!isLast && <span className="history-line" />}
      </div>

      <div className="history-content">
        <div className="history-header">
          <span className="history-type">{getChangeTypeLabel(entry.changeType)}</span>
          <span className="history-date">{formatDate(entry.createdAt)}</span>
        </div>

        {/* Show condition change details */}
        {entry.newState && (
          <div className="history-details">
            {newCondition && (
              <span
                className="history-condition-badge"
                style={{ backgroundColor: newColor }}
              >
                {getConditionLabel(newCondition)}
              </span>
            )}
            {(() => {
              const surfaces = entry.newState?.surfaces;
              if (surfaces && Array.isArray(surfaces) && surfaces.length > 0) {
                return (
                  <span className="history-surfaces">
                    Suprafete: {(surfaces as string[]).join(', ')}
                  </span>
                );
              }
              return null;
            })()}
          </div>
        )}

        {entry.reason && (
          <div className="history-reason">
            <i className="ti ti-message me-1" />
            {entry.reason}
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// TOOTH PROPERTIES EDITOR
// ============================================================================

interface ToothPropertiesProps {
  isPresent: boolean;
  mobility?: number;
  furcation?: FurcationClass;
  notes?: string;
  onUpdate: (updates: {
    isPresent?: boolean;
    mobility?: number;
    furcation?: FurcationClass;
    notes?: string;
  }) => void;
  readOnly?: boolean;
}

const ToothProperties = memo(function ToothProperties({
  isPresent,
  mobility,
  furcation,
  notes,
  onUpdate,
  readOnly,
}: ToothPropertiesProps) {
  return (
    <div className="tooth-properties">
      <h6 className="tooth-properties-title">
        <i className="ti ti-settings me-2" />
        Proprietati Dinte
      </h6>

      {/* Present/Missing toggle */}
      <div className="tooth-property">
        <label className="form-label">Stare:</label>
        <div className="btn-group btn-group-sm">
          <button
            type="button"
            className={`btn ${isPresent ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => !readOnly && onUpdate({ isPresent: true })}
            disabled={readOnly}
          >
            Prezent
          </button>
          <button
            type="button"
            className={`btn ${!isPresent ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => !readOnly && onUpdate({ isPresent: false })}
            disabled={readOnly}
          >
            Absent
          </button>
        </div>
      </div>

      {/* Mobility */}
      <div className="tooth-property">
        <label className="form-label">Mobilitate:</label>
        <div className="btn-group btn-group-sm">
          {[0, 1, 2, 3].map((grade) => (
            <button
              key={grade}
              type="button"
              className={`btn ${mobility === grade ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => !readOnly && onUpdate({ mobility: grade })}
              disabled={readOnly}
              title={`Grad ${grade}`}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>

      {/* Furcation (only for molars) */}
      <div className="tooth-property">
        <label className="form-label">Furcatie:</label>
        <select
          value={furcation || 'none'}
          onChange={(e) => !readOnly && onUpdate({ furcation: e.target.value as FurcationClass })}
          className="form-select form-select-sm"
          disabled={readOnly}
        >
          <option value="none">Fara</option>
          <option value="class_1">Clasa I</option>
          <option value="class_2">Clasa II</option>
          <option value="class_3">Clasa III</option>
        </select>
      </div>

      {/* Notes */}
      <div className="tooth-property">
        <label className="form-label">Note:</label>
        <textarea
          value={notes || ''}
          onChange={(e) => !readOnly && onUpdate({ notes: e.target.value })}
          className="form-control form-control-sm"
          rows={2}
          placeholder="Note despre acest dinte..."
          disabled={readOnly}
        />
      </div>
    </div>
  );
});

// ============================================================================
// MAIN TOOTH DETAILS PANEL
// ============================================================================

export const ToothDetailsPanel = memo(function ToothDetailsPanel({
  patientId,
  toothNumber,
  toothData,
  onClose,
  onAddCondition,
  onRemoveCondition,
  onUpdateTooth,
  readOnly = false,
}: ToothDetailsPanelProps) {
  // Local state for the condition editor
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<ToothConditionType>('caries');
  const [selectedSurfaces, setSelectedSurfaces] = useState<ToothSurface[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<RestorationMaterial | undefined>();
  const [selectedSeverity, setSelectedSeverity] = useState<ConditionSeverity | undefined>();
  const [activeTab, setActiveTab] = useState<'conditions' | 'history' | 'properties'>('conditions');

  const toothType = getToothType(toothNumber);
  const toothTypeName = getToothTypeName(toothType);
  const isUpper = isUpperTooth(toothNumber);
  const archName = isUpper ? 'Arcada Superioara' : 'Arcada Inferioara';
  const availableSurfaces = getSurfacesForTooth(toothType);

  // Active conditions (not deleted)
  const activeConditions = toothData?.conditions?.filter(c => !c.deletedAt) || [];

  // Handle surface toggle
  const handleSurfaceToggle = useCallback((surface: ToothSurface) => {
    setSelectedSurfaces(prev =>
      prev.includes(surface)
        ? prev.filter(s => s !== surface)
        : [...prev, surface]
    );
  }, []);

  // Handle apply condition
  const handleApplyCondition = useCallback(() => {
    onAddCondition(
      selectedCondition,
      selectedSurfaces.length > 0 ? selectedSurfaces : availableSurfaces,
      {
        severity: selectedSeverity,
        material: selectedMaterial,
      }
    );
    setIsAddingCondition(false);
    setSelectedSurfaces([]);
    setSelectedMaterial(undefined);
    setSelectedSeverity(undefined);
  }, [selectedCondition, selectedSurfaces, availableSurfaces, selectedSeverity, selectedMaterial, onAddCondition]);

  // Handle cancel add condition
  const handleCancelAddCondition = useCallback(() => {
    setIsAddingCondition(false);
    setSelectedSurfaces([]);
    setSelectedMaterial(undefined);
    setSelectedSeverity(undefined);
  }, []);

  // Handle remove condition
  const handleRemoveCondition = useCallback((conditionId: string) => {
    onRemoveCondition(conditionId, 'Eliminat din panel detalii');
  }, [onRemoveCondition]);

  return (
    <div className="tooth-details-panel">
      {/* Header */}
      <div className="tooth-details-header">
        <div className="tooth-details-title">
          <i className="ti ti-dental me-2" />
          <span className="tooth-details-number">#{toothNumber}</span>
          <span className="tooth-details-type">{toothTypeName}</span>
          <span className="tooth-details-arch">{archName}</span>
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Inchide"
        />
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs tooth-details-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'conditions' ? 'active' : ''}`}
            onClick={() => setActiveTab('conditions')}
          >
            <i className="ti ti-list me-1" />
            Conditii ({activeConditions.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="ti ti-history me-1" />
            Istoric
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            <i className="ti ti-settings me-1" />
            Proprietati
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tooth-details-content">
        {/* Conditions Tab */}
        {activeTab === 'conditions' && (
          <div className="tooth-conditions-tab">
            {/* Add Condition Button or Editor */}
            {!readOnly && (
              <div className="tooth-conditions-actions">
                {isAddingCondition ? (
                  <ConditionEditor
                    selectedCondition={selectedCondition}
                    selectedSurfaces={selectedSurfaces}
                    selectedMaterial={selectedMaterial}
                    selectedSeverity={selectedSeverity}
                    onConditionSelect={setSelectedCondition}
                    onSurfaceToggle={handleSurfaceToggle}
                    onMaterialSelect={setSelectedMaterial}
                    onSeveritySelect={setSelectedSeverity}
                    onApply={handleApplyCondition}
                    onCancel={handleCancelAddCondition}
                    availableSurfaces={availableSurfaces}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAddingCondition(true)}
                  >
                    <i className="ti ti-plus me-1" />
                    Adauga Conditie
                  </button>
                )}
              </div>
            )}

            {/* Active Conditions List */}
            <div className="tooth-conditions-list">
              {activeConditions.length === 0 ? (
                <div className="tooth-conditions-empty">
                  <i className="ti ti-check-circle me-2 text-success" />
                  Dintele este sanatos - nicio conditie inregistrata.
                </div>
              ) : (
                activeConditions.map(condition => (
                  <ConditionCard
                    key={condition.id}
                    condition={condition}
                    onRemove={handleRemoveCondition}
                    readOnly={readOnly}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="tooth-history-tab">
            <HistoryTimeline
              patientId={patientId}
              toothNumber={toothNumber}
            />
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="tooth-properties-tab">
            <ToothProperties
              isPresent={toothData?.isPresent ?? true}
              mobility={toothData?.mobility}
              furcation={toothData?.furcation}
              notes={toothData?.notes}
              onUpdate={onUpdateTooth}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default ToothDetailsPanel;
