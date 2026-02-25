export { dashboardApi, useGetDashboardSummaryQuery } from './dashboardApi';
export * from './dashboardSelectors';

/**
 * Back-compat: some legacy dashboard code dispatches `fetchDashboardSummary()`.
 * With RTK Query, dispatching the initiate action achieves the same.
 */
import { dashboardApi } from './dashboardApi';
export const fetchDashboardSummary = () => dashboardApi.endpoints.getDashboardSummary.initiate();

