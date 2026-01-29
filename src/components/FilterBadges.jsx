import React from 'react';

const FilterBadges = ({ 
  quotationCounts, 
  piCounts, 
  loadingCounts, 
  statusFilter, 
  assignmentFilter,
  assignedCount,
  unassignedCount,
  onBadgeClick,
  onAssignmentFilter,
  onClearFilter,
  showQuotationPending = true,
  /** When false, hide entire Quotation filter block (e.g. Department Head – quotation approval not used) */
  showQuotationSection = true
}) => {
  const showQuotationInFilterText = showQuotationSection && statusFilter.type && statusFilter.status;
  const quotationFilterActive = showQuotationSection && statusFilter.type === 'quotation' && statusFilter.status;
  const piFilterActive = statusFilter.type === 'pi' && statusFilter.status;
  const hasActiveFilter = quotationFilterActive || piFilterActive || assignmentFilter;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-wrap gap-4">
        {showQuotationSection && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-700">Quotation:</span>
            <div className="flex flex-wrap gap-2">
              {showQuotationPending && (
                <button
                  onClick={() => onBadgeClick('quotation', 'pending')}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                    statusFilter.type === 'quotation' && statusFilter.status === 'pending'
                      ? 'bg-yellow-200 text-yellow-900 border-yellow-300 ring-2 ring-yellow-400'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                  }`}
                >
                  Sent for Approval ({loadingCounts ? '...' : quotationCounts.pending})
                </button>
              )}
              <button
                onClick={() => onBadgeClick('quotation', 'approved')}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                  statusFilter.type === 'quotation' && statusFilter.status === 'approved'
                    ? 'bg-green-200 text-green-900 border-green-300 ring-2 ring-green-400'
                    : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                }`}
              >
                Approved ({loadingCounts ? '...' : quotationCounts.approved})
              </button>
              <button
                onClick={() => onBadgeClick('quotation', 'rejected')}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                  statusFilter.type === 'quotation' && statusFilter.status === 'rejected'
                    ? 'bg-red-200 text-red-900 border-red-300 ring-2 ring-red-400'
                    : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                }`}
              >
                Rejected ({loadingCounts ? '...' : quotationCounts.rejected})
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-700">PI:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onBadgeClick('pi', 'pending')}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                statusFilter.type === 'pi' && statusFilter.status === 'pending'
                  ? 'bg-yellow-200 text-yellow-900 border-yellow-300 ring-2 ring-yellow-400'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
              }`}
            >
              Sent for Approval ({loadingCounts ? '...' : piCounts.pending})
            </button>
            <button
              onClick={() => onBadgeClick('pi', 'approved')}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                statusFilter.type === 'pi' && statusFilter.status === 'approved'
                  ? 'bg-green-200 text-green-900 border-green-300 ring-2 ring-green-400'
                  : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
              }`}
            >
              Approved ({loadingCounts ? '...' : piCounts.approved})
            </button>
            <button
              onClick={() => onBadgeClick('pi', 'rejected')}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                statusFilter.type === 'pi' && statusFilter.status === 'rejected'
                  ? 'bg-red-200 text-red-900 border-red-300 ring-2 ring-red-400'
                  : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
              }`}
            >
              Rejected ({loadingCounts ? '...' : piCounts.rejected})
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-700">Assignment:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAssignmentFilter(assignmentFilter === 'assigned' ? null : 'assigned')}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                assignmentFilter === 'assigned'
                  ? 'bg-blue-200 text-blue-900 border-blue-300 ring-2 ring-blue-400'
                  : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
              }`}
            >
              Assigned ({assignedCount})
            </button>
            <button
              onClick={() => onAssignmentFilter(assignmentFilter === 'unassigned' ? null : 'unassigned')}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                assignmentFilter === 'unassigned'
                  ? 'bg-gray-200 text-gray-900 border-gray-300 ring-2 ring-gray-400'
                  : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Unassigned ({unassignedCount})
            </button>
          </div>
        </div>
      </div>
      {hasActiveFilter && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-600">
            Filtering by: {showQuotationInFilterText && `${statusFilter.type === 'quotation' ? 'Quotation' : 'PI'} - ${statusFilter.status}`}
            {showQuotationInFilterText && assignmentFilter && ' | '}
            {assignmentFilter && `Assignment - ${assignmentFilter === 'assigned' ? 'Assigned' : 'Unassigned'}`}
          </span>
          <button
            onClick={onClearFilter}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBadges;

