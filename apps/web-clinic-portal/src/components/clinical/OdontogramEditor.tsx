/**
 * Odontogram Editor - Interactive tooth chart
 */

import { useState } from 'react';

interface ToothCondition {
  condition: string;
  surfaces: string[];
}

interface ToothData {
  toothNumber: number;
  conditions: ToothCondition[];
}

interface OdontogramEditorProps {
  patientId: string;
  data?: ToothData[];
  onSave?: (data: ToothData[]) => void;
  readOnly?: boolean;
}

const adultTeeth = [
  // Upper jaw
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  // Lower jaw
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
];

const conditions = [
  { value: 'healthy', label: 'Sanatos', color: 'bg-success', textColor: 'text-white' },
  { value: 'caries', label: 'Carie', color: 'bg-danger', textColor: 'text-white' },
  { value: 'filling', label: 'Plomba', color: 'bg-primary', textColor: 'text-white' },
  { value: 'crown', label: 'Coroana', color: 'bg-purple', textColor: 'text-white' },
  { value: 'missing', label: 'Lipsa', color: 'bg-secondary', textColor: 'text-white' },
  { value: 'implant', label: 'Implant', color: 'bg-indigo', textColor: 'text-white' },
  { value: 'root_canal', label: 'Tratament de Canal', color: 'bg-warning', textColor: 'text-dark' },
  { value: 'bridge', label: 'Punte Dentara', color: 'bg-info', textColor: 'text-white' },
];

const surfaces = ['M', 'O', 'D', 'B', 'L']; // Mesial, Occlusal, Distal, Buccal, Lingual

export function OdontogramEditor({ patientId, data = [], onSave, readOnly = false }: OdontogramEditorProps) {
  const [teethData, setTeethData] = useState<Map<number, ToothData>>(
    new Map(data.map((tooth) => [tooth.toothNumber, tooth]))
  );
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState('caries');
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);

  const getToothCondition = (toothNumber: number): string => {
    const tooth = teethData.get(toothNumber);
    if (!tooth || tooth.conditions.length === 0) return 'healthy';
    return tooth.conditions[0].condition;
  };

  const handleToothClick = (toothNumber: number) => {
    if (readOnly) return;
    setSelectedTooth(toothNumber);
    const tooth = teethData.get(toothNumber);
    if (tooth && tooth.conditions.length > 0) {
      setSelectedCondition(tooth.conditions[0].condition);
      setSelectedSurfaces(tooth.conditions[0].surfaces);
    } else {
      setSelectedSurfaces([]);
    }
  };

  const handleApplyCondition = () => {
    if (!selectedTooth) return;

    const newTeethData = new Map(teethData);
    const existingTooth = newTeethData.get(selectedTooth);

    const newCondition: ToothCondition = {
      condition: selectedCondition,
      surfaces: selectedSurfaces.length > 0 ? selectedSurfaces : surfaces,
    };

    if (existingTooth) {
      newTeethData.set(selectedTooth, {
        ...existingTooth,
        conditions: [newCondition, ...existingTooth.conditions.slice(1)],
      });
    } else {
      newTeethData.set(selectedTooth, {
        toothNumber: selectedTooth,
        conditions: [newCondition],
      });
    }

    setTeethData(newTeethData);
    setSelectedTooth(null);
    setSelectedSurfaces([]);
  };

  const handleSave = () => {
    const dataArray = Array.from(teethData.values());
    onSave?.(dataArray);
  };

  const toggleSurface = (surface: string) => {
    setSelectedSurfaces((prev) =>
      prev.includes(surface) ? prev.filter((s) => s !== surface) : [...prev, surface]
    );
  };

  return (
    <div className="vstack gap-4">
      {/* Legend */}
      <div className="d-flex flex-wrap gap-3 p-4 bg-light rounded border">
        <span className="text-muted small fw-medium">Legenda:</span>
        {conditions.map((cond) => (
          <div key={cond.value} className="d-flex align-items-center gap-2">
            <div className={`badge-dot badge-dot-lg ${cond.color}`} />
            <span className="small">{cond.label}</span>
          </div>
        ))}
      </div>

      {/* Odontogram Chart */}
      <div className="card border shadow-sm">
        <div className="card-body p-4">
          {/* Upper Jaw */}
          <div className="mb-5">
            <div className="text-center text-dark small fw-bold text-uppercase mb-3">Arcada Superioara</div>
            <div className="d-flex justify-content-center gap-2">
              {adultTeeth[0].map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  condition={getToothCondition(toothNumber)}
                  selected={selectedTooth === toothNumber}
                  onClick={() => handleToothClick(toothNumber)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>

          {/* Lower Jaw */}
          <div>
            <div className="d-flex justify-content-center gap-2">
              {adultTeeth[1].map((toothNumber) => (
                <Tooth
                  key={toothNumber}
                  number={toothNumber}
                  condition={getToothCondition(toothNumber)}
                  selected={selectedTooth === toothNumber}
                  onClick={() => handleToothClick(toothNumber)}
                  readOnly={readOnly}
                />
              ))}
            </div>
            <div className="text-center text-dark small fw-bold text-uppercase mt-3">Arcada Inferioara</div>
          </div>
        </div>
      </div>

      {/* Condition Editor */}
      {!readOnly && selectedTooth && (
        <div className="card border shadow-sm">
          <div className="card-body p-4">
            <h5 className="card-title mb-4 text-dark">
              <i className="ti ti-dental me-2 text-primary"></i>
              Editare Dinte #{selectedTooth}
            </h5>

            {/* Condition Selection */}
            <div className="mb-4">
              <label className="form-label text-dark fw-semibold mb-2">
                Conditie Dentara
              </label>
              <div className="row g-2">
                {conditions.map((cond) => (
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
              >
                <i className="ti ti-check me-1"></i>
                Aplica Conditia
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTooth(null);
                  setSelectedSurfaces([]);
                }}
                className="btn btn-outline-secondary"
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
  condition: string;
  selected: boolean;
  onClick: () => void;
  readOnly: boolean;
}

function Tooth({ number, condition, selected, onClick, readOnly }: ToothProps) {
  const conditionConfig = conditions.find((c) => c.value === condition) || conditions[0];

  return (
    <div className="d-flex flex-column align-items-center">
      <div
        className="text-dark fw-semibold mb-1"
        style={{ fontSize: '0.75rem', lineHeight: 1 }}
      >
        {number}
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={readOnly}
        className={`btn position-relative p-0 transition-all ${
          conditionConfig.color
        } ${
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
        aria-label={`Dinte ${number}, conditie: ${conditionConfig.label}`}
        title={`Dinte ${number} - ${conditionConfig.label}`}
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
    </div>
  );
}
