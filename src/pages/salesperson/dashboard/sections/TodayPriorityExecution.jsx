import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Phone, Inbox, Loader2 } from 'lucide-react';

const PAGE_SIZE = 10;
const PRIORITY_BADGE = {
  Critical: 'bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 text-[10px] font-semibold',
  High: 'bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5 text-[10px] font-semibold',
  Medium: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 text-[10px] font-semibold',
  Low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 text-[10px] font-semibold',
  Other: 'bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full px-2 py-0.5 text-[10px] font-semibold',
};
const ROW_BORDER = {
  Critical: 'border-l-4 border-l-red-500',
  High: 'border-l-4 border-l-orange-500',
  Medium: 'border-l-4 border-l-blue-500',
  Low: 'border-l-4 border-l-blue-500',
  Other: 'border-l-4 border-l-slate-500',
};

const TodayPriorityExecution = memo(function TodayPriorityExecution({ todayPriority, onNavigate, isLoading }) {
  const { priorityLeads = [] } = todayPriority || {};
  const [shown, setShown] = useState(PAGE_SIZE);
  const scrollContainerRef = useRef(null);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(() => {
    setShown((n) => Math.min(n + PAGE_SIZE, priorityLeads.length));
  }, [priorityLeads.length]);

  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [priorityLeads.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container || priorityLeads.length <= PAGE_SIZE) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: container, rootMargin: '100px', threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, priorityLeads.length]);

  const handleCall = (item) => {
    if (onNavigate && item?.id) onNavigate('customers', item.id);
  };

  const slice = priorityLeads.slice(0, shown);
  const hasMore = priorityLeads.length > shown;

  const HEADER_GRADIENT = { background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)' };

  if (isLoading) {
    return (
      <div className="salesperson-dashboard-card p-0 overflow-hidden rounded-xl border-2 transition-all duration-300" style={{ borderColor: 'rgba(37, 99, 235, 0.25)' }}>
        <div className="relative overflow-hidden px-4 py-3 text-white" style={HEADER_GRADIENT}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <h3 className="relative z-10 text-base font-bold m-0">Lead Priority</h3>
        </div>
        <div className="card-inner-padding flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="salesperson-dashboard-card p-0 overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'rgba(37, 99, 235, 0.25)' }}>
      <div className="relative overflow-hidden px-4 py-3 text-white" style={HEADER_GRADIENT}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <h3 className="relative z-10 text-base font-bold m-0">Lead Priority</h3>
        <p className="relative z-10 text-xs font-medium text-white/90 mt-0.5 m-0">Action Intelligence — priority score, stage, last action & deal value</p>
      </div>
      <div className="card-inner-padding">
        {priorityLeads.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-[var(--text-primary)]">
            <Inbox className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-semibold">No data found</p>
            <p className="text-xs mt-1 opacity-80">No priority leads for the selected date</p>
          </div>
        ) : (
          <>
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto overflow-y-auto max-h-[320px] -mx-1 scroll-smooth"
            >
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-[var(--surface-secondary)]/95 backdrop-blur-sm z-10 border-b border-[var(--border)]">
                  <tr>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Priority</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Lead</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Business</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Deal</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Stage</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Last action</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Days since F/U</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-[var(--text-secondary)] text-[11px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((item) => {
                    const priority = item.priorityLabel || 'Other';
                    const borderClass = ROW_BORDER[priority] || ROW_BORDER.Other;
                    const pct = item.priorityPct ?? item.priorityScore ?? 0;
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-secondary)] ${borderClass}`}
                      >
                        <td className="py-2 px-2">
                          <span className="bg-[var(--primary-600)] text-white rounded-md px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                            {pct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-medium text-[var(--text-primary)]">{item.name || '—'}</td>
                        <td className="py-2.5 px-2 text-[var(--text-secondary)] truncate max-w-[100px]" title={item.business || ''}>{item.business || '—'}</td>
                        <td className="py-2.5 px-2 text-[var(--text-secondary)] font-medium tabular-nums">{item.valueFormatted || '—'}</td>
                        <td className="py-2.5 px-2 text-[var(--text-muted)] text-[10px]">{item.stageLabel || item.stage || '—'}</td>
                        <td className="py-2.5 px-2 text-[var(--text-muted)] tabular-nums">{item.lastActionDate || '—'}</td>
                        <td className="py-2.5 px-2 text-[var(--text-muted)] tabular-nums">{item.daysSinceFollowUp != null ? `${item.daysSinceFollowUp}d` : '—'}</td>
                        <td className="py-2 px-2">
                          <button
                            type="button"
                            onClick={() => handleCall(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {hasMore && <div ref={sentinelRef} className="h-4 flex-shrink-0" aria-hidden />}
            </div>
            {hasMore && (
              <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
                Scroll down to load more · Showing {slice.length} of {priorityLeads.length}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default TodayPriorityExecution;
