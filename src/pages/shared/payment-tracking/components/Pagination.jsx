import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Single pagination component for payment tracking. No duplicate dependency on salesperson module.
 */
export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) {
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const goToFirst = () => onPageChange(1);
  const goToPrev = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const goToLast = () => onPageChange(totalPages);

  if (totalItems === 0 && totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 py-3 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-600">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-xs sm:text-sm text-gray-600">per page</span>
      </div>
      <div className="text-xs sm:text-sm text-gray-600">
        {totalItems > 0 ? (
          <>Showing {startIndex}–{endIndex} of {totalItems}</>
        ) : (
          'No results'
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={goToFirst}
          disabled={currentPage === 1 || totalItems === 0}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goToPrev}
          disabled={currentPage === 1 || totalItems === 0}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-3 py-1 text-sm text-gray-700 min-w-[4rem] text-center">
          {currentPage} / {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={goToNext}
          disabled={currentPage >= totalPages || totalItems === 0}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goToLast}
          disabled={currentPage >= totalPages || totalItems === 0}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
