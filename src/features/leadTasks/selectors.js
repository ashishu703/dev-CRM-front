'use strict';

import { createSelector } from '@reduxjs/toolkit';
import { selectAllTasks, selectTaskById } from './leadTasksSlice';

export function deriveTaskStatus(task) {
  if (!task) return 'pending';
  if (task.completed_at) return 'completed';
  const due = task.due_at ? new Date(task.due_at) : null;
  if (due && due < new Date()) return 'overdue';
  return 'pending';
}

export const selectTasksByLead = createSelector(
  [selectAllTasks, (_, leadId) => leadId],
  (tasks, leadId) => {
    if (!leadId) return [];
    const id = Number(leadId);
    return tasks.filter((t) => Number(t.lead_id) === id);
  }
);

export const selectOverdueTasks = createSelector([selectAllTasks], (tasks) => {
  const now = new Date();
  return tasks.filter((t) => !t.completed_at && t.due_at && new Date(t.due_at) < now);
});

export const selectTodayTasks = createSelector([selectAllTasks], (tasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tasks.filter((t) => {
    if (t.completed_at) return false;
    const due = t.due_at ? new Date(t.due_at) : null;
    return due && due >= today && due < tomorrow;
  });
});

export { selectTaskById };
