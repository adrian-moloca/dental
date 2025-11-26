/**
 * PatientSearchSelect Component
 *
 * Async searchable combobox for patient selection.
 * Searches by name, phone, or email as user types.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientsClient } from '../../api/patientsClient';
import type { PatientDto } from '../../types/patient.types';
import { Icon } from '../ui/Icon';
import clsx from 'clsx';

interface PatientSearchSelectProps {
  value?: string;
  onChange: (patientId: string | undefined, patient: PatientDto | undefined) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function PatientSearchSelect({
  value,
  onChange,
  label,
  error,
  required,
  disabled,
}: PatientSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch patients based on search query
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['patients', 'search', searchQuery],
    queryFn: () => patientsClient.search({ query: searchQuery, limit: 10 }),
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  const patients = patientsData?.data || [];

  // Load selected patient if value is provided
  useEffect(() => {
    if (value && !selectedPatient) {
      patientsClient.getById(value).then((response) => {
        setSelectedPatient(response.data);
      }).catch(() => {
        // Patient not found
        setSelectedPatient(undefined);
      });
    }
  }, [value, selectedPatient]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatient = useCallback((patient: PatientDto) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setIsOpen(false);
    onChange(patient.id, patient);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setSelectedPatient(undefined);
    setSearchQuery('');
    onChange(undefined, undefined);
    inputRef.current?.focus();
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2) {
      setIsOpen(true);
    }
  };

  const formatPatientDisplay = (patient: PatientDto) => {
    const phone = patient.phones?.find(p => p.isPrimary)?.number || patient.phones?.[0]?.number;
    return `${patient.firstName} ${patient.lastName}${phone ? ` • ${phone}` : ''}`;
  };

  return (
    <div className="space-y-2 text-sm" ref={containerRef}>
      {label && (
        <label className="block text-[var(--foreground)] font-medium">
          {label}
          {required && (
            <span className="text-red-400 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {!selectedPatient ? (
          <>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                disabled={disabled}
                placeholder="Search by name, phone, or email..."
                className={clsx(
                  'w-full rounded-lg border bg-[#1F1F2D] px-3 py-2 pr-10 text-[#F4EFF0] placeholder:text-slate-400 transition-all duration-200',
                  'focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  error && 'border-red-500/70 focus:ring-red-500',
                  !error && 'border-[var(--border)]',
                )}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'patient-error' : undefined}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[#1F1F2D] shadow-lg max-h-64 overflow-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-slate-400">
                    <Icon name="spinner" className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Searching...
                  </div>
                ) : patients.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    {searchQuery.length < 2 ? (
                      'Type at least 2 characters to search'
                    ) : (
                      <>
                        No patients found
                        <div className="text-xs mt-1">Try a different search term</div>
                      </>
                    )}
                  </div>
                ) : (
                  <ul role="listbox" className="py-1">
                    {patients.map((patient) => (
                      <li key={patient.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full text-left px-4 py-2 hover:bg-[var(--brand)]/10 focus:bg-[var(--brand)]/10 focus:outline-none transition-colors"
                          role="option"
                          aria-selected="false"
                        >
                          <div className="font-medium text-[#F4EFF0]">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex gap-3">
                            {patient.phones?.[0]?.number && (
                              <span>{patient.phones[0].number}</span>
                            )}
                            {patient.emails?.[0]?.address && (
                              <span>{patient.emails[0].address}</span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          // Selected patient display
          <div
            className={clsx(
              'flex items-center justify-between w-full rounded-lg border bg-[#1F1F2D] px-3 py-2 text-[#F4EFF0]',
              error ? 'border-red-500/70' : 'border-[var(--border)]',
            )}
          >
            <div className="flex-1">
              <div className="font-medium">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {selectedPatient.phones?.find(p => p.isPrimary)?.number ||
                  selectedPatient.phones?.[0]?.number ||
                  selectedPatient.emails?.[0]?.address}
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 p-1 hover:bg-slate-700/50 rounded transition-colors"
                aria-label="Clear selection"
              >
                <Icon name="x" className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <span id="patient-error" className="flex items-center gap-1 text-xs text-red-400" role="alert">
          <Icon name="exclamation" className="w-3 h-3" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}
