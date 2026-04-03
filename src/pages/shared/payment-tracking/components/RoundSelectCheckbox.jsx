import React from 'react';

const defaultClass = 'h-4 w-4 rounded-full accent-red-600';

export default function RoundSelectCheckbox({ checked, onChange, ariaLabel, className = defaultClass }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
