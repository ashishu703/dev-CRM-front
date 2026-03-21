/**
 * Maps salesperson_lead_history rows into synthetic timeline activities so the
 * Activity Timeline matches legacy follow-up snapshots when lead_activities is empty or partial.
 */

export const FOLLOWUP_HISTORY_ACTIVITY = 'followup_history_entry';

export function mapHistoryRowToSyntheticActivity(h) {
  return {
    id: `spl-hist-${h.id}`,
    lead_id: h.lead_id,
    activity_type: FOLLOWUP_HISTORY_ACTIVITY,
    created_at: h.created_at,
    performed_by: `spl-hist-${h.id}`,
    performed_by_name: h.username || 'User',
    metadata: {
      followUpStatus: h.follow_up_status,
      salesStatus: h.sales_status,
      followUpRemark: h.follow_up_remark,
      salesStatusRemark: h.sales_status_remark,
    },
    _source: 'salesperson_lead_history',
  };
}

export function shouldMergeLeadHistory(activeFilter) {
  return (
    activeFilter === 'all' ||
    activeFilter === 'followups' ||
    activeFilter === 'status'
  );
}

/**
 * Unwraps GET /leads/.../history response (apiClient returns JSON body).
 */
export function normalizeLeadHistoryRows(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

export function mergeHistoryIntoActivities(activities, historyRows, activeFilter) {
  const list = Array.isArray(activities) ? activities : [];
  if (!shouldMergeLeadHistory(activeFilter)) {
    return [...list].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }
  const synthetic = (historyRows || []).map(mapHistoryRowToSyntheticActivity);
  const combined = [...synthetic, ...list];
  const seen = new Set();
  const out = [];
  for (const item of combined.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )) {
    const key = String(item.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
