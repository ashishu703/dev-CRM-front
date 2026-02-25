'use strict';

import React from 'react';
import CountdownTimer from './CountdownTimer';
import StatusBadge from '../ui/StatusBadge';
import { deriveReminderStatus } from '../../features/leadReminders/selectors';
import { Clock } from 'lucide-react';

const ReminderCard = React.memo(function ReminderCard({
  reminder,
  onComplete,
  onDelete,
  showCountdown = true,
  className = '',
}) {
  if (!reminder) return null;
  const status = deriveReminderStatus(reminder);
  const dueAt = reminder.due_at;
  const timeStr = dueAt
    ? new Date(dueAt).toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className={`rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm ${className}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
          <Clock className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-800">{reminder.title || 'Reminder'}</span>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {timeStr && <span className="text-[10px] text-slate-500">{timeStr}</span>}
            {showCountdown && !reminder.completed_at && dueAt && <CountdownTimer dueAt={dueAt} />}
          </div>
          <div className="flex gap-2 mt-2">
            {onComplete && !reminder.completed_at && (
              <button
                type="button"
                onClick={() => onComplete(reminder)}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                Mark done
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(reminder)}
                className="text-[11px] font-medium text-slate-500 hover:text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ReminderCard;
