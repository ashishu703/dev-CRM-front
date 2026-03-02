import React from 'react';
import { getActionRules, DELIVERY_STATUS } from '../constants/actionRules';

const BADGE_CLASS = {
  [DELIVERY_STATUS.DELIVERED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [DELIVERY_STATUS.PENDING]: 'bg-amber-100 text-amber-800 border-amber-200',
  [DELIVERY_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  [DELIVERY_STATUS.PARTIAL_DELIVERED]: 'bg-sky-100 text-sky-800 border-sky-200',
};

const OPTIONS = [
  { value: DELIVERY_STATUS.PENDING, label: 'Pending' },
  { value: DELIVERY_STATUS.DELIVERED, label: 'Delivered' },
  { value: DELIVERY_STATUS.PARTIAL_DELIVERED, label: 'Partial Delivered' },
  { value: DELIVERY_STATUS.CANCELLED, label: 'Cancel' },
];

/**
 * Status badge: read-only when delivered/cancelled, dropdown when editable.
 */
export default function StatusBadge({ value, onChange, editable }) {
  const status = (value || DELIVERY_STATUS.PENDING).toString().trim();
  const rules = getActionRules(status);
  const canEdit = editable && rules.editable;
  const cls = BADGE_CLASS[status] || 'bg-gray-100 text-gray-800 border-gray-200';

  if (canEdit && onChange) {
    return (
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className={`min-w-[100px] sm:min-w-[120px] px-2 py-1 text-xs font-medium rounded border cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 whitespace-nowrap ${cls}`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium whitespace-nowrap shrink-0 ${cls}`}>
      {OPTIONS.find((o) => o.value === status)?.label ?? status}
    </span>
  );
}
