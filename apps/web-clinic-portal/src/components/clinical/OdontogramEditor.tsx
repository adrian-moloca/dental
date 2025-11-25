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
  { value: 'healthy', label: 'Healthy', color: 'bg-green-500' },
  { value: 'caries', label: 'Caries', color: 'bg-red-500' },
  { value: 'filling', label: 'Filling', color: 'bg-blue-500' },
  { value: 'crown', label: 'Crown', color: 'bg-purple-500' },
  { value: 'missing', label: 'Missing', color: 'bg-gray-400' },
  { value: 'implant', label: 'Implant', color: 'bg-indigo-500' },
  { value: 'root_canal', label: 'Root Canal', color: 'bg-yellow-600' },
  { value: 'bridge', label: 'Bridge', color: 'bg-cyan-500' },
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
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-4 bg-surface rounded-lg border border-white/10">
        <span className="text-sm font-medium text-foreground/70">Legend:</span>
        {conditions.map((cond) => (
          <div key={cond.value} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${cond.color}`} />
            <span className="text-sm text-foreground">{cond.label}</span>
          </div>
        ))}
      </div>

      {/* Odontogram Chart */}
      <div className="space-y-8 p-6 bg-surface rounded-lg border border-white/10">
        {/* Upper Jaw */}
        <div>
          <div className="text-xs font-medium text-foreground/50 text-center mb-2">UPPER JAW</div>
          <div className="flex justify-center gap-1">
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
          <div className="flex justify-center gap-1">
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
          <div className="text-xs font-medium text-foreground/50 text-center mt-2">LOWER JAW</div>
        </div>
      </div>

      {/* Condition Editor */}
      {!readOnly && selectedTooth && (
        <div className="p-6 bg-surface rounded-lg border border-white/10 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Edit Tooth #{selectedTooth}
          </h3>

          {/* Condition Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Condition
            </label>
            <div className="grid grid-cols-4 gap-2">
              {conditions.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => setSelectedCondition(cond.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCondition === cond.value
                      ? 'bg-brand text-white'
                      : 'bg-surface-hover text-foreground/70 hover:bg-surface-hover/80'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surface Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Surfaces (optional)
            </label>
            <div className="flex gap-2">
              {surfaces.map((surface) => (
                <button
                  key={surface}
                  onClick={() => toggleSurface(surface)}
                  className={`w-12 h-12 rounded-lg text-sm font-bold transition-all ${
                    selectedSurfaces.includes(surface)
                      ? 'bg-brand text-white'
                      : 'bg-surface-hover text-foreground/70 hover:bg-surface-hover/80'
                  }`}
                >
                  {surface}
                </button>
              ))}
            </div>
            <p className="text-xs text-foreground/50 mt-2">
              M: Mesial, O: Occlusal, D: Distal, B: Buccal, L: Lingual
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleApplyCondition}
              className="px-6 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setSelectedTooth(null);
                setSelectedSurfaces([]);
              }}
              className="px-6 py-2 bg-surface-hover text-foreground rounded-lg font-medium hover:bg-surface-hover/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      {!readOnly && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition-colors"
          >
            Save Odontogram
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
    <div className="flex flex-col items-center">
      <div className="text-xs text-foreground/50 mb-1">{number}</div>
      <button
        onClick={onClick}
        disabled={readOnly}
        className={`w-8 h-12 rounded-lg transition-all relative ${
          conditionConfig.color
        } ${
          selected ? 'ring-4 ring-brand scale-110' : ''
        } ${
          !readOnly ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
        }`}
        aria-label={`Tooth ${number}, condition: ${conditionConfig.label}`}
      >
        {condition === 'missing' && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
            ×
          </div>
        )}
      </button>
    </div>
  );
}
