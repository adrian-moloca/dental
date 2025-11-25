/**
 * Pagination Component
 */

import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Previous
      </Button>

      {startPage > 1 && (
        <>
          <PageButton
            page={1}
            currentPage={currentPage}
            onClick={onPageChange}
          />
          {startPage > 2 && <span className="text-slate-500 px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <PageButton
          key={page}
          page={page}
          currentPage={currentPage}
          onClick={onPageChange}
        />
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-slate-500 px-2">...</span>}
          <PageButton
            page={totalPages}
            currentPage={currentPage}
            onClick={onPageChange}
          />
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  );
}

function PageButton({
  page,
  currentPage,
  onClick,
}: {
  page: number;
  currentPage: number;
  onClick: (page: number) => void;
}) {
  const isCurrent = page === currentPage;

  return (
    <button
      onClick={() => onClick(page)}
      disabled={isCurrent}
      aria-label={`Go to page ${page}`}
      aria-current={isCurrent ? 'page' : undefined}
      className={`
        min-w-[2.5rem] h-10 px-3 rounded-lg font-medium transition-colors
        ${
          isCurrent
            ? 'bg-brand-500 text-white cursor-default'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }
      `}
    >
      {page}
    </button>
  );
}
