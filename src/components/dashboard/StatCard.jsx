import React from 'react';

const StatCard = ({ title, value, suffix = '', icon: Icon, color, change, changeType, description }) => {
  // Enhanced gradient colors based on card type
  const getGradientColors = () => {
    if (color?.bg?.includes('blue')) {
      return { from: 'from-blue-500', to: 'to-cyan-500', iconBg: 'bg-blue-500/20' };
    }
    if (color?.bg?.includes('green') || color?.bg?.includes('emerald')) {
      return { from: 'from-green-500', to: 'to-emerald-500', iconBg: 'bg-green-500/20' };
    }
    if (color?.bg?.includes('purple')) {
      return { from: 'from-purple-500', to: 'to-pink-500', iconBg: 'bg-purple-500/20' };
    }
    if (color?.bg?.includes('orange') || color?.bg?.includes('amber')) {
      return { from: 'from-orange-500', to: 'to-amber-500', iconBg: 'bg-orange-500/20' };
    }
    if (color?.bg?.includes('red') || color?.bg?.includes('rose')) {
      return { from: 'from-red-500', to: 'to-rose-500', iconBg: 'bg-red-500/20' };
    }
    if (color?.bg?.includes('indigo')) {
      return { from: 'from-indigo-500', to: 'to-purple-500', iconBg: 'bg-indigo-500/20' };
    }
    if (color?.bg?.includes('cyan')) {
      return { from: 'from-cyan-500', to: 'to-blue-500', iconBg: 'bg-cyan-500/20' };
    }
    // Default gradient
    return { from: 'from-blue-500', to: 'to-purple-500', iconBg: 'bg-blue-500/20' };
  };

  const gradients = getGradientColors();

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200`}
      style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${color?.text || 'text-gray-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </h3>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${color?.bg || 'bg-gray-100'} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${color?.text || 'text-gray-600'}`} />
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold mb-2 ${color?.value || 'text-gray-800'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
        {value}{suffix}
      </div>
      {change !== undefined && (
        <div className="flex items-center space-x-1 mb-1">
          <span className={`text-xs font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            {changeType === 'positive' ? '↑' : '↓'} {changeType === 'positive' ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>from last month</span>
        </div>
      )}
      {description && (
        <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{description}</p>
      )}
    </div>
  );
};

export default StatCard;

