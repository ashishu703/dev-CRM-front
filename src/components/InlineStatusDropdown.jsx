import React, { useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getStatusBadge } from '../utils/statusUtils';
import { SALES_OPTIONS } from '../constants/leadStatusOptions';
import { useClickOutside } from '../hooks/useClickOutside';

const InlineStatusDropdown = ({
  value,
  onChange,
  disabled = false,
  leadId,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setOpen(false), open);

  const displayValue = (value || '').toString().trim() || 'PENDING';

  const isSelected = (opt) => {
    const v = (value || '').toString().trim().toUpperCase();
    const o = opt.toUpperCase();
    return v === o || v.replace(/_/g, ' ') === o || o.replace(/_/g, ' ') === v;
  };

  const handleSelect = (opt) => {
    if (!isSelected(opt)) onChange?.(leadId, opt);
    setOpen(false);
  };

  const badgeEl = getStatusBadge(displayValue, 'sales');
  const badgeClasses = badgeEl.props?.className || '';

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        className={`
          inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium
          ${badgeClasses}
          ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:ring-2 hover:ring-offset-0.5 hover:ring-gray-300'}
        `}
      >
        {(displayValue || 'PENDING').toUpperCase().replace(/_/g, ' ')}
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-0.5 z-50 min-w-[140px] py-0.5
            bg-white border border-gray-200 rounded shadow-lg"
        >
          {SALES_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`
                w-full text-left px-2 py-1 text-[10px] font-medium flex items-center justify-between
                hover:bg-amber-50/80
                ${isSelected(opt) ? 'bg-amber-100/90 text-amber-900' : 'text-gray-700'}
              `}
            >
              <span>{opt}</span>
              {isSelected(opt) && <Check className="w-3 h-3 text-gray-700 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InlineStatusDropdown;
