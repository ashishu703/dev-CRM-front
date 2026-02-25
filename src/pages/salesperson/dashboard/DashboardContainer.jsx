import React from 'react';
import { useSalesData } from '../../../shared/hooks/useSalesData';
import { useDashboardFilters } from './hooks/useDashboardFilters';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { DashboardDataProvider } from './context/DashboardDataContext';
import DashboardContent from '../salespersondashboard';

/**
 * Data layer only: hooks + API + derived state.
 * Provides everything to inner view via context.
 */
export default function DashboardContainer(props) {
  const salesData = useSalesData({ role: 'salesperson' });
  const {
    leads,
    leadsLoading,
    userTarget,
    businessMetrics,
    allPayments,
    allQuotations,
  } = salesData;

  const filters = useDashboardFilters(leads, allPayments, allQuotations);
  const metrics = useDashboardMetrics({
    filteredData: filters.filteredData,
    businessMetrics,
    userTarget,
  });

  const contextValue = {
    ...salesData,
    filters,
    metrics,
    initialLoading: leadsLoading,
  };

  return (
    <DashboardDataProvider value={contextValue}>
      <DashboardContent {...props} />
    </DashboardDataProvider>
  );
}
