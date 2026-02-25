import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChevronRight } from 'lucide-react';

const PaymentRiskMonitor = memo(function PaymentRiskMonitor({ paymentRisk, isDarkMode }) {
  if (!paymentRisk) return null;

  const { agingBuckets = [], totalAmount = 0, totalClients = 0, delayReasons = [], paymentDelaysList = [] } = paymentRisk;

  const total = agingBuckets.reduce((s, b) => s + (b.amount || 0), 0) || 1;
  const pieData = agingBuckets.map((b, i) => ({
    name: b.label,
    value: b.amount || 0,
    clientCount: b.clientCount || 0,
    color: ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e'][i] || '#6b7280',
  }));

  const formatCr = (n) => {
    const num = Number(n);
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(1)}L`;
    if (num >= 1e3) return `₹${(num / 1e3).toFixed(1)}K`;
    return `₹${num}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        className={`rounded-xl border p-4 ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Aging Tracker
        </h3>
        <div className="flex items-center gap-4">
          <div className="h-40 w-40 shrink-0">
            {pieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [`${formatCr(value)} · ${props.payload.clientCount} clients`, name]}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-full flex items-center justify-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No aging data
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCr(totalAmount)}
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Revenue at risk
            </div>
            <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {totalClients} clients
            </div>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border p-4 ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Payment Delays
        </h3>
        <ul className="space-y-2">
          {delayReasons.map((r) => (
            <li
              key={r.id || r.label}
              className={`flex items-center justify-between text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              <span>{r.label}</span>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </li>
          ))}
        </ul>
        {paymentDelaysList.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Recent delays
            </div>
            <ul className="space-y-1.5 max-h-32 overflow-y-auto">
              {paymentDelaysList.slice(0, 5).map((d, i) => (
                <li key={i} className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="truncate">{d.clientName}</span>
                  <span className="shrink-0 ml-2">{formatCr(d.amount)} · {d.agingDays}d</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

export default PaymentRiskMonitor;
