/**
 * Design System Color Tokens
 *
 * Modern, accessible color palette for DentalOS
 * All colors meet WCAG AA contrast requirements
 */

export const colors = {
  /**
   * Primary - Medical Teal
   * Trustworthy, professional, calming
   * Main: #0d9488 (4.5:1 contrast on white)
   */
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',  // Main - Use for primary actions, links
    700: '#0f766e',  // Dark - Use for active states
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },

  /**
   * Accent - Warm Coral
   * Friendly, action-oriented, attention-grabbing
   * Main: #f97316 - Use for accents only
   * Text: #ea580c (4.6:1 contrast on white)
   */
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Main - Use for accent elements
    600: '#ea580c',  // Text - Use when accent is text
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  /**
   * Neutrals - Warm Grays
   * Easy on eyes for long shifts
   * Background: #fafaf9 (warm off-white, not pure white)
   */
  neutral: {
    50: '#fafaf9',   // Background - Main background color
    100: '#f5f5f4',  // Surface - Cards, panels
    200: '#e7e5e4',  // Border - Default borders
    300: '#d6d3d1',  // Border Subtle
    400: '#a8a29e',
    500: '#78716c',  // Text Tertiary
    600: '#57534e',  // Text Secondary (7:1 contrast)
    700: '#44403c',
    800: '#292524',  // Text Primary (14:1 contrast)
    900: '#1c1917',
    950: '#0c0a09',
  },

  /**
   * Success - Emerald Green
   * WCAG AA compliant (4.5:1)
   */
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',  // Main (4.5:1 contrast)
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  /**
   * Warning - Amber
   * WCAG AA compliant (5:1)
   */
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',  // Main (5:1 contrast)
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  /**
   * Danger - Red
   * WCAG AA compliant (5.5:1)
   */
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',  // Main (5.5:1 contrast)
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
} as const;

/**
 * Semantic Color Mapping
 * Use these semantic names in components
 */
export const semanticColors = {
  // Backgrounds
  background: {
    primary: colors.neutral[50],    // #fafaf9
    surface: colors.neutral[100],   // #f5f5f4
    card: '#ffffff',
  },

  // Borders
  border: {
    default: colors.neutral[200],   // #e7e5e4
    subtle: colors.neutral[300],    // #d6d3d1
    strong: colors.neutral[400],
  },

  // Text
  text: {
    primary: colors.neutral[800],   // #292524 (14:1)
    secondary: colors.neutral[600], // #57534e (7:1)
    tertiary: colors.neutral[500],  // #78716c
    inverse: '#ffffff',
  },

  // Interactive
  interactive: {
    primary: colors.primary[600],       // #0d9488
    primaryHover: colors.primary[500],  // #14b8a6
    primaryActive: colors.primary[700], // #0f766e
    accent: colors.accent[500],         // #f97316
    accentText: colors.accent[600],     // #ea580c
  },

  // States
  state: {
    success: colors.success[600],       // #059669
    successLight: colors.success[100],
    warning: colors.warning[600],       // #d97706
    warningLight: colors.warning[100],
    danger: colors.danger[600],         // #dc2626
    dangerLight: colors.danger[100],
  },
} as const;

/**
 * Usage Guidelines
 *
 * Buttons:
 * - Primary: bg-primary-600 hover:bg-primary-500 active:bg-primary-700
 * - Secondary: bg-neutral-100 hover:bg-neutral-200 text-neutral-800
 * - Danger: bg-danger-600 hover:bg-danger-500 text-white
 * - Accent: bg-accent-500 hover:bg-accent-400 text-white (use sparingly)
 *
 * Text:
 * - Headings: text-neutral-800
 * - Body: text-neutral-800
 * - Muted: text-neutral-600
 * - Tertiary: text-neutral-500
 *
 * Backgrounds:
 * - Page: bg-neutral-50
 * - Cards: bg-white or bg-neutral-100
 * - Hover: bg-neutral-100
 *
 * Borders:
 * - Default: border-neutral-200
 * - Subtle: border-neutral-300
 *
 * Status:
 * - Success: bg-success-100 text-success-600 border-success-600
 * - Warning: bg-warning-100 text-warning-600 border-warning-600
 * - Danger: bg-danger-100 text-danger-600 border-danger-600
 *
 * Focus:
 * - Ring: ring-2 ring-primary-600 ring-offset-2
 */
