import React from 'react';
import StatCard from './StatCard';
import { Users, Percent, AlertCircle, IndianRupee } from 'lucide-react';

const KeyPerformanceMetrics = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Leads',
      value: metrics.totalLeads,
      change: 12,
      changeType: 'positive',
      icon: Users,
      color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', value: 'text-blue-600' },
      description: 'Active leads this month'
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      change: metrics.conversionRateChange,
      changeType: 'positive',
      icon: Percent,
      color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', value: 'text-green-600' },
      description: 'Above target of 20%'
    },
    {
      title: 'Pending Rate',
      value: `${metrics.pendingRate}%`,
      change: Math.abs(metrics.pendingRateChange),
      changeType: metrics.pendingRateChange < 0 ? 'positive' : 'negative',
      icon: AlertCircle,
      color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', value: 'text-orange-600' },
      description: 'Leads requiring follow-up'
    },
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      change: 0,
      changeType: 'positive',
      icon: IndianRupee,
      color: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', value: 'text-purple-600' },
      description: 'Revenue from payment received'
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Metrics</h3>
      <p className="text-sm text-gray-600 mb-4">Critical business indicators and trends</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default KeyPerformanceMetrics;

