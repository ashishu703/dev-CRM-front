import React, { memo } from 'react';
import { Phone, Send, User, Inbox } from 'lucide-react';

const PRIORITY_BADGE = {
  high: 'bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full px-3 py-1 text-sm font-bold',
  medium: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-3 py-1 text-sm font-bold',
  low: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold',
};

function getPriorityLevel(score) {
  if (score >= 85) return 'high';
  if (score >= 70) return 'medium';
  if (score >= 50) return 'low';
  return 'low';
}

const TodayActionBoard = memo(function TodayActionBoard({ todayPriority, onNavigate }) {
  if (!todayPriority) return null;

  const { priorityLeads = [] } = todayPriority;

  const handleCall = (item) => {
    if (onNavigate && item?.id) onNavigate('customers', item.id);
  };

  return (
    <div className="dashboard-card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">What You Must Do Today</h2>
        <p className="text-slate-400 text-sm mt-0.5">Priority leads · Deal value · Risk · Action</p>
      </div>
      <div className="p-6">
        {priorityLeads.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Inbox className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-2 font-semibold text-slate-400">Priority</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-400">Lead</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-400">Deal Value</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-400">Risk</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {priorityLeads.map((item) => {
                  const level = getPriorityLevel(item.priorityScore ?? 0);
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-2">
                        <span className={PRIORITY_BADGE[level]}>
                          {item.priorityScore ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="flex items-center gap-2 font-medium text-slate-100">
                          <User className="w-4 h-4 text-slate-500 shrink-0" />
                          {item.name}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-xl font-semibold text-emerald-400">
                        {item.valueFormatted || '—'}
                      </td>
                      <td className="py-4 px-2 text-slate-400">{item.riskLabel || item.subtitle || '—'}</td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCall(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCall(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white transition-opacity"
                          >
                            <Send className="w-3.5 h-3.5" /> Remind
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

export default TodayActionBoard;
