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
    <div className="overflow-hidden rounded-xl border border-white/5 bg-white/5 shadow-soft">
      {toolbar && <div className="border-b border-white/5 px-4 py-3">{toolbar}</div>}
      <div className="min-w-full overflow-x-auto">
        <table
          className="min-w-full text-sm text-slate-200"
          aria-label={ariaLabel}
        >
          <thead className="bg-white/5 text-xs uppercase tracking-[0.08em] text-slate-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={clsx(
                    'px-4 py-3 text-left align-middle whitespace-nowrap border-b border-white/5',
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
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={(row as unknown as { id?: string })?.id ?? idx} className="hover:bg-white/5 transition">
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
        <div className="p-6 text-center text-slate-400 text-sm">
          {emptyState || 'No data right now.'}
        </div>
      )}
      {pages && pages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-sm text-slate-300">
          <span>
            Page {page ?? 1} of {pages}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
              onClick={() => onPageChange?.((page ?? 1) - 1)}
              disabled={!onPageChange || (page ?? 1) <= 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
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
