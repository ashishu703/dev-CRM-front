import React from 'react';
import { useMonth } from '../context/MonthContext';

const MonthSelector = ({ className = '', showLabel = true }) => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    monthDisplay, 
    isCurrentMonth,
    isMonthClosed,
    monthUtils,
    availableMonths 
  } = useMonth();

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    if (monthUtils.isValidMonth(newMonth)) {
      setSelectedMonth(newMonth);
    }
  };

  const goToPreviousMonth = () => {
    const prevMonth = monthUtils.getPreviousMonth(selectedMonth);
    setSelectedMonth(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = monthUtils.getNextMonth(selectedMonth);
    if (!monthUtils.isMonthClosed(nextMonth)) {
      setSelectedMonth(nextMonth);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">Month:</span>
      )}
      
      {/* Previous Month Button */}
      <button
        onClick={goToPreviousMonth}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Previous Month"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Month Dropdown */}
      <select
        value={selectedMonth}
        onChange={handleMonthChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
      >
        {availableMonths.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>

      {/* Next Month Button */}
      <button
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Next Month"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Month Status Indicators */}
      <div className="flex items-center space-x-2">
        {isCurrentMonth && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Current
          </span>
        )}
        {isMonthClosed && (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Closed
          </span>
        )}
      </div>

      {/* Display Current Selection */}
      <div className="text-sm font-semibold text-gray-900">
        {monthDisplay}
      </div>
    </div>
  );
};

export default MonthSelector;
