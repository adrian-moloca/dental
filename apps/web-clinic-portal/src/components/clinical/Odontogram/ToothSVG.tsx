/**
 * ToothSVG Component
 *
 * Interactive SVG tooth visualization with:
 * - Realistic tooth shapes (molar, premolar, canine, incisor)
 * - Surface-level condition marking and selection
 * - Hover effects and tooltips
 * - Accessibility support
 */

import { memo, useMemo } from 'react';
import type {
  ToothSVGProps,
  ToothSurface,
  ToothType,
  ToothConditionRecord,
} from './types';
import {
  getToothType,
  isUpperTooth,
  getToothTypeName,
  getConditionConfig,
  getConditionColor,
  getSurfacesForTooth,
} from './types';

// ============================================================================
// SURFACE PATH DEFINITIONS
// ============================================================================

/**
 * SVG paths for tooth surfaces - used for interactive surface selection
 * These define clickable regions on the tooth crown
 */
interface SurfacePaths {
  M: string; // Mesial
  O: string; // Occlusal/Incisal
  D: string; // Distal
  B: string; // Buccal
  L: string; // Lingual
  I?: string; // Incisal (optional, for anterior teeth)
}

// Surface paths for molar (viewBox 0 0 40 40)
const MOLAR_SURFACE_PATHS: SurfacePaths = {
  M: 'M4,8 L12,12 L12,28 L4,32 Z',      // Left side
  D: 'M36,8 L28,12 L28,28 L36,32 Z',    // Right side
  B: 'M4,8 L12,12 L28,12 L36,8 L28,4 L12,4 Z',   // Top (buccal)
  L: 'M4,32 L12,28 L28,28 L36,32 L28,36 L12,36 Z', // Bottom (lingual)
  O: 'M12,12 L28,12 L28,28 L12,28 Z',   // Center (occlusal)
};

// Surface paths for premolar (viewBox 0 0 32 40)
const PREMOLAR_SURFACE_PATHS: SurfacePaths = {
  M: 'M4,8 L10,12 L10,28 L4,32 Z',
  D: 'M28,8 L22,12 L22,28 L28,32 Z',
  B: 'M4,8 L10,12 L22,12 L28,8 L22,4 L10,4 Z',
  L: 'M4,32 L10,28 L22,28 L28,32 L22,36 L10,36 Z',
  O: 'M10,12 L22,12 L22,28 L10,28 Z',
};

// Surface paths for canine (viewBox 0 0 28 40)
const CANINE_SURFACE_PATHS: SurfacePaths = {
  M: 'M4,8 L10,14 L10,28 L4,32 Z',
  D: 'M24,8 L18,14 L18,28 L24,32 Z',
  B: 'M4,8 L10,14 L18,14 L24,8 L14,2 Z',
  L: 'M4,32 L10,28 L18,28 L24,32 L18,36 L10,36 Z',
  O: 'M10,14 L18,14 L18,28 L10,28 Z', // Incisal edge area
};

// Surface paths for incisor (viewBox 0 0 24 40)
const INCISOR_SURFACE_PATHS: SurfacePaths = {
  M: 'M3,8 L8,12 L8,28 L3,32 Z',
  D: 'M21,8 L16,12 L16,28 L21,32 Z',
  B: 'M3,8 L8,12 L16,12 L21,8 L16,4 L8,4 Z',
  L: 'M3,32 L8,28 L16,28 L21,32 L16,36 L8,36 Z',
  O: 'M8,12 L16,12 L16,28 L8,28 Z', // Incisal edge
};

function getSurfacePaths(toothType: ToothType): SurfacePaths {
  switch (toothType) {
    case 'molar':
      return MOLAR_SURFACE_PATHS;
    case 'premolar':
      return PREMOLAR_SURFACE_PATHS;
    case 'canine':
      return CANINE_SURFACE_PATHS;
    case 'incisor':
      return INCISOR_SURFACE_PATHS;
    default:
      return MOLAR_SURFACE_PATHS;
  }
}

// ============================================================================
// SVG TOOTH SHAPES
// ============================================================================

interface ToothShapeProps {
  isUpper: boolean;
  isMissing: boolean;
  selected: boolean;
  conditions: ToothConditionRecord[];
  surfaceColors: Map<ToothSurface, string>;
}

/**
 * Molar SVG Shape
 */
