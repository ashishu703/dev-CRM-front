import { createContext, useContext } from 'react';

const DashboardDataContext = createContext(null);

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error('useDashboardData must be used inside DashboardContainer');
  return ctx;
}

/** Use when component can run with or without provider (e.g. during migration). Returns null when outside provider. */
export function useOptionalDashboardData() {
  return useContext(DashboardDataContext);
}

export const DashboardDataProvider = DashboardDataContext.Provider;
