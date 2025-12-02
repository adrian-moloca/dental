/**
 * Procedure Selector with Search
 * Searchable dropdown for selecting procedures from catalog
 */

import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/Input';
import { useProcedureCatalog } from '../../hooks/useClinical';
import { useDebounce } from '../../hooks/useDebounce';
import type { ProcedureCatalogItem } from '../../api/clinicalClient';

interface ProcedureSelectorProps {
  onSelect: (procedure: ProcedureCatalogItem) => void;
  disabled?: boolean;
}

export function ProcedureSelector({ onSelect, disabled }: ProcedureSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: catalogData, isLoading } = useProcedureCatalog(debouncedSearch);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      setIsOpen(true);
    }
  }, [debouncedSearch]);

  const handleSelect = (procedure: ProcedureCatalogItem) => {
    onSelect(procedure);
    setSearch('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const procedures = catalogData?.data || [];
  const showDropdown = isOpen && search.length >= 2 && (isLoading || procedures.length > 0);
  const showNoResults = isOpen && search.length >= 2 && !isLoading && procedures.length === 0;

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search.length >= 2 && setIsOpen(true)}
        placeholder="Search procedures (code or name)..."
        disabled={disabled}
        fullWidth
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-controls="procedure-listbox"
        role="combobox"
        aria-autocomplete="list"
      />

      {showDropdown && (
        <div
          id="procedure-listbox"
          role="listbox"
          aria-label="Procedure search results"
          className="absolute z-50 mt-1 w-full rounded-lg border shadow-lg max-h-64 overflow-y-auto"
          style={{
            borderColor: 'var(--border-color, #e7e8eb)',
            backgroundColor: 'var(--white, #ffffff)'
          }}
        >
          {isLoading && (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--gray-600, #6b7280)' }}>
              Searching procedures...
            </div>
          )}

          {!isLoading && procedures.map((procedure) => (
            <button
              key={procedure.id}
              type="button"
              role="option"
              aria-selected="false"
              aria-label={`${procedure.code} - ${procedure.name}`}
              onClick={() => handleSelect(procedure)}
              disabled={disabled}
              className="w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              style={{
                borderColor: 'var(--border-color, #e7e8eb)',
                backgroundColor: 'transparent',
                color: disabled ? 'var(--gray-400, #9ca3af)' : 'var(--gray-900, #111827)'
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--gray-100, #f3f4f6)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-transparent, #ECEDF7)';
                  e.currentTarget.style.outline = '2px solid var(--primary, #2E37A4)';
                  e.currentTarget.style.outlineOffset = '-2px';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.outline = 'none';
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-semibold" style={{ color: 'var(--primary, #2E37A4)' }}>
                      {procedure.code}
                    </span>
                    <span className="text-sm truncate" style={{ color: 'var(--gray-900, #111827)' }}>
                      {procedure.name}
                    </span>
                  </div>
                  {procedure.description && (
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--gray-600, #6b7280)' }}>
                      {procedure.description}
                    </p>
                  )}
                  {procedure.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded" style={{ backgroundColor: 'var(--gray-100, #f3f4f6)', color: 'var(--gray-700, #374151)' }}>
                      {procedure.category}
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold" style={{ color: 'var(--success, #27AE60)' }}>
                    ${procedure.defaultPrice.toFixed(2)}
                  </div>
                  {procedure.estimatedDuration && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--gray-600, #6b7280)' }}>
                      {procedure.estimatedDuration}min
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showNoResults && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border shadow-lg p-4"
          style={{
            borderColor: 'var(--border-color, #e7e8eb)',
            backgroundColor: 'var(--white, #ffffff)'
          }}
        >
          <p className="text-center text-sm" style={{ color: 'var(--gray-600, #6b7280)' }}>
            No procedures found for "{search}"
          </p>
          <p className="text-center text-xs mt-1" style={{ color: 'var(--gray-500, #6b7280)' }}>
            Try searching by CDT code or procedure name
          </p>
        </div>
      )}
    </div>
  );
}
