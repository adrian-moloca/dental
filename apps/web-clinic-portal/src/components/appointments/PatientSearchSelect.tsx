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

  return (
    <div className="mb-3" ref={containerRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && (
            <span className="text-danger ms-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="position-relative">
        {!selectedPatient ? (
          <>
            <div className="position-relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                disabled={disabled}
                placeholder="Cauta dupa nume, telefon sau email..."
                className={`form-control ${error ? 'is-invalid' : ''}`}
                style={{ paddingRight: '40px' }}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'patient-error' : undefined}
              />
              <div className="position-absolute end-0 top-50 translate-middle-y pe-3">
                <i className="ti ti-search text-muted" aria-hidden="true"></i>
              </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
              <div
                className="dropdown-menu show w-100 shadow-lg border mt-1"
                style={{ maxHeight: '256px', overflowY: 'auto', position: 'absolute', zIndex: 1050 }}
              >
                {isLoading ? (
                  <div className="p-4 text-center text-muted">
                    <div className="spinner-border spinner-border-sm mb-2" role="status">
                      <span className="visually-hidden">Se incarca...</span>
                    </div>
                    <div className="small">Se cauta...</div>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    {searchQuery.length < 2 ? (
                      <span className="small">Introdu cel putin 2 caractere pentru cautare</span>
                    ) : (
                      <>
                        <div className="small">Niciun pacient gasit</div>
                        <div className="small mt-1">Incearca un alt termen de cautare</div>
                      </>
                    )}
                  </div>
                ) : (
                  <ul role="listbox" className="list-unstyled mb-0">
                    {patients.map((patient) => (
                      <li key={patient.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectPatient(patient)}
                          className="dropdown-item d-block w-100 text-start"
                          role="option"
                          aria-selected="false"
                        >
                          <div className="fw-medium">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="small text-muted mt-1 d-flex gap-3">
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
          <div className={`d-flex align-items-center justify-content-between border rounded p-2 ${error ? 'border-danger' : ''}`}>
            <div className="flex-grow-1">
              <div className="fw-medium">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </div>
              <div className="small text-muted mt-1">
                {selectedPatient.phones?.find(p => p.isPrimary)?.number ||
                  selectedPatient.phones?.[0]?.number ||
                  selectedPatient.emails?.[0]?.address}
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-sm btn-ghost-secondary ms-2"
                aria-label="Sterge selectia"
              >
                <i className="ti ti-x"></i>
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div id="patient-error" className="invalid-feedback d-block" role="alert">
          <i className="ti ti-alert-circle me-1"></i>
          {error}
        </div>
      )}
    </div>
  );
}
