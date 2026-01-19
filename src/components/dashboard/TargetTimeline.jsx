import React from 'react';
import StatCard from './StatCard';
import { Target, IndianRupee, Calendar } from 'lucide-react';

const TargetTimeline = ({ revenue }) => {
  const daysPeriod = revenue.targetStartDate 
    ? Math.ceil((new Date() - new Date(revenue.targetStartDate)) / (1000 * 60 * 60 * 24))
    : 0;
  
  const targetDescription = revenue.targetStartDate && revenue.targetEndDate
    ? `Revenue target (${new Date(revenue.targetStartDate).toLocaleDateString()} - ${new Date(revenue.targetEndDate).toLocaleDateString()})`
    : 'Revenue target (No target period set)';
  
  const achievedDescription = revenue.targetStartDate
    ? `Approved payments received (${daysPeriod} days period)`
    : 'Approved payments received';
  
  const cards = [
    {
      title: 'Revenue Target',
      value: `₹${(revenue.target || 0).toLocaleString()}`,
      icon: Target,
      color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', value: 'text-blue-600' },
      description: targetDescription
    },
    {
      title: 'Revenue Achieved',
      value: `₹${(revenue.achieved || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', value: 'text-green-600' },
      description: achievedDescription
    },
    {
      title: 'Days Left',
      value: revenue.daysLeft || 0,
      icon: Calendar,
      color: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', value: 'text-orange-600' },
      description: revenue.targetEndDate ? 'Remaining days in target period' : 'No target period set'
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Target & Timeline</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default TargetTimeline;

