import React from 'react';

const PieChart = ({ data, title, total, size = 192 }) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;
  const segments = data.filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center justify-center h-64">
        {total > 0 ? (
          <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
              {segments.map((item, index) => {
                const percentage = item.value / total;
                const strokeDasharray = `${circumference * percentage} ${circumference}`;
                const strokeDashoffset = -circumference * offset;
                offset += percentage;
                
                return (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No data available</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {segments.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm text-gray-600">{item.label} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;

