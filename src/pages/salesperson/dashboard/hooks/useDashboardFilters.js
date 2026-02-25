import { useState, useMemo, useCallback } from 'react';
import { getDateRangeFromFilter, filterLeadsByDate, filterPaymentsByDate, filterQuotationsByDate } from '../utils/dateUtils';

export function useDashboardFilters(leads = [], allPayments = [], allQuotations = []) {
  const [overviewDateFilter, setOverviewDateFilter] = useState('');
  const dateRange = useMemo(() => getDateRangeFromFilter(overviewDateFilter), [overviewDateFilter]);
  const filteredData = useMemo(
    () => ({
      filteredLeads: filterLeadsByDate(leads, dateRange),
      filteredPayments: filterPaymentsByDate(allPayments, dateRange),
      filteredQuotations: filterQuotationsByDate(allQuotations, dateRange),
    }),
    [leads, allPayments, allQuotations, dateRange]
  );
  const clearDateFilter = useCallback(() => setOverviewDateFilter(''), []);
  return { overviewDateFilter, setOverviewDateFilter, dateRange, filteredData, clearDateFilter };
}
