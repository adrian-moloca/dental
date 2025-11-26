import clsx from 'clsx';
import { type ReactNode } from 'react';

export type Column<T> = {
  id: string;
  header: ReactNode;
  accessor: (row: T) => ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  emptyState?: ReactNode;
  toolbar?: ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  ariaLabel?: string;
};

export function Table<T>({
  data,
  columns,
  emptyState,
  toolbar,
  page,
  pageSize,
  total,
  onPageChange,
  ariaLabel,
}: Props<T>) {
  const pages = pageSize && total ? Math.ceil(total / pageSize) : undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      {toolbar && <div className="border-b border-[var(--border)] px-4 py-3">{toolbar}</div>}
      <div className="min-w-full overflow-x-auto">
        <table
          className="min-w-full text-sm text-[var(--text)]"
          aria-label={ariaLabel}
        >
          <thead className="bg-[var(--surface-card)] text-xs uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={clsx(
                    'px-4 py-3 text-left align-middle whitespace-nowrap border-b border-[var(--border)] font-semibold',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.map((row, idx) => (
              <tr key={(row as unknown as { id?: string })?.id ?? idx} className="hover:bg-[var(--surface-hover)] transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={clsx(
                      'px-4 py-3 align-middle whitespace-nowrap',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-6 text-center text-[var(--text-tertiary)] text-sm">
          {emptyState || 'No data right now.'}
        </div>
      )}
      {pages && pages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <span>
            Page {page ?? 1} of {pages}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] disabled:opacity-40 transition-colors"
              onClick={() => onPageChange?.((page ?? 1) - 1)}
              disabled={!onPageChange || (page ?? 1) <= 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] disabled:opacity-40 transition-colors"
              onClick={() => onPageChange?.((page ?? 1) + 1)}
              disabled={!onPageChange || (page ?? 1) >= pages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
