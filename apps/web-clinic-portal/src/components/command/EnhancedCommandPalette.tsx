/**
 * Enhanced Command Palette - The Game-Changer Feature
 *
 * Advanced command palette with:
 * - Global search (patients, appointments, actions)
 * - Recent searches
 * - Keyboard navigation
 * - Categories and grouping
 *
 * This feature sets DentalOS apart from Romanian competitors.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import clsx from 'clsx';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: IconName;
  shortcut?: string[];
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Patients' | 'Appointments' | 'System' | 'Recent';
  score?: number; // For search ranking
}

interface EnhancedCommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

// Local storage key for recent searches
const RECENT_SEARCHES_KEY = 'dental-os-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export function EnhancedCommandPalette({ open, onClose }: EnhancedCommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      MAX_RECENT_SEARCHES,
    );
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Mock patient data - replace with real API call
  const mockPatients = [
    { id: '1', name: 'Maria Popescu', lastVisit: '2024-11-20' },
    { id: '2', name: 'Ion Georgescu', lastVisit: '2024-11-18' },
    { id: '3', name: 'Elena Dumitrescu', lastVisit: '2024-11-15' },
  ];

  // Mock appointment data - replace with real API call
  const mockAppointments = [
    { id: '1', patient: 'Maria Popescu', date: '2024-11-27 09:00', type: 'Consultatie' },
    { id: '2', patient: 'Ion Georgescu', date: '2024-11-27 10:30', type: 'Tratament Canal' },
  ];

  const baseCommands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        description: 'View clinic overview',
        icon: 'home',
        shortcut: ['G', 'D'],
        action: () => {
          navigate('/dashboard');
          onClose();
        },
        category: 'Navigation',
      },
      {
        id: 'nav-patients',
        label: 'Patients',
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
        label: 'Appointments',
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
        id: 'nav-billing',
        label: 'Billing',
        description: 'Invoices and payments',
        icon: 'credit-card',
        shortcut: ['G', 'B'],
        action: () => {
          navigate('/billing');
          onClose();
        },
        category: 'Navigation',
      },
      {
        id: 'nav-inventory',
        label: 'Inventory',
        description: 'Stock management',
        icon: 'package',
        shortcut: ['G', 'I'],
        action: () => {
          navigate('/inventory');
          onClose();
        },
        category: 'Navigation',
      },
      {
        id: 'nav-reports',
        label: 'Reports',
        description: 'Analytics and insights',
        icon: 'chart-bar',
        shortcut: ['G', 'R'],
        action: () => {
          navigate('/reports');
          onClose();
        },
        category: 'Navigation',
      },
      {
        id: 'nav-settings',
        label: 'Settings',
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
        icon: 'user-plus',
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
        icon: 'calendar-plus',
        shortcut: ['N', 'A'],
        action: () => {
          navigate('/appointments/create');
          onClose();
        },
        category: 'Actions',
      },
      {
        id: 'action-new-invoice',
        label: 'New Invoice',
        description: 'Create a new invoice',
        icon: 'file-invoice',
        shortcut: ['N', 'I'],
        action: () => {
          navigate('/billing/invoices/new');
          onClose();
        },
        category: 'Actions',
      },

      // System
      {
        id: 'system-theme',
        label: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        icon: 'moon',
        shortcut: ['T'],
        action: () => {
          toggleTheme();
          onClose();
        },
        category: 'System',
      },
    ],
    [navigate, onClose, toggleTheme],
  );

  // Generate patient search commands
  const patientCommands: CommandItem[] = useMemo(() => {
    if (!search) return [];

    return mockPatients
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .map((patient) => ({
        id: `patient-${patient.id}`,
        label: patient.name,
        description: `Last visit: ${patient.lastVisit}`,
        icon: 'user' as IconName,
        action: () => {
          navigate(`/patients/${patient.id}`);
          saveRecentSearch(patient.name);
          onClose();
        },
        category: 'Patients' as const,
      }));
  }, [search, navigate, onClose]);

  // Generate appointment search commands
  const appointmentCommands: CommandItem[] = useMemo(() => {
    if (!search) return [];

    return mockAppointments
      .filter(
        (a) =>
          a.patient.toLowerCase().includes(search.toLowerCase()) ||
          a.type.toLowerCase().includes(search.toLowerCase()),
      )
      .map((appt) => ({
        id: `appointment-${appt.id}`,
        label: `${appt.patient} - ${appt.type}`,
        description: appt.date,
        icon: 'calendar' as IconName,
        action: () => {
          navigate(`/appointments/${appt.id}`);
          saveRecentSearch(`${appt.patient} - ${appt.type}`);
          onClose();
        },
        category: 'Appointments' as const,
      }));
  }, [search, navigate, onClose]);

  // Recent searches commands
  const recentCommands: CommandItem[] = useMemo(() => {
    if (search || recentSearches.length === 0) return [];

    return recentSearches.map((query, index) => ({
      id: `recent-${index}`,
      label: query,
      description: 'Recent search',
      icon: 'clock' as IconName,
      action: () => {
        setSearch(query);
      },
      category: 'Recent' as const,
    }));
  }, [search, recentSearches]);

  // Combine and filter all commands
  const allCommands = useMemo(() => {
    const combined = [...baseCommands, ...patientCommands, ...appointmentCommands, ...recentCommands];

    if (!search) return combined;

    const query = search.toLowerCase();
    return combined
      .filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query) ||
          cmd.description?.toLowerCase().includes(query) ||
          cmd.category?.toLowerCase().includes(query),
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.label.toLowerCase() === query;
        const bExact = b.label.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by category priority
        const categoryPriority = {
          Patients: 1,
          Appointments: 2,
          Actions: 3,
          Navigation: 4,
          System: 5,
          Recent: 6,
        };
        return (
          (categoryPriority[a.category] || 999) - (categoryPriority[b.category] || 999)
        );
      });
  }, [baseCommands, patientCommands, appointmentCommands, recentCommands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    allCommands.forEach((cmd) => {
      const category = cmd.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    return groups;
  }, [allCommands]);

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
          setSelectedIndex((i) => Math.min(allCommands.length - 1, i + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(0, i - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (allCommands[selectedIndex]) {
            allCommands[selectedIndex].action();
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
  }, [open, allCommands, selectedIndex, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/80 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
        aria-hidden={true}
      />

      {/* Command Palette */}
      <div
        className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-slideDown"
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
              placeholder="Search patients, appointments, or type a command..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted"
            />
            <kbd className="px-2 py-1 text-xs bg-surface-hover border border-border rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="search" className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted text-sm">No results found</p>
                <p className="text-muted text-xs mt-1">Try searching for patients, appointments, or actions</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider bg-surface-hover flex items-center justify-between">
                    <span>{category}</span>
                    {category === 'Recent' && recentSearches.length > 0 && (
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-brand-400 hover:text-brand-300 transition-colors normal-case"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {cmds.map((cmd) => {
                    const globalIndex = allCommands.indexOf(cmd);
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
                          <Icon
                            name={cmd.icon}
                            className={clsx(
                              'w-5 h-5 flex-shrink-0',
                              isSelected ? 'text-brand-400' : 'text-muted',
                            )}
                          />
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
            <span>{allCommands.length} results</span>
          </div>
        </div>
      </div>
    </>
  );
}
