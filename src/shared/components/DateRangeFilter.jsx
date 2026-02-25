import React from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isDarkMode = false,
  className = '',
}) {
  return (
    <div className={cx('flex flex-wrap items-center gap-2', className)}>
      <label className={cx('text-sm font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
        From
      </label>
      <input
        type="date"
        value={startDate || ''}
        onChange={(e) => onStartDateChange(e.target.value || null)}
        className={cx(
          'rounded border px-2 py-1 text-sm',
          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
        )}
      />
      <label className={cx('text-sm font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
        To
      </label>
      <input
        type="date"
        value={endDate || ''}
        onChange={(e) => onEndDateChange(e.target.value || null)}
        className={cx(
          'rounded border px-2 py-1 text-sm',
          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
        )}
      />
    </div>
  );
}

export default DateRangeFilter;
