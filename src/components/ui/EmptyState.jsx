'use strict';

import React from 'react';

const EmptyState = React.memo(function EmptyState({ icon: Icon, title, subtitle, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 text-center text-slate-500 ${className}`}>
      {Icon && <Icon className="h-10 w-10 mb-2 text-slate-300" aria-hidden />}
      {title && <p className="text-sm font-medium text-slate-600">{title}</p>}
      {subtitle && <p className="text-xs mt-0.5 text-slate-400">{subtitle}</p>}
    </div>
  );
});

export default EmptyState;
