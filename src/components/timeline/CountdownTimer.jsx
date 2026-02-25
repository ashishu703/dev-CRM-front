'use strict';

import React, { useState, useEffect } from 'react';

function formatRemaining(ms) {
  if (ms <= 0) return 'Overdue';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m left`;
  return 'Due soon';
}

const CountdownTimer = React.memo(function CountdownTimer({ dueAt, onOverdue, className = '' }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!dueAt) {
      setRemaining(null);
      return;
    }
    const due = new Date(dueAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = due - now;
      setRemaining(diff);
      if (diff <= 0 && onOverdue) onOverdue();
    };

    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [dueAt, onOverdue]);

  if (remaining === null) return null;
  return (
    <span className={`text-[10px] text-slate-500 ${className}`}>
      {formatRemaining(remaining)}
    </span>
  );
});

export default CountdownTimer;
export { formatRemaining };
