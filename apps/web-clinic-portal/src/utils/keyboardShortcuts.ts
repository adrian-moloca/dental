/**
 * Keyboard Shortcuts Utility
 *
 * Provides a centralized way to manage keyboard shortcuts across the application.
 * Usage: import { useKeyboardShortcut } from '../utils/keyboardShortcuts';
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Command key on Mac
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook to register a keyboard shortcut
 * @param shortcuts - Array of shortcut configurations
 * @param enabled - Whether the shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape key even in inputs
        if (e.key !== 'Escape') {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Hook for a single keyboard shortcut (convenience wrapper)
 */
export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  },
  enabled: boolean = true
) {
  useKeyboardShortcuts(
    [
      {
        key,
        ...modifiers,
        handler,
      },
    ],
    enabled
  );
}

/**
 * Common keyboard shortcuts catalog for DentalOS
 */
export const SHORTCUTS = {
  // Navigation
  DASHBOARD: { key: 'd', ctrl: true, description: 'Go to Dashboard' },
  PATIENTS: { key: 'p', ctrl: true, description: 'Go to Patients' },
  APPOINTMENTS: { key: 'a', ctrl: true, description: 'Go to Appointments' },

  // Actions
  NEW_PATIENT: { key: 'n', ctrl: true, alt: true, description: 'New Patient' },
  NEW_APPOINTMENT: { key: 'n', ctrl: true, shift: true, description: 'New Appointment' },
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  CANCEL: { key: 'Escape', description: 'Cancel / Close' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },

  // Workflow
  CHECK_IN: { key: 'c', ctrl: true, shift: true, description: 'Check-in Patient' },
  START_TREATMENT: { key: 't', ctrl: true, shift: true, description: 'Start Treatment' },

  // Help
  HELP: { key: '?', shift: true, description: 'Show Keyboard Shortcuts' },
};

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: Partial<KeyboardShortcut>): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.key) parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}
