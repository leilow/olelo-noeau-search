'use client';

import { scrollToSearchBar } from '@/lib/scrollUtils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    scrollToSearchBar();
  };

  return (
    <nav className="flex items-center justify-center gap-4 py-2" aria-label="Pagination">
      <button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="button-base py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#f0eadd' }}
      >
        First
      </button>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="button-base py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#f0eadd' }}
      >
        Prev
      </button>
      <span className="font-mono text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="button-base py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#f0eadd' }}
      >
        Next
      </button>
      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage >= totalPages}
        className="button-base py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#f0eadd' }}
      >
        Last
      </button>
    </nav>
  );
}
