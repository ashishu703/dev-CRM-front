import { useMemo } from 'react';
import { getCalendarDaysRemaining } from '../utils/dateUtils';
import {
  calculateLeadMetrics,
  calculateLeadSources,
  calculateWeeklyActivity,
  calculateSalesOverviewMetrics,
  calculateTargetProgress,
  getFollowUpCounts,
} from '../services/dashboardCalculator';

/**
 * All derived metrics from filtered data. No duplicate filtering — uses filteredData from useDashboardFilters.
 */
export function useDashboardMetrics({ filteredData, businessMetrics, userTarget }) {
  const { filteredLeads, filteredPayments } = filteredData;

  const leadMetrics = useMemo(
    () => calculateLeadMetrics(filteredLeads),
    [filteredLeads]
  );

  const leadSources = useMemo(
    () => calculateLeadSources(filteredLeads),
    [filteredLeads]
  );

  const weeklyActivity = useMemo(
    () => calculateWeeklyActivity(filteredLeads),
    [filteredLeads]
  );

  const salesOverviewMetrics = useMemo(
    () => calculateSalesOverviewMetrics(filteredLeads, businessMetrics),
    [filteredLeads, businessMetrics]
  );

  const targetProgressData = useMemo(
    () => calculateTargetProgress(userTarget, businessMetrics),
    [userTarget, businessMetrics]
  );

  const daysLeftInTarget = useMemo(() => {
    if (!targetProgressData.hasTargetAssigned || !targetProgressData.targetEndDate) return 0;
    const endDate = new Date(targetProgressData.targetEndDate);
    endDate.setHours(23, 59, 59, 999);
    return getCalendarDaysRemaining(endDate);
  }, [targetProgressData.hasTargetAssigned, targetProgressData.targetEndDate]);

  const followUpCounts = useMemo(
    () => getFollowUpCounts(filteredLeads),
    [filteredLeads]
  );

  const trendMetrics = useMemo(() => {
    const now = new Date();
    const currMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    currMonthEnd.setHours(23, 59, 59, 999);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    prevMonthEnd.setHours(23, 59, 59, 999);
    const inRange = (d, start, end) => d && !isNaN(d.getTime()) && d >= start && d <= end;
    const calcForRange = (start, end) => {
      const monthLeads = filteredLeads.filter((l) => {
        if (!l.created_at) return false;
        const ld = new Date(l.created_at);
        return inRange(ld, start, end);
      });
      const total = monthLeads.length;
      const winClosed = monthLeads.filter((l) => {
        const s = String(l.sales_status || '').toLowerCase();
        return s === 'win/closed' || s === 'win closed' || s === 'closed';
      }).length;
      const pending = monthLeads.filter((l) => String(l.sales_status || '').toLowerCase() === 'pending').length;
      return {
        totalLeads: total,
        conversionRate: total > 0 ? (winClosed / total) * 100 : 0,
        pendingRate: total > 0 ? (pending / total) * 100 : 0,
      };
    };
    const curr = calcForRange(currMonthStart, currMonthEnd);
    const prev = calcForRange(prevMonthStart, prevMonthEnd);
    const formatPct = (prevVal, currVal) => {
      if (!Number.isFinite(prevVal) || !Number.isFinite(currVal)) return { text: '—', up: false };
      if (prevVal === 0) return { text: '—', up: currVal > 0 };
      const pct = ((currVal - prevVal) / prevVal) * 100;
      const rounded = Math.round(pct * 10) / 10;
      return { text: `${rounded > 0 ? '+' : ''}${rounded}%`, up: rounded >= 0 };
    };
    const isPaymentOk = (p) => {
      const status = (p.payment_status || p.status || '').toLowerCase();
      const approval = (p.approval_status || '').toLowerCase();
      return (status === 'completed' || status === 'paid' || status === 'success' || status === 'advance') && approval === 'approved';
    };
    const getAmount = (p) => Number(p.installment_amount || p.paid_amount || p.amount || 0) || 0;
    const sumForRange = (start, end) =>
      (filteredPayments || [])
        .filter((p) => isPaymentOk(p) && !(p.is_refund === true || p.is_refund === 1))
        .filter((p) => {
          const pd = p.payment_date ? new Date(p.payment_date) : null;
          return pd ? inRange(pd, start, end) : false;
        })
        .reduce((s, p) => s + getAmount(p), 0);
    const currRev = sumForRange(currMonthStart, currMonthEnd);
    const prevRev = sumForRange(prevMonthStart, prevMonthEnd);
    return {
      totalLeadsTrend: formatPct(prev.totalLeads, curr.totalLeads),
      conversionRateTrend: formatPct(prev.conversionRate, curr.conversionRate),
      pendingRateTrend: formatPct(prev.pendingRate, curr.pendingRate),
      revenueTrend: formatPct(prevRev, currRev),
    };
  }, [filteredLeads, filteredPayments]);

  return {
    leadMetrics,
    leadSources,
    weeklyActivity,
    salesOverviewMetrics,
    targetProgressData,
    daysLeftInTarget,
    followUpCounts,
    trendMetrics,
    statusCounts: leadMetrics.statusCounts,
  };
}
