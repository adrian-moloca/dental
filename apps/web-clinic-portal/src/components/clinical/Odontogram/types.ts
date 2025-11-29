/**
 * Odontogram Types
 *
 * Type definitions for the interactive dental chart components.
 * Aligned with backend API types from clinicalClient.ts
 */

import type {
  ToothSurface,
  ToothConditionType,
  ConditionSeverity,
  RestorationMaterial,
  FurcationClass,
  ToothConditionRecord,
  ToothDataDto,
  OdontogramDto,
  ToothHistoryEntry,
} from '../../../api/clinicalClient';

// Re-export API types for convenience
export type {
  ToothSurface,
  ToothConditionType,
  ConditionSeverity,
  RestorationMaterial,
  FurcationClass,
  ToothConditionRecord,
  ToothDataDto,
  OdontogramDto,
  ToothHistoryEntry,
};

// ============================================================================
// TOOTH NUMBERING
// ============================================================================

/**
 * FDI tooth numbering system constants
 * Quadrant 1: Upper Right (18-11)
 * Quadrant 2: Upper Left (21-28)
 * Quadrant 3: Lower Left (31-38)
 * Quadrant 4: Lower Right (41-48)
 */
export const ADULT_TEETH_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const ADULT_TEETH_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const ALL_ADULT_TEETH = [...ADULT_TEETH_UPPER, ...ADULT_TEETH_LOWER];

/**
 * Primary (deciduous) teeth - FDI numbering
 * Quadrant 5: Upper Right (55-51)
 * Quadrant 6: Upper Left (61-65)
 * Quadrant 7: Lower Left (71-75)
 * Quadrant 8: Lower Right (81-85)
 */
export const PRIMARY_TEETH_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const PRIMARY_TEETH_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];
export const ALL_PRIMARY_TEETH = [...PRIMARY_TEETH_UPPER, ...PRIMARY_TEETH_LOWER];

/**
 * Convert FDI string to number for display
 */
export function fdiToNumber(fdi: string): number {
  return parseInt(fdi, 10);
}

/**
 * Convert number to FDI string for API
 */
export function numberToFdi(num: number): string {
  return num.toString();
}

// ============================================================================
// TOOTH TYPES
// ============================================================================

export type ToothType = 'molar' | 'premolar' | 'canine' | 'incisor';

/**
 * Get tooth type based on FDI position
 */
export function getToothType(toothNumber: number): ToothType {
  const position = toothNumber % 10;
  if (position >= 6) return 'molar';
  if (position >= 4) return 'premolar';
  if (position === 3) return 'canine';
  return 'incisor';
}

/**
 * Check if tooth is in upper arch
 */
export function isUpperTooth(toothNumber: number): boolean {
  const quadrant = Math.floor(toothNumber / 10);
  return quadrant === 1 || quadrant === 2 || quadrant === 5 || quadrant === 6;
}

/**
 * Get tooth type name in Romanian
 */
export function getToothTypeName(type: ToothType): string {
  const names: Record<ToothType, string> = {
    molar: 'Molar',
    premolar: 'Premolar',
    canine: 'Canin',
    incisor: 'Incisiv',
  };
  return names[type];
}

// ============================================================================
// CONDITION CONFIGURATION
// ============================================================================

export interface ConditionConfig {
  value: ToothConditionType;
  label: string;
  labelEn: string;
  color: string;
  bgClass: string;
  icon: string;
  description?: string;
}

/**
 * Dental conditions with colors and labels (Romanian primary)
 * Aligned with ToothConditionType from clinicalClient.ts
 */
