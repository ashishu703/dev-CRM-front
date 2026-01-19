
import React from 'react';

const LeadStatusRow = React.memo(({ 
  lead, 
  onEdit, 
  onViewTimeline,
  getStatusBadge,
  getFollowUpBadge 
}) => {
  const handleEdit = React.useCallback(() => {
    onEdit(lead);
  }, [lead, onEdit]);

  const handleViewTimeline = React.useCallback(() => {
    onViewTimeline(lead);
  }, [lead, onViewTimeline]);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900">{lead.customerId || lead.id}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.name || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{lead.city || 'N/A'}</td>
      <td className="px-4 py-3">
        {getStatusBadge(lead.lastStatus || lead.sales_status)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            Q: {lead.quotationCount || 0}
          </span>
          <span className="text-xs text-gray-600">
            PI: {lead.piCount || 0}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleViewTimeline}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Timeline
          </button>
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.sales_status === nextProps.lead.sales_status &&
    prevProps.lead.quotationCount === nextProps.lead.quotationCount &&
    prevProps.lead.piCount === nextProps.lead.piCount &&
    prevProps.lead.name === nextProps.lead.name &&
    prevProps.lead.phone === nextProps.lead.phone
  );
});

LeadStatusRow.displayName = 'LeadStatusRow';

export default LeadStatusRow;

