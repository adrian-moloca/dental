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

/**
 * Helper to get patient name - handles both flat and nested person structure
 */
function getPatientName(patient: PatientDto): { firstName: string; lastName: string } {
  return {
    firstName: patient.person?.firstName || patient.firstName || '',
    lastName: patient.person?.lastName || patient.lastName || '',
  };
}

/**
 * Helper to get patient contact info - handles both flat and nested contacts structure
 */
function getPatientContacts(patient: PatientDto): { phone?: string; email?: string } {
  // Try nested contacts first, then flat structure
  const phones = (patient as any).contacts?.phones || patient.phones;
  const emails = (patient as any).contacts?.emails || patient.emails;

  return {
    phone: phones?.find((p: any) => p.isPrimary)?.number || phones?.[0]?.number,
    email: emails?.find((e: any) => e.isPrimary)?.address || emails?.[0]?.address,
  };
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
    queryFn: () => patientsClient.search({ search: searchQuery, limit: 10 }),
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  const patients = patientsData?.data || [];

  // Load selected patient if value is provided
  useEffect(() => {
    if (value && !selectedPatient) {
      patientsClient.getById(value).then((patient) => {
        setSelectedPatient(patient);
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
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    setSearchQuery('');
                  }
                }}
                disabled={disabled}
                placeholder="Cauta dupa nume, telefon sau email..."
                className={`form-control ${error ? 'is-invalid' : ''}`}
                style={{ paddingRight: '40px' }}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'patient-error' : undefined}
                aria-autocomplete="list"
                aria-controls="patient-search-results"
                aria-expanded={isOpen}
                role="combobox"
              />
              <div className="position-absolute end-0 top-50 translate-middle-y pe-3">
                <i className="ti ti-search text-muted" aria-hidden="true"></i>
              </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
              <div
                id="patient-search-results"
                className="dropdown-menu show w-100 shadow-lg border mt-1"
                style={{ maxHeight: '256px', overflowY: 'auto', position: 'absolute', zIndex: 1050 }}
                role="listbox"
                aria-label="Patient search results"
              >
                {isLoading ? (
                  <div className="p-4 text-center" style={{ color: 'var(--gray-600, #6b7280)' }}>
                    <div className="spinner-border spinner-border-sm mb-2" role="status">
                      <span className="visually-hidden">Se incarca...</span>
                    </div>
                    <div className="small">Se cauta...</div>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="p-4 text-center" style={{ color: 'var(--gray-600, #6b7280)' }}>
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
                  <ul className="list-unstyled mb-0">
                    {patients.map((patient) => {
                      const name = getPatientName(patient);
                      const contacts = getPatientContacts(patient);
                      const fullName = `${name.firstName} ${name.lastName}`.trim();

                      return (
                        <li key={patient.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectPatient(patient)}
                            className="dropdown-item d-block w-100 text-start py-2 px-3"
                            role="option"
                            aria-selected="false"
                            aria-label={`Selecteaza ${fullName}`}
                            style={{
                              color: 'var(--gray-900, #111827)',
                              backgroundColor: 'transparent',
                              transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--gray-100, #f3f4f6)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div className="fw-medium" style={{ color: 'var(--gray-900, #111827)' }}>
                              {fullName || 'Pacient fara nume'}
                            </div>
                            <div className="small mt-1 d-flex gap-3" style={{ color: 'var(--gray-600, #6b7280)' }}>
                              {contacts.phone && (
                                <span>
                                  <i className="ti ti-phone me-1" aria-hidden="true"></i>
                                  {contacts.phone}
                                </span>
                              )}
                              {contacts.email && (
                                <span>
                                  <i className="ti ti-mail me-1" aria-hidden="true"></i>
                                  {contacts.email}
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          // Selected patient display
          (() => {
            const name = getPatientName(selectedPatient);
            const contacts = getPatientContacts(selectedPatient);
            const fullName = `${name.firstName} ${name.lastName}`.trim();

            return (
              <div
                className={`d-flex align-items-center justify-content-between border rounded p-2 ${error ? 'border-danger' : ''}`}
                style={{ backgroundColor: 'var(--bs-body-bg, #fff)' }}
              >
                <div className="flex-grow-1">
                  <div className="fw-medium" style={{ color: 'var(--bs-body-color, #212529)' }}>
                    {fullName || 'Pacient selectat'}
                  </div>
                  <div className="small mt-1" style={{ color: 'var(--bs-secondary-color, #6c757d)' }}>
                    {contacts.phone && (
                      <span className="me-3">
                        <i className="ti ti-phone me-1" aria-hidden="true"></i>
                        {contacts.phone}
                      </span>
                    )}
                    {contacts.email && (
                      <span>
                        <i className="ti ti-mail me-1" aria-hidden="true"></i>
                        {contacts.email}
                      </span>
                    )}
                    {!contacts.phone && !contacts.email && (
                      <span>Fara informatii de contact</span>
                    )}
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="btn btn-sm btn-outline-secondary ms-2"
                    aria-label="Sterge selectia pacientului"
                    style={{ minWidth: '32px' }}
                  >
                    <i className="ti ti-x" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            );
          })()
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
