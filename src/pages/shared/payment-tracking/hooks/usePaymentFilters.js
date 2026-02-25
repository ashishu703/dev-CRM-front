import { useMemo, useState } from 'react';

function searchInRow(r, s, tab) {
  const str = String(s).toLowerCase();
  const fields =
    tab === 'statement'
      ? [r.partyName, r.reference, r.method]
      : [r.partyName, r.quotationNumber, r.quotationId, r.productName];
  return fields.some((v) => String(v || '').toLowerCase().includes(str));
}

/**
 * Filter rows by search and optional salesperson. Memoized per tab.
 */
export function usePaymentFilters(data, activeTab, salespersonFilter = '') {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = useMemo(() => {
    let rows =
      activeTab === 'orders'
        ? data.activeOrderProductRows || []
        : activeTab === 'pending'
          ? data.pendingRows || []
          : activeTab === 'statement'
            ? data.statementRows || []
            : activeTab === 'credit'
              ? (data.creditRows || []).concat(data.outstandingRows || [])
              : [];
    if (salespersonFilter && salespersonFilter.trim()) {
      const name = salespersonFilter.trim();
      rows = rows.filter((r) => (r.salespersonName || r.salesperson_name || '') === name);
    }
    if (!searchTerm.trim()) return rows;
    const s = searchTerm.trim();
    return rows.filter((r) => searchInRow(r, s, activeTab));
  }, [
    data.activeOrderProductRows,
    data.pendingRows,
    data.statementRows,
    data.creditRows,
    data.outstandingRows,
    activeTab,
    searchTerm,
    salespersonFilter,
  ]);

  return { searchTerm, setSearchTerm, filteredRows };
}
