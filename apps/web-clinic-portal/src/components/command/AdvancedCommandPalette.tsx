/**
 * Advanced Command Palette - Keyboard shortcuts, search, actions
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';
import clsx from 'clsx';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: IconName;
  shortcut?: string[];
  action: () => void;
  category?: string;
}

interface AdvancedCommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function AdvancedCommandPalette({ open, onClose }: AdvancedCommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: Command[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-patients',
        label: 'Go to Patients',
        description: 'View all patients',
        icon: 'users',
        shortcut: ['G', 'P'],
        action: () => {
          navigate('/patients');
          onClose();
        },
        category: 'Navigation',
      },
      {
        id: 'nav-appointments',
        label: 'Go to Appointments',
        description: 'View schedule',
        icon: 'calendar',
        shortcut: ['G', 'A'],
        action: () => {
          navigate('/appointments');
          onClose();
        },
        category: 'Navigation',
      },
      {
        id: 'nav-settings',
        label: 'Go to Settings',
        description: 'App configuration',
        icon: 'settings',
        shortcut: ['G', 'S'],
        action: () => {
          navigate('/settings');
          onClose();
        },
        category: 'Navigation',
      },
      // Actions
      {
        id: 'action-new-patient',
        label: 'New Patient',
        description: 'Create a new patient record',
        icon: 'plus',
        shortcut: ['N', 'P'],
        action: () => {
          navigate('/patients/new');
          onClose();
        },
        category: 'Actions',
      },
      {
        id: 'action-new-appointment',
        label: 'New Appointment',
        description: 'Schedule an appointment',
        icon: 'calendar',
        shortcut: ['N', 'A'],
        action: () => {
          navigate('/appointments/create');
          onClose();
        },
        category: 'Actions',
      },
      // System
      {
        id: 'system-theme',
        label: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        icon: 'settings',
        shortcut: ['T'],
        action: () => {
          // This would toggle theme
          onClose();
        },
        category: 'System',
      },
    ],
    [navigate, onClose],
  );

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const query = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query) ||
        cmd.category?.toLowerCase().includes(query),
    );
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      const category = cmd.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(filteredCommands.length - 1, i + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(0, i - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredCommands, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/80 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden={true}
      />

      {/* Command Palette */}
      <div
        className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Icon name="search" className="w-5 h-5 text-muted" aria-hidden={true} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted"
            />
            <kbd className="px-2 py-1 text-xs bg-surface-hover border border-border rounded">ESC</kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="px-4 py-8 text-center text-muted text-sm">No commands found</div>
            ) : (
              Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider bg-surface-hover">
                    {category}
                  </div>
                  {cmds.map((cmd) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => cmd.action()}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected && 'bg-brand-500/10',
                        )}
                      >
                        {cmd.icon && (
                          <Icon name={cmd.icon} className="w-5 h-5 text-muted flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-xs text-muted truncate">{cmd.description}</div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1">
                            {cmd.shortcut.map((key, i) => (
                              <kbd
                                key={i}
                                className="px-2 py-0.5 text-xs bg-surface-hover border border-border rounded font-mono"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-surface-hover text-xs text-muted flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">↵</kbd> Select
              </span>
            </div>
            <span>{filteredCommands.length} commands</span>
          </div>
        </div>
      </div>
    </>
  );
}