function MolarShape({ isUpper, isMissing, selected, surfaceColors }: ToothShapeProps) {
  const transform = isUpper ? 'rotate(180 20 30)' : '';

  return (
    <g transform={transform}>
      {/* Root structure */}
      <g className="tooth-root" opacity={isMissing ? 0.3 : 0.6}>
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

      {/* Crown base */}
      <path
        d="M4 32 Q2 20, 4 10 Q8 4, 20 4 Q32 4, 36 10 Q38 20, 36 32 Q32 36, 20 36 Q8 36, 4 32 Z"
        fill={isMissing ? '#D0D0D0' : '#F5F5F0'}
        stroke={selected ? '#2E37A4' : '#C8C0B8'}
        strokeWidth={selected ? 2 : 1}
      />

      {/* Surface overlays with conditions */}
      {!isMissing && (
        <g className="surface-overlays">
          {/* Buccal surface */}
          <path
            d="M6 12 Q8 6, 20 6 Q32 6, 34 12 L28 16 L12 16 Z"
            fill={surfaceColors.get('B') || 'transparent'}
            opacity={surfaceColors.get('B') ? 0.5 : 0}
          />
          {/* Lingual surface */}
          <path
            d="M6 28 L12 24 L28 24 L34 28 Q32 34, 20 34 Q8 34, 6 28 Z"
            fill={surfaceColors.get('L') || 'transparent'}
            opacity={surfaceColors.get('L') ? 0.5 : 0}
          />
          {/* Mesial surface */}
          <path
            d="M6 12 L12 16 L12 24 L6 28 Q4 20, 6 12 Z"
            fill={surfaceColors.get('M') || 'transparent'}
            opacity={surfaceColors.get('M') ? 0.5 : 0}
          />
          {/* Distal surface */}
          <path
            d="M34 12 L28 16 L28 24 L34 28 Q36 20, 34 12 Z"
            fill={surfaceColors.get('D') || 'transparent'}
            opacity={surfaceColors.get('D') ? 0.5 : 0}
          />
          {/* Occlusal surface */}
          <path
            d="M12 16 L28 16 L28 24 L12 24 Z"
            fill={surfaceColors.get('O') || 'transparent'}
            opacity={surfaceColors.get('O') ? 0.5 : 0}
          />
        </g>
      )}

      {/* Occlusal details */}
      <g className="cusps" opacity={isMissing ? 0.3 : 0.4}>
        <ellipse cx="12" cy="16" rx="4" ry="3" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
        <ellipse cx="28" cy="16" rx="4" ry="3" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
        <ellipse cx="20" cy="22" rx="5" ry="4" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
        <path d="M10 18 Q20 24, 30 18" fill="none" stroke="#C0B8B0" strokeWidth="0.3" />
      </g>

      {/* Missing tooth X */}
      {isMissing && (
        <g className="missing-indicator">
          <line x1="8" y1="8" x2="32" y2="32" stroke="#8B8B8B" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="8" x2="8" y2="32" stroke="#8B8B8B" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/**
 * Premolar SVG Shape
 */
function PremolarShape({ isUpper, isMissing, selected, surfaceColors }: ToothShapeProps) {
  const transform = isUpper ? 'rotate(180 16 30)' : '';

  return (
    <g transform={transform}>
      {/* Root */}
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
      <path
        d="M4 30 Q2 18, 4 8 Q8 3, 16 3 Q24 3, 28 8 Q30 18, 28 30 Q24 34, 16 34 Q8 34, 4 30 Z"
        fill={isMissing ? '#D0D0D0' : '#F5F5F0'}
        stroke={selected ? '#2E37A4' : '#C8C0B8'}
        strokeWidth={selected ? 2 : 1}
      />

      {/* Surface overlays */}
      {!isMissing && (
        <g className="surface-overlays">
          <path
            d="M6 10 Q8 5, 16 5 Q24 5, 26 10 L22 14 L10 14 Z"
            fill={surfaceColors.get('B') || 'transparent'}
            opacity={surfaceColors.get('B') ? 0.5 : 0}
          />
          <path
            d="M6 26 L10 22 L22 22 L26 26 Q24 32, 16 32 Q8 32, 6 26 Z"
            fill={surfaceColors.get('L') || 'transparent'}
            opacity={surfaceColors.get('L') ? 0.5 : 0}
          />
          <path
            d="M6 10 L10 14 L10 22 L6 26 Q4 18, 6 10 Z"
            fill={surfaceColors.get('M') || 'transparent'}
            opacity={surfaceColors.get('M') ? 0.5 : 0}
          />
          <path
            d="M26 10 L22 14 L22 22 L26 26 Q28 18, 26 10 Z"
            fill={surfaceColors.get('D') || 'transparent'}
            opacity={surfaceColors.get('D') ? 0.5 : 0}
          />
          <path
            d="M10 14 L22 14 L22 22 L10 22 Z"
            fill={surfaceColors.get('O') || 'transparent'}
            opacity={surfaceColors.get('O') ? 0.5 : 0}
          />
        </g>
      )}

      {/* Cusps */}
      <g className="cusps" opacity={isMissing ? 0.3 : 0.4}>
        <ellipse cx="10" cy="15" rx="3" ry="4" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
        <ellipse cx="22" cy="15" rx="3" ry="4" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
        <path d="M10 18 L22 18" fill="none" stroke="#C0B8B0" strokeWidth="0.3" />
      </g>

      {isMissing && (
        <g className="missing-indicator">
          <line x1="6" y1="8" x2="26" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="8" x2="6" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/**
 * Canine SVG Shape
 */
function CanineShape({ isUpper, isMissing, selected, surfaceColors }: ToothShapeProps) {
  const transform = isUpper ? 'rotate(180 14 32)' : '';

  return (
    <g transform={transform}>
      {/* Root */}
      <g className="tooth-root" opacity={isMissing ? 0.3 : 0.6}>
        <path
          d="M11 35 Q10 48, 14 62 Q16 62, 18 48 Q17 40, 17 35 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
      </g>

      {/* Crown */}
      <path
        d="M4 32 Q2 20, 4 10 Q6 4, 14 2 Q22 4, 24 10 Q26 20, 24 32 Q20 36, 14 36 Q8 36, 4 32 Z"
        fill={isMissing ? '#D0D0D0' : '#F5F5F0'}
        stroke={selected ? '#2E37A4' : '#C8C0B8'}
        strokeWidth={selected ? 2 : 1}
      />

      {/* Surface overlays */}
      {!isMissing && (
        <g className="surface-overlays">
          <path
            d="M6 12 Q8 6, 14 4 Q20 6, 22 12 L18 16 L10 16 Z"
            fill={surfaceColors.get('B') || 'transparent'}
            opacity={surfaceColors.get('B') ? 0.5 : 0}
          />
          <path
            d="M6 28 L10 24 L18 24 L22 28 Q20 34, 14 34 Q8 34, 6 28 Z"
            fill={surfaceColors.get('L') || 'transparent'}
            opacity={surfaceColors.get('L') ? 0.5 : 0}
          />
          <path
            d="M6 12 L10 16 L10 24 L6 28 Q4 20, 6 12 Z"
            fill={surfaceColors.get('M') || 'transparent'}
            opacity={surfaceColors.get('M') ? 0.5 : 0}
          />
          <path
            d="M22 12 L18 16 L18 24 L22 28 Q24 20, 22 12 Z"
            fill={surfaceColors.get('D') || 'transparent'}
            opacity={surfaceColors.get('D') ? 0.5 : 0}
          />
          <path
            d="M10 16 L18 16 L18 24 L10 24 Z"
            fill={surfaceColors.get('I') || surfaceColors.get('O') || 'transparent'}
            opacity={surfaceColors.get('I') || surfaceColors.get('O') ? 0.5 : 0}
          />
        </g>
      )}

      {/* Cusp */}
      <g className="cusps" opacity={isMissing ? 0.3 : 0.4}>
        <path d="M8 20 Q14 6, 20 20" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
        <line x1="14" y1="8" x2="14" y2="14" stroke="#C0B8B0" strokeWidth="0.3" />
      </g>

      {isMissing && (
        <g className="missing-indicator">
          <line x1="5" y1="8" x2="23" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="23" y1="8" x2="5" y2="30" stroke="#8B8B8B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/**
 * Incisor SVG Shape
 */
function IncisorShape({ isUpper, isMissing, selected, surfaceColors }: ToothShapeProps) {
  const transform = isUpper ? 'rotate(180 12 30)' : '';

  return (
    <g transform={transform}>
      {/* Root */}
      <g className="tooth-root" opacity={isMissing ? 0.3 : 0.6}>
        <path
          d="M9 32 Q8 45, 12 58 Q14 58, 16 45 Q15 38, 15 32 Z"
          fill="#E8E0D8"
          stroke="#D0C8C0"
          strokeWidth="0.5"
        />
      </g>

      {/* Crown */}
      <path
        d="M3 30 Q2 16, 3 6 Q5 3, 12 3 Q19 3, 21 6 Q22 16, 21 30 Q18 34, 12 34 Q6 34, 3 30 Z"
        fill={isMissing ? '#D0D0D0' : '#F5F5F0'}
        stroke={selected ? '#2E37A4' : '#C8C0B8'}
        strokeWidth={selected ? 2 : 1}
      />

      {/* Surface overlays */}
      {!isMissing && (
        <g className="surface-overlays">
          <path
            d="M5 8 Q7 5, 12 5 Q17 5, 19 8 L16 12 L8 12 Z"
            fill={surfaceColors.get('B') || 'transparent'}
            opacity={surfaceColors.get('B') ? 0.5 : 0}
          />
          <path
            d="M5 28 L8 24 L16 24 L19 28 Q17 32, 12 32 Q7 32, 5 28 Z"
            fill={surfaceColors.get('L') || 'transparent'}
            opacity={surfaceColors.get('L') ? 0.5 : 0}
          />
          <path
            d="M5 8 L8 12 L8 24 L5 28 Q3 18, 5 8 Z"
            fill={surfaceColors.get('M') || 'transparent'}
            opacity={surfaceColors.get('M') ? 0.5 : 0}
          />
          <path
            d="M19 8 L16 12 L16 24 L19 28 Q21 18, 19 8 Z"
            fill={surfaceColors.get('D') || 'transparent'}
            opacity={surfaceColors.get('D') ? 0.5 : 0}
          />
          <path
            d="M8 12 L16 12 L16 24 L8 24 Z"
            fill={surfaceColors.get('I') || surfaceColors.get('O') || 'transparent'}
            opacity={surfaceColors.get('I') || surfaceColors.get('O') ? 0.5 : 0}
          />
        </g>
      )}

      {/* Incisal edge */}
      <g className="cusps" opacity={isMissing ? 0.3 : 0.4}>
        <path d="M5 8 Q12 4, 19 8" fill="none" stroke="#B8B0A8" strokeWidth="0.5" />
        <line x1="12" y1="6" x2="12" y2="12" stroke="#C0B8B0" strokeWidth="0.3" opacity="0.5" />
      </g>

      {isMissing && (
        <g className="missing-indicator">
          <line x1="4" y1="8" x2="20" y2="28" stroke="#8B8B8B" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="8" x2="4" y2="28" stroke="#8B8B8B" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

// ============================================================================
// INTERACTIVE SURFACE OVERLAY
// ============================================================================

interface SurfaceOverlayProps {
  toothType: ToothType;
  surfaces: ToothSurface[];
  selectedSurfaces: ToothSurface[];
  highlightedSurfaces: ToothSurface[];
  onSurfaceClick?: (surface: ToothSurface) => void;
  disabled?: boolean;
}

function SurfaceOverlay({
  toothType,
  surfaces,
  selectedSurfaces,
  highlightedSurfaces,
  onSurfaceClick,
  disabled,
}: SurfaceOverlayProps) {
  const surfacePaths = getSurfacePaths(toothType);

  return (
    <g className="surface-overlay-interactive">
      {surfaces.map((surface) => {
        // Safely access the path, handling 'I' surface which may map to 'O' for canines/incisors
        const path = surfacePaths[surface as keyof SurfacePaths] ||
          (surface === 'I' ? surfacePaths.O : undefined);
        if (!path) return null;

        const isSelected = selectedSurfaces.includes(surface);
        const isHighlighted = highlightedSurfaces.includes(surface);

        return (
          <path
            key={surface}
            d={path}
            fill={isSelected ? '#2E37A4' : isHighlighted ? '#F39C12' : 'transparent'}
            fillOpacity={isSelected ? 0.4 : isHighlighted ? 0.3 : 0}
            stroke={isSelected ? '#2E37A4' : isHighlighted ? '#F39C12' : 'transparent'}
            strokeWidth={isSelected || isHighlighted ? 1.5 : 0}
            style={{ cursor: disabled ? 'default' : 'pointer' }}
            onClick={(e) => {
              if (!disabled && onSurfaceClick) {
                e.stopPropagation();
                onSurfaceClick(surface);
              }
            }}
            className="surface-clickable"
          />
        );
      })}
    </g>
  );
}

// ============================================================================
// MAIN TOOTHSVG COMPONENT
// ============================================================================

/**
 * ToothSVG - Interactive SVG tooth component
 */
export const ToothSVG = memo(function ToothSVG({
  toothNumber,
  toothData,
  selected,
  hovered,
  onClick,
  onSurfaceClick,
  onMouseEnter,
  onMouseLeave,
  readOnly = false,
  showSurfaces = false,
  selectedSurfaces = [],
  highlightedSurfaces = [],
  size = 'md',
}: ToothSVGProps) {
  const toothType = getToothType(toothNumber);
  const isUpper = isUpperTooth(toothNumber);

  // Determine size dimensions
  const sizeConfig = {
    sm: { width: 28, height: 48 },
    md: { width: 36, height: 60 },
    lg: { width: 44, height: 72 },
  };
  const { width, height } = sizeConfig[size];

  // Get viewBox based on tooth type
  const viewBoxConfig = {
    molar: '0 0 40 60',
    premolar: '0 0 32 60',
    canine: '0 0 28 65',
    incisor: '0 0 24 60',
  };
  const viewBox = viewBoxConfig[toothType];

  // Determine if tooth is missing or absent
  const isMissing = toothData?.isPresent === false ||
    (toothData?.conditions?.some(c => c.condition === 'missing' && !c.deletedAt) ?? false);

  // Build surface color map from conditions
  const surfaceColors = useMemo(() => {
    const colorMap = new Map<ToothSurface, string>();
    if (!toothData?.conditions) return colorMap;

    // Process conditions in reverse order so older conditions show first
    const activeConditions = toothData.conditions
      .filter(c => !c.deletedAt && c.condition !== 'healthy')
      .reverse();

    for (const condition of activeConditions) {
      const color = getConditionColor(condition.condition);
      for (const surface of condition.surfaces || []) {
        if (!colorMap.has(surface as ToothSurface)) {
          colorMap.set(surface as ToothSurface, color);
        }
      }
    }

    return colorMap;
  }, [toothData?.conditions]);

  // Get primary condition for display
  const primaryCondition = useMemo(() => {
    if (!toothData?.conditions?.length) return 'healthy';
    const active = toothData.conditions.find(c => !c.deletedAt);
    return active?.condition || 'healthy';
  }, [toothData?.conditions]);

  const conditionConfig = getConditionConfig(primaryCondition);
  const toothTypeName = getToothTypeName(toothType);
  const surfaces = getSurfacesForTooth(toothType);

  // Common shape props
  const shapeProps: ToothShapeProps = {
    isUpper,
    isMissing,
    selected,
    conditions: toothData?.conditions || [],
    surfaceColors,
  };

  // Render the appropriate tooth shape
  const renderToothShape = () => {
    switch (toothType) {
      case 'molar':
        return <MolarShape {...shapeProps} />;
      case 'premolar':
        return <PremolarShape {...shapeProps} />;
      case 'canine':
        return <CanineShape {...shapeProps} />;
      case 'incisor':
        return <IncisorShape {...shapeProps} />;
      default:
        return <MolarShape {...shapeProps} />;
    }
  };

  return (
    <div
      className={`tooth-svg-container ${selected ? 'tooth-selected' : ''} ${hovered ? 'tooth-hovered' : ''}`}
      style={{ width, height }}
    >
      <svg
        viewBox={viewBox}
        width={width}
        height={height}
        className="tooth-svg"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={readOnly ? -1 : 0}
        aria-label={`Dinte ${toothNumber}, ${toothTypeName}, ${conditionConfig.label}`}
        aria-pressed={selected}
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
      >
        <defs>
          <linearGradient id={`tooth-gradient-${toothNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F5F5F0" />
            <stop offset="100%" stopColor="#E8E8E0" />
          </linearGradient>
          <filter id={`tooth-shadow-${toothNumber}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.15" />
          </filter>
        </defs>

        <g filter={`url(#tooth-shadow-${toothNumber})`}>
          {renderToothShape()}
        </g>

        {/* Interactive surface overlay */}
        {showSurfaces && !isMissing && (
          <SurfaceOverlay
            toothType={toothType}
            surfaces={surfaces}
            selectedSurfaces={selectedSurfaces}
            highlightedSurfaces={highlightedSurfaces}
            onSurfaceClick={onSurfaceClick}
            disabled={readOnly}
          />
        )}
      </svg>

      {/* Tooth number label */}
      <div className={`tooth-number ${isUpper ? 'tooth-number-upper' : 'tooth-number-lower'}`}>
        {toothNumber}
      </div>
    </div>
  );
});

export default ToothSVG;
