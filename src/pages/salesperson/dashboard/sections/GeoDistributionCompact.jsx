import React, { memo, useEffect, useMemo, useState } from 'react';
import IndiaMapView from './IndiaMapView';
import { X, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';
import { setDashboardLeadsFilter } from '../utils/dashboardNavigation';

function normalizeStateName(name) {
  return (name || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

const SORT_LEADS = 'leads';
const SORT_REVENUE = 'revenue';
const TOP_N = 10;

const GeoDistributionCompact = memo(function GeoDistributionCompact({ indiaGeo, onNavigate, dashboardDate, mode }) {
  if (!indiaGeo) return null;

  const { states = [], topStates = [] } = indiaGeo;
  const aggregatedStates = useMemo(() => {
    const m = new Map();
    (states || []).forEach((st) => {
      const key = normalizeStateName(st?.state);
      if (!key) return;
      if (['unknown', 'n/a', 'na', 'null'].includes(key)) return;

      const prev = m.get(key) || {
        stateName: st?.state,
        customerCount: 0,
        orders: 0,
        revenue: 0,
      };

      const customerCount = Number(st?.customerCount || 0) || 0;
      const orders = Number(st?.orders || 0) || 0;
      const rev = typeof st?.revenue === 'number' ? st.revenue : Number(st?.revenue) || 0;

      prev.customerCount += customerCount;
      prev.orders += orders;
      prev.revenue += rev;
      m.set(key, prev);
    });

    return Array.from(m.entries()).map(([key, v]) => ({
      state: v.stateName,
      customerCount: v.customerCount,
      orders: v.orders,
      revenue: v.revenue,
      conversionPct: v.customerCount > 0 ? (v.orders / v.customerCount) * 100 : 0,
    }));
  }, [states]);
  const [stateCountMap, setStateCountMap] = useState({});
  const [stateMetaMap, setStateMetaMap] = useState({});
  const [sortBy, setSortBy] = useState(SORT_LEADS);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [drawerState, setDrawerState] = useState(null);

  useEffect(() => {
    const countMap = {};
    const metaMap = {};
    (aggregatedStates || []).forEach((st) => {
      const key = normalizeStateName(st.state);
      if (!key) return;
      countMap[key] = Number(st.customerCount || 0) || 0;
      const rev = typeof st.revenue === 'number' ? st.revenue : Number(st.revenue) || 0;
      metaMap[key] = {
        orders: Number(st.orders || 0) || 0,
        revenue: rev,
        conversionPct: Number(st.conversionPct ?? 0) || 0,
        stateName: st.state,
      };
    });
    setStateCountMap(countMap);
    setStateMetaMap(metaMap);
  }, [aggregatedStates]);

  const filteredAndSorted = useMemo(() => {
    let list = [...(aggregatedStates || [])];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => (s.state || '').toLowerCase().includes(q));
    }
    const revNum = (s) => (typeof s.revenue === 'number' ? s.revenue : Number(s.revenue) || 0);
    if (sortBy === SORT_REVENUE) list.sort((a, b) => revNum(b) - revNum(a));
    else list.sort((a, b) => (b.customerCount || 0) - (a.customerCount || 0));
    return list;
  }, [aggregatedStates, search, sortBy]);

  const totalLeads = useMemo(
    () => filteredAndSorted.reduce((s, x) => s + (x.customerCount || 0), 0),
    [filteredAndSorted]
  );

  const tableRows = collapsed ? filteredAndSorted.slice(0, TOP_N) : filteredAndSorted;
  const hasMore = filteredAndSorted.length > TOP_N;

  const handleStateClick = (stateName, stateKey) => {
    const meta = stateMetaMap[stateKey];
    const effectiveName = stateName || meta?.stateName || 'Unknown';
    setDrawerState({
      stateName: effectiveName,
      leads: stateCountMap[stateKey] ?? 0,
      orders: meta?.orders ?? 0,
      revenue: meta?.revenue ?? 0,
      conversionPct: meta?.conversionPct ?? 0,
    });

    // Navigate with only that state filtered.
    // Salesperson mode uses URL-based navigation to `/customers`.
    // Superadmin / Department Head use `Leads` page + sessionStorage filter.
    if (onNavigate) {
      if (mode === 'salesperson') {
        const params = new URLSearchParams();
        params.set('filter', 'state');
        params.set('state', effectiveName);
        if (dashboardDate) params.set('date', dashboardDate);
        onNavigate(`/customers?${params.toString()}`);
      } else {
        // Keep URL in sync with salesperson flow.
        try {
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams();
            params.set('filter', 'state');
            params.set('state', effectiveName);
            if (dashboardDate) params.set('date', dashboardDate);
            const next = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({}, '', next);
            window.dispatchEvent(new Event('dashboardLeadsFilterChanged'));
          }
        } catch (_) {}
        setDashboardLeadsFilter('state', dashboardDate, null, { state: effectiveName });
        onNavigate('leads');
      }
    }
  };

  const HEADER_GRADIENT = { background: 'linear-gradient(135deg, #2563EB 0%, #1ECAD3 100%)' };

  return (
    <div className="salesperson-dashboard-card overflow-hidden min-w-0 w-full rounded-xl border-2 transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'rgba(37, 99, 235, 0.25)' }}>
      <div className="relative overflow-hidden px-4 py-3 text-white" style={HEADER_GRADIENT}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <h3 className="relative z-10 text-base font-bold m-0">Geographic Performance</h3>
        <p className="relative z-10 text-xs font-medium text-white/90 mt-0.5 m-0">Region-wise lead distribution · Click state for details</p>
      </div>
      <div className="card-inner-padding flex flex-col gap-4">
        <IndiaMapView
          stateCountMap={stateCountMap}
          stateMetaMap={stateMetaMap}
          onStateClick={handleStateClick}
        />

        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] flex-wrap">
          <span className="font-medium">Legend (heatmap):</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#93c5fd' }} /> Low</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#2dd4bf' }} /> Medium</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} /> High</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#fb923c' }} /> Very High</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} /> Extreme</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-[var(--border)] text-[12px] bg-[var(--bg-card)]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-muted)]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-[var(--border)] text-[11px] py-1.5 px-2 bg-[var(--bg-card)] text-[var(--text-primary)]"
            >
              <option value={SORT_LEADS}>By Leads</option>
              <option value={SORT_REVENUE}>By Revenue</option>
            </select>
          </div>
        </div>

        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-card)] min-w-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-secondary)]">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 text-left text-[12px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {collapsed ? `Top ${TOP_N} states` : 'All states'}
            </button>
            {hasMore && collapsed && (
              <button
                type="button"
                onClick={() => setViewAllOpen(true)}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 px-3 py-2 shrink-0"
              >
                View All ({filteredAndSorted.length})
              </button>
            )}
          </div>
          <div className="max-h-[220px] overflow-auto relative">
            <table className="w-full min-w-[560px] text-[12px] border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="sticky top-0 z-10 text-left py-2 px-2 font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)]">State</th>
                  <th className="sticky top-0 z-10 text-right py-2 px-2 font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)]">Leads</th>
                  <th className="sticky top-0 z-10 text-right py-2 px-2 font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)]">Orders</th>
                  <th className="sticky top-0 z-10 text-right py-2 px-2 font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)]">Revenue</th>
                  <th className="sticky top-0 z-10 text-right py-2 px-2 font-semibold text-[var(--text-secondary)] bg-[var(--surface-secondary)]">Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((s) => {
                  const count = s.customerCount || 0;
                  const pct = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : '0';
                  const rev = typeof s.revenue === 'number' ? s.revenue : Number(s.revenue) || 0;
                  return (
                    <tr
                      key={s.state}
                      className="border-b border-[var(--border)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
                      onClick={() => handleStateClick(s.state, normalizeStateName(s.state))}
                    >
                      <td className="py-2 px-2 font-medium text-[var(--text-primary)] truncate max-w-[140px]">{s.state}</td>
                      <td className="py-2 px-2 text-right font-semibold text-[var(--text-primary)] tabular-nums">{count}</td>
                      <td className="py-2 px-2 text-right text-[var(--text-secondary)] tabular-nums">{s.orders ?? 0}</td>
                      <td className="py-2 px-2 text-right text-[var(--text-secondary)] tabular-nums">{formatCurrency(rev)}</td>
                      <td className="py-2 px-2 text-right text-[var(--text-muted)] tabular-nums">{Number(s.conversionPct ?? 0).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewAllOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setViewAllOpen(false)} aria-hidden />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">All States</h3>
              <button type="button" onClick={() => setViewAllOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)]">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 px-2 font-semibold text-[var(--text-secondary)]">State</th>
                    <th className="text-right py-2 px-2 font-semibold text-[var(--text-secondary)]">Leads</th>
                    <th className="text-right py-2 px-2 font-semibold text-[var(--text-secondary)]">Orders</th>
                    <th className="text-right py-2 px-2 font-semibold text-[var(--text-secondary)]">Revenue</th>
                    <th className="text-right py-2 px-2 font-semibold text-[var(--text-secondary)]">Conversion %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map((s) => {
                    const count = s.customerCount || 0;
                    const rev = typeof s.revenue === 'number' ? s.revenue : Number(s.revenue) || 0;
                    return (
                      <tr
                        key={s.state}
                        className="border-b border-[var(--border)] hover:bg-[var(--surface-secondary)]"
                        onClick={() => { handleStateClick(s.state, normalizeStateName(s.state)); setViewAllOpen(false); }}
                      >
                        <td className="py-2 px-2 font-medium text-[var(--text-primary)]">{s.state}</td>
                        <td className="py-2 px-2 text-right font-semibold tabular-nums">{count}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{s.orders ?? 0}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(rev)}</td>
                        <td className="py-2 px-2 text-right tabular-nums">{Number(s.conversionPct ?? 0).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {drawerState && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawerState(null)} aria-hidden />
          <div
            className="fixed top-0 bottom-0 right-0 bg-white shadow-xl z-50 flex flex-col"
            style={{ left: 'max(240px, calc(100vw - 24rem))' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Leads in {drawerState.stateName}</h3>
              <button type="button" onClick={() => setDrawerState(null)} className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)]">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="rounded-lg bg-[var(--bg-muted)] p-3">
                  <div className="text-[var(--text-muted)] font-medium">Leads</div>
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{drawerState.leads}</div>
                </div>
                <div className="rounded-lg bg-[var(--bg-muted)] p-3">
                  <div className="text-[var(--text-muted)] font-medium">Orders</div>
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{drawerState.orders}</div>
                </div>
                <div className="rounded-lg bg-[var(--bg-muted)] p-3 col-span-2">
                  <div className="text-[var(--text-muted)] font-medium">Revenue</div>
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{formatCurrency(drawerState.revenue)}</div>
                </div>
                <div className="rounded-lg bg-[var(--bg-muted)] p-3 col-span-2">
                  <div className="text-[var(--text-muted)] font-medium">Conversion</div>
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{Number(drawerState.conversionPct).toFixed(1)}%</div>
                </div>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('filter', 'state');
                    params.set('state', drawerState?.stateName || 'Unknown');
                    if (dashboardDate) params.set('date', dashboardDate);
                    onNavigate(`/customers?${params.toString()}`);
                    setDrawerState(null);
                  }}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-[12px] font-semibold hover:bg-indigo-500"
                >
                  View leads
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default GeoDistributionCompact;
