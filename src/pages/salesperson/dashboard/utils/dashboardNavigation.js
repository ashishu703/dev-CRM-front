/**
 * Central place for dashboard card → page navigation.
 * DRY: one source of truth for which card goes where and which filters to pass.
 */
export const DASHBOARD_FILTER_KEY = 'dashboardLeadsFilter';

/** Pipeline stage key → follow_up_status filter value for leads */
export const PIPELINE_STAGE_TO_FILTER = {
  'PENDING': 'PENDING',
  'APPOINTMENT SCHEDULED': 'APPOINTMENT SCHEDULED',
  'QUOTATION SENT': 'QUOTATION SENT',
  'NEGOTIATION': 'NEGOTIATION',
  'CLOSE ORDER': 'CLOSE ORDER',
  'CLOSED/LOST': 'CLOSED/LOST',
};

export const CARD_NAV = {
  todayCalls: 'last-call',
  todayEnquiries: 'enquiries',
  followUpsTaken: 'last-call',
  newLeadsNoFollowUp: 'leads',
  newLeadsAdded: 'leads',
  quotationCreated: 'leads',
  paymentApprovedToday: 'payment',
  piCreated: 'leads',
};

export const CARD_FILTER = {
  newLeadsNoFollowUp: 'no_follow_up',
  newLeadsAdded: 'new_leads_added',
  quotationCreated: 'quotation_created',
  piCreated: 'pi_created',
};

/**
 * Build filter object for leads page (stored in sessionStorage and read by Leads).
 * @param {string} filterType - one of no_follow_up, new_leads_added, quotation_created, pi_created, pipeline_stage
 * @param {string} [date] - YYYY-MM-DD
 * @param {string} [stageKey] - for pipeline_stage e.g. APPOINTMENT SCHEDULED
 */
export function setDashboardLeadsFilter(filterType, date, stageKey, extra = null) {
  const payload = { filter: filterType };
  if (date) payload.date = date;
  if (stageKey) payload.stageKey = stageKey;
  if (extra && typeof extra === 'object') {
    Object.assign(payload, extra);
  }
  try {
    sessionStorage.setItem(DASHBOARD_FILTER_KEY, JSON.stringify(payload));
  } catch (_) {}
}

function pushLeadsUrl(queryParams) {
  try {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams();
    Object.entries(queryParams || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
    const qs = q.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.pushState({}, '', next);
    window.dispatchEvent(new Event('dashboardLeadsFilterChanged'));
  } catch (_) {}
}

/**
 * Create a single onCardClick handler for the dashboard.
 * @param {string} mode - 'salesperson' | 'head' | 'superadmin'
 * @param {Function} navigate - (pageOrView, id?) for salesperson setCurrentPage; for head/superadmin setActiveView
 * @param {string} [dashboardDate] - selected date YYYY-MM-DD
 * @returns {(cardKey: string | null, stageKey?: string) => void} - cardKey for KPI card, or (null, stageKey) for pipeline stage
 */
export function createDashboardCardHandler(mode, navigate, dashboardDate) {
  return (cardKey, stageKey = null) => {
    const date = dashboardDate || new Date().toISOString().slice(0, 10);

    if (stageKey != null && stageKey !== '') {
      setDashboardLeadsFilter('pipeline_stage', date, stageKey);
      if (mode === 'salesperson') {
        const q = new URLSearchParams({ filter: 'pipeline_stage', date, stage: stageKey });
        navigate(`/customers?${q.toString()}`);
      } else {
        pushLeadsUrl({ filter: 'pipeline_stage', date, stage: stageKey });
        navigate('leads');
      }
      return;
    }

    const target = CARD_NAV[cardKey];
    const filterType = CARD_FILTER[cardKey];

    if (target === 'last-call') {
      setDashboardLeadsFilter('last_call', date);
      if (mode === 'salesperson') navigate('last-call');
      else {
        pushLeadsUrl({ filter: 'last_call', date });
        navigate('leads');
      }
      return;
    }
    if (target === 'enquiries') {
      setDashboardLeadsFilter('enquiries', date);
      if (mode === 'salesperson') {
        const q = new URLSearchParams({ filter: 'enquiries', date, tab: 'enquiry' });
        navigate(`/customers?${q.toString()}`);
      } else {
        pushLeadsUrl({ filter: 'enquiries', date, tab: 'enquiry' });
        navigate('leads');
      }
      return;
    }
    if (target === 'payment') {
      if (mode === 'salesperson') navigate('payment-tracking');
      else if (mode === 'superadmin') navigate('performance'); // Superadmin sidebar: Payment Info = 'performance'
      else navigate('payment-info'); // Department Head sidebar: Payment Info = 'payment-info'
      return;
    }
    if (target === 'leads' && (filterType || stageKey)) {
      const filter = stageKey ? 'pipeline_stage' : filterType;
      setDashboardLeadsFilter(filter, date, stageKey || undefined);
      if (mode === 'salesperson') {
        const q = new URLSearchParams({ filter, date });
        if (stageKey) q.set('stage', stageKey);
        navigate(`/customers?${q.toString()}`);
      } else {
        pushLeadsUrl({ filter, date, ...(stageKey ? { stage: stageKey } : {}) });
        navigate('leads');
      }
    }
  };
}
