'use strict';

import { createSelector } from '@reduxjs/toolkit';
import { selectAllReminders, selectReminderById } from './leadRemindersSlice';

export function deriveReminderStatus(reminder) {
  if (!reminder) return 'pending';
  if (reminder.completed_at) return 'completed';
  const due = reminder.due_at ? new Date(reminder.due_at) : null;
  if (due && due < new Date()) return 'overdue';
  return 'pending';
}

export const selectRemindersByLead = createSelector(
  [selectAllReminders, (_, leadId) => leadId],
  (reminders, leadId) => {
    if (!leadId) return [];
    const id = Number(leadId);
    return reminders.filter((r) => Number(r.lead_id) === id);
  }
);

export const selectUpcomingReminders = createSelector([selectAllReminders], (reminders) => {
  const now = new Date();
  return reminders
    .filter((r) => !r.completed_at && r.due_at && new Date(r.due_at) >= now)
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
});

export const selectOverdueReminders = createSelector([selectAllReminders], (reminders) => {
  const now = new Date();
  return reminders.filter((r) => !r.completed_at && r.due_at && new Date(r.due_at) < now);
});

export { selectReminderById };
