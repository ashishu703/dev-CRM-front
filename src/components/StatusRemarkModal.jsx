import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStatusBadge } from '../utils/statusUtils';

export default function StatusRemarkModal({
  open,
  onClose,
  type,
  status,
  initialRemark = '',
  onSave,
  onCancel,
}) {
  const [remark, setRemark] = useState(initialRemark);

  useEffect(() => {
    if (open) setRemark(initialRemark || '');
  }, [open, initialRemark]);

  const handleSave = () => {
    onSave?.(status, (remark || '').trim());
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  if (!open) return null;

  const label = type === 'sales' ? 'Sales Status' : 'Follow-up Status';
  const badgeEl = getStatusBadge((status || '').toString().trim() || 'PENDING', type === 'sales' ? 'sales' : 'telecaller');
  const badgeClasses = badgeEl?.props?.className || 'bg-gray-100 text-gray-800';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[160]" onClick={handleCancel} aria-hidden="true" />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[161] w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
          <button type="button" onClick={handleCancel} className="p-1 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
            {(status || 'PENDING').toString().toUpperCase().replace(/_/g, ' ')}
          </span>
        </div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Remark (optional)</label>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Add a remark..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 px-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
