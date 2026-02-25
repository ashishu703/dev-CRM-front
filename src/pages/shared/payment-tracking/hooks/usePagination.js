import { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Generic pagination for a list of rows.
 * Returns paginated slice + page controls.
 */
export function usePagination(rows, options = {}) {
  const { initialPage = 1, initialLimit = 10 } = options;
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(Math.max(totalItems, 1) / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, Math.max(totalItems, 0));
  const paginatedRows = useMemo(
    () => rows.slice(startIndex, endIndex),
    [rows, startIndex, endIndex]
  );

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPageState(totalPages);
  }, [totalPages, page]);

  const setPage = useCallback(
    (p) => {
      const v = Math.max(1, Math.min(p, totalPages));
      setPageState(v);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages]
  );

  const setLimitAndReset = useCallback((newLimit) => {
    setLimit(newLimit);
    setPageState(1);
  }, []);

  return {
    paginatedRows,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    setPage,
    setLimit: setLimitAndReset,
  };
}