export const CONDITION_CONFIG: ConditionConfig[] = [
  {
    value: 'healthy',
    label: 'Sanatos',
    labelEn: 'Healthy',
    color: '#27AE60',
    bgClass: 'condition-healthy',
    icon: 'ti-check',
    description: 'Dinte sanatos fara probleme',
  },
  {
    value: 'caries',
    label: 'Carie',
    labelEn: 'Caries',
    color: '#EF1E1E',
    bgClass: 'condition-caries',
    icon: 'ti-alert-circle',
    description: 'Leziune carioasa activa',
  },
  {
    value: 'filling',
    label: 'Plomba',
    labelEn: 'Filling',
    color: '#2E37A4',
    bgClass: 'condition-filling',
    icon: 'ti-circle-filled',
    description: 'Restaurare directa (obturatie)',
  },
  {
    value: 'crown',
    label: 'Coroana',
    labelEn: 'Crown',
    color: '#800080',
    bgClass: 'condition-crown',
    icon: 'ti-crown',
    description: 'Coroana protetica',
  },
  {
    value: 'root_canal',
    label: 'Tratament de Canal',
    labelEn: 'Root Canal',
    color: '#E2B93B',
    bgClass: 'condition-root-canal',
    icon: 'ti-pin',
    description: 'Tratament endodontic',
  },
  {
    value: 'missing',
    label: 'Lipsa',
    labelEn: 'Missing',
    color: '#6C7688',
    bgClass: 'condition-missing',
    icon: 'ti-x',
    description: 'Dinte absent',
  },
  {
    value: 'implant',
    label: 'Implant',
    labelEn: 'Implant',
    color: '#3538CD',
    bgClass: 'condition-implant',
    icon: 'ti-bolt',
    description: 'Implant dentar',
  },
  {
    value: 'bridge',
    label: 'Punte',
    labelEn: 'Bridge',
    color: '#2F80ED',
    bgClass: 'condition-bridge',
    icon: 'ti-link',
    description: 'Punte dentara',
  },
  {
    value: 'veneer',
    label: 'Fateta',
    labelEn: 'Veneer',
    color: '#9B59B6',
    bgClass: 'condition-veneer',
    icon: 'ti-square-half',
    description: 'Fateta ceramica',
  },
  {
    value: 'onlay_inlay',
    label: 'Inlay/Onlay',
    labelEn: 'Inlay/Onlay',
    color: '#F39C12',
    bgClass: 'condition-inlay',
    icon: 'ti-box',
    description: 'Restaurare inlay sau onlay',
  },
  {
    value: 'sealant',
    label: 'Sigilare',
    labelEn: 'Sealant',
    color: '#1ABC9C',
    bgClass: 'condition-sealant',
    icon: 'ti-shield-check',
    description: 'Sigilare preventiva',
  },
  {
    value: 'extraction',
    label: 'De Extras',
    labelEn: 'To Extract',
    color: '#C0392B',
    bgClass: 'condition-extraction',
    icon: 'ti-trash',
    description: 'Planificat pentru extractie',
  },
  {
    value: 'fractured',
    label: 'Fracturat',
    labelEn: 'Fractured',
    color: '#E74C3C',
    bgClass: 'condition-fractured',
    icon: 'ti-alert-triangle',
    description: 'Dinte fracturat',
  },
  {
    value: 'impacted',
    label: 'Inclus',
    labelEn: 'Impacted',
    color: '#8E44AD',
    bgClass: 'condition-impacted',
    icon: 'ti-arrow-down',
    description: 'Dinte inclus',
  },
  {
    value: 'watch',
    label: 'De urmarit',
    labelEn: 'Watch',
    color: '#F1C40F',
    bgClass: 'condition-watch',
    icon: 'ti-eye',
    description: 'De urmarit in timp',
  },
];

/**
 * Get condition config by value
 */
export function getConditionConfig(conditionValue: ToothConditionType | string): ConditionConfig {
  return CONDITION_CONFIG.find((c) => c.value === conditionValue) || CONDITION_CONFIG[0];
}

/**
 * Get condition label in Romanian
 */
export function getConditionLabel(conditionValue: ToothConditionType | string): string {
  return getConditionConfig(conditionValue).label;
}

/**
 * Get condition color
 */
export function getConditionColor(conditionValue: ToothConditionType | string): string {
  return getConditionConfig(conditionValue).color;
}

// ============================================================================
// SURFACE CONFIGURATION
// ============================================================================

