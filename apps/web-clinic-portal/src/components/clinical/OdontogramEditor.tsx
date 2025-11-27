/**
 * Odontogram Editor - Interactive tooth chart with realistic SVG teeth
 *
 * A world-class dental charting component featuring:
 * - Realistic SVG tooth shapes (incisors, canines, premolars, molars)
 * - FDI tooth numbering system
 * - Interactive hover effects and tooltips
 * - Full keyboard navigation and accessibility
 * - Smooth animations and professional appearance
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import './odontogram.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

// ============================================================================
// CONSTANTS
// ============================================================================

// FDI tooth numbering - Upper jaw (quadrants 1 and 2)
const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
// FDI tooth numbering - Lower jaw (quadrants 4 and 3)
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// Tooth type mapping based on FDI position
const getToothType = (toothNumber: number): 'molar' | 'premolar' | 'canine' | 'incisor' => {
  const position = toothNumber % 10;
  if (position >= 6) return 'molar';
  if (position >= 4) return 'premolar';
  if (position === 3) return 'canine';
  return 'incisor';
};

// Check if tooth is in upper arch
const isUpperTooth = (toothNumber: number): boolean => {
  const quadrant = Math.floor(toothNumber / 10);
  return quadrant === 1 || quadrant === 2;
};

// Dental conditions with colors and labels
const conditions = [
  { value: 'healthy', label: 'Sanatos', color: '#27AE60', bgClass: 'condition-healthy' },
  { value: 'caries', label: 'Carie', color: '#EF1E1E', bgClass: 'condition-caries' },
  { value: 'filling', label: 'Plomba', color: '#2E37A4', bgClass: 'condition-filling' },
  { value: 'crown', label: 'Coroana', color: '#800080', bgClass: 'condition-crown' },
  { value: 'missing', label: 'Lipsa', color: '#6C7688', bgClass: 'condition-missing' },
  { value: 'implant', label: 'Implant', color: '#3538CD', bgClass: 'condition-implant' },
  { value: 'root_canal', label: 'Tratament de Canal', color: '#E2B93B', bgClass: 'condition-root-canal' },
  { value: 'bridge', label: 'Punte Dentara', color: '#2F80ED', bgClass: 'condition-bridge' },
] as const;

// Tooth surfaces
const surfaces = ['M', 'O', 'D', 'B', 'L'] as const;
type Surface = (typeof surfaces)[number];

// ============================================================================
// SVG TOOTH COMPONENTS
// ============================================================================

interface ToothSVGProps {
  type: 'molar' | 'premolar' | 'canine' | 'incisor';
  isUpper: boolean;
  condition: string;
  selected: boolean;
  conditionColor: string;
}

/**
 * Realistic SVG Molar Tooth
 * Wide crown with multiple cusps, broader root structure
 */
