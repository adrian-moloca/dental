/**
 * Keyboard Shortcuts Overlay - Press ? to show all available shortcuts
 *
 * Game-changer feature that competitors don't have.
 * Improves productivity by allowing power users to navigate the app with keyboard.
 */

import { useEffect } from 'react';
import { Icon } from '../ui/Icon';
import clsx from 'clsx';

export interface Shortcut {
  key: string;
  description: string;
  category: 'Navigation' | 'Actions' | 'System' | 'Search';
}

const shortcuts: Shortcut[] = [
  // Navigation
  { key: 'G then P', description: 'Go to Patients', category: 'Navigation' },
  { key: 'G then A', description: 'Go to Appointments', category: 'Navigation' },
  { key: 'G then B', description: 'Go to Billing', category: 'Navigation' },
  { key: 'G then I', description: 'Go to Inventory', category: 'Navigation' },
  { key: 'G then R', description: 'Go to Reports', category: 'Navigation' },
  { key: 'G then S', description: 'Go to Settings', category: 'Navigation' },
  { key: 'G then D', description: 'Go to Dashboard', category: 'Navigation' },

  // Actions
  { key: 'N then P', description: 'New Patient', category: 'Actions' },
  { key: 'N then A', description: 'New Appointment', category: 'Actions' },
  { key: 'N then I', description: 'New Invoice', category: 'Actions' },

  // Search
  { key: 'Ctrl+K or Cmd+K', description: 'Open Command Palette', category: 'Search' },
  { key: '/', description: 'Focus Search', category: 'Search' },

  // System
  { key: 'T', description: 'Toggle Theme', category: 'System' },
  { key: '?', description: 'Show Keyboard Shortcuts', category: 'System' },
  { key: 'Esc', description: 'Close Dialog/Modal', category: 'System' },
];

interface KeyboardShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({ open, onClose }: KeyboardShortcutsOverlayProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/90 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden={true}
      />

      {/* Overlay */}
      <div
        className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-surface-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                  <Icon name="command" className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                  <h2 id="shortcuts-title" className="text-lg font-semibold text-foreground">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-xs text-muted">Master DentalOS like a pro</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-surface-hover border border-border flex items-center justify-center transition-colors"
                aria-label="Close shortcuts overlay"
              >
                <Icon name="x" className="w-5 h-5 text-muted" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover transition-colors"
                      >
                        <span className="text-sm text-foreground">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.key.split(' ').map((k, i) => (
                            <kbd
                              key={i}
                              className={clsx(
                                'px-2 py-1 text-xs bg-surface border border-border rounded font-mono text-muted',
                                k === 'then' && 'border-none bg-transparent',
                              )}
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-surface-hover">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Press <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">Esc</kbd> to close</span>
              <span className="text-brand-400 font-medium">DentalOS Pro Tip</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
