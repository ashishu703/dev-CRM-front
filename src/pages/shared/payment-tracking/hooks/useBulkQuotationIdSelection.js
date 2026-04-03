import { useState, useEffect, useCallback } from 'react';

/**
 * Bulk select quotation ids (current page / visible list). Keeps selection in sync when the list changes.
 * @param {string[]} visibleIds Deduped stable ids (e.g. one entry per quotation).
 */
export function useBulkQuotationIdSelection(visibleIds) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => visibleIds.includes(id)));
  }, [visibleIds]);

  const allSelected = visibleIds.length > 0 && selectedIds.length === visibleIds.length;
  const selectedCount = selectedIds.length;

  const toggleAll = useCallback(
    (checked) => {
      setSelectedIds(checked ? [...visibleIds] : []);
    },
    [visibleIds]
  );

  const toggleOne = useCallback((id, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : prev.concat(id);
      return prev.filter((x) => x !== id);
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  return {
    selectedIds,
    setSelectedIds,
    allSelected,
    selectedCount,
    toggleAll,
    toggleOne,
    clearSelection,
  };
}
