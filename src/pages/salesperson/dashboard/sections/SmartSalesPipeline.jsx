import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

const GRID_STROKE = 'rgba(255,255,255,0.05)';

const SmartSalesPipeline = memo(function SmartSalesPipeline({ pipeline }) {
  if (!pipeline) return null;

  const { stages = [], conversionPct = 0, dropRate = 0, velocity = 0, totalConversion = 0 } = pipeline;

  const barData = stages.filter((s) => (s.count || 0) > 0).length > 0
    ? stages.map((s) => ({ name: s.name, count: s.count || 0 }))
    : [];

  const hasData = barData.some((d) => d.count > 0);

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-2xl font-bold tracking-tight text-slate-100">Sales Health · Smart Pipeline</h3>
        <p className="text-slate-400 text-sm mt-0.5">Stage count · Conversion % · Drop rate · Velocity</p>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-5 text-sm">
          <span className="text-slate-400">Conversion: <span className="text-slate-100 font-semibold">{conversionPct}%</span></span>
          <span className="text-slate-400">Drop: <span className="text-slate-100 font-semibold">{dropRate}%</span></span>
          <span className="text-slate-400">Velocity: <span className="text-slate-100 font-semibold">{velocity}</span> days</span>
          <span className="text-slate-400">Won: <span className="text-emerald-400 font-semibold">{totalConversion}</span></span>
        </div>
        <div className="h-56">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pipelineBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="count" fill="url(#pipelineBarGradient)" radius={[6, 6, 0, 0]} name="Count" />
                <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#1e293b', stroke: '#F59E0B' }} name="Conversion flow" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
});

export default SmartSalesPipeline;
