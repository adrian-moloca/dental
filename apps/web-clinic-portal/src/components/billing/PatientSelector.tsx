/**
 * Patient Selector Component
 *
 * Search and select patient for invoice creation
 */

import { useState, useCallback, useEffect } from 'react';
import { usePatients } from '../../hooks/usePatients';
import { Icon } from '../ui/Icon';
import { debounce } from '../../utils/debounce';

interface PatientSelectorProps {
  selectedPatientId: string;
  onSelect: (patientId: string, patientName: string) => void;
}

export function PatientSelector({ selectedPatientId, onSelect }: PatientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data, isLoading } = usePatients({ query: debouncedQuery, limit: 10 });
  const patients = data?.data || [];

  // Debounce search input
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handlePatientClick = (patient: any) => {
    const fullName = `${patient.firstName} ${patient.lastName}`;
    onSelect(patient.id, fullName);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Icon
          name="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5"
        />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface-hover border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
          autoFocus
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon name="loading" className="w-5 h-5 text-brand animate-spin" />
          </div>
        )}
      </div>

      {/* Patient List */}
      {searchQuery && (
        <div className="border border-white/10 rounded-lg divide-y divide-white/5 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <Icon name="loading" className="w-8 h-8 text-brand animate-spin mx-auto mb-3" />
              <p className="text-sm text-foreground/60">Searching patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="user" className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-foreground/60">No patients found</p>
              <p className="text-xs text-foreground/40 mt-1">Try adjusting your search</p>
            </div>
          ) : (
            patients.map((patient: any) => (
              <button
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                className={`w-full p-4 text-left hover:bg-surface-hover transition-colors ${
                  selectedPatientId === patient.id ? 'bg-brand/10 border-l-4 border-brand' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      {selectedPatientId === patient.id && (
                        <Icon name="check" className="w-4 h-4 text-brand" />
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      {patient.dateOfBirth && (
                        <p className="text-xs text-foreground/60">
                          DOB: {formatDate(patient.dateOfBirth)}
                        </p>
                      )}
                      {patient.emails?.[0]?.address && (
                        <p className="text-xs text-foreground/60">
                          {patient.emails[0].address}
                        </p>
                      )}
                      {patient.phones?.[0]?.number && (
                        <p className="text-xs text-foreground/60">
                          {patient.phones[0].number}
                        </p>
                      )}
                    </div>
                  </div>
                  <Icon name="chevronRight" className="w-5 h-5 text-foreground/40 mt-1" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {!searchQuery && (
        <div className="p-12 text-center border border-dashed border-white/20 rounded-lg">
          <Icon name="search" className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/60 mb-2">
            Search for a Patient
          </h3>
          <p className="text-sm text-foreground/40">
            Start typing to search by name, email, or phone number
          </p>
        </div>
      )}
    </div>
  );
}
