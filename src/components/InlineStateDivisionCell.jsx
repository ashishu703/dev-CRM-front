import React, { useState, useRef, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { getIndiaStates, getIndiaDivisionsForStateIso, findIndiaStateByName } from '../utils/indiaLocation';

const INDIA_STATES = getIndiaStates();

const InlineStateDivisionCell = ({
  state: stateValue,
  division: divisionValue,
  leadId,
  onStateChange,
  onDivisionChange,
  disabled = false,
  isDarkMode = false,
  className = '',
  onlyState = false,
  onlyDivision = false
}) => {
  const [stateOpen, setStateOpen] = useState(false);
  const [divisionOpen, setDivisionOpen] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const [savingDivision, setSavingDivision] = useState(false);
  const stateRef = useRef(null);
  const divisionRef = useRef(null);

  const stateObj = useMemo(
    () => findIndiaStateByName(stateValue || ''),
    [stateValue]
  );
  const stateIso = stateObj?.isoCode || '';
  const divisionOptions = useMemo(
    () => getIndiaDivisionsForStateIso(stateIso),
    [stateIso]
  );
  const divisionNames = useMemo(
    () => divisionOptions.map((d) => d.name || '').filter(Boolean).sort(),
    [divisionOptions]
  );

  const showState = !onlyDivision;
  const showDivision = !onlyState && stateIso;

  useClickOutside(stateRef, () => setStateOpen(false), stateOpen);
  useClickOutside(divisionRef, () => setDivisionOpen(false), divisionOpen);

  const handleStateSelect = async (stateName) => {
    const trimmed = (stateName || '').trim();
    if (!trimmed || savingState || (stateValue || '').trim().toLowerCase() === trimmed.toLowerCase()) {
      setStateOpen(false);
      return;
    }
    setSavingState(true);
    try {
      await onStateChange?.(leadId, trimmed);
      setStateOpen(false);
      setDivisionOpen(true);
    } finally {
      setSavingState(false);
    }
  };

  const handleDivisionSelect = async (divisionName) => {
    if (!divisionName || savingDivision || (divisionValue || '').trim() === (divisionName || '').trim()) {
      setDivisionOpen(false);
      return;
    }
    setSavingDivision(true);
    try {
      await onDivisionChange?.(leadId, divisionName);
      setDivisionOpen(false);
    } finally {
      setSavingDivision(false);
    }
  };

  const displayState = (stateValue || '').trim() || '-';
  const displayDivision = (divisionValue || '').trim() || '-';

  const stopRowClick = (e) => {
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
  };

  const showPlaceholder = onlyDivision && !stateIso;

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      onClick={stopRowClick}
      onMouseDown={stopRowClick}
    >
      {showPlaceholder && (
        <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>–</span>
      )}
      {showState && (
      <div ref={stateRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => !disabled && !savingState && setStateOpen((p) => !p)}
          disabled={disabled || savingState}
          className={`
            inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-medium
            ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-50 text-blue-800'}
            ${disabled || savingState ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:ring-2 hover:ring-offset-0.5 hover:ring-blue-300'}
          `}
        >
          {displayState}
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${stateOpen ? 'rotate-180' : ''}`} />
        </button>
        {stateOpen && (
          <div className="absolute left-0 top-full mt-0.5 z-50 min-w-[180px] max-h-[200px] overflow-y-auto py-0.5 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            {INDIA_STATES.map((s) => {
              const name = s.name || '';
              const selected = (displayState !== '-' && (stateValue || '').trim().toLowerCase() === name.toLowerCase());
              return (
                <button
                  key={s.isoCode}
                  type="button"
                  onClick={() => handleStateSelect(name)}
                  className={`
                    w-full text-left px-2 py-1 text-[10px] font-medium flex items-center justify-between
                    hover:bg-blue-50/80 rounded-lg mx-0.5 my-0.5
                    ${selected ? 'bg-blue-100/90 text-blue-900' : 'text-gray-700'}
                  `}
                >
                  <span>{name}</span>
                  {selected && <Check className="w-3 h-3 text-blue-700 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      )}
      {showDivision && (
        <div ref={divisionRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => !disabled && !savingDivision && setDivisionOpen((p) => !p)}
            disabled={disabled || savingDivision}
            className={`
              inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-medium
              ${isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-purple-50 text-purple-800'}
              ${disabled || savingDivision ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:ring-2 hover:ring-offset-0.5 hover:ring-purple-300'}
            `}
          >
            {displayDivision}
            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${divisionOpen ? 'rotate-180' : ''}`} />
          </button>
          {divisionOpen && (
            <div className="absolute left-0 top-full mt-0.5 z-50 min-w-[160px] max-h-[180px] overflow-y-auto py-0.5 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              {divisionNames.length === 0 ? (
                <div className="px-2 py-2 text-[10px] text-gray-500">No divisions</div>
              ) : (
                divisionNames.map((name) => {
                  const selected = (displayDivision !== '-' && (divisionValue || '').trim().toLowerCase() === name.toLowerCase());
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleDivisionSelect(name)}
                      className={`
                        w-full text-left px-2 py-1 text-[10px] font-medium flex items-center justify-between
                        hover:bg-purple-50/80 rounded-lg mx-0.5 my-0.5
                        ${selected ? 'bg-purple-100/90 text-purple-900' : 'text-gray-700'}
                      `}
                    >
                      <span className="truncate">{name}</span>
                      {selected && <Check className="w-3 h-3 text-purple-700 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineStateDivisionCell;
