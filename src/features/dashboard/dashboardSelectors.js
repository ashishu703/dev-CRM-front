'use strict';

import { createSelector } from 'reselect';

function findDashboardQuery(state) {
  const queries = state?.api?.queries ?? {};
  const key = Object.keys(queries).find((k) => k.startsWith('getDashboardSummary'));
  return key ? queries[key] : null;
}

const selectDashboardResult = (state) => findDashboardQuery(state);

export const selectDashboardSummary = createSelector(
  [selectDashboardResult],
  (result) => result?.data ?? null
);

export const selectDashboardLoading = createSelector(
  [selectDashboardResult],
  (result) => result?.status === 'pending'
);

export const selectDashboardError = createSelector(
  [selectDashboardResult],
  (result) => (result?.status === 'rejected' ? result?.error : null)
);

export const selectAlerts = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.alerts ?? null
);

export const selectTodayPriority = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.todayPriority ?? null
);

export const selectLeadIntelligence = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.leadIntelligence ?? null
);

export const selectPaymentRisk = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.paymentRisk ?? null
);

export const selectIndiaGeo = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.indiaGeo ?? null
);

export const selectPipeline = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.pipeline ?? null
);

export const selectRevenueTarget = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.revenueTarget ?? null
);

export const selectActivity = createSelector(
  [selectDashboardSummary],
  (summary) => summary?.activity ?? null
);
