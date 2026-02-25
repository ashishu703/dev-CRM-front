import React, { useMemo } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function DataTable({
  columns,
  data,
  keyExtractor = (row) => row.id,
  isLoading = false,
  emptyMessage = 'No data',
  isDarkMode = false,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  totalCount,
  className = '',
}) {
  const paginatedData = useMemo(() => {
    if (!pageSize || !data?.length) return data || [];
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = useMemo(
    () => (totalCount != null ? Math.ceil(totalCount / pageSize) : Math.ceil((data?.length || 0) / pageSize)),
    [totalCount, data?.length, pageSize]
  );

  if (isLoading) {
    return (
      <div className={cx('animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 h-48', className)} />
    );
  }

  if (!data?.length) {
    return (
      <div
        className={cx(
          'py-12 text-center text-sm',
          isDarkMode ? 'text-gray-400' : 'text-gray-500',
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  const rows = totalCount != null ? paginatedData : (paginatedData.length ? paginatedData : data);

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id || col.key}
                  className={cx(
                    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider',
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={isDarkMode ? 'bg-gray-900 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
            {rows.map((row) => (
              <tr key={keyExtractor(row)} className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                {columns.map((col) => (
                  <td
                    key={col.id || col.key}
                    className={cx(
                      'px-4 py-3 text-sm whitespace-nowrap',
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    )}
                  >
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className={cx('flex items-center justify-between px-4 py-2 border-t', isDarkMode ? 'border-gray-700' : 'border-gray-200')}>
          <span className={cx('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
