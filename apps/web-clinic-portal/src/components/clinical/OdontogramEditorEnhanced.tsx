/**
 * Enhanced Odontogram Editor - Advanced Interactive tooth chart
 *
 * Features:
 * - FDI/Universal numbering system toggle
 * - Quick Exam mode for rapid tooth selection
 * - Tooth history on hover
 * - Collapsible legend
 * - Treatment status visualization
 * - Keyboard shortcuts support
 */

import { useState, useCallback, useEffect } from 'react';
import { Badge } from '../ui-new/Badge';

interface ToothCondition {
  condition: string;
  surfaces: string[];
  date?: string;
  notes?: string;
}

interface ToothData {
  toothNumber: number;
  conditions: ToothCondition[];
  treatmentStatus?: 'planned' | 'in_progress' | 'completed';
}

interface ToothTreatmentHistory {
  date: string;
  procedure: string;
  provider: string;
  status: string;
}

interface OdontogramEditorEnhancedProps {
  patientId: string;
  data?: ToothData[];
  treatmentHistory?: Map<number, ToothTreatmentHistory[]>;
  onSave?: (data: ToothData[]) => void;
  onToothClick?: (toothNumber: number) => void;
  readOnly?: boolean;
  showTreatmentStatus?: boolean;
}

type NumberingSystem = 'FDI' | 'Universal';

const adultTeethFDI = [
  // Upper jaw
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  // Lower jaw
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
];

// FDI to Universal conversion map
const fdiToUniversal: Record<number, number> = {
  // Upper right
  18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
  // Upper left
  21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
  // Lower left
  38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
  // Lower right
  48: 32, 47: 31, 46: 30, 45: 29, 44: 28, 43: 27, 42: 26, 41: 25,
};

const conditions = [
  { value: 'healthy', label: 'Sanatos', color: 'bg-success', textColor: 'text-white', icon: 'ti-check' },
  { value: 'caries', label: 'Carie', color: 'bg-danger', textColor: 'text-white', icon: 'ti-alert-circle' },
  { value: 'filling', label: 'Plomba', color: 'bg-primary', textColor: 'text-white', icon: 'ti-circle-filled' },
  { value: 'crown', label: 'Coroana', color: 'bg-purple', textColor: 'text-white', icon: 'ti-crown' },
  { value: 'missing', label: 'Lipsa', color: 'bg-secondary', textColor: 'text-white', icon: 'ti-x' },
  { value: 'implant', label: 'Implant', color: 'bg-indigo', textColor: 'text-white', icon: 'ti-pill' },
  { value: 'root_canal', label: 'Tratament de Canal', color: 'bg-warning', textColor: 'text-dark', icon: 'ti-dental' },
  { value: 'bridge', label: 'Punte Dentara', color: 'bg-info', textColor: 'text-white', icon: 'ti-bridge' },
];

const surfaces = ['M', 'O', 'D', 'B', 'L']; // Mesial, Occlusal, Distal, Buccal, Lingual

