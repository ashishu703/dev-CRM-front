'use strict';

import React from 'react';
import TimelineIcon from './TimelineIcon';
import StatusBadge from '../ui/StatusBadge';

const TimelineItem = React.memo(function TimelineItem({
  iconType,
  icon,
  iconColor,
  title,
  subtitle,
  status,
  statusLabel,
  time,
  children,
  action,
  className = '',
}) {
  return (
    <div className={`flex gap-3 py-2 first:pt-0 ${className}`}>
      <TimelineIcon type={iconType} icon={icon} colorClass={iconColor} />
      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {title && <span className="text-xs font-medium text-slate-800">{title}</span>}
            {(status || statusLabel) && (
              <StatusBadge status={status} label={statusLabel} />
            )}
          </div>
          {subtitle && <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>}
          {time && <p className="text-[10px] text-slate-500 mt-0.5">{time}</p>}
          {children}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
});

export default TimelineItem;
