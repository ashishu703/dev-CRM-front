'use strict';

import React from 'react';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  overdue: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  running: 'bg-amber-100 text-amber-800',
  assigned: 'bg-slate-100 text-slate-800',
};

function getStatusClass(status) {
  const key = String(status || 'pending').toLowerCase();
  return STATUS_STYLES[key] ?? 'bg-slate-100 text-slate-700';
}

const StatusBadge = React.memo(function StatusBadge({ status, label, className = '' }) {
  const display = label ?? (status ? String(status).replace(/_/g, ' ') : '');
  if (!display) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${getStatusClass(status)} ${className}`}
    >
      {display}
    </span>
  );
});

export default StatusBadge;
export { getStatusClass };
