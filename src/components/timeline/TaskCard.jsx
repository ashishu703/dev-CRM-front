'use strict';

import React from 'react';
import TimelineCard from './TimelineCard';
import CountdownTimer from './CountdownTimer';
import StatusBadge from '../ui/StatusBadge';
import { deriveTaskStatus } from '../../features/leadTasks/selectors';

const TaskCard = React.memo(function TaskCard({
  task,
  statusLabel,
  onComplete,
  showCountdown = true,
  className = '',
}) {
  if (!task) return null;
  const status = statusLabel ?? deriveTaskStatus(task);
  const dueAt = task.due_at;
  const timeStr = dueAt
    ? new Date(dueAt).toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className={`rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm ${className}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
          <span className="text-xs font-semibold">T</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-800">{task.title || 'Task'}</span>
            <StatusBadge status={status} />
          </div>
          {task.description && (
            <p className="text-[11px] text-slate-600 mt-0.5">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {timeStr && <span className="text-[10px] text-slate-500">{timeStr}</span>}
            {showCountdown && !task.completed_at && dueAt && (
              <CountdownTimer dueAt={dueAt} />
            )}
          </div>
          {onComplete && !task.completed_at && (
            <button
              type="button"
              onClick={() => onComplete(task)}
              className="mt-2 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
            >
              Mark complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default TaskCard;
