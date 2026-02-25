'use strict';

import React from 'react';
import TimelineItem from './TimelineItem';

const TimelineCard = React.memo(function TimelineCard({
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
    <div className={`rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm ${className}`}>
      <TimelineItem
        iconType={iconType}
        icon={icon}
        iconColor={iconColor}
        title={title}
        subtitle={subtitle}
        status={status}
        statusLabel={statusLabel}
        time={time}
        action={action}
      >
        {children}
      </TimelineItem>
    </div>
  );
});

export default TimelineCard;
