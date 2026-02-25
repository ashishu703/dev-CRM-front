import React from 'react';

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export default function TargetSummary({ isSalesperson, targetSummary, targetList }) {
  if (isSalesperson) {
    const { totalTarget, achieved, remaining, progressPct } = targetSummary || {};
    const pct = Math.min(100, Math.max(0, Number(progressPct) || (totalTarget ? (achieved / totalTarget) * 100 : 0)));
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Total Target</div>
            <div className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(totalTarget || 0)}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Achieved</div>
            <div className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(achieved || 0)}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Remaining</div>
            <div className="mt-1 text-xl font-bold text-amber-600">
              {formatCurrency(remaining != null ? remaining : (Number(totalTarget || 0) - Number(achieved || 0)))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">% Completion</div>
            <div className="mt-1 text-xl font-bold text-indigo-600">{pct.toFixed(1)}%</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: pct + '%' }} />
          </div>
        </div>
      </div>
    );
  }

  const list = targetList || [];
  return (
    <div className="p-6 overflow-x-auto">
      <table className="min-w-[500px] w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 tracking-wider">Salesperson</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600 tracking-wider">Target</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600 tracking-wider">Achieved</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600 tracking-wider">Remaining</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600 tracking-wider">Progress %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {list.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-sm text-gray-500 text-center" colSpan={5}>No target data</td>
            </tr>
          ) : (
            list.map((row, i) => (
              <tr key={row.salespersonName + i} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.salespersonName}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(row.target)}</td>
                <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">{formatCurrency(row.achieved)}</td>
                <td className="px-4 py-3 text-sm text-right text-amber-600">{formatCurrency(row.remaining)}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-indigo-600">
                  {Number(row.progressPct || 0).toFixed(1)}%
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
