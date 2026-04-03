import React from 'react';
import { Trash2 } from 'lucide-react';

export default function BulkQuotationDeleteBar({
  canDelete,
  selectedCount,
  onDelete,
  summaryLabel,
  className = '',
}) {
  if (!canDelete || selectedCount <= 0) return null;
  return (
    <div className={`flex items-center justify-between gap-3 mb-3 ${className}`.trim()}>
      <div className="text-xs text-slate-600">{summaryLabel}</div>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:brightness-110"
      >
        <Trash2 className="w-4 h-4" /> Delete Selected
      </button>
    </div>
  );
}