export function OdontogramEditorEnhanced({
  patientId: _patientId,
  data = [],
  treatmentHistory,
  onSave,
  onToothClick,
  readOnly = false,
  showTreatmentStatus = true,
}: OdontogramEditorEnhancedProps) {
  const [teethData, setTeethData] = useState<Map<number, ToothData>>(
    new Map(data.map((tooth) => [tooth.toothNumber, tooth]))
  );
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState('caries');
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
  const [numberingSystem, setNumberingSystem] = useState<NumberingSystem>('FDI');
  const [quickExamMode, setQuickExamMode] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const [quickExamSelection, setQuickExamSelection] = useState<number[]>([]);

  const getToothCondition = (toothNumber: number): string => {
    const tooth = teethData.get(toothNumber);
    if (!tooth || tooth.conditions.length === 0) return 'healthy';
    return tooth.conditions[0].condition;
  };

  const getToothDisplayNumber = (fdiNumber: number): string => {
    if (numberingSystem === 'FDI') {
      return fdiNumber.toString();
    }
    return fdiToUniversal[fdiNumber]?.toString() || fdiNumber.toString();
  };

  const handleToothClick = useCallback((toothNumber: number) => {
    if (readOnly) return;

    if (quickExamMode) {
      // In quick exam mode, just toggle selection
      setQuickExamSelection(prev =>
        prev.includes(toothNumber)
          ? prev.filter(n => n !== toothNumber)
          : [...prev, toothNumber]
      );
      return;
    }

    // Normal mode
    setSelectedTooth(toothNumber);
    const tooth = teethData.get(toothNumber);
    if (tooth && tooth.conditions.length > 0) {
      setSelectedCondition(tooth.conditions[0].condition);
      setSelectedSurfaces(tooth.conditions[0].surfaces);
    } else {
      setSelectedSurfaces([]);
    }

    onToothClick?.(toothNumber);
  }, [readOnly, quickExamMode, teethData, onToothClick]);

  const handleApplyCondition = useCallback(() => {
    if (!selectedTooth && quickExamSelection.length === 0) return;

    const newTeethData = new Map(teethData);
    const teethToUpdate = quickExamMode ? quickExamSelection : [selectedTooth!];

    const newCondition: ToothCondition = {
      condition: selectedCondition,
      surfaces: selectedSurfaces.length > 0 ? selectedSurfaces : surfaces,
      date: new Date().toISOString(),
    };

    teethToUpdate.forEach(toothNum => {
      const existingTooth = newTeethData.get(toothNum);
      if (existingTooth) {
        newTeethData.set(toothNum, {
          ...existingTooth,
          conditions: [newCondition, ...existingTooth.conditions.slice(1)],
        });
      } else {
        newTeethData.set(toothNum, {
          toothNumber: toothNum,
          conditions: [newCondition],
        });
      }
    });

    setTeethData(newTeethData);

    if (quickExamMode) {
      setQuickExamSelection([]);
    } else {
      setSelectedTooth(null);
    }
    setSelectedSurfaces([]);
  }, [selectedTooth, quickExamSelection, quickExamMode, selectedCondition, selectedSurfaces, teethData]);

  const handleSave = useCallback(() => {
    const dataArray = Array.from(teethData.values());
    onSave?.(dataArray);
  }, [teethData, onSave]);

  const toggleSurface = useCallback((surface: string) => {
    setSelectedSurfaces((prev) =>
      prev.includes(surface) ? prev.filter((s) => s !== surface) : [...prev, surface]
    );
  }, []);

  const toggleQuickExamMode = useCallback(() => {
    setQuickExamMode(prev => !prev);
    setQuickExamSelection([]);
    setSelectedTooth(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (readOnly) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-8 for conditions
      if (e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key) - 1;
        if (index < conditions.length) {
          setSelectedCondition(conditions[index].value);
        }
        e.preventDefault();
      }

      // Q for Quick Exam mode toggle
      if (e.key === 'q' || e.key === 'Q') {
        if (!e.ctrlKey && !e.metaKey) {
          toggleQuickExamMode();
          e.preventDefault();
        }
      }

      // Enter to apply condition
      if (e.key === 'Enter' && (selectedTooth || quickExamSelection.length > 0)) {
        handleApplyCondition();
        e.preventDefault();
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        setSelectedTooth(null);
        setQuickExamSelection([]);
        e.preventDefault();
      }

      // Surface selection with M, O, D, B, L keys
      const surfaceKeys = { m: 'M', o: 'O', d: 'D', b: 'B', l: 'L' };
      const lowerKey = e.key.toLowerCase();
      if (lowerKey in surfaceKeys && (selectedTooth || quickExamSelection.length > 0)) {
        toggleSurface(surfaceKeys[lowerKey as keyof typeof surfaceKeys]);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [readOnly, selectedTooth, quickExamSelection, toggleQuickExamMode, handleApplyCondition, toggleSurface]);

  return (
    <div className="vstack gap-4">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded border">
        <div className="d-flex gap-2 align-items-center">
          {/* Numbering System Toggle */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${numberingSystem === 'FDI' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setNumberingSystem('FDI')}
            >
              FDI
            </button>
            <button
              type="button"
              className={`btn btn-sm ${numberingSystem === 'Universal' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setNumberingSystem('Universal')}
            >
              Universal
            </button>
          </div>

          {/* Quick Exam Mode Toggle */}
          {!readOnly && (
            <button
              type="button"
              className={`btn btn-sm ${quickExamMode ? 'btn-success' : 'btn-outline-success'}`}
              onClick={toggleQuickExamMode}
              title="Quick Exam Mode (Q) - Select multiple teeth rapidly"
            >
              <i className={`ti ${quickExamMode ? 'ti-checks' : 'ti-hand-click'} me-1`}></i>
              {quickExamMode ? 'Quick Exam: ON' : 'Quick Exam'}
              {quickExamMode && quickExamSelection.length > 0 && (
                <Badge variant="light" className="ms-2">{quickExamSelection.length}</Badge>
              )}
            </button>
          )}
        </div>

        <div className="d-flex gap-2">
          {/* Legend Toggle */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowLegend(!showLegend)}
          >
            <i className={`ti ${showLegend ? 'ti-eye-off' : 'ti-eye'} me-1`}></i>
            {showLegend ? 'Ascunde' : 'Arata'} Legenda
          </button>

          {/* View Options */}
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i className="ti ti-adjustments me-1"></i>
              Optiuni
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item">
                  <i className="ti ti-zoom-in me-2"></i>
                  Zoom In
                </button>
              </li>
              <li>
                <button className="dropdown-item">
                  <i className="ti ti-zoom-out me-2"></i>
                  Zoom Out
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item">
                  <i className="ti ti-printer me-2"></i>
                  Printeaza Odontograma
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Collapsible Legend */}
      {showLegend && (
        <div className="p-3 bg-light rounded border">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small fw-semibold">Legenda Conditii Dentare</span>
            <span className="text-muted small">Tastatura: 1-8 pentru selectie rapida</span>
          </div>
          <div className="d-flex flex-wrap gap-3">
            {conditions.map((cond, idx) => (
              <div key={cond.value} className="d-flex align-items-center gap-2">
                <div className={`badge-dot badge-dot-lg ${cond.color}`} />
                <span className="small">
                  <kbd className="me-1">{idx + 1}</kbd>
                  {cond.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Odontogram Chart */}
      <div className="card border shadow-sm odontogram-chart">
        <div className="card-body p-4">
          {/* Upper Jaw */}
          <div className="mb-5">
            <div className="text-center text-dark small fw-bold text-uppercase mb-3">
              Arcada Superioara
            </div>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {adultTeethFDI[0].map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  displayNumber={getToothDisplayNumber(toothNumber)}
                  condition={getToothCondition(toothNumber)}
                  selected={selectedTooth === toothNumber || quickExamSelection.includes(toothNumber)}
                  treatmentStatus={teethData.get(toothNumber)?.treatmentStatus}
                  showTreatmentStatus={showTreatmentStatus}
                  history={treatmentHistory?.get(toothNumber)}
                  onClick={() => handleToothClick(toothNumber)}
                  onMouseEnter={() => setHoveredTooth(toothNumber)}
                  onMouseLeave={() => setHoveredTooth(null)}
                  showHistory={hoveredTooth === toothNumber}
                  readOnly={readOnly}
                  quickExamMode={quickExamMode}
                />
              ))}
            </div>
          </div>

          {/* Lower Jaw */}
          <div>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {adultTeethFDI[1].map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  displayNumber={getToothDisplayNumber(toothNumber)}
                  condition={getToothCondition(toothNumber)}
                  selected={selectedTooth === toothNumber || quickExamSelection.includes(toothNumber)}
                  treatmentStatus={teethData.get(toothNumber)?.treatmentStatus}
                  showTreatmentStatus={showTreatmentStatus}
                  history={treatmentHistory?.get(toothNumber)}
                  onClick={() => handleToothClick(toothNumber)}
                  onMouseEnter={() => setHoveredTooth(toothNumber)}
                  onMouseLeave={() => setHoveredTooth(null)}
                  showHistory={hoveredTooth === toothNumber}
                  readOnly={readOnly}
                  quickExamMode={quickExamMode}
                />
              ))}
            </div>
            <div className="text-center text-dark small fw-bold text-uppercase mt-3">
              Arcada Inferioara
            </div>
          </div>
        </div>
      </div>

      {/* Condition Editor */}
      {!readOnly && (selectedTooth || quickExamSelection.length > 0) && (
        <div className="card border shadow-sm">
          <div className="card-body p-4">
            <h5 className="card-title mb-4 text-dark">
              <i className="ti ti-dental me-2 text-primary"></i>
              {quickExamMode
                ? `Editare ${quickExamSelection.length} Dinti Selectati`
                : `Editare Dinte #${getToothDisplayNumber(selectedTooth!)}`}
            </h5>

            {/* Condition Selection */}
            <div className="mb-4">
              <label className="form-label text-dark fw-semibold mb-2">
                Conditie Dentara
                <span className="text-muted fw-normal ms-2">(Tasteaza 1-8 pentru selectie rapida)</span>
              </label>
              <div className="row g-2">
                {conditions.map((cond, idx) => (
                  <div key={cond.value} className="col-md-3 col-6">
                    <button
                      type="button"
                      onClick={() => setSelectedCondition(cond.value)}
                      className={`btn w-100 ${
                        selectedCondition === cond.value
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                      }`}
                    >
                      <kbd className="me-1">{idx + 1}</kbd>
                      {cond.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Surface Selection */}
            <div className="mb-4">
              <label className="form-label text-dark fw-semibold mb-2">
                Suprafete Afectate (optional)
                <span className="text-muted fw-normal ms-2">(Tasteaza M, O, D, B, L)</span>
              </label>
              <div className="d-flex gap-2 mb-2">
                {surfaces.map((surface) => (
                  <button
                    key={surface}
                    type="button"
                    onClick={() => toggleSurface(surface)}
                    className={`btn btn-square ${
                      selectedSurfaces.includes(surface)
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    style={{ width: '3rem', height: '3rem' }}
                    title={`${surface} - Tasteaza ${surface.toLowerCase()}`}
                  >
                    <strong>{surface}</strong>
                  </button>
                ))}
              </div>
              <small className="text-secondary">
                M: Mezial | O: Ocluzal | D: Distal | B: Bucal | L: Lingual
              </small>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={handleApplyCondition}
                className="btn btn-primary"
                title="Aplica (Enter)"
              >
                <i className="ti ti-check me-1"></i>
                Aplica Conditia
                {quickExamMode && quickExamSelection.length > 0 && (
                  <Badge variant="light" className="ms-2">{quickExamSelection.length} dinti</Badge>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTooth(null);
                  setQuickExamSelection([]);
                  setSelectedSurfaces([]);
                }}
                className="btn btn-outline-secondary"
                title="Renunta (Escape)"
              >
                <i className="ti ti-x me-1"></i>
                Renunta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {!readOnly && (
        <div className="d-flex justify-content-end">
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-success btn-lg"
          >
            <i className="ti ti-device-floppy me-2"></i>
            Salveaza Odontograma
          </button>
        </div>
      )}
    </div>
  );
}

interface ToothProps {
  number: number;
  displayNumber: string;
  condition: string;
  selected: boolean;
  treatmentStatus?: 'planned' | 'in_progress' | 'completed';
  showTreatmentStatus: boolean;
  history?: ToothTreatmentHistory[];
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showHistory: boolean;
  readOnly: boolean;
  quickExamMode: boolean;
}

function Tooth({
  number: _number,
  displayNumber,
  condition,
  selected,
  treatmentStatus,
  showTreatmentStatus,
  history,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showHistory,
  readOnly,
  quickExamMode,
}: ToothProps) {
  const conditionConfig = conditions.find((c) => c.value === condition) || conditions[0];

  const treatmentStatusConfig = {
    planned: { icon: 'ti-clock', color: 'text-warning', bgColor: 'bg-warning' },
    in_progress: { icon: 'ti-loader', color: 'text-info', bgColor: 'bg-info' },
    completed: { icon: 'ti-check', color: 'text-success', bgColor: 'bg-success' },
  };

  return (
    <div className="d-flex flex-column align-items-center position-relative">
      <div
        className="text-dark fw-semibold mb-1"
        style={{ fontSize: '0.75rem', lineHeight: 1 }}
      >
        {displayNumber}
      </div>

      <div className="position-relative">
        <button
          type="button"
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          disabled={readOnly}
          className={`btn position-relative p-0 transition-all ${conditionConfig.color} ${
            selected ? 'border border-primary border-3 shadow-lg' : 'border border-dark border-opacity-25'
          }`}
          style={{
            width: '2.25rem',
            height: '3.25rem',
            borderRadius: '0.375rem',
            cursor: readOnly ? 'default' : 'pointer',
            transform: selected ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.15s ease-in-out',
          }}
          aria-label={`Dinte ${displayNumber}, conditie: ${conditionConfig.label}`}
          title={`Dinte ${displayNumber} - ${conditionConfig.label}${quickExamMode ? ' (Click pentru selectie)' : ''}`}
        >
          {condition === 'missing' && (
            <span
              className="position-absolute top-50 start-50 translate-middle fw-bold"
              style={{ fontSize: '1.5rem', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              aria-hidden="true"
            >
              ×
            </span>
          )}
        </button>

        {/* Treatment Status Indicator */}
        {showTreatmentStatus && treatmentStatus && (
          <div
            className={`position-absolute top-0 end-0 rounded-circle border border-white ${
              treatmentStatusConfig[treatmentStatus].bgColor
            }`}
            style={{
              width: '16px',
              height: '16px',
              marginTop: '-4px',
              marginRight: '-4px',
            }}
            title={treatmentStatus === 'planned' ? 'Planificat' : treatmentStatus === 'in_progress' ? 'In Desfasurare' : 'Finalizat'}
          >
            <i className={`ti ${treatmentStatusConfig[treatmentStatus].icon} text-white`} style={{ fontSize: '10px' }}></i>
          </div>
        )}

        {/* History Tooltip */}
        {showHistory && history && history.length > 0 && (
          <div
            className="position-absolute bg-white border shadow-lg rounded p-2"
            style={{
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              minWidth: '200px',
              zIndex: 1050,
            }}
          >
            <div className="small fw-semibold mb-2">Istoric Tratamente</div>
            <div className="vstack gap-1">
              {history.slice(0, 3).map((item, idx) => (
                <div key={idx} className="small">
                  <div className="fw-medium">{item.procedure}</div>
                  <div className="text-muted">{new Date(item.date).toLocaleDateString('ro-RO')}</div>
                </div>
              ))}
              {history.length > 3 && (
                <div className="small text-muted">+{history.length - 3} mai multe...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Exam Selection Indicator */}
      {quickExamMode && selected && (
        <div className="mt-1">
          <i className="ti ti-check text-success fw-bold"></i>
        </div>
      )}
    </div>
  );
}
