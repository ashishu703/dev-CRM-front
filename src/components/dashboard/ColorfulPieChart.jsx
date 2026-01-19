import React, { useMemo } from 'react';

const ColorfulPieChart = ({ data, title, total, allData: allDataProp, size = 200 }) => {
  const radius = size / 2 - 20;
  const center = size / 2;

  // Format large numbers for display
  const formatNumber = (num, isCurrency = false) => {
    const prefix = isCurrency ? '₹' : '';
    if (num >= 10000000) {
      return `${prefix}${(num / 10000000).toFixed(2)}Cr`;
    } else if (num >= 100000) {
      return `${prefix}${(num / 100000).toFixed(2)}L`;
    } else if (num >= 1000) {
      return `${prefix}${(num / 1000).toFixed(1)}K`;
    }
    return isCurrency ? `${prefix}${num.toLocaleString('en-IN')}` : num.toLocaleString('en-IN');
  };

  // Check if this is a payment-related chart
  const isPaymentChart = title && (title.toLowerCase().includes('payment') || title.toLowerCase().includes('amount'));

  // Filter segments for pie chart (only show non-zero values in chart)
  // Data is already filtered before passing to component (like Total Leads Distribution)
  const segments = useMemo(() => data.filter(item => (item.value || 0) > 0), [data]);
  
  // For legend, use allData prop if provided (includes zeros), otherwise use segments
  const allData = useMemo(() => {
    if (allDataProp && Array.isArray(allDataProp)) {
      return allDataProp.filter(item => item.value !== null && item.value !== undefined);
    }
    return segments;
  }, [allDataProp, segments]);

  const paths = useMemo(() => {
    if (segments.length === 0) return [];
    
    // Use original total if provided, otherwise calculate from segments
    const segmentTotal = segments.reduce((sum, item) => sum + (item.value || 0), 0);
    const effectiveTotal = total > 0 ? total : segmentTotal;
    
    if (effectiveTotal === 0) return [];
    
    // If only one segment and it's 100%, make it a full circle
    if (segments.length === 1 && segmentTotal === effectiveTotal) {
      const item = segments[0];
      const centerX = center;
      const centerY = center;
      
      // Full circle path - draw complete 360 degree circle
      // Start from top, draw two arcs to complete the circle
      const topY = centerY - radius;
      const bottomY = centerY + radius;
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${centerX} ${topY}`,
        `A ${radius} ${radius} 0 1 1 ${centerX} ${bottomY}`,
        `A ${radius} ${radius} 0 1 1 ${centerX} ${topY}`,
        'Z'
      ].join(' ');
      
      return [{ pathData, color: item.color, label: item.label, value: item.value }];
    }
    
    let cumulativePercentage = 0;
    const result = segments.map((item) => {
      const itemValue = item.value || 0;
      const percentage = effectiveTotal > 0 ? (itemValue / effectiveTotal) * 100 : 0;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      cumulativePercentage += percentage;

      const centerX = center;
      const centerY = center;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = percentage > 50 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      return { pathData, color: item.color, label: item.label, value: item.value };
    });
    
    return result;
  }, [segments, total, radius, center]);

  // Enhanced color palette with gradients
  const enhancedColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200" style={{
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    }}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{title}</h3>
        </div>
      )}
      <div className="flex items-center justify-center h-64">
        {paths.length > 0 ? (
          <div className="relative" style={{ width: size, height: size }}>
            <svg 
              width={size} 
              height={size} 
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              <defs>
                {paths.map((path, index) => {
                  const gradientId = `gradient-${index}`;
                  const colors = [
                    ['#667eea', '#764ba2'],
                    ['#f093fb', '#f5576c'],
                    ['#4facfe', '#00f2fe'],
                    ['#43e97b', '#38f9d7'],
                    ['#fa709a', '#fee140'],
                    ['#30cfd0', '#330867'],
                    ['#a8edea', '#fed6e3'],
                    ['#ff9a9e', '#fecfef'],
                  ];
                  const colorPair = colors[index % colors.length];
                  return (
                    <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colorPair[0]} />
                      <stop offset="100%" stopColor={colorPair[1]} />
                    </linearGradient>
                  );
                })}
              </defs>
              {paths.map((path, index) => {
                const gradientId = `gradient-${index}`;
                return (
                  <path
                    key={index}
                    d={path.pathData}
                    fill={`url(#${gradientId})`}
                    stroke="white"
                    strokeWidth="3"
                    className="transition-all duration-300 hover:opacity-90 hover:scale-105"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif', lineHeight: '1.2' }}>
                  {formatNumber(total > 0 ? total : segments.reduce((sum, item) => sum + (item.value || 0), 0), isPaymentChart)}
                </div>
                <div className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">Total</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No data available</div>
        )}
      </div>
      {allData.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 mt-6">
          {allData.map((item, index) => {
            const colors = [
              ['#667eea', '#764ba2'],
              ['#f093fb', '#f5576c'],
              ['#4facfe', '#00f2fe'],
              ['#43e97b', '#38f9d7'],
              ['#fa709a', '#fee140'],
              ['#30cfd0', '#330867'],
              ['#a8edea', '#fed6e3'],
              ['#ff9a9e', '#fecfef'],
            ];
            const colorPair = colors[index % colors.length];
            const displayValue = typeof item.value === 'number' && item.value > 1000000 
              ? `₹${(item.value / 1000000).toFixed(2)}M`
              : typeof item.value === 'number' && item.value > 1000
              ? `₹${(item.value / 1000).toFixed(1)}K`
              : typeof item.value === 'number'
              ? `₹${item.value.toLocaleString('en-IN')}`
              : item.value || 0;
            return (
              <div key={index} className="flex items-center justify-between space-x-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div 
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                    style={{ 
                      backgroundColor: colorPair[0]
                    }}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.label}
                  </span>
                </div>
                <span className="text-sm text-gray-600 font-semibold whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ColorfulPieChart;

