import type { Pagination as ApiPagination } from '../../types/api';
import { Button } from './Button';

export interface PaginationProps {
  pagination: ApiPagination;
  onPageChange: (page: number) => void;
}

function pageItems(current: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visible = new Set<number>([1, totalPages]);
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      visible.add(page);
    }
  }

  const sorted = [...visible].sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index];
    const previous = sorted[index - 1];
    if (previous != null && page - previous > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  }
  return items;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } = pagination;
  if (total <= 0 || totalPages <= 0) {
    return null;
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const items = pageItems(page, totalPages);

  const goTo = (next: number) => {
    if (next === page || next < 1 || next > totalPages) {
      return;
    }
    onPageChange(next);
  };

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink/70">
        Showing {start}–{end} of {total}
        <span className="sr-only">
          , page {page} of {totalPages}
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" disabled={!hasPreviousPage} onClick={() => goTo(page - 1)}>
          Previous
        </Button>
        <div className="flex flex-wrap items-center gap-1">
          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-ink/50">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                disabled={item === page}
                onClick={() => goTo(item)}
                className={[
                  'inline-flex min-w-9 items-center justify-center rounded-lg px-2.5 py-2 text-sm font-semibold transition disabled:cursor-default',
                  item === page
                    ? 'bg-clay text-white'
                    : 'border border-sand bg-card text-ink hover:bg-sand/70',
                ].join(' ')}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <Button type="button" variant="secondary" disabled={!hasNextPage} onClick={() => goTo(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}
