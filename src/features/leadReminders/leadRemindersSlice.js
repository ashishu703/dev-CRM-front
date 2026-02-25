'use strict';

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { leadRemindersApi } from './leadRemindersApi';

const remindersAdapter = createEntityAdapter({
  selectId: (r) => String(r?.id ?? ''),
  sortComparer: (a, b) => new Date(a.due_at || 0) - new Date(b.due_at || 0),
});

const initialState = remindersAdapter.getInitialState();

const leadRemindersSlice = createSlice({
  name: 'leadReminders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(leadRemindersApi.endpoints.getRemindersByLeadId.matchFulfilled, (state, action) => {
      const list = action.payload?.reminders ?? [];
      if (list.length) remindersAdapter.upsertMany(state, list);
    });
    builder.addMatcher(leadRemindersApi.endpoints.createReminder.matchFulfilled, (state, action) => {
      const r = action.payload?.reminder;
      if (r) remindersAdapter.upsertOne(state, r);
    });
    builder.addMatcher(leadRemindersApi.endpoints.updateReminder.matchFulfilled, (state, action) => {
      const r = action.payload?.reminder;
      if (r) remindersAdapter.upsertOne(state, r);
    });
    builder.addMatcher(leadRemindersApi.endpoints.completeReminder.matchFulfilled, (state, action) => {
      const r = action.payload?.reminder;
      if (r) remindersAdapter.upsertOne(state, r);
    });
    builder.addMatcher(leadRemindersApi.endpoints.deleteReminder.matchFulfilled, (state, action) => {
      const id = action.meta?.arg?.originalArgs?.reminderId;
      if (id != null) remindersAdapter.removeOne(state, String(id));
    });
  },
});

export const {
  selectById: selectReminderById,
  selectAll: selectAllReminders,
  selectIds: selectReminderIds,
} = remindersAdapter.getSelectors((state) => state.leadReminders ?? initialState);

export default leadRemindersSlice.reducer;
