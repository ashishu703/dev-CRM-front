'use strict';

import React from 'react';

const SectionHeader = React.memo(function SectionHeader({ icon: Icon, title, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-2 mb-2 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-indigo-600 flex-shrink-0" aria-hidden />}
        <span>{title}</span>
      </h3>
      {action}
    </div>
  );
});

export default SectionHeader;
