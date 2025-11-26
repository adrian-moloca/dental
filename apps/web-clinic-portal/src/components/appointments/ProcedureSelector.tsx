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
          className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[#1F1F2D] shadow-lg max-h-64 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-4 text-center text-slate-400 text-sm">
              Searching procedures...
            </div>
          )}

          {!isLoading && procedures.map((procedure) => (
            <button
              key={procedure.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => handleSelect(procedure)}
              disabled={disabled}
              className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-[var(--brand)] font-semibold">
                      {procedure.code}
                    </span>
                    <span className="text-sm text-white truncate">
                      {procedure.name}
                    </span>
                  </div>
                  {procedure.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {procedure.description}
                    </p>
                  )}
                  {procedure.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-white/5 text-slate-300">
                      {procedure.category}
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-emerald-400">
                    ${procedure.defaultPrice.toFixed(2)}
                  </div>
                  {procedure.estimatedDuration && (
                    <div className="text-xs text-slate-400 mt-0.5">
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
          className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[#1F1F2D] shadow-lg p-4"
        >
          <p className="text-center text-slate-400 text-sm">
            No procedures found for "{search}"
          </p>
          <p className="text-center text-slate-500 text-xs mt-1">
            Try searching by CDT code or procedure name
          </p>
        </div>
      )}
    </div>
  );
}
