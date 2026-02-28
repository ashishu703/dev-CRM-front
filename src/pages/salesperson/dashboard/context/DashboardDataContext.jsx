import { createContext, useContext } from 'react';

const DashboardDataContext = createContext(null);

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error('useDashboardData must be used inside DashboardContainer');
  return ctx;
}

export function useOptionalDashboardData() {
  return useContext(DashboardDataContext);
}

export const DashboardDataProvider = DashboardDataContext.Provider;