function MolarSVG({ isUpper, condition, selected, conditionColor }: Omit<ToothSVGProps, 'type'>) {
  const isMissing = condition === 'missing';

  return (
    <svg
      viewBox="0 0 40 60"
      className={`tooth-svg ${selected ? 'tooth-selected' : ''} ${isMissing ? 'tooth-missing' : ''}`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'none' }}
    >
      <defs>
        <linearGradient id={`molar-gradient-${isUpper ? 'upper' : 'lower'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F5F5F0" />
          <stop offset="100%" stopColor="#E8E8E0" />
        </linearGradient>
        <filter id="tooth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Root structure - subtle, anatomical */}
      <g className="tooth-root" opacity={isMissing ? 0.3 : 0.6}>
        {/* Three roots for molar */}
        <path
          d="M10 35 Q8 45, 6 55 Q7 56, 10 55 Q12 50, 12 40 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
        <path
          d="M20 35 Q20 48, 20 58 Q22 58, 22 48 Q22 38, 20 35 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
        <path
          d="M30 35 Q32 45, 34 55 Q33 56, 30 55 Q28 50, 28 40 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
      </g>

      {/* Crown - the visible part */}
      <g className="tooth-crown" filter="url(#tooth-shadow)">
        {/* Main crown shape */}
        <path
          d="M4 32 Q2 20, 4 10 Q8 4, 20 4 Q32 4, 36 10 Q38 20, 36 32 Q32 36, 20 36 Q8 36, 4 32 Z"
          fill={isMissing ? '#D0D0D0' : `url(#molar-gradient-${isUpper ? 'upper' : 'lower'})`}
          stroke={selected ? '#2E37A4' : '#C8C0B8'}
          strokeWidth={selected ? 2 : 1}
        />

        {/* Condition overlay */}
        {!isMissing && condition !== 'healthy' && (
          <path
            d="M6 30 Q4 20, 6 12 Q10 6, 20 6 Q30 6, 34 12 Q36 20, 34 30 Q30 34, 20 34 Q10 34, 6 30 Z"
            fill={conditionColor}
            opacity="0.35"
            className="condition-overlay"
          />
        )}

        {/* Occlusal surface details - cusps */}
        <g className="cusps" opacity={isMissing ? 0.3 : 0.5}>
          <ellipse cx="12" cy="16" rx="4" ry="3" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
          <ellipse cx="28" cy="16" rx="4" ry="3" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
          <ellipse cx="20" cy="22" rx="5" ry="4" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
          {/* Central fissure */}
          <path d="M10 18 Q20 24, 30 18" fill="none" stroke="#C0B8B0" strokeWidth="0.3" />
        </g>
      </g>

      {/* Missing tooth X indicator */}
      {isMissing && (
        <g className="missing-indicator">
          <line x1="8" y1="8" x2="32" y2="32" stroke="#8B8B8B" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="8" x2="8" y2="32" stroke="#8B8B8B" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/**
 * Realistic SVG Premolar (Bicuspid)
 * Medium crown with two cusps
 */
function PremolarSVG({ isUpper, condition, selected, conditionColor }: Omit<ToothSVGProps, 'type'>) {
  const isMissing = condition === 'missing';

  return (
    <svg
      viewBox="0 0 32 60"
      className={`tooth-svg ${selected ? 'tooth-selected' : ''} ${isMissing ? 'tooth-missing' : ''}`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'none' }}
    >
      <defs>
        <linearGradient id="premolar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F5F5F0" />
          <stop offset="100%" stopColor="#E8E8E0" />
        </linearGradient>
      </defs>

      {/* Root - single or bifurcated */}
      <g className="tooth-root" opacity={isMissing ? 0.3 : 0.6}>
        <path
          d="M12 32 Q10 45, 8 55 Q10 56, 14 55 Q16 48, 16 38 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
        <path
          d="M20 32 Q22 45, 24 55 Q22 56, 18 55 Q16 48, 16 38 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
      </g>

      {/* Crown */}
      <g className="tooth-crown" filter="url(#tooth-shadow)">
        <path
          d="M4 30 Q2 18, 4 8 Q8 3, 16 3 Q24 3, 28 8 Q30 18, 28 30 Q24 34, 16 34 Q8 34, 4 30 Z"
          fill={isMissing ? '#D0D0D0' : 'url(#premolar-gradient)'}
          stroke={selected ? '#2E37A4' : '#C8C0B8'}
          strokeWidth={selected ? 2 : 1}
        />

        {/* Condition overlay */}
        {!isMissing && condition !== 'healthy' && (
          <path
            d="M6 28 Q4 18, 6 10 Q10 5, 16 5 Q22 5, 26 10 Q28 18, 26 28 Q22 32, 16 32 Q10 32, 6 28 Z"
            fill={conditionColor}
            opacity="0.35"
            className="condition-overlay"
          />
        )}

        {/* Two cusps */}
        <g className="cusps" opacity={isMissing ? 0.3 : 0.5}>
          <ellipse cx="10" cy="15" rx="3" ry="4" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
          <ellipse cx="22" cy="15" rx="3" ry="4" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
          <path d="M10 18 L22 18" fill="none" stroke="#C0B8B0" strokeWidth="0.3" />
        </g>
      </g>

      {isMissing && (
        <g className="missing-indicator">
          <line x1="6" y1="8" x2="26" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="8" x2="6" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/**
 * Realistic SVG Canine
 * Pointed crown, single long root
 */
function CanineSVG({ isUpper, condition, selected, conditionColor }: Omit<ToothSVGProps, 'type'>) {
  const isMissing = condition === 'missing';

  return (
    <svg
      viewBox="0 0 28 65"
      className={`tooth-svg ${selected ? 'tooth-selected' : ''} ${isMissing ? 'tooth-missing' : ''}`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'none' }}
    >
      <defs>
        <linearGradient id="canine-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F5F5F0" />
          <stop offset="100%" stopColor="#E8E8E0" />
        </linearGradient>
      </defs>

      {/* Single long root */}
      <g className="tooth-root" opacity={isMissing ? 0.3 : 0.6}>
        <path
          d="M11 35 Q10 48, 14 62 Q16 62, 18 48 Q17 40, 17 35 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
      </g>

      {/* Crown - pointed */}
      <g className="tooth-crown" filter="url(#tooth-shadow)">
        <path
          d="M4 32 Q2 20, 4 10 Q6 4, 14 2 Q22 4, 24 10 Q26 20, 24 32 Q20 36, 14 36 Q8 36, 4 32 Z"
          fill={isMissing ? '#D0D0D0' : 'url(#canine-gradient)'}
          stroke={selected ? '#2E37A4' : '#C8C0B8'}
          strokeWidth={selected ? 2 : 1}
        />

        {/* Condition overlay */}
        {!isMissing && condition !== 'healthy' && (
          <path
            d="M6 30 Q4 20, 6 12 Q8 6, 14 4 Q20 6, 22 12 Q24 20, 22 30 Q18 34, 14 34 Q10 34, 6 30 Z"
            fill={conditionColor}
            opacity="0.35"
            className="condition-overlay"
          />
        )}

        {/* Single pointed cusp */}
        <g className="cusps" opacity={isMissing ? 0.3 : 0.5}>
          <path d="M8 20 Q14 6, 20 20" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
          <line x1="14" y1="8" x2="14" y2="14" stroke="#C0B8B0" strokeWidth="0.3" />
        </g>
      </g>

      {isMissing && (
        <g className="missing-indicator">
          <line x1="5" y1="8" x2="23" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="23" y1="8" x2="5" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/**
 * Realistic SVG Incisor
 * Flat, shovel-shaped crown
 */
function IncisorSVG({ isUpper, condition, selected, conditionColor }: Omit<ToothSVGProps, 'type'>) {
  const isMissing = condition === 'missing';

  return (
    <svg
      viewBox="0 0 24 60"
      className={`tooth-svg ${selected ? 'tooth-selected' : ''} ${isMissing ? 'tooth-missing' : ''}`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'none' }}
    >
      <defs>
        <linearGradient id="incisor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F8F8F4" />
          <stop offset="100%" stopColor="#ECECEC" />
        </linearGradient>
      </defs>

      {/* Single root */}
      <g className="tooth-root" opacity={isMissing ? 0.3 : 0.6}>
        <path
          d="M9 32 Q8 45, 12 58 Q14 58, 16 45 Q15 38, 15 32 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
      </g>

      {/* Crown - flat, rectangular */}
      <g className="tooth-crown" filter="url(#tooth-shadow)">
        <path
          d="M3 30 Q2 16, 3 6 Q5 3, 12 3 Q19 3, 21 6 Q22 16, 21 30 Q18 34, 12 34 Q6 34, 3 30 Z"
          fill={isMissing ? '#D0D0D0' : 'url(#incisor-gradient)'}
          stroke={selected ? '#2E37A4' : '#C8C0B8'}
          strokeWidth={selected ? 2 : 1}
        />

        {/* Condition overlay */}
        {!isMissing && condition !== 'healthy' && (
          <path
            d="M5 28 Q4 16, 5 8 Q7 5, 12 5 Q17 5, 19 8 Q20 16, 19 28 Q16 32, 12 32 Q8 32, 5 28 Z"
            fill={conditionColor}
            opacity="0.35"
            className="condition-overlay"
          />
        )}

        {/* Incisal edge detail */}
        <g className="cusps" opacity={isMissing ? 0.3 : 0.5}>
          <path d="M5 8 Q12 4, 19 8" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
          <line x1="12" y1="6" x2="12" y2="12" stroke="#C0B8B0" strokeWidth="0.3" opacity="0.5" />
        </g>
      </g>

      {isMissing && (
        <g className="missing-indicator">
          <line x1="4" y1="8" x2="20" y2="28" stroke="#8B8B8B" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="8" x2="4" y2="28" stroke="#8B8B8B" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/**
 * Main Tooth SVG Component - routes to correct tooth type
 */
function ToothSVG(props: ToothSVGProps) {
  switch (props.type) {
    case 'molar':
      return <MolarSVG {...props} />;
    case 'premolar':
      return <PremolarSVG {...props} />;
    case 'canine':
      return <CanineSVG {...props} />;
    case 'incisor':
      return <IncisorSVG {...props} />;
    default:
      return <MolarSVG {...props} />;
  }
}

// ============================================================================
// TOOTH BUTTON COMPONENT
// ============================================================================

interface ToothButtonProps {
  toothNumber: number;
  condition: string;
  selected: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
  tabIndex: number;
  isFirstLoad: boolean;
}

function ToothButton({
  toothNumber,
  condition,
  selected,
  onClick,
  onKeyDown,
  readOnly,
  tabIndex,
  isFirstLoad,
}: ToothButtonProps) {
  const conditionConfig = conditions.find((c) => c.value === condition) || conditions[0];
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);

  return (
    <div className="tooth-container">
      {/* Tooth number label */}
      <div
        className={`tooth-number ${isUpper ? 'tooth-number-upper' : 'tooth-number-lower'}`}
        aria-hidden="true"
      >
        {toothNumber}
      </div>

      {/* Interactive tooth button */}
      <button
        type="button"
        onClick={onClick}
        onKeyDown={onKeyDown}
        disabled={readOnly}
        tabIndex={tabIndex}
        className={`tooth-button ${selected ? 'tooth-button-selected' : ''} ${isFirstLoad ? 'tooth-animate-in' : ''}`}
        style={{
          animationDelay: isFirstLoad ? `${(toothNumber % 10) * 30}ms` : '0ms',
        }}
        aria-label={`Dinte ${toothNumber}, ${getToothTypeName(toothType)}, conditie: ${conditionConfig.label}`}
        aria-pressed={selected}
        data-tooltip={`Dinte ${toothNumber} - ${conditionConfig.label}`}
      >
        <ToothSVG
          type={toothType}
          isUpper={isUpper}
          condition={condition}
          selected={selected}
          conditionColor={conditionConfig.color}
        />

        {/* Hover tooltip */}
        <span className="tooth-tooltip" role="tooltip">
          <strong>#{toothNumber}</strong>
          <span className="tooth-tooltip-type">{getToothTypeName(toothType)}</span>
          <span className={`tooth-tooltip-condition ${conditionConfig.bgClass}`}>{conditionConfig.label}</span>
        </span>
      </button>
    </div>
  );
}

// Helper to get localized tooth type name
function getToothTypeName(type: string): string {
  const names: Record<string, string> = {
    molar: 'Molar',
    premolar: 'Premolar',
    canine: 'Canin',
    incisor: 'Incisiv',
  };
  return names[type] || type;
}

// ============================================================================
// LEGEND COMPONENT
// ============================================================================

function OdontogramLegend() {
  return (
    <div className="odontogram-legend" role="list" aria-label="Legenda conditii dentare">
      {conditions.map((cond) => (
        <div key={cond.value} className="legend-item" role="listitem">
          <span className={`legend-dot ${cond.bgClass}`} style={{ backgroundColor: cond.color }} aria-hidden="true" />
          <span className="legend-label">{cond.label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN ODONTOGRAM EDITOR COMPONENT
// ============================================================================

export function OdontogramEditor({ patientId: _patientId, data = [], onSave, readOnly = false }: OdontogramEditorProps) {
  // State management
  const [teethData, setTeethData] = useState<Map<number, ToothData>>(
    new Map(data.map((tooth) => [tooth.toothNumber, tooth]))
  );
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState('caries');
  const [selectedSurfaces, setSelectedSurfaces] = useState<Surface[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [focusedToothIndex, setFocusedToothIndex] = useState<number>(0);

  // Refs for keyboard navigation
  const toothButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const allTeeth = [...upperTeeth, ...lowerTeeth];

  // Disable first load animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsFirstLoad(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Get condition for a specific tooth
  const getToothCondition = useCallback(
    (toothNumber: number): string => {
      const tooth = teethData.get(toothNumber);
      if (!tooth || tooth.conditions.length === 0) return 'healthy';
      return tooth.conditions[0].condition;
    },
    [teethData]
  );

  // Handle tooth click
  const handleToothClick = useCallback(
    (toothNumber: number) => {
      if (readOnly) return;
      setSelectedTooth(toothNumber);
      const tooth = teethData.get(toothNumber);
      if (tooth && tooth.conditions.length > 0) {
        setSelectedCondition(tooth.conditions[0].condition);
        setSelectedSurfaces(tooth.conditions[0].surfaces as Surface[]);
      } else {
        setSelectedSurfaces([]);
      }
      // Update focused index for keyboard navigation
      const index = allTeeth.indexOf(toothNumber);
      if (index !== -1) setFocusedToothIndex(index);
    },
    [readOnly, teethData, allTeeth]
  );

  // Keyboard navigation handler
  const handleToothKeyDown = useCallback(
    (e: React.KeyboardEvent, toothNumber: number) => {
      const currentIndex = allTeeth.indexOf(toothNumber);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          newIndex = Math.min(currentIndex + 1, allTeeth.length - 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          newIndex = Math.max(currentIndex - 1, 0);
          e.preventDefault();
          break;
        case 'ArrowDown':
          // Move to corresponding tooth in other arch
          if (currentIndex < 16) {
            newIndex = currentIndex + 16;
          }
          e.preventDefault();
          break;
        case 'ArrowUp':
          // Move to corresponding tooth in other arch
          if (currentIndex >= 16) {
            newIndex = currentIndex - 16;
          }
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          handleToothClick(toothNumber);
          e.preventDefault();
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex) {
        setFocusedToothIndex(newIndex);
        const button = toothButtonRefs.current.get(allTeeth[newIndex]);
        button?.focus();
      }
    },
    [allTeeth, handleToothClick]
  );

  // Apply condition to selected tooth
  const handleApplyCondition = useCallback(() => {
    if (!selectedTooth) return;

    const newTeethData = new Map(teethData);
    const existingTooth = newTeethData.get(selectedTooth);

    const newCondition: ToothCondition = {
      condition: selectedCondition,
      surfaces: selectedSurfaces.length > 0 ? selectedSurfaces : [...surfaces],
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
  }, [selectedTooth, selectedCondition, selectedSurfaces, teethData]);

  // Save odontogram data
  const handleSave = useCallback(() => {
    const dataArray = Array.from(teethData.values());
    onSave?.(dataArray);
  }, [teethData, onSave]);

  // Toggle surface selection
  const toggleSurface = useCallback((surface: Surface) => {
    setSelectedSurfaces((prev) => (prev.includes(surface) ? prev.filter((s) => s !== surface) : [...prev, surface]));
  }, []);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setSelectedTooth(null);
    setSelectedSurfaces([]);
  }, []);

  return (
    <div className="odontogram-editor">
      {/* Main Tooth Chart */}
      <div className="odontogram-chart" role="application" aria-label="Odontograma interactiva">
        {/* Upper Arch */}
        <div className="odontogram-arch odontogram-arch-upper">
          <div className="arch-label">Arcada Superioara</div>
          <div className="teeth-row" role="group" aria-label="Arcada superioara - dinti 18 la 28">
            {upperTeeth.map((toothNumber, index) => (
              <ToothButton
                key={toothNumber}
                toothNumber={toothNumber}
                condition={getToothCondition(toothNumber)}
                selected={selectedTooth === toothNumber}
                onClick={() => handleToothClick(toothNumber)}
                onKeyDown={(e) => handleToothKeyDown(e, toothNumber)}
                readOnly={readOnly}
                tabIndex={focusedToothIndex === index ? 0 : -1}
                isFirstLoad={isFirstLoad}
              />
            ))}
          </div>
        </div>

        {/* Midline separator */}
        <div className="arch-separator" aria-hidden="true">
          <div className="separator-line" />
          <div className="separator-labels">
            <span>Stanga</span>
            <span className="separator-icon">
              <i className="ti ti-arrows-left-right" />
            </span>
            <span>Dreapta</span>
          </div>
          <div className="separator-line" />
        </div>

        {/* Lower Arch */}
        <div className="odontogram-arch odontogram-arch-lower">
          <div className="teeth-row" role="group" aria-label="Arcada inferioara - dinti 48 la 38">
            {lowerTeeth.map((toothNumber, index) => (
              <ToothButton
                key={toothNumber}
                toothNumber={toothNumber}
                condition={getToothCondition(toothNumber)}
                selected={selectedTooth === toothNumber}
                onClick={() => handleToothClick(toothNumber)}
                onKeyDown={(e) => handleToothKeyDown(e, toothNumber)}
                readOnly={readOnly}
                tabIndex={focusedToothIndex === index + 16 ? 0 : -1}
                isFirstLoad={isFirstLoad}
              />
            ))}
          </div>
          <div className="arch-label">Arcada Inferioara</div>
        </div>
      </div>

      {/* Single Legend - positioned after teeth */}
      <OdontogramLegend />

      {/* Condition Editor Panel */}
      {!readOnly && selectedTooth && (
        <div className="condition-editor" role="dialog" aria-labelledby="editor-title">
          <div className="editor-header">
            <h5 id="editor-title" className="editor-title">
              <i className="ti ti-dental me-2" aria-hidden="true" />
              Editare Dinte #{selectedTooth}
              <span className="editor-tooth-type">({getToothTypeName(getToothType(selectedTooth))})</span>
            </h5>
          </div>

          {/* Condition Selection */}
          <div className="editor-section">
            <label className="editor-label">Conditie Dentara</label>
            <div className="condition-grid" role="radiogroup" aria-label="Selecteaza conditia">
              {conditions.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
                  onClick={() => setSelectedCondition(cond.value)}
                  className={`condition-option ${selectedCondition === cond.value ? 'condition-option-selected' : ''}`}
                  role="radio"
                  aria-checked={selectedCondition === cond.value}
                >
                  <span className="condition-dot" style={{ backgroundColor: cond.color }} aria-hidden="true" />
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surface Selection */}
          <div className="editor-section">
            <label className="editor-label">Suprafete Afectate (optional)</label>
            <div className="surface-grid" role="group" aria-label="Selecteaza suprafetele">
              {surfaces.map((surface) => (
                <button
                  key={surface}
                  type="button"
                  onClick={() => toggleSurface(surface)}
                  className={`surface-button ${selectedSurfaces.includes(surface) ? 'surface-button-selected' : ''}`}
                  aria-pressed={selectedSurfaces.includes(surface)}
                >
                  {surface}
                </button>
              ))}
            </div>
            <div className="surface-legend">M: Mezial | O: Ocluzal | D: Distal | B: Bucal | L: Lingual</div>
          </div>

          {/* Actions */}
          <div className="editor-actions">
            <button type="button" onClick={handleApplyCondition} className="btn btn-primary">
              <i className="ti ti-check me-1" aria-hidden="true" />
              Aplica Conditia
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-outline-secondary">
              <i className="ti ti-x me-1" aria-hidden="true" />
              Renunta
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      {!readOnly && (
        <div className="odontogram-actions">
          <button type="button" onClick={handleSave} className="btn btn-success btn-lg">
            <i className="ti ti-device-floppy me-2" aria-hidden="true" />
            Salveaza Odontograma
          </button>
        </div>
      )}
    </div>
  );
}

export default OdontogramEditor;
