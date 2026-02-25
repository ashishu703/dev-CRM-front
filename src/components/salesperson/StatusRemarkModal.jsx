import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function StatusRemarkModal({
  open,
  onClose,
  type,
  selectedStatus,
  initialRemark,
  onSave,
  isDarkMode = false,
}) {
  const [remark, setRemark] = useState(initialRemark || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setRemark(initialRemark || '');
  }, [open, initialRemark]);

  const title = type === 'sales' ? 'Update Sales Status' : 'Update Follow-up Status';
  const label = type === 'sales' ? 'Sales Status' : 'Follow-up Status';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(remark?.trim() || '');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRemark(initialRemark || '');
    onClose();
  };

  if (!open) return null;

  const displayStatus = (selectedStatus || '').toString().trim() || '—';

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleCancel} aria-hidden />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <button
              type="button"
              onClick={handleCancel}
              className={`p-1 rounded-lg ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
              </label>
              <div
                className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              >
                {displayStatus.toUpperCase().replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Remark <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add a remark..."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500' : 'border-gray-200 text-gray-800'
                }`}
              />
            </div>
          </div>
          <div className={`flex justify-end gap-2 p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={handleCancel}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
