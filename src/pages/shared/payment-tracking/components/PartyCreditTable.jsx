import React from 'react';

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 tracking-wider';

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function StatusBadge({ creditType }) {
  const isAdvance = creditType === 'advance';
  const cls = isAdvance
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-red-100 text-red-800 border-red-200';
  const label = isAdvance ? 'Advance Credit' : 'Outstanding Balance';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

export default function PartyCreditTable({ rows, showSalespersonColumn }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[600px] w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {showSalespersonColumn && <th className={th}>Salesperson</th>}
            <th className={th}>Party Name</th>
            <th className={`${th} text-right`}>Credit Balance</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-sm text-gray-500 text-center" colSpan={showSalespersonColumn ? 4 : 3}>
                No party credit data
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={(r.partyKey || r.partyName) + i} className="hover:bg-gray-50/50">
                {showSalespersonColumn && (
                  <td className="px-4 py-3 text-sm text-gray-700">{r.salespersonName || '—'}</td>
                )}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.partyName}</td>
                <td
                  className={`px-4 py-3 text-sm font-semibold text-right ${
                    r.creditType === 'advance' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {formatCurrency(r.creditBalance)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge creditType={r.creditType || 'advance'} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
