import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, hasNextPage, hasPreviousPage, onPageChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink/70">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={!hasPreviousPage} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button type="button" variant="secondary" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}
