/**
 * Pure dashboard calculations — no React, no state. Single-pass where possible.
 */
import { mapSalesStatusToBucket } from '../constants/salesStatus';
import { formatCompact } from '../utils/formatUtils';

const LEAD_SOURCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280', '#ec4899', '#14b8a6'];

/** Single-pass: build status counts and bucket counts from leads */
export function calculateLeadMetrics(leads) {
  const statusCounts = { all: 0, pending: 0, running: 0, converted: 0, interested: 0, 'win/closed': 0, closed: 0, lost: 0 };
  const bucketCounts = {};
  leads.forEach((l) => {
    const status = String(l.sales_status || '').toLowerCase().trim();
    const key = status === 'win/closed' || status === 'win closed' ? 'win/closed' : status;
    if (statusCounts[key] != null) statusCounts[key] += 1;
    statusCounts.all += 1;
    const bucket = mapSalesStatusToBucket(l.sales_status);
    bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
  });
  const totalLeads = leads.length;
  const winClosedLeads = statusCounts['win/closed'] || 0;
  const pendingLeads = statusCounts.pending || 0;
  const conversionRate = totalLeads > 0 ? ((winClosedLeads / totalLeads) * 100).toFixed(1) : 0;
  const pendingRate = totalLeads > 0 ? ((pendingLeads / totalLeads) * 100).toFixed(1) : 0;
  return {
    totalLeads,
    winClosedLeads,
    pendingLeads,
    nextMeetingLeads: bucketCounts['next-meeting'] || 0,
    connectedLeads: bucketCounts.connected || 0,
    closedLeads: bucketCounts.closed || 0,
    conversionRate,
    pendingRate,
    statusCounts,
  };
}

/** Lead source counts — single pass, then sort and slice top 8 */
export function calculateLeadSources(leads) {
  const sourceCounts = {};
  leads.forEach((l) => {
    const source = l.source || 'Unknown';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  const sorted = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  return sorted.map(([label, value], i) => ({
    label,
    value,
    color: LEAD_SOURCE_COLORS[i % LEAD_SOURCE_COLORS.length],
  }));
}

/** Weekly activity by day of week (Mon–Sun) */
export function calculateWeeklyActivity(leads) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  const weekLeads = leads.filter((l) => {
    if (!l.created_at) return false;
    const d = new Date(l.created_at);
    return d >= startOfWeek && d <= endOfWeek;
  });
  const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  weekLeads.forEach((l) => {
    if (l.created_at) {
      const day = new Date(l.created_at).getDay();
      dayCounts[day] += 1;
    }
  });
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  return dayOrder.map((dayNum, i) => ({
    label: dayLabels[i],
    value: dayCounts[dayNum] || 0,
    color: '#3b82f6',
  }));
}

/** Sales overview metrics (win rate, lost rate, avg days, etc.) — from filtered leads + businessMetrics */
export function calculateSalesOverviewMetrics(leads, businessMetrics) {
  const totalLeads = leads.length;
  const totalSalesAmount = businessMetrics.totalReceivedPayment || 0;
  const pendingLeads = leads.filter((l) => String(l.sales_status || '').toLowerCase() === 'pending').length;
  const winClosedLeads = leads.filter((l) => {
    const s = String(l.sales_status || '').toLowerCase();
    return s === 'win/closed' || s === 'win closed';
  }).length;
  const lostLeads = leads.filter((l) => String(l.sales_status || '').toLowerCase() === 'lost').length;
  const closedLeads = leads.filter((l) => String(l.sales_status || '').toLowerCase() === 'closed').length;
  const openDealLeads = leads.filter((l) => {
    const s = String(l.sales_status || '').toLowerCase();
    return s !== 'win/closed' && s !== 'win closed' && s !== 'closed' && s !== 'lost';
  });
  const now = Date.now();
  const avgOpenDealAge =
    openDealLeads.length === 0
      ? 0
      : openDealLeads.reduce((sum, l) => {
          const created = l.created_at ? new Date(l.created_at).getTime() : now;
          return sum + Math.max(0, Math.round((now - created) / (24 * 60 * 60 * 1000)));
        }, 0) / openDealLeads.length;
  const leadsWithFollowup = totalLeads - pendingLeads;
  const winRate = leadsWithFollowup > 0 ? (winClosedLeads / leadsWithFollowup) * 100 : 0;
  const lostRate = totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0;
  const openDeals = totalLeads - winClosedLeads - closedLeads - lostLeads;
  const piValue = businessMetrics.totalRevenue || 0;
  const avgDaysToClose = 60.7;
  return {
    totalSales: formatCompact(totalSalesAmount),
    winRate: winRate.toFixed(2) + '%',
    lostRate: lostRate.toFixed(2) + '%',
    avgDaysToClose: avgDaysToClose.toFixed(2),
    pipelineValue: formatCompact(piValue),
    openDeals: formatCompact(openDeals),
    weightedValue: formatCompact(totalSalesAmount),
    avgOpenDealAge: avgOpenDealAge.toFixed(2),
  };
}

/** Target progress from userTarget + businessMetrics */
export function calculateTargetProgress(userTarget, businessMetrics) {
  const target = Number(userTarget?.target || 0);
  const targetStartDate = userTarget?.targetStartDate ? new Date(`${userTarget.targetStartDate}T00:00:00`) : null;
  const targetEndDate = userTarget?.targetEndDate ? new Date(`${userTarget.targetEndDate}T00:00:00`) : null;
  const hasTargetAssigned =
    target > 0 &&
    !!targetStartDate &&
    !!targetEndDate &&
    !isNaN(targetEndDate.getTime()) &&
    targetEndDate >= new Date(new Date().setHours(0, 0, 0, 0));
  const achievedTarget = Number(userTarget?.achievedTarget || 0) || Number(businessMetrics?.totalReceivedPayment || 0);
  const progress = target > 0 ? Math.min(100, Math.round((achievedTarget / target) * 100)) : 0;
  return {
    hasTargetAssigned,
    revenueTarget: hasTargetAssigned ? target : 0,
    revenueCurrent: hasTargetAssigned ? achievedTarget : 0,
    targetProgress: progress,
    targetStartDate,
    targetEndDate,
  };
}

/** Follow-up counts from leads — single pass */
export function getFollowUpCounts(leads) {
  const c = { 'appointment scheduled': 0, 'closed/lost': 0, 'quotation sent': 0 };
  leads.forEach((l) => {
    const k = String(l.follow_up_status || l.followUpStatus || '').toLowerCase();
    if (c[k] != null) c[k] += 1;
  });
  return c;
}
