/**
 * Advanced Data Table - Sorting, filtering, pagination, selection
 */

import { useState, useMemo } from 'react';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import clsx from 'clsx';

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface AdvancedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  getRowId?: (row: T, index: number) => string;
  emptyMessage?: string;
  pageSize?: number;
}

export function AdvancedTable<T>({
  data,
  columns,
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (row: T, index: number) => String(index),
  emptyMessage = 'No data available',
  pageSize = 10,
}: AdvancedTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleFilter = (columnId: string, value: string) => {
    setFilters({ ...filters, [columnId]: value });
    setCurrentPage(1);
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) => {
          const column = columns.find((c) => c.id === columnId);
          if (!column) return true;
          const cellValue = String(column.accessor(row)).toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      const column = columns.find((c) => c.id === sortColumn);
      if (column) {
        result.sort((a, b) => {
          const aValue = String(column.accessor(a));
          const bValue = String(column.accessor(b));
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, filters, sortColumn, sortDirection, columns]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      onSelectionChange?.(new Set());
    } else {
      const allIds = new Set(paginatedData.map((row, index) => getRowId(row, index)));
      onSelectionChange?.(allIds);
    }
  };

  const toggleRow = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    onSelectionChange?.(newSelected);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {columns.some((c) => c.filterable) && (
        <div className="flex flex-wrap gap-3">
          {columns.filter((c) => c.filterable).map((column) => (
            <div key={column.id} className="w-48">
              <Input
                type="search"
                placeholder={`Filter ${column.header}...`}
                value={filters[column.id] || ''}
                onChange={(e) => handleFilter(column.id, e.target.value)}
                fullWidth
              />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-surface border-b border-border">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:text-foreground select-none',
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <Icon
                        name={sortColumn === column.id && sortDirection === 'desc' ? 'chevronRight' : 'chevronRight'}
                        className={clsx(
                          'w-4 h-4 transition-transform',
                          sortColumn === column.id && sortDirection === 'asc' && 'rotate-90',
                          sortColumn === column.id && sortDirection === 'desc' && '-rotate-90',
                          sortColumn !== column.id && 'opacity-0',
                        )}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                  <p className="text-muted">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = getRowId(row, index);
                const isSelected = selectedRows.has(rowId);
                return (
                  <tr
                    key={rowId}
                    className={clsx(
                      'hover:bg-surface-hover transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-brand-500/10',
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleRow(rowId);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-border"
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3 text-sm">
                        {column.accessor(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <Icon name="chevronLeft" className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={clsx(
                      'px-3 py-1 rounded text-sm font-medium transition-colors',
                      currentPage === page
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                        : 'text-muted hover:text-foreground hover:bg-surface-hover',
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <Icon name="chevronRight" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
