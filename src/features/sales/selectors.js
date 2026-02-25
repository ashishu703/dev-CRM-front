import { createSelector } from 'reselect';
import { leadsAdapter } from './salesSlice';

const selectSalesState = (state) => state.sales;

export const selectLeadsState = createSelector(
  [selectSalesState],
  (sales) => sales.leads
);

const leadsSelectors = leadsAdapter.getSelectors();

export const selectAllLeads = createSelector(
  [selectLeadsState],
  (leadsState) => leadsSelectors.selectAll(leadsState)
);

export const selectLeadsIds = createSelector(
  [selectLeadsState],
  (leadsState) => leadsSelectors.selectIds(leadsState)
);

export const selectLeadsLoading = createSelector(
  [selectSalesState],
  (sales) => sales.loading?.leads ?? false
);

export const selectLeadsError = createSelector(
  [selectSalesState],
  (sales) => sales.error?.leads ?? null
);

export const selectUserTarget = createSelector(
  [selectSalesState],
  (sales) => sales.userTarget
);

export const selectTargetLoading = createSelector(
  [selectSalesState],
  (sales) => sales.loading?.target ?? false
);

export const selectBusinessMetrics = createSelector(
  [selectSalesState],
  (sales) => sales.businessMetrics
);

export const selectChartData = createSelector(
  [selectSalesState],
  (sales) => sales.chartData ?? { allPayments: [], allQuotations: [], allPIs: [] }
);

export const selectLeadsByStatus = createSelector(
  [selectAllLeads],
  (leads) => {
    const byStatus = new Map();
    leads.forEach((lead) => {
      const status = (lead.sales_status || 'pending').toLowerCase();
      if (!byStatus.has(status)) byStatus.set(status, []);
      byStatus.get(status).push(lead);
    });
    return byStatus;
  }
);

export const selectLeadStatusCounts = createSelector(
  [selectAllLeads],
  (leads) => {
    const counts = {};
    leads.forEach((lead) => {
      const status = (lead.sales_status || 'pending').toLowerCase().trim();
      const key = status === 'win/closed' || status === 'win closed' ? 'win/closed' : status;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }
);
