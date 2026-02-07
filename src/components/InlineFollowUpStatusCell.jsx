import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Clock } from 'lucide-react';
import { getStatusBadge } from '../utils/statusUtils';
import { FOLLOW_UP_OPTIONS } from '../constants/leadStatusOptions';
import { formatAppointmentDisplay } from '../utils/dateTimeUtils';
import { useClickOutside } from '../hooks/useClickOutside';

const InlineFollowUpStatusCell = ({
  value,
  leadId,
  followUpDate,
  followUpTime,
  followUpRemark,
  onChange,
  onAppointmentChange,
  disabled = false,
  isDarkMode = false,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [localDate, setLocalDate] = useState(followUpDate || '');
  const [localTime, setLocalTime] = useState(followUpTime || '');
  const dropdownRef = useRef(null);

  useEffect(() => {
    setLocalDate(followUpDate || '');
    setLocalTime(followUpTime || '');
  }, [followUpDate, followUpTime]);

  const displayValue = (value || '').toString().trim() || '';
  const isAppointmentScheduled = /appointment\s*scheduled/i.test(displayValue);
  const hasAppointment = isAppointmentScheduled && (followUpDate || followUpTime);
  const appointmentText = formatAppointmentDisplay(followUpDate, followUpTime);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (showDateInput && (localDate || localTime)) {
      onAppointmentChange?.(leadId, { followUpDate: localDate, followUpTime: localTime });
    }
    setShowDateInput(false);
  }, [showDateInput, localDate, localTime, leadId, onAppointmentChange]);

  useClickOutside(dropdownRef, handleClose, open || showDateInput);

  const isSelected = (opt) => {
    const v = (value || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
    const o = opt.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ');
    return v === o || v.replace(/\//g, ' / ') === o.replace(/\//g, ' / ');
  };

  const handleSelect = (opt) => {
    if (!isSelected(opt)) {
      onChange?.(leadId, opt);
      if (/appointment\s*scheduled/i.test(opt)) {
        setLocalDate(followUpDate || '');
        setLocalTime(followUpTime || '');
        setShowDateInput(true);
      }
    }
    setOpen(false);
  };

  const handleSaveAppointment = () => {
    onAppointmentChange?.(leadId, { followUpDate: localDate, followUpTime: localTime });
    setShowDateInput(false);
  };

  const badgeEl = getStatusBadge(displayValue || 'PENDING', 'telecaller');
  const badgeClasses = badgeEl?.props?.className || 'bg-gray-100 text-gray-800';

  const showDateTimeInputs = showDateInput || (isAppointmentScheduled && !hasAppointment);

  return (
    <div ref={dropdownRef} className={`space-y-0.5 relative ${className}`}>
      <div className="flex flex-wrap items-center gap-1">
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
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-0.5 z-50 min-w-[180px] py-0.5 bg-white border border-gray-200 rounded shadow-lg">
          {FOLLOW_UP_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className="w-full text-left px-2 py-1 text-[10px] font-medium flex items-center justify-between hover:bg-amber-50/80 text-gray-700"
            >
              <span>{opt}</span>
              {isSelected(opt) && <Check className="w-3 h-3 text-gray-700 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {showDateTimeInputs && (
        <div className="flex flex-wrap items-center gap-1">
          <input
            type="date"
            value={localDate}
            onChange={(e) => setLocalDate(e.target.value)}
            className="h-5 text-[10px] px-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[100px]"
          />
          <input
            type="time"
            value={localTime}
            onChange={(e) => setLocalTime(e.target.value)}
            className="h-5 text-[10px] px-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[65px]"
          />
          <button
            type="button"
            onClick={handleSaveAppointment}
            className="h-5 px-1.5 text-[9px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}

      {hasAppointment && !showDateTimeInputs && (
        <button
          type="button"
          onClick={() => !disabled && setShowDateInput(true)}
          className={`text-[10px] block text-left ${isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'}`}
          title="Edit appointment"
        >
          <Clock className="w-3 h-3 inline mr-0.5 align-middle" />
          Appt: {appointmentText}
        </button>
      )}

      {followUpRemark && (
        <div className={`text-[10px] italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>"{followUpRemark}"</div>
      )}
    </div>
  );
};

export default InlineFollowUpStatusCell;
