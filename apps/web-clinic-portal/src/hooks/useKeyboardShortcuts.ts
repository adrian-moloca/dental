/**
 * Global Keyboard Shortcuts Hook
 *
 * Handles all keyboard shortcuts across the application.
 * Provides a centralized way to manage keyboard interactions.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette: () => void;
  onOpenShortcutsOverlay: () => void;
  onToggleTheme: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const navigate = useNavigate();
  const sequenceBuffer = useRef<string[]>([]);
  const sequenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSequence = useCallback(() => {
    sequenceBuffer.current = [];
    if (sequenceTimer.current) {
      clearTimeout(sequenceTimer.current);
      sequenceTimer.current = null;
    }
  }, []);

  const addToSequence = useCallback(
    (key: string) => {
      sequenceBuffer.current.push(key);

      // Clear existing timer
      if (sequenceTimer.current) {
        clearTimeout(sequenceTimer.current);
      }

      // Set new timer to reset sequence after 1 second
      sequenceTimer.current = window.setTimeout(() => {
        resetSequence();
      }, 1000);
    },
    [resetSequence],
  );

  const checkSequence = useCallback(
    (sequence: string[]) => {
      const buffer = sequenceBuffer.current;
      if (buffer.length < sequence.length) return false;

      const lastKeys = buffer.slice(-sequence.length);
      return sequence.every((key, index) => lastKeys[index].toLowerCase() === key.toLowerCase());
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Still allow Ctrl+K/Cmd+K in input fields
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          options.onOpenCommandPalette();
          return;
        }
        return;
      }

      // Command Palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        options.onOpenCommandPalette();
        return;
      }

      // Shortcuts Overlay: ?
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        options.onOpenShortcutsOverlay();
        return;
      }

      // Toggle Theme: T
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        options.onToggleTheme();
        return;
      }

      // Build up sequences
      addToSequence(e.key);

      // Navigation shortcuts (G + key)
      if (checkSequence(['g', 'p'])) {
        e.preventDefault();
        navigate('/patients');
        resetSequence();
        return;
      }

      if (checkSequence(['g', 'a'])) {
        e.preventDefault();
        navigate('/appointments');
        resetSequence();
        return;
      }

      if (checkSequence(['g', 'b'])) {
        e.preventDefault();
        navigate('/billing');
        resetSequence();
        return;
      }

      if (checkSequence(['g', 'i'])) {
        e.preventDefault();
        navigate('/inventory');
        resetSequence();
        return;
      }

      if (checkSequence(['g', 'r'])) {
        e.preventDefault();
        navigate('/reports');
        resetSequence();
        return;
      }

      if (checkSequence(['g', 's'])) {
        e.preventDefault();
        navigate('/settings');
        resetSequence();
        return;
      }

      if (checkSequence(['g', 'd'])) {
        e.preventDefault();
        navigate('/dashboard');
        resetSequence();
        return;
      }

      // Action shortcuts (N + key)
      if (checkSequence(['n', 'p'])) {
        e.preventDefault();
        navigate('/patients/new');
        resetSequence();
        return;
      }

      if (checkSequence(['n', 'a'])) {
        e.preventDefault();
        navigate('/appointments/create');
        resetSequence();
        return;
      }

      if (checkSequence(['n', 'i'])) {
        e.preventDefault();
        navigate('/billing/invoices/new');
        resetSequence();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimer.current) {
        clearTimeout(sequenceTimer.current);
      }
    };
  }, [
    navigate,
    addToSequence,
    checkSequence,
    resetSequence,
    options,
  ]);
}