export interface SurfaceConfig {
  value: ToothSurface;
  label: string;
  labelFull: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

/**
 * Tooth surfaces configuration
 */
export const SURFACE_CONFIG: SurfaceConfig[] = [
  { value: 'M', label: 'M', labelFull: 'Mezial', position: 'left' },
  { value: 'O', label: 'O', labelFull: 'Ocluzal', position: 'center' },
  { value: 'D', label: 'D', labelFull: 'Distal', position: 'right' },
  { value: 'B', label: 'B', labelFull: 'Bucal', position: 'top' },
  { value: 'L', label: 'L', labelFull: 'Lingual', position: 'bottom' },
  { value: 'I', label: 'I', labelFull: 'Incisal', position: 'center' },
];

/**
 * All tooth surfaces
 */
export const ALL_SURFACES: ToothSurface[] = ['M', 'O', 'D', 'B', 'L'];

/**
 * Surfaces for anterior teeth (incisors and canines)
 */
export const ANTERIOR_SURFACES: ToothSurface[] = ['M', 'I', 'D', 'B', 'L'];

/**
 * Surfaces for posterior teeth (premolars and molars)
 */
export const POSTERIOR_SURFACES: ToothSurface[] = ['M', 'O', 'D', 'B', 'L'];

/**
 * Get surfaces available for a tooth type
 */
export function getSurfacesForTooth(toothType: ToothType): ToothSurface[] {
  if (toothType === 'incisor' || toothType === 'canine') {
    return ANTERIOR_SURFACES;
  }
  return POSTERIOR_SURFACES;
}

// ============================================================================
// MATERIAL CONFIGURATION
// ============================================================================

export interface MaterialConfig {
  value: RestorationMaterial;
  label: string;
  color?: string;
}

export const MATERIAL_CONFIG: MaterialConfig[] = [
  { value: 'composite', label: 'Compozit', color: '#F5F5F0' },
  { value: 'amalgam', label: 'Amalgam', color: '#A0A0A0' },
  { value: 'ceramic', label: 'Ceramica', color: '#FAFAFA' },
  { value: 'porcelain', label: 'Portelan', color: '#FFFFF0' },
  { value: 'gold', label: 'Aur', color: '#FFD700' },
  { value: 'zirconia', label: 'Zirconiu', color: '#F0F0F0' },
  { value: 'emax', label: 'E.max', color: '#FAFAF8' },
  { value: 'glass_ionomer', label: 'Ionomer de Sticla', color: '#E8E8E0' },
  { value: 'titanium', label: 'Titan', color: '#C0C0C0' },
  { value: 'pfm', label: 'PFM (Metalo-Ceramica)', color: '#F0F0F0' },
  { value: 'temporary', label: 'Temporar', color: '#FFE4C4' },
  { value: 'other', label: 'Altele', color: '#D0D0D0' },
];

// ============================================================================
// SEVERITY CONFIGURATION
// ============================================================================

export interface SeverityConfig {
  value: ConditionSeverity;
  label: string;
  color: string;
}

export const SEVERITY_CONFIG: SeverityConfig[] = [
  { value: 'mild', label: 'Usor', color: '#F1C40F' },
  { value: 'moderate', label: 'Moderat', color: '#E67E22' },
  { value: 'severe', label: 'Sever', color: '#E74C3C' },
];

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Props for ToothSVG component
 */
export interface ToothSVGProps {
  toothNumber: number;
  toothData?: ToothDataDto;
  selected: boolean;
  hovered: boolean;
  onClick?: () => void;
  onSurfaceClick?: (surface: ToothSurface) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  readOnly?: boolean;
  showSurfaces?: boolean;
  selectedSurfaces?: ToothSurface[];
  highlightedSurfaces?: ToothSurface[];
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Props for ToothConditionPalette component
 */
export interface ToothConditionPaletteProps {
  selectedCondition: ToothConditionType;
  onConditionSelect: (condition: ToothConditionType) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
  columns?: number;
}

/**
 * Props for ToothDetailsPanel component
 */
export interface ToothDetailsPanelProps {
  patientId: string;
  toothNumber: number;
  toothData?: ToothDataDto;
  onClose: () => void;
  onAddCondition: (condition: ToothConditionType, surfaces: ToothSurface[], options?: {
    severity?: ConditionSeverity;
    material?: RestorationMaterial;
    notes?: string;
  }) => void;
  onRemoveCondition: (conditionId: string, reason: string) => void;
  onUpdateTooth: (updates: {
    isPresent?: boolean;
    mobility?: number;
    furcation?: FurcationClass;
    notes?: string;
  }) => void;
  readOnly?: boolean;
}

/**
 * Props for main OdontogramEditor component
 */
export interface OdontogramEditorProps {
  patientId: string;
  readOnly?: boolean;
  showPediatric?: boolean;
  onToothSelect?: (toothNumber: number | null) => void;
  onSave?: () => void;
  className?: string;
}

// ============================================================================
// LOCAL STATE TYPES
// ============================================================================

/**
 * Undo/Redo action for odontogram
 */
export interface OdontogramAction {
  type: 'add_condition' | 'remove_condition' | 'update_tooth' | 'bulk_update';
  toothNumber: string;
  previousState: ToothDataDto | null;
  newState: ToothDataDto | null;
  timestamp: Date;
}

/**
 * Local editing state for odontogram editor
 */
export interface OdontogramEditorState {
  selectedTooth: number | null;
  selectedCondition: ToothConditionType;
  selectedSurfaces: ToothSurface[];
  selectedSeverity?: ConditionSeverity;
  selectedMaterial?: RestorationMaterial;
  hoveredTooth: number | null;
  isQuickMode: boolean;
  quickModeSelection: number[];
  showPediatric: boolean;
  undoStack: OdontogramAction[];
  redoStack: OdontogramAction[];
}
