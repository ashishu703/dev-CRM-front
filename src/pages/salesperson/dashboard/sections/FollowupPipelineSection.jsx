import React, { memo, useMemo } from 'react';
import { MousePointerClick } from 'lucide-react';

const STAGES_ORDER = [
  'APPOINTMENT SCHEDULED',
  'NOT INTERESTED',
  'INTERESTED',
  'QUOTATION SENT',
  'NEGOTIATION',
  'CLOSE ORDER',
  'CLOSED/LOST',
  'CALL BACK REQUEST',
  'UNREACHABLE/CALL NOT CONNECTED',
  'CURRENTLY NOT REQUIRED',
  'NOT RELEVANT',
];

const STAGE_LABEL = {
  'APPOINTMENT SCHEDULED': 'APPOINTMENT SCHEDULED',
  'NOT INTERESTED': 'NOT INTERESTED',
  'INTERESTED': 'INTERESTED',
  'QUOTATION SENT': 'QUOTATION SENT',
  'NEGOTIATION': 'NEGOTIATION',
  'CLOSE ORDER': 'CLOSE ORDER',
  'CLOSED/LOST': 'CLOSED/LOST',
  'CALL BACK REQUEST': 'CALL BACK REQUEST',
  'UNREACHABLE/CALL NOT CONNECTED': 'UNREACHABLE/CALL NOT CONNECTED',
  'CURRENTLY NOT REQUIRED': 'CURRENTLY NOT REQUIRED',
  'NOT RELEVANT': 'NOT RELEVANT',
};

const STAGE_STYLES = {
  'APPOINTMENT SCHEDULED': { dot: '#6366f1', soft: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  'NOT INTERESTED': { dot: '#ef4444', soft: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  'INTERESTED': { dot: '#22c55e', soft: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  'QUOTATION SENT': { dot: '#8b5cf6', soft: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
  'NEGOTIATION': { dot: '#f59e0b', soft: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
  'CLOSE ORDER': { dot: '#10b981', soft: 'bg-teal-50 border-teal-200', text: 'text-teal-800' },
  'CLOSED/LOST': { dot: '#f43f5e', soft: 'bg-pink-50 border-pink-200', text: 'text-pink-800' },
  'CALL BACK REQUEST': { dot: '#0ea5e9', soft: 'bg-sky-50 border-sky-200', text: 'text-sky-800' },
  'UNREACHABLE/CALL NOT CONNECTED': { dot: '#64748b', soft: 'bg-[var(--surface-secondary)] border-[var(--border)]', text: 'text-[var(--text-muted)]' },
  'CURRENTLY NOT REQUIRED': { dot: '#a855f7', soft: 'bg-fuchsia-50 border-fuchsia-200', text: 'text-fuchsia-800' },
  'NOT RELEVANT': { dot: '#94a3b8', soft: 'bg-[var(--surface-secondary)] border-[var(--border)]', text: 'text-[var(--text-muted)]' },
};

const FollowupPipelineSection = memo(function FollowupPipelineSection({ salesPipelineStrip, onStageClick }) {
  const stageByKey = useMemo(() => {
    const m = new Map();
    for (const s of salesPipelineStrip || []) {
      const k = (s?.key || s?.label || '').toString().trim().toUpperCase();
      if (!k) continue;
      m.set(k, s);
    }
    return m;
  }, [salesPipelineStrip]);

  const rows = useMemo(() => {
    return STAGES_ORDER.map((key) => {
      const raw = stageByKey.get(key);
      const count = Number(raw?.count) || 0;
      return { key, label: STAGE_LABEL[key] || key, count };
    });
  }, [stageByKey]);

  const total = rows.reduce((s, r) => s + (r.count || 0), 0);

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3>Followup Pipeline</h3>
          <p>Click a stage to open only those leads</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
          <MousePointerClick className="w-4 h-4 text-[var(--primary-600)]" />
          <span className="font-semibold tabular-nums">Total: {total}</span>
        </div>
      </div>

      <div className="card-inner-padding">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {rows.map((r) => {
            const st = STAGE_STYLES[r.key] || STAGE_STYLES['UNREACHABLE/CALL NOT CONNECTED'];
            const click = onStageClick ? () => onStageClick(r.key) : null;
            return (
              <button
                key={r.key}
                type="button"
                onClick={click || undefined}
                className={`text-left rounded-xl border px-3 py-2.5 min-w-0 transition-all ${
                  st.soft
                } ${click ? 'hover:shadow-sm hover:-translate-y-[1px] cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className={`text-[10px] font-extrabold tracking-wide ${st.text} truncate`} title={r.label}>
                      {r.label}
                    </div>
                    <div className="mt-1 text-[18px] leading-none font-extrabold text-[var(--text-primary)] tabular-nums">
                      {r.count}
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: st.dot }} />
                </div>
                <div className="mt-2 text-[10px] text-[var(--text-secondary)] font-semibold">
                  {total > 0 ? `${Math.round((r.count / total) * 100)}%` : '0%'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default FollowupPipelineSection;

