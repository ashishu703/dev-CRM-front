'use strict';

import React from 'react';

const Timeline = React.memo(function Timeline({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" aria-hidden />
      <div className="relative flex flex-col gap-0 pl-0">
        {children}
      </div>
    </div>
  );
});

export default Timeline;
